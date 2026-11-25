import { getLocale } from "@/i18n/server";
import { fetchPublicArticlesServer } from "@/utils/api/articles";
import { ArticleFilterBar } from "./_components/article-filter-bar";

export const revalidate = 60;

export default async function BlogPage() {
  const locale = await getLocale();
  const articles = await fetchPublicArticlesServer({ lang: locale });

  return (
    <div className="pt-24 sm:pt-28">
      <ArticleFilterBar articles={articles} initialLang={locale} />
    </div>
  );
}
