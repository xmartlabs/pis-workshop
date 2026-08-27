"use client";

import { useEffect, useState } from "react";

import { MovieCard } from "@/components/movie-card";
import { Input } from "@/components/ui/input";
import type { Movie } from "@/lib/movies";

// "use client" marca el limite: de aca para abajo el codigo tambien viaja al
// browser y puede usar estado, eventos y APIs del navegador.
//
// Las peliculas NO se piden aca. Ya vinieron listas desde el server, como una
// prop. Este componente solo agrega interactividad encima de esos datos.
export function MovieFilter({ movies }: { movies: Movie[] }) {
  const [query, setQuery] = useState("");

  const visibles = movies.filter((movie) =>
    movie.title.toLowerCase().includes(query.toLowerCase().trim()),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Filtrar las que ya bajaron del server…"
          className="max-w-xs"
        />
        <ClientClock />
      </div>

      <p className="text-muted-foreground text-sm">
        Mostrando {visibles.length} de {movies.length}
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {visibles.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      {visibles.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          Ninguna coincide con “{query}”.
        </p>
      ) : null}
    </div>
  );
}

// Este reloj corre EN EL BROWSER y se actualiza solo cada segundo.
// Compara con el <RenderStamp/> de arriba, que quedo congelado en el build:
// esa es la diferencia entre renderizar en el server y en el cliente.
function ClientClock() {
  const [hora, setHora] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setHora(new Date().toLocaleTimeString("es-UY"));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // En el primer render (el del server) devolvemos null. Si pintaramos la hora
  // directo, el HTML del server y el del browser no coincidirian y React
  // tiraria un error de hidratacion.
  if (!hora) return null;

  return (
    <p className="text-muted-foreground font-mono text-xs">
      <span className="text-foreground font-semibold">CSR</span> · corriendo en
      tu browser · {hora}
    </p>
  );
}
