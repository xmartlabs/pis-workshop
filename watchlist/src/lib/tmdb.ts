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
    ...(revalidate === 0
      ? { cache: "no-store" as const }
      : { next: { revalidate } }),
  });

  if (!response.ok) {
    throw new Error(`TMDB respondió ${response.status} para ${path}`);
  }

  return response.json() as Promise<T>;
}

export async function getPopularMovies(): Promise<Movie[]> {
  const data = await tmdbFetch<MovieListResponse>(
    "/movie/popular?language=es-ES&page=1",
    { revalidate: 3600 },
  );
  return data.results;
}

export async function getMovie(id: number): Promise<MovieDetail | null> {
  try {
    return await tmdbFetch<MovieDetail>(`/movie/${id}?language=es-ES`, {
      revalidate: 86400,
    });
  } catch {
    return null;
  }
}

export async function searchMovies(query: string): Promise<Movie[]> {
  if (!query.trim()) return [];

  const data = await tmdbFetch<MovieListResponse>(
    `/search/movie?language=es-ES&query=${encodeURIComponent(query)}`,
    { revalidate: 0 },
  );
  return data.results;
}
