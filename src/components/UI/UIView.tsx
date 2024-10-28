import { Dispatch, useCallback, useMemo, useRef } from "react";
import { TypeView } from "./type/TypeView";
import { FunctionView } from "./function/FunctionView";
import { SignatureView } from "./signature/SignatureView";
import { ExampleView } from "./example/ExampleView";
import { useSetter } from "@/hooks/useSetter";

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
export function UIView({ input, setInput, className }: UIViewProps) {
  const parsedInput = useMemo(() => {
    return parseInput(input);
  }, [input]);

  const updateInput = useSetter(
    parsedInput,
    (value) => {
      setInput(
        [
          value.types.join("\n\n"),
          value.functions.join("\n\n"),
          value.signature,
          value.examples.join("\n"),
        ]
          .filter((v) => v.trim().length > 0)
          .join("\n\n\n")
      );
    },
    [setInput]
  );

  const uiTabRef = useRef<HTMLDivElement[]>([]);

  const selectUITab = useCallback((index: number) => {
    uiTabRef.current[index].scrollIntoView({ block: "start" });
  }, []);

  return (
    <section
      className={`flex-1 flex flex-col bg-neutral-800 text-white ${
        className ?? ""
      }`}
    >
      <header className="flex h-8 bg-opacity-60 bg-neutral-700 px-4">
        <div
          className="flex-1 px-2 py-1 flex justify-center items-center hover:bg-neutral-600"
          onClick={() => selectUITab(0)}
        >
          타입 정의
        </div>
        <div
          className="flex-1 px-2 py-1 flex justify-center items-center hover:bg-neutral-600"
          onClick={() => selectUITab(1)}
        >
          helper 함수
        </div>
        <div
          className="flex-1 px-2 py-1 flex justify-center items-center hover:bg-neutral-600"
          onClick={() => selectUITab(2)}
        >
          함수 signature
        </div>
        <div
          className="flex-1 px-2 py-1 flex justify-center items-center hover:bg-neutral-600"
          onClick={() => selectUITab(3)}
        >
          예제 입출력
        </div>
      </header>

      <section className="flex-1 flex p-4">
        <div className="flex-1 flex overflow-hidden gap-x-8 text-black *:flex-shrink-0 *:h-full">
          <div
            className="relative w-full h-40 overflow-auto bg-white p-4 gap-y-4"
            ref={(el) => {
              if (el) uiTabRef.current[0] = el;
            }}
          >
            <TypeView
              types={parsedInput.types}
              setTypes={(valueOrFn) => {
                updateInput((prev) => {
                  return {
                    ...prev,
                    types:
                      typeof valueOrFn === "function"
                        ? valueOrFn(prev.types)
                        : valueOrFn,
                  };
                });
              }}
            />
          </div>

          <div
            className="relative w-full h-40 overflow-auto bg-white p-4 gap-y-4"
            ref={(el) => {
              if (el) uiTabRef.current[1] = el;
            }}
          >
            <FunctionView functions={parsedInput.functions} />
          </div>

          <div
            className="relative w-full h-40 overflow-auto bg-white p-4 gap-y-4"
            ref={(el) => {
              if (el) uiTabRef.current[2] = el;
            }}
          >
            <SignatureView signature={parsedInput.signature} />
          </div>

          <div
            className="relative w-full h-40 overflow-auto bg-white p-4 gap-y-4"
            ref={(el) => {
              if (el) uiTabRef.current[3] = el;
            }}
          >
            <ExampleView examples={parsedInput.examples} />
          </div>
        </div>
      </section>
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
