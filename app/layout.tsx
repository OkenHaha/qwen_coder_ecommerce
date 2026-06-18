import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/app/components/ui/toaster'
import { Header } from '@/app/components/header'
import { Footer } from '@/app/components/footer'
import { Analytics } from '@/app/components/analytics'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: process.env.NEXT_PUBLIC_SITE_NAME || 'My Store',
    template: `%s | ${process.env.NEXT_PUBLIC_SITE_NAME || 'My Store'}`,
  },
  description: 'Shop the best products at great prices',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Toaster />
        <Analytics />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      </body>
    </html>
  )
}