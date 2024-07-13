# Todo App

## Containerize the application

### Create Dockerfile 

```dockerfile
FROM node:21.7.1
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Docker Compose Configuration

#### Database Service

```yaml
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: $DEV_USERNAME
      POSTGRES_PASSWORD: $DEV_PASSWORD
      POSTGRES_DB: $DEV_DATABASE
    volumes:
      - pg-dev-data:/var/lib/postgresql/data
```

Service `db` uses the PostgreSQL image. Environment variables are used to set up the database credentials.

#### Application Service

```yaml
  app:
    image: todo-app:21
    build:
      context: .
    ports:
      - "3000:3000"
    volumes:
      - ./todo-app:/app
    depends_on:
      db:
```

Service `app` that builds the Docker image. We map port 3000 of the container to port 3000 on the host.

### 3. Build and run the Docker containers

```sh
docker-compose up --build
```
Access at `http://localhost:3000`.

---
# Environment Variables

**Environment:**
- `NODE_ENV`: Defines the application environment (`development`, `production`, `test`).

**Production:**
- `PROD_USERNAME`, `PROD_PASSWORD`, `PROD_DATABASE`, `PROD_HOST`, `PROD_DIALECT`: database credentials for production.

**Development:**
- `DEV_USERNAME`, `DEV_PASSWORD`, `DEV_DATABASE`, `DEV_HOST`, `DEV_DIALECT`: database credentials for development.

---
# CI/CD Pipeline for Todo App

CI/CD pipeline using GitHub Actions automates the build, test, and deployment. The pipeline is triggered on pushes and pull request.

### Workflow Configuration

```yaml
    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: "21.7.1"

      - name: Install dependencies
        run: cd todo-app && npm install

      - name: Run unit tests
        run: cd todo-app && npm test

      - name: Run the app
        id: run-app
        run: |
          cd todo-app
          NODE_ENV=test PORT=3000 npm run clean:start &

      - name: Run integration tests
        run: |
          cd todo-app
          npm install cypress cypress-json-results
          npx cypress run --env STUDENT_SUBMISSION_URL="http://localhost:3001/"

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v1

      - name: Login to Docker Hub
        run: echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin

      - name: Build and push PostgreSQL Docker image
        run: |
          cd todo-app
          docker build -t irshad1201/postgres:15 .
          docker push irshad1201/postgres:15

      - name: Build and push Node.js app Docker image
        run: |
          cd todo-app
          docker build -t irshad1201/todo-app:21 .
          docker push irshad1201/todo-app:21

      - name: Set up Azure credentials
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Set AKS context
        run: |
          az aks get-credentials --resource-group myResourceGroup --name myAKSCluster

      - name: Deploy to AKS
        run: kubectl apply -f todo-app/k8s/deployment.yaml
        env:
          NODE_ENV: production  

      - name: Notify on Discord
        if: always()
        run: |
          STATUS="success"
          if [ ${{ job.status }} != "success" ]; then STATUS="failure"; fi
          PAYLOAD=$(jq -n \
            --arg repository "${{ github.repository }}" \
            --arg url "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}" \
            '{
              content: "Deployment status for \($repository) on branch \($ref): **\($status)**\nWorkflow: \($workflow)\nCommit: \($sha)\nActor: \($actor)\nRun Number: \($run_number)\nURL: \($url)"
            }')
          curl -H "Content-Type: application/json" \
            -X POST \
            -d "$PAYLOAD" \
            ${{ secrets.DISCORD_WEBHOOK_URL }}
```

### Stage Descriptions

1. **Checkout code**: Checks out the repository code.
2. **Set up Node.js**: Configures the Node.js environment.
3. **Install dependencies**: Installs project dependencies.
4. **Run unit tests**: Executes unit tests.
5. **Run the app**: Starts the application.
6. **Run integration tests**: Executes Cypress integration tests.
7. **Set up Docker Buildx**: Prepares Docker Buildx for multi-platform builds.
8. **Login to Docker Hub**: Authenticates with Docker Hub.
9. **Build and push PostgreSQL Docker image**: Builds and pushes the PostgreSQL Docker image.
10. **Build and push Node.js app Docker image**: Builds and pushes the Node.js app Docker image.
11. **Set up Azure credentials**: Configures Azure credentials.
12. **Set AKS context**: Sets the Kubernetes context for Azure AKS.
13. **Deploy to AKS**: Deploys the application to AKS.
14. **Notify on Discord**: Sends a deployment status notification to Discord.

---
