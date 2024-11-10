import { useMemo } from "react";

export namespace ParsedInput {
  export interface Type {
    name: string;
    type: "varients";
    varients: (Type | string)[];
  }

  // export interface Function {
  //   name: string;
  //   code: string;
  // }
  export type Function = string;

  export interface Signature {
    args: string[];
    result: string;
  }

  export interface Example {
    args: string[];
    result: string;
  }

  export namespace Type {
    //  ocaml primitive type
    export type Primitive = "int" | "float" | "string" | "bool" | "unit";

    export type UserDefined =
      | "function"
      | "tuple"
      | "varients"
      | "record"
      | "aliases"
      | "polymorphic"; // something like generic

    export type Kind = "linkedList" | "tree";
    export type All = Primitive | UserDefined | Kind;
  }
}

export interface ParsedInput {
  readonly types: ParsedInput.Type[];
  readonly functions: ParsedInput.Function[];
  readonly signature: ParsedInput.Signature;
  readonly examples: ParsedInput.Example[];
}

export function useParsedInput(input: string): ParsedInput {
  return useMemo(() => {
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

    // should use token base parser
    const signatureParsed = {
      args: [],
      result: "",
    } satisfies ParsedInput.Signature;

    return {
      types: types.map((type) => {
        const [name, rest] = type.split("=").map((v) => v.trim());

        return {
          name: name.replace(/^type/m, "").trim(),
          type: "varients",
          varients: rest.split("|").map((v) => v.trim()),
        };
      }),
      functions,
      signature: signatureParsed,
      examples: examples
        .map((v) => v.trim())
        .filter((v) => v.length > 0)
        .map((example) => {
          const [input, result] = example.split("->").map((e) => e.trim());
          const args = input.substring(1, input.length - 1).split(",");
          return { args, result };
        }),
    } satisfies ParsedInput;
  }, [input]);
}
