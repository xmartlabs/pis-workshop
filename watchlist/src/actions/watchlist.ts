// "use server" convierte a cada funcion exportada de este archivo en una
// Server Action: codigo que corre SIEMPRE en el server, pero que un componente
// cliente puede llamar como si fuera una funcion local.
//
// Next se encarga por debajo del fetch, del POST y de serializar los datos.
// Nunca escribimos un endpoint, ni una URL, ni un JSON.parse.
"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export type ActionState = {
  ok: boolean;
  message: string;
} | null;

/**
 * Agrega una pelicula a la watchlist.
 *
 * La firma (estadoAnterior, formData) es la que espera el hook
 * `useActionState`: recibe el estado que devolvio la ejecucion anterior y el
 * contenido del formulario.
 */
export async function addToWatchlist(
  _estadoAnterior: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const movieId = Number(formData.get("movieId"));
  const title = String(formData.get("title") ?? "");

  if (!movieId || !title) {
    return { ok: false, message: "Faltan datos de la pelicula." };
  }

  const voteAverage = Number(formData.get("voteAverage"));

  try {
    await prisma.watchlistItem.create({
      data: {
        movieId,
        title,
        posterPath: (formData.get("posterPath") as string) || null,
        releaseDate: (formData.get("releaseDate") as string) || null,
        voteAverage: Number.isFinite(voteAverage) ? voteAverage : null,
      },
    });
  } catch {
    // El campo movieId es @unique en el schema, asi que si ya estaba
    // guardada Prisma tira error. Lo tratamos como un caso normal.
    return { ok: false, message: "Esa pelicula ya estaba en tu watchlist." };
  }

  // Le avisamos a Next que el HTML cacheado de /watchlist quedo viejo.
  // Sin esta linea la lista seguiria mostrando los datos anteriores.
  revalidatePath("/watchlist");

  return { ok: true, message: `"${title}" agregada.` };
}

/** Marca o desmarca una pelicula como vista. */
export async function toggleWatched(id: number, watched: boolean) {
  await prisma.watchlistItem.update({
    where: { id },
    data: { watched },
  });

  revalidatePath("/watchlist");
}

/** Saca una pelicula de la watchlist. */
export async function removeFromWatchlist(id: number) {
  await prisma.watchlistItem.delete({ where: { id } });

  revalidatePath("/watchlist");
}
