import { useState, useCallback, useMemo } from 'react';
import type { ModuleConfig } from '../types/module';

function loadVisibility(key: string): Record<string, boolean> | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveVisibility(key: string, map: Record<string, boolean>) {
  localStorage.setItem(key, JSON.stringify(map));
}

export function useColumnVisibility(moduleConfig: ModuleConfig) {
  const [visibilityMap, setVisibilityMap] = useState<Record<string, boolean>>(() => {
    const saved = loadVisibility(moduleConfig.localStorageKey);
    if (saved) return saved;
    const all: Record<string, boolean> = {};
    moduleConfig.columns.forEach((c) => { all[c.field] = true; });
    return all;
  });

  const toggleColumn = useCallback((field: string) => {
    if (field === moduleConfig.pinnedField) return;
    setVisibilityMap((prev) => {
      const next = { ...prev, [field]: !prev[field] };
      saveVisibility(moduleConfig.localStorageKey, next);
      return next;
    });
  }, [moduleConfig.pinnedField, moduleConfig.localStorageKey]);

  const showAllColumns = useCallback(() => {
    const all: Record<string, boolean> = {};
    moduleConfig.columns.forEach((c) => { all[c.field] = true; });
    setVisibilityMap(all);
    saveVisibility(moduleConfig.localStorageKey, all);
  }, [moduleConfig.columns, moduleConfig.localStorageKey]);

  const showRecommendedColumns = useCallback(() => {
    const rec: Record<string, boolean> = {};
    moduleConfig.columns.forEach((c) => {
      rec[c.field] = moduleConfig.recommendedColumns.has(c.field);
    });
    setVisibilityMap(rec);
    saveVisibility(moduleConfig.localStorageKey, rec);
  }, [moduleConfig.columns, moduleConfig.recommendedColumns, moduleConfig.localStorageKey]);

  const visibleCount = useMemo(
    () => Object.values(visibilityMap).filter(Boolean).length,
    [visibilityMap]
  );

  return { visibilityMap, toggleColumn, showAllColumns, showRecommendedColumns, visibleCount };
}
