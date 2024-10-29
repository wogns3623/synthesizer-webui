import { Dispatch, useMemo, useState } from "react";
import { ExampleElement } from "./ExampleView";

export interface UIViewProps {
  input: string;
  setInput: Dispatch<string>;
  className?: string;
}

interface ParsedInput {
  readonly types: string[];
  readonly functions: string[];
  readonly signature: string;
  readonly examples: string[];
}

// NOTE: context쓰면 더 좋을수도?
export function UIView({ input, className }: UIViewProps) {
  const { examples } = useMemo(() => parseInput(input), [input]);
  const [tabIndex, selectUITab] = useState(0);

  return (
    <section
      className={`flex-1 flex flex-col bg-neutral-800 text-white ${
        className ?? ""
      }`}
    >
      <div className="flex-1 p-4">
        <ExampleElement example={examples[tabIndex]} />
      </div>

      <footer className="flex-grow-0 flex h-8 bg-opacity-60 bg-neutral-700 px-4 overflow-auto scrollbar-none">
        {examples.map((example, index) => (
          <div
            className="flex-none px-2 py-1 flex justify-center items-center hover:bg-neutral-600"
            onClick={() => selectUITab(index)}
            key={example}
          >
            {`example ${index}`}
          </div>
        ))}
      </footer>
    </section>
  );
}

function parseInput(input: string): ParsedInput {
  const splitted = input.split(/^synth/gm);
  let defs = splitted[0];
  const signatures = splitted[1];

  const types: string[] = [];
  const matchResult = defs.match(
    /type\s*\w*\s*=(:?\s*[\w "]*)?(:?\s*\|\s*[\w "*]*)*/g
  );
  if (matchResult) {
    matchResult.forEach((r) => {
      types.push(r);
      defs = defs.substring(defs.search(r) + r.length);
      defs.trim();
    });
  }

  // TODO Split functions
  const functions = defs
    .split(";;")
    .map((v) => v.trim())
    .filter((v) => v.length > 0)
    .map((v) => v + "\n;;");

  const [signature, ...examples] = signatures.split("\n");

  return {
    types,
    functions,
    signature: "synth" + signature,
    examples: examples.map((v) => v.trim()).filter((v) => v.length > 0),
  };
}
