# Step 1: Build the React app
FROM node:20-alpine as builder

#Install compatibility headers for native 
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean install dependencies including optional native bindings
RUN npm install --include-optional --platform=linux --arch-arm64

# Copy the rest of the frontend code
COPY . .
# Run the build
RUN npm run build

# Step 2: Serve the built app with Nginx
FROM nginx:alpine

# Copy the build artifacts from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
