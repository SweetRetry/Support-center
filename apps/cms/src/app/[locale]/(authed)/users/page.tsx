"use client";
import { useList } from "@/hooks/useList";
import React, { useEffect, useState } from "react";
import { getUserList } from "@repo/database/services/user";
import { useColumns } from "./_components/columns";
import { DataTable } from "@/components/ui-extends/data-table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Plus } from "lucide-react";
import RoleCheckModal from "./_components/RoleCheckModal";
import CreateUserModal from "./_components/CreateUserModal";
import { checkAuth } from "../_components/AuthProvider";
import { useTranslations } from "next-intl";
import { PermissionEnum } from "@/models/permission.model";
const page = () => {
  const t = useTranslations();
  const [emailLike, setEmailLike] = useState("");

  const { fetch, data, totalCount, totalPage, loading, params, debounceFetch } =
    useList(
      {
        emailLike,
      },
      getUserList,
    );

  const [actionRoleId, setActionRoleId] = useState<string | undefined>();
  const [open, setOpen] = useState(false);

  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);

  const onEdit = (roleId?: string) => {
    setActionRoleId(roleId);
    setOpen(true);
  };

  const columns = useColumns({
    onEdit,
  });

  useEffect(() => {
    fetch();
  }, []);

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between">
        <Input
          className="max-w-[300px]"
          value={emailLike}
          onChange={(e) => {
            setEmailLike(e.target.value);
            params.current.emailLike = e.target.value;
            debounceFetch();
          }}
          placeholder={t("search-user-by-email")}
        />

        {checkAuth(PermissionEnum.UserCreate) && (
          <Button onClick={() => setCreateUserModalOpen(true)}>
            <Plus className="mr-1" width={20} height={20} />
            <span>{t("create-user")}</span>
          </Button>
        )}
      </div>
      <DataTable
        mark="users"
        data={data}
        loading={loading}
        totalCount={totalCount}
        totalPage={totalPage}
        columns={columns}
      />
      {actionRoleId && (
        <RoleCheckModal open={open} setOpen={setOpen} roleId={actionRoleId} />
      )}
      <CreateUserModal
        open={createUserModalOpen}
        setOpen={setCreateUserModalOpen}
        onSuccess={fetch}
      />
    </div>
  );
};

export default page;
