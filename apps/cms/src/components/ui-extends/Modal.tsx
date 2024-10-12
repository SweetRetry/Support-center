import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useSize } from "ahooks";

import { X } from "lucide-react";
import { Button, buttonVariants } from "../ui/button";
import { useState } from "react";
import ButtonLoading from "./ButtonLoading";
import { cn } from "@/lib/utils";
import { VariantProps } from "class-variance-authority";
import { useTranslations } from "next-intl";

export function Modal({
  title,
  open,
  setOpen,
  description,
  children,
  trigger,
  width,
  limitHeight,
}: {
  title: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  description?: string | React.ReactNode;
  children: React.ReactNode;
  trigger?: React.ReactNode;
  width?: string | number;
  limitHeight?: boolean;
}) {
  const size = useSize(() => document.querySelector("body"));

  const dialogWidth = width
    ? typeof width === "string"
      ? width
      : width + "px"
    : "450px";

  if ((size?.width || 1080) >= 768) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent
          style={{
            width: dialogWidth,
            minWidth: dialogWidth,
            maxWidth: size?.width,
          }}
          className="p-0 text-sm"
        >
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>{title}</DialogTitle>

            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div
            className={cn("p-6 pt-0", {
              "max-h-[80vh] overflow-auto": limitHeight,
            })}
          >
            {children}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent className="text-sm">
        <DrawerHeader className="text-left">
          <div className="flex items-center justify-between">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerClose asChild>
              <X className="h-4 w-4" />
            </DrawerClose>
          </div>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="max-h-[90vh] overflow-auto p-4">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}

interface UseModalConfig {
  title: string;
  content: string;
  description?: string | React.ReactNode;
  width?: string | number;
  onConfirm: () => Promise<void> | void;
  onCancel?: () => void;
  variant?: VariantProps<typeof buttonVariants>["variant"];
}

// 封装useModalHook
export function useModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [state, setState] = useState<UseModalConfig>({
    title: "",
    content: "",
    description: "",
    onConfirm: () => {},
    onCancel: () => {},
    variant: "default",
  });

  const t = useTranslations();

  const show = ({
    title,
    content,
    description,
    onConfirm,
    onCancel,
    variant,
  }: UseModalConfig) => {
    setState({
      title,
      content,
      description,
      onConfirm,
      onCancel,
      variant: variant || "default",
    });
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    state?.onCancel && state.onCancel();
  };

  return {
    show,
    close,
    contextHandler: (
      <Modal
        title={state?.title}
        open={open}
        setOpen={setOpen}
        description={state?.description}
      >
        <div>{state?.content}</div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => close()}>
            {t("cancel")}
          </Button>
          <ButtonLoading
            variant={state.variant}
            loading={loading}
            onClick={async () => {
              setLoading(true);
              await state.onConfirm();
              setLoading(false);
            }}
          >
            {t("confirm")}
          </ButtonLoading>
        </div>
      </Modal>
    ),
  };
}
