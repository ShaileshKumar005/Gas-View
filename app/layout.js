import './globals.css'
import { ThemeProvider } from 'next-themes'

export const metadata = {
  title: 'Real-Time Cross-Chain Gas Tracker',
  description: 'Track live gas prices across Ethereum, Polygon, and Arbitrum with wallet simulation',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}