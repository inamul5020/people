import './globals.css'

export const metadata = {
  title: 'Demographic Data Search',
  description: 'Search through demographic records',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

