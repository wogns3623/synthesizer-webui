export namespace ParsedInput {
  // export interface Function {
  //   name: string;
  //   code: string;
  // }
  export type Function = string;

  // export interface Signature {
  //   args: string[];
  //   result: string;
  // }
  export type Signature = string;

  export interface Example {
    args: Value.Intermediate[];
    result: Value.Intermediate;
  }

  export interface Type {
    name: string;
    type: "varients";
    varients: (Type | string)[];
  }

  export namespace Type {
    //  ocaml primitive type
    export enum Unknown {
      Unknown = "unknown",
    }
    export enum Primitive {
      Int = "int",
      Float = "float",
      String = "string",
      Bool = "bool",
      Unit = "unit",
    }

    export enum UserDefined {
      Function = "function",
      Tuple = "tuple",
      Varients = "varients",
      Record = "record",
      Aliases = "aliases",
      Polymorphic = "polymorphic", // something like generic
    }

    export enum Kind {
      LinkedList = "linkedList",
      Tree = "tree",
    }
    export type All = Unknown | Primitive | UserDefined | Kind;
  }

  export namespace Value {
    export type Unknown = string;

    export class Constructor {
      name: string;
      args: (string | Constructor)[];
      parent?: Constructor;

      constructor(name: string, parent?: Constructor) {
        this.name = name;
        this.args = [];
        this.parent = parent;
      }

      push(child: string | Constructor) {
        this.args.push(child);
      }

      pop() {
        return this.args.pop();
      }

      get raw(): string {
        return `${this.name}(${this.args.map((arg) =>
          arg instanceof Constructor ? arg.raw : arg
        )})`;
      }
    }

    export type LinkedList = Any[];

    interface TreeBase {
      isLeaf: boolean;
      value?: Any;
      children: Any[];
    }
    export interface TreeLeaf extends TreeBase {
      isLeaf: true;
      value: never;
      children: [];
    }
    export interface TreeNode extends TreeBase {
      isLeaf: false;
      value: Any;
      children: Any[];
    }
    export type Tree = TreeLeaf | TreeNode;

    export type Any = Unknown | LinkedList | Tree;

    export type Intermediate = string | Constructor;
  }

  interface ValueBase {
    type: Type.All;
    value: Value.Any;
  }
  interface ValueLinkedList extends ValueBase {
    type: Type.Kind.LinkedList;
    value: Value.LinkedList;
  }
  interface ValueTree extends ValueBase {
    type: Type.Kind.Tree;
    value: Value.Tree;
  }
  interface ValueUnknown extends ValueBase {
    type: Exclude<Type.All, Type.Kind>;
    value: Exclude<Value.Any, Value.LinkedList | Value.Tree>;
  }

  export type Value = ValueTree | ValueLinkedList | ValueUnknown;
}

export interface ParsedInput {
  readonly types: ParsedInput.Type[];
  readonly functions: ParsedInput.Function[];
  /**
   * @deprecated Not implemented yet
   */
  readonly signature: ParsedInput.Signature;
  readonly examples: ParsedInput.Example[];
}

function parseConstructor(value: string): ParsedInput.Value.Intermediate[] {
  let current: ParsedInput.Value.Constructor =
    new ParsedInput.Value.Constructor("default");

  // find first Constructor symbol
  while (value.length > 0) {
    console.log(value);
    let match: RegExpExecArray | null = null;
    if ((match = /^\),?/.exec(value))) {
      if (current.parent) current = current.parent;
    } else if ((match = /^(\w+?)\(/.exec(value))) {
      const sub = new ParsedInput.Value.Constructor(match[1], current);
      current.push(sub);
      current = sub;
    } else if ((match = /(\w+),?/.exec(value))) {
      current.push(match[1]);
    } else continue;

    value = value.slice(match[0].length);
  }

  return current.args.map((arg) => {
    if (typeof arg !== "string") arg.parent = undefined;
    return arg;
  });
}

