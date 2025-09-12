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
