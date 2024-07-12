# Base image
FROM node:21.7.1 as base
ENV NODE_ENV=production
WORKDIR /app
COPY todo-app/package.json .
COPY todo-app/package-lock.json .
RUN npm ci
EXPOSE 3000

# Production stage
FROM base as production
ENV NODE_ENV=production
COPY todo-app .
RUN npx sequelize-cli db:create && npx sequelize-cli db:migrate
CMD ["node", "index.js"]

# Development stage
FROM base as dev
ENV NODE_ENV=development
COPY todo-app .
CMD ["npm", "run", "start"]
