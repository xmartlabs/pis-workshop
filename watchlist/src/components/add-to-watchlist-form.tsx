"use client";

import { type SubmitEvent, useState } from "react";

import { addToWatchlist, type ActionResult } from "@/actions/watchlist";
import { Button } from "@/components/ui/button";
import type { MovieDetail } from "@/lib/movies";

export function AddToWatchlistForm({ movie }: { movie: MovieDetail }) {
  const [guardando, setGuardando] = useState(false);
  const [resultado, setResultado] = useState<ActionResult | null>(null);

  async function alEnviar(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault();

    setGuardando(true);
    setResultado(null);

    // `addToWatchlist` corre en el server, pero se llama como cualquier función async
    const respuesta = await addToWatchlist({
      movieId: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      releaseDate: movie.release_date,
      voteAverage: movie.vote_average,
    });

    setResultado(respuesta);
    setGuardando(false);
  }

  return (
    <form onSubmit={alEnviar} className="space-y-2">
      <Button type="submit" disabled={guardando}>
        {guardando ? "Guardando…" : "Agregar a mi watchlist"}
      </Button>

      {resultado ? (
        <p
          className={
            resultado.ok
              ? "text-sm text-green-600 dark:text-green-500"
              : "text-destructive text-sm"
          }
        >
          {resultado.message}
        </p>
      ) : null}
    </form>
  );
}
