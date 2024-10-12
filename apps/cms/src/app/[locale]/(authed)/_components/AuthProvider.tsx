import { PermissionEnum } from "@repo/database/models/permission.model";

import { Permission } from "@prisma/client";
import { getPermissionList } from "@repo/database/services/auth";
import { useRouter } from "next/navigation";
import React, { createContext, useEffect, useState } from "react";

const AuthContext = createContext<Permission[]>([]);
const AuthProvider = ({
  children,
  token,
}: {
  children: React.ReactNode;
  token: string;
}) => {
  const [authList, setAuthList] = useState<Permission[]>([]);
  const router = useRouter();
  useEffect(() => {
    async function run() {
      const res = await getPermissionList(token);
      if (res.code === 403) router.replace("/login");
      res.data && setAuthList(res.data);
    }
    run();
  }, []);

  return (
    <AuthContext.Provider value={authList}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);

export const checkAuth = (permission: PermissionEnum) => {
  const authList = useAuth();

  return authList.findIndex((item) => item.name === permission) !== -1;
};

export default AuthProvider;
