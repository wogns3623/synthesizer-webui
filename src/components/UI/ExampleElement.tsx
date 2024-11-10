import { ParsedInput } from "@/hooks/useParsedInput";
import { useMemo } from "react";

export interface ExampleElementProps {
  types: ParsedInput.Type[];
  signature: ParsedInput.Signature;
  example: ParsedInput.Example;
}

export function ExampleElement({ example }: ExampleElementProps) {
  const types = useMemo(() => parseInputType(example), [example]);

  return (
    <div>
      <header>
        {"signature: ["}
        {types.args}
        {"] -> "} {types.result}
      </header>
      <div>
        {example.args.map((v, index) => (
          <span key={index + v}>{v}</span>
        ))}
        <span>{"->"}</span>
        <span>{example.result}</span>
      </div>
    </div>
  );
}

function parseInputType(example: ParsedInput.Example): {
  args: ParsedInput.Type.All[];
  result: ParsedInput.Type.All;
} {
  return {
    args: ["linkedList"],
    result: "int",
  };
}
