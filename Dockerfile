# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Install OpenSSL and required dependencies for Prisma
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Verify build output
RUN ls -la dist/ || (echo "Build failed - dist directory not found" && exit 1)

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install OpenSSL and required dependencies for Prisma
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including Prisma CLI for migrations)
RUN npm ci

# Generate Prisma Client for production
RUN npx prisma generate

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy Prisma generated files and engines
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Verify dist exists
RUN ls -la dist/ || (echo "dist directory not found" && exit 1)

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]

