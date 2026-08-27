// Tipos y helpers de peliculas que SI pueden viajar al browser.
// Aca no hay ningun secreto: solo formas de datos y armado de URLs.

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

export const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

/** Arma la URL de un poster. `size` puede ser w200, w500, original, etc. */
export function posterUrl(path: string | null, size = "w500") {
  if (!path) return null;
  return `${IMAGE_BASE_URL}/${size}${path}`;
}

/** "2024-03-15" -> "2024". Devuelve null si TMDB no tiene la fecha. */
export function releaseYear(date: string | undefined | null) {
  if (!date) return null;
  return date.slice(0, 4);
}
