import Link from "next/link";

import { Button } from "@/components/ui/button";

// Se muestra cuando la página llama a notFound().
export default function NotFound() {
  return (
    <div className="space-y-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Esa película no existe</h1>
      <p className="text-muted-foreground text-sm">
        TMDB no tiene nada con ese id.
      </p>
      <Button asChild variant="outline">
        <Link href="/populares">Volver a populares</Link>
      </Button>
    </div>
  );
}
