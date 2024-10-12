import Empty from "@/components/Empty";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getArticleList } from "@repo/database/services/article";
import { formatToUtcTime } from "@repo/utils/dayjsUtil";
import { highlightSearchText } from "@repo/utils/stringUtil";
import Link from "next/link";

import React from "react";

const SearchResult = async ({
  q,
  tip,
  locale,
}: {
  q: string;
  tip: string;
  locale: string;
}) => {
  const { data: articles } = await getArticleList({
    pageId: 1,
    pageSize: 100,
    language: locale,
    keyword: q,
  });

  return (
    <div className="space-y-4">
      {articles.list?.length ? (
        articles.list?.map((article, index) => (
          <Link
            key={article.id}
            href={`/support/faq/article/${article.id}`}
            className={cn("block cursor-pointer p-4 hover:bg-muted", {
              "border-b border-solid border-border":
                index !== articles.list.length - 1,
            })}
          >
            <div className="flex justify-between">
              <h3>{article.title}</h3>
              {article.updatedAt && (
                <span className="text-muted-foreground">
                  {formatToUtcTime(article.updatedAt)}
                </span>
              )}
            </div>
            <p
              className="my-4 whitespace-pre-line text-muted-foreground"
              dangerouslySetInnerHTML={{
                __html: highlightSearchText(article.description, q),
              }}
            />

            <Button variant="secondary" size="sm">
              {article.category?.name}
            </Button>
          </Link>
        ))
      ) : (
        <div className="text-center">
          <Empty description={tip} />
        </div>
      )}
    </div>
  );
};

export default SearchResult;
