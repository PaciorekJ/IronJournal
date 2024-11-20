# Stage 1: Build the application
FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
COPY .npmrc ./.npmrc
RUN npm install

COPY . .

RUN npm run build

# Stage 2: Create the final production image
FROM node:20-alpine

# Create a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set the working directory
WORKDIR /usr/src/app

# Copy the built application from the build stage
COPY --from=build /usr/src/app/build/index.js ./index.js

# Ensure only the appuser has access to the executable
RUN chown appuser:appgroup ./index.js && chmod 700 ./index.js

# Switch to the non-root user
USER appuser

# Command to run the application
CMD ["node", "./index.js"]