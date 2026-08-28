"use client";

import { Trash2 } from "lucide-react";
import { useOptimistic, useTransition } from "react";

import { removeFromWatchlist, toggleWatched } from "@/actions/watchlist";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export type WatchlistItemData = {
  id: number;
  movieId: number;
  title: string;
  releaseDate: string | null;
  watched: boolean;
};

export function WatchlistItem({ item }: { item: WatchlistItemData }) {
  const [isPending, startTransition] = useTransition();

  const [vistaOptimista, setVistaOptimista] = useOptimistic(item.watched);

  function alMarcar(nuevoValor: boolean) {
    startTransition(async () => {
      setVistaOptimista(nuevoValor);
      await toggleWatched(item.id, nuevoValor);
    });
  }

  function alBorrar() {
    startTransition(async () => {
      await removeFromWatchlist(item.id);
    });
  }

  return (
    <li
      className={`flex items-center gap-3 rounded-lg border p-3 ${
        isPending ? "opacity-60" : ""
      }`}
    >
      <Checkbox
        checked={vistaOptimista}
        onCheckedChange={(valor) => alMarcar(valor === true)}
        aria-label={`Marcar ${item.title} como vista`}
      />

      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-medium ${
            vistaOptimista ? "text-muted-foreground line-through" : ""
          }`}
        >
          {item.title}
        </p>
        {item.releaseDate ? (
          <p className="text-muted-foreground text-xs">
            {item.releaseDate.slice(0, 4)}
          </p>
        ) : null}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={alBorrar}
        aria-label={`Sacar ${item.title} de la watchlist`}
      >
        <Trash2 className="size-4" />
      </Button>
    </li>
  );
}
