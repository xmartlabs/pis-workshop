import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Empaqueta el server en .next/standalone, con solo las dependencias que
  // realmente se usan. Es lo que hace que la imagen de Docker pese ~200MB
  // en vez de mas de 1GB. Se usa en el workshop de Docker.
  output: "standalone",

  images: {
    // next/image bloquea dominios externos por defecto. Si no declaramos
    // image.tmdb.org aca, los posters no cargan y la consola tira un error.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
};

export default nextConfig;
