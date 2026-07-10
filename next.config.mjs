import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  experimental: {
    serverActions: {
      // Permite subir carteles, cabeceras y PDFs de normas (por defecto 1MB).
      bodySizeLimit: '15mb',
    },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
