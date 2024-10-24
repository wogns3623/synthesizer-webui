"use client";

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-ocaml";
import "ace-builds/src-noconflict/theme-github_dark";
import "ace-builds/src-noconflict/ext-language_tools";
import { useCallback, useMemo, useRef, useState } from "react";
import type {
  SynthesizeRequestData,
  SynthesizeResponseData,
} from "./api/synthesize/route";
import type {
  ExecuteRequestData,
  ExecuteResponseData,
} from "./api/execute/route";
import { datas } from "@/const/data";

const testInput = [
  `type nat =
| O
| S of nat

type bool =
  | True
  | False

type cmp =
  | LT
  | EQ
  | GT`,
  `let compare =
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
;;`,
  `synth nat -> nat -> nat satisfying`,
  `[0,0] -> 0,
[0,1] -> 1,
[0,2] -> 2,
[1,0] -> 1,
[1,1] -> 1,
[1,2] -> 2,
[2,0] -> 2,
[2,1] -> 2,
[2,2] -> 2`,
];

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

const sampleResult =
  "> 코드 실행 결과물 & 예제 입출력 만족하는지 보여주는 섹션";

export default function Home() {
  const [showRaw, setShowRaw] = useState(false);
  const [input1, setInput1] = useState(testInput[0]);
  const [input2, setInput2] = useState(testInput[1]);
  const [input3, setInput3] = useState(testInput[2]);
  const [input4, setInput4] = useState(testInput[3]);

  const input = useMemo(
    () => input1 + "\n\n\n" + input2 + "\n\n\n" + input3 + "\n\n\n" + input4,
    [input1, input2, input3, input4]
  );
  const setInput = useCallback((input: string) => {
    const splitted = input.split(/^synth/gm);
    let defs = splitted[0];
    const signatures = splitted[1];

    const typeDefs: string[] = [];
    const matchResult = defs.match(/type\s*\w*\s*=(:?\s*\|\s*[\w "]*)*/g);
    if (matchResult) {
      matchResult.forEach((r) => typeDefs.push(r));
      defs = defs.substring(
        defs.search(matchResult[matchResult.length - 1]) +
          matchResult[matchResult.length - 1].length
      );
    }
    const prepared = defs;

    const [signature, ...IOs] = signatures.split("\n");

    setInput1(typeDefs.join("\n\n"));
    setInput2(prepared.trim());
    setInput3("synth" + signature);
    setInput4(IOs.join("\n").trim());
  }, []);

  const [output, setOutput] = useState(testOutput);
  const [result, setResult] = useState(sampleResult);

  const synthesizeCode = useCallback(async (input: string) => {
    const result = await fetch("/api/synthesize", {
      method: "POST",
      body: JSON.stringify({ input } satisfies SynthesizeRequestData),
    });

    const body = (await result.json()) as SynthesizeResponseData;
    setOutput(body.message);
  }, []);

  const executeResult = useCallback(async (output: string) => {
    const result = await fetch("/api/execute", {
      method: "POST",
      body: JSON.stringify({ output } satisfies ExecuteRequestData),
    });

    const body = (await result.json()) as ExecuteResponseData;
    setResult(body.message);
  }, []);

  const uiTabRef = useRef<HTMLDivElement[]>([]);

  const selectUITab = useCallback((index: number) => {
    uiTabRef.current[index].scrollIntoView({
      behavior: "instant",
      block: "start",
    });
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
            {Object.entries(datas).map(([name, input]) => (
              <option value={input} key={name}>
                {name}
              </option>
            ))}
          </select>

          <button
            className="px-4 hover:bg-neutral-600"
            onClick={() => setShowRaw((prev) => !prev)}
          >
            {"toggle code <-> ui"}
          </button>

          <button
            className="px-4 hover:bg-neutral-600"
            onClick={() => synthesizeCode(input)}
          >
            synthesize
          </button>
        </header>

        {showRaw ? (
          <AceEditor
            mode="ocaml"
            theme="github_dark"
            width="auto"
            height="auto"
            className="flex-1"
            defaultValue={input}
            value={input}
            onChange={(value) => setInput(value)}
          />
        ) : (
          <section className="flex-1 flex flex-col bg-neutral-800 text-white">
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
                  <div>
                    {input1
                      .split("\n")
                      .flatMap((line, key) => [line, <br key={key} />])}
                  </div>
                </div>

                <div
                  className="relative w-full h-40 overflow-auto bg-white p-4 gap-y-4"
                  ref={(el) => {
                    if (el) uiTabRef.current[1] = el;
                  }}
                >
                  <div>
                    {input2
                      .split("\n")
                      .flatMap((line, key) => [line, <br key={key} />])}
                  </div>
                </div>

                <div
                  className="relative w-full h-40 overflow-auto bg-white p-4 gap-y-4"
                  ref={(el) => {
                    if (el) uiTabRef.current[2] = el;
                  }}
                >
                  <div>
                    {input3
                      .split("\n")
                      .flatMap((line, key) => [line, <br key={key} />])}
                  </div>
                </div>

                <div
                  className="relative w-full h-40 overflow-auto bg-white p-4 gap-y-4"
                  ref={(el) => {
                    if (el) uiTabRef.current[3] = el;
                  }}
                >
                  <div>
                    {input4
                      .split("\n")
                      .flatMap((line, key) => [line, <br key={key} />])}
                  </div>
                </div>
              </div>
            </section>
          </section>
        )}
      </section>

      <div className="flex flex-col w-4">
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
      <section className="flex-1">
        <header className="flex h-12 bg-neutral-700 pr-4 text-white">
          <button className="px-4 hover:bg-neutral-600">share</button>
          <button
            className="px-4 hover:bg-neutral-600"
            onClick={() => executeResult(output)}
          >
            test result
          </button>
        </header>

        <AceEditor
          mode="ocaml"
          theme="github_dark"
          width="auto"
          readOnly
          defaultValue={output}
          value={output}
        />

        <section className="p-4">{result}</section>
      </section>
    </div>
  );
}
