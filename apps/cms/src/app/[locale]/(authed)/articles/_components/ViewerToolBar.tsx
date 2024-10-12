import React, { Dispatch, SetStateAction, useState } from "react";
import { checkAuth } from "../../_components/AuthProvider";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArticleStatus } from "@prisma/client";
import {
  PlusIcon,
  Edit,
  Check,
  Trash,
  CornerUpLeft,
  CornerUpRight,
  Timer,
} from "lucide-react";
import { Modal, useModal } from "@/components/ui-extends/Modal";
import { DatePicker } from "antd";
import { getToken } from "@/lib/tokenUtil";
import {
  ArticleListItem,
  deleteArticle,
  postPulishArticle,
  putUpdateArticle,
} from "@repo/database/services/article";
import { formatToUtcTime } from "@repo/utils/dayjsUtil";
import { Dayjs } from "dayjs";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { PermissionEnum } from "@/models/permission.model";
import { useTranslations } from "next-intl";

const ViewerToolBar = ({
  id,
  status,
  setData,
  locale,
}: {
  status?: ArticleStatus;
  id?: string;
  setData: Dispatch<SetStateAction<ArticleListItem[]>>;
  locale: string;
}) => {
  const t = useTranslations();
  const { show, contextHandler, close } = useModal();

  const [open, setOpen] = useState(false);

  const [expiredAt, setExpiredAt] = useState<Dayjs>();

  const { toast } = useToast();
  const onDelete = () => {
    show({
      variant: "destructive",
      title: t("delete-article"),

      content: t("delete-article-tip"),
      onConfirm: async () => {
        const token = getToken();
        if (id && token) {
          const res = await deleteArticle({ id, language: "en-US" }, token);
          if (res.data) {
            setData((prev) =>
              prev.map((item) => ({
                ...item,
                status:
                  item.id === res.data ? ArticleStatus.DELETED : item.status,
              })),
            );
            close();
          } else {
            toast({
              title: t("delete-failed"),
              description: t("please-try-again-later"),
              variant: "destructive",
            });
          }
        }
      },
    });
  };

  const onWithdraw = async () => {
    show({
      title: t("withdraw-article"),
      content: t("withdraw-article-tip"),
      onConfirm: async () => {
        const token = getToken();
        if (id && token) {
          const res = await putUpdateArticle(
            { id, status: ArticleStatus.DRAFT, language: "en-US" },
            getToken(),
          );
          if (res.data) {
            setData((prev) =>
              prev.map((item) => ({
                ...item,
                status:
                  item.id === res.data.id ? ArticleStatus.DRAFT : item.status,
              })),
            );

            toast({
              title: t("withdraw-success"),
              description: t("the-article-has-been-withdrawn"),
            });
            close();
          } else {
            toast({
              title: t("withdraw-failed"),
              description: t("please-try-again-later"),
            });
          }
        }
      },
    });
  };

  const onReview = async () => {
    show({
      title: t("review-article"),
      content: t("are-you-sure-you-want-to-review-this-article"),
      onConfirm: async () => {
        const token = getToken();
        if (id && token) {
          const res = await putUpdateArticle(
            { id, status: ArticleStatus.REVIEWED, language: locale },
            getToken(),
          );
          if (res.data) {
            setData((prev) =>
              prev.map((item) => ({
                ...item,
                status:
                  item.id === res.data.id
                    ? ArticleStatus.REVIEWED
                    : item.status,
              })),
            );

            toast({
              title: t("reviewed-success"),
              description: t("the-article-has-been-reviewed"),
            });
            close();
          } else {
            toast({
              title: t("reviewed-failed"),
              description: t("please-try-again-later"),
            });
          }
        }
      },
    });
  };
  const onPublish = async () => {
    if (!id) return;
    show({
      title: t("publish-article"),
      content: t("are-you-sure-you-want-to-publish-this-article"),
      onConfirm: async () => {
        const res = await postPulishArticle(
          { id, type: "now", language: locale },
          getToken(),
        );
        if (res.data?.id) {
          setData((prev) =>
            prev.map((item) => ({
              ...item,
              status:
                item.id === res.data.id ? ArticleStatus.PUBLISHED : item.status,
            })),
          );
          toast({
            title: t("publish-success"),
            description: t("the-article-has-been-published"),
          });
          close();
        } else {
          toast({
            title: t("publish-failed"),
            description: t("please-try-again-later"),
          });
        }
      },
    });
  };
  const onFuturePublish = async () => {
    if (!id) return;

    if (expiredAt) {
      const res = await postPulishArticle(
        {
          id,
          language: locale,
          type: "future",
          expiredAt: formatToUtcTime(expiredAt),
        },
        getToken(),
      );
      if (res.data?.id) {
        toast({
          title: t("setting-up-timed-release-success"),
          description: t("the-article-will-be-published-at-time", {
            time: expiredAt.toString(),
          }),
        });
        setOpen(false);
      }
    }
  };

  return (
    <div className="flex h-12 items-center space-x-4 border-b border-border">
      {contextHandler}

      <Button size="icon" variant="ghost">
        <Link href="/articles/editor/draft/new" className="leading-none">
          <PlusIcon />
        </Link>
      </Button>

      <Button
        size="icon"
        variant="ghost"
        disabled={!id || status === ArticleStatus.DELETED}
      >
        <Link href={`/articles/editor/draft/${id}`} className="leading-none">
          <Edit />
        </Link>
      </Button>

      <Button
        size="icon"
        variant="ghost"
        disabled={
          !checkAuth(PermissionEnum.ArticleDelete) ||
          !id ||
          status === ArticleStatus.DELETED
        }
        onClick={() => onDelete()}
      >
        <Trash />
      </Button>

      <Separator orientation="vertical" />

      <Button
        size="icon"
        variant="ghost"
        disabled={
          status !== ArticleStatus.REVIEWED ||
          !checkAuth(PermissionEnum.ArticlePublish)
        }
        onClick={() => setOpen(true)}
      >
        <Timer />
      </Button>

      <Button
        size="icon"
        variant="ghost"
        disabled={
          status !== ArticleStatus.PUBLISHED ||
          !checkAuth(PermissionEnum.ArticlePublish)
        }
        onClick={() => onWithdraw()}
      >
        <CornerUpLeft />
      </Button>

      <Button
        size="icon"
        variant="ghost"
        disabled={
          status !== ArticleStatus.REVIEWED ||
          !checkAuth(PermissionEnum.ArticlePublish)
        }
        onClick={() => onPublish()}
      >
        <CornerUpRight />
      </Button>

      <Button
        size="icon"
        variant="ghost"
        disabled={
          status !== ArticleStatus.UNDER_REVIEW ||
          !checkAuth(PermissionEnum.ArticleReview)
        }
        onClick={() => onReview()}
      >
        <Check />
      </Button>

      <Modal open={open} setOpen={setOpen} title={t("VHonL6EZQkxwn4LxLLgYp")}>
        <DatePicker
          showTime
          className="w-full !rounded"
          onChange={(date) => setExpiredAt(date)}
        />
        <div className="mt-4 space-x-2 text-right">
          <Button onClick={() => setOpen(false)} variant="secondary">
            {t("cancel")}
          </Button>
          <Button onClick={() => onFuturePublish()}>{t("confirm")}</Button>
        </div>
      </Modal>
    </div>
  );
};

export default ViewerToolBar;
