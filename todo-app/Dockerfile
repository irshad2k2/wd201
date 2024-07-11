# Base image
FROM node:latest as base
WORKDIR /app
COPY package.json .
EXPOSE 3000

# Production stage
FROM base as production
ENV NODE_ENV=production
RUN npm install 
COPY . /app
CMD ["npm", "run", "start:prod"]

# Development stage
FROM base as dev
ENV NODE_ENV=development
RUN npm install -g nodemon && npm install
COPY . /app
CMD ["npm", "run", "start"]
