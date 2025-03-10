import './globals.css'
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata = {
  title: 'CodeVault - Save Your Code',
  description: 'Platform to save and share code snippets',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen">
        <main>{children}</main>
        <SpeedInsights />
      </body>
    </html>
  )
}
