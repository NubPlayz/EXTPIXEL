import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
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
    images: [
      {
        url: '/share.png',
        width: 1200,
        height: 630,
        alt: 'EXTPIXEL Extension Image Resizer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EXTPIXEL - EXTENSION IMAGE RESIZER',
    description: 'General use & dev ready',
    images: ['/share.png'],
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
  verification: {
    google:"-H80yUP3sbYE-SJpOm-LniZYRdOpQwlJFT_IjdMP_tg" 
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://unpkg.com/nes.css@2.3.0/css/nes.min.css"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Analytics/>
      </body>
    </html>
  )
}
