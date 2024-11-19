import { memo } from "react";
import { ParsedInput, parseValue } from "@/utils/parsedInput";
import { LinkedListValue } from "./LinkedListValue";
import { TreeValue } from "./TreeValue";
import { UnknownValue } from "./UnknownValue";

export interface ValueProps {
  value: ParsedInput.Value.Intermediate;
  className?: string;
}

function Value({ value }: ValueProps) {
  const parsed = parseValue(value);

  if (parsed.type === ParsedInput.Type.Kind.LinkedList)
    return <LinkedListValue value={parsed} />;

  if (parsed.type === ParsedInput.Type.Kind.Tree)
    return <TreeValue value={parsed} />;

  return <UnknownValue value={parsed} />;
}

const memoizedValue = memo(Value);
export { memoizedValue as Value };
