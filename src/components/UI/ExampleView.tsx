export interface ExampleElementProps {
  example: string;
}

export function ExampleElement({ example }: ExampleElementProps) {
  return (
    <>
      <div>{example}</div>
    </>
  );
}
