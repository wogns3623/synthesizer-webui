import { ParsedInput } from "@/utils/parsedInput";
import { Value } from "./Value";

export interface ExampleElementProps {
  types: ParsedInput.Type[];
  signature: ParsedInput.Signature | null;
  example: ParsedInput.Example;
  className?: string;
}

export function ExampleElement({
  example,
  className = "",
}: ExampleElementProps) {
  return (
    <section className={`flex flex-col justify-between ${className}`}>
      {/* input visualize */}
      <div className="flex flex-1 flex-col gap-y-4 border-b-[1px] border-dashed border-neutral-500 p-4">
        {example.args.map((arg, index) => (
          <Value
            value={arg}
            key={index + (typeof arg === "string" ? arg : arg.raw)}
          />
        ))}
      </div>

      {/* output visualize */}
      <div className="flex items-center gap-x-4 p-4">
        <h3 className="text-3xl">{"=>"}</h3>

        <Value value={example.result} />
      </div>
    </section>
  );
}
