import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Evita que Next.js agregue texto propio al final de CLAUDE.md al encender la plataforma.
  agentRules: false,
};

export default nextConfig;
