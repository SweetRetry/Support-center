import { PermissionEnum } from "@repo/database/models/permission.model";

import { useTranslations } from "next-intl";

export const usePermissionDescrition = () => {
  const t = useTranslations();

  const PermissionDescription = {
    [PermissionEnum.ArticleDelete]: t("delete-article"),
    [PermissionEnum.ArticeEdit]: t("edit-article"),
    [PermissionEnum.ArticlePublish]: t("publish-article"),
    [PermissionEnum.ArticleReview]: t("review-article"),
    [PermissionEnum.RoleCreate]: t("create-role"),
    [PermissionEnum.RoleDelete]: t("delete-role"),
    [PermissionEnum.RoleEdit]: t("edit-role"),
    [PermissionEnum.UserCreate]: t("create-user"),
    [PermissionEnum.UserDelete]: t("delete-user"),
    [PermissionEnum.UserEdit]: t("edit-user"),
    [PermissionEnum.UserResetPwd]: t("reset-password"),
  };

  return { PermissionDescription };
};
