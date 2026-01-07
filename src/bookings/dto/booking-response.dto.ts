import { ApiProperty } from '@nestjs/swagger';
import { BookingStatus } from '@prisma/client';

export class BookingResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the booking',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID of the charging station',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  stationId: string;

  @ApiProperty({
    description: 'Start time of the booking',
    example: '2024-01-01T10:00:00.000Z',
  })
  startTime: Date;

  @ApiProperty({
    description: 'End time of the booking',
    example: '2024-01-01T12:00:00.000Z',
    nullable: true,
  })
  endTime: Date | null;

  @ApiProperty({
    description: 'Duration in minutes',
    example: 120,
    nullable: true,
  })
  durationMinutes: number | null;

  @ApiProperty({
    description: 'Power capacity in kilowatts',
    example: 50.0,
  })
  powerKw: number;

  @ApiProperty({
    description: 'Total price of the booking',
    example: 100.0,
    nullable: true,
  })
  totalPrice: number | null;

  @ApiProperty({
    description: 'Status of the booking',
    enum: BookingStatus,
    example: BookingStatus.ACTIVE,
  })
  status: BookingStatus;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

