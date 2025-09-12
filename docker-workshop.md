# Docker Workshop

In this workshop, we are going to dockerize the application created in the Next workshop.
For this, we must have [Docker](https://www.docker.com/) installed beforehand.

To build the Next application, we need three files:

* **Dockerfile**, which defines the Docker image.
* **docker-compose.yml**, which will allow us to orchestrate our services.
* **.dockerignore**, which lets us ignore files we don’t want to copy into Docker.

### Dockerfile

To build the Docker image that will contain the Next application, we will do it in two stages:

* **builder**: install dependencies and build the app
* **runner**: run the app in a clean, lightweight image

```
# ./Dockerfile
FROM node:22.18.0-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --frozen-lockfile

COPY . .
RUN npm run build

FROM node:22.18.0-alpine AS runner

WORKDIR /app

COPY --from=builder /app ./
EXPOSE 3000

CMD ["npm", "run", "start"]
```

### docker-compose.yml

In the docker-compose.yml, we define two services:

- **nextapp** → runs the Next.js application
- **jsondb** → provides a fake JSON database with json-server

```
services:
  nextapp:
    build: ./
    ports:
      - "3080:3000"
    depends_on:
      - jsondb
    environment:
      - JSON_SERVER=http://jsondb

  jsondb:
    image: clue/json-server:latest
    volumes:
      - ./db.json:/data/db.json
    command: ["--watch", "/data/db.json"]
    ports:
      - "4000:80"

```

### .dockerignore

And the last file that we need to add is the .dockerignore

```
.github/
.vscode/
node_modules/
```

Now, we need to build and run all services

```sh
docker compose up --build
```

And we can visit the services:

- **Next.js app**  → http://localhost:3080
- **JSON Server** → http://localhost:4000
