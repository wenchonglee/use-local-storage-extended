import { useLocalStorage } from "../lib/useLocalStorage";

export const Demo1 = () => {
  const [value, onChange, remove, meta] = useLocalStorage({
    key: "demo1",
    defaultValue: "demo",
  });

  return (
    <div className="flex">
      <div className="border-right">
        <h1>Basic use</h1>
        <span>
          Similar to <code>useState</code>
        </span>
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
