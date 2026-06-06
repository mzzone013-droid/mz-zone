import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Topbar from '@/components/Topbar';
import FloatingChatButton from '@/components/chat/FloatingChatButton';

const locales = ['ar', 'en', 'fr'];

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale)) notFound();

  const messages = await getMessages();
  const isRTL = locale === 'ar';

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <style>{`
          body {
            margin: 0;
            padding: 0;
            background-color: #070B14;
            color: #F1F5F9;
            font-family: ${isRTL ? "'IBM Plex Sans Arabic', sans-serif" : "'Space Grotesk', sans-serif"};
            min-height: 100vh;
            overflow-x: hidden;
            background-image: 
              /* Stars / Particles */
              radial-gradient(1px 1px at 15% 25%, rgba(255, 255, 255, 0.2) 1px, transparent 0),
              radial-gradient(1px 1px at 35% 75%, rgba(255, 255, 255, 0.15) 1px, transparent 0),
              radial-gradient(1.5px 1.5px at 65% 35%, rgba(255, 255, 255, 0.25) 1px, transparent 0),
              radial-gradient(1px 1px at 85% 85%, rgba(255, 255, 255, 0.15) 1px, transparent 0),
              radial-gradient(2px 2px at 45% 15%, rgba(255, 255, 255, 0.1) 1px, transparent 0),
              radial-gradient(1px 1px at 95% 45%, rgba(255, 255, 255, 0.2) 1px, transparent 0),
              /* Industrial Equipment Line-art (Opacity 2.5%) */
              url("data:image/svg+xml,%3Csvg width='600' height='600' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='rgba(255, 255, 255, 0.025)' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3C!-- Gear 1 --%3E%3Ccircle cx='100' cy='150' r='30'/%3E%3Ccircle cx='100' cy='150' r='10'/%3E%3Cpath d='M100 110v10M100 180v10M60 150h10M130 150h10M72 122l7 7M121 171l7 7M128 122l-7 7M79 171l-7 7'/%3E%3C!-- Gear 2 --%3E%3Ccircle cx='450' cy='450' r='45'/%3E%3Ccircle cx='450' cy='450' r='15'/%3E%3Cpath d='M450 390v15M450 495v15M390 450h15M495 450h15M407 407l10 10M483 483l10 10M493 407l-10 10M417 483l-10 10'/%3E%3C!-- Crane Hook --%3E%3Cpath d='M500 100v40c0 20-20 20-20 0v-10'/%3E%3Ccircle cx='500' cy='85' r='5'/%3E%3C!-- Ruler / Caliper --%3E%3Crect x='250' y='50' width='100' height='15' rx='2'/%3E%3Cpath d='M260 50v5M270 50v8M280 50v5M290 50v8M300 50v5'/%3E%3C!-- Blueprint Schematics --%3E%3Cpath d='M200 350L250 300H300'/%3E%3Ccircle cx='200' cy='350' r='3' fill='rgba(255,255,255,0.025)'/%3E%3Ccircle cx='300' cy='300' r='3' fill='rgba(255,255,255,0.025)'/%3E%3Cpath d='M50 400h40l30 30h50'/%3E%3Ccircle cx='50' cy='400' r='3' fill='rgba(255,255,255,0.025)'/%3E%3Ccircle cx='170' cy='430' r='3' fill='rgba(255,255,255,0.025)'/%3E%3C!-- Wrench --%3E%3Cpath d='M350 200l30-30c10-10 25-5 30 5l-40 40c-10-5-15-20-5-30z'/%3E%3Cpath d='M375 175l-40-40' stroke-width='4'/%3E%3Ccircle cx='335' cy='135' r='8'/%3E%3C/g%3E%3C/svg%3E");
            background-size: 200px 200px, 300px 300px, 400px 400px, 500px 500px, 150px 150px, 250px 250px, 600px 600px;
            background-attachment: fixed;
          }
          @media (max-width: 600px) {
            .main-content { padding: 15px !important; }
          }
          * { box-sizing: border-box; }
        `}</style>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Topbar locale={locale} />
            <main className="main-content" style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
              {children}
            </main>
            <FloatingChatButton />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
