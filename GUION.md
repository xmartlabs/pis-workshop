# Guion de clase — Workshop de Next.js + Node

> Este archivo es para vos, no para los estudiantes. Ellos siguen
> [`next-workshop.md`](./next-workshop.md), que tiene los mismos 9 pasos
> con la misma numeración.
>
> **Leyenda:** ⏱ tiempo · 📝 qué pegar · 🎙 qué decir · 🖥 qué mostrar ·
> ❓ qué preguntar · ⚠️ dónde se rompe

---

## Hoja de ruta

| Paso | Min | Reloj | Qué pasa | ¿Recortable? |
|---|---|---|---|---|
| 0 · Setup | 5 | 0:05 | Crear proyecto, ShadCN | Sí, si lo hicieron de tarea |
| 1 · Primera página | 5 | 0:10 | Layout, nav, el reloj | No |
| 2 · Base de datos | 8 | 0:18 | Docker, Prisma, migración | No |
| 3 · Populares | 10 | 0:28 | **Server Component + ISR** | ❌ es el corazón |
| 4 · Filtro | 8 | 0:36 | **`"use client"` + `useState`** | ❌ es el corazón |
| 5 · Detalle | 7 | 0:43 | `generateStaticParams` | ✅ mostralo ya hecho |
| 6 · Búsqueda | 5 | 0:48 | **SSR + la comparación** | ✅ reducí a los dos F5 |
| 7 · Server Actions | 10 | 0:58 | **Escribir en la base** | ❌ es el corazón |
| 8 · El build | 5 | 1:03 | La tabla de rutas | ✅ si no llegás, mandala por escrito |

**Si vas atrasada:** recortá el 5 y el 6 (podés mostrarlos funcionando desde
`next-v2-solution` en vez de escribirlos). **Nunca recortes el 3, el 4 y el 7**:
son Server Components, el límite cliente/servidor y las Server Actions. Sin eso
el workshop no cuenta nada.

**El hilo conductor:** el `<RenderStamp/>` del Paso 1. Aparece en el 3, se
contrasta en el 4, se cierra en el 6 y se demuestra en el 8. Si te acordás de
una sola cosa, que sea volver siempre a ese reloj.

---

## Antes de entrar al aula

- [ ] `docker compose up -d db` corriendo, y `npx prisma studio` abierto en otra pestaña
- [ ] Tu token de TMDB **en una slide**, para que lo copie quien no lo hizo de tarea
- [ ] La branch `next-v2-solution` clonada aparte, por si tenés que copiar algo
- [ ] Fuente de la terminal y del editor grandes (18pt mínimo)
- [ ] Tema claro en el editor: el oscuro proyectado no se lee
- [ ] Preguntar al entrar: **"¿a quién no le anda Docker?"** — resolvelo ahí, no en el minuto 18

> 💡 **Sobre el token de TMDB:** el límite es por token y es holgado, así que uno
> solo aguanta toda la clase sin problema. Compartilo sin culpa y que cada uno
> saque el suyo después.

---

## Paso 0 · Setup ⏱ 5 min

📄 *Guía: Paso 0*

📝 **Pegá:**

```sh
npx create-next-app@latest watchlist \
  --ts --tailwind --app --src-dir --import-alias "@/*" --eslint --turbopack --use-npm
cd watchlist
npx shadcn@latest init -y -b radix -p nova
npx shadcn@latest add button card input badge checkbox skeleton
```

🎙 **Decí:**
- "Los flags contestan solas las preguntas del instalador. Si lo corren sin
  flags les hace ocho preguntas y con que una salga distinta, el código de la
  guía no les va a andar."
- "ShadCN no es una librería que se instala. **Te copia el código adentro de tu
  proyecto.** Por eso van a ver los archivos en `components/ui/` y por eso los
  pueden editar. Es la diferencia grande con Material UI o Bootstrap."

🖥 **Mostrá:** abrí `src/components/ui/button.tsx`. Que vean que es código
normal, de ellos, editable.

❓ **Preguntá:** "¿por qué les parece que ShadCN copia el código en vez de
instalarse como dependencia?"
→ Para poder modificarlo sin pelear con la librería.

⚠️ **Si se rompe:**
- Node viejo → `node -v` tiene que decir 22+.
- Se quedó esperando en una pregunta → alguien se comió un flag al copiar.

---

## Paso 1 · La primera página ⏱ 5 min

📄 *Guía: Paso 1*

📝 **Pegá:** `src/components/site-nav.tsx`, después `src/app/layout.tsx`, y por
último `src/components/render-stamp.tsx`.

