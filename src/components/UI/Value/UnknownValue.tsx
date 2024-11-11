import { ParsedInput } from "@/hooks/useParsedInput";

export interface UnknownValueProps {
  value: ParsedInput.Value.Unknown;
}

export function UnknownValue({ value }: UnknownValueProps) {
  return <div>{value}</div>;
}
