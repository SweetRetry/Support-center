import SearchContainer from "@/components/SearchContainer";
import SectionWrap from "@/components/SectionWrap";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

import { useTranslations } from "next-intl";
import SearchResult from "./_components/SearchResult";

const SearchPage = ({
  searchParams,
  params: { locale },
}: {
  searchParams: {
    q: string;
  };
  params: { locale: string };
}) => {
  const t = useTranslations("");

  return (
    <main>
      <section>
        <SectionWrap className="items-center">
          <h1 className="text-4xl font-bold">{t("how-can-we-help-you")}</h1>
          <SearchContainer value={searchParams.q} />
        </SectionWrap>
      </section>

      <section>
        <SectionWrap>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/support">{t("faq")}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t("search-result")}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <SearchResult
            q={searchParams.q}
            tip={t("search-not-found")}
            locale={locale}
          />
        </SectionWrap>
      </section>
    </main>
  );
};

export default SearchPage;
