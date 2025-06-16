import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { ClerkProvider } from "@clerk/nextjs"
import { Toaster } from "sonner"
import { Footer } from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "KharchaTrack - AI-Powered Expense Management",
  description:
    "Track your finances effortlessly with AI-powered receipt scanning, automated insights, and visual expense charts. Get monthly financial reports delivered to your email and take control of your spending with intelligent analytics.",
  keywords:
    "finance tracking, expense tracker, AI receipt scanner, budgeting app, financial insights, expense charts, income tracking, personal finance",
  openGraph: {
    title: "KharchaTrack - AI-Powered Expense Management",
    description:
      "Track your finances effortlessly with AI-powered receipt scanning, automated insights, and visual expense charts.",
    type: "website",
    url: process.env.DOMAIN_URL!,
    images: [
      {
        url: `${process.env.DOMAIN_URL}/kharchatrack.png`,
        width: 800,
        height: 600,
        alt: "KharchaTrack Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KharchaTrack - AI-Powered Expense Management",
    description:
      "Track your finances effortlessly with AI-powered receipt scanning, automated insights, and visual expense charts.",
    images: [
      {
        url: `${process.env.DOMAIN_URL}/kharchatrack.png`,
        width: 800,
        height: 600,
        alt: "KharchaTrack Logo",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "KharchaTrack",
  description:
    "AI-powered finance tracking app with receipt scanning and automated insights",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "AUD",
  },
  featureList: [
    "AI Receipt Scanning",
    "Expense Tracking",
    "Financial Charts",
    "Monthly Email Insights",
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} antialiased`}>
          {/* header */}
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster richColors />
          {/* footer */}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  )
}
