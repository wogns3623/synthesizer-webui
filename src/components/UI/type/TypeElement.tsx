export interface TypeElementProps {
  value: string;
}

export function TypeElement({ value }: TypeElementProps) {
  return (
    <>
      <div>{value}</div>
    </>
  );
}
