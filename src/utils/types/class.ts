import { NonMatchKeys, OmitValue } from './types';

type _AbstractConstructor<TInstance = any, TArgs extends any[] = any[]> = abstract new (
  ...args: TArgs
) => TInstance;
export interface AbstractConstructor<TInstance = any, TArgs extends any[] = any[]>
  extends Function,
    _AbstractConstructor<TInstance, TArgs> {}

export interface Constructor<TInstance = any, TArgs extends any[] = any[]> extends Function {
  new (...args: TArgs): TInstance;
}

/**
 * @summary Methods of Class
 */
export type MethodsOf<TClass> = keyof TClass extends infer K
  ? K extends keyof TClass
    ? TClass[K] extends (...args: any[]) => any
      ? K
      : never
    : never
  : never;

type NonConstructorKeys<TStatic> = NonMatchKeys<TStatic, Constructor | AbstractConstructor>;
type NonConstructor<TStatic> = OmitValue<TStatic, Constructor | AbstractConstructor>;

/**
 * @example
 * ```typescript
 * interface AStaticImpl {}
 *
 * interface AStaticMixin {}
 *
 * @ClassStatic<AStaticImpl>()
 * class A {}
 *
 * // mixin some static properties
 *
 * // define class(constructor) value & type
 * const CompleteA = A as Class<A, typeof A & AStaticMixin>
 * // define instance type
 * type CompleteA = A
 *
 * // using CompleteA as a class
 *
 * const a = new CompleteA()
 *
 * interface WithA<T extends CompleteA> {
 *   a: T
 * }
 *
 * type AConstructor = typeof CompleteA
 * ```
 */
export type Class<TClassInstance, TClassStatic extends object> = TClassStatic &
  Constructor<TClassInstance>;

export type AbstractClass<TClassInstance, TClassStatic extends object> = TClassStatic &
  AbstractConstructor<TClassInstance>;

export type ClassStaticDecorator<T> = (target: T) => void;

/**
 * @summary class decorator for enforce to implement class static properties
 */
export function ClassStatic<T>() {
  return function () {} as ClassStaticDecorator<T>;
}
