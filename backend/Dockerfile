FROM node:20-alpine

WORKDIR /app

# Install openssl for Prisma
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

EXPOSE 5000

# Run migrations and then start the server
CMD npx prisma migrate deploy && npm run start
