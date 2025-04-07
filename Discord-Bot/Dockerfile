FROM node:18-alpine
WORKDIR /app

# Copy package files and install
COPY package.json package-lock.json ./
RUN npm ci

# Copy source & build
COPY . .
RUN npm run build

# Run the bot
CMD ["npm", "start"]
