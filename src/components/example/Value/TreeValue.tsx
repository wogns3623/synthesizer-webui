import { Tree } from "react-d3-tree";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { ParsedInput } from "@/utils/parsedInput";
import { useLayoutEffect, useRef, useState } from "react";

export interface TreeValueProps {
  value: ParsedInput.Value.Tree;
  popoverWidth?: number;
}

export function TreeValue({ value }: TreeValueProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const name = `Tree(${value.isLeaf ? value.raw : value.children.length})`;
  const [popoverWidth, setPopoverWidth] = useState(256);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const parent = containerRef.current.parentElement;
    if (!parent) return;

    setPopoverWidth(parent.clientWidth);
    const resizeHandler = () => setPopoverWidth(parent.clientWidth);

    parent.addEventListener("resize", resizeHandler);
    return () => parent.removeEventListener("resize", resizeHandler);
  }, []);

  return (
    <div
      onResize={() => {
        if (!containerRef.current) return;
        setPopoverWidth(containerRef.current.clientWidth);
      }}
      ref={containerRef}
    >
      <Popover>
        <PopoverTrigger className="inline-block rounded-lg border border-solid border-neutral-600 bg-neutral-700 px-4 py-2 text-white hover:border-neutral-500 hover:bg-neutral-600">
          {name}
        </PopoverTrigger>
        <PopoverContent
          className="m-4 h-72 p-0 shadow-lg"
          style={{ width: popoverWidth - 32 }}
          side="bottom"
          align="end"
        >
          <Tree
            data={value}
            pathFunc="straight"
            orientation="vertical"
            collapsible={false}
            translate={{ x: (popoverWidth - 32) / 2, y: 72 }}
            svgClassName="h-72"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
