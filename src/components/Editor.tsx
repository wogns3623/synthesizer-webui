import AceEditor, { IAceEditorProps } from "react-ace";
import "ace-builds/src-noconflict/mode-ocaml";
import "ace-builds/src-noconflict/theme-github_dark";
import "ace-builds/src-noconflict/ext-language_tools";

export function Editor(props: IAceEditorProps) {
  return <AceEditor {...props} />;
}
