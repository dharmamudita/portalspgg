/**
 * useThrottle — Rate limiting hook for form submissions
 * Prevents rapid-fire submissions that could abuse the API
 */
import { useState, useCallback, useRef } from 'react';

export function useThrottle(callback, delay = 3000) {
  const [isThrottled, setIsThrottled] = useState(false);
  const lastCallRef = useRef(0);

  const throttledFn = useCallback(
    async (...args) => {
      const now = Date.now();
      if (now - lastCallRef.current < delay) {
        return { throttled: true, message: 'Mohon tunggu sebentar sebelum mengirim lagi' };
      }

      lastCallRef.current = now;
      setIsThrottled(true);

      try {
        const result = await callback(...args);
        return result;
      } finally {
        setTimeout(() => setIsThrottled(false), delay);
      }
    },
    [callback, delay]
  );

  return { throttledFn, isThrottled };
}
