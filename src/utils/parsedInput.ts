import { Class } from "./types";

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
      Constructor = "constructor",
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

  export abstract class Value {
    abstract readonly type: Type.All;
    abstract readonly raw: string;

    toString() {
      return this.raw;
    }
  }

  export namespace Value {
    export class Unknown extends Value {
      readonly type = Type.Unknown.Unknown;
      constructor(readonly raw: string) {
        super();
      }
    }

    export class Constructor extends Value {
      readonly type = Type.UserDefined.Constructor;
      readonly name: string;
      readonly args: (Unknown | Constructor)[];
      parent?: Constructor;

      constructor(name: string) {
        super();
        this.name = name;
        this.args = [];
      }

      addArgument(arg: Unknown | Constructor) {
        this.args.push(arg);
        if (arg instanceof Constructor) arg.parent = this;
      }

      get raw(): string {
        return `${this.name}(${this.args.map((arg) =>
          arg instanceof Constructor ? arg.raw : arg.raw
        )})`;
      }
    }

    export class LinkedList<T extends Any = Any> extends Value {
      readonly type = Type.Kind.LinkedList;
      readonly name: string;
      readonly elements: T[] = [];

      constructor(name: string) {
        super();
        this.name = name;
      }

      connect(list: LinkedList<T>) {
        this.elements.push(...list.elements);
      }

      get raw() {
        return this.rawRecursive();
      }

      private rawRecursive(index = 0): string {
        if (this.elements.length === index) return "Nil";
        return `Cons(${this.elements[index].raw},${this.rawRecursive(
          index + 1
        )})`;
      }
    }

    class _Tree extends Value {
      readonly type = Type.Kind.Tree;
      parent?: Node;
      readonly isLeaf: boolean;
      readonly value?: Any;
      readonly children?: Tree[] = [];

      private constructor(isLeaf: true);
      private constructor(isLeaf: false, value: Any, children?: Tree[]);
      private constructor(isLeaf: boolean, value?: Any, children: Tree[] = []) {
        super();
        this.isLeaf = isLeaf;
        this.value = value;
        children.forEach((child) => (this as Node).addChild(child));
      }

      addChild<TThis extends Node = Node>(this: TThis, child: Tree) {
        this.children.push(child);
        child.parent = this;
      }

      get raw(): string {
        if (this.isLeaf) return "Leaf";

        const args = [(this as Node).value.raw];
        (this as Node).children.forEach((child) => args.push(child.raw));
        return `Node(${args.join(",")})`;
      }

      get name(): string {
        return this.isLeaf ? "Leaf" : (this as Node).value.raw;
      }

      static createLeaf() {
        return new Tree(true) as Leaf;
      }

      static createNode(value: Any, children: Tree[] = []) {
        return new Tree(false, value, children);
      }

      static isLeaf(value: Tree): value is Leaf {
        return value.isLeaf;
      }

      static isNode(value: Tree): value is Node {
        return !value.isLeaf;
      }
    }

    interface Leaf extends _Tree {
      readonly isLeaf: true;
      readonly value?: never;
      readonly children?: never;
    }

    interface Node extends _Tree {
      readonly isLeaf: false;
      readonly value: Any;
      readonly children: Tree[];
    }

    export type Tree = Leaf | Node;
    export const Tree = _Tree as Class<Tree, typeof _Tree>;

    // export namespace Tree {
    //   export class Leaf extends Tree {
    //     readonly _isLeaf = true;
    //   }

    //   export class Node extends Tree {
    //     readonly _isLeaf = false;
    //     readonly value: Any;
    //     readonly children: Tree[] = [];

    //     constructor(value: Any, children: Tree[] = []) {
    //       super();
    //       this.value = value;
    //       children.forEach((v) => this.addChild(v));
    //     }

    //     addChild(child: Tree) {
    //       this.children.push(child);
    //       child.parent = this;
    //     }
    //   }
    // }

    export type Intermediate = Unknown | Constructor;
    export type Any = Intermediate | LinkedList | Tree;
  }

  // interface ValueBase {
  //   type: Type.All;
  //   value: Value.Any;
  // }
  // interface ValueLinkedList extends ValueBase {
  //   type: Type.Kind.LinkedList;
  //   value: Value.LinkedList;
  // }
  // interface ValueTree extends ValueBase {
  //   type: Type.Kind.Tree;
  //   value: Value.Tree;
  // }
  // interface ValueUnknown extends ValueBase {
  //   type: Exclude<Type.All, Type.Kind>;
  //   value: Exclude<Value.Any, Value.LinkedList | Value.Tree>;
  // }

  // export type Value = ValueTree | ValueLinkedList | ValueUnknown;
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
  do {
    // console.log(value);
    let match: RegExpExecArray | null = null;
    if ((match = /^\)(?:\s*,)?/.exec(value))) {
      if (current.parent) current = current.parent;
    } else if ((match = /^(\w+?)\s*\(/.exec(value))) {
      const sub = new ParsedInput.Value.Constructor(match[1]);
      current.addArgument(sub);
      current = sub;
    } else if ((match = /(\w+)(?:\s*,)?/.exec(value))) {
      current.addArgument(new ParsedInput.Value.Unknown(match[1]));
    } else continue;

    value = value.slice(match[0].length).trim();
  } while (value.length > 0);

  return current.args.map((arg) => {
    if (arg.type === ParsedInput.Type.UserDefined.Constructor)
      arg.parent = undefined;
    return arg;
  });
}

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
    value.raw.startsWith("Nil") ||
    value.raw.startsWith("Cons") ||
    value.raw.startsWith("LNil") ||
    value.raw.startsWith("LCons")
  )
    return ParsedInput.Type.Kind.LinkedList;

  if (value.raw.startsWith("Leaf") || value.raw.startsWith("Node"))
    return ParsedInput.Type.Kind.Tree;

  return ParsedInput.Type.Unknown.Unknown;
}

