import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Nav from '@/components/nav/Nav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mirawatch',
  description: 'Mirawatch — movies and TV, on demand.',
  openGraph: {
    title: 'Mirawatch',
    description: 'Mirawatch — movies and TV, on demand.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-white antialiased min-h-screen`}>
        <Nav />
        {children}
      </body>
    </html>
  )
}
