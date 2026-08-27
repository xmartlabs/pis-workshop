import Image from "next/image";
import { notFound } from "next/navigation";

import { AddToWatchlistForm } from "@/components/add-to-watchlist-form";
import { Badge } from "@/components/ui/badge";
import { posterUrl, releaseYear } from "@/lib/movies";
import { getMovie, getPopularMovies } from "@/lib/tmdb";

// generateStaticParams le dice a Next que ids conoce de antemano, para que
// genere esas paginas durante el build. Las 20 populares quedan listas.
//
// Si alguien entra a una pelicula que NO esta en esta lista, Next la genera en
// ese momento y la guarda para el proximo. Eso tambien es ISR.
export async function generateStaticParams() {
  const movies = await getPopularMovies();

  return movies.slice(0, 20).map((movie) => ({
    id: String(movie.id),
  }));
}

// Esto arma el <title> de la pestana y los metadatos para compartir el link.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movie = await getMovie(Number(id));

  return {
    title: movie ? `${movie.title} · Watchlist` : "Pelicula no encontrada",
  };
}

export default async function PeliculaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // En Next 16 `params` es una Promise. Si te olvidas del await, `id` sale
  // undefined y la pagina explota.
  const { id } = await params;
  const movie = await getMovie(Number(id));

  // notFound() corta el render y muestra el archivo not-found.tsx.
  if (!movie) notFound();

  const poster = posterUrl(movie.poster_path, "w500");
  const year = releaseYear(movie.release_date);

  return (
    <article className="space-y-6">
      <div className="grid gap-8 sm:grid-cols-[220px_1fr]">
        <div className="bg-muted relative aspect-[2/3] overflow-hidden rounded-lg">
          {poster ? (
            <Image
              src={poster}
              alt={`Poster de ${movie.title}`}
              fill
              sizes="220px"
              className="object-cover"
              priority
            />
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {movie.title}{" "}
              {year ? (
                <span className="text-muted-foreground font-normal">
                  ({year})
                </span>
              ) : null}
            </h1>

            {movie.tagline ? (
              <p className="text-muted-foreground text-sm italic">
                {movie.tagline}
              </p>
            ) : null}

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
          </div>

          {movie.overview ? (
            <p className="text-sm leading-relaxed">{movie.overview}</p>
          ) : (
            <p className="text-muted-foreground text-sm">
              TMDB no tiene sinopsis en espanol para esta.
            </p>
          )}

          <AddToWatchlistForm movie={movie} />
        </div>
      </div>

      {/* Aca NO ponemos un <RenderStamp/>. Toda Server Action vuelve a
          renderizar la pagina en la que estas, asi que el reloj se
          actualizaria al agregar la pelicula y parecerian datos frescos
          cuando en realidad la pagina si es estatica. Los relojes viven en
          /populares y /buscar, que es donde la comparacion es honesta. */}
    </article>
  );
}
