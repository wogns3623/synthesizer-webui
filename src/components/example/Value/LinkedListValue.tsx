import { ParsedInput } from "@/utils/parsedInput";

export interface LinkedListValueProps {
  value: ParsedInput.Value.LinkedList;
}

export function LinkedListValue({ value }: LinkedListValueProps) {
  return (
    <div className="flex text-2xl gap-2">
      <span>{"["}</span>
      {value.elements
        .flatMap((v, index) => [
          <span key={`${index}_${v}`}>{v.raw}</span>,
          <Divider key={"divider_" + index} />,
        ])
        .slice(0, -1)}
      <span>{"]"}</span>
    </div>
  );
}

function Divider() {
  return <span>,</span>;
}
