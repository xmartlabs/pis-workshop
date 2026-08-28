import { WatchlistItem } from "@/components/watchlist-item";
import { prisma } from "@/lib/prisma";

// Tu watchlist cambia cuando el usuario agrega o saca películas, así que no podemos
// congelarla en el build, por lo tanto la armamos en cada visita
export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  // Consulta directa a Postgres desde el componente. Sin fetch, sin endpoint.
  // Les dejo esto acá para que vean que se puede, pero en la práctica 
  // conviene separar la consulta a la DB en un archivo aparte 
  const items = await prisma.watchlistItem.findMany({
    orderBy: { createdAt: "desc" },
  });

  const vistas = items.filter((item) => item.watched).length;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Mi watchlist</h1>
        {items.length > 0 ? (
          <p className="text-muted-foreground text-sm">
            {vistas} de {items.length} vistas
          </p>
        ) : null}
      </header>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="text-muted-foreground text-sm">
            Todavía no agregaste nada. Andá a{" "}
            <a href="/populares" className="underline">
              Populares
            </a>
            , entra a una película y agregala.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <WatchlistItem
              key={item.id}
              item={{
                id: item.id,
                movieId: item.movieId,
                title: item.title,
                releaseDate: item.releaseDate,
                watched: item.watched,
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
