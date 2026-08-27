# Workshop de Next.js + Node

Vamos a construir, de cero, una app para llevar una lista de películas que
querés ver. Los datos de las películas salen de [TMDB](https://www.themoviedb.org/)
y tu lista se guarda en una base Postgres.

La idea no es la app en sí, sino que en el camino aparezcan las tres formas que
tiene Next de armar una página, los componentes de servidor y de cliente, los
hooks y las Server Actions.

**Al final vas a tener esto:**

| Ruta | Cómo se renderiza | Qué vas a aprender ahí |
|---|---|---|
| `/` | Estática (SSG) | Layout, `next/link`, ShadCN |
| `/populares` | Estática + ISR | Traer datos desde el servidor, `next/image` |
| `/populares` (el filtro) | En el navegador (CSR) | `"use client"`, `useState` |
| `/pelicula/[id]` | Estática con `generateStaticParams` | Rutas dinámicas, `loading`, `not-found` |
| `/buscar` | Dinámica (SSR) | `searchParams`, `useRouter` |
| `/watchlist` | Dinámica + Postgres | Prisma, Server Actions, hooks de formulario |

---

## Antes de la clase

⚠️ **Esto hacelo antes, no el día de la clase.** Son cinco minutos, pero si los
hacés en el momento perdés media clase esperando un mail de confirmación.

### 1. Node

Necesitás Node 22 o más nuevo. Usá tu manejador de versiones (`nvm`, `nodenv`, `asdf`):

```sh
nvm install 22
node -v    # tiene que decir v22.x o superior
```

### 2. Docker

La base de datos corre en un contenedor. Instalá
[Docker Desktop](https://www.docker.com/products/docker-desktop/), **abrilo al
menos una vez** y verificá:

```sh
docker --version
docker ps         # tiene que responder sin error
```

> 💡 Si `docker` no aparece pero Docker Desktop está instalado, abrí la app: la
> primera vez que arranca es cuando agrega el comando a tu terminal.

### 3. Token de TMDB

1. Creá una cuenta en [themoviedb.org](https://www.themoviedb.org/signup) y
   confirmá el mail.
2. Andá a [Configuración → API](https://www.themoviedb.org/settings/api) y pedí
   una clave de uso personal.
3. Copiá el **API Read Access Token**, que es el largo que empieza con `eyJ...`.

> ⚠️ Hay dos credenciales en esa pantalla. La que necesitamos es el **API Read
> Access Token** (largo), **no** la "API Key" (corta). Si copiás la equivocada,
> TMDB responde 401.

> 💡 La página de registro no funciona bien desde el celular. Hacelo en una computadora.

---

## Paso 0 — Crear el proyecto

```sh
npx create-next-app@latest watchlist \
  --ts --tailwind --app --src-dir --import-alias "@/*" --eslint --turbopack --use-npm

cd watchlist
```

Esos flags contestan solas todas las preguntas del instalador: TypeScript,
Tailwind, App Router, carpeta `src/` y Turbopack.

### ShadCN

ShadCN no es una librería que se instala: **te copia el código de cada
componente adentro de tu proyecto**, para que lo puedas modificar. Por eso
después vas a ver los archivos en `src/components/ui/`.

```sh
npx shadcn@latest init -y -b radix -p nova
npx shadcn@latest add button card input badge checkbox skeleton
```

### Probá que arranque

```sh
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000). Tiene que aparecer la
página de bienvenida de Next.

---

## Paso 1 — La primera página

### La estructura

Lo importante de un proyecto Next con App Router:

```
src/
├── app/                  ← cada carpeta acá adentro es una URL
│   ├── layout.tsx        ← el marco que envuelve a todas las páginas
│   ├── page.tsx          ← la página de "/"
│   └── globals.css
├── components/           ← nuestros componentes
│   └── ui/               ← los que copió ShadCN
└── lib/                  ← código auxiliar
```

**La regla del ruteo es esta: una carpeta con un `page.tsx` adentro es una
ruta.** `src/app/buscar/page.tsx` se transforma en `/buscar`. No hay que
registrar nada en ningún lado, ni instalar un router.

### La barra de navegación

Creá `src/components/site-nav.tsx`:

```tsx
import Link from "next/link";

const links = [
  { href: "/populares", label: "Populares" },
  { href: "/buscar", label: "Buscar" },
  { href: "/watchlist", label: "Mi watchlist" },
];

export function SiteNav() {
  return (
    <header className="border-b">
      <nav className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
        <Link href="/" className="font-semibold">
          🎬 Watchlist
        </Link>
        <ul className="flex gap-4 text-sm">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
```

> 💡 `next/link` navega **sin recargar la página entera**: solo pide al servidor
> la parte que cambia. Con un `<a>` común perdés eso.

### El layout

Reemplazá `src/app/layout.tsx` para que use la barra:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { SiteNav } from "@/components/site-nav";

import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Watchlist de pelis",
  description: "Workshop de Next.js + Node para PIS",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SiteNav />
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
```

El layout envuelve a **todas** las páginas y no se vuelve a montar cuando
navegás: por eso la barra de arriba no parpadea al cambiar de ruta.

### El reloj que vamos a usar todo el workshop

Creá `src/components/render-stamp.tsx`:

```tsx
export function RenderStamp({ mode }: { mode: "SSG" | "ISR" | "SSR" }) {
  const now = new Date().toLocaleTimeString("es-UY", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const explicacion = {
    SSG: "generado una vez, en el build",
    ISR: "generado en el build, se regenera cada 1 hora",
    SSR: "generado recién, en este request",
  }[mode];

  return (
    <p className="text-muted-foreground font-mono text-xs">
      <span className="text-foreground font-semibold">{mode}</span>
      {" · HTML "}
      {explicacion}
      {" · "}
      {now}
    </p>
  );
}
```

Son diez líneas, pero es la herramienta más útil del workshop: **muestra el
momento exacto en que se generó el HTML.** Vas a ver que en unas páginas queda
congelado y en otras cambia. Ahí está toda la diferencia entre los tipos de
renderizado.

---

## Paso 2 — La base de datos

### Levantar Postgres

Creá `docker-compose.yml` en la raíz del proyecto:

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

volumes:
  pgdata:
```

```sh
docker compose up -d db
```

> ⚠️ **Ojo con el volumen.** Casi todos los tutoriales dicen
> `pgdata:/var/lib/postgresql/data`. Desde Postgres 18 esa ruta **ya no
> funciona**: el contenedor arranca y se muere al instante. Va sin el `/data`.
> Si te pasa, mirá el error con `docker compose logs db`.

Por ahora tomá el `docker-compose.yml` como una receta. Qué es cada línea se ve
en el workshop de Docker.

### Prisma

Prisma es un ORM: en vez de escribir SQL a mano, describís tus tablas en un
archivo y él te da funciones tipadas para consultarlas.

```sh
npm i -D prisma@7.10.0 @types/pg dotenv
npm i @prisma/client@7.10.0 @prisma/adapter-pg@7.10.0 pg server-only
npx prisma init --datasource-provider postgresql --output ../src/generated/prisma
```

> ⚠️ **Las versiones van clavadas a propósito.** Prisma está justo en medio de un
> cambio de versión mayor: si ponés `npm i prisma` sin el número, npm te instala
> un candidato de la v8 que no es compatible con el cliente v7 y nada funciona.
> Por la misma razón, cuando corras comandos de Prisma te va a aparecer un cartel
> que te invita a actualizar a la 8: **ignoralo**.

> 💡 Si buscás documentación de Prisma en Google vas a encontrar páginas que
> hablan de la v8 y no coinciden con esto. Es normal: las docs ya se adelantaron
> a una versión que todavía no salió estable.

`prisma init` deja algunas carpetas de más (`.agents/`, `.claude/`,
`.windsurf/`, `skills-lock.json`) que son instrucciones para asistentes de IA y
no tienen nada que ver con la app. Borralas:

```sh
rm -rf .agents .claude .windsurf skills-lock.json
```

### El schema

Reemplazá `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model WatchlistItem {
  id          Int      @id @default(autoincrement())
  movieId     Int      @unique
  title       String
  posterPath  String?
  releaseDate String?
  voteAverage Float?
  watched     Boolean  @default(false)
  createdAt   DateTime @default(now())

  @@map("watchlist_items")
}
```

Cada `model` se convierte en una tabla. El `?` marca las columnas que aceptan
nulo. `@unique` en `movieId` es lo que va a impedir que guardes dos veces la
misma película.

### Las variables de entorno

En Prisma 7 la URL de la base **no va en el schema**, va en `prisma7.config.ts`
(que ya se creó solo y lee del archivo `.env`).

Editá el `.env` que quedó en la raíz y dejalo así, con tu token adentro:

```sh
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/watchlist?schema=public"
TMDB_ACCESS_TOKEN="pegá-acá-tu-token-largo"
```

### Crear las tablas

```sh
npx prisma migrate dev --name init
```

Esto compara tu schema con la base, escribe el SQL necesario en
`prisma/migrations/` y lo aplica.

```sh
npx prisma studio
```

Se abre un navegador de la base en el puerto 5555. Vas a ver la tabla
`watchlist_items` vacía. Dejalo abierto: más adelante vamos a ver aparecer filas
ahí en tiempo real.

### Conectar Prisma con la app

Creá `src/lib/prisma.ts`:

```ts
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

Dos cosas que parecen ruido pero no lo son:

- **El adapter.** En Prisma 7 es obligatorio: es la pieza que sabe hablar el
  protocolo de Postgres. Sin él, `new PrismaClient()` tira error.
- **El `globalThis`.** En desarrollo Next recarga el código muchas veces por
  minuto. Si creáramos un cliente nuevo en cada recarga, abriríamos conexiones
  hasta reventar la base. Guardándolo en `globalThis` reusamos siempre el mismo.

---

## Paso 3 — Películas populares (SSG + ISR)

### El cliente de TMDB

Primero los tipos y helpers, que **sí** pueden viajar al navegador.
Creá `src/lib/movies.ts`:

```ts
export type Movie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
};

export type MovieDetail = Movie & {
  runtime: number | null;
  tagline: string | null;
  genres: { id: number; name: string }[];
};

export const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export function posterUrl(path: string | null, size = "w500") {
  if (!path) return null;
  return `${IMAGE_BASE_URL}/${size}${path}`;
}

export function releaseYear(date: string | undefined | null) {
  if (!date) return null;
  return date.slice(0, 4);
}
```

Y ahora las funciones que hablan con TMDB, que **no** pueden salir del servidor
nunca. Creá `src/lib/tmdb.ts`:

```ts
import "server-only";

import type { Movie, MovieDetail } from "@/lib/movies";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

type MovieListResponse = {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
};

async function tmdbFetch<T>(
  path: string,
  { revalidate }: { revalidate?: number } = {},
): Promise<T> {
  const token = process.env.TMDB_ACCESS_TOKEN;

  if (!token) {
    throw new Error("Falta TMDB_ACCESS_TOKEN en el archivo .env.");
  }

  const response = await fetch(`${TMDB_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "application/json",
    },
    ...(revalidate === 0
      ? { cache: "no-store" as const }
      : { next: { revalidate } }),
  });

  if (!response.ok) {
    throw new Error(`TMDB respondió ${response.status} para ${path}`);
  }

  return response.json() as Promise<T>;
}

export async function getPopularMovies(): Promise<Movie[]> {
  const data = await tmdbFetch<MovieListResponse>(
    "/movie/popular?language=es-ES&page=1",
    { revalidate: 3600 },
  );
  return data.results;
}
```

> 💡 Esa primera línea, `import "server-only"`, es un seguro. Si alguien importa
> este archivo desde un componente de navegador, **el build falla con un mensaje
> claro** en vez de mandarle el token a cualquiera que abra la página. Es una
> línea que te ahorra un problema de seguridad real.

### La tarjeta de una película

Creá `src/components/movie-card.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { posterUrl, releaseYear, type Movie } from "@/lib/movies";

export function MovieCard({ movie }: { movie: Movie }) {
  const poster = posterUrl(movie.poster_path, "w500");
  const year = releaseYear(movie.release_date);

  return (
    <Link href={`/pelicula/${movie.id}`} className="group">
      <Card className="h-full overflow-hidden py-0 transition-shadow group-hover:shadow-md">
        <div className="bg-muted relative aspect-[2/3]">
          {poster ? (
            <Image
              src={poster}
              alt={`Póster de ${movie.title}`}
              fill
              sizes="(max-width: 768px) 50vw, 20vw"
              className="object-cover"
            />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
              sin póster
            </div>
          )}
        </div>

        <CardContent className="space-y-1 px-3 pt-1 pb-3">
          <p className="line-clamp-2 text-sm leading-tight font-medium">
            {movie.title}
          </p>
          <div className="flex items-center gap-2">
            {year ? (
              <span className="text-muted-foreground text-xs">{year}</span>
            ) : null}
            <Badge variant="secondary" className="text-xs">
              ★ {movie.vote_average.toFixed(1)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

Las imágenes vienen de un dominio externo, así que hay que autorizarlo.
Editá `next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
};

export default nextConfig;
```

> ⚠️ Si te olvidás de esto, los pósters no cargan y la consola te tira un error
> sobre hostnames no configurados. Es el error más común de todo el workshop.

### La página

Creá `src/app/populares/page.tsx`:

```tsx
import { MovieCard } from "@/components/movie-card";
import { RenderStamp } from "@/components/render-stamp";
import { getPopularMovies } from "@/lib/tmdb";

export const revalidate = 3600;

export default async function PopularesPage() {
  const movies = await getPopularMovies();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Películas populares
        </h1>
        <RenderStamp mode="ISR" />
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}
```

**Mirá bien estas dos cosas:**

1. **El componente es `async` y hace `await` adentro.** No hay `useState`, no hay
   `useEffect`, no hay estado de "cargando". Comparalo con lo que hiciste en el
   workshop de React: ahí necesitabas un controller, un serializer, un estado y
   un efecto. Acá es una línea. Esto se puede porque el componente **corre en el
   servidor**: para cuando el HTML llega a tu navegador, las películas ya están
   adentro.

2. **`export const revalidate = 3600`.** Le pone fecha de vencimiento al HTML: se
   genera una vez y se reusa por una hora. Pasada la hora, el primero que entre
   dispara la regeneración en segundo plano. Eso es **ISR**.

> 🔍 Abrí las herramientas de desarrollo, pestaña **Network**, y recargá. **No
> vas a ver ningún pedido a TMDB.** Ese pedido lo hizo el servidor, una sola vez.

---

## Paso 4 — El filtro (componente de cliente)

Todo lo anterior corrió en el servidor. Pero si querés reaccionar a lo que el
usuario escribe, necesitás código en el navegador.

Creá `src/components/movie-filter.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";

import { MovieCard } from "@/components/movie-card";
import { Input } from "@/components/ui/input";
import type { Movie } from "@/lib/movies";

export function MovieFilter({ movies }: { movies: Movie[] }) {
  const [query, setQuery] = useState("");

  const visibles = movies.filter((movie) =>
    movie.title.toLowerCase().includes(query.toLowerCase().trim()),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filtrar las que ya bajaron del server…"
          className="max-w-xs"
        />
        <ClientClock />
      </div>

      <p className="text-muted-foreground text-sm">
        Mostrando {visibles.length} de {movies.length}
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {visibles.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}

function ClientClock() {
  const [hora, setHora] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setHora(new Date().toLocaleTimeString("es-UY"));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!hora) return null;

  return (
    <p className="text-muted-foreground font-mono text-xs">
      <span className="text-foreground font-semibold">CSR</span> · corriendo en
      tu browser · {hora}
    </p>
  );
}
```

Y usalo en `src/app/populares/page.tsx`, reemplazando el `<div className="grid ...">`
entero por:

```tsx
<MovieFilter movies={movies} />
```

(acordate de importarlo y de borrar el import de `MovieCard`, que ya no se usa ahí).

### Qué acaba de pasar

- **`"use client"` marca un límite.** De ahí para abajo, el código también viaja
  al navegador y puede usar estado, eventos y APIs del browser.
- **Las películas no se piden acá.** Ya vinieron resueltas desde el servidor,
  como una prop. El componente de cliente solo agrega interactividad **encima**
  de datos que ya estaban.
- **`MovieCard` no tiene ninguna directiva** y funciona en los dos lados. La
  regla: un componente sin directiva se adapta a quien lo use.

### El detalle del `if (!hora) return null`

En el primer render (el del servidor) devolvemos `null` a propósito. Si
pintáramos la hora directamente, el HTML del servidor diría una hora y el del
navegador diría otra, y React tiraría un **error de hidratación**. Es uno de los
errores más comunes cuando arrancás con Next.

> 🔍 Ahora tenés los dos relojes en la misma pantalla: el de arriba (ISR) quedó
> congelado y el de abajo (CSR) avanza segundo a segundo. Escribí en el filtro:
> la lista se filtra al instante y **la página nunca se recarga**.

---

## Paso 5 — El detalle (SSG con rutas dinámicas)

Los corchetes en el nombre de la carpeta la vuelven un parámetro.
Creá `src/app/pelicula/[id]/page.tsx`:

```tsx
import Image from "next/image";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { posterUrl, releaseYear } from "@/lib/movies";
import { getMovie, getPopularMovies } from "@/lib/tmdb";

export async function generateStaticParams() {
  const movies = await getPopularMovies();
  return movies.slice(0, 20).map((movie) => ({ id: String(movie.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movie = await getMovie(Number(id));

  return {
    title: movie ? `${movie.title} · Watchlist` : "Película no encontrada",
  };
}

export default async function PeliculaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movie = await getMovie(Number(id));

  if (!movie) notFound();

  const poster = posterUrl(movie.poster_path, "w500");
  const year = releaseYear(movie.release_date);

  return (
    <article className="grid gap-8 sm:grid-cols-[220px_1fr]">
      <div className="bg-muted relative aspect-[2/3] overflow-hidden rounded-lg">
        {poster ? (
          <Image
            src={poster}
            alt={`Póster de ${movie.title}`}
            fill
            sizes="220px"
            className="object-cover"
            priority
          />
        ) : null}
      </div>

      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          {movie.title}{" "}
          {year ? (
            <span className="text-muted-foreground font-normal">({year})</span>
          ) : null}
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">★ {movie.vote_average.toFixed(1)}</Badge>
          {movie.runtime ? (
            <Badge variant="outline">{movie.runtime} min</Badge>
          ) : null}
          {movie.genres.map((genre) => (
            <Badge key={genre.id} variant="outline">
              {genre.name}
            </Badge>
          ))}
        </div>

        <p className="text-sm leading-relaxed">{movie.overview}</p>
      </div>
    </article>
  );
}
```

Agregá también `getMovie` a `src/lib/tmdb.ts`:

```ts
export async function getMovie(id: number): Promise<MovieDetail | null> {
  try {
    return await tmdbFetch<MovieDetail>(`/movie/${id}?language=es-ES`, {
      revalidate: 86400,
    });
  } catch {
    return null;
  }
}
```

### Las tres cosas nuevas

- **`generateStaticParams`** le dice a Next qué ids conoce de antemano, para que
  genere esas páginas durante el build. Las 20 populares quedan listas. Si
  alguien entra a una película que no está en la lista, Next la genera en ese
  momento y la guarda para la próxima.
- **`params` es una `Promise`** y hay que hacerle `await`. Si te lo olvidás, `id`
  sale `undefined` y la página explota.
- **`notFound()`** corta el render y muestra el archivo `not-found.tsx`.

### Los archivos especiales

`src/app/pelicula/[id]/loading.tsx`:

```tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="grid gap-8 sm:grid-cols-[220px_1fr]">
      <Skeleton className="aspect-[2/3] w-full rounded-lg" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
```

`src/app/pelicula/[id]/not-found.tsx`:

```tsx
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="space-y-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Esa película no existe</h1>
      <Button asChild variant="outline">
        <Link href="/populares">Volver a populares</Link>
      </Button>
    </div>
  );
}
```

Si un archivo se llama `loading.tsx`, Next lo muestra **automáticamente**
mientras la página de al lado carga sus datos. No hay que escribir ningún
`if (cargando)` en ningún lado.

> 🔍 Probá una que no exista: [/pelicula/999999999](http://localhost:3000/pelicula/999999999).

---

## Paso 6 — La búsqueda (SSR)

Creá `src/components/search-box.tsx`:

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [valor, setValor] = useState(searchParams.get("q") ?? "");

  function buscar(evento: React.FormEvent) {
    evento.preventDefault();
    router.push(`/buscar?q=${encodeURIComponent(valor)}`);
  }

  return (
    <form onSubmit={buscar} className="flex max-w-md gap-2">
      <Input
        value={valor}
        onChange={(evento) => setValor(evento.target.value)}
        placeholder="Título de una película…"
      />
      <Button type="submit">Buscar</Button>
    </form>
  );
}
```

Y `src/app/buscar/page.tsx`:

```tsx
import { Suspense } from "react";

import { MovieCard } from "@/components/movie-card";
import { RenderStamp } from "@/components/render-stamp";
import { SearchBox } from "@/components/search-box";
import { searchMovies } from "@/lib/tmdb";

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const movies = await searchMovies(q);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Buscar</h1>
        <RenderStamp mode="SSR" />
      </header>

      <Suspense fallback={null}>
        <SearchBox />
      </Suspense>

      {q ? (
        <p className="text-muted-foreground text-sm">
          {movies.length} resultados para “{q}”
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}
```

Y la función de búsqueda en `src/lib/tmdb.ts`:

```ts
export async function searchMovies(query: string): Promise<Movie[]> {
  if (!query.trim()) return [];

  const data = await tmdbFetch<MovieListResponse>(
    `/search/movie?language=es-ES&query=${encodeURIComponent(query)}`,
    { revalidate: 0 },
  );
  return data.results;
}
```

Esta página lee `searchParams`, o sea que **depende del pedido**. Next no puede
generarla en el build porque no sabe qué va a buscar la gente, así que la arma
entera en cada visita. Eso es **SSR**.

> ⚠️ El `<Suspense>` alrededor del `SearchBox` no es decorativo: `useSearchParams`
> lo necesita. Sin eso, `npm run build` falla.

> 🔍 **El momento del workshop.** Abrí `/populares` y `/buscar` en dos pestañas y
> apretá F5 en las dos, varias veces. El reloj de `/populares` **no se mueve**.
> El de `/buscar` **cambia siempre**. Esa es, en una imagen, toda la diferencia
> entre generar el HTML una vez y generarlo en cada visita.

---

## Paso 7 — Server Actions

Hasta acá solo leímos. Ahora vamos a escribir en la base, **sin crear ni un solo
endpoint**.

Creá `src/actions/watchlist.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export type ActionState = { ok: boolean; message: string } | null;

export async function addToWatchlist(
  _estadoAnterior: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const movieId = Number(formData.get("movieId"));
  const title = String(formData.get("title") ?? "");

  if (!movieId || !title) {
    return { ok: false, message: "Faltan datos de la película." };
  }

  const voteAverage = Number(formData.get("voteAverage"));

  try {
    await prisma.watchlistItem.create({
      data: {
        movieId,
        title,
        posterPath: (formData.get("posterPath") as string) || null,
        releaseDate: (formData.get("releaseDate") as string) || null,
        voteAverage: Number.isFinite(voteAverage) ? voteAverage : null,
      },
    });
  } catch {
    return { ok: false, message: "Esa película ya estaba en tu watchlist." };
  }

  revalidatePath("/watchlist");

  return { ok: true, message: `"${title}" agregada.` };
}

export async function toggleWatched(id: number, watched: boolean) {
  await prisma.watchlistItem.update({ where: { id }, data: { watched } });
  revalidatePath("/watchlist");
}

export async function removeFromWatchlist(id: number) {
  await prisma.watchlistItem.delete({ where: { id } });
  revalidatePath("/watchlist");
}
```

`"use server"` convierte a cada función exportada en una **Server Action**:
código que corre siempre en el servidor, pero que un componente de navegador
puede llamar como si fuera una función local. Next se encarga por debajo del
`fetch`, del POST y de serializar los datos. **Nunca escribimos una URL ni un
`JSON.parse`.**

`revalidatePath` le avisa a Next que el HTML cacheado de `/watchlist` quedó
viejo. Sin esa línea, la lista seguiría mostrando los datos anteriores.

### El formulario

Creá `src/components/add-to-watchlist-form.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { addToWatchlist, type ActionState } from "@/actions/watchlist";
import { Button } from "@/components/ui/button";
import type { MovieDetail } from "@/lib/movies";

export function AddToWatchlistForm({ movie }: { movie: MovieDetail }) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    addToWatchlist,
    null,
  );

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="movieId" value={movie.id} />
      <input type="hidden" name="title" value={movie.title} />
      <input type="hidden" name="posterPath" value={movie.poster_path ?? ""} />
      <input type="hidden" name="releaseDate" value={movie.release_date ?? ""} />
      <input type="hidden" name="voteAverage" value={movie.vote_average} />

      <SubmitButton />

      {state ? (
        <p className={state.ok ? "text-sm text-green-600" : "text-destructive text-sm"}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando…" : "Agregar a mi watchlist"}
    </Button>
  );
}
```

Agregalo al final del `<div className="space-y-4">` de la página de detalle:

```tsx
<AddToWatchlistForm movie={movie} />
```

> 💡 `useFormStatus` **solo funciona en un componente que esté adentro del
> `<form>`**. Por eso el botón es un componente aparte y no está escrito
> directamente arriba. Es un detalle que confunde a todo el mundo la primera vez.

### La lista

Creá `src/components/watchlist-item.tsx`:

```tsx
"use client";

import { Trash2 } from "lucide-react";
import { useOptimistic, useTransition } from "react";

import { removeFromWatchlist, toggleWatched } from "@/actions/watchlist";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export type WatchlistItemData = {
  id: number;
  movieId: number;
  title: string;
  releaseDate: string | null;
  watched: boolean;
};

export function WatchlistItem({ item }: { item: WatchlistItemData }) {
  const [isPending, startTransition] = useTransition();
  const [vistaOptimista, setVistaOptimista] = useOptimistic(item.watched);

  function alMarcar(nuevoValor: boolean) {
    startTransition(async () => {
      setVistaOptimista(nuevoValor);
      await toggleWatched(item.id, nuevoValor);
    });
  }

  function alBorrar() {
    startTransition(async () => {
      await removeFromWatchlist(item.id);
    });
  }

  return (
    <li className={`flex items-center gap-3 rounded-lg border p-3 ${isPending ? "opacity-60" : ""}`}>
      <Checkbox
        checked={vistaOptimista}
        onCheckedChange={(valor) => alMarcar(valor === true)}
        aria-label={`Marcar ${item.title} como vista`}
      />

      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-medium ${vistaOptimista ? "text-muted-foreground line-through" : ""}`}>
          {item.title}
        </p>
        {item.releaseDate ? (
          <p className="text-muted-foreground text-xs">
            {item.releaseDate.slice(0, 4)}
          </p>
        ) : null}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={alBorrar}
        aria-label={`Sacar ${item.title} de la watchlist`}
      >
        <Trash2 className="size-4" />
      </Button>
    </li>
  );
}
```

Y la página, `src/app/watchlist/page.tsx`:

```tsx
import { WatchlistItem } from "@/components/watchlist-item";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  const items = await prisma.watchlistItem.findMany({
    orderBy: { createdAt: "desc" },
  });

  const vistas = items.filter((item) => item.watched).length;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Mi watchlist</h1>
        {items.length > 0 ? (
          <p className="text-muted-foreground text-sm">
            {vistas} de {items.length} vistas
          </p>
        ) : null}
      </header>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-muted-foreground text-sm">
            Todavía no agregaste nada.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <WatchlistItem
              key={item.id}
              item={{
                id: item.id,
                movieId: item.movieId,
                title: item.title,
                releaseDate: item.releaseDate,
                watched: item.watched,
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
```

Fijate que la consulta a Postgres está **directamente en el componente**. Sin
`fetch`, sin endpoint, sin `useEffect`.

### `useOptimistic`, que es el más lindo de los tres

Cuando marcás el checkbox, la acción tarda unos milisegundos en ir al servidor,
escribir en Postgres y volver. `useOptimistic` te deja **pintar el resultado
antes de que el servidor conteste**. Si la acción falla, React vuelve solo al
valor real. Sin esto, el checkbox se quedaría un instante congelado.

> 🔍 Agregá un par de películas y marcalas como vistas. Ahora mirá **Prisma
> Studio** (que dejaste abierto en el Paso 2) y refrescá: las filas están ahí, en
> Postgres de verdad.

---

## Paso 8 — El build

Todo lo que dijimos sobre estático y dinámico se puede comprobar de una sola vez:

```sh
npm run build
```

```
Route (app)              Revalidate  Expire
┌ ○ /
├ ○ /_not-found
├ ƒ /buscar
├   /pelicula/[id]
│ ├ ● /pelicula/969681           1d      1y
│ ├ ● /pelicula/1368337          1d      1y
│ └ ● [+18 more paths]
├ ○ /populares                   1h      1y
└ ƒ /watchlist

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand
```

Leé esa tabla con calma, porque es el resumen de todo el workshop:

- **`○ /` y `○ /populares`** son estáticas. `/populares` además dice `1h` en la
  columna *Revalidate*: eso es el ISR que configuramos.
- **`● /pelicula/...`** son las 20 páginas que `generateStaticParams` generó una
  por una durante el build.
- **`ƒ /buscar` y `ƒ /watchlist`** son dinámicas: se arman en cada pedido.

Nunca elegimos esto desde un menú de configuración. **Next lo dedujo de cómo
escribimos el código**: si leés `searchParams` o consultás la base, sos dinámico;
si no, sos estático.

---

## Cheat sheet: ¿cuál uso?

| Si la página… | Usá | Cómo se escribe |
|---|---|---|
| es igual para todos y casi no cambia | **SSG** | no hagas nada, es lo que viene |
| es igual para todos pero se actualiza cada tanto | **ISR** | `export const revalidate = 3600` |
| tiene una URL con parámetro y conocés los valores | **SSG + params** | `generateStaticParams()` |
| depende de la URL, de cookies o del usuario | **SSR** | leé `searchParams`, o `export const dynamic = "force-dynamic"` |
| tiene que reaccionar a clicks y tecleo | **Cliente** | `"use client"` |

Y para los datos:

| Querés… | Usá |
|---|---|
| leer datos para mostrarlos | `await` directo en un Server Component |
| escribir o modificar datos | una **Server Action** |
| que otro sistema consuma tu API | un Route Handler (`route.ts`) |

### Los hooks que vimos

| Hook | Para qué |
|---|---|
| `useState` | estado local en el navegador |
| `useEffect` | correr algo después de renderizar (ojo: en Next lo vas a usar mucho menos) |
| `useActionState` | conectar un formulario con una Server Action y guardar su respuesta |
| `useFormStatus` | saber si el formulario se está enviando |
| `useOptimistic` | mostrar el resultado antes de que el servidor conteste |
| `useTransition` | marcar una actualización como no urgente |
| `useRouter` / `useSearchParams` | navegar y leer la query string |

---

## Si algo se rompe

| Síntoma | Causa |
|---|---|
| Los pósters no cargan | Falta `remotePatterns` en `next.config.ts` |
| `Falta TMDB_ACCESS_TOKEN` | El `.env` está vacío, o pusiste la "API Key" corta en vez del Read Access Token |
| TMDB responde 401 | Mismo caso: credencial equivocada |
| `ECONNREFUSED` al abrir `/watchlist` | Postgres no está levantado → `docker compose up -d db` |
| El contenedor arranca y se muere | El volumen apunta a `/var/lib/postgresql/data`. Sacale el `/data` |
| El build falla por `useSearchParams` | Falta envolverlo en `<Suspense>` |
| Prisma tira errores raros de tipos | Faltó `npx prisma generate` |
| Un cartel te ofrece Prisma 8 | Ignoralo, quedate en la 7.10.0 |

---

## Para seguir solo

Cosas que no entraron en la hora y que son el próximo paso natural:

- **Route Handlers** (`src/app/api/.../route.ts`): la alternativa a las Server
  Actions cuando querés exponer una API que consuma otro sistema.
- **`error.tsx`**: como `not-found.tsx` pero para errores inesperados.
- **Paginación** en `/populares` usando el parámetro `page` de TMDB.
- **Imágenes Open Graph** con `next/og`, para que el link se vea lindo al
  compartirlo.
- **Deploy**, que es el tema del workshop de Docker.

### Documentación

- [Next.js](https://nextjs.org/docs) · [Server Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) · [Server Actions](https://nextjs.org/docs/app/getting-started/updating-data)
- [React: `useActionState`](https://react.dev/reference/react/useActionState) · [`useOptimistic`](https://react.dev/reference/react/useOptimistic)
- [Prisma](https://www.prisma.io/docs) · [ShadCN](https://ui.shadcn.com/) · [Tailwind](https://tailwindcss.com/docs)
- [TMDB API](https://developer.themoviedb.org/docs)
