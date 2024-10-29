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
      width="100%"
      height="100%"
      className={className ?? ""}
      defaultValue={input}
      value={input}
      onChange={(value) => setInput(value)}
    />
  );
}
