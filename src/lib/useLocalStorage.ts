import { useCallback, useEffect, useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "react-use";

type UseLocalStorageParams<T> = {
  storageKey: string;
  initialState: T;
  isValidValue: (value: unknown) => value is T;
};

export function useLocalStorage<T>({
  storageKey,
  initialState,
  isValidValue,
}: UseLocalStorageParams<T>): [T, (value: T) => void] {
  const [state, _setState] = useState(initialState);
  const isValidValueRef = useRef(isValidValue);
  isValidValueRef.current = isValidValue;

  const setValueFromStorage = useCallback(() => {
    const storageValue = window.localStorage.getItem(storageKey);
    if (storageValue === null) return;
    const parsed = JSON.parse(storageValue);
    if (parsed === null || parsed === undefined) return;
    if (!isValidValueRef.current(parsed.__value)) return;
    _setState(parsed.__value);
  }, [storageKey]);

  useIsomorphicLayoutEffect(() => {
    setValueFromStorage();
  }, [setValueFromStorage]);

  useEffect(() => {
    window.addEventListener("storage", setValueFromStorage);
    return () => window.removeEventListener("storage", setValueFromStorage);
  }, [setValueFromStorage]);

  const setState = useCallback(
    (value: T) => {
      _setState(value);
      window.localStorage.setItem(storageKey, JSON.stringify({ __value: value }));
    },
    [storageKey],
  );

  return [state, setState];
}
