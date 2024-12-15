import { Dispatch, useMemo, useState } from "react";
import { ExampleElement } from "./ExampleElement";
import { parseInput } from "@/utils/parsedInput";

export interface UIViewProps {
  input: string;
  setInput: Dispatch<string>;
  className?: string;
}

// NOTE: context쓰면 더 좋을수도?
export function UIView({ input, className }: UIViewProps) {
  const { types, signature, examples } = useMemo(
    () => parseInput(input),
    [input],
  );
  const [tabIndex, setTabIndex] = useState(0);
  if (examples.length <= tabIndex) setTabIndex(0);

  const example = examples[tabIndex];
  return (
    <section
      className={`flex flex-1 flex-col bg-neutral-800 text-white ${
        className ?? ""
      }`}
    >
      <ExampleElement
        types={types}
        signature={signature}
        example={example}
        className="flex-1"
      />

      <footer className="flex h-8 flex-grow-0 overflow-auto bg-neutral-700 bg-opacity-60 px-4 scrollbar-none">
        {examples.map((_, index) => (
          <div
            className={`flex flex-none cursor-pointer items-center justify-center px-2 py-1 hover:bg-neutral-600 ${
              tabIndex === index ? "bg-neutral-600" : ""
            }`}
            onClick={() => setTabIndex(index)}
            key={index}
          >
            {`example ${index}`}
          </div>
        ))}
      </footer>
    </section>
  );
}
