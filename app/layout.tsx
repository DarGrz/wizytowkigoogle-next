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
    'Pozycjonowanie wizytówek Google, reklama Google Ads i pomoc w usuwaniu profili. Jasne zasady, obsługa zleceń i rozliczenie za ustalony efekt.',
  robots: process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost')
    ? { index: false, follow: false }
    : { index: true, follow: true }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-16635868132"
          strategy="afterInteractive"
        />
        <Script id="google-tag-aw-16635868132" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-16635868132');
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
