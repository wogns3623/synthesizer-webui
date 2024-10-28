export interface ExampleViewProps {
  examples: string[];
}

export function ExampleView({ examples }: ExampleViewProps) {
  return (
    <>
      <div>{examples.flatMap((line, key) => [line, <br key={key} />])}</div>
    </>
  );
}
