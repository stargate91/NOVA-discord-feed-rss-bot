import { useState, useCallback } from 'react';

export function useImageFallback(
  initialSrc: string,
  fallbackSrc: string = 'https://cdn.discordapp.com/embed/avatars/0.png'
) {
  const [src, setSrc] = useState(initialSrc);
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => {
    setHasError(true);
    setSrc(fallbackSrc);
  }, [fallbackSrc]);

  return {
    src,
    hasError,
    handleError,
  };
}
