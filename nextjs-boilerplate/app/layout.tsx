import type { Metadata, Viewport } from "next"
import { Inter, Source_Code_Pro } from "next/font/google"
import "./globals.css"

// Using Inter as a similar geometric sans-serif to Euclid Circular A
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-euclid",
  display: "swap",
})

// Source Code Pro for code mockups
const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-source-code",
  display: "swap",
})

export const metadata: Metadata = {
  title: "MongoDB Style App",
  description: "Next.js application with MongoDB-inspired design system",
}

export const viewport: Viewport = {
  themeColor: "#001E2B",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className="bg-background">
      <body className={`${inter.variable} ${sourceCodePro.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
