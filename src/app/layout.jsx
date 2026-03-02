import './globals.css';
import BodyClass from '../components/BodyClass';
import TicketAPIProvider from '../components/TicketAPIProvider';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'BIS TICKET LEAD',
  description: 'BIS TICKET LEAD',
  icons: {
    icon: '/Logos/bis-favicon.jpeg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        {/* Apply dark mode BEFORE hydration to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('darkMode') === 'true') {
                  document.body.classList.add('dark');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body>
        <BodyClass />
        <TicketAPIProvider />
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}

