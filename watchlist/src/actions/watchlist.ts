"use server";

import { revalidatePath } from "next/cache";

import type { WatchlistInput } from "@/lib/movies";
import { prisma } from "@/lib/prisma";

export type ActionResult = {
  ok: boolean;
  message: string;
};

export async function addToWatchlist(
  pelicula: WatchlistInput,
): Promise<ActionResult> {
  // Siempre validar lo que llega del server aunque sea todo interno
  if (!pelicula.movieId || !pelicula.title) {
    return { ok: false, message: "Faltan datos de la película." };
  }

  try {
    await prisma.watchlistItem.create({
      data: {
        movieId: pelicula.movieId,
        title: pelicula.title,
        posterPath: pelicula.posterPath,
        releaseDate: pelicula.releaseDate,
        voteAverage: pelicula.voteAverage,
      },
    });
  } catch {
    return { ok: false, message: "Esa película ya estaba en tu watchlist." };
  }

  revalidatePath("/watchlist");

  return { ok: true, message: `"${pelicula.title}" agregada.` };
}


export async function toggleWatched(id: number, watched: boolean) {
  await prisma.watchlistItem.update({
    where: { id },
    data: { watched },
  });

  revalidatePath("/watchlist");
}

export async function removeFromWatchlist(id: number) {
  await prisma.watchlistItem.delete({ where: { id } });

  revalidatePath("/watchlist");
}
