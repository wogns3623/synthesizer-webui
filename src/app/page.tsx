"use client";

import { useCallback, useState } from "react";
import { examples } from "@/constants/data";
import { Editor } from "@/components/Editor";
import { CodeView } from "@/components/CodeView";
import { UIView } from "@/components/example/ExampleView";
import { useSearchParams } from "next/navigation";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SynthesizeResponseData } from "./api/synthesize/route";

const testInput = `type nat =
| O
| S of nat

type bool =
  | True
  | False

type cmp =
  | LT
  | EQ
  | GT

let compare =
  fix (compare : nat -> nat -> cmp) =
    fun (x1 : nat) ->
      fun (x2 : nat) ->
        match x1 with
        | O -> (match x2 with
                | O -> EQ
                | S _ -> LT)
        | S x1 -> (match x2 with
                | O -> GT
                | S x2 -> compare x1 x2)
;;

synth nat -> nat -> nat satisfying

[0,0] -> 0,
[0,1] -> 1,
[0,2] -> 2,
[1,0] -> 1,
[1,1] -> 1,
[1,2] -> 2,
[2,0] -> 2,
[2,1] -> 2,
[2,2] -> 2`;

const testOutput = `(* If you entered the input format incorrectly, return the following message. *)
-> 
(* Check your input format. *)

(* If you entered it correctly, return the synthesized function. *)
->
let rec (f : ((nat, nat) -> nat)) = 
  fun (x:(nat, nat)) -> 
    match ((compare S((x).0)) (x).1) with
    LT(_) -> 
      (x).1
    GT(_) -> 
      (x).0
    EQ(_) -> 
      (x).1
`;

export default function Home() {
  const searchParams = useSearchParams();

  const [showExampleUI, setShowExampleUI] = useState(false);
  const [input, setInput] = useState(searchParams.get("input") ?? testInput);
  const [output, setOutput] = useState<SynthesizeResponseData>(
    searchParams.get("input")
      ? { raw: "", ocaml: "" }
      : { raw: testOutput, ocaml: testOutput },
  );

  const synthesizeCode = useCallback(async (input: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_PATH}/synthesize`,
      { method: "POST", body: input },
    );

    const output = (await response.json()) as SynthesizeResponseData;
    setOutput(output);
  }, []);

  return (
    <div className="min-h-screen">
      <header className="flex h-12 justify-between bg-neutral-700 px-4 text-white">
        <section className="flex gap-4">
          <div className="flex items-center">
            <h1 className="text-3xl font-semibold">Trio</h1>
          </div>

          <select
            className="bg-neutral-700 px-2 hover:bg-neutral-600"
            onChange={(e) => setInput(e.currentTarget.value)}
          >
            <option defaultChecked>select examples</option>
            {Object.entries(examples).map(([name, input]) => (
              <option value={input} key={name}>
                {name}
              </option>
            ))}
          </select>

          <button
            className="px-4 hover:bg-neutral-600"
            onClick={() => setShowExampleUI((prev) => !prev)}
          >
            {`${showExampleUI ? "hide" : "show"} example ui`}
          </button>
          <button
            className="px-4 hover:bg-neutral-600"
            onClick={() => synthesizeCode(input)}
          >
            synthesize
          </button>

          <button
            className="px-4 hover:bg-neutral-600"
            onClick={() => {
              navigator.clipboard.writeText(
                "http://localhost:3000/?input=" + encodeURIComponent(input),
              );
            }}
          >
            share links
          </button>
        </section>

        <section className="flex">
          <button className="px-4 hover:bg-neutral-600">about</button>
        </section>
      </header>

      <section className="h-[calc(100vh-3rem)]">
        <ResizablePanelGroup direction="horizontal">
          {/* input */}
          <ResizablePanel defaultSize={50}>
            <section className="relative flex h-full w-full flex-col">
              <div className="flex-1">
                <CodeView input={input} setInput={setInput} className="z-[1]" />
              </div>

              <div
                className={`z-[2] flex-shrink basis-0 overflow-hidden shadow-[#26262680_0px_-10px_10px_0px] transition-all ${
                  showExampleUI ? "flex-grow" : "flex-grow-0"
                }`}
              >
                <UIView input={input} setInput={setInput} className="h-full" />
              </div>
            </section>
          </ResizablePanel>

          {/* TODO: Add drag feature to adjust section size */}
          <ResizableHandle withHandle className="border-neutral-700" />

          {/* output */}
          <ResizablePanel
            defaultSize={50}
            className="flex w-[calc(50%-0.5rem)] flex-col"
          >
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={25} className="h-full w-full">
                <Editor
                  mode="ocaml"
                  theme="github_dark"
                  width="100%"
                  height="100%"
                  readOnly
                  defaultValue={output.raw}
                  value={output.raw}
                />
              </ResizablePanel>
              <ResizableHandle withHandle className="border-neutral-700" />
              <ResizablePanel defaultSize={25} className="h-full w-full">
                <Editor
                  mode="ocaml"
                  theme="github_dark"
                  width="100%"
                  height="100%"
                  readOnly
                  defaultValue={output.ocaml}
                  value={output.ocaml}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </section>
    </div>
  );
}
