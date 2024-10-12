"use client";
import React, { useEffect, useState } from "react";

import { useList } from "@/hooks/useList";
import { getArticleList } from "@repo/database/services/article";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterIcon } from "lucide-react";

import { ArticleStatus } from "@prisma/client";

import { LoadingSpinner } from "@/components/LoadingSpinner";
import { formatToUtcTime } from "@repo/utils/dayjsUtil";
import { cn } from "@/lib/utils";
import ArticleViewer from "@/components/ArticleViewer";

import ViewerToolBar from "./_components/ViewerToolBar";

import { Empty } from "antd";
import Link from "next/link";
import FilterModalContent from "./_components/FilterModalContent";
import { useTranslations } from "next-intl";
import { useArticleTranslate } from "@/hooks/useArticle";

const page = ({ params: { locale } }: { params: { locale: string } }) => {
  const t = useTranslations();
  const { ArticleStatusTranslate } = useArticleTranslate();
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<ArticleStatus>();
  const [categoryId, setCategoryId] = useState<string>();

  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const { fetch, data, setData, loading, debounceFetch } = useList(
    { keyword, status, categoryId, language: locale },
    getArticleList,
  );

  const [actionItemId, setActionItemId] = useState<string>();

  const actionArticleItem = data.find((item) => item.id === actionItemId);

  async function wrapFetch() {
    const res = await fetch();

    if (res?.list.length) {
      setActionItemId(res.list[0].id);
    }
  }

  useEffect(() => {
    document.title = t("articles");
  }, []);

  useEffect(() => {
    wrapFetch();
  }, [status, categoryId]);

  return (
    <section className="flex h-full space-x-4 border-t border-border">
      <section className="w-1/3 min-w-[400px]">
        <div className="flex h-12 items-center justify-between space-x-4">
          <Input
            className="max-w-[250px]"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              debounceFetch();
            }}
            placeholder={t("search-article-by-keywords")}
          />

          <Button variant="outline" onClick={() => setFilterModalOpen(true)}>
            <FilterIcon width={20} height={20} className="mr-1" />
            <span>{t("filter")}</span>
          </Button>
        </div>

        <ul
          className="mt-2 space-y-3 overflow-auto"
          style={{
            maxHeight: "calc(100vh - 200px)",
          }}
        >
          {loading ? (
            <LoadingSpinner />
          ) : data.length ? (
            data.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "cursor-pointer rounded border border-solid border-border p-4 hover:bg-muted active:bg-muted",
                  {
                    "bg-muted": actionArticleItem?.id === item.id,
                  },
                )}
                onClick={() => setActionItemId(item.id)}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold">{item.title}</h4>
                  <p className="text-sm">
                    {formatToUtcTime(
                      item.status === ArticleStatus.PUBLISHED
                        ? item.publishedAt!
                        : item.updatedAt,
                    )}
                  </p>
                </div>

                <p className="my-4 text-muted-foreground">{item.description}</p>
                <div className="flex items-center space-x-2 text-sm">
                  <span
                    className={cn(
                      "mt-2 rounded-full border border-border px-2 py-1",
                    )}
                  >
                    {ArticleStatusTranslate[item.status]}
                  </span>

                  {item.category?.id && (
                    <span className="mt-2 rounded-full border border-border px-2 py-1">
                      {item.category?.name}
                    </span>
                  )}
                </div>
              </li>
            ))
          ) : (
            <Empty description={t("HSEqdVK7j8Am7n0kN14rC")}>
              <Link href="/articles/editor/draft/new">
                <Button>{t("create-now")}</Button>
              </Link>
            </Empty>
          )}
        </ul>
      </section>

      <section className="flex-1 border-l border-border pl-4">
        <ViewerToolBar
          id={actionArticleItem?.id}
          status={actionArticleItem?.status}
          setData={setData}
          locale={locale}
        />

        {actionArticleItem && (
          <>
            <div className="py-2">
              <ArticleViewer id={actionArticleItem?.id} locale={locale} />
            </div>
          </>
        )}
      </section>

      <FilterModalContent
        open={filterModalOpen}
        setOpen={setFilterModalOpen}
        onConfirm={(
          status: ArticleStatus | undefined,
          categoryId: string | undefined,
        ) => {
          setStatus(status);
          setCategoryId(categoryId);
          setFilterModalOpen(false);
        }}
      />
    </section>
  );
};

export default page;
