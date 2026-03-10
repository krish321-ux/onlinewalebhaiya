import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingChat from '@/components/FloatingChat';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: {
    default: 'Online Wale Bhaiya | Fast Online Form Filling & Updates',
    template: '%s | Online Wale Bhaiya'
  },
  description: 'Your one-stop destination for Government Jobs, Scholarships, Form Filling, and Online Services across India. Fast, secure, and reliable cyber cafe services at your fingertips.',
  keywords: ['Government Jobs', 'Scholarships 2026', 'Online Form Filling', 'Cyber Cafe Online', 'PAN Card Apply', 'Aadhaar Services', 'Online Services India', 'Online Wale Bhaiya', 'Job Notifications'],
  authors: [{ name: 'Online Wale Bhaiya' }],
  creator: 'Online Wale Bhaiya',
  publisher: 'Online Wale Bhaiya',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    title: 'Online Wale Bhaiya | Fast Online Form Filling',
    description: 'Find the latest Government Jobs, Scholarships, and skip the cyber cafe queue with our fast online form filling services.',
    siteName: 'Online Wale Bhaiya',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Online Wale Bhaiya Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Online Wale Bhaiya | Fast Online Form Filling',
    description: 'Your one-stop destination for Government Jobs, Scholarships, and Form Filling across India.',
    images: ['/logo.png'],
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${outfit.variable} antialiased min-h-screen flex flex-col bg-[#0a0a0a] text-white`}>
        <Navbar />
        <main className="flex-grow pt-16 sm:pt-20">
          {children}
        </main>
        <FloatingChat />
        <Footer />
      </body>
    </html>
  );
}
