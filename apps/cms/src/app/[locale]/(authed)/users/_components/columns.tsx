"use client";

import { Button } from "@/components/ui/button";

import { formatToUtcTime } from "@repo/utils/dayjsUtil";

import { UserListItem } from "@repo/database/services/user";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";

export const useColumns = ({
  onEdit,
}: {
  onEdit: (roleId?: string) => void;
}) => {
  const t = useTranslations();

  const columns: ColumnDef<UserListItem>[] = [
    {
      accessorKey: "email",
      header: t("email"),
      cell: ({ row }) => <div>{row.getValue("email")}</div>,
    },
    {
      accessorKey: "role",
      header: t('role'),
      cell: ({ row }) => <div>{row.original.role?.name}</div>,
    },
    {
      accessorKey: "createdAt",
      header: t("created-at"),
      cell: ({ row }) => (
        <div>{formatToUtcTime(row.getValue("createdAt"))}</div>
      ),
    },
    // 所属目录
    {
      accessorKey: "updatedAt",
      header: t("updated-at"),
      cell: ({ row }) => (
        <div>{formatToUtcTime(row.getValue("updatedAt"))}</div>
      ),
    },

    {
      accessorKey: "operations",
      header: () => <div className="text-right">{t("operations")}</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <Button variant="link" onClick={() => onEdit(row.original.role?.id)}>
            <span>{t("check")}</span>
          </Button>
        </div>
      ),
    },
  ];

  return columns;
};
