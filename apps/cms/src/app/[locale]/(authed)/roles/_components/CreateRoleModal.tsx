import ButtonLoading from "@/components/ui-extends/ButtonLoading";
import { Modal } from "@/components/ui-extends/Modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { usePermissionDescrition } from "@/hooks/usePermission";
import { getToken } from "@/lib/tokenUtil";
import { PermissionEnum } from "@/models/permission.model";
import { zodResolver } from "@hookform/resolvers/zod";
import { Permission } from "@prisma/client";
import { getAllPermissions } from "@repo/database/services/permissions";
import { postCreateRole } from "@repo/database/services/role";
import { useTranslations } from "next-intl";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const RoleEditModal = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const t = useTranslations();

  const { PermissionDescription } = usePermissionDescrition();

  const [permissionGroup, setPermissionGroup] = useState<
    Record<
      string,
      {
        isChecked: boolean;
        id: string;
        name: string;
      }[]
    >
  >();

  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(
      z.object({
        name: z.string().min(1, { message: t("role-name-is-required") }),
      }),
    ),
    defaultValues: {
      name: "",
    },
  });

  const { toast } = useToast();

  const onConfirm = async () => {
    if (!permissionGroup) return;
    const success = await form.trigger();
    if (!success) return;
    setLoading(true);

    const permissionsId = Object.values(permissionGroup).flatMap((group) =>
      group.filter((item) => item.isChecked).map((item) => item.id),
    );

    const res = await postCreateRole({
      ...form.getValues(),
      permissionsId,
    });

    if (res.code === 200 && res.data) {
      setOpen(false);
      toast({
        title: t("success"),
        description: t("create-role-successfully"),
      });
    }
    setLoading(false);
  };

  const cachePermissions = useRef<Permission[]>();

  const onClose = () => {
    form.reset();
    form.clearErrors();
    setOpen(false);
  };
  useEffect(() => {
    async function init() {
      if (cachePermissions.current) {
        return;
      }
      const res = await getAllPermissions(getToken());

      if (res.code === 200 && res.data) {
        cachePermissions.current = res.data;
        const _permissions: Record<
          string,
          {
            isChecked: boolean;
            id: string;
            name: string;
          }[]
        > = {};

        res.data.forEach((permission) => {
          const [group, _] = permission.name.split(":");
          if (!_permissions[group]) {
            _permissions[group] = [];
          }
          _permissions[group].push({
            ...permission,
            isChecked: false,
          });
        });

        setPermissionGroup(_permissions);
      }
    }

    open && init();
  }, [open]);

  return (
    <Modal
      title={t("create-role")}
      open={open}
      setOpen={(open) => {
        if (!open) onClose();
        setOpen(open);
      }}
    >
      <div className="space-y-4">
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("role-name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("role-name")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        {permissionGroup &&
          Object.entries(permissionGroup).map(([group, permissions]) => (
            <div key={group}>
              <p className="mb-2">{t(group)}</p>
              <div className="-mx-2 flex flex-wrap items-center gap-y-2">
                {permissions.map((permission) => (
                  <div
                    className="flex basis-1/2 items-center space-x-2 px-2"
                    key={permission.id}
                  >
                    <Checkbox
                      aria-describedby={permission.id}
                      checked={permission.isChecked}
                      onCheckedChange={(checked: boolean) => {
                        setPermissionGroup((prev) => {
                          if (!prev) return;
                          return {
                            ...prev,
                            [group]: prev?.[group].map((p) => ({
                              ...p,
                              isChecked:
                                p.id === permission.id ? checked : p.isChecked,
                            })),
                          };
                        });
                      }}
                    />
                    <label>
                      {PermissionDescription[permission.name as PermissionEnum]}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}

        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={() => onClose()}>
            {t("cancel")}
          </Button>

          <ButtonLoading loading={loading} onClick={() => onConfirm()}>
            {t("confirm")}
          </ButtonLoading>
        </div>
      </div>
    </Modal>
  );
};

export default RoleEditModal;
