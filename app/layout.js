import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-jp'
});

export const metadata = {
  metadataBase: new URL('https://first-year-pharmacist-note.site'),
  title: {
    default: "Yakuzaishi Note | 薬剤師向け処方箋ベース薬剤選択ガイド",
    template: "%s | Yakuzaishi Note"
  },
  description: "処方箋情報から治療段階や処方意図を推測し、服薬指導に活かすための薬剤師向けブログ。",
  openGraph: {
    title: "Yakuzaishi Note | 薬剤師向け処方箋ベース薬剤選択ガイド",
    description: "処方箋情報から治療段階や処方意図を推測し、服薬指導に活かすための薬剤師向けブログ。",
    url: "https://first-year-pharmacist-note.site",
    siteName: "Yakuzaishi Note",
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Yakuzaishi Note",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yakuzaishi Note | 薬剤師向け処方箋ベース薬剤選択ガイド",
    description: "処方箋情報から治療段階や処方意図を推測し、服薬指導に活かすための薬剤師向けブログ。",
    images: ["/og-image.png"],
  },
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
};

export default function RootLayout({ children }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="ja">
      <head>
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3015895490418469"
          crossOrigin="anonymous"></script>
      </head>
      <body className={`${inter.variable} ${notoSansJP.variable}`}>
        {children}
      </body>
    </html>
  );
}
