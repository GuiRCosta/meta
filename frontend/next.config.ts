import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone para Docker
  output: "standalone",
  
  // Desabilita os indicadores de desenvolvimento (caixas azuis)
  devIndicators: false,
  
  // Outras configurações
  reactStrictMode: true,
};

export default nextConfig;
