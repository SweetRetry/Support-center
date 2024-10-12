import React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Article, ArticleStatus } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Modal } from "@/components/ui-extends/Modal";
import CategorySelect from "@/components/category/CategorySelect";

import { $getRoot } from "lexical";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

import Editor from "./Editor";
import { useEditorForm } from "./useEditorForm";
import {
  postCreateArticle,
  putUpdateArticle,
} from "@repo/database/services/article";
import { getToken } from "@/lib/tokenUtil";
import { useToast } from "@/hooks/use-toast";
import ButtonLoading from "../ui-extends/ButtonLoading";

import { useTranslations } from "next-intl";

function EditorForm({ id, locale }: { id: string; locale: string }) {
  const t = useTranslations();

  const { form, title, categoryId, editor, status } = useEditorForm(id, locale);

  const [articleId, setArticleId] = useState(id === "new" ? "" : id);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);

  const router = useRouter();

  const { toast } = useToast();

  const onSave = async ({
    onSuccess,
  }: {
    onSuccess?: (
      res: Awaited<ReturnType<typeof postCreateArticle>> & {
        data: Article;
      },
    ) => void;
    onFailed?: (res: Awaited<ReturnType<typeof postCreateArticle>>) => void;
  }) => {
    const content = editor.getEditorState().toJSON();
    let _description: string = form.getValues("description") || "";

    if (!_description) {
      editor.update(() => {
        // Get the first line of text as the article description
        _description = $getRoot().getFirstChild()?.getTextContent() || "";

        form.setValue("description", _description);
      });
    }

    if (!title && !_description)
      return toast({
        variant: "destructive",
        title: t("please-enter-a-title-or-content"),
      });

    setLoading(true);

    if (!articleId) {
      const res = await postCreateArticle(
        {
          title: title,
          language: locale,
          content: JSON.stringify(content),
          description: _description,
        },
        getToken(),
      );

      if (res?.data?.id) {
        onSuccess?.(res);
      }
    } else {
      const res = await putUpdateArticle(
        {
          id: articleId,
          title,
          language: locale,
          content: JSON.stringify(content),
          description: _description,
        },
        getToken(),
      );

      if (res.code === 200 && res.data?.id) {
        onSuccess?.(res);
      }
    }

    setLoading(false);
  };

  const onSaveWrapper = () => {
    onSave({
      onSuccess(res) {
        if (!articleId) {
          router.replace(`/articles/editor/draft/${res.data.id}`);
          return;
        }
        toast({
          title,
          description: "The article has been saved successfully",
          duration: 3000,
        });
      },
    });
  };

  const onPrepareReview = () =>
    onSave({
      onSuccess(res) {
        setArticleId(res.data.id);
        setModalOpen(true);
      },
    });

  const onReview = async () => {
    const success = await form.trigger();
    if (!success) return;
    setLoading(true);

    const res = await putUpdateArticle(
      {
        id: articleId,
        categoryId,
        categoryLang: locale,
        title,
        language: locale,
        description: form.getValues("description"),
        status: ArticleStatus.UNDER_REVIEW,
        updatedAt: new Date(),
      },
      getToken(),
    );

    if (res.code === 200) {
      setModalOpen(false);
      router.push("/articles");
    }

    setLoading(false);
  };

  // useWindowUnload();

  return (
    <main className="container rounded bg-background">
      {articleId && (
        <span>{t("the-article-has-been-saved-by-the-system")}</span>
      )}
      <header className="flex h-16 items-center justify-between px-6">
        <Input
          className="h-12 max-w-[60%] rounded-none border-0 p-0 text-xl placeholder:text-xl focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder={t("QDoPAziJg73-nfLDH6s7l")}
          value={title}
          onChange={(e) => form.setValue("title", e.target.value)}
        />
        <div className="flex items-center gap-2">
          <ButtonLoading
            variant="secondary"
            onClick={onSaveWrapper}
            loading={loading}
          >
            {t("save")}
          </ButtonLoading>
          {status === ArticleStatus.DRAFT && (
            <ButtonLoading loading={loading} onClick={() => onPrepareReview()}>
              {t("uiJ2Umpg9n5LGJk3U60zs")}
            </ButtonLoading>
          )}
        </div>
      </header>

      <section className="rounded-0">
        <Editor />
      </section>

      <Modal title="Select category" open={modalOpen} setOpen={setModalOpen}>
        <div className="space-y-4">
          <Form {...form}>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => e.preventDefault()}
            >
              <FormField
                name="title"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("article-title")}</FormLabel>

                    <FormControl>
                      <Input
                        {...field}
                        autoComplete="off"
                        placeholder={t("enter-the-article-title")}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name="description"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("article-description")}</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={t("enter-the-article-description")}
                      />
                    </FormControl>
                    <FormDescription>
                      {t("you-can-customize-the-article-description")}
                    </FormDescription>
                  </FormItem>
                )}
              />

              <FormField
                name="categoryId"
                control={form.control}
                render={() => (
                  <FormItem>
                    <FormLabel>{t("pulishing-category")}</FormLabel>

                    <FormControl>
                      <div className="rounded border border-solid border-input">
                        <CategorySelect
                          locale={locale}
                          onSelect={(value) => {
                            form.setValue("categoryId", value);
                          }}
                        />
                      </div>
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={onReview}>{t("uiJ2Umpg9n5LGJk3U60zs")}</Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}

export default EditorForm;
