import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://extpixel.vercel.app'),
  title: 'EXTPIXEL - EXTENSION IMAGE RESIZER',
  description: 'General use & dev ready',
  keywords: [
    'extension image resizer',
    'chrome extension screenshots',
    'edge extension screenshots',
    'opera extension screenshots',
    'image resize tool',
    'client-side image resizer',
    'EXTPIXEL',
  ],
  openGraph: {
    title: 'EXTPIXEL - EXTENSION IMAGE RESIZER',
    description: 'General use & dev ready',
    type: 'website',
    url: '/',
    siteName: 'EXTPIXEL',
  },
  twitter: {
    card: 'summary',
    title: 'EXTPIXEL - EXTENSION IMAGE RESIZER',
    description: 'General use & dev ready',
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/icon.png?v=2" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <link rel="apple-touch-icon" href="/icon.png?v=2" />
        <link
          href="https://unpkg.com/nes.css@2.3.0/css/nes.min.css"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
