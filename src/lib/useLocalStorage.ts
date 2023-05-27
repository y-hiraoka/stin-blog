import React, { useCallback, useEffect, useRef, useState } from "react";
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
}: UseLocalStorageParams<T>): [T, React.Dispatch<React.SetStateAction<T>>] {
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

  const setState: React.Dispatch<React.SetStateAction<T>> = useCallback(
    value => {
      _setState(prevState => {
        // @ts-expect-error
        const nextState: T = typeof value === "function" ? value(prevState) : value;

        window.localStorage.setItem(storageKey, JSON.stringify({ __value: nextState }));

        return nextState;
      });
    },
    [storageKey],
  );

  return [state, setState];
}
