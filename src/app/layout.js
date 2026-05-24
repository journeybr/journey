import './globals.css';

export const metadata = {
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
