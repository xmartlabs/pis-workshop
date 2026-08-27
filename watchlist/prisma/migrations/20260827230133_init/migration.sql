-- CreateTable
CREATE TABLE "watchlist_items" (
    "id" SERIAL NOT NULL,
    "movieId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "posterPath" TEXT,
    "releaseDate" TEXT,
    "voteAverage" DOUBLE PRECISION,
    "watched" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "watchlist_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "watchlist_items_movieId_key" ON "watchlist_items"("movieId");
