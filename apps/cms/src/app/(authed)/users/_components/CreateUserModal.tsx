import ButtonLoading from "@/components/ui-extends/ButtonLoading";
import { Modal } from "@/components/ui-extends/Modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Role } from "@prisma/client";
import { getRoleList } from "@repo/database/services/role";
import { postCreateUser } from "@repo/database/services/user";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  roleId: z.string().min(1),
});
const CreateUserModal = ({
  open,
  setOpen,
  onSuccess,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess: () => void;
}) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      roleId: "",
    },
  });
  const [loading, setLoading] = useState(false);
  const onConfirm = async (values: z.infer<typeof formSchema>) => {
    const success = await form.trigger();
    if (!success) return;
    setLoading(true);
    const res = await postCreateUser(values);
    if (res.data?.id) {
      setOpen(false);
      onSuccess();
    }
    setLoading(false);
  };

  const cacheRoles = useRef<Role[]>();
  const [roles, setRoles] = useState<Role[]>();

  useEffect(() => {
    async function run() {
      if (cacheRoles.current) return;
      const res = await getRoleList();
      if (res.code === 200 && res.data) {
        setRoles(res.data);
        cacheRoles.current = res.data;
      }
    }

    open && run();
  }, [open]);

  return (
    <Modal title="Create User" open={open} setOpen={setOpen}>
      <div className="space-y-4">
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="off" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {roles?.map((role) => (
                        <SelectItem value={role.id} key={role.id}>
                          {role.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </form>
        </Form>

        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <ButtonLoading
            loading={loading}
            onClick={() => onConfirm(form.getValues())}
          >
            Confirm
          </ButtonLoading>
        </div>
      </div>
    </Modal>
  );
};

export default CreateUserModal;
