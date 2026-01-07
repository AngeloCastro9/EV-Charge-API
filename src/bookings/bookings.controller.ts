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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { CompleteBookingDto } from './dto/complete-booking.dto';
import { BookingResponseDto } from './dto/booking-response.dto';

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiCreatedResponse({
    description: 'Booking created successfully',
    type: BookingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Station not found' })
  @ApiResponse({ status: 409, description: 'Station not available or already booked' })
  create(@Body() createBookingDto: CreateBookingDto): Promise<BookingResponseDto> {
    return this.bookingsService.create(createBookingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings' })
  @ApiOkResponse({
    description: 'List of all bookings',
    type: [BookingResponseDto],
  })
  findAll(): Promise<BookingResponseDto[]> {
    return this.bookingsService.findAll();
  }

  @Get('station/:stationId')
  @ApiOperation({ summary: 'Get all bookings for a specific station' })
  @ApiParam({ name: 'stationId', description: 'Station ID' })
  @ApiOkResponse({
    description: 'List of bookings for the station',
    type: [BookingResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Station not found' })
  findByStation(@Param('stationId') stationId: string): Promise<BookingResponseDto[]> {
    return this.bookingsService.findByStation(stationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a booking by ID' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiOkResponse({
    description: 'Booking found',
    type: BookingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  findOne(@Param('id') id: string): Promise<BookingResponseDto> {
    return this.bookingsService.findOne(id);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start a pending booking' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiOkResponse({
    description: 'Booking started successfully',
    type: BookingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Booking cannot be started' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  start(@Param('id') id: string): Promise<BookingResponseDto> {
    return this.bookingsService.start(id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete an active booking' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiOkResponse({
    description: 'Booking completed successfully',
    type: BookingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Booking cannot be completed' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  complete(
    @Param('id') id: string,
    @Body() completeBookingDto: CompleteBookingDto,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.complete(id, completeBookingDto);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiOkResponse({
    description: 'Booking cancelled successfully',
    type: BookingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Booking cannot be cancelled' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  cancel(@Param('id') id: string): Promise<BookingResponseDto> {
    return this.bookingsService.cancel(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a booking' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiOkResponse({
    description: 'Booking updated successfully',
    type: BookingResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ): Promise<BookingResponseDto> {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a booking' })
  @ApiParam({ name: 'id', description: 'Booking ID' })
  @ApiNoContentResponse({ description: 'Booking deleted successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.bookingsService.remove(id);
  }
}

