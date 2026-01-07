import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { StationsService } from './stations.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';

describe('StationsService', () => {
  let service: StationsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    station: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    booking: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StationsService>(StationsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a station', async () => {
      const createStationDto: CreateStationDto = {
        name: 'Test Station',
        location: 'Test Location',
        powerKw: 50,
      };

      const expectedStation = {
        id: '1',
        ...createStationDto,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.station.create.mockResolvedValue(expectedStation);

      const result = await service.create(createStationDto);

      expect(result).toEqual(expectedStation);
      expect(mockPrismaService.station.create).toHaveBeenCalledWith({
        data: createStationDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return all stations', async () => {
      const expectedStations = [
        {
          id: '1',
          name: 'Station 1',
          location: 'Location 1',
          powerKw: 50,
          isAvailable: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: 'Station 2',
          location: 'Location 2',
          powerKw: 75,
          isAvailable: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.station.findMany.mockResolvedValue(expectedStations);

      const result = await service.findAll();

      expect(result).toEqual(expectedStations);
      expect(mockPrismaService.station.findMany).toHaveBeenCalledWith({
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a station by id', async () => {
      const stationId = '1';
      const expectedStation = {
        id: stationId,
        name: 'Test Station',
        location: 'Test Location',
        powerKw: 50,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.station.findUnique.mockResolvedValue(expectedStation);

      const result = await service.findOne(stationId);

      expect(result).toEqual(expectedStation);
      expect(mockPrismaService.station.findUnique).toHaveBeenCalledWith({
        where: { id: stationId },
      });
    });

    it('should throw NotFoundException if station not found', async () => {
      const stationId = '999';

      mockPrismaService.station.findUnique.mockResolvedValue(null);

      await expect(service.findOne(stationId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAvailable', () => {
    it('should return only available stations', async () => {
      const expectedStations = [
        {
          id: '1',
          name: 'Available Station',
          location: 'Location 1',
          powerKw: 50,
          isAvailable: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.station.findMany.mockResolvedValue(expectedStations);

      const result = await service.findAvailable();

      expect(result).toEqual(expectedStations);
      expect(mockPrismaService.station.findMany).toHaveBeenCalledWith({
        where: {
          isAvailable: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });
  });

  describe('update', () => {
    it('should update a station', async () => {
      const stationId = '1';
      const updateStationDto: UpdateStationDto = {
        name: 'Updated Station',
      };

      const existingStation = {
        id: stationId,
        name: 'Original Station',
        location: 'Test Location',
        powerKw: 50,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedStation = {
        ...existingStation,
        ...updateStationDto,
      };

      mockPrismaService.station.findUnique.mockResolvedValue(existingStation);
      mockPrismaService.station.update.mockResolvedValue(updatedStation);

      const result = await service.update(stationId, updateStationDto);

      expect(result).toEqual(updatedStation);
      expect(mockPrismaService.station.update).toHaveBeenCalledWith({
        where: { id: stationId },
        data: updateStationDto,
      });
    });

    it('should throw NotFoundException if station not found', async () => {
      const stationId = '999';
      const updateStationDto: UpdateStationDto = {
        name: 'Updated Station',
      };

      mockPrismaService.station.findUnique.mockResolvedValue(null);

      await expect(
        service.update(stationId, updateStationDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a station', async () => {
      const stationId = '1';
      const existingStation = {
        id: stationId,
        name: 'Test Station',
        location: 'Test Location',
        powerKw: 50,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.station.findUnique.mockResolvedValue(existingStation);
      mockPrismaService.booking.findFirst.mockResolvedValue(null);
      mockPrismaService.station.delete.mockResolvedValue(existingStation);

      await service.remove(stationId);

      expect(mockPrismaService.station.delete).toHaveBeenCalledWith({
        where: { id: stationId },
      });
    });

    it('should throw NotFoundException if station not found', async () => {
      const stationId = '999';

      mockPrismaService.station.findUnique.mockResolvedValue(null);

      await expect(service.remove(stationId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if station has active bookings', async () => {
      const stationId = '1';
      const existingStation = {
        id: stationId,
        name: 'Test Station',
        location: 'Test Location',
        powerKw: 50,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const activeBooking = {
        id: 'booking-1',
        stationId,
        status: 'ACTIVE',
      };

      mockPrismaService.station.findUnique.mockResolvedValue(existingStation);
      mockPrismaService.booking.findFirst.mockResolvedValue(activeBooking);

      await expect(service.remove(stationId)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});

