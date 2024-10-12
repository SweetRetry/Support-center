"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { cn } from "@/lib/utils";
import { Check, Plus } from "lucide-react";
import { Category } from "@prisma/client";
import SrInput from "../ui-extends/SrInput";
import { Button } from "../ui/button";

import {
  postCreateNewCategory,
  getCategoryList,
} from "@repo/database/services/category";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";

const CategorySelect = ({
  onSelect,
  locale,
}: {
  onSelect: (value: string, category: Category) => void;
  locale: string;
}) => {
  const t = useTranslations();
  const [searchValue, setSearchValue] = useState("");
  const [value, setValue] = useState("");

  const [creating, setCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);

  const { toast } = useToast();

  const onAddCatrgory = async () => {
    const category = await postCreateNewCategory(newCategoryName, locale);
    if (category.id) {
      setCategories([...categories, category]);
    } else {
      toast({
        title: t("create-new-category-failed"),
      });
    }
    setNewCategoryName("");
    setCreating(false);
  };

  useEffect(() => {
    const run = async () => {
      const res = await getCategoryList(locale);
      if (res.data) {
        setCategories(res.data);
      }
    };

    run();
  }, []);

  const filterdCategorys = categories.filter((item) =>
    item.name.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase()),
  );

  return (
    <Command>
      <CommandInput placeholder={t("search-category")} />
      <CommandList>
        <CommandEmpty>{t("no-category-found")}</CommandEmpty>
        <CommandGroup>
          {filterdCategorys.map((category) => (
            <CommandItem
              key={category.id}
              onSelect={() => {
                setValue(category.id === value ? "" : category.id);
                onSelect(category.id === value ? "" : category.id, category);
              }}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  value === category.id ? "opacity-100" : "opacity-0",
                )}
              />
              <span>{category.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>

      <div className="p-2">
        {creating ? (
          <SrInput
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            suffixIcon={
              <Button size="sm" onClick={onAddCatrgory}>
                {t("add")}
              </Button>
            }
          />
        ) : (
          <div
            className="mt-2 flex cursor-pointer items-center justify-center rounded border border-dotted border-border py-1 text-muted-foreground hover:bg-muted"
            onClick={() => setCreating(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>{t("add-new-category")} </span>
          </div>
        )}
      </div>
    </Command>
  );
};

export default CategorySelect;
