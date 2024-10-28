import { FunctionElement } from "./FunctionElement";

export interface FunctionViewProps {
  functions: string[];
}

export function FunctionView({ functions }: FunctionViewProps) {
  return (
    <>
      <div>
        {functions.map((value, index) => (
          <FunctionElement value={value} key={index} />
        ))}
      </div>
    </>
  );
}
