import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ElementFormatType, FORMAT_ELEMENT_COMMAND } from "lexical";
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";
import React from "react";

const elementFormatType: Record<
  Exclude<ElementFormatType, "">,
  { icon: JSX.Element; label: string; iconRTL: JSX.Element }
> = {
  left: {
    icon: <AlignLeft />,
    iconRTL: <AlignLeft />,
    label: "Left Align",
  },
  center: {
    icon: <AlignCenter />,
    iconRTL: <AlignCenter />,
    label: "Center Align",
  },
  right: {
    icon: <AlignRight />,
    iconRTL: <AlignRight />,
    label: "Right Align",
  },
  justify: {
    icon: <AlignJustify />,
    iconRTL: <AlignJustify />,
    label: "Justify Align",
  },
  start: {
    icon: <AlignLeft />,
    iconRTL: <AlignRight />,
    label: "Start Align",
  },
  end: {
    icon: <AlignRight />,
    iconRTL: <AlignLeft />,
    label: "End Align",
  },
};
const AlignPlugin = ({
  elementFormat,
  isRTL,
}: {
  elementFormat: ElementFormatType;
  isRTL: boolean;
}) => {
  const [editor] = useLexicalComposerContext();
  const formatOption = elementFormatType[elementFormat || "left"];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="capitalize">
          <span className="mr-1">{formatOption.icon}</span>
          {formatOption.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {Object.entries(elementFormatType).map(([key, value]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => {
              editor.dispatchCommand(
                FORMAT_ELEMENT_COMMAND,
                key as ElementFormatType,
              );
            }}
          >
            <Button variant="ghost" size="sm">
              {isRTL ? value.iconRTL : value.icon}
              <span className="ml-1">{value.label}</span>
            </Button>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AlignPlugin;
