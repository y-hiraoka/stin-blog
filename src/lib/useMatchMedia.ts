import { useCallback, useMemo, useSyncExternalStore } from "react";

export function useMatchMedia(query: string, initialState = false): boolean {
  const matchMediaList = useMemo(
    () => (typeof window === "undefined" ? undefined : window.matchMedia(query)),
    [query],
  );

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      matchMediaList?.addEventListener("change", onStoreChange);
      return () => matchMediaList?.removeEventListener("change", onStoreChange);
    },
    [matchMediaList],
  );

  return useSyncExternalStore(
    subscribe,
    () => matchMediaList?.matches ?? initialState,
    () => initialState,
  );
}
