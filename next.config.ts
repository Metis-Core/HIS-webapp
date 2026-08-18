import type { NextConfig } from 'next';

// Desktop (Tauri) builds require a fully static frontend. These options are ONLY
// applied when building through Tauri (TAURI_BUILD=1) so the normal web build,
// SSR behaviour and the `proxy.ts` middleware remain completely unchanged.
const isTauriBuild = process.env.TAURI_BUILD === '1';
const isProd = process.env.NODE_ENV === 'production';
const internalHost = process.env.TAURI_DEV_HOST || 'localhost';

const tauriConfig: NextConfig = {
  output: 'export',
  // next/image optimisation needs a server; disable it for the static bundle.
  images: { unoptimized: true },
  // Serve assets from the dev server while running `tauri dev`.
  assetPrefix: isProd ? undefined : `http://${internalHost}:4000`,
};

const nextConfig: NextConfig = isTauriBuild ? tauriConfig : {};

export default nextConfig;
