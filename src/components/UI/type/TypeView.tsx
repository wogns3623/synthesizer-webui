import { TypeElement } from "./TypeElement";

export interface TypeViewProps {
  types: string[];
}

export function TypeView({ types }: TypeViewProps) {
  return (
    <>
      <div>
        {types.map((value, index) => (
          <TypeElement value={value} key={index} />
        ))}
      </div>
    </>
  );
}
