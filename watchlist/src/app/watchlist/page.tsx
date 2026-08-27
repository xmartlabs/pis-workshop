import { WatchlistItem } from "@/components/watchlist-item";
import { prisma } from "@/lib/prisma";

// Tu watchlist cambia cuando vos la cambias, asi que no tiene sentido
// congelarla en el build: la armamos en cada visita.
export const dynamic = "force-dynamic";

export default async function WatchlistPage() {
  // Consulta directa a Postgres desde el componente. Sin fetch, sin endpoint,
  // sin useEffect. Esto corre en el server y nunca llega al browser.
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
            Todavia no agregaste nada. Anda a{" "}
            <a href="/populares" className="underline">
              Populares
            </a>
            , entra a una pelicula y agregala.
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
