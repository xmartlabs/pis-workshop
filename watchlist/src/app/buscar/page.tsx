import { Suspense } from "react";

import { MovieCard } from "@/components/movie-card";
import { RenderStamp } from "@/components/render-stamp";
import { SearchBox } from "@/components/search-box";
import { searchMovies } from "@/lib/tmdb";

// Esta página lee `searchParams`, o sea que depende del request. Next no puede
// generarla en el build (no sabe que va a buscar la gente), así que la arma
// entera en cada visita. Eso es SSR.
//
// `searchParams` es una Promise: hay que await-earla.
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
        <p className="text-muted-foreground text-sm">
          Recarga esta página con F5 y mira el reloj: cambia siempre, porque el
          HTML se genera de nuevo en cada visita.
        </p>
        <RenderStamp mode="SSR" />
      </header>

      {/* useSearchParams necesita estar adentro de un <Suspense>. Sin esto,
          Next se queja al hacer el build. */}
      <Suspense fallback={null}>
        <SearchBox />
      </Suspense>

      {q ? (
        <p className="text-muted-foreground text-sm">
          {movies.length} resultado{movies.length === 1 ? "" : "s"} para “{q}”
        </p>
      ) : (
        <p className="text-muted-foreground text-sm">
          Escribí algo arriba para buscar en TMDB.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}
