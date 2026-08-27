import Link from "next/link";

import { RenderStamp } from "@/components/render-stamp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Esta pagina no pide datos a nadie. Next se da cuenta y la genera UNA vez,
// durante `npm run build`. Despues cada visita recibe ese HTML ya hecho.
// Por eso el reloj de abajo queda congelado por mas que recargues.

const modos = [
  {
    href: "/populares",
    titulo: "Populares",
    sigla: "SSG + ISR",
    detalle:
      "El HTML se arma en el build y se reusa. Se regenera solo una vez por hora.",
  },
  {
    href: "/buscar",
    titulo: "Buscar",
    sigla: "SSR",
    detalle:
      "Depende de lo que escribas en la URL, asi que se arma en cada request.",
  },
  {
    href: "/watchlist",
    titulo: "Mi watchlist",
    sigla: "Server Actions",
    detalle:
      "Lee y escribe en Postgres sin que escribamos un solo endpoint a mano.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Watchlist de pelis
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Una app chiquita para ver, en vivo, las tres formas que tiene Next de
          armar una pagina. Los datos salen de la API de TMDB y tu watchlist
          vive en una base Postgres.
        </p>
        <RenderStamp mode="SSG" />
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {modos.map((modo) => (
          <Link key={modo.href} href={modo.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <p className="text-muted-foreground font-mono text-xs">
                  {modo.sigla}
                </p>
                <CardTitle>{modo.titulo}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                {modo.detalle}
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>

      <section className="bg-muted/40 rounded-lg border p-5">
        <h2 className="mb-2 font-medium">El experimento</h2>
        <p className="text-muted-foreground text-sm">
          Abri esta pagina y <code>/buscar</code> en dos pestanas y apreta F5 en
          las dos. El reloj de esta se queda quieto; el de la otra cambia
          siempre. Ahi esta, en una linea, toda la diferencia entre generar el
          HTML una vez y generarlo en cada visita.
        </p>
      </section>
    </div>
  );
}
