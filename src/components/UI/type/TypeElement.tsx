import {
  DetailedHTMLProps,
  Dispatch,
  InputHTMLAttributes,
  SetStateAction,
  useRef,
} from "react";
import { useImmer } from "use-immer";

export interface TypeElementProps {
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
}

interface BaseTypeDefinition {
  name: string;
  type: "variant" | "record" | "aliases";
}

interface VariantTypeDefinition extends BaseTypeDefinition {
  type: "variant";
  variants: string[];
}

interface RecordTypeDefinition extends BaseTypeDefinition {
  type: "record";
}

interface AliasesTypeDefinition extends BaseTypeDefinition {
  type: "aliases";
}

type TypeDefinition =
  | VariantTypeDefinition
  | RecordTypeDefinition
  | AliasesTypeDefinition;

export function TypeElement({ value, setValue }: TypeElementProps) {
  const [type, updateType] = useImmer(() => {
    const [name, variants] = value.replace("type", "").split("=");
    return {
      name: name.trim(),
      type: "variant",
      variants: variants
        .split("|")
        .map((v) => v.trim())
        .filter((v) => v.length > 0),
    } satisfies TypeDefinition;
  });

  return (
    <>
      <div className="flex justify-start items-center gap-x-2">
        <div>type</div>

        <AutoResizeInput
          value={type.name}
          onChange={(e) =>
            updateType((draft) => {
              draft.name = e.target.value;
            })
          }
          onBlur={(e) => {
            setValue(e.target.value);
          }}
        />

        <div> = </div>

        {type.variants.map((variant, index) => (
          <div key={index}>
            <span>|</span> {variant}
          </div>
        ))}
      </div>
    </>
  );
}

function AutoResizeInput(
  props: DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >
) {
  const sizeMeasureRef = useRef(null);

  return (
    <div className="relative w-min">
      <input {...props} className="absolute left-0 w-full" />
      <span className="invisible whitespace-pre" ref={sizeMeasureRef}>
        {props.value ?? ""}
      </span>
    </div>
  );
}
