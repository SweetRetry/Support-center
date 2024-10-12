"use server";
import { hash } from "crypto";
import { prisma, Role } from "../client";
import { IResponse } from "../utils/responseUtil";
import { TokenUtil } from "../utils/tokenUtil";
import { PermissionUtil } from "../utils/authUtil";

export async function login(data: { email: string; password: string }) {
  if (!data.email || !data.password) return IResponse.Error(400, "参数错误");
  const hashedPassword = hash("sha256", data.password);
  const user = await prisma.user.findUnique({
    where: { email: data.email, password: hashedPassword },
  });
  if (user) {
    // 生成 JWT
    const token = TokenUtil.generateToken(user.id, user.roleId);
    return IResponse.Success<{
      token: string;
    }>({
      token,
    });
  } else {
    return IResponse.Error(401, "用户名或密码错误");
  }
}

export type UserListItem = {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date | null;
  role: Role | null;
};
export const getUserList = async (params: {
  pageId: number;
  pageSize: number;
  emailLike?: string;
}) => {
  try {
    const users = await prisma.user.findMany({
      take: params.pageSize,
      skip: (params.pageId - 1) * params.pageSize,
      include: {
        role: true,
      },
      where: {
        email: {
          contains: params.emailLike,
        },
      },
    });

    const count = await prisma.user.count();

    return IResponse.Success({
      list: users,
      totalPage: Math.ceil(count / params.pageSize),
      totalCount: count,
    });
  } catch (err) {
    return IResponse.FakeSuccess(
      {
        list: [] as UserListItem[],
        totalPage: 0,
        totalCount: 0,
      },
      500,
      "Internal Server Error"
    );
  }
};

export const postCreateUser = async (
  params: {
    email: string;
    password: string;
    roleId: string;
  },
  token: string
) => {
  try {
    const hasPermission = PermissionUtil.checkPermission(token, "user:create");
    if (!hasPermission) {
      return IResponse.PermissionDenied();
    }
    const hashedPassword = hash("sha256", params.password);
    const newUser = await prisma.user.create({
      data: {
        email: params.email,
        password: hashedPassword,
        role: {
          connect: {
            id: params.roleId,
          },
        },
      },
    });

    return IResponse.Success(newUser);
  } catch (err) {
    return IResponse.Error(500, "Internal Server Error");
  }
};

export const getUserInfo = async (token: string) => {
  try {
    const userId = TokenUtil.verifyToken(token)?.userId;
    if (!userId) return IResponse.PermissionDenied();
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
      },
    });
    return IResponse.Success(user);
  } catch (err) {
    return IResponse.Error(500, "Internal Server Error");
  }
};
