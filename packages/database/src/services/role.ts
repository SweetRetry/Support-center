"use server";
import { prisma } from "../client";
import { PermissionEnum } from "../models/permission.model";
import { PermissionUtil } from "../utils/authUtil";
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

export async function updateRolePermissions(data: {
  token: string;
  roleId: string;
  permissions: string[];
}) {
  try {
    const hasPermission = await PermissionUtil.checkPermission(
      data.token,
      PermissionEnum.RoleEdit
    );
    if (!hasPermission) return IResponse.PermissionDenied();

    const role = await prisma.role.update({
      where: {
        id: data.roleId,
      },
      data: {
        permissions: {
          set: data.permissions.map((permissionId) => ({
            id: permissionId,
          })),
        },
      },
    });

    return IResponse.Success(role);
  } catch (err) {
    return IResponse.Error(500, "Internal Server Error");
  }
}

export async function postCreateRole({
  token,
  name,
  permissionsId,
}: {
  token: string;
  name: string;
  permissionsId: string[];
}) {
  try {
    const hasPermission = await PermissionUtil.checkPermission(
      token,
      PermissionEnum.RoleCreate
    );
    if (!hasPermission) return IResponse.PermissionDenied();

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

export async function deleteRole({
  token,
  roleId,
}: {
  token: string;
  roleId: string;
}) {
  try {
    const hasPermission = await PermissionUtil.checkPermission(
      token,
      PermissionEnum.RoleCreate
    );
    if (!hasPermission) return IResponse.PermissionDenied();

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
