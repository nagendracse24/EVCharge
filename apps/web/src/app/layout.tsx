import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { TechBackground } from '@/components/ui/TechBackground'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'EVCharge India - Find EV Charging Stations',
  description: 'Find and book EV charging stations across India. Compare prices, check availability, and charge with confidence.',
  keywords: 'EV charging, electric vehicle, charging stations, India, booking',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
