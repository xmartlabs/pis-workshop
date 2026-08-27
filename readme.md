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

Para dar la clase está el [**guion**](./GUION.md), que recorre los mismos nueve
pasos con los tiempos, qué explicar en cada punto, qué mostrar en pantalla, qué
preguntarle a la clase y dónde suele romperse cada paso.

## El código

La app terminada y verificada está en la branch **`next-v2-solution`**:

```sh
git clone -b next-v2-solution <url-del-repo>
```

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
