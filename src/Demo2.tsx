import { useLocalStorage } from "../lib/useLocalStorage";

export const Demo2 = () => {
  const [value, onChange, remove, meta] = useLocalStorage({
    key: "demo2",
    defaultValue: "demo2",
    includeMeta: () => ({ version: "1" }),
  });

  return (
    <div className="flex">
      <div className="border-right">
        <h1>Custom meta</h1>
        <span>You can include your own metadata to help you make decisions</span>
        <div>
          Value: <code>{JSON.stringify(value)}</code>
        </div>
        <div>
          Meta: <code>{JSON.stringify(meta)} </code>
        </div>
      </div>

      <div>
        <form
          onSubmit={(ev) => {
            ev.preventDefault();
            //@ts-ignore
            onChange(ev.target.input.value);
          }}
        >
          <input name="input" placeholder="Enter to change value" />
        </form>
        <br />

        <button onClick={remove}>Remove value</button>
      </div>
    </div>
  );
};
