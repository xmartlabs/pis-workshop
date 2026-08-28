# Workshop de Next.js + Node

Vamos a construir una app para llevar una lista de películas que querés ver. Los datos de las películas salen de [TMDB](https://www.themoviedb.org/)
y tu lista se guarda en una base Postgres.

La idea es interactuar con una API externa, poder tener una base de datos propia, y además explorar las capacidades de Next y las tres formas que de armar una página, los componentes de servidor y de cliente, los hooks y las Server Actions.

Acá te explico paso a paso cómo llegamos al código final de esta carpeta. Podés
ir leyendo este documento y haciéndolo vos a la par, o usarlo como guía cuando
quieras programar.

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

## Cómo usar este documento

**Este documento no tiene el código, tiene la explicación.** El código terminado
está en la carpeta [`watchlist/`](./watchlist) de este mismo repo: ahí está cada
archivo completo y andando.

La idea es que trabajes así:

1. Creá tu propio repositorio y armá el proyecto siguiendo el Paso 0.
2. Seguí los pasos de este documento en orden. Cada uno te dice qué archivo
   crear o tocar y por qué.
3. Cuando un paso te pide un archivo, abrí el archivo equivalente en
   `watchlist/`, copiálo y pegálo en tu proyecto.
4. Volvé acá y leé la explicación de lo que acabás de pegar antes de seguir.

> 💡 No copies la carpeta `watchlist/` entera de una y listo. Se ve todo andando
> pero no aprendés nada. El orden de los pasos es el que hace que cada pieza
> tenga sentido cuando aparece.

## Setup

### 1. Node

Necesitás Node 22 o más nuevo. Usá tu manejador de versiones (`nvm`, `nodenv`, `asdf`):

```sh
nvm install 22
node -v    # tiene que decir v22.x o superior
```

### 2. Docker

La base de datos corre en un contenedor. Instalá
[Docker Desktop](https://www.docker.com/products/docker-desktop/), abrilo al
menos una vez y verificá:

```sh
docker --version
docker ps         # tiene que responder sin error
```

> 💡 Si `docker` no aparece pero Docker Desktop está instalado, abrí la app.

### 3. Token de TMDB

1. Creá una cuenta en [themoviedb.org](https://www.themoviedb.org/signup) y
   confirmá el mail.
2. Andá a [Configuración → API](https://www.themoviedb.org/settings/api) y pedí
   una clave de uso personal.
3. Copiá el **API Read Access Token**, el largo, empieza con `eyJ...`.


_Btw, la página de registro no funciona bien desde el celular. Hacelo en una computadora._

---

## Paso 0 — Crear el proyecto

```sh
npx create-next-app@latest watchlist \
  --ts --tailwind --app --src-dir --import-alias "@/*" --eslint --turbopack --use-npm

cd watchlist
```

Esos flags contestan solas todas las preguntas del instalador: TypeScript,
Tailwind, App Router, carpeta `src/` y Turbopack.

### Agregá ShadCN

ShadCN no es una librería que se instala sino que **te copia el código de cada
componente adentro de tu proyecto**, para que lo puedas modificar. Por eso
después vas a ver los archivos en `src/components/ui/`.

```sh
npx shadcn@latest init -y -b radix -p nova
npx shadcn@latest add button card input badge checkbox skeleton
```

### El archivo `.env`

La app necesita dos secretos: el token de TMDB y la dirección de la base de
datos. Ninguno de los dos va escrito en el código, van en un archivo `.env` en
la raíz del proyecto. `create-next-app` no lo crea, así que creálo vos: en el
repo está el [`.env.example`](./watchlist/.env.example) con los nombres de las
dos variables, copiá esas líneas a un archivo `.env` y completá los valores.

```sh
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/watchlist?schema=public"
TMDB_ACCESS_TOKEN="pegá-acá-tu-token-largo"
```

**`TMDB_ACCESS_TOKEN`** es el token que sacaste en el Setup: el **API Read
Access Token**, el largo que empieza con `eyJ...`, no la "API Key" corta.

**`DATABASE_URL`** no la vas a buscar a ningún lado: **la base es tuya y la vas
a levantar vos** en el Paso 2, con Docker. Esa URL describe cómo conectarse a
ella y cada pedazo sale del `docker-compose.yml` que vamos a escribir:

```
postgresql://USUARIO:CONTRASEÑA@HOST:PUERTO/BASE?schema=public
```

Si más adelante cambiás una de esas líneas del `docker-compose.yml`,
tenés que cambiar la URL acá también, o la app no se va a poder conectar.

> ⚠️ **El `.env` nunca se commitea.** Tiene tu token adentro, y lo que se sube a
> GitHub queda ahí para siempre aunque después borres el archivo. El
> `.gitignore` que trae Next ya ignora todo lo que empiece con `.env`.

Lo que sí conviene commitear es el `.env.example`: tiene los nombres de las
variables pero no los valores, así el que clona el repo sabe qué necesita
completar. Como el `.gitignore` de Next ignora `.env*`, hay que hacerle una
excepción al final del archivo:

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
└── lib/                  ← código auxiliar o "helpers"
```

**La regla del ruteo es esta:** una carpeta con un `page.tsx` adentro es una
ruta. `src/app/buscar/page.tsx` se transforma en `/buscar`. No hay que
registrar nada en ningún lado, ni instalar un router.

### La barra de navegación

Creá el componente SiteNav en la ruta `src/components/site-nav.tsx`.

El componente `<Link>` de Next navega **sin recargar la página entera**, solo pide al servidor
la parte que cambia, a diferencia de un `<a>` común.

### El layout

Modificamos `src/app/layout.tsx` para que use la barra de navegación que recién
creamos. El layout envuelve a **todas** las páginas y no se vuelve a montar
cuando navegás, por eso la barra de arriba no parpadea al cambiar de ruta.

**Los layouts anidan según la carpeta.** El de `src/app/` es el layout raíz y
aplica a todo el sitio, pero podés poner un `layout.tsx` en cualquier subcarpeta
y solo va a envolver a las páginas de esa carpeta y las de adentro. Al resto
del sitio no lo toca:

```
src/
└── app/
    ├── layout.tsx            ← envuelve TODO el sitio
    ├── page.tsx              ← usa: layout raíz
    ├── populares/
    │   └── page.tsx          ← usa: layout raíz
    └── watchlist/
        ├── layout.tsx        ← envuelve solo /watchlist y lo de dentro
        ├── page.tsx          ← usa: layout raíz + layout de watchlist
        └── vistas/
            └── page.tsx      ← usa: layout raíz + layout de watchlist
```

> 💡 Los layouts no se reemplazan, se **apilan**

### El reloj que vamos a usar todo el workshop

Creá `src/components/render-stamp.tsx`.  Este componente nos va a ayudar a ver el momento exacto en que se generó el HTML. Vas a ver que en unas páginas queda congelado y en otras cambia. Ahí está toda la diferencia entre los tipos de renderizado.

> 💡 _Recordá que si corres el comando `npm run dev`, incluso las páginas que sean generadas estáticamente se volverán a cargar cuando recargues. Para ver el reloj funcionando como lo haría en producción corré `npm run build` y luego `npm start`_
---

## Paso 2 — La base de datos

### Levantar Postgres

Creá `docker-compose.yml` en la raíz del proyecto. Por ahora tomá el `docker-compose.yml` como una receta. Qué significa cada línea lo vamos a ver en el workshop de Docker.

### Instalar Prisma

Prisma es un ORM, en vez de escribir SQL a mano, describís tus tablas en un archivo y él te da funciones tipadas para consultarlas.

```sh
npm i -D prisma@7.10.0 @types/pg dotenv
npm i @prisma/client@7.10.0 @prisma/adapter-pg@7.10.0 pg server-only
npx prisma init --datasource-provider postgresql --output ../src/generated/prisma
```

> ⚠️ **Las versiones van clavadas a propósito.** Prisma está justo en medio de un cambio de versión mayor: si ponés `npm i prisma` sin el número, npm te instala un candidato de la v8 que no es compatible con el cliente v7 y nada funciona. Por la misma razón, cuando corras comandos de Prisma te va a aparecer un cartel que te invita a actualizar a la 8, **ignoralo**.

Reemplazá `prisma/schema.prisma`. Cada `model` se convierte en una tabla. El `?` marca las columnas que aceptan nulo. `@unique` en `movieId` es lo que va a impedir que guardes dos veces la misma película.

### Las variables de entorno

Acá se cierra el círculo del `.env` que creaste en el Paso 0: los valores de `DATABASE_URL` son exactamente los del `docker-compose.yml` que acabás de escribir. Si los cambiaste, ajustá la URL ahora.

En Prisma 7 la URL de la base **no va en el schema**, va en `prisma7.config.ts` (que ya se creó solo y lee del archivo `.env`).

### Crear las tablas

Escribir el `schema.prisma` no crea nada, es un archivo de texto en tu proyecto. La base sigue vacía. Para que exista la tabla hay que correr una **migración**.

```sh
npx prisma migrate dev --name init
```

Esto compara tu schema con la base, escribe el SQL necesario en `prisma/migrations/` y lo aplica.

### Qué es una migración

Una migración es un archivo con los cambios que hay que hacerle a la estructura de la base para llegar del estado anterior al nuevo, guardado en el repo junto al código.

Mirá lo que acaba de aparecer en `prisma/migrations/`:

```
prisma/migrations/
├── 20260827230133_init/
│   └── migration.sql       ← el SQL que crea la tabla watchlist_items
└── migration_lock.toml
```

Y adentro de ese `migration.sql` está el SQL que vos no escribiste:

```sql
CREATE TABLE "watchlist_items" (
    "id" SERIAL NOT NULL,
    "movieId" INTEGER NOT NULL,
    ...
);

CREATE UNIQUE INDEX "watchlist_items_movieId_key" ON "watchlist_items"("movieId");
```

Eso es lo que Prisma dedujo de tu `schema.prisma` y le mandó a Postgres.

El flujo de todos los días, cuando quieras agregar un campo:

1. Editás `prisma/schema.prisma`.
2. Corrés `npx prisma migrate dev --name hace-tal-cosa`.
3. Prisma genera la carpeta nueva, aplica el SQL y regenera el cliente tipado.
4. Commiteás el schema y la migración juntos.

Para poder ver fácilmente los datos de nustra base, corremos `npx prisma studio`, que abre un navegador de la base en el puerto 5555. Vas a ver la tabla `watchlist_items` vacía.

### El cliente generado, y `prisma generate`

Antes de seguir, fijate en `src/generated/prisma`. Esta carpeta se genera al correr el comando `npx prisma generate`. Sin embargo acá nunca lo corrimos a mano y está, porque `migrate dev`
dispara los generadores al terminar.

El cliente generado no se commitea: es código derivado del schema, igual que `node_modules` es código derivado del `package.json`.

Eso tiene una consecuencia práctica que te va a pasar: **cuando clones un repo que usa Prisma, `npm install` no alcanza.** La carpeta no viene en el repo, así que los imports apuntan a algo que no existe y TypeScript se llena de errores. Corré `npx prisma generate` y se arregla.

Te va a hacer falta también cuando hagas `git pull` y alguien haya tocado el schema. La regla corta: si los tipos de Prisma se ven raros, corré `generate`.

### Conectar Prisma con la app

Creá `src/lib/prisma.ts`.

Dos cosas que parecen ruido pero no lo son:

- **El adapter.** En Prisma 7 es obligatorio: es la pieza que sabe hablar el protocolo de Postgres. Sin él, `new PrismaClient()` tira error.
- **El `globalThis`.** En desarrollo Next recarga el código muchas veces por minuto. Si creáramos un cliente nuevo en cada recarga, abriríamos conexiones hasta reventar la base. Guardándolo en `globalThis` reusamos siempre el mismo.


## Paso 3 — Películas populares (SSG + ISR)

### El cliente de TMDB

Vamos a hablar con TMDB desde dos archivos, y la división importa.

Creá `src/lib/movies.ts` con los tipos (`Movie`, `MovieDetail`) y dos helpers chiquitos: `posterUrl`, que arma la URL de una imagen a partir del path que devuelve TMDB, y `releaseYear`, que saca el año de una fecha. Todo esto **sí** puede viajar al navegador: son tipos y funciones puras, no hay secretos adentro.

Creá `src/lib/tmdb.ts` con las funciones que hablan con la API. Acá vive
`tmdbFetch`, que le pega a TMDB con tu token en el header `Authorization`, y `getPopularMovies`, que pide las populares con `revalidate: 3600`. Este archivo **no** puede salir del servidor nunca, porque usa el token, y no lo queremos exponer.

Por eso son dos archivos y no uno: `movies.ts` lo van a importar componentes de los dos lados, `tmdb.ts` solo el servidor.

### La tarjeta de una película

Creá `src/components/movie-card.tsx`. Es el póster con el título, el año y el puntaje, envuelto en un `<Link>` al detalle.

Usa `<Image>` de `next/image` en vez de un `<img>` común. Next le agrega
optimizaciones: sirve la imagen en el formato que soporte el navegador, en el tamaño que hace falta, y reserva el espacio para que la página no salte cuando termina de cargar.

Como las imágenes vienen de un dominio externo, hay que autorizarlo. Editá
`next.config.ts` y agregá `image.tmdb.org` a `images.remotePatterns`.

> ⚠️ Si te olvidás de eso, los pósters no cargan y la consola te tira un error sobre hostnames no configurados.

### La página

Creá `src/app/populares/page.tsx`. Son pocas líneas, pero vamos a hcer foco en dos cosas:

1. **El componente es `async` y hace `await` adentro.** No hay `useState`, no hay `useEffect`, no hay estado de "cargando". Esto es así porque el componente corre en el servidor: para cuando el HTML llega a tu navegador, las películas ya están cargadas.

2. **`export const revalidate = 3600`.** Le pone fecha de vencimiento al HTML: se genera una vez y se reusa por una hora. Pasada la hora, el siguiente usuario que entre dispara la regeneración del HTML.

> 🔍 Abrí las herramientas de desarrollo, pestaña **Network**, y recargá. No vas a ver ningún pedido a TMDB. Ese pedido lo hizo el servidor, una sola vez.

## Paso 4 — El filtro (componente de cliente)

Todo lo anterior corrió en el servidor. Pero si querés reaccionar a lo que el usuario escribe, necesitás código en el navegador.

Creá `src/components/movie-filter.tsx`. Este componente tiene la directiva `"use client"` y tiene dos cosas: un `<Input>` con `useState` que filtra la lista por título, y un `ClientClock`, un relojito que se actualiza cada segundo con `useEffect` y `setInterval`.

- `"use client"` marca un límite. De ahí para abajo, el código también viaja al navegador y puede usar estado, eventos y APIs del browser.
- Las películas no se piden acá. Ya vinieron resueltas desde el servidor como una prop. El componente de cliente solo agrega interactividad encima de datos que ya estaban.
- `MovieCard` no tiene ninguna directiva, no es client side ni server side, funciona en los dos lados. La regla: un componente sin directiva se adapta a quien lo use.

> 🔍 Ahora tenés los dos relojes en la misma pantalla: el de arriba (ISR) quedó congelado y el de abajo (CSR) avanza segundo a segundo. Escribí en el filtro: la lista se filtra al instante y la página nunca se recarga.

## Paso 5 — El detalle de la película (SSG con rutas dinámicas)

Los corchetes en el nombre de la carpeta la vuelven un parámetro: creá
`src/app/pelicula/[id]/page.tsx` y ya tenés andando `/pelicula/550`,
`/pelicula/12345` y cualquier otro número.

Necesitás también la función que trae una película sola: agregá `getMovie` a `src/lib/tmdb.ts`. Devuelve `null` si TMDB no la encuentra, en vez de tirar error.

- `generateStaticParams` le dice a Next qué ids conoce de antemano, para que genere esas páginas durante el build. Las 20 populares quedan listas. Si alguien entra a una película que no está en la lista, Next la genera en ese momento y la guarda para la próxima.
- `params` es una promesa, por lo tanto hay que hacerle `await`. Si te lo olvidás, `id` sale `undefined` y la página explota.

También aparece ahí `generateMetadata`, que es cómo se arma el `<title>` de la pestaña cuando depende de los datos.

## Paso 6 — Búsqueda (SSR)

Creá `src/components/search-box.tsx`, un formulario de cliente que en vez de guardar los resultados en un estado hace `router.push("/buscar?q=...")`. O sea: la búsqueda queda en la URL, y por lo tanto se puede compartir, marcar como favorita y volver atrás con el botón del navegador.

Creá `src/app/buscar/page.tsx`, que lee ese `?q=` de `searchParams`, busca en TMDB y muestra el `SearchBox` envuelto en un `<Suspense>`. Y agregá `searchMovies` a `src/lib/tmdb.ts`, que va con `revalidate: 0` porque no tiene sentido cachear el resultado de una búsqueda.

Esta página lee `searchParams`, o sea que depende del pedido. Next no puede generarla en el build porque no sabe qué va a buscar la gente, así que la arma entera en cada visita. Eso es SSR.

> ⚠️ El `<Suspense>` alrededor del `SearchBox` no es decorativo: `useSearchParams` lo necesita. Sin eso, `npm run build` falla.

## Paso 7 — Server Actions

Hasta acá solo leímos. Ahora vamos a escribir en la base, sin crear ni un solo endpoint.

Primero, el tipo de lo que le vamos a mandar al servidor: agregá `WatchlistInput` a `src/lib/movies.ts`. Va en ese archivo, y no en el de la action, porque lo usan los dos lados: el componente del navegador para armarlo y la Server Action para recibirlo.

Ahora creá `src/actions/watchlist.ts`, con las tres operaciones:
`addToWatchlist`, `toggleWatched` y `removeFromWatchlist`.

`"use server"` convierte a cada función exportada en una **Server Action**: código que corre siempre en el servidor, pero que un componente de navegador puede llamar como si fuera una función local. Next se encarga por debajo del `fetch`, del POST y de serializar los datos.

`revalidatePath` le avisa a Next que el HTML cacheado de `/watchlist` quedó viejo. Sin esa línea, la lista seguiría mostrando los datos anteriores.

> ⚠️ Los argumentos de una Server Action viajan por la red, así que tienen que ser serializables: números, strings, booleanos, arrays y objetos planos sirven; una función o una instancia de clase, no.

### El formulario

Creá `src/components/add-to-watchlist-form.tsx` y agregalo al final de la
columna de texto de la página de detalle, con `<AddToWatchlistForm movie={movie} />`.

Es un `onSubmit` como el de cualquier formulario de React: `preventDefault`, dos `useState` y listo. Lo único distinto es la línea que llama a la action:

`const respuesta = await addToWatchlist({ ... })`

`addToWatchlist` está en otro archivo, marcado con `"use server"`, y corre en el servidor. Pero desde acá se llama como cualquier función `async`: le pasás un objeto, te devuelve un objeto. Del pedido HTTP se encarga Next por debajo.

Fijate todo lo que **no** hay que escribir: ni URL, ni `fetch`, ni
`JSON.stringify`, ni `JSON.parse`, ni un `route.ts`. 

### La watchlist

Creá `src/components/watchlist-item.tsx`, cada fila de la lista con su checkbox y su botón de borrar, y `src/app/watchlist/page.tsx`, que las muestra.

Fijate que en la página la consulta a Postgres está directamente en el
componente: `await prisma.watchlistItem.findMany(...)`. Sin `fetch`, sin
endpoint, sin `useEffect`.

El `export const dynamic = "force-dynamic"` de arriba es lo que le dice a Next que no intente generar esta página en el build. Tiene sentido: los datos salen de una base que cambia todo el tiempo.

### `useOptimistic`

Cuando marcás el checkbox, la acción tarda unos milisegundos en ir al servidor, escribir en Postgres y volver. `useOptimistic` te deja pintar el resultado antes de que el servidor conteste. Si la acción falla, React vuelve solo al valor real. Sin esto, el checkbox se quedaría un instante congelado.

## Paso 8 — El build

Todo lo que dijimos sobre estático y dinámico se puede comprobar de una sola vez `npm run build`

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

- **`○ /` y `○ /populares`** son estáticas. `/populares` además dice `1h` en la columna *Revalidate*: eso es el ISR que configuramos.
- **`● /pelicula/...`** son las 20 páginas que `generateStaticParams` generó una por una durante el build.
- **`ƒ /buscar` y `ƒ /watchlist`** son dinámicas: se arman en cada pedido.

Nunca elegimos esto desde un menú de configuración. Next lo dedujo de cómo
escribimos el código: si leés `searchParams` o consultás la base, sos dinámico; si no, sos estático.

## Cheat sheet: ¿cuál uso?

| Si la página… | Usá | Cómo se escribe |
|---|---|---|
| es igual para todos y casi no cambia | **SSG** | no hagas nada, es lo que viene |
| es igual para todos pero se actualiza cada tanto | **ISR** | `export const revalidate = 3600` |
| tiene una URL con parámetro y conocés los valores | **SSG + params** | `generateStaticParams()` |
| depende de la URL, de cookies o del usuario | **SSR** | leé `searchParams`, o `export const dynamic = "force-dynamic"` |
| tiene que reaccionar a clicks y tecleo | **Cliente** | `"use client"` |

### Los hooks que vimos

| Hook | Para qué |
|---|---|
| `useState` | estado local en el navegador |
| `useEffect` | correr algo después de renderizar (ojo: en Next lo vas a usar mucho menos) |
| `useOptimistic` | mostrar el resultado antes de que el servidor conteste |
| `useTransition` | marcar una actualización como no urgente |
| `useRouter` / `useSearchParams` | navegar y leer la query string |

Y dos que **no** usamos, pero que vas a encontrar en la documentación oficial de
React cuando busques cómo manejar formularios con Server Actions:

## Para seguir solxs

Cosas que no entraron en la hora y que son el próximo paso natural:

- **Route Handlers** (`src/app/api/.../route.ts`): la alternativa a las Server Actions cuando querés exponer una API que consuma otro sistema.
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
