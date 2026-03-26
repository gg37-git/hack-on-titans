FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Remove devDependencies to keep image small
RUN npm prune --production

# The port Express runs on
EXPOSE 5001

# Start the application
CMD ["npm", "start"]
