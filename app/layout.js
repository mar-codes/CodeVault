import './globals.css'
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata = {
  title: 'CodeVault - Save Your Code',
  description: 'Platform to save and share code snippets',
  metadataBase: new URL('https://codevault.lol'),
  applicationName: 'CodeVault',
  keywords: ['code snippets', 'code sharing', 'developer tools', 'programming'],
  authors: [{ name: 'CodeVault Team' }],
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#1e40af' },
  ],
  openGraph: {
    title: 'CodeVault - Secure Code Snippet Sharing',
    description: 'Store, organize and share your code snippets securely with syntax highlighting and easy management.',
    url: 'https://codevault.lol',
    siteName: 'CodeVault',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'CodeVault - Secure Code Snippet Sharing',
    description: 'Store, organize and share your code snippets securely with syntax highlighting and easy management.',
    creator: '@codevault',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://codevault.lol',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#2563eb" />
        <meta property="og:site_name" content="CodeVault" />
      </head>
      <body className="bg-gray-100 min-h-screen">
        <main>{children}</main>
        <SpeedInsights />
      </body>
    </html>
  )
}
