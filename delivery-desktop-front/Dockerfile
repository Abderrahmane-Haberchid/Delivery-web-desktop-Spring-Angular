# Stage 1: Build the Angular application
FROM node:18 AS build
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the Angular application source code
COPY . .

# Build the Angular application
RUN npm run build -- --configuration production

# Stage 2: Serve the Angular application
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copy the built Angular application
COPY --from=build /app/dist/project .

# Copy the Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]