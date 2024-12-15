import {
  DependencyList,
  Dispatch,
  SetStateAction,
  useCallback,
  useRef,
} from "react";

export type AsyncDispatch<T> = (value: T) => Promise<void>;

export function useSetter<T>(
  value: T,
  callback: Dispatch<T> | AsyncDispatch<T>,
  deps: DependencyList = [],
) {
  const valueRef = useRef<T>(value);

  return useCallback<Dispatch<SetStateAction<T>>>(async (value) => {
    const computed =
      typeof value === "function"
        ? (value as (prevState: T) => T)(valueRef.current)
        : value;

    await callback(computed);
    valueRef.current = computed;
  }, deps);
}
