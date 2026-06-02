import type { Metadata } from 'next'
import Link from 'next/link'
import { ExternalLink, Shield, Download } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Improve your experience — Mirawatch',
}

const BROWSERS = [
  {
    name: 'Firefox',
    href: 'https://addons.mozilla.org/firefox/addon/ublock-origin/',
    note: null,
  },
  {
    name: 'Chrome',
    href: 'https://chromewebstore.google.com/detail/ublock-origin-lite/ddkjiahejlhfcafbddmgiahcphecmpfh',
    note: "Chrome's policies limit uBlock Origin to a lighter version. For full power, use Firefox or Brave.",
  },
  {
    name: 'Edge',
    href: 'https://microsoftedge.microsoft.com/addons/detail/ublock-origin/odfafepnkmbhccpbejgmiehpchacaeak',
    note: null,
  },
  {
    name: 'Safari',
    href: 'https://apps.apple.com/app/adguard-for-safari/id1440147259',
    note: null,
  },
]

export default function AdblockPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 md:px-8">
      <div className="max-w-2xl mx-auto space-y-12">

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="w-7 h-7 text-brand flex-none" />
            <h1 className="text-3xl font-bold text-white">Watch without the ads</h1>
          </div>
          <p className="text-gray-400 leading-relaxed">
            Mirawatch uses third-party streaming sources that show popup ads to fund
            their video infrastructure. We can&apos;t control those ads — but you can
            block them completely with a free browser extension. Here&apos;s what we
            recommend.
          </p>
        </div>

        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white">Our pick: uBlock Origin</h2>
            <p className="text-gray-400 mt-2 leading-relaxed">
              Free, open-source, the best at blocking popup and popunder ads.
              Takes 30 seconds to install.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {BROWSERS.map(({ name, href, note }) => (
              <div key={name} className="space-y-2">
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-white/10 hover:border-brand/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-4 h-4 text-gray-400 group-hover:text-brand transition-colors" />
                    <span className="text-white font-medium">
                      Install for {name}
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-brand transition-colors flex-none" />
                </a>
                {note && (
                  <p className="text-xs text-gray-500 px-1 leading-relaxed">{note}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-white">Even simpler: Brave Browser</h2>
          <p className="text-gray-400 leading-relaxed">
            Brave has the same blocking built in, no extension needed.
          </p>
          <a
            href="https://brave.com/download/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-white/10 hover:border-brand/50 text-white transition-all group"
          >
            <Download className="w-4 h-4 text-gray-400 group-hover:text-brand transition-colors" />
            Download Brave
            <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-brand transition-colors" />
          </a>
        </section>

        <p className="text-sm text-gray-600 border-t border-white/5 pt-6">
          We get nothing for these recommendations. They&apos;re just what works.
        </p>

      </div>
    </div>
  )
}
