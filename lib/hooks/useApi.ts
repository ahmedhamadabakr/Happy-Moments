'use client';

import { useState, useCallback } from 'react';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useApi<T = any>(
  url: string,
  options: UseApiOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: any) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'حدث خطأ ما');
        }

        const result = await response.json();
        setData(result.data);
        options.onSuccess?.(result.data);
        return result.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'خطأ في الاتصال';
        setError(errorMessage);
        options.onError?.(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [url, options]
  );

  return { data, loading, error, execute };
}
