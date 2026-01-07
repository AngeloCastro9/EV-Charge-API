import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateStationDto {
  @ApiProperty({
    description: 'Name of the charging station',
    example: 'Downtown Charging Station',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Location of the charging station',
    example: '123 Main St, City, State',
  })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({
    description: 'Power capacity in kilowatts',
    example: 50.0,
    minimum: 0.1,
  })
  @IsNumber()
  @Min(0.1)
  powerKw: number;
}