export function parseValue(
  value: string | ParsedInput.Value.Intermediate
): ParsedInput.Value.Any {
  const recur = (
    cons: ParsedInput.Value.Intermediate
  ): ParsedInput.Value.Any => {
    let match: RegExpExecArray | null;

    if (cons.type === ParsedInput.Type.Unknown.Unknown) {
      // tree leaf
      if (cons.raw === "Leaf") return ParsedInput.Value.Tree.createLeaf();
      // linked list end
      if ((match = /^(\w?)Nil$/.exec(cons.raw)))
        return new ParsedInput.Value.LinkedList(match[1] + "Cons");

      return cons;
    }

    /**
     * @todo 각 Kind class (Tree, Linked list)마다 가지는
     * Constructor name을 매칭시키는 코드 추가
     * @example ParsedInput.Value.Tree.isNode(cons)
     */
    // tree node
    if (cons.name == "Node") {
      // cons is Constructor
      const children: ParsedInput.Value.Tree[] = [];
      let treeValue: ParsedInput.Value.Any | null = null;
      for (const arg of cons.args) {
        const result = recur(arg);
        if (result instanceof ParsedInput.Value.Tree) children.push(result);
        else treeValue = result;
      }

      if (!treeValue)
        throw new Error(
          `Cannot parse value ${cons.raw}: Cannot find node value in given input`
        );
      return ParsedInput.Value.Tree.createNode(treeValue, children);
    }

    // linked list
    if ((match = /^(\w?)Cons$/.exec(cons.name))) {
      const list = new ParsedInput.Value.LinkedList(cons.name);

      const [item, rest] = cons.args;
      if (item instanceof ParsedInput.Value.Constructor) {
        list.elements.push(recur(item));
      } else list.elements.push(item);

      const restParsed = recur(rest);
      if (restParsed.type === ParsedInput.Type.Kind.LinkedList)
        list.connect(restParsed);
      else list.elements.push(restParsed);

      return list;
    }

    return recur(cons);
  };

  return recur(typeof value === "string" ? parseConstructor(value)[0] : value);
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

/**
 * @todo use parseValue in this step
 */
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

// const input =
//   "type bool =\n  | False\n  | True\n\nsynth bool -> bool -> bool satisfying\n\n[True,True] -> True,\n[True,False] -> False,\n[False,True] -> False,\n(*[False,False] -> False*)\n";
// console.log(input);
// console.log(sanitizeComment(input));

// console.log(parseConstructor(""));

// const ex =
//   "type nat =\n  | O\n  | S of nat\n\ntype list =\n  | Nil\n  | Cons of nat * list\n\ntype cmp =\n  | LT\n  | EQ\n  | GT\n\nlet compare =\n  fix (compare : nat -> nat -> cmp) =\n    fun (x1 : nat) ->\n      fun (x2 : nat) ->\n        match x1 with\n        | O -> (match x2 with\n                | O -> EQ\n                | S _ -> LT)\n        | S x1 -> (match x2 with\n                | O -> GT\n                | S x2 -> compare x1 x2)\n;;\n\nsynth list -> nat -> list satisfying\n\n[Nil,0] -> Cons(0,Nil),\n[Cons(1,Nil),1] -> Cons(1,Nil),\n[Cons(1,Nil),2] -> Cons(1,Cons(2,Nil)),\n[Cons(2,Nil),0] -> Cons(0,Cons(2,Nil)),\n[Cons(2,Nil),1] -> Cons(1,Cons(2,Nil)),\n[Cons(0,Cons(1,Nil)),0] -> Cons(0,Cons(1,Nil)),\n[Cons(0,Cons(1,Nil)),2] -> Cons(0,Cons(1,Cons(2,Nil))),\n";
// const parsed = parseInput(ex);
// console.log(parsed);
// console.log(parsed.examples[1]);

// console.log(parseValue(parseConstructor("Nil")[0]));
// console.log(parseValue(parseConstructor("Cons(0,Cons(1,Nil))")[0]));
// console.log(
//   parseValue(parseConstructor("Cons(1,Cons(2,Cons(2,Cons(2,Cons(0,Nil)))))")[0])
// );

// console.log(parseValue(parseConstructor("Leaf")[0]));
// console.log(
//   parseValue(parseConstructor("Node (Node (Leaf, 0, Leaf), 1, Leaf)")[0])
// );
// console.log(
//   parseValue(parseConstructor("Node(Node(Leaf,0,Leaf),1,Leaf)")[0])
// );
// console.log(
//   parseValue(
//     parseConstructor("Node(Node(Leaf,1,Leaf),2,Node(Leaf,0,Leaf))")[0]
//   )
// );
// console.log(
//   parseValue(parseConstructor("Node(1,Node(0,Leaf,Leaf),Leaf)")[0])
// );
