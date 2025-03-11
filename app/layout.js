import './globals.css'
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata = {
  title: 'CodeVault - Save Your Code',
  description: 'Platform to save and share code snippets',
  openGraph: {
    title: 'CodeVault - Save Your Code',
    description: 'Platform to save and share code snippets',
    siteName: 'CodeVault',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CodeVault Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodeVault - Save Your Code',
    description: 'Platform to save and share code snippets',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className="bg-gray-100 min-h-screen overflow-x-hidden">
        <main>{children}</main>
        <SpeedInsights />
      </body>
    </html>
  )
}