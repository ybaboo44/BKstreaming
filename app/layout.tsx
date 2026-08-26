import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'BK Streaming — Votre univers vidéo privé',
  description: 'Plateforme privée de diffusion vidéo en direct et à la demande. Sécurisée. Moderne. Pensée pour vous.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={poppins.variable}>
      <body className="min-h-screen bg-bk-dark text-foreground">{children}</body>
    </html>
  );
}
