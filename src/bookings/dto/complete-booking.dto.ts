import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class CompleteBookingDto {
  @ApiProperty({
    description: 'End time of the booking',
    example: '2024-01-01T12:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  endTime: string;
}

