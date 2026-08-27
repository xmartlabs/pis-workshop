import { MovieFilter } from "@/components/movie-filter";
import { RenderStamp } from "@/components/render-stamp";
import { getPopularMovies } from "@/lib/tmdb";

// `revalidate` le pone fecha de vencimiento al HTML: se genera en el build y
// se reusa por 3600 segundos. Pasada la hora, el primero que entre dispara la
// regeneracion en segundo plano. Eso es ISR.
export const revalidate = 3600;

// Fijate que el componente es `async` y hace `await` directo adentro. No hay
// useState, no hay useEffect, no hay estado de "cargando": cuando el HTML
// llega al browser, las peliculas ya estan en el.
export default async function PopularesPage() {
  const movies = await getPopularMovies();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Peliculas populares
        </h1>
        <p className="text-muted-foreground text-sm">
          Estos datos los trajo el server desde TMDB. Abri las herramientas de
          desarrollo, pestana Network, y recarga: no vas a ver ningun pedido a
          TMDB. Ya venia todo en el HTML.
        </p>
        <RenderStamp mode="ISR" />
      </header>

      {/* El filtro es un componente cliente. Le pasamos las peliculas ya
          resueltas como prop: eso es el limite server -> cliente. */}
      <MovieFilter movies={movies} />
    </div>
  );
}
