import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, Min, IsBoolean } from 'class-validator';

export class UpdateStationDto {
  @ApiProperty({
    description: 'Name of the charging station',
    example: 'Downtown Charging Station',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Location of the charging station',
    example: '123 Main St, City, State',
    required: false,
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    description: 'Power capacity in kilowatts',
    example: 50.0,
    minimum: 0.1,
    required: false,
  })
  @IsNumber()
  @Min(0.1)
  @IsOptional()
  powerKw?: number;

  @ApiProperty({
    description: 'Availability status of the station',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}

