'use client';

import { useState, useCallback, useRef } from 'react';

interface UseApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useApi<T = any>(
  initialUrl: string,
  options: UseApiOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const execute = useCallback(
    async (body?: any, overrideUrl?: string) => {
      setLoading(true);
      setError(null);
      const url = overrideUrl || initialUrl;

      try {
        const response = await fetch(url, {
          method: optionsRef.current.method || (body ? 'POST' : 'GET'),
          headers: {
            'Content-Type': 'application/json',
          },
          body: body ? JSON.stringify(body) : undefined,
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'An unknown error occurred.');
        }

        setData(result);
        if (optionsRef.current.onSuccess) {
          optionsRef.current.onSuccess(result);
        }
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An unknown error occurred.');
        setError(error);
        if (optionsRef.current.onError) {
          optionsRef.current.onError(error);
        }
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [initialUrl]
  );

  return { data, loading, error, execute };
}
