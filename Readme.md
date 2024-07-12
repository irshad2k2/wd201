## Environment Variables

### Common
- `NODE_ENV`: Specifies the environment in which the application is running. Possible values:
  - `development`
  - `production`
  - `test`

### Production Environment
- `PROD_USERNAME`: The username for the PostgreSQL database in production.
  - **Value**: `postgres`
- `PROD_PASSWORD`: The password for the PostgreSQL database in production.
  - **Value**: `DBPass`
- `PROD_DATABASE`: The name of the PostgreSQL database in production.
  - **Value**: `wd-todo-prod`
- `PROD_HOST`: The host address of the PostgreSQL database in production.
  - **Value**: `db`
- `PROD_DIALECT`: The dialect of the SQL database in production.
  - **Value**: `postgres`

### Development Environment
- `DEV_USERNAME`: The username for the PostgreSQL database in development.
  - **Value**: `postgres`
- `DEV_PASSWORD`: The password for the PostgreSQL database in development.
  - **Value**: `DBPass`
- `DEV_DATABASE`: The name of the PostgreSQL database in development.
  - **Value**: `wd-todo-dev`
- `DEV_HOST`: The host address of the PostgreSQL database in development.
  - **Value**: `db`
- `DEV_DIALECT`: The dialect of the SQL database in development.
  - **Value**: `postgres`

### Testing Environment
- `TEST_USERNAME`: The username for the PostgreSQL database in testing.
  - **Value**: `postgres`
- `TEST_PASSWORD`: The password for the PostgreSQL database in testing.
  - **Value**: `DBPass`
- `TEST_DATABASE`: The name of the PostgreSQL database in testing.
  - **Value**: `wd-todo-test`
- `TEST_HOST`: The host address of the PostgreSQL database in testing.
  - **Value**: `127.0.0.1`
- `TEST_DIALECT`: The dialect of the SQL database in testing.
  - **Value**: `postgres`

---

## CI/CD Pipeline Configuration

### Workflow Name
- **Name**: CI/CD Pipeline

### Trigger Events
The pipeline is triggered on:
- **Push** to the `main` branch.
- **Pull request** to the `main` branch.

### Jobs

#### Build Job
- **Runs-on**: `ubuntu-latest`
- **Services**:
  - **Postgres**: 
    - **Image**: `postgres:15`
    - **Environment Variables**:
      - `POSTGRES_USER`: `postgres`
      - `POSTGRES_PASSWORD`: `DBPass`
      - `POSTGRES_DB`: `wd-todo-prod`
    - **Ports**: `5432:5432`
    - **Options**:
      - `--health-cmd="pg_isready"`
      - `--health-interval=10s`
      - `--health-timeout=5s`
      - `--health-retries=3`

#### Steps

1. **Checkout code**
   - **Action**: `actions/checkout@v2`

2. **Set up Node.js**
   - **Action**: `actions/setup-node@v2`
   - **Node version**: `21.7.1`

3. **Install dependencies**
   - **Command**: `cd todo-app && npm install`

4. **Run unit tests**
   - **Command**: `cd todo-app && npm test`

5. **Run integration tests**
   - **Commands**:
     ```sh
     cd todo-app
     npm install cypress cypress-json-results
     npx cypress run --env STUDENT_SUBMISSION_URL="http://localhost:3000/"
     ```

6. **Set up Docker Buildx**
   - **Action**: `docker/setup-buildx-action@v1`

7. **Login to Docker Hub**
   - **Command**: `echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin`

8. **Set environment variables**
   - **Commands**:
     ```sh
     echo "DEV_USERNAME=${{ secrets.DEV_USERNAME }}" >> $GITHUB_ENV
     echo "DEV_PASSWORD=${{ secrets.DEV_PASSWORD }}" >> $GITHUB_ENV
     echo "DEV_DATABASE=${{ secrets.DEV_DATABASE }}" >> $GITHUB_ENV
     ```

9. **Build Docker image**
   - **Command**: `docker build -t todo-app:dev .`

10. **Run Docker Compose up**
    - **Command**: `docker-compose -f docker-compose-dev.yml up -d`

11. **Wait time**
    - **Command**: `sleep 10`

12. **Tag and Push App Docker Image**
    - **Commands**:
      ```sh
      docker tag todo-app:dev ${{ secrets.DOCKER_USERNAME }}/todo-app:dev
      docker push ${{ secrets.DOCKER_USERNAME }}/todo-app:dev
      ```

13. **Tag and Push Database Docker Image**
    - **Commands**:
      ```sh
      docker tag postgres:15 ${{ secrets.DOCKER_USERNAME }}/postgres:15
      docker push ${{ secrets.DOCKER_USERNAME }}/postgres:15
      ```

14. **Set up Azure credentials**
    - **Action**: `azure/login@v1`
    - **Credentials**: `${{ secrets.AZURE_CREDENTIALS }}`

