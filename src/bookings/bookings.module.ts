import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { PricingService } from './pricing.service';
import { StationsModule } from '../stations/stations.module';

@Module({
  imports: [StationsModule],
  controllers: [BookingsController],
  providers: [BookingsService, PricingService],
  exports: [PricingService],
})
export class BookingsModule {}

