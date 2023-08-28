# `useLocalStorage`

This hook was written to give more control over local storage states.

Example use cases:

- Having backwards compatibility for clients who has outdated local storage values
- Storing metadata with local storage values

## Usage

[Codesandbox demo](https://codesandbox.io/p/sandbox/broken-meadow-wcqqq8)

### Basic usage

Similar to `useState`, you can simply use the hook by providing a default value and a local storage key.

```tsx
const [value, onChange, remove, meta] = useLocalStorage({
  key: "demo",
  defaultValue: "Hello world",
});

// by default, meta has the updatedAt epoch value
// meta.updatedAt
```

### Custom metadata

In some cases, you might want to include your own metadata

```tsx
const [value, onChange, remove, meta] = useLocalStorage({
  key: "demo",
  defaultValue: "Hello world",
  includeMeta: () => ({ version: "1" }),
});

// meta.updatedAt
// meta.version
```

### Transform

If the way you use your local storage value is changed, you may want to "salvage" your client's existing local storage value.

In the following example, let's assume that version 1 used a `number` value and we want to use a `string` value now.

```tsx
const [value, onChange, remove, meta] = useLocalStorage({
  key: "demo",
  defaultValue: "Hello world",
  transform: (currentValue, meta) => {
    if (Number(currentValue) !== NaN) {
      return Number(currentValue);
    }

    return currentValue;
  },
});
```

### Auto expiry

You can also choose to discard the state after a certain time period

```tsx
const [value, onChange, remove, meta] = useLocalStorage({
  key: "demo",
  defaultValue: "Hello world",
  expiresIn: "1w",
});
```

## TODO

- Support for SSR
