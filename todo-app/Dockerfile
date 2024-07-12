# Base image
FROM node:21.7.1 as base
WORKDIR /app
COPY package.json .
COPY package-lock.json .
EXPOSE 3000

# Production stage
FROM base as production
ENV NODE_ENV=production
RUN npm install && npx sequelize-cli db:create && npx sequelize-cli db:migrate
COPY . /app
CMD node index.js

# Development stage
FROM base as dev
ENV NODE_ENV=development
RUN npm install -g nodemon && npm install
COPY . /app
CMD ["npm", "run", "start"]
