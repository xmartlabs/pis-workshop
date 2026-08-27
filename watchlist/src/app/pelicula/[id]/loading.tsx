import { Skeleton } from "@/components/ui/skeleton";

// Si un archivo se llama loading.tsx, Next lo muestra automaticamente mientras
// la pagina de al lado todavia esta cargando sus datos. No hay que escribir
// ningun if (cargando) en ningun lado.
export default function Loading() {
  return (
    <div className="grid gap-8 sm:grid-cols-[220px_1fr]">
      <Skeleton className="aspect-[2/3] w-full rounded-lg" />
      <div className="space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-48" />
      </div>
    </div>
  );
}
