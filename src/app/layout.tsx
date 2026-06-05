import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ApexTrade AI — Institutional-Grade Trading Copilot',
  description:
    'AI-powered trading analysis, signal ranking, risk management, and multi-broker automation for crypto and equity markets. Not financial advice.',
  keywords: ['trading', 'AI', 'algo trading', 'Binance', 'Zerodha', 'signals', 'risk management'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#060b14" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}
