"use client";
import { DataTable } from "@/components/ui-extends/data-table";

import { getToken } from "@/lib/tokenUtil";
import { Role } from "@prisma/client";

import { deleteRole, getRoleList } from "@repo/database/services/role";

import React, { useEffect, useRef, useState } from "react";
import { useColumns } from "./_components/columns";
import RoleEditModal from "./_components/RoleEditModal";
import { checkAuth } from "../_components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CreateRoleModal from "./_components/CreateRoleModal";
import { useModal } from "@/components/ui-extends/Modal";
import { useTranslations } from "next-intl";
import { PermissionEnum } from "@/models/permission.model";

const page = () => {
  const t = useTranslations();

  const [roles, setRoles] = useState<Array<Role>>([]);

  const [totalCount, setTotalCount] = useState(0);
  const [totalPage, setTotalPage] = useState(0);

  const [loading, setLoading] = useState(false);
  const paginationParams = useRef({
    pageId: 1,
    pageSize: 10,
  });

  const [open, setOpen] = useState(false);
  const [createRoleModalOpen, setCreateRoleModalOpen] = useState(false);
  const [actionRoleId, setActionRoleId] = useState("");
  const onEdit = (roleId: string) => {
    setActionRoleId(roleId);
    setOpen(true);
  };

  const { contextHandler, show, close } = useModal();
  const onDelete = (roleId: string) => {
    show({
      title: t("delete-role"),
      content: t("delete-role-tip"),
      onConfirm: async () => {
        const res = await deleteRole(roleId);
        if (res.code === 200) {
          setRoles(roles.filter((role) => role.id !== roleId));
          close();
        }
      },
    });
  };

  const columns = useColumns({ onEdit, onDelete });

  useEffect(() => {
    async function run() {
      setLoading(true);
      const res = await getRoleList(getToken(), paginationParams.current);
      if (res.data?.list) {
        setRoles(res.data.list);
        setTotalCount(res.data.totalCount);
        setTotalPage(res.data.totalPage);
      }
      setLoading(false);
    }

    run();
  }, []);

  return (
    <section className="p-4">
      <div className="mb-4 flex justify-end">
        {checkAuth(PermissionEnum.RoleCreate) && (
          <Button onClick={() => setCreateRoleModalOpen(true)}>
            <Plus className="mr-1" width={20} height={20} />
            <span>{t("create-role")}</span>
          </Button>
        )}
      </div>
      <DataTable
        mark="roles"
        columns={columns}
        loading={loading}
        data={roles}
        totalCount={totalCount}
        totalPage={totalPage}
      />
      {actionRoleId && (
        <RoleEditModal roleId={actionRoleId} open={open} setOpen={setOpen} />
      )}

      <CreateRoleModal
        open={createRoleModalOpen}
        setOpen={setCreateRoleModalOpen}
      />
      {contextHandler}
    </section>
  );
};

export default page;