15. **Set AKS context**
    - **Commands**:
      ```sh
      az aks get-credentials --resource-group myResourceGroup --name myAKSCluster
      ```

16. **Deploy to AKS**
    - **Command**: `kubectl apply -f k8s/deployment.yaml`

17. **Notify on Discord**
    - **Commands**:
      ```sh
      STATUS="success"
      if [ "${{ job.status }}" != "success" ]; then STATUS="failure"; fi
      PAYLOAD=$(jq -n \
        --arg status "$STATUS" \
        --arg repository "${{ github.repository }}" \
        --arg ref "${{ github.ref }}" \
        --arg run_id "${{ github.run_id }}" \
        --arg workflow "${{ github.workflow }}" \
        --arg sha "${{ github.sha }}" \
        --arg actor "${{ github.actor }}" \
        --arg run_number "${{ github.run_number }}" \
        --arg url "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}" \
        '{
          content: "Deployment status for \($repository) on branch \($ref): **\($status)**\nJob ID: \($run_id)\nWorkflow: \($workflow)\nCommit: \($sha)\nActor: \($actor)\nRun Number: \($run_number)\nURL: \($url)"
        }')
      curl -H "Content-Type: application/json" \
        -X POST \
        -d "$PAYLOAD" \
        ${{ secrets.DISCORD_WEBHOOK_URL }}
      ```

---
Here's the documentation for your Dockerfile configuration:

---

## Dockerfile Configuration

### Base Image
The base image used for both production and development stages is `node:21.7.1`.

- **Base Image**: `node:21.7.1`
- **Working Directory**: `/app`
- **Copy Files**:
  - `todo-app/package.json`
  - `todo-app/package-lock.json`
- **Install Dependencies**: `npm ci`
- **Expose Port**: `3000`

### Production Stage
This stage is used for building the production image.

- **Stage Name**: `production`
- **Environment Variable**: `NODE_ENV=production`
- **Copy Files**: `todo-app` directory
- **Database Setup**:
  - Create Database: `npx sequelize-cli db:create`
  - Run Migrations: `npx sequelize-cli db:migrate`
- **Start Command**: `node index.js`

### Development Stage
This stage is used for building the development image.

- **Stage Name**: `dev`
- **Environment Variable**: `NODE_ENV=development`
- **Copy Files**: `todo-app` directory
- **Start Command**: `npm run start`

### Full Dockerfile
```dockerfile
# Base image
FROM node:21.7.1 as base
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
```

---
Certainly! Here's the documentation explaining the purpose and usage of each environment variable within your Docker Compose file:

---

## Docker Compose Configuration

### Services

#### `db` Service
- **Image**: `postgres:15`
- **Environment Variables**:
  - `POSTGRES_USER`: Username for PostgreSQL database.
    - **Usage**: Used to authenticate connections to the PostgreSQL database.
  - `POSTGRES_PASSWORD`: Password for PostgreSQL database.
    - **Usage**: Used to authenticate connections to the PostgreSQL database.
  - `POSTGRES_DB`: Name of the PostgreSQL database.
    - **Usage**: Specifies the database to connect to.
- **Volumes**:
  - `pg-dev-data`:
    - **Purpose**: Persist PostgreSQL data between container restarts.
- **Healthcheck**:
  - **Test Command**: `pg_isready -U $DEV_USERNAME -d $DEV_DATABASE -h localhost -p 5432`
    - **Purpose**: Checks if the PostgreSQL server is ready to accept connections.
  - **Interval**: `10s`
    - **Purpose**: Interval at which health checks are performed.
  - **Retries**: `5`
    - **Purpose**: Number of retries before considering the container unhealthy.

#### `app` Service
- **Build Configuration**:
  - **Context**: `./todo-app`
    - **Purpose**: Specifies the build context directory for the `todo-app` Dockerfile.
  - **Target**: `dev`
    - **Purpose**: Specifies the build target in the multi-stage Dockerfile.
- **Image**: `todo-app:dev`
  - **Purpose**: Name of the Docker image for the `todo-app` service.
- **Ports**:
  - `3000:3000`
    - **Purpose**: Maps port 3000 on the host to port 3000 inside the container.
- **Volumes**:
  - `./todo-app:/app`
    - **Purpose**: Mounts the local `todo-app` directory to `/app` inside the container.
- **Dependencies**:
  - `db` Service:
    - **Condition**: `service_healthy`
      - **Purpose**: Ensures the `app` service starts only after the `db` service is healthy.

### Volumes
- **`pg-dev-data`**:
  - **Purpose**: Persistent volume to store PostgreSQL data (`/var/lib/postgresql/data`).

---

This documentation provides a clear explanation of each environment variable's purpose and usage within your Docker container setup using Docker Compose.