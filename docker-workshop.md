# Workshop de Docker

En este workshop vamos a meter en contenedores la app que construimos en el
[workshop de Next](./next-workshop.md).

Hoy la app corre así: el `npm run dev` en tu máquina y un Postgres en un
contenedor. Al terminar, **todo** va a levantar con un solo comando, en
cualquier computadora que tenga Docker, sin instalar Node ni Postgres.

> Necesitás [Docker](https://www.docker.com/) instalado y la app del workshop de
> Next andando.

Vamos a tocar tres archivos:

* **`Dockerfile`** — la receta para construir la imagen de la app.
* **`docker-compose.yml`** — cómo se orquestan los servicios entre sí.
* **`.dockerignore`** — qué no copiar adentro de la imagen.

---

## Paso 1 — Preparar Next para el contenedor

Antes que nada, una línea en `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  output: "standalone",
  // ... el resto queda igual
};
```

Con esto, `next build` deja en `.next/standalone` un servidor autocontenido: el
código ya compilado **más solo las dependencias que realmente se usan**.

Esa línea es la diferencia entre una imagen de más de 1GB y una de ~300MB. Al
final del workshop lo vas a ver medido.

---

## Paso 2 — El Dockerfile

La construimos en **tres etapas**. La idea es que la imagen final se quede
únicamente con lo necesario para correr, y tire todo lo que hizo falta solo para
construir.

```dockerfile
# ---- Etapa 1: dependencias ----
# Solo node_modules y el cliente de Prisma. Es lo único que hace falta para
# correr las migraciones, así que no arrastramos el build de Next.
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

ARG TMDB_ACCESS_TOKEN
ENV TMDB_ACCESS_TOKEN=$TMDB_ACCESS_TOKEN
RUN npm run build

# ---- Etapa 3: ejecutar ----
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

### Las decisiones que hay detrás

**¿Por qué `COPY package*.json` antes que el resto del código?**
Docker cachea cada instrucción. Si copiáramos todo junto, cualquier cambio en un
componente invalidaría la caché y volvería a correr `npm ci`, que es lo más
lento. Copiando primero solo el `package.json`, el `npm ci` se rehace **solo
cuando cambian las dependencias**.

**¿Por qué `npm ci` y no `npm install`?**
`ci` instala exactamente las versiones del `package-lock.json` y falla si no
coinciden. En una build automatizada querés eso: que sea reproducible, no que
resuelva versiones nuevas por su cuenta.

**¿Por qué el token de TMDB entra como `ARG`?**
Porque las páginas estáticas (`/populares` y las de detalle) **se generan durante
el build**, y para eso hay que pedirle los datos a TMDB. Sin el token, el build
falla.

> ⚠️ Un `ARG` queda registrado en el historial de la imagen. Para un workshop
> está perfecto, pero **para un secreto de producción se usa
> `RUN --mount=type=secret`**, que no deja rastro.

**¿Por qué tres etapas y no dos?**
Las migraciones necesitan el CLI de Prisma, pero no necesitan la app compilada.
Separando `deps` de `builder`, el servicio que migra usa una etapa liviana y no
tiene que construir Next al pedo.

---

## Paso 3 — El .dockerignore

```
node_modules
.next
.git
.env
.env.*
!.env.example
src/generated
```

No es solo por tamaño. Copiar tu `node_modules` local adentro de la imagen es
además **un error**: puede tener binarios compilados para macOS que no funcionan
en el Linux del contenedor. Lo mismo con `src/generated`: el cliente de Prisma se
regenera adentro.

Y fijate que `.env` está excluido: **tus credenciales no van adentro de la
imagen**. Se pasan al arrancar el contenedor.

---

## Paso 4 — El docker-compose.yml

Acá definimos tres servicios y, sobre todo, **en qué orden tienen que arrancar**.

```yaml
services:
  db:
    image: postgres:18-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: watchlist
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d watchlist"]
      interval: 5s
      timeout: 5s
      retries: 10

  migrate:
    build:
      context: .
      target: deps
    command: ["npx", "prisma", "migrate", "deploy"]
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/watchlist?schema=public
    depends_on:
      db:
        condition: service_healthy

  web:
    build:
      context: .
      args:
        TMDB_ACCESS_TOKEN: ${TMDB_ACCESS_TOKEN}
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/watchlist?schema=public
      TMDB_ACCESS_TOKEN: ${TMDB_ACCESS_TOKEN}
    depends_on:
      migrate:
        condition: service_completed_successfully

volumes:
  pgdata:
```

### Las tres cosas importantes acá

**1. La base ya no está en `localhost`.**

```
postgresql://postgres:postgres@db:5432/watchlist
                               ↑
```

Adentro de la red de Docker, cada servicio es alcanzable **por su nombre**. Para
el contenedor `web`, `localhost` es él mismo, no tu máquina. Es el error número
uno cuando se pasa una app a contenedores.

**2. El orden de arranque está garantizado.**

`depends_on` solo no alcanza: arranca el contenedor, pero no espera a que el
programa de adentro esté listo. Postgres tarda unos segundos en aceptar
conexiones después de arrancar. Por eso:

- `db` tiene un **`healthcheck`** que pregunta si ya acepta conexiones.
- `migrate` espera a `service_healthy`, no a que el contenedor exista.
- `web` espera a `service_completed_successfully`, o sea a que las migraciones
  **terminen bien**. Si fallan, la app ni arranca.

**3. El volumen es lo que hace que los datos sobrevivan.**

Sin `pgdata`, cada vez que borrás el contenedor perdés la base. El volumen vive
aparte del contenedor.

> ⚠️ **Un detalle que cuesta caro:** en Postgres 18+ el volumen va montado en
> `/var/lib/postgresql`. Casi todos los tutoriales dicen
> `/var/lib/postgresql/data`, que era la ruta correcta hasta la 17. Con la ruta
> vieja el contenedor arranca y se muere al instante, y el error solo se ve con
> `docker compose logs db`.

---

## Paso 5 — Levantar todo

El token sale del `.env`, que Compose lee solo:

```sh
docker compose up --build
```

Vas a ver el orden en la salida: `db` healthy → `migrate` corre y termina →
`web` arranca.

Abrí [http://localhost:3000](http://localhost:3000). Es la misma app, pero ahora
no hay nada corriendo en tu máquina: ni Node, ni Postgres.

### Comandos útiles

```sh
docker compose ps                # qué está corriendo
docker compose logs -f web       # seguir los logs de la app
docker compose logs db           # cuando el contenedor se muere al arrancar
docker compose down              # bajar todo (los datos quedan)
docker compose down -v           # bajar todo Y borrar los datos
```

---

## Paso 6 — Ver para qué sirvió todo esto

```sh
docker images | grep watchlist
```

```
watchlist-web       306MB
watchlist-migrate   1.9GB
```

Las dos salieron del mismo `Dockerfile`. `watchlist-migrate` es la etapa `deps`:
tiene el `node_modules` completo, el código fuente y las herramientas de build.
`watchlist-web` es la etapa `runner`: **solo lo necesario para correr**.

**306MB contra 1.9GB.** Eso es lo que compran las etapas múltiples y el
`output: "standalone"`. Y no es solo disco: es lo que se sube y se baja en cada
deploy, y menos superficie expuesta en producción.

---

## Para seguir solo

- **Correr como usuario sin privilegios.** La imagen corre como `root`, que no es
  buena idea en producción. Se arregla con `USER node`.
- **Healthcheck en `web`**, para que Docker reinicie el contenedor si la app se
  cuelga.
- **`docker compose watch`**, para que el contenedor se actualice al guardar un
  archivo mientras desarrollás.
- **Publicar la imagen** en un registry y correrla en un servidor de verdad.
