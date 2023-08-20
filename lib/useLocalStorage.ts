import { useCallback, useSyncExternalStore } from "react";

type Time = "s" | "m" | "h" | "d" | "w";

type Meta<T> = {
  updatedAt: string;
} & T;

type UseLocalStorageProps<TValue, TIncludeMeta extends Record<string, unknown>> = {
  key: string;
  defaultValue: TValue;
  includeMeta?: (value: TValue) => TIncludeMeta;
  transform?: (currentValue: unknown, meta: Meta<TIncludeMeta> | null) => TValue;
  expiresIn?: `${number}${Time}`;
};

const subscribe: Parameters<typeof useSyncExternalStore>["0"] = (listener) => {
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener("storage", listener);
  };
};

/**
 *
 * TODO
 *
 */
export const useLocalStorage = <TValue, TIncludeMeta extends Record<string, unknown>>(
  props: UseLocalStorageProps<TValue, TIncludeMeta>
): [TValue, (updatedValue: TValue) => void, () => void, Meta<TIncludeMeta> | null] => {
  const { key, defaultValue, includeMeta, expiresIn, transform } = props;

  const getSnapshot = useCallback(() => {
    const val = localStorage.getItem(key);
    return val;
  }, [key]);

  const setValue = (value: TValue) => {
    const meta = {
      updatedAt: new Date().getTime(),
      ...(includeMeta ? includeMeta(value) : {}),
    };

    const stringifiedValue = JSON.stringify({ value, meta });

    localStorage.setItem(key, stringifiedValue);
    dispatchEvent(new CustomEvent("storage"));
  };

  const removeValue = () => {
    localStorage.removeItem(key);
    dispatchEvent(new CustomEvent("storage"));
  };

  const localStorageString = useSyncExternalStore(subscribe, getSnapshot);
  let value = defaultValue;
  let meta: Meta<TIncludeMeta> | null = null;

  if (localStorageString === null) {
    return [transform ? transform(value, meta) : value, setValue, removeValue, meta];
  }

  try {
    const parsedValue = JSON.parse(localStorageString);
    if ("meta" in parsedValue) {
      if (expiresIn) {
        const expiryDate = Number(parsedValue.meta.updatedAt) + convertStringToMs(expiresIn);

        if (new Date().getTime() >= expiryDate) {
          delete parsedValue.value;
          localStorage.removeItem(key);
        }
      }

      meta = parsedValue.meta;
    }

    if ("value" in parsedValue) {
      if (transform) {
        value = transform(parsedValue.value, meta);
      } else {
        value = parsedValue.value;
      }
    }
  } catch (err) {
    console.error("Failed to parse local storage value: ", err);
  }

  return [value, setValue, removeValue, meta];
};

const convertStringToMs = (timeString: `${number}${Time}`) => {
  const reg = /^(\d+)([smhdw])$/i;
  const matches = timeString.match(reg)!;

  if (!matches) {
    throw new Error("timeString is invalid");
  }

  switch (matches[2] as Time) {
    case "s":
      return Number(matches[1]) * 1000;
    case "m":
      return Number(matches[1]) * 60_000;
    case "h":
      return Number(matches[1]) * 3_600_000;
    case "d":
      return Number(matches[1]) * 86_400_000;
    case "w":
      return Number(matches[1]) * 604_800_000;
  }
};
