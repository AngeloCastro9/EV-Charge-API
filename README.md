# EV Charge Manager API

A robust and scalable REST API for managing Electric Vehicle (EV) charging stations and bookings, built with NestJS, Prisma, and PostgreSQL.

## 🚀 Features

- **Charging Station Management**: Create, read, update, and delete charging stations
- **Booking System**: Manage bookings with status tracking (PENDING, ACTIVE, COMPLETED, CANCELLED)
- **Pricing Logic**: Automatic price calculation based on power (kW) and duration
- **Availability Management**: Real-time station availability tracking
- **Comprehensive Logging**: Global logging interceptor for request/response tracking
- **Exception Handling**: Global exception filter for consistent error responses
- **API Documentation**: Swagger/OpenAPI documentation
- **Type Safety**: Full TypeScript support with Prisma ORM
- **Validation**: Request validation using class-validator
- **Testing**: Comprehensive unit tests with Jest

## 📋 Prerequisites

- Node.js (v18 or higher) - *Optional if using Docker*
- npm or yarn - *Optional if using Docker*
- PostgreSQL (v12 or higher) - *Optional if using Docker*
- Docker and Docker Compose - *Required for Docker setup*
- Git

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/AngeloCastro9/EV-Charge-API.git
cd EV-Charge-API
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure your database connection:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/ev_charge_db?schema=public"
PORT=3000
```

4. Generate Prisma Client:
```bash
npm run prisma:generate
```

5. Run database migrations:
```bash
npm run prisma:migrate
```

6. (Optional) Seed the database with sample data:
```bash
npm run prisma:seed
```

This will create 6 sample charging stations with different power capacities and availability statuses.

## 🚦 Running the Application

### Development Mode
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`
Swagger documentation will be available at `http://localhost:3000/api`

### Production Mode
```bash
npm run build
npm run start:prod
```

## 🐳 Docker Setup

### Quick Start with Docker Compose

The easiest way to run the entire application (API + PostgreSQL) is using Docker Compose:

1. **Production Mode** (API + Database):
```bash
# Build and start all services
docker-compose up -d --build

# Seed the database with sample data (run once)
docker-compose exec api npm run prisma:seed
```

The API will be available at `http://localhost:3000` and Swagger at `http://localhost:3000/api`

2. **Development Mode** (Database only):
```bash
docker-compose -f docker-compose.dev.yml up -d
npm run start:dev
```

### Docker Commands

**Start services:**
```bash
docker-compose up -d
```

**Stop services:**
```bash
docker-compose down
```

**View logs:**
```bash
docker-compose logs -f api
```

**Rebuild and restart:**
```bash
docker-compose up -d --build
```

**Stop and remove volumes (clean database):**
```bash
docker-compose down -v
```

### Environment Variables for Docker

Create a `.env` file in the root directory:

```env
# Database Configuration
POSTGRES_USER=evcharge
POSTGRES_PASSWORD=evcharge123
POSTGRES_DB=ev_charge_db
POSTGRES_PORT=5432

# API Configuration
PORT=3000
NODE_ENV=production

# Database URL (automatically set by docker-compose)
DATABASE_URL=postgresql://evcharge:evcharge123@postgres:5432/ev_charge_db?schema=public
```

### Docker Development Workflow

For development, it's recommended to run only the database in Docker:

1. Start PostgreSQL:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

2. Update your local `.env`:
```env
DATABASE_URL="postgresql://evcharge:evcharge123@localhost:5432/ev_charge_db?schema=public"
```

3. Run migrations:
```bash
npm run prisma:migrate
```

4. (Optional) Seed the database:
```bash
npm run prisma:seed
```

5. Start the API locally:
```bash
npm run start:dev
```

## 📚 API Documentation

Once the application is running, access the Swagger documentation at:
- **Swagger UI**: http://localhost:3000/api

The API provides the following endpoints:

### Stations Endpoints

