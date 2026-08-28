import Link from "next/link";

import { Button } from "@/components/ui/button";

// El 404 general de la app. Se muestra cuando alguien entra a una URL que no
// existe.
//
// Ojo con esto, que no es obvio: este archivo tiene que existir para que los
// not-found.tsx de las secciones (como el de pelicula/[id]) funcionen. Si no
// está, Next ignora los de abajo y muestra su 404 por defecto.
export default function NotFound() {
  return (
    <div className="space-y-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Esta página no existe</h1>
      <p className="text-muted-foreground text-sm">
        Puede que el link esté mal escrito.
      </p>
      <Button asChild variant="outline">
        <Link href="/">Ir al inicio</Link>
      </Button>
    </div>
  );
}
