import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Maquetador Editorial LMS | Generador Moodle-Safe',
  description: 'Automatiza la maquetación de recursos didácticos HTML accesibles, responsivos y listos para Moodle.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,600;1,400&family=Montserrat:wght@500;600;700&family=Open+Sans:wght@400;600&family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="h-full antialiased text-slate-800 bg-slate-50 flex flex-col">
        {children}
      </body>
    </html>
  );
}