🎙 **Decí:**
- Sobre el ruteo: "**una carpeta con un `page.tsx` adentro es una ruta.**
  `app/buscar/page.tsx` es `/buscar`. No hay que registrar nada, no hay
  `react-router`, no hay archivo de rutas. El sistema de archivos *es* el router."
- Sobre el layout: "envuelve a todas las páginas y **no se vuelve a montar** al
  navegar. Por eso la barra no parpadea."
- Sobre el reloj: "esto parece un detalle tonto y es la herramienta más
  importante del día. Muestra **el momento exacto en que se generó el HTML**.
  Guarden ese dato, que en veinte minutos se vuelve importante."

🖥 **Mostrá:** navegá entre dos rutas y señalá que la barra de arriba no
parpadea. Después abrí Network y mostrá que al navegar no se recarga el
documento entero.

❓ **Preguntá:** "en el workshop de React, ¿cómo declaraban una ruta nueva?"
→ Con `react-router`, a mano. Acá es una carpeta.

⚠️ **Si se rompe:** `LayoutProps<"/">` marcado en rojo → los tipos se generan al
correr `npm run dev` la primera vez. Que arranquen el server.

---

## Paso 2 · La base de datos ⏱ 8 min

📄 *Guía: Paso 2*

📝 **Pegá:** `docker-compose.yml`, después los `npm i` de Prisma, después el
`schema.prisma`, después el `.env`, después `src/lib/prisma.ts`.

```sh
docker compose up -d db
npx prisma migrate dev --name init
npx prisma studio
```

🎙 **Decí:**
- Sobre Docker: "no se lo expliquen todavía, es una receta. Levanta un Postgres
  de verdad en su máquina. Qué es cada línea lo ven en el workshop de Docker."
- Sobre las versiones clavadas: "**esto no es un capricho.** Prisma está justo en
  medio de un cambio de versión mayor. Si ponen `npm i prisma` sin el número,
  npm les instala un candidato de la 8 que no habla con el cliente de la 7."
- Sobre el `globalThis` en `prisma.ts`: "en desarrollo Next recarga el código
  muchísimas veces. Si creáramos un cliente nuevo cada vez, abriríamos
  conexiones hasta reventar la base. Es un patrón que van a ver en todos los
  proyectos de Next con Prisma."
- Sobre el adapter: "en Prisma 7 es obligatorio. `new PrismaClient()` pelado tira
  error."

🖥 **Mostrá:** **Prisma Studio.** Abrilo y dejá esa pestaña abierta el resto de la
clase. En el Paso 7 volvemos y las filas van a estar ahí. Ver la tabla vacía
ahora hace que verla llena después valga el doble.

❓ **Preguntá:** "¿cuántos escribieron SQL para crear esa tabla?"
→ Ninguno. Lo generó Prisma desde el schema. Mostrales el archivo
`prisma/migrations/.../migration.sql`: el SQL está ahí, escrito por ellos sin
escribirlo.

⚠️ **Si se rompe** (este paso es el que más falla):

| Síntoma | Arreglo de 10 segundos |
|---|---|
| El contenedor arranca y se muere | El volumen tiene `/data` al final. **Sacáselo.** Es el error más traicionero del workshop porque todos los tutoriales de internet dicen la ruta vieja |
| `docker: command not found` | Nunca abrieron Docker Desktop. Que lo abran, la primera vez es cuando agrega el comando |
| Aparece un cartel ofreciendo Prisma 8 | **Ignorenlo.** Avisá antes de que pregunten |
| Aparecieron carpetas `.agents/`, `.claude/` | Las crea `prisma init`, son instrucciones para asistentes de IA. `rm -rf .agents .claude .windsurf skills-lock.json` |
| El archivo se llama `prisma7.config.ts` | Está bien. Las docs dicen `prisma.config.ts` pero la 7 lo crea con el 7 |

---

## Paso 3 · Populares ⏱ 10 min — 🫀 EL CORAZÓN

📄 *Guía: Paso 3*

📝 **Pegá:** `src/lib/movies.ts`, `src/lib/tmdb.ts`, `src/components/movie-card.tsx`,
`next.config.ts`, `src/app/populares/page.tsx`.

🎙 **Decí** (esto es lo más importante del día, no lo apures):

1. **El puente con el workshop de React.** "Levanten la mano los que se acuerdan
   cómo trajimos los mensajes en el workshop de React." Enumerá en voz alta:
   un controller, un serializer, un `useState`, un `useEffect`, un estado de
   cargando. "Ahora miren esto." Señalá el `await`. **"Una línea."**

