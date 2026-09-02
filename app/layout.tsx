import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PWARegister } from '@/components/PWARegister';

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://viticampo.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  applicationName: 'VitiCampo',
  title: {
    default: 'VitiCampo',
    template: '%s | VitiCampo',
  },
  description:
    'VitiCampo ayuda a viñedos y bodegas a gestionar parcelas, cosecha, costos y tareas del campo incluso sin conexión.',
  keywords: ['viñedos', 'vitivinícola', 'PWA', 'offline', 'ERP', 'cosecha', 'trazabilidad'],
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: 'VitiCampo - Gestión de Viñedos y Operaciones Offline',
    description:
      'Plataforma móvil y web para gestionar parcelas, monitoreo agronómico, cosecha y trazabilidad en entornos vitivinícolas.',
    url: appUrl,
    siteName: 'VitiCampo',
    locale: 'es_AR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VitiCampo',
    description: 'ERP vitivinícola offline, rápido y operativo desde el campo.',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VitiCampo',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#4A1525',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="VitiCampo" />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased">
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
