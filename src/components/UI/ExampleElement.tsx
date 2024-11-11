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
        {types.args
          .flatMap((v, index) => [
            <span key={index + v}>{v}</span>,
            <span key={"delim_" + index}>{", "}</span>,
          ])
          .slice(0, -1)}
        {"] -> "} {types.result}
      </header>
      <div>
        {example.args
          .flatMap((v, index) => [
            <span key={index + v}>{v}</span>,
            <span key={"delim_" + index}>{", "}</span>,
          ])
          .slice(0, -1)}
        <span>{" -> "}</span>
        <span>{example.result}</span>
      </div>
    </div>
  );
}

function parseInputType(example: ParsedInput.Example): {
  args: ParsedInput.Type.All[];
  result: ParsedInput.Type.All;
} {
  for (const arg of example.args) {
    getTypeFromValue(arg);
  }

  return {
    args: example.args.map(getTypeFromValue),
    result: getTypeFromValue(example.result),
  };
}

function getTypeFromValue(value: string): ParsedInput.Type.All {
  if (
    value.startsWith("Nil") ||
    value.startsWith("Cons") ||
    value.startsWith("LNil") ||
    value.startsWith("LCons")
  )
    return "linkedList";

  if (value.startsWith("Leaf") || value.startsWith("Node")) return "tree";

  return "unknown";
}
