import './globals.css';

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Journey | Gestão de Experiências',
  description: 'Plataforma para gestão de pessoas em experiências enteogênicas.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600&family=IM+Fell+English:ital@0;1&family=Courier+Prime&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
