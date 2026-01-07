import { ApiProperty } from '@nestjs/swagger';

export class StationResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the station',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the charging station',
    example: 'Downtown Charging Station',
  })
  name: string;

  @ApiProperty({
    description: 'Location of the charging station',
    example: '123 Main St, City, State',
  })
  location: string;

  @ApiProperty({
    description: 'Power capacity in kilowatts',
    example: 50.0,
  })
  powerKw: number;

  @ApiProperty({
    description: 'Availability status of the station',
    example: true,
  })
  isAvailable: boolean;

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

