import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import Navigation from '@/components/Navigation';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-poppins'
});

// Note: Bagel Fat One is not available in Google Fonts, so we'll use a web font

export const metadata: Metadata = {
    title: 'SpiraFlow - AI-Powered Voice Journal',
    description: 'Voice-first thought journal with AI reflection coaching',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Bagel+Fat+One&display=swap" rel="stylesheet" />
            </head>
            <body className={`${inter.className} ${poppins.variable} bg-white text-black`}>
                <Navigation />
                <main className="pt-16 min-h-screen">
                    {children}
                </main>
            </body>
        </html>
    );
}

