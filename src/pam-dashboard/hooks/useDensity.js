import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * Adaptive density hook — observes a container's content volume
 * and returns a density tier: 'default' | 'medium' | 'high'.
 *
 * Also sets `data-density` attribute on the container element.
 *
 * @param {number} itemCount  – number of data items inside the container
 * @param {object} thresholds – { medium: number, high: number }
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
