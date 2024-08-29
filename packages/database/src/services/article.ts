"use server";
import { Article, ArticleStatus, prisma } from "../client";
import { PermissionUtil } from "../utils/authUtil";

import { IResponse } from "../utils/responseUtil";

export async function getArticleAnlytics() {
  const statusCounts = await prisma.article.groupBy({
    by: "status",
    _count: {
      status: true,
    },
  });

  return IResponse.Success(statusCounts);
}
export async function getArticle(id: string) {
  try {
    const article = await prisma.article.findUnique({
      where: {
        id,
      },
    });
    return IResponse.Success<Article | null>(article);
  } catch (err) {
    return IResponse.Error(500, "服务器错误");
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
    };
    const listFn = prisma.article.findMany({
      take: params.pageSize,
      skip: (params.pageId - 1) * params.pageSize,
      where: wherePattern,
      select: {
        id: true,
        title: true,
        status: true,
        updatedAt: true,
        description: true,
        category: params.categoryId
          ? {
              select: {
                id: true,
                name: true,
              },
            }
          : undefined,
      },
    });

    const totalCountFn = prisma.article.count({
      where: wherePattern,
    });

    const [list, totalCount] = await Promise.all([listFn, totalCountFn]);

    return IResponse.Success<{
      list: Array<{
        id: string;
        title: string;
        status: ArticleStatus;
        updatedAt: Date;
        description: string;
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

export async function deleteArticle(data: { id: string }, token: string) {
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
        id: data.id,
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
