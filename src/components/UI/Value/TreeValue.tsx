import { useState } from "react";

import { Unstable_Popup as Popup } from "@mui/base";
import {} from "d3";

import { ParsedInput } from "@/utils/parsedInput";

export interface TreeValueProps {
  value: ParsedInput.Value.Tree;
}

export function TreeValue({ value }: TreeValueProps) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const open = Boolean(anchor);
  const id = open ? "simple-popup" : undefined;

  const name = `Tree(${value.children.length})`;

  return (
    <div>
      <button
        className="cursor-pointer transition leading-normal bg-neutral-700 text-white rounded-full px-4 py-2 border border-solid border-neutral-600 hover:bg-neutral-600 hover:border-neutral-500"
        aria-describedby={id}
        type="button"
        onMouseOver={(e) => setAnchor(e.currentTarget)}
        onMouseOut={() => setAnchor(null)}
      >
        {name}
      </button>
      <Popup
        id={id}
        open={open}
        anchor={anchor}
        placement="right-start"
        disablePortal
        className="z-50 min-h-64 min-w-64 rounded-lg ml-2 p-4 bg-[rgb(44_44_44_/_var(--tw-bg-opacity))] drop-shadow-lg text-neutral-100"
      >
        <div>The content of the Popup.</div>
      </Popup>
    </div>
  );
}
