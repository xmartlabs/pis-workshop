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

/**
 * Los datos que le mandamos al server para guardar una película.
 *
 * Es a propósito más chico que MovieDetail: de todo lo que trae TMDB, esto es
 * lo único que nos interesa guardar. Vive acá porque lo usan los dos lados: el
 * componente del browser para armarlo y la Server Action para recibirlo.
 */
export type WatchlistInput = {
  movieId: number;
  title: string;
  posterPath: string | null;
  releaseDate: string | null;
  voteAverage: number | null;
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
