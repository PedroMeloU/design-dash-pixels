
import { useMemo } from "react";

interface Incident {
  neighborhood: string | null;
  date: string;
  [key: string]: any;
}

export function useRelatedIncidents(
  incidents: Incident[] | undefined,
  neighborhood: string | undefined
) {
  return useMemo(() => {
    if (!incidents || !neighborhood) return [];
    return incidents
      .filter(
        (inc) =>
          inc.neighborhood &&
          inc.neighborhood.trim().toLocaleLowerCase() ===
            neighborhood.trim().toLocaleLowerCase()
      )
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(0, 3);
  }, [incidents, neighborhood]);
}
