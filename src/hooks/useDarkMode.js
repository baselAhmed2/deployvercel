'use client';

import { useState, useEffect } from 'react';

/**
 * Returns true when body has the 'dark' class.
 * Automatically re-renders when dark mode is toggled.
 */
export function useDarkMode() {
    const [dark, setDark] = useState(false);
    useEffect(() => {
        // Initial value (runs client-side only)
        setDark(document.body.classList.contains('dark'));
        const observer = new MutationObserver(() => {
            setDark(document.body.classList.contains('dark'));
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);
    return dark;
}
