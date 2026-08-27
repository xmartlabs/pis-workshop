# Workshops de PIS (Proyecto de Ingeniería de Software, FInG)

Material introductorio a las tecnologías que se usan en PIS.

## Los workshops

| Workshop | Qué construye | Idioma |
|---|---|---|
| [React](./react-workshop.md) | Lista de tareas con Create React App y `json-server` | Inglés |
| [**Next.js + Node**](./next-workshop-v2.md) | **Watchlist de películas con TMDB, Postgres y Server Actions** | Español |
| [Docker](./docker-workshop.md) | La app de Next en contenedores | Español |

El workshop de Next es práctico y dura aproximadamente una hora. Cubre los tres
tipos de renderizado (SSG, ISR, SSR), componentes de servidor y de cliente,
hooks, Tailwind, ShadCN, Prisma sobre Postgres y Server Actions.

Para dar la clase está el [**guion**](./GUION.md), que tiene el mismo recorrido
con los tiempos, qué explicar en cada punto, qué mostrar en pantalla y dónde
suele romperse.

## El código

La app terminada y verificada está en la branch **`next-v2-solution`**:

```sh
git clone -b next-v2-solution <url-del-repo>
```

Las soluciones de los workshops viejos están en `solution-react`,
`next-solution` y `docker-solution`.

## Sobre la versión anterior

[`next-workshop.md`](./next-workshop.md) es la versión corta y anterior del
workshop de Next: continúa el dominio del workshop de React (una lista de
mensajes contra `json-server`) y no cubre los tipos de renderizado ni la base de
datos. Se mantiene por si se quiere dar la versión reducida, pero **el workshop
de Docker apunta a la versión nueva**.
