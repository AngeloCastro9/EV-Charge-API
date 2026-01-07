import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StationsService } from './stations.service';
import { CreateStationDto } from './dto/create-station.dto';
import { UpdateStationDto } from './dto/update-station.dto';
import { StationResponseDto } from './dto/station-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('stations')
@Controller('stations')
export class StationsController {
  constructor(private readonly stationsService: StationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new charging station' })
  @ApiCreatedResponse({
    description: 'Station created successfully',
    type: StationResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createStationDto: CreateStationDto): Promise<StationResponseDto> {
    return this.stationsService.create(createStationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all charging stations' })
  @ApiOkResponse({
    description: 'List of all stations',
    type: [StationResponseDto],
  })
  findAll(): Promise<StationResponseDto[]> {
    return this.stationsService.findAll();
  }

  @Get('available')
  @ApiOperation({ summary: 'Get all available charging stations' })
  @ApiOkResponse({
    description: 'List of available stations',
    type: [StationResponseDto],
  })
  findAvailable(): Promise<StationResponseDto[]> {
    return this.stationsService.findAvailable();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a charging station by ID' })
  @ApiParam({ name: 'id', description: 'Station ID' })
  @ApiOkResponse({
    description: 'Station found',
    type: StationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Station not found' })
  findOne(@Param('id') id: string): Promise<StationResponseDto> {
    return this.stationsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a charging station' })
  @ApiParam({ name: 'id', description: 'Station ID' })
  @ApiOkResponse({
    description: 'Station updated successfully',
    type: StationResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Station not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(
    @Param('id') id: string,
    @Body() updateStationDto: UpdateStationDto,
  ): Promise<StationResponseDto> {
    return this.stationsService.update(id, updateStationDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a charging station' })
  @ApiParam({ name: 'id', description: 'Station ID' })
  @ApiNoContentResponse({ description: 'Station deleted successfully' })
  @ApiResponse({ status: 404, description: 'Station not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Station has active bookings' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.stationsService.remove(id);
  }
}

