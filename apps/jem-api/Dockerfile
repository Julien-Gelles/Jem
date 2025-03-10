# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and lock file
COPY package.json ./

# Install dependencies inside Docker
RUN npm install

# Copy the rest of the app
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose the Fastify port
EXPOSE 3000

# Run migrations and start the server
CMD npx prisma migrate deploy && npm run seed && npm run dev