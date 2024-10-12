"use server";
import { prisma, Article, ArticleStatus } from "../client";
import { PermissionUtil } from "../utils/authUtil";
import { z } from "zod";
import { IResponse } from "../utils/responseUtil";
import { StatusCodes } from "http-status-codes";

export async function getArticle(id: string, language: string) {
  try {
    const article = await prisma.article.findUnique({
      where: {
        id_language: {
          id,
          language,
        },
      },
    });
    return IResponse.Success<Article | null>(article);
  } catch (err) {
    return IResponse.Error(StatusCodes.INTERNAL_SERVER_ERROR, "服务器错误");
  }
}

export interface ArticleListItem {
  id: string;
  title: string;
  status: ArticleStatus;
  updatedAt: Date;
  description: string;
  category: { id: string; name: string } | null;
}
export async function getArticleList(params: {
  pageId: number;
  pageSize: number;
  status?: ArticleStatus;
  keyword?: string;
  categoryId?: string;
  language: string;
}) {
  try {
    const wherePattern = {
      OR: params.keyword
        ? [
            {
              title: {
                contains: params.keyword,
              },
            },
            {
              description: {
                contains: params.keyword,
              },
            },
          ]
        : undefined,
      status: params.status,
      categoryId: params.categoryId,
      language: params.language,
    };
    const listFn = prisma.article.findMany({
      take: params.pageSize,
      skip: (params.pageId - 1) * params.pageSize,
      where: wherePattern,
      include: {
        category: true,
      },
    });

    const totalCountFn = prisma.article.count({
      where: wherePattern,
    });

    let [list, totalCount] = await Promise.all([listFn, totalCountFn]);

    return IResponse.Success<{
      list: Array<{
        id: string;
        title: string;
        status: ArticleStatus;
        updatedAt: Date;
        description: string;
        publishedAt?: Date | null;
        category: { id: string; name: string } | null;
      }>;
      totalPage: number;
      totalCount: number;
    }>({
      list,
      totalPage: Math.ceil(totalCount / params.pageSize),
      totalCount,
    });
  } catch (err) {
    return IResponse.FakeSuccess(
      {
        list: [],
        totalPage: 0,
        totalCount: 0,
      },
      500,
      "Internal Server Error"
    );
  }
}

export async function deleteArticle(
  data: { id: string; language: string },
  token: string
) {
  try {
    const hasPermission = await PermissionUtil.checkPermission(
      token,
      "article:delete"
    );
    if (!hasPermission) {
      return IResponse.PermissionDenied();
    }
    const deletedArticle = await prisma.article.update({
      where: {
        id_language: data,
      },
      data: {
        status: ArticleStatus.DELETED,
      },
    });

    return IResponse.Success<string>(deletedArticle.id, "删除成功");
  } catch (err) {
    return IResponse.Error(500, "服务器错误");
  }
}

export async function postCreateArticle(
  data: {
    title: string;
    content: string;
    description: string;
    language?: string;
  },
  token: string
) {
  try {
    const hasPermission = await PermissionUtil.checkPermission(
      token,
      "article:edit"
    );

    if (!hasPermission) {
      return IResponse.PermissionDenied();
    }

    const schema = z.object({
      title: z.string().min(1),
      content: z.string().min(1),
      description: z.string(),
    });

    const { success } = schema.safeParse(data);
    if (!success) {
      return IResponse.Error(500, "params error");
    }

    const newArticle = await prisma.article.create({
      data,
    });

    return IResponse.Success<Article>(newArticle);
  } catch (err) {
    return IResponse.Error(500, "服务器错误");
  }
}

export async function putUpdateArticle(
  data: Partial<Article> & {
    id: string;
    language: string;
  },
  token: string
) {
  try {
    const hasPermission = await PermissionUtil.checkPermission(
      token,
      "article:edit"
    );

    if (!hasPermission) {
      return IResponse.PermissionDenied();
    }

    const updatedArticle = await prisma.article.update({
      where: {
        id_language: {
          id: data.id,
          language: data.language,
        },
      },
      data,
    });

    return IResponse.Success<Article>(updatedArticle);
  } catch (err) {
    return IResponse.Error(500, "服务器错误");
  }
}

export async function postPulishArticle(
  data: {
    id: string;
    type: "now" | "future";
    expiredAt?: string;
    language: string;
  },
  token: string
) {
  const hasPermission = await PermissionUtil.checkPermission(
    token,
    "article:publish"
  );

  if (!hasPermission) {
    return IResponse.PermissionDenied();
  }

  try {
    if (data.type === "future" && data.expiredAt) {
      const pendingArticle = await prisma.article.update({
        where: {
          id_language: {
            id: data.id,
            language: data.language,
          },
        },
        data: {
          status: ArticleStatus.PUBLISHED,
          publishedAt: new Date(data.expiredAt),
        },
      });
      return IResponse.Success(pendingArticle);
    }
  } catch (err) {
    return IResponse.Error(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Interval server error"
    );
  }

  try {
    const published = await prisma.article.update({
      where: {
        id_language: {
          id: data.id,
          language: data.language,
        },
      },
      data: {
        status: ArticleStatus.PUBLISHED,
      },
    });

    return IResponse.Success(published);
  } catch (err) {
    return IResponse.Error(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Interval server error"
    );
  }
}

export async function getPendingArticles(pageSize: number) {
  const pendingArticles = await prisma.article.findMany({
    where: {
      publishedAt: {
        gte: new Date(),
      },
      status: ArticleStatus.PUBLISHED,
    },
    take: pageSize,
  });

  return IResponse.Success(pendingArticles);
}

export async function getArticleStatusCount() {
  try {
    const count = await prisma.article.count({
      where: {
        status: ArticleStatus.PUBLISHED,
      },
    });

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const prevCount = await prisma.article.count({
      where: {
        status: ArticleStatus.PUBLISHED,
        publishedAt: {
          gte: new Date(yesterday.setHours(0, 0, 0, 0)),
          lt: new Date(today.setHours(0, 0, 0, 0)),
        },
      },
    });
    return IResponse.Success({
      total: count,
      yesterday: prevCount,
      increase: count - prevCount,
    });
  } catch (err) {
    return IResponse.Error(500, "Internal Server Error");
  }
}
