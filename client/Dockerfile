FROM node:latest AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install --force

# Copy the rest of the application code
COPY . .

# app runs on port 5173
EXPOSE 5173

# Start the development server
CMD ["npm", "run", "dev"]
