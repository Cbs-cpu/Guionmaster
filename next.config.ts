import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" copia solo lo que hace falta para arrancar (server.js +
  // node_modules mínimos) a .next/standalone — es lo que permite que la
  // imagen Docker (Dockerfile) no tenga que cargar con node_modules entero
  // (better-sqlite3 y @remotion/* incluidos) en la capa final.
  output: "standalone",
};

export default nextConfig;
