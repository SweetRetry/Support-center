import { ArticleStatus } from "@prisma/client";
import { useTranslations } from "next-intl";

export const useArticleTranslate = () => {
  const t = useTranslations();

  const ArticleStatusTranslate: Record<string, string> = {
    [ArticleStatus.DRAFT]: t("draft"),
    [ArticleStatus.DELETED]: t("deleted"),
    ["PENDING"]: t("pending"),
    [ArticleStatus.PUBLISHED]: t("published"),
    [ArticleStatus.UNDER_REVIEW]: t("under-review"),
    [ArticleStatus.REVIEWED]: t("reviewed"),
  };

  return { ArticleStatusTranslate };
};
