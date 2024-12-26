import { Class } from "./types";

export namespace ParsedInput {
  export interface Function {
    name: string;
    code: string;
  }
  // export type Function = string;

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
    type: "variants";
    variants: (Type | string)[];
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
      Variants = "variants",
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
          arg instanceof Constructor ? arg.raw : arg.raw,
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
          index + 1,
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
  readonly signature: ParsedInput.Signature | null;
  readonly examples: ParsedInput.Example[];
}

function parseConstructor(value: string): ParsedInput.Value.Intermediate[] {
  let current: ParsedInput.Value.Constructor =
    new ParsedInput.Value.Constructor("default");

  // find first Constructor symbol
  do {
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
  value: ParsedInput.Value.Intermediate,
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
  value: string | ParsedInput.Value.Intermediate,
): ParsedInput.Value.Any {
  const recur = (
    cons: ParsedInput.Value.Intermediate,
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
          `Cannot parse value ${cons.raw}: Cannot find node value in given input`,
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

// export function parseInput(input: string) {
//   input = sanitizeComment(input);
//   const splitted = input.split(/^synth/gm);
//   let defs = splitted[0];
//   const signatures = splitted[1];

//   const rawTypes: string[] = [];
//   const matchResult = defs.match(
//     /type\s*\w*\s*=(:?\s*[\w "]*)?(:?\s*\|\s*[\w "*]*)*/g,
//   );
//   if (matchResult)
//     matchResult.forEach((r) => {
//       rawTypes.push(r);
//       defs = defs.substring(defs.search(r) + r.length);
//       defs.trim();
//     });

//   const types = rawTypes.map((rawType) => {
//     const [name, rest] = rawType.split("=").map((v) => v.trim());

//     return {
//       name: name.replace(/^type/m, "").trim(),
//       type: "variants",
//       variants: rest
//         .split("|")
//         .map((v) => v.trim())
//         .filter((v) => v.length > 0),
//     } satisfies ParsedInput.Type;
//   });

//   // TODO Split functions
//   const functions = defs
//     .split(";;")
//     .map((v) => v.trim())
//     .filter((v) => v.length > 0)
//     .map((v) => v + "\n;;");

//   const [rawSignature, ...rawExamples] = signatures.split("\n");

//   // should use token base parser? -> Not yet
//   // TODO: parse signature
//   const signature = rawSignature;

//   const examples = rawExamples
//     .map((v) => v.trim())
//     .filter((v) => v.length > 0)
//     .flatMap((rawExample) => {
//       const [input, output] = rawExample.split("->").map((e) => e.trim());
//       // ignore partial text
//       if (!input || !output) return [];

//       return {
//         args: parseConstructor(input.slice(1, -1)),
//         result: parseConstructor(output)[0],
//       };
//     });

//   return { types, functions, signature, examples } satisfies ParsedInput;
// }

// const typeRegex = /type\s+(\w+)\s*=((?:\s*\|[\w\s"*]*)*)?(?=type|let|synth)/;
const typeRegex = /type\s+(\w+)\s*=([\w\s|"*]*)?(?=type|let|synth)/;
const functionRegex = /let\s+(\w+)\s*=\s*([^;]+);;/;
const signatureRegex = /synth\s+([^ ]+)(?:\s*->\s*([^ ]+))+\s*satisfying/;
const exampleRegex = /\[([^\]]+)\]\s*->\s*([^,]+),?/;

/**
 * @todo use parseValue in this step
 */
export function parseInput(input: string) {
  input = sanitizeComment(input);

  // parse types
  const types: ParsedInput.Type[] = [];

  let match: RegExpExecArray | null;
  while ((match = typeRegex.exec(input))) {
    console.log(match);
    const [, name, rest = ""] = match;
    const variants = rest
      .split("|")
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
    types.push({ name, type: "variants", variants });

    input = input.slice(match.index + match[0].length);
  }

  // parse functions
  const functions: ParsedInput.Function[] = [];

  while ((match = functionRegex.exec(input))) {
    const [, name, code] = match;
    functions.push({ name, code });

    input = input.slice(match.index + match[0].length);
  }

  // parse signature
  match = signatureRegex.exec(input);
  const signature = match ? match[0] : null;

  if (match) {
    input = input.slice(match.index + match[0].length);
  }

  // parse examples
  const examples: ParsedInput.Example[] = [];

  while ((match = exampleRegex.exec(input))) {
    const [, args, result] = match;
    examples.push({
      args: parseConstructor(args),
      result: parseConstructor(result)[0],
    });

    input = input.slice(match.index + match[0].length);
  }
  console.log({ types, functions, signature, examples });
  return { types, functions, signature, examples } as ParsedInput;
}

// const input =
//   "type bool =\n  | False\n  | True\n\nsynth bool -> bool -> bool satisfying\n\n[True,True] -> True,\n[True,False] -> False,\n[False,True] -> False,\n(*[False,False] -> False*)\n";
// console.log(input);
// console.log(sanitizeComment(input));

// console.log(parseConstructor(""));

// const ex = `type nat =
//   | O
//   | S of nat

// type list =
//   | Nil
//   | Cons of nat * list

// type bool =
//   | True
//   | False

// let sum =
//   fix (sum : nat -> nat -> nat) =
//     fun (n1 : nat) ->
//       fun (n2 : nat) ->
//         match n1 with
//         | O -> n2
//         | S n1p -> S (sum n1p n2)
// ;;

// let is_odd =
//   fix (is_odd : nat -> bool) =
//     fun (x1 : nat) ->
//       match x1 with
//       | O -> False
//       | S x1p ->
//         (match x1p with
//          | O -> True
//          | S x1pp -> is_odd x1pp)
// ;;

// let count_odd =
//   fun (n1:nat) ->
//     fun (n2:nat) ->
//       match is_odd n2 with
//       | True -> S n1
//       | False -> n1
// ;;

// synth (nat -> nat -> nat) -> nat -> list -> nat satisfying

// [sum,0,Nil] -> 0,
// [sum,0,Cons(2,Cons(1,Nil))] -> 3,
// [sum,0,Cons(3,Cons(2,Cons(1,Nil)))] -> 6,
// `;

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
