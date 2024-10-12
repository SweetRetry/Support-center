import { hash } from "crypto";
import { prisma } from "./client";

async function main() {
  // 创建权限
  const createPermission = async (name: string) => {
    return prisma.permission.create({
      data: {
        name,
      },
    });
  };

  const permissions = await Promise.all([
    createPermission("article:edit"),
    createPermission("article:review"),
    createPermission("article:publish"),
    createPermission("article:delete"),
    createPermission("role:create"),
    createPermission("role:edit"),
    createPermission("role:delete"),
    createPermission("user:create"),
    createPermission("user:edit"),
    createPermission("user:delete"),
    createPermission("user:resetPassword"),
  ]);

  // 创建角色
  const role = await prisma.role.create({
    data: {
      name: "Super admin",
      editable: false,
      permissions: {
        connect: permissions,
      },
    },
  });

  const hashedPwd = hash("sha256", "admin123");

  // 创建用户
  await prisma.user.create({
    data: {
      email: "admin@test.com",
      password: hashedPwd,
      role: {
        connect: role,
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
