import { useState, useCallback } from 'react';

export const useConnectionStatus = () => {
  const [copyClicked, setCopyClicked] = useState(false);

  const copyAddress = useCallback((address) => {
    setCopyClicked(true);
    navigator.clipboard.writeText(address).catch(() => {
      // Silent fail - no toast notification
    });
    // Reset the color after 500ms
    setTimeout(() => {
      setCopyClicked(false);
    }, 500);
  }, []);

  return { copyClicked, copyAddress };
};
