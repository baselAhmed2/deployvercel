import './globals.css';
import BodyClass from '../components/BodyClass';
import TicketAPIProvider from '../components/TicketAPIProvider';

export const metadata = {
  title: 'BIS TICKET LEAD',
  description: 'BIS TICKET LEAD',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body>
        <BodyClass />
        <TicketAPIProvider />
        {children}
      </body>
    </html>
  );
}

