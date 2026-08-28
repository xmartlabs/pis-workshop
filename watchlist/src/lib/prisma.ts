import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

// En Prisma 7 el cliente necesita SI o SI un "adapter": la pieza que sabe
// hablar el protocolo de Postgres. Sin esto, `new PrismaClient()` tira error.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

// En desarrollo Next recargá el código en caliente muchas veces. Si crearamos
// un PrismaClient nuevo en cada recargá, abririamos conexiones hasta reventar
// la base. Por eso lo guardamos en globalThis y reusamos el mismo.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
