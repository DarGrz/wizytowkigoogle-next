import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Consent from '@/components/Consent';
import VisitorTracker from '@/components/VisitorTracker';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://wizytowkigoogle.pl'),
  title: {
    default: 'wizytowkigoogle.pl — Daj się znaleźć',
    template: '%s | wizytowkigoogle.pl'
  },
  description:
    'Pozycjonowanie wizytówek Google, reklama Google Ads oraz optymalizacja profilu firmy w Google Maps. Jasne zasady i profesjonalne wsparcie dla Twojego biznesu.',
  robots: process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost')
    ? { index: false, follow: false }
    : { index: true, follow: true }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-16635868132';

  return (
    <html lang="pl">
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
          strategy="afterInteractive"
        />
        <Script id="google-tag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${googleAdsId}');
          `}
        </Script>
      </head>
      <body>
        <a className="skip-link" href="#main">
          Przejdź do treści
        </a>
        <Header />
        {children}
        <Footer />
        <Consent />
        <VisitorTracker />
      </body>
    </html>
  );
}
