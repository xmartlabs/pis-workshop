import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { posterUrl, releaseYear, type Movie } from "@/lib/movies";

export function MovieCard({ movie }: { movie: Movie }) {
  const poster = posterUrl(movie.poster_path, "w500");
  const year = releaseYear(movie.release_date);

  return (
    <Link href={`/película/${movie.id}`} className="group">
      <Card className="h-full overflow-hidden py-0 transition-shadow group-hover:shadow-md">
        <div className="bg-muted relative aspect-[2/3]">
          {poster ? (
            <Image
              src={poster}
              alt={`Póster de ${movie.title}`}
              fill
              sizes="(max-width: 768px) 50vw, 20vw"
              className="object-cover"
            />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
              sin póster
            </div>
          )}
        </div>

        <CardContent className="space-y-1 px-3 pt-1 pb-3">
          <p className="line-clamp-2 text-sm leading-tight font-medium">
            {movie.title}
          </p>
          <div className="flex items-center gap-2">
            {year ? (
              <span className="text-muted-foreground text-xs">{year}</span>
            ) : null}
            <Badge variant="secondary" className="text-xs">
              ★ {movie.vote_average.toFixed(1)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
