import { expect, test, vi, describe, afterEach } from "vitest";
import { useLocalStorage } from "./useLocalStorage";
import { renderHook, act, cleanup } from "@testing-library/react";

const key = "test";

afterEach(() => {
  localStorage.clear();
  cleanup();
});

describe("defaultValue", () => {
  test("default value is returned and localstorage remains unset", () => {
    const { result } = renderHook(() => useLocalStorage({ key, defaultValue: "DEFAULT" }));

    expect(result.current[0]).toBe("DEFAULT");
    expect(localStorage.getItem(key)).toBe(null);
  });

  test("meta is null by default", () => {
    const { result } = renderHook(() => useLocalStorage({ key, defaultValue: "DEFAULT" }));

    expect(result.current[3]).toBe(null);
  });
});

describe("setState", () => {
  test("setState updates with metadata", () => {
    const mockDate = new Date();
    vi.setSystemTime(mockDate);

    const { result } = renderHook(() => useLocalStorage({ key, defaultValue: "DEFAULT" }));

    act(() => {
      result.current[1]("UPDATE");
    });

    const localStorageValue = JSON.parse(localStorage.getItem(key)!);
    expect(localStorageValue["value"]).toBe("UPDATE");
    expect(result.current[0]).toBe("UPDATE");

    expect(localStorageValue["meta"]["updatedAt"]).toBe(mockDate.getTime());
    expect(result.current[3]!["updatedAt"]).toBe(mockDate.getTime());
    vi.useRealTimers();
  });

  test("can handle anything JSON.stringify can handle", () => {
    const { result } = renderHook(() => useLocalStorage({ key, defaultValue: {} }));

    const updatedValue = { string: "test", number: 123, array: ["abc", "def"], nested: { value: "nest" } };

    act(() => {
      result.current[1](updatedValue);
    });

    const value = result.current[0] as typeof updatedValue;

    expect(value["string"]).toBe("test");
    expect(value["number"]).toBe(123);
    expect(value["array"]).toContain("abc");
    expect(value["array"]).toContain("def");
    expect(value["nested"]["value"]).toBe("nest");
  });

  test("calling remove reverts to defaultValue and removes key from local storage", () => {
    const { result } = renderHook(() => useLocalStorage({ key, defaultValue: "DEFAULT" }));

    act(() => {
      result.current[1]("UPDATE");
    });

    expect(localStorage.getItem(key)).not.toBe(null);

    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe("DEFAULT");
    expect(localStorage.getItem(key)).toBe(null);
  });
});

describe("includeMeta", () => {
  test("includeMeta receives the correct parameters and is set correctly", () => {
    const fn = vi.fn();
    const { result } = renderHook(() =>
      useLocalStorage({
        key,
        defaultValue: "DEFAULT",
        includeMeta: (value) => {
          fn(value);
          return { version: "1" };
        },
      })
    );

    expect(result.current[3]).toBe(null);
    act(() => {
      result.current[1]("UPDATE");
    });

    expect(result.current[3]!["version"]).toBe("1");
    expect(fn.mock.calls).toHaveLength(1);
    expect(fn.mock.calls[0][0]).toBe("UPDATE");
  });
});

describe("transform", () => {
  test("transform fn receives value and meta correctly", () => {
    const mockDate = new Date();
    vi.setSystemTime(mockDate);

    const fn = vi.fn();
    const { result } = renderHook(() =>
      useLocalStorage({
        key,
        defaultValue: "DEFAULT",
        transform: (value, meta) => {
          fn(value, meta);

          return `PREFIX-${value}`;
        },
      })
    );

    expect(fn.mock.calls[0][0]).toBe("DEFAULT");
    expect(fn.mock.calls[0][1]).toBe(null);
    expect(result.current[0]).toBe("PREFIX-DEFAULT");

    act(() => {
      result.current[1]("UPDATE");
    });
    expect(fn.mock.calls[1][0]).toBe("UPDATE");
    expect(fn.mock.calls[1][1]["updatedAt"]).toBe(mockDate.getTime());
    expect(result.current[0]).toBe("PREFIX-UPDATE");

    vi.useRealTimers();
  });
});

describe.each([
  { expiresIn: "10s", timeInMs: 10_000 },
  { expiresIn: "1m", timeInMs: 60_000 },
  { expiresIn: "1h", timeInMs: 3_600_000 },
  { expiresIn: "1d", timeInMs: 86_400_000 },
  { expiresIn: "1w", timeInMs: 604_800_000 },
])("expiresIn", ({ expiresIn, timeInMs }) => {
  test(`expired keys (${expiresIn}) should return the defaultValue`, () => {
    const mockDate = new Date();
    vi.setSystemTime(mockDate);

    const { result, rerender } = renderHook(() =>
      useLocalStorage({
        key,
        defaultValue: "DEFAULT",
        expiresIn: expiresIn as Parameters<typeof useLocalStorage>[0]["expiresIn"],
      })
    );

    act(() => {
      result.current[1]("UPDATE");
    });

    expect(result.current[0]).toBe("UPDATE");

    // advance time
    vi.setSystemTime(mockDate.getTime() + timeInMs);
    rerender();
    expect(result.current[0]).toBe("DEFAULT");
    expect(localStorage.getItem(key)).toBe(null);

    vi.useRealTimers();
  });
});
