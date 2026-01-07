import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString, IsNumber, Min } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    description: 'ID of the charging station',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  stationId: string;

  @ApiProperty({
    description: 'Start time of the booking',
    example: '2024-01-01T10:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({
    description: 'Power capacity in kilowatts',
    example: 50.0,
    minimum: 0.1,
  })
  @IsNumber()
  @Min(0.1)
  powerKw: number;
}

