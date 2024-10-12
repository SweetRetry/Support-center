"use server";
import { prisma } from "../client";
import { IResponse } from "../utils/responseUtil";
import { TokenUtil } from "../utils/tokenUtil";

export const getRoleList = async (
  token: string,
  params?: {
    pageId: number;
    pageSize: number;
  }
) => {
  try {
    const res = TokenUtil.verifyToken(token);
    if (!res?.userId) return IResponse.PermissionDenied();

    if (params?.pageId && params?.pageSize) {
      const roles = await prisma.role.findMany({
        skip: (params.pageId - 1) * params.pageSize,
        take: params.pageSize,
      });

      const count = await prisma.role.count();

      return IResponse.Success({
        list: roles,
        totalPage: Math.ceil(count / params.pageSize),
        totalCount: count,
      });
    } else {
      const roles = await prisma.role.findMany();

      return IResponse.Success({
        list: roles,
        totalPage: 1,
        totalCount: roles.length,
      });
    }
  } catch (err) {
    return IResponse.Error(500, "Internal Server Error");
  }
};

export const getRolePermissionsById = async (roleId: string) => {
  try {
    const role = await prisma.role.findUnique({
      where: {
        id: roleId,
      },
      include: {
        permissions: true,
      },
    });

    if (!role) {
      return IResponse.Error(404, "Role not found");
    }

    const allPermissions = await prisma.permission.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    const returnData = allPermissions.map((permission) => {
      const isChecked = role?.permissions?.some(
        (item) => item.id === permission.id
      );

      return {
        ...permission,
        isChecked,
      };
    });

    return IResponse.Success(returnData);
  } catch (err) {
    return IResponse.Error(500, "Internal Server Error");
  }
};

export async function putRolePermissionsUpdate(params: {
  roleId: string;
  permissions: string[];
}) {
  try {
    const role = await prisma.$transaction(async (tx) => {
      return await tx.role.update({
        where: {
          id: params.roleId,
        },
        data: {
          permissions: {
            set: params.permissions.map((permissionId) => ({
              id: permissionId,
            })),
          },
        },
      });
    });

    return IResponse.Success(role);
  } catch (err) {
    return IResponse.Error(500, "Internal Server Error");
  }
}

export async function postCreateRole({
  name,
  permissionsId,
}: {
  name: string;
  permissionsId: string[];
}) {
  try {
    const role = await prisma.role.create({
      data: {
        name,
        permissions: {
          connect: permissionsId.map((id) => ({ id })),
        },
      },
    });

    return IResponse.Success(role);
  } catch (err) {
    return IResponse.Error(500, "Internal Server Error");
  }
}

export async function deleteRole(roleId: string) {
  try {
    await prisma.role.delete({
      where: {
        id: roleId,
      },
    });

    return IResponse.Success(null);
  } catch (err) {
    return IResponse.Error(500, "Internal Server Error");
  }
}
