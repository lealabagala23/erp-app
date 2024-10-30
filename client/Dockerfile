# Use the official Node.js image
FROM node:18 as build

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and yarn.lock
COPY package*.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the application
COPY . .

# Build the React app
RUN yarn build

# Use a lightweight web server to serve the build
FROM nginx:alpine

# Copy the build files to the Nginx server
COPY --from=build /usr/src/app/build /usr/share/nginx/html

# Expose the port Nginx is listening on
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
