# Use the official Node.js image with version 21.6.0 as the parent image
FROM node:21.6.0-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package.json package-lock.json ./

# Install the project dependencies
RUN npm install

# Copy the current directory contents into the container at /app
COPY . .

# Build the Next.js app
RUN npm run build

# Expose port 3000 to the outside world
EXPOSE 3000

# Command to run the Next.js app
CMD ["npm", "start"]
