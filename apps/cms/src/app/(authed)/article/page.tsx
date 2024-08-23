"use client";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import React, { useEffect, useState } from "react";

import { useList } from "@/hooks/useList";
import { deleteArticle, getArticleList } from "@repo/database/services/article";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterIcon, PlusCircleIcon } from "lucide-react";
import { DataTable } from "./data-table";
import { useColumns } from "./columns";
import { useRouter } from "next/navigation";
import { ArticleStatus } from "@prisma/client";
import { useModal } from "@/components/ui-extends/Modal";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuContent } from "@radix-ui/react-dropdown-menu";

const page = () => {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<ArticleStatus | undefined>();
  const [categroId, setCategoryId] = useState<string | undefined>();

  const { fetch, data, setData, totalCount, totalPage, loading } = useList(
    { keyword, status, categroId },
    getArticleList,
  );

  const [actionArticleItem, setActionArticleItem] =
    useState<(typeof data)["0"]>();

  const { toast } = useToast();

  const { show, contextHandler, close } = useModal({
    danger: true,
    title: "Confirm Delete",
    description:
      "After deleting, you will not be able to recover this article.",
    content: "Are you sure you want to delete this article?",
    onConfirm: async () => {
      if (actionArticleItem?.id) {
        const id = await deleteArticle({ id: actionArticleItem?.id });
        if (id) {
          close();
          setData((prev) =>
            prev.map((item) => ({
              ...item,
              status:
                item.id === actionArticleItem.id
                  ? ArticleStatus.DELETED
                  : item.status,
            })),
          );
        } else {
          toast({
            title: "Delete Failed",
            description: "Please try again later.",
            variant: "destructive",
          });
        }
      }
    },
  });

  const columns = useColumns({
    onOpenDeleteModal: (item) => {
      setActionArticleItem(item);
      show();
    },
  });

  useEffect(() => {
    fetch();
  }, []);

  const router = useRouter();
  return (
    <div className="p-4">
      {contextHandler}
      <div className="mb-4 flex justify-between">
        <Input
          className="max-w-[300px]"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            fetch();
          }}
          placeholder="Search article by keywords"
        />
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FilterIcon width={20} height={20} className="mr-1" />
                <span> Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => {
                  setStatus(undefined);
                  fetch();
                }}
              >
                All
              </DropdownMenuItem>
              {Object.values(ArticleStatus).map((item) => (
                <DropdownMenuItem
                  key={item}
                  onClick={() => {
                    setStatus(item);
                    fetch();
                  }}
                >
                  {item}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => router.push("/article/editor/draft/new")}>
            <PlusCircleIcon className="mr-1" width={20} height={20} />
            <span>Add Article</span>
          </Button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        totalCount={totalCount}
        totalPage={totalPage}
      />
    </div>
  );
};

export default page;
