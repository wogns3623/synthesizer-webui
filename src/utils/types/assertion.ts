import { IsNever } from './types';

/**
 * @example
 * ```typescript
 * enum Foo {
 *   A = 'A',
 *   B = 'B',
 * }
 *
 * function bar(foo: Foo) {
 *   if (foo === Foo.A) return processA();
 *   else if (foo === Foo.B) return processB();
 *   else throw new UnreachableError(foo); // if foo is not never, can check it in compile time
 * }
 * ```
 */
export class UnreachableError extends Error {
  value: any;

  /**
   * @see {@link https://basarat.gitbook.io/typescript/type-system/discriminated-unions#throw-in-exhaustive-checks}
   */
  constructor(value: any, message?: string) {
    super(`Unreachable Error:${message ? ` ${message}` : ''} ${JSON.stringify(value)}`);
    this.value = value;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      value: this.value,
      stack: this.stack,
    };
  }
}

/**
 * @example
 * ```typescript
 * enum Foo {
 *   A = 'A',
 *   B = 'B',
 * }
 *
 * function bar(foo: Foo) {
 *   if (foo === Foo.A) return processA();
 *   else if (foo === Foo.B) return processB();
 *   else return Unreachable(foo); // if foo is not never, can check it in compile time
 * }
 * ```
 */
export const Unreachable = (value: never) => {
  throw new UnreachableError(value);
};

type KeyofAllUnion<T> = T extends infer U ? keyof U : never;

// 이 방식으로 하면 왠지모르게 A type predicate's type must be assignable to its parameter's type. ts(2677) 에러가 남
// type HasReturn1<T, K extends PropertyKey> = T extends infer U
//   ? K extends keyof U
//   ? U
//   : never
//   : never;
// type HasReturn<
// TOrigin,
// K extends PropertyKey,
// TRes = HasReturn1<TOrigin, K>,
// > = IsNever<TRes> extends true ? TOrigin & { [key in K]: unknown } : TRes;

/** unknown이 union에 병합되지 않도록 tuple로 만듬 */
type HasReturn1<T, K extends PropertyKey> = T extends infer U
  ? K extends keyof U
    ? [U]
    : [unknown]
  : never;
/** union의 각 튜플로 감싸진 타입을 꺼내 unknown인경우 never로 만듬 */
type HasReturn2<T> = T extends [infer U] ? (unknown extends U ? never : U) : never;
type HasReturn<
  TOrigin,
  K extends PropertyKey,
  // TRes = HasReturn2<HasReturn1<TOrigin, K>>,
> = IsNever<HasReturn2<HasReturn1<TOrigin, K>>> extends true
  ? TOrigin & { [key in K]: unknown }
  : HasReturn2<HasReturn1<TOrigin, K>>;

export interface HasAssertion {
  /**
   * @example
   * ```typescript
   * type T1 = { id: number; a: 'a'; b: 'b' };
   * type T2 = T1 | ({ c: 'c' });
   *
   * declare const arr: T2[];
   * const bOnly = arr.filter(has('id')); // T1[]
   * const withUnknown = arr.filter(has('ids')); // (T2 & { ids: unknown })[]
   * ```
   */
  <T extends object, K extends keyof T>(obj: T, key: K): obj is HasReturn<T, K>;
  <T extends object, K extends PropertyKey>(obj: T, key: K): obj is HasReturn<T, K>;
  <K extends PropertyKey>(key: K): <T extends object>(obj: T) => obj is HasReturn<T, K>;
}

export const has = ((...args: [key: PropertyKey] | [obj: object, key: PropertyKey]) => {
  if (args.length === 2) {
    const [obj, key] = args;
    return key in obj;
  } else {
    const [key] = args;
    return (obj: object, index?: number, arr?: object[]): boolean => {
      // if (typeof index === 'number' && Array.isArray(arr)) {
      //   // use in array.filter
      // }

      return key in obj;
    };
  }
}) as HasAssertion;

// type T1 = { id: number; a: 'a'; b: 'b' };
// type T2 = T1 | ( { c: 'c' });
// type T3 = HasReturn<T2, 'id'>;
// type T4 = HasReturn<T2, 'ids'>;
// type T5 = HasReturn<T2, 'c'>;

// type T11 = KeyofAllUnion<T2>

// declare const arr: T2[];
// const bOnly = arr.filter(has('id'));
// const withUnknown = arr.filter(has('ids'));
