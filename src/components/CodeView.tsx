import { Dispatch } from "react";
import { Editor } from "./Editor";

export interface CodeViewProps {
  input: string;
  setInput: Dispatch<string>;
  className?: string;
}

export function CodeView({ input, setInput, className }: CodeViewProps) {
  return (
    <Editor
      mode="ocaml"
      theme="github_dark"
      width="auto"
      height="auto"
      className={className}
      defaultValue={input}
      value={input}
      onChange={(value) => setInput(value)}
    />
  );
}
