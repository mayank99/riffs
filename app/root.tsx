import { Link, Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from 'remix';
import type { MetaFunction, LinksFunction } from 'remix';
import styles from './root.css';
import { SSRProvider } from '@react-aria/ssr';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
  { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
  { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
];

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  viewport: 'width=device-width,initial-scale=1',
  title: 'riffs',
  'og:title': 'riffs',
  'twitter:title': 'riffs',
  description: 'Create and share riffs by clipping parts of songs',
  'og:description': 'Create and share riffs by clipping parts of songs',
  'twitter:description': 'Create and share riffs by clipping parts of songs',
  'og:type': 'website',
});

export default function App() {
  return (
    <html lang='en'>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <header>
          <Link to='/' className='logo-wrapper'>
            <h1 className='logo'>Riffs</h1>
          </Link>
        </header>
        <main>
          <SSRProvider>
            <Outlet />
          </SSRProvider>
        </main>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
