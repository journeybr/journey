export const metadata = {
  title: 'Ficha Médica · Journey',
  openGraph: {
    title: 'Ficha Médica · Journey',
    description: 'Preencha sua ficha médica antes da cerimônia',
    images: [{ url: '/ficha-og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ficha Médica · Journey',
    images: ['/ficha-og.png'],
  },
};

export default function FichaLayout({ children }) {
  return children;
}
