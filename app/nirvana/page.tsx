'use client'

import { useEffect } from 'react'
import { Sora, Fraunces } from 'next/font/google'

import SiteNav from './_components/SiteNav'
import Hero from './_components/Hero'
import TechTabs from './_components/TechTabs'
import PerformanceCards from './_components/PerformanceCards'
import FlagshipProducts from './_components/FlagshipProducts'
import Testimonials from './_components/Testimonials'
import Team from './_components/Team'
import Guarantee from './_components/Guarantee'
import FAQ from './_components/FAQ'
import SiteFooter from './_components/SiteFooter'
import ElevenLabsWidget from './_components/ElevenLabsWidget'
import PhoneCTA from './_components/PhoneCTA'

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '600', '700'],
})

export default function NirvanaPage() {
  // Hide the Mirawatch nav for this demo page
  useEffect(() => {
    const style = document.createElement('style')
    style.id = 'nirvana-override'
    style.textContent = `
      body > header,
      header.fixed { display: none !important; }
    `
    document.head.appendChild(style)
    return () => {
      document.getElementById('nirvana-override')?.remove()
    }
  }, [])

  return (
    <div
      className={`${sora.variable} ${fraunces.variable} bg-white text-slate-900 antialiased`}
      style={{ fontFamily: 'var(--font-sora)' }}
    >
      <SiteNav />

      {/* Offset for fixed demo banner (28px) + fixed nav (64px) */}
      <main className="pt-[92px]">
        <Hero />
        <PhoneCTA />
        <TechTabs />
        <PerformanceCards />
        <FlagshipProducts />
        <Testimonials />
        <Team />
        <Guarantee />
        <FAQ />
      </main>

      <SiteFooter />

      {/* ElevenLabs widget embeds here */}
      <ElevenLabsWidget />
    </div>
  )
}
