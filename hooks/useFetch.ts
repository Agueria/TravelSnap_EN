import { useEffect, useMemo, useRef, useState } from 'react';

export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

function normalizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }

  if (typeof Headers !== 'undefined' && value instanceof Headers) {
    return Array.from(value.entries()).sort(([leftKey], [rightKey]) =>
      leftKey.localeCompare(rightKey)
    );
  }

  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce<Record<string, unknown>>((normalized, key) => {
        normalized[key] = normalizeValue((value as Record<string, unknown>)[key]);
        return normalized;
      }, {});
  }

  return value;
}

function createInitKey(init?: RequestInit): string {
  if (!init) {
    return '';
  }

  try {
    return JSON.stringify(normalizeValue(init));
  } catch {
    return String(init);
  }
}

export function useFetch<T>(url: string, init?: RequestInit): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });
  const initKey = useMemo(() => createInitKey(init), [init]);
  const initRef = useRef<RequestInit | undefined>(init);

  initRef.current = init;

  useEffect(() => {
    let cancelled = false;

    const load = async (): Promise<void> => {
      if (!url) {
        setState({
          data: null,
          loading: false,
          error: 'Missing URL',
        });
        return;
      }

      setState({
        data: null,
        loading: true,
        error: null,
      });

      let nextData: T | null = null;
      let nextError: string | null = null;

      try {
        const response = await fetch(url, initRef.current);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        nextData = (await response.json()) as T;
      } catch (err) {
        nextError = String(err);
      } finally {
        if (!cancelled) {
          setState({
            data: nextData,
            loading: false,
            error: nextError,
          });
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [url, initKey]);

  return state;
}
