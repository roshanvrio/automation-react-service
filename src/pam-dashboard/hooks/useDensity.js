import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * Returns a density tier ('default' | 'medium' | 'high') based on item count
 * and sets `data-density` attribute on the referenced container element.
 */
export default function useDensity(itemCount = 0, thresholds = { medium: 5, high: 8 }) {
  const ref = useRef(null);

  const getDensity = useCallback(() => {
    if (itemCount >= thresholds.high) return 'high';
    if (itemCount >= thresholds.medium) return 'medium';
    return 'default';
  }, [itemCount, thresholds.medium, thresholds.high]);

  const [density, setDensity] = useState(() => getDensity());

  useEffect(() => {
    const next = getDensity();
    setDensity(next);
    if (ref.current) {
      ref.current.setAttribute('data-density', next);
    }
  }, [getDensity]);

  return { ref, density };
}
