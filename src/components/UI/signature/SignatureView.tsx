export interface SignatureViewProps {
  signature: string;
}

export function SignatureView({ signature }: SignatureViewProps) {
  return (
    <>
      <div>{signature}</div>
    </>
  );
}
