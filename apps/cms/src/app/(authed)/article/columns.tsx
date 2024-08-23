"use client";

import { useModal } from "@/components/ui-extends/Modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatToUtcTime } from "@/lib/dayjsExtend";
import { getArticleList } from "@repo/database/services/article";
import { ColumnDef } from "@tanstack/react-table";
import { DELETE_WORD_COMMAND } from "lexical";
import { Delete, Edit, LucideDelete, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export type Column = Awaited<
  ReturnType<typeof getArticleList>
>["data"]["list"][0];
// export const columns: ColumnDef<Column>[] = [
//   {
//     accessorKey: "title",
//     header: "Title",
//     cell: ({ row }) => <div>{row.getValue("title")}</div>,
//   },
//   {
//     accessorKey: "status",
//     header: "Status",
//     cell: ({ row }) => <div>{row.getValue("status")}</div>,
//   },
//   // 所属目录
//   {
//     accessorKey: "dependencyCategory",
//     header: "Dependency Category",
//     cell: ({ row }) => <div>{row.getValue("category.name") || "--"}</div>,
//   },
//   {
//     accessorKey: "updatedAt",
//     header: "UpdatedAt",
//     cell: ({ row }) => <div>{formatToUtcTime(row.getValue("updatedAt"))}</div>,
//   },
//   {
//     accessorKey: "actions",
//     header: () => <div className="text-right">Actions</div>,
//     cell: ({ row }) => (
//       <div className="text-right">
//         <DropdownMenu>
//           <DropdownMenuTrigger>
//             <Button variant="ghost">---</Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent>
//             <DropdownMenuItem>
//               <Edit width={16} height={16} className="mr-1" />
//               <span>Edit</span>
//             </DropdownMenuItem>
//             <DropdownMenuItem>
//               <Delete width={16} height={16} className="mr-1" />
//               <span>Delete</span>
//             </DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       </div>
//     ),
//   },
// ];

export const useColumns = ({
  onOpenDeleteModal,
}: {
  onOpenDeleteModal: (item: Column) => void;
}) => {
  const router = useRouter();

  const columns: ColumnDef<Column>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => <div>{row.getValue("title")}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <div>{row.getValue("status")}</div>,
    },
    // 所属目录
    {
      accessorKey: "dependencyCategory",
      header: "Dependency Category",
      cell: ({ row }) => <div>{row.original.category?.name || "--"}</div>,
    },
    {
      accessorKey: "updatedAt",
      header: "UpdatedAt",
      cell: ({ row }) => (
        <div>{formatToUtcTime(row.getValue("updatedAt"))}</div>
      ),
    },
    {
      accessorKey: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-haspopup="true">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() =>
                  router.push(`/article/editor/draft/${row.original.id}`)
                }
              >
                <Edit width={16} height={16} className="mr-1" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onOpenDeleteModal(row.original)}>
                <Delete width={16} height={16} className="mr-1" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return columns;
};
