export const metadata = {
  title: 'Ficha de Triagem · Journey',
  openGraph: {
    title: 'Ficha de Triagem · Journey',
    description: 'Preencha sua ficha de triagem antes da cerimônia',
    images: [{ url: '/ficha-og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ficha de Triagem · Journey',
    images: ['/ficha-og.png'],
  },
};

export default function FichaLayout({ children }) {
  return children;
}