2. **Por qué se puede.** "Este componente **corre en el servidor**. Nunca llega al
   navegador. Para cuando el HTML sale para tu máquina, las películas ya están
   adentro. Por eso no hace falta un estado de cargando: no hay nada que esperar."

3. **`revalidate`.** "Le pone fecha de vencimiento al HTML. Se genera una vez y se
   reusa por una hora. Pasada la hora, el primero que entre dispara la
   regeneración en segundo plano y no se entera. Eso es ISR."

4. **`server-only`.** "Esa primera línea del archivo es un seguro. Si alguien
   importa esto desde un componente de navegador, **el build falla** en vez de
   mandarle el token de TMDB a cualquiera que abra la página. Una línea que les
   evita un problema de seguridad de verdad."

🖥 **Mostrá — esto es lo que hay que ver, no escuchar:**
1. Abrí **DevTools → Network**, filtrá por `Fetch/XHR`, recargá.
   **No hay ningún pedido a TMDB.** Dejá el silencio un segundo.
2. Después **click derecho → Ver código fuente de la página**. Buscá el título de
   una película: **está en el HTML crudo**. "Esto es lo que ve Google. Con una
   app de React pura, acá habría un div vacío."

❓ **Preguntá:** "si el navegador nunca le pidió nada a TMDB… ¿dónde quedó el
token?"
→ Nunca salió del servidor. Ese es el punto entero.

⚠️ **Si se rompe:**

| Síntoma | Arreglo |
|---|---|
| Los pósters no cargan y la consola habla de hostnames | Falta `remotePatterns` en `next.config.ts`. **Es el error más común de todo el workshop** |
| `Falta TMDB_ACCESS_TOKEN` | El `.env` está vacío |
| TMDB responde 401 | Copiaron la "API Key" corta en vez del **Read Access Token** largo. Pasa muchísimo |
| Cambiaron el `.env` y sigue fallando | Hay que reiniciar `npm run dev`. El `.env` se lee al arrancar |

---

## Paso 4 · El filtro ⏱ 8 min — 🫀 EL CORAZÓN

📄 *Guía: Paso 4*

📝 **Pegá:** `src/components/movie-filter.tsx` y cambiá el grid de
`populares/page.tsx` por `<MovieFilter movies={movies} />`.

🎙 **Decí:**
- "Todo lo anterior corrió en el servidor. Pero el servidor no se entera de que
  vos estás tecleando. Para eso necesitamos código en el navegador."
- **Sobre `"use client"`:** "no significa 'esto corre solo en el cliente'.
  Significa **'de acá para abajo, el código también viaja al navegador'**. Es un
  límite, no un lugar."
- **Lo que más cuesta entender:** "fíjense que las películas **no se piden acá**.
  Ya vinieron resueltas del servidor, como una prop. El componente de cliente
  solo agrega interactividad **encima** de datos que ya existían. Ese reparto es
  el modelo mental de Next entero."
- **Sobre `MovieCard`:** "no tiene ninguna directiva y funciona en los dos lados.
  La regla es: un componente sin directiva se adapta a quien lo use."
- **Sobre el `if (!hora) return null`:** "esto no es un detalle de estilo. Si
  pintáramos la hora directo, el servidor diría una hora y el navegador otra, y
  React tiraría un **error de hidratación**. Es de los errores más comunes
  cuando arrancás con Next, y ahora saben por qué pasa."

🖥 **Mostrá — el mejor momento visual del workshop:**
Los **dos relojes juntos en la misma pantalla**. Señalalos con el cursor:
- el de arriba (ISR) **está congelado**
- el de abajo (CSR) **avanza segundo a segundo**

"Misma página, dos relojes, dos momentos distintos. Arriba se generó una vez en
el build. Abajo está corriendo en tu máquina ahora mismo."

Después escribí en el filtro y señalá que **la URL no cambia y la página no se
recarga**.

❓ **Preguntá:** "si le pongo `"use client"` a la página de populares, ¿se rompe
algo?"
→ Sí: el `await` a TMDB pasaría al navegador, y con él el token. Por eso el
patrón es **servidor afuera, cliente adentro**.

⚠️ **Si se rompe:** "You're importing a component that needs useState" → le
faltó el `"use client"` arriba de todo, antes de los imports.

---

## Paso 5 · El detalle ⏱ 7 min — ✂️ recortable

📄 *Guía: Paso 5*

📝 **Pegá:** `src/app/pelicula/[id]/page.tsx`, `loading.tsx`, `not-found.tsx`,
**`src/app/not-found.tsx`** (el de la raíz) y `getMovie` en `tmdb.ts`.

