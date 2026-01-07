import { Test, TestingModule } from '@nestjs/testing';
import { PricingService } from './pricing.service';

describe('PricingService', () => {
  let service: PricingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PricingService],
    }).compile();

    service = module.get<PricingService>(PricingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculatePrice', () => {
    it('should calculate price correctly', () => {
      const powerKw = 50;
      const durationMinutes = 120;
      const expectedPrice = (50 * 0.5) * 120; // 3000

      const result = service.calculatePrice(powerKw, durationMinutes);

      expect(result).toBe(expectedPrice);
    });

    it('should return 0 for zero power', () => {
      const result = service.calculatePrice(0, 120);
      expect(result).toBe(0);
    });

    it('should return 0 for zero duration', () => {
      const result = service.calculatePrice(50, 0);
      expect(result).toBe(0);
    });

    it('should return 0 for negative power', () => {
      const result = service.calculatePrice(-10, 120);
      expect(result).toBe(0);
    });

    it('should return 0 for negative duration', () => {
      const result = service.calculatePrice(50, -10);
      expect(result).toBe(0);
    });

    it('should handle decimal values correctly', () => {
      const powerKw = 25.5;
      const durationMinutes = 90.5;
      const expectedPrice = (25.5 * 0.5) * 90.5;

      const result = service.calculatePrice(powerKw, durationMinutes);

      expect(result).toBe(expectedPrice);
    });
  });

  describe('calculateDurationMinutes', () => {
    it('should calculate duration correctly', () => {
      const startTime = new Date('2024-01-01T10:00:00.000Z');
      const endTime = new Date('2024-01-01T12:00:00.000Z');
      const expectedMinutes = 120;

      const result = service.calculateDurationMinutes(startTime, endTime);

      expect(result).toBe(expectedMinutes);
    });

    it('should round duration correctly', () => {
      const startTime = new Date('2024-01-01T10:00:00.000Z');
      const endTime = new Date('2024-01-01T12:00:30.000Z'); // 120.5 minutes

      const result = service.calculateDurationMinutes(startTime, endTime);

      expect(result).toBe(121); // Rounded up
    });
  });

  describe('calculateBookingPrice', () => {
    it('should calculate booking price correctly', () => {
      const powerKw = 50;
      const startTime = new Date('2024-01-01T10:00:00.000Z');
      const endTime = new Date('2024-01-01T12:00:00.000Z');
      const expectedDuration = 120;
      const expectedPrice = (50 * 0.5) * 120;

      const result = service.calculateBookingPrice(powerKw, startTime, endTime);

      expect(result.durationMinutes).toBe(expectedDuration);
      expect(result.totalPrice).toBe(expectedPrice);
    });

    it('should handle one hour booking', () => {
      const powerKw = 30;
      const startTime = new Date('2024-01-01T10:00:00.000Z');
      const endTime = new Date('2024-01-01T11:00:00.000Z');
      const expectedDuration = 60;
      const expectedPrice = (30 * 0.5) * 60;

      const result = service.calculateBookingPrice(powerKw, startTime, endTime);

      expect(result.durationMinutes).toBe(expectedDuration);
      expect(result.totalPrice).toBe(expectedPrice);
    });
  });
});

