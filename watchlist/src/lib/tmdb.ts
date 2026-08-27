// Esta linea es un seguro: si alguien importa este archivo desde un componente
// cliente, el build FALLA con un mensaje claro en vez de mandar el token al
// browser sin que nos demos cuenta.
import "server-only";

import type { Movie, MovieDetail } from "@/lib/movies";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

type MovieListResponse = {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
};

type FetchOptions = {
  /** Segundos hasta que Next considere vieja la respuesta. `0` = nunca cachear. */
  revalidate?: number;
};

async function tmdbFetch<T>(
  path: string,
  { revalidate }: FetchOptions = {},
): Promise<T> {
  const token = process.env.TMDB_ACCESS_TOKEN;

  if (!token) {
    throw new Error(
      "Falta TMDB_ACCESS_TOKEN en el archivo .env. Ver el Paso 0 de la guia.",
    );
  }

  const response = await fetch(`${TMDB_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      accept: "application/json",
    },
    // Aca se decide el tipo de renderizado de la pagina que use este fetch:
    //   revalidate: 3600 -> se genera y se reusa por 1 hora (ISR)
    //   revalidate: 0    -> se pide de nuevo en cada request (SSR)
    ...(revalidate === 0
      ? { cache: "no-store" as const }
      : { next: { revalidate } }),
  });

  if (!response.ok) {
    throw new Error(`TMDB respondio ${response.status} para ${path}`);
  }

  return response.json() as Promise<T>;
}

/** Peliculas populares. Cacheadas 1 hora: la pagina es estatica con ISR. */
export async function getPopularMovies(): Promise<Movie[]> {
  const data = await tmdbFetch<MovieListResponse>(
    "/movie/popular?language=es-ES&page=1",
    { revalidate: 3600 },
  );
  return data.results;
}

/** Detalle de una pelicula. Cacheado un dia: estos datos casi no cambian. */
export async function getMovie(id: number): Promise<MovieDetail | null> {
  try {
    return await tmdbFetch<MovieDetail>(`/movie/${id}?language=es-ES`, {
      revalidate: 86400,
    });
  } catch {
    return null;
  }
}

/** Busqueda. Sin cache: cada request trae resultados frescos (SSR). */
export async function searchMovies(query: string): Promise<Movie[]> {
  if (!query.trim()) return [];

  const data = await tmdbFetch<MovieListResponse>(
    `/search/movie?language=es-ES&query=${encodeURIComponent(query)}`,
    { revalidate: 0 },
  );
  return data.results;
}