- `GET /stations` - Get all charging stations
- `GET /stations/available` - Get all available charging stations
- `GET /stations/:id` - Get a specific station by ID
- `POST /stations` - Create a new charging station
- `PATCH /stations/:id` - Update a charging station
- `DELETE /stations/:id` - Delete a charging station

### Bookings Endpoints

- `GET /bookings` - Get all bookings
- `GET /bookings/station/:stationId` - Get all bookings for a specific station
- `GET /bookings/:id` - Get a specific booking by ID
- `POST /bookings` - Create a new booking
- `POST /bookings/:id/start` - Start a pending booking
- `POST /bookings/:id/complete` - Complete an active booking
- `POST /bookings/:id/cancel` - Cancel a booking
- `PATCH /bookings/:id` - Update a booking
- `DELETE /bookings/:id` - Delete a booking

## 💰 Pricing Logic

The pricing calculation follows this formula:
```
Total Price = (power_kw * 0.5) * duration_minutes
```

Example:
- Power: 50 kW
- Duration: 120 minutes
- Price: (50 * 0.5) * 120 = 3000

## 🧪 Testing

Run unit tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:cov
```

## 📁 Project Structure

```
src/
├── bookings/           # Booking module
│   ├── dto/           # Data Transfer Objects
│   ├── bookings.controller.ts
│   ├── bookings.service.ts
│   ├── bookings.service.spec.ts
│   ├── pricing.service.ts
│   └── pricing.service.spec.ts
├── stations/           # Station module
│   ├── dto/           # Data Transfer Objects
│   ├── stations.controller.ts
│   ├── stations.service.ts
│   └── stations.service.spec.ts
├── prisma/            # Prisma module
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── common/            # Shared utilities
│   ├── filters/       # Exception filters
│   └── interceptors/  # Logging interceptors
├── app.module.ts      # Root module
├── app.controller.ts  # Root controller
├── app.service.ts     # Root service
└── main.ts            # Application entry point
```

## 🏗️ Architecture

This project follows Clean Architecture principles and SOLID principles:

- **Separation of Concerns**: Controllers handle HTTP requests, Services contain business logic
- **Dependency Injection**: All dependencies are injected through NestJS DI container
- **Single Responsibility**: Each service/controller has a single, well-defined responsibility
- **Open/Closed Principle**: Extensible through modules and services
- **Interface Segregation**: DTOs define clear contracts for data transfer

## 🔍 Observability

### Logging
All requests and responses are automatically logged by the global `LoggingInterceptor`, including:
- Request method, URL, body, query parameters
- Response status code and response time
- Error details with stack traces

### Exception Handling
The global `HttpExceptionFilter` provides consistent error responses with:
- HTTP status codes
- Error messages
- Timestamps
- Request path and method

## 🗄️ Database Schema

### Station Model
- `id` (UUID): Primary key
- `name` (String): Station name
- `location` (String): Station location
- `powerKw` (Float): Power capacity in kilowatts
- `isAvailable` (Boolean): Availability status
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

### Booking Model
- `id` (UUID): Primary key
- `stationId` (UUID): Foreign key to Station
- `startTime` (DateTime): Booking start time
- `endTime` (DateTime): Booking end time (nullable)
- `durationMinutes` (Int): Duration in minutes (nullable)
- `powerKw` (Float): Power capacity used
- `totalPrice` (Float): Calculated total price (nullable)
- `status` (Enum): Booking status (PENDING, ACTIVE, COMPLETED, CANCELLED)
- `createdAt` (DateTime): Creation timestamp
- `updatedAt` (DateTime): Last update timestamp

## 🛡️ Validation

All endpoints use class-validator decorators for request validation:
- Required fields validation
- Type validation (string, number, date, etc.)
- Custom validation rules (min values, etc.)

## 📝 Scripts

- `npm run build` - Build the application
- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with hot reload
- `npm run start:debug` - Start in debug mode
- `npm run start:prod` - Start in production mode
- `npm test` - Run unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database with sample data
- `npm run prisma:studio` - Open Prisma Studio

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👤 Author

**Angelo Castro**
- GitHub: [@AngeloCastro9](https://github.com/AngeloCastro9)