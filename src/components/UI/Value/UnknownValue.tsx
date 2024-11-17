import { ParsedInput } from "@/utils/parsedInput";

export interface UnknownValueProps {
  value: ParsedInput.Value.Intermediate;
}

export function UnknownValue({ value }: UnknownValueProps) {
  return <div>{typeof value === "string" ? value : value.raw}</div>;
}
