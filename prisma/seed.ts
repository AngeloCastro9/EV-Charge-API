import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    await prisma.booking.deleteMany();
    await prisma.station.deleteMany();
    await prisma.user.deleteMany();
  } catch (error) {
    if (error.code === 'P2021') {
      console.error('❌ Error: Database tables do not exist. Please run migrations first:');
      console.error('   npm run prisma:migrate');
      process.exit(1);
    }
    throw error;
  }

  const hashedPassword = await bcrypt.hash('admin123', 10);
  const defaultUser = await prisma.user.create({
    data: {
      email: 'admin@evcharge.com',
      password: hashedPassword,
    },
  });

  console.log('✅ Created default user:');
  console.log(`   - Email: ${defaultUser.email}`);
  console.log(`   - Password: admin123 (change this in production!)`);

  const stations = await Promise.all([
    prisma.station.create({
      data: {
        name: 'Downtown Charging Hub',
        location: '123 Main Street, Downtown, City Center',
        powerKw: 50.0,
        isAvailable: true,
      },
    }),
    prisma.station.create({
      data: {
        name: 'Highway Rest Stop Station',
        location: 'Highway 101, Mile Marker 45, Rest Area',
        powerKw: 75.0,
        isAvailable: true,
      },
    }),
    prisma.station.create({
      data: {
        name: 'Shopping Mall Charging Point',
        location: '456 Commerce Blvd, Shopping District',
        powerKw: 22.0,
        isAvailable: false,
      },
    }),
    prisma.station.create({
      data: {
        name: 'Airport Terminal Station',
        location: 'International Airport, Terminal 2, Level 3',
        powerKw: 100.0,
        isAvailable: true,
      },
    }),
    prisma.station.create({
      data: {
        name: 'Residential Complex Charger',
        location: '789 Residential Ave, Apartment Complex B',
        powerKw: 11.0,
        isAvailable: true,
      },
    }),
    prisma.station.create({
      data: {
        name: 'Corporate Office Charging Bay',
        location: '100 Business Park, Tech Campus',
        powerKw: 60.0,
        isAvailable: true,
      },
    }),
  ]);

  console.log(`✅ Created ${stations.length} charging stations:`);
  stations.forEach((station) => {
    console.log(
      `   - ${station.name} (${station.powerKw}kW) - ${station.isAvailable ? 'Available' : 'Unavailable'}`,
    );
  });

  console.log('🌱 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

