// components/v2/trackers/SearchAnalytics.tsx
import { useEffect } from 'react';
import { safeTrack } from '@/lib/analytics';

export type SearchAnalyticsProps = {
  query: string;
  resultsCount: number;
  source?: 'page' | 'header' | 'other';
};

export default function SearchAnalytics({
  query,
  resultsCount,
  source = 'page',
}: SearchAnalyticsProps) {
  useEffect(() => {
    const q = (query || '').trim();
    if (!q) return;
    // Fire-and-forget; no await para no bloquear render ni navegación
    safeTrack('search', {
      query: q,
      results: resultsCount ?? 0,
      source,
    });
    // Sólo dispara cuando cambian query/resultados/fuente
  }, [query, resultsCount, source]);

  return null;
}
