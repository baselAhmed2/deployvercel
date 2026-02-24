import dynamic from 'next/dynamic';
import '../styles/login.css';
import '../styles/dashboard.css';

const ClientRouter = dynamic(() => import('../components/ClientRouter'), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', background: '#f5f5f5' }}>
      Loading...
    </div>
  ),
});

export default function App({ Component, pageProps }) {
  return <ClientRouter Component={Component} pageProps={pageProps} />;
}
