import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { TicketAPI } from './api';

if (typeof window !== 'undefined') window.TicketAPI = TicketAPI;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
