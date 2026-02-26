"use client"

import { Analytics } from '@vercel/analytics/next';
import dynamic from 'next/dynamic'

const ImageResizer = dynamic(() => import('@/components/ImageResizer'), {
  
  loading: () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: '"Press Start 2P", monospace', color: '#00ffcc', fontSize: '12px' }}>
      LOADING...
    </div>
  ),
})

export default function Home() {
  return (
    <>
      <ImageResizer />
      <Analytics />
    </>
  )
}