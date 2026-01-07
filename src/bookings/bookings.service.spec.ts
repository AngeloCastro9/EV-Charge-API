import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma/prisma.service';
import { PricingService } from './pricing.service';
import { StationsService } from '../stations/stations.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CompleteBookingDto } from './dto/complete-booking.dto';
import { BookingStatus } from '@prisma/client';

describe('BookingsService', () => {
  let service: BookingsService;
  let prisma: PrismaService;
  let pricingService: PricingService;
  let stationsService: StationsService;

  const mockPrismaService = {
    booking: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    station: {
      update: jest.fn(),
    },
  };

  const mockPricingService = {
    calculateBookingPrice: jest.fn(),
  };

  const mockStationsService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: PricingService,
          useValue: mockPricingService,
        },
        {
          provide: StationsService,
          useValue: mockStationsService,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    prisma = module.get<PrismaService>(PrismaService);
    pricingService = module.get<PricingService>(PricingService);
    stationsService = module.get<StationsService>(StationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a booking', async () => {
      const createBookingDto: CreateBookingDto = {
        stationId: 'station-1',
        startTime: '2024-01-01T10:00:00.000Z',
        powerKw: 50,
      };

      const station = {
        id: 'station-1',
        name: 'Test Station',
        location: 'Test Location',
        powerKw: 50,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const expectedBooking = {
        id: 'booking-1',
        ...createBookingDto,
        startTime: new Date(createBookingDto.startTime),
        endTime: null,
        durationMinutes: null,
        totalPrice: null,
        status: BookingStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockStationsService.findOne.mockResolvedValue(station);
      mockPrismaService.booking.findFirst.mockResolvedValue(null);
      mockPrismaService.booking.create.mockResolvedValue(expectedBooking);

      const result = await service.create(createBookingDto);

      expect(result).toEqual(expectedBooking);
      expect(mockStationsService.findOne).toHaveBeenCalledWith(
        createBookingDto.stationId,
      );
      expect(mockPrismaService.booking.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if station is not available', async () => {
      const createBookingDto: CreateBookingDto = {
        stationId: 'station-1',
        startTime: '2024-01-01T10:00:00.000Z',
        powerKw: 50,
      };

      const station = {
        id: 'station-1',
        name: 'Test Station',
        location: 'Test Location',
        powerKw: 50,
        isAvailable: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockStationsService.findOne.mockResolvedValue(station);

      await expect(service.create(createBookingDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw ConflictException if station has overlapping booking', async () => {
      const createBookingDto: CreateBookingDto = {
        stationId: 'station-1',
        startTime: '2024-01-01T10:00:00.000Z',
        powerKw: 50,
      };

      const station = {
        id: 'station-1',
        name: 'Test Station',
        location: 'Test Location',
        powerKw: 50,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const overlappingBooking = {
        id: 'booking-1',
        stationId: 'station-1',
        status: BookingStatus.ACTIVE,
      };

      mockStationsService.findOne.mockResolvedValue(station);
      mockPrismaService.booking.findFirst.mockResolvedValue(overlappingBooking);

      await expect(service.create(createBookingDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a booking by id', async () => {
      const bookingId = 'booking-1';
      const expectedBooking = {
        id: bookingId,
        stationId: 'station-1',
        startTime: new Date(),
        endTime: null,
        durationMinutes: null,
        totalPrice: null,
        powerKw: 50,
        status: BookingStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        station: {
          id: 'station-1',
          name: 'Test Station',
        },
      };

      mockPrismaService.booking.findUnique.mockResolvedValue(expectedBooking);

      const result = await service.findOne(bookingId);

      expect(result).toEqual(expectedBooking);
      expect(mockPrismaService.booking.findUnique).toHaveBeenCalledWith({
        where: { id: bookingId },
        include: {
          station: true,
        },
      });
    });

    it('should throw NotFoundException if booking not found', async () => {
      const bookingId = '999';

      mockPrismaService.booking.findUnique.mockResolvedValue(null);

      await expect(service.findOne(bookingId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('start', () => {
    it('should start a pending booking', async () => {
      const bookingId = 'booking-1';
      const booking = {
        id: bookingId,
        stationId: 'station-1',
        status: BookingStatus.PENDING,
        startTime: new Date(),
        endTime: null,
        durationMinutes: null,
        totalPrice: null,
        powerKw: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
        station: {},
      };

      const updatedBooking = {
        ...booking,
        status: BookingStatus.ACTIVE,
      };

      mockPrismaService.booking.findUnique.mockResolvedValue(booking);
      mockPrismaService.station.update.mockResolvedValue({});
      mockPrismaService.booking.update.mockResolvedValue(updatedBooking);

      const result = await service.start(bookingId);

      expect(result).toEqual(updatedBooking);
      expect(mockPrismaService.station.update).toHaveBeenCalledWith({
        where: { id: booking.stationId },
        data: { isAvailable: false },
      });
      expect(mockPrismaService.booking.update).toHaveBeenCalledWith({
        where: { id: bookingId },
        data: {
          status: BookingStatus.ACTIVE,
        },
      });
    });

    it('should throw BadRequestException if booking is not pending', async () => {
      const bookingId = 'booking-1';
      const booking = {
        id: bookingId,
        stationId: 'station-1',
        status: BookingStatus.ACTIVE,
        startTime: new Date(),
        endTime: null,
        durationMinutes: null,
        totalPrice: null,
        powerKw: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
        station: {},
      };

      mockPrismaService.booking.findUnique.mockResolvedValue(booking);

      await expect(service.start(bookingId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('complete', () => {
    it('should complete an active booking', async () => {
      const bookingId = 'booking-1';
      const completeBookingDto: CompleteBookingDto = {
        endTime: '2024-01-01T12:00:00.000Z',
      };

      const booking = {
        id: bookingId,
        stationId: 'station-1',
        status: BookingStatus.ACTIVE,
        startTime: new Date('2024-01-01T10:00:00.000Z'),
        endTime: null,
        durationMinutes: null,
        totalPrice: null,
        powerKw: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
        station: {},
      };

      const pricingResult = {
        durationMinutes: 120,
        totalPrice: 3000,
      };

      const updatedBooking = {
        ...booking,
        endTime: new Date(completeBookingDto.endTime),
        durationMinutes: pricingResult.durationMinutes,
        totalPrice: pricingResult.totalPrice,
        status: BookingStatus.COMPLETED,
      };

      mockPrismaService.booking.findUnique.mockResolvedValue(booking);
      mockPricingService.calculateBookingPrice.mockReturnValue(pricingResult);
      mockPrismaService.station.update.mockResolvedValue({});
      mockPrismaService.booking.update.mockResolvedValue(updatedBooking);

      const result = await service.complete(bookingId, completeBookingDto);

      expect(result).toEqual(updatedBooking);
      expect(mockPricingService.calculateBookingPrice).toHaveBeenCalled();
      expect(mockPrismaService.station.update).toHaveBeenCalledWith({
        where: { id: booking.stationId },
        data: { isAvailable: true },
      });
    });

    it('should throw BadRequestException if booking is not active', async () => {
      const bookingId = 'booking-1';
      const completeBookingDto: CompleteBookingDto = {
        endTime: '2024-01-01T12:00:00.000Z',
      };

      const booking = {
        id: bookingId,
        stationId: 'station-1',
        status: BookingStatus.PENDING,
        startTime: new Date('2024-01-01T10:00:00.000Z'),
        endTime: null,
        durationMinutes: null,
        totalPrice: null,
        powerKw: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
        station: {},
      };

      mockPrismaService.booking.findUnique.mockResolvedValue(booking);

      await expect(
        service.complete(bookingId, completeBookingDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if endTime is before startTime', async () => {
      const bookingId = 'booking-1';
      const completeBookingDto: CompleteBookingDto = {
        endTime: '2024-01-01T09:00:00.000Z', // Before startTime
      };

      const booking = {
        id: bookingId,
        stationId: 'station-1',
        status: BookingStatus.ACTIVE,
        startTime: new Date('2024-01-01T10:00:00.000Z'),
        endTime: null,
        durationMinutes: null,
        totalPrice: null,
        powerKw: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
        station: {},
      };

      mockPrismaService.booking.findUnique.mockResolvedValue(booking);

      await expect(
        service.complete(bookingId, completeBookingDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('should cancel a pending booking', async () => {
      const bookingId = 'booking-1';
      const booking = {
        id: bookingId,
        stationId: 'station-1',
        status: BookingStatus.PENDING,
        startTime: new Date(),
        endTime: null,
        durationMinutes: null,
        totalPrice: null,
        powerKw: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
        station: {},
      };

      const updatedBooking = {
        ...booking,
        status: BookingStatus.CANCELLED,
      };

      mockPrismaService.booking.findUnique.mockResolvedValue(booking);
      mockPrismaService.booking.update.mockResolvedValue(updatedBooking);

      const result = await service.cancel(bookingId);

      expect(result).toEqual(updatedBooking);
      expect(mockPrismaService.booking.update).toHaveBeenCalledWith({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CANCELLED,
        },
      });
    });

    it('should cancel an active booking and make station available', async () => {
      const bookingId = 'booking-1';
      const booking = {
        id: bookingId,
        stationId: 'station-1',
        status: BookingStatus.ACTIVE,
        startTime: new Date(),
        endTime: null,
        durationMinutes: null,
        totalPrice: null,
        powerKw: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
        station: {},
      };

      const updatedBooking = {
        ...booking,
        status: BookingStatus.CANCELLED,
      };

      mockPrismaService.booking.findUnique.mockResolvedValue(booking);
      mockPrismaService.station.update.mockResolvedValue({});
      mockPrismaService.booking.update.mockResolvedValue(updatedBooking);

      const result = await service.cancel(bookingId);

      expect(result).toEqual(updatedBooking);
      expect(mockPrismaService.station.update).toHaveBeenCalledWith({
        where: { id: booking.stationId },
        data: { isAvailable: true },
      });
    });

    it('should throw BadRequestException if booking is already completed', async () => {
      const bookingId = 'booking-1';
      const booking = {
        id: bookingId,
        stationId: 'station-1',
        status: BookingStatus.COMPLETED,
        startTime: new Date(),
        endTime: new Date(),
        durationMinutes: 120,
        totalPrice: 3000,
        powerKw: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
        station: {},
      };

      mockPrismaService.booking.findUnique.mockResolvedValue(booking);

      await expect(service.cancel(bookingId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});

