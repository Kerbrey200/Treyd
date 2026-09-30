import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Oq Oltin — Advanced Market Engine & Admin Control',
  description: 'Professional commodity trading terminal and procedural simulation engine for OQ OLTIN / UZS with real-time admin parameter control.',
  openGraph: {
    title: 'Oq Oltin — Advanced Market Engine & Admin Control',
    description: 'Professional commodity trading terminal and procedural simulation engine for OQ OLTIN / UZS with real-time admin parameter control.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oq Oltin — Advanced Market Engine & Admin Control',
    description: 'Professional commodity trading terminal and procedural simulation engine for OQ OLTIN / UZS with real-time admin parameter control.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (typeof window !== 'undefined') {
                  var _origFetch = window.fetch;
                  var _activeFetch = _origFetch;
                  Object.defineProperty(window, 'fetch', {
                    get: function() { return _activeFetch; },
                    set: function(val) { _activeFetch = val; },
                    configurable: true,
                    enumerable: true
                  });
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
