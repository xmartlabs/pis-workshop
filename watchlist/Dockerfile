# ---- Etapa 1: dependencias ----
# Solo node_modules y el cliente de Prisma. Es lo unico que hace falta para
# correr las migraciones, asi que no arrastramos el build de Next.
FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma7.config.ts ./
RUN npx prisma generate

# ---- Etapa 2: construir ----
FROM deps AS builder

COPY . .
RUN npx prisma generate

# Las paginas estaticas se generan durante el build, y para eso hacen falta
# los datos de TMDB. Por eso el token entra como argumento de build.
ARG TMDB_ACCESS_TOKEN
ENV TMDB_ACCESS_TOKEN=$TMDB_ACCESS_TOKEN
RUN npm run build

# ---- Etapa 3: ejecutar ----
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Solo copiamos lo necesario para correr: nada de codigo fuente ni de
# node_modules completo. De eso se encarga output: "standalone".
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
