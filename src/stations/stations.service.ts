import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { StationResponseDto } from './dto/station-response.dto';

@Injectable()
export class StationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createStationDto: CreateStationDto): Promise<StationResponseDto> {
    return this.prisma.station.create({
      data: createStationDto,
    });
  }

  async findAll(): Promise<StationResponseDto[]> {
    return this.prisma.station.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<StationResponseDto> {
    const station = await this.prisma.station.findUnique({
      where: { id },
    });

    if (!station) {
      throw new NotFoundException(`Station with ID ${id} not found`);
    }

    return station;
  }

  async findAvailable(): Promise<StationResponseDto[]> {
    return this.prisma.station.findMany({
      where: {
        isAvailable: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(
    id: string,
    updateStationDto: UpdateStationDto,
  ): Promise<StationResponseDto> {
    await this.findOne(id);

    return this.prisma.station.update({
      where: { id },
      data: updateStationDto,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    const activeBookings = await this.prisma.booking.findFirst({
      where: {
        stationId: id,
        status: {
          in: ['PENDING', 'ACTIVE'],
        },
      },
    });

    if (activeBookings) {
      throw new ConflictException(
        'Cannot delete station with active or pending bookings',
      );
    }

    await this.prisma.station.delete({
      where: { id },
    });
  }
}

