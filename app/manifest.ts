import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/app',
    name: 'VitiCampo',
    short_name: 'VitiCampo',
    description: 'ERP vitivinícola para gestión de parcelas, cosecha, costos y trazabilidad offline en el campo.',
    start_url: '/',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone'],
    background_color: '#FAFAFA',
    theme_color: '#4A1525',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'es-AR',
    categories: ['productivity', 'business', 'utilities'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
    ],
  };
}
