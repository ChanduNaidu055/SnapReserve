# Use a stable Node.js base image
FROM node:20-slim

# Install necessary build tools for sqlite3
RUN apt-get update && apt-get install -y python3 make g++

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the application
COPY . .

# Expose the port your app runs on
EXPOSE 4000

# Start the app
CMD ["node", "app.js"]