import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
