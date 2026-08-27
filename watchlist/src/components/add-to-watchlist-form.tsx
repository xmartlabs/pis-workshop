"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { addToWatchlist, type ActionState } from "@/actions/watchlist";
import { Button } from "@/components/ui/button";
import type { MovieDetail } from "@/lib/movies";

export function AddToWatchlistForm({ movie }: { movie: MovieDetail }) {
  // useActionState conecta el formulario con la Server Action y nos guarda
  // lo que la action devolvio, para poder mostrar un mensaje.
  const [state, formAction] = useActionState<ActionState, FormData>(
    addToWatchlist,
    null,
  );

  return (
    <form action={formAction} className="space-y-2">
      {/* Mandamos los datos de la pelicula en campos ocultos para no tener
          que volver a pedirselos a TMDB del lado del server. */}
      <input type="hidden" name="movieId" value={movie.id} />
      <input type="hidden" name="title" value={movie.title} />
      <input type="hidden" name="posterPath" value={movie.poster_path ?? ""} />
      <input
        type="hidden"
        name="releaseDate"
        value={movie.release_date ?? ""}
      />
      <input type="hidden" name="voteAverage" value={movie.vote_average} />

      <SubmitButton />

      {state ? (
        <p
          className={
            state.ok
              ? "text-sm text-green-600 dark:text-green-500"
              : "text-destructive text-sm"
          }
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

// useFormStatus solo funciona en un componente que este ADENTRO del <form>.
// Por eso el boton es un componente aparte y no parte del de arriba.
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando…" : "Agregar a mi watchlist"}
    </Button>
  );
}
