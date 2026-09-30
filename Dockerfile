# Stage 1: Build the React application
FROM node:20-alpine AS build
WORKDIR /app

# Copy dependency definitions
COPY package.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Build Vite application for production
ARG VITE_API_BASE_URL=http://localhost:8087
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# Stage 2: Serve static bundle with Nginx on port 3000
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts to Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose frontend port 3000
EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
