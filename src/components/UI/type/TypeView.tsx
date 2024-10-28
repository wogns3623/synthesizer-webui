import { Dispatch, SetStateAction } from "react";
import { TypeElement } from "./TypeElement";

export interface TypeViewProps {
  types: string[];
  setTypes: Dispatch<SetStateAction<string[]>>;
}

export function TypeView({ types, setTypes: updateTypes }: TypeViewProps) {
  return (
    <>
      <div>
        {types.map((value, index) => (
          <TypeElement value={value} setValue={() => {}} key={index} />
        ))}

        <button
          onClick={() => {
            updateTypes((prev) => [...prev, "type foo = | None"]);
          }}
        >
          add more +
        </button>
      </div>
    </>
  );
}
