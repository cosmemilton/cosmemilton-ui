"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const TABLE_PREFERENCE_EVENT = "cm-table-preference";

export function useTablePreference(browserKey: string | null, defaultHidden: string[] = []) {
  const storageKey = browserKey ? `cm-table:${browserKey}` : null;
  const defaultHiddenSnapshot = JSON.stringify(defaultHidden);

  const subscribe = useCallback((callback: () => void) => {
    if (!storageKey || typeof window === "undefined") return () => undefined;

    const handleStorage = (event: StorageEvent) => {
      if (event.key === storageKey) callback();
    };
    const handleLocalChange = (event: Event) => {
      if (!(event instanceof CustomEvent) || event.detail?.storageKey === storageKey) callback();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(TABLE_PREFERENCE_EVENT, handleLocalChange);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(TABLE_PREFERENCE_EVENT, handleLocalChange);
    };
  }, [storageKey]);

  const getSnapshot = useCallback(() => {
    if (!storageKey || typeof window === "undefined") return defaultHiddenSnapshot;
    try {
      return window.localStorage.getItem(storageKey) ?? defaultHiddenSnapshot;
    } catch {
      return defaultHiddenSnapshot;
    }
  }, [defaultHiddenSnapshot, storageKey]);

  const getServerSnapshot = useCallback(() => defaultHiddenSnapshot, [defaultHiddenSnapshot]);
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hiddenColumns = useMemo(() => parseHiddenColumns(snapshot, defaultHiddenSnapshot), [defaultHiddenSnapshot, snapshot]);

  const setHiddenColumns = useCallback(
    (updater: Set<string> | ((prev: Set<string>) => Set<string>)) => {
      if (!storageKey || typeof window === "undefined") return;

      const previous = parseHiddenColumns(getSnapshot(), defaultHiddenSnapshot);
      const next = typeof updater === "function" ? updater(previous) : updater;

      window.localStorage.setItem(storageKey, JSON.stringify(Array.from(next)));
      window.dispatchEvent(new CustomEvent(TABLE_PREFERENCE_EVENT, { detail: { storageKey } }));
    },
    [defaultHiddenSnapshot, getSnapshot, storageKey],
  );

  const resetToDefaults = useCallback(() => {
    if (!storageKey || typeof window === "undefined") return;

    window.localStorage.removeItem(storageKey);
    window.dispatchEvent(new CustomEvent(TABLE_PREFERENCE_EVENT, { detail: { storageKey } }));
  }, [storageKey]);

  return { hiddenColumns, setHiddenColumns, resetToDefaults, loaded: true };
}

function parseHiddenColumns(snapshot: string, fallbackSnapshot: string) {
  const parsed = parseSnapshot(snapshot) ?? parseSnapshot(fallbackSnapshot) ?? [];
  return new Set(parsed);
}

function parseSnapshot(snapshot: string) {
  try {
    const parsed = JSON.parse(snapshot);
    return Array.isArray(parsed) ? parsed.map(String) : null;
  } catch {
    return null;
  }
}
