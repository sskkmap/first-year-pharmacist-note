import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-jp'
});

export const metadata = {
  title: "Yakuzaishi Note | 薬剤師向け処方箋ベース薬剤選択ガイド",
  description: "処方箋情報から治療段階や処方意図を推測し、服薬指導に活かすための薬剤師向けブログ。",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body className={`${inter.variable} ${notoSansJP.variable}`}>
        {children}
      </body>
    </html>
  );
}