function sanitizeComment(input: string) {
  let result = "";
  let prev = "";

  let isEscaped = false;
  let isInString = false;
  let isCommented = false;
  let isEscapedTmp = false;
  let isInStringTmp = false;
  let isCommentedTmp = false;

  for (const char of input) {
    isEscapedTmp = isEscaped;
    isInStringTmp = isInString;
    isCommentedTmp = isCommented;

    if (isInString && !isEscaped && char === "\\") isEscapedTmp = true;
    else isEscapedTmp = false;

    if (!isInString && char === '"') isInStringTmp = true;
    else if (isInString && !isEscaped && char === '"') isInStringTmp = false;

    if (!isInString && char === "*" && prev === "(") {
      result = result.slice(0, -1);
      isCommented = true;
      isCommentedTmp = true;
    } else if (isCommented && !isInString && char === ")" && prev === "*")
      isCommentedTmp = false;

    if (!isCommented) result += char;

    prev = char;
    isEscaped = isEscapedTmp;
    isInString = isInStringTmp;
    isCommented = isCommentedTmp;
  }

  return result;
}

/** TODO: Exclude comments */
export function parseInput(input: string) {
  input = sanitizeComment(input);
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

  // should use token base parser? -> Not yet
  // TODO: parse signature
  const signatureParsed = signature;

  return {
    types: types.map((type) => {
      const [name, rest] = type.split("=").map((v) => v.trim());

      return {
        name: name.replace(/^type/m, "").trim(),
        type: "varients",
        varients: rest
          .split("|")
          .map((v) => v.trim())
          .filter((v) => v.length > 0),
      };
    }),
    functions,
    signature: signatureParsed,
    examples: examples
      .map((v) => v.trim())
      .filter((v) => v.length > 0)
      .map((example) => {
        const [input, output] = example.split("->").map((e) => e.trim());
        return {
          args: parseConstructor(input.slice(1, -1)),
          result: parseConstructor(output)[0],
        };
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

export function getTypeFromValue(value: string): ParsedInput.Type.All;
export function getTypeFromValue(
  value: ParsedInput.Value.Constructor
): ParsedInput.Type.All;
export function getTypeFromValue(
  value: ParsedInput.Value.Intermediate
): ParsedInput.Type.All;
export function getTypeFromValue(
  value: ParsedInput.Value.Intermediate
): ParsedInput.Type.All {
  if (value instanceof ParsedInput.Value.Constructor) {
    if (value.name === "Cons" || value.name === "LCons")
      return ParsedInput.Type.Kind.LinkedList;

    if (value.name === "Node") return ParsedInput.Type.Kind.Tree;

    return ParsedInput.Type.Unknown.Unknown;
  }

  if (
    value.startsWith("Nil") ||
    value.startsWith("Cons") ||
    value.startsWith("LNil") ||
    value.startsWith("LCons")
  )
    return ParsedInput.Type.Kind.LinkedList;

  if (value.startsWith("Leaf") || value.startsWith("Node"))
    return ParsedInput.Type.Kind.Tree;

  return ParsedInput.Type.Unknown.Unknown;
}

export function parseValue(value: string): ParsedInput.Value;
export function parseValue(
  value: ParsedInput.Value.Constructor
): ParsedInput.Value;
export function parseValue(
  value: ParsedInput.Value.Intermediate
): ParsedInput.Value;
export function parseValue(
  value: ParsedInput.Value.Intermediate
): ParsedInput.Value {
  const valueType = getTypeFromValue(value);
  let parsedValue: ParsedInput.Value.Any | null = null;

  if (valueType === ParsedInput.Type.Kind.LinkedList)
    parsedValue = parseLinkedListValue(value);
  else if (valueType === ParsedInput.Type.Kind.Tree)
    parsedValue = parseTreeValue(value);
  // Unknown
  else parsedValue = typeof value === "string" ? value : value.raw;

  return { type: valueType, value: parsedValue } as ParsedInput.Value;
}

export function parseLinkedListValue(
  value: string
): ParsedInput.Value.LinkedList;
export function parseLinkedListValue(
  value: ParsedInput.Value.Constructor
): ParsedInput.Value.LinkedList;
export function parseLinkedListValue(
  value: ParsedInput.Value.Intermediate
): ParsedInput.Value.LinkedList;
/**
 * @todo parseLinkedListValue 자체를 recursive하게 수정할 수 있을듯
 */
export function parseLinkedListValue(
  value: ParsedInput.Value.Intermediate
): ParsedInput.Value.LinkedList {
  const recur = (
    cons: ParsedInput.Value.Intermediate,
    arr: ParsedInput.Value.LinkedList = []
  ): ParsedInput.Value.LinkedList => {
    console.log("recur", cons, typeof cons);
    if (typeof cons === "string") {
      if (!/^\w?Nil/.test(cons)) arr.push(cons);
      return arr;
    }

    const [item, rest] = cons.args;
    if (item instanceof ParsedInput.Value.Constructor) {
      arr.push(recur(item, []));
    } else arr.push(item);

    return recur(rest, arr);
  };

  return recur(typeof value === "string" ? parseConstructor(value)[0] : value);
}

// TODO: Implement tree data parser
export function parseTreeValue(value: string): ParsedInput.Value.Tree;
export function parseTreeValue(
  value: ParsedInput.Value.Constructor
): ParsedInput.Value.Tree;
export function parseTreeValue(
  value: ParsedInput.Value.Intermediate
): ParsedInput.Value.Tree;
export function parseTreeValue(
  value: ParsedInput.Value.Intermediate
): ParsedInput.Value.Tree {
  value.toString();
  return {
    isLeaf: true,
    children: [],
  } as ParsedInput.Value.Tree;
}

// const input =
//   "type bool =\n  | False\n  | True\n\nsynth bool -> bool -> bool satisfying\n\n[True,True] -> True,\n[True,False] -> False,\n[False,True] -> False,\n(*[False,False] -> False*)\n";
// console.log(input);
// console.log(sanitizeComment(input));

// const ex =
//   "type nat =\n  | O\n  | S of nat\n\ntype list =\n  | Nil\n  | Cons of nat * list\n\ntype cmp =\n  | LT\n  | EQ\n  | GT\n\nlet compare =\n  fix (compare : nat -> nat -> cmp) =\n    fun (x1 : nat) ->\n      fun (x2 : nat) ->\n        match x1 with\n        | O -> (match x2 with\n                | O -> EQ\n                | S _ -> LT)\n        | S x1 -> (match x2 with\n                | O -> GT\n                | S x2 -> compare x1 x2)\n;;\n\nsynth list -> nat -> list satisfying\n\n[Nil,0] -> Cons(0,Nil),\n[Cons(1,Nil),1] -> Cons(1,Nil),\n[Cons(1,Nil),2] -> Cons(1,Cons(2,Nil)),\n[Cons(2,Nil),0] -> Cons(0,Cons(2,Nil)),\n[Cons(2,Nil),1] -> Cons(1,Cons(2,Nil)),\n[Cons(0,Cons(1,Nil)),0] -> Cons(0,Cons(1,Nil)),\n[Cons(0,Cons(1,Nil)),2] -> Cons(0,Cons(1,Cons(2,Nil))),\n";
// const parsed = parseInput(ex);
// console.log(parsed);
// console.log(parsed.examples[1]);

// console.log(parseLinkedListValue("Nil"));
// console.log(parseLinkedListValue("Cons(0,Cons(1,Nil))"));

// console.log(parseLinkedListValue("Node (Node (Leaf, 0, Leaf), 1, Leaf)"));
// console.log(parseLinkedListValue("Node(Node(Leaf,0,Leaf),1,Leaf)"));
