export const metadata = {
  title: 'Pagamento · Journey',
  openGraph: {
    title: 'Journey · Reserva de Vaga',
    description: 'Confirme sua vaga e escolha sua forma de pagamento.',
    images: [{ url: '/money.jpeg', width: 1080, height: 1080 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Journey · Reserva de Vaga',
    images: ['/money.jpeg'],
  },
};

export default function PagamentoLayout({ children }) {
  return children;
}
