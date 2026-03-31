export const metadata = {
  title: 'Content Intelligence — Hellena Aguiar',
  description: 'Radar de trends e engenharia reversa de conteudo'
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
