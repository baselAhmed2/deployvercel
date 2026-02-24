'use client';

import { useEffect } from 'react';
import { TicketAPI } from '../lib/api';

export default function TicketAPIProvider() {
  useEffect(() => {
    if (typeof window !== 'undefined') window.TicketAPI = TicketAPI;
  }, []);
  return null;
}
