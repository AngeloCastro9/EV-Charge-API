import { Injectable } from '@nestjs/common';

@Injectable()
export class PricingService {
  private readonly PRICE_PER_KW_PER_MINUTE = 0.5;

  /**
   * Calculate the total price for a booking
   * Formula: (power_kw * 0.5) * duration_minutes
   * @param powerKw Power capacity in kilowatts
   * @param durationMinutes Duration in minutes
   * @returns Total price
   */
  calculatePrice(powerKw: number, durationMinutes: number): number {
    if (powerKw <= 0 || durationMinutes <= 0) {
      return 0;
    }
    return (powerKw * this.PRICE_PER_KW_PER_MINUTE) * durationMinutes;
  }

  /**
   * Calculate duration in minutes between two dates
   * @param startTime Start time
   * @param endTime End time
   * @returns Duration in minutes
   */
  calculateDurationMinutes(startTime: Date, endTime: Date): number {
    const diffMs = endTime.getTime() - startTime.getTime();
    return Math.round(diffMs / (1000 * 60));
  }

  /**
   * Calculate price and duration for a booking
   * @param powerKw Power capacity in kilowatts
   * @param startTime Start time
   * @param endTime End time
   * @returns Object containing durationMinutes and totalPrice
   */
  calculateBookingPrice(
    powerKw: number,
    startTime: Date,
    endTime: Date,
  ): { durationMinutes: number; totalPrice: number } {
    const durationMinutes = this.calculateDurationMinutes(startTime, endTime);
    const totalPrice = this.calculatePrice(powerKw, durationMinutes);

    return {
      durationMinutes,
      totalPrice,
    };
  }
}

