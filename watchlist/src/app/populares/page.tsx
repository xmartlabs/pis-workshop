import { MovieFilter } from "@/components/movie-filter";
import { RenderStamp } from "@/components/render-stamp";
import { getPopularMovies } from "@/lib/tmdb";

// `revalidate` le pone fecha de vencimiento al HTML: se genera en el build y
// se reusa por 3600 segundos. Pasada la hora, el primero que entre dispara la
// regeneracion en segundo plano. Eso es ISR.
export const revalidate = 3600;

// Fijate que el componente es `async` y hace `await` directo adentro. No hay
// useState, no hay useEffect, no hay estado de "cargando": cuando el HTML
// llega al browser, las películas ya están en él.
export default async function PopularesPage() {
  const movies = await getPopularMovies();

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Películas populares
        </h1>
        <p className="text-muted-foreground text-sm">
          Estos datos los trajo el server desde TMDB. Abrí las herramientas de
          desarrollo, pestaña Network, y recargá: no vas a ver ningún pedido a
          TMDB. Ya venia todo en el HTML.
        </p>
        <RenderStamp mode="ISR" />
      </header>

      {/* El filtro es un componente cliente. Le pasamos las películas ya
          resueltas como prop: eso es el límite server -> cliente. */}
      <MovieFilter movies={movies} />
    </div>
  );
}
