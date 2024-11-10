import { Dispatch, useMemo, useState } from "react";
import { ExampleElement } from "./ExampleElement";
import { useParsedInput } from "@/hooks/useParsedInput";

export interface UIViewProps {
  input: string;
  setInput: Dispatch<string>;
  className?: string;
}

// NOTE: context쓰면 더 좋을수도?
export function UIView({ input, className }: UIViewProps) {
  const { types, signature, examples } = useParsedInput(input);
  const [rawTabIndex, selectUITab] = useState(0);
  const tabIndex = useMemo(() => {
    if (examples.length > rawTabIndex) return rawTabIndex;
    else return 0;
  }, [rawTabIndex, examples]);

  return (
    <section
      className={`flex-1 flex flex-col bg-neutral-800 text-white ${
        className ?? ""
      }`}
    >
      <div className="flex-1 p-4">
        <ExampleElement
          types={types}
          signature={signature}
          example={examples[tabIndex]}
        />
      </div>

      <footer className="flex-grow-0 flex h-8 bg-opacity-60 bg-neutral-700 px-4 overflow-auto scrollbar-none">
        {examples.map((_, index) => (
          <div
            className={`flex-none px-2 py-1 flex justify-center items-center cursor-pointer hover:bg-neutral-600 ${
              tabIndex === index ? " bg-neutral-600" : ""
            }`}
            onClick={() => selectUITab(index)}
            key={index}
          >
            {`example ${index}`}
          </div>
        ))}
      </footer>
    </section>
  );
}