🎙 **Decí:**
- "Los corchetes en el nombre de la carpeta la vuelven un parámetro."
- **`generateStaticParams`:** "le dice a Next qué ids conoce de antemano para que
  genere esas páginas **durante el build**. Las 20 populares quedan hechas. Si
  alguien entra a una que no está en la lista, la genera en ese momento y la
  guarda para la próxima."
- **`params` es una Promise:** "en Next 16 hay que hacerle `await`. Si se lo
  olvidan, `id` sale `undefined` y explota. Es un cambio nuevo: si buscan
  tutoriales viejos van a ver que lo usan directo."
- **`loading.tsx`:** "si el archivo se llama así, Next lo muestra solo mientras
  la página carga. **No escribimos ni un `if (cargando)`.**"

🖥 **Mostrá:** entrá a [/pelicula/999999999](http://localhost:3000/pelicula/999999999)
y que vean el 404 de películas. Después a `/una-ruta-cualquiera` y que vean que
sale otro distinto, el general.

❓ **Preguntá:** "¿cuántas páginas de detalle se van a generar en el build?"
→ 20. Y en el Paso 8 lo vamos a ver escrito en la tabla.

⚠️ **Si se rompe:**

| Síntoma | Arreglo |
|---|---|
| `id` es `undefined` | Falta el `await params` |
| Sale el 404 gris de Next en vez del suyo | **Falta `src/app/not-found.tsx` en la raíz.** El de la sección solo funciona si existe el de la raíz. Es un comportamiento que no está documentado de forma evidente y no avisa: falla en silencio |

---

## Paso 6 · La búsqueda ⏱ 5 min — ✂️ recortable

📄 *Guía: Paso 6*

📝 **Pegá:** `src/components/search-box.tsx`, `src/app/buscar/page.tsx`, y
`searchMovies` en `tmdb.ts`.

🎙 **Decí:**
- "Esta página lee `searchParams`, o sea que **depende del pedido**. Next no
  puede generarla en el build porque no sabe qué van a buscar ustedes. Así que la
  arma entera, en cada visita. Eso es SSR."
- Sobre el `<Suspense>`: "no es decorativo. `useSearchParams` lo necesita. Sin
  eso, `npm run build` les falla. Es una de esas reglas que se aprenden a los
  golpes."

🖥 **Mostrá — el cierre del hilo conductor, no te lo saltees:**

Abrí **dos pestañas lado a lado**: `/populares` y `/buscar`.
Apretá **F5 en las dos, tres o cuatro veces**, alternando.

- El reloj de `/populares` **no se mueve**.
- El de `/buscar` **cambia siempre**.

Y decí: *"Eso es, en una imagen, toda la diferencia entre generar el HTML una vez
y generarlo en cada visita."*

Dejá que se vea. No lo tapes hablando.

❓ **Preguntá:** "¿por qué el de populares no cambia si estoy recargando?"
→ Porque ese HTML ya existía desde el build. El servidor no está renderizando
nada: te está mandando un archivo.

⚠️ **Si se rompe:** en `npm run dev` la diferencia se nota menos, porque en
desarrollo Next regenera casi todo. **La demostración honesta es contra
`npm run build && npm start`.** Si tenés tiempo, hacela ahí.

---

## Paso 7 · Server Actions ⏱ 10 min — 🫀 EL CORAZÓN

📄 *Guía: Paso 7*

📝 **Pegá:** `src/actions/watchlist.ts`, `src/components/add-to-watchlist-form.tsx`,
el `<AddToWatchlistForm/>` en la página de detalle,
`src/components/watchlist-item.tsx` y `src/app/watchlist/page.tsx`.

🎙 **Decí:**

1. **Arrancá por lo que NO hay.** "Hasta acá solo leímos. Ahora vamos a escribir
   en la base. Presten atención a lo que **no** vamos a hacer: no vamos a crear
   un endpoint, no vamos a escribir una URL, no vamos a hacer `fetch`, no vamos a
   hacer `JSON.parse`. Nada."

2. **`"use server"`:** "convierte a cada función de este archivo en algo que corre
   **siempre** en el servidor, pero que un componente de navegador puede llamar
   **como si fuera una función local**. Next arma el `fetch` y el POST por
   debajo."

3. **`revalidatePath`:** "le avisa a Next que el HTML de `/watchlist` quedó viejo.
   Si borran esa línea, agregan una película y la lista no se actualiza. Es el
   olvido número uno con Server Actions."

4. **`useFormStatus`:** "solo funciona en un componente que esté **adentro** del
   `<form>`. Por eso el botón está separado y no escrito ahí nomás. Confunde a
   todo el mundo la primera vez."

5. **`useOptimistic`, el más lindo:** "cuando marcás el checkbox, la acción tarda
   unos milisegundos en ir al servidor, escribir en Postgres y volver.
   `useOptimistic` te deja **pintar el resultado antes de que el servidor
   conteste**. Y si falla, React vuelve solo al valor real."

🖥 **Mostrá — el cierre del workshop:**
1. Agregá una película desde el detalle. Aparece el mensaje de la action.
2. Andá a `/watchlist`: está.
3. Marcala como vista. **Que se vea que el tilde responde instantáneo.**
4. **Volvé a la pestaña de Prisma Studio del Paso 2 y refrescá.** La fila está
   ahí, con `watched` en `true`. "Esto es Postgres de verdad, en un contenedor,
   con los datos que acabás de escribir."

Ese ida y vuelta entre la interfaz y la tabla es lo que cierra la clase.

❓ **Preguntá:** "¿cuántos endpoints escribimos hoy?"
→ Cero.

⚠️ **Si se rompe:**

| Síntoma | Arreglo |
|---|---|
| `ECONNREFUSED` | Se les cayó Postgres → `docker compose up -d db` |
| Agregan y la lista no cambia | Falta `revalidatePath` |
| "useFormStatus must be used within a form" | El botón no está adentro del `<form>` |
| Agregan dos veces la misma y da error | Está bien, es el `@unique` del schema. Buen momento para mostrar que la action lo maneja |

---

## Paso 8 · El build ⏱ 5 min

📄 *Guía: Paso 8*

📝 **Pegá:**

```sh
npm run build
```

🖥 **Mostrá:** la tabla de rutas, en grande. Andá señalando con el cursor
mientras hablás:

```
○ /                    ← estática
○ /populares      1h   ← estática + el ISR que configuramos
● /pelicula/[id]  1d   ← las 20 que generó generateStaticParams
ƒ /buscar              ← dinámica
ƒ /watchlist           ← dinámica
```

🎙 **Decí:**
- "Esta tabla es el resumen de todo lo que hicimos hoy, escrito por la
  herramienta."
- Señalá el `1h` de populares: "ahí está el `revalidate` que pusimos."
- Señalá los `●`: "esas son las 20 páginas de detalle. Existen como archivos."
- **El remate:** "y ahora lo importante. **Nosotros nunca elegimos esto desde un
  menú de configuración.** Next lo dedujo de cómo escribimos el código: si leés
  `searchParams` o consultás la base, sos dinámico. Si no, sos estático. El tipo
  de renderizado es una **consecuencia** de lo que escribiste, no una decisión
  aparte."

❓ **Preguntá:** "¿por qué `/watchlist` es dinámica?"
→ Porque consulta la base, y esos datos cambian.

**Cerrá con:** el cheat sheet del final de la guía (la tabla de "¿cuál uso?").
Decíles que esa tabla es lo único que necesitan recordar hoy; el resto se
googlea.

---

## Preguntas que te van a hacer

**"¿Esto reemplaza a React?"**
No. Next *es* React, con un servidor adelante y un montón de decisiones ya
tomadas (ruteo, bundling, imágenes, caché).

**"¿Y si necesito una API para una app móvil?"**
Ahí sí necesitás endpoints de verdad: son los Route Handlers (`route.ts`). Las
Server Actions son para tu propio frontend.

**"¿Puedo usar `useEffect` para traer datos igual que antes?"**
Podés, y a veces hace falta. Pero si el dato se puede traer en el servidor,
traerlo en el servidor es más rápido y no expone tus credenciales.

**"¿Por qué `params` es una Promise? Es horrible."**
Para que Next pueda empezar a renderizar lo que no depende del parámetro
mientras el parámetro se resuelve. Es feo y es a propósito.

**"¿Cuál conviene usar en el proyecto de PIS?"**
La regla corta: estático por defecto, dinámico solo cuando el contenido depende
del usuario o del momento. Si dudás, empezá estático: es más difícil que ande
mal.

**"¿Prisma o escribir SQL?"**
Para el proyecto de PIS, un ORM les va a ahorrar tiempo. Pero el SQL que genera
está en `prisma/migrations/` y conviene leerlo.

---

## Si todo se prende fuego

```sh
git clone -b next-v2-solution <url-del-repo> solucion
```

Está la app entera, terminada y andando. Copiá el archivo que necesites y seguí.
Perder dos minutos en copiar es infinitamente mejor que perder quince
depurando en vivo con treinta personas mirando.
