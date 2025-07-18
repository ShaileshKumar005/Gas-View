import './globals.css'

export const metadata = {
  title: 'Real-Time Cross-Chain Gas Tracker',
  description: 'Track live gas prices across Ethereum, Polygon, and Arbitrum with wallet simulation',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        {children}
      </body>
    </html>
  )
}