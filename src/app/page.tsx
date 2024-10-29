"use client";

import { useCallback, useState } from "react";
import { examples } from "@/constants/data";
import { Editor } from "@/components/Editor";
import { CodeView } from "@/components/CodeView";
import { UIView } from "@/components/UI/UIView";
import { useSearchParams } from "next/navigation";

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
  const [output, setOutput] = useState(
    searchParams.get("input") ? "" : testOutput
  );

  const synthesizeCode = useCallback(async (input: string) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_PATH}/synthesize`,
      { method: "POST", body: input }
    );

    const output = (await response.text()) as string;
    setOutput(output);
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* input */}
      <section className="flex-1 flex flex-col relative">
        <header className="flex h-12 bg-neutral-700 px-4 text-white">
          <select
            className="px-2 bg-neutral-700 hover:bg-neutral-600"
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
        </header>

        <section className="flex-1 flex flex-col">
          <div className="flex-1">
            <CodeView input={input} setInput={setInput} className="z-[1]" />
          </div>

          <div
            className={`transition-all basis-0 flex-shrink overflow-hidden z-[2] shadow-[#26262680_0px_-10px_10px_0px] ${
              showExampleUI ? "flex-grow" : "flex-grow-0"
            }`}
          >
            <UIView input={input} setInput={setInput} className="h-full" />
          </div>
        </section>
      </section>

      {/* TODO: Add drag feature to adjust section size */}
      <div className="flex flex-col w-4 z-[3]">
        <header className="h-12 bg-neutral-700" />
        <div className="flex-1 flex flex-col justify-center items-center bg-neutral-800">
          <button className="*:h-1">
            <div>.</div>
            <div>.</div>
            <div>.</div>
          </button>
        </div>
      </div>

      {/* output */}
      <section className="flex-1 flex flex-col">
        <header className="flex h-12 bg-neutral-700 pr-4 text-white">
          <button
            className="px-4 hover:bg-neutral-600"
            onClick={() => {
              navigator.clipboard.writeText(
                "http://localhost:3000/?input=" + encodeURIComponent(input)
              );
            }}
          >
            share links
          </button>
        </header>

        <Editor
          mode="ocaml"
          className="flex-1"
          theme="github_dark"
          width="auto"
          height="auto"
          readOnly
          defaultValue={output}
          value={output}
        />
      </section>
    </div>
  );
}
