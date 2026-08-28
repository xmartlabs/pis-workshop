# Workshops de PIS (Proyecto de Ingeniería de Software, FInG)

Material introductorio a las tecnologías que se usan en PIS.

## Los workshops

| Workshop | Qué construye |
|---|---|
| [**Next.js + Node**](./next-workshop.md) | Watchlist de películas con TMDB, Postgres y Server Actions |
| [Docker](./docker-workshop.md) | La misma app, en contenedores |

El workshop de Next es práctico y dura aproximadamente una hora. Cubre los tres
tipos de renderizado (SSG, ISR, SSR), componentes de servidor y de cliente,
hooks, Tailwind, ShadCN, Prisma sobre Postgres y Server Actions.

## Qué hay acá

```
├── next-workshop.md      ← el paso a paso, con las explicaciones
├── docker-workshop.md    ← la misma app, contenerizada
└── watchlist/            ← la app terminada y andando
```

Los documentos **explican**, el código está en `watchlist/`. Cada paso del
workshop te dice qué archivo crear y qué tiene adentro, y vos lo copiás desde
esa carpeta. Así los documentos se leen sin saltear cien líneas de código, y lo
que copiás es código probado.

## Cómo se usa

1. Cloná este repo, que es de donde vas a sacar el código.
2. Creá **tu propio repositorio**, vacío, para tu versión de la app.
3. Seguí [`next-workshop.md`](./next-workshop.md) de arriba a abajo. Arranca
   creando el proyecto de cero con `create-next-app`.
4. Cuando un paso te pida un archivo, buscá el equivalente en `watchlist/`,
   copiálo a tu proyecto y volvé al documento a leer por qué está escrito así.

> 💡 Se puede copiar la carpeta entera de una y saltear los pasos, pero no vale
> mucho la pena: la app anda y no aprendiste nada. El orden importa porque cada
> pieza aparece cuando ya se entiende para qué sirve.

## Correr la app terminada

Si querés verla funcionando antes de empezar, o comparar contra tu versión
cuando algo no te anda:

```sh
cd watchlist
npm install

cp .env.example .env      # completá TMDB_ACCESS_TOKEN con tu token
docker compose up -d db   # levanta Postgres

npx prisma migrate dev    # crea las tablas y genera el cliente de Prisma
npm run dev
```

Queda en [http://localhost:3000](http://localhost:3000).

Hace falta **Node 22 o más nuevo**, **Docker Desktop** abierto y un **token de
TMDB**. Cómo conseguir cada cosa está en el Setup del
[workshop de Next](./next-workshop.md).

> ⚠️ El `npx prisma migrate dev` no es opcional, aunque las migraciones ya estén
> en el repo. Además de crear las tablas, genera el cliente tipado de Prisma en
> `src/generated/prisma`, que no se commitea. Si lo salteás, TypeScript no
> encuentra los imports de `@/generated/prisma`. Para regenerarlo solo:
> `npx prisma generate`.

También se puede levantar todo —base, migraciones y app— en contenedores con
`docker compose up --build`. Eso es lo que arma el
[workshop de Docker](./docker-workshop.md).

## Versiones anteriores

En el historial de git están las versiones previas de este material: un workshop
de React con Create React App y `json-server`, y una versión más corta del de
Next que continuaba ese mismo ejemplo.

```sh
git show 8b0389f:react-workshop.md    # workshop de React
git show 55dd786:next-workshop.md     # workshop de Next, versión corta
```

Las soluciones de esos workshops siguen en las branches `solution-react`,
`next-solution` y `docker-solution`.
