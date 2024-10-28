export interface FunctionElementProps {
  value: string;
}

export function FunctionElement({ value }: FunctionElementProps) {
  return (
    <>
      <div>{value}</div>
    </>
  );
}
