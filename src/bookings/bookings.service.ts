import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService } from './pricing.service';
import { StationsService } from '../stations/stations.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { CompleteBookingDto } from './dto/complete-booking.dto';
import { BookingResponseDto } from './dto/booking-response.dto';
import { BookingStatus } from '@prisma/client';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingService: PricingService,
    private readonly stationsService: StationsService,
  ) {}

  async create(createBookingDto: CreateBookingDto): Promise<BookingResponseDto> {
    // Verify station exists and is available
    const station = await this.stationsService.findOne(createBookingDto.stationId);

    if (!station.isAvailable) {
      throw new ConflictException('Station is not available');
    }

    // Check for overlapping bookings
    const startTime = new Date(createBookingDto.startTime);
    const overlappingBooking = await this.prisma.booking.findFirst({
      where: {
        stationId: createBookingDto.stationId,
        status: {
          in: ['PENDING', 'ACTIVE'],
        },
        OR: [
          {
            startTime: {
              lte: startTime,
            },
            endTime: {
              gte: startTime,
            },
          },
          {
            startTime: {
              lte: startTime,
            },
            endTime: null,
          },
        ],
      },
    });

    if (overlappingBooking) {
      throw new ConflictException(
        'Station is already booked for this time period',
      );
    }

    // Create booking
    return this.prisma.booking.create({
      data: {
        stationId: createBookingDto.stationId,
        startTime,
        powerKw: createBookingDto.powerKw,
        status: BookingStatus.PENDING,
      },
    });
  }

  async findAll(): Promise<BookingResponseDto[]> {
    return this.prisma.booking.findMany({
      include: {
        station: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<BookingResponseDto> {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        station: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  async findByStation(stationId: string): Promise<BookingResponseDto[]> {
    await this.stationsService.findOne(stationId); // Verify station exists

    return this.prisma.booking.findMany({
      where: { stationId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async start(id: string): Promise<BookingResponseDto> {
    const booking = await this.findOne(id);

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException(
        `Cannot start booking with status ${booking.status}`,
      );
    }

    // Update station availability
    await this.prisma.station.update({
      where: { id: booking.stationId },
      data: { isAvailable: false },
    });

    return this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.ACTIVE,
      },
    });
  }

  async complete(
    id: string,
    completeBookingDto: CompleteBookingDto,
  ): Promise<BookingResponseDto> {
    const booking = await this.findOne(id);

    if (booking.status !== BookingStatus.ACTIVE) {
      throw new BadRequestException(
        `Cannot complete booking with status ${booking.status}`,
      );
    }

    const endTime = new Date(completeBookingDto.endTime);
    const startTime = new Date(booking.startTime);

    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    // Calculate price and duration
    const { durationMinutes, totalPrice } =
      this.pricingService.calculateBookingPrice(
        booking.powerKw,
        startTime,
        endTime,
      );

    // Update station availability
    await this.prisma.station.update({
      where: { id: booking.stationId },
      data: { isAvailable: true },
    });

    // Update booking
    return this.prisma.booking.update({
      where: { id },
      data: {
        endTime,
        durationMinutes,
        totalPrice,
        status: BookingStatus.COMPLETED,
      },
    });
  }

  async cancel(id: string): Promise<BookingResponseDto> {
    const booking = await this.findOne(id);

    if (booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed booking');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    // If booking was active, make station available again
    if (booking.status === BookingStatus.ACTIVE) {
      await this.prisma.station.update({
        where: { id: booking.stationId },
        data: { isAvailable: true },
      });
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
      },
    });
  }

  async update(
    id: string,
    updateBookingDto: UpdateBookingDto,
  ): Promise<BookingResponseDto> {
    await this.findOne(id); // Verify booking exists

    return this.prisma.booking.update({
      where: { id },
      data: updateBookingDto,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id); // Verify booking exists

    await this.prisma.booking.delete({
      where: { id },
    });
  }
}

