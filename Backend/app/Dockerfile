# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY .npmrc .npmrc
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Final Production Image
FROM node:20-alpine
WORKDIR /app

RUN apk --no-cache add curl

# Create non-root user
RUN addgroup -S appgroup && adduser -S app -G appgroup

# Copy only necessary files from build stage
COPY --from=build /app/build /app/build
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/package.json

# Prune dev dependencies from node_modules
RUN npm prune --production

# Adjust permissions
RUN chown -R app:appgroup /app && chmod -R 550 /app

USER app

EXPOSE 3000
ENV NODE_ENV=production

# Start the app
CMD ["npx", "remix-serve", "./build/server/index.js", "--port", "3000", "--hostname", "0.0.0.0"]
