import { useMemo } from "react";

export namespace ParsedInput {
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

  export interface Type {
    name: string;
    type: "varients";
    varients: (Type | string)[];
  }

  export namespace Type {
    //  ocaml primitive type
    export type Unknown = "unknown";
    export type Primitive = "int" | "float" | "string" | "bool" | "unit";

    export type UserDefined =
      | "function"
      | "tuple"
      | "varients"
      | "record"
      | "aliases"
      | "polymorphic"; // something like generic

    export type Kind = "linkedList" | "tree";
    export type All = Unknown | Primitive | UserDefined | Kind;
  }

  export namespace Value {
    export type Unknown = string;

    export type LinkedList = Any[];

    interface TreeBase {
      isLeaf: boolean;
      node?: [Tree, Any, Tree];
    }
    export interface TreeLeaf extends TreeBase {
      isLeaf: true;
      node: never;
    }
    export interface TreeNode extends TreeBase {
      isLeaf: false;
      node: [Tree, Any, Tree];
    }
    export type Tree = TreeLeaf | TreeNode;

    export type Any = Unknown | LinkedList | Tree;
  }
}

export interface ParsedInput {
  readonly types: ParsedInput.Type[];
  readonly functions: ParsedInput.Function[];
  readonly signature: ParsedInput.Signature;
  readonly examples: ParsedInput.Example[];
}

export function useParsedInput(input: string): ParsedInput {
  return useMemo(() => parseInput(input), [input]);
}

export function parseInput(input: string) {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [signature, ...examples] = signatures.split("\n");

  // should use token base parser?
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
        const [input, output] = example.split("->").map((e) => e.trim());

        const args = input.substring(1, input.length - 1).split(",");
        let result = output;
        if (result.endsWith(","))
          result = result.substring(0, result.length - 1);

        return { args, result };
      }),
  } satisfies ParsedInput;
}

export function parseExampleType(example: ParsedInput.Example): {
  args: ParsedInput.Type.All[];
  result: ParsedInput.Type.All;
} {
  for (const arg of example.args) {
    getTypeFromValue(arg);
  }

  return {
    args: example.args.map(getTypeFromValue),
    result: getTypeFromValue(example.result),
  };
}

export function getTypeFromValue(value: string): ParsedInput.Type.All {
  if (
    value.startsWith("Nil") ||
    value.startsWith("Cons") ||
    value.startsWith("LNil") ||
    value.startsWith("LCons")
  )
    return "linkedList";

  if (value.startsWith("Leaf") || value.startsWith("Node")) return "tree";

  return "unknown";
}

// export function parseValue(value: string) {}

export function parseLinkedListValue(value: string) {}

export function parseTreeValue(value: string) {}
