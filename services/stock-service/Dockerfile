FROM node:22.11.0-slim

# Create app directory
WORKDIR /usr/src/app


RUN apt-get update -y && apt-get install -y openssl

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm ci

# Bundle app source
COPY . .

RUN apt-get update && apt-get install -y iputils-ping
# Install Prisma dependencies
COPY ./prisma ./prisma
RUN npx prisma generate --schema ./prisma/schema.prisma
# Build the TypeScript files
RUN npm run build

# Expose port 8080
EXPOSE 8080

# Start the app
CMD npm run start
