import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchRegions as apiFetchRegions } from '../services/api';
import { REFRESH_INTERVAL } from '../utils/constants';

/**
 * Manages region cycling with a countdown timer.
 * If the backend is unreachable, stops all API calls and uses fallback data.
 *
 * @returns {{ region: string|null, countdown: string, connected: boolean }}
 */
export default function useRegionCycling() {
  const [region, setRegion] = useState(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const [connected, setConnected] = useState(false);

  const cycleRef = useRef([]);
  const indexRef = useRef(0);
  const initRef = useRef(false);

  const fetchRegions = useCallback(async () => {
    try {
      const regions = await apiFetchRegions();
      cycleRef.current = [...regions, null];
      indexRef.current = 0;
      setConnected(true);
      return true;
    } catch {
      cycleRef.current = [null];
      indexRef.current = 0;
      setConnected(false);
      return false;
    }
  }, []);

  const advance = useCallback(() => {
    const cycle = cycleRef.current;
    if (cycle.length === 0) return;

    const current = cycle[indexRef.current] ?? null;
    setRegion(current);
    indexRef.current++;

    if (indexRef.current >= cycle.length) {
      indexRef.current = 0;
      fetchRegions();
    }
  }, [fetchRegions]);

  // Initial load — only once
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    fetchRegions().then((ok) => {
      if (ok) advance();
    });
  }, [fetchRegions, advance]);

  // Countdown timer — only runs when connected to backend
  useEffect(() => {
    if (!connected) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          advance();
          return REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [connected, advance]);

  const formatted = `00:${String(countdown).padStart(2, '0')}`;

  return { region, countdown: formatted, connected };
}
