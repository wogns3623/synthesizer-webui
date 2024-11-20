import { ParsedInput } from "@/utils/parsedInput";

export interface UnknownValueProps {
  value: ParsedInput.Value.Intermediate;
}

export function UnknownValue({ value }: UnknownValueProps) {
  return <div className="text-2xl">{value.raw}</div>;
}
