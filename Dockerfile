# Stage 1: Build the application
# Use a specific Node.js version for reproducibility.
# Using slim variant for a smaller image size.
FROM node:20-slim AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Copy prisma schema to generate the client
COPY prisma ./prisma/

# Install all dependencies, including devDependencies needed for building.
# The `postinstall` script in package.json will run `npx prisma generate`.
RUN npm install

# Copy the rest of the application source code
COPY src ./src
COPY tsconfig.json ./

# Build the TypeScript project
RUN npm run build

# --- Production Stage ---
# This stage creates the final, lean image for production.
FROM node:20-slim AS production

# Set working directory
WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist

# Copy the Prisma schema file required by the client at runtime
COPY --from=builder /app/prisma/schema.prisma ./prisma/schema.prisma

# Expose the port the application will run on
# The server runs on PORT 4000 by default (from src/server.ts)
EXPOSE 4000

# Command to run the application using the start script from package.json
CMD ["npm", "start"]
