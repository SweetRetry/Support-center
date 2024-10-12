import { Modal } from "@/components/ui-extends/Modal";
import { Checkbox } from "@/components/ui/checkbox";
import { usePermissionDescrition } from "@/hooks/usePermission";
import { PermissionEnum } from "@repo/database/models/permission.model";

import { getRolePermissionsById } from "@repo/database/services/role";
import { useTranslations } from "next-intl";
import React, { useEffect, useRef, useState } from "react";

const RoleCheckModal = ({
  roleId,
  open,
  setOpen,
}: {
  roleId: string;
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

  const initialPermissions = useRef<string[]>();

  useEffect(() => {
    async function run() {
      const res = await getRolePermissionsById(roleId);
      console.log(res);
      if (res.data) {
        const _permissions: Record<
          string,
          {
            isChecked: boolean;
            id: string;
            name: string;
          }[]
        > = {};

        initialPermissions.current = res.data
          .filter((item) => item.isChecked)
          .map((item) => item.id);

        res.data.forEach((permission) => {
          const [group, _] = permission.name.split(":");
          if (!_permissions[group]) {
            _permissions[group] = [];
          }
          _permissions[group].push(permission);
        });

        setPermissionGroup(_permissions);
      }
    }
    open && run();
  }, [roleId, open]);

  return (
    <Modal title={t("check-permission")} open={open} setOpen={setOpen}>
      <div className="space-y-4">
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
                      disabled
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
      </div>
    </Modal>
  );
};

export default RoleCheckModal;
