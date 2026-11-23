import { fetchPublicArticlesServer } from "@/utils/api/articles";
import { ArticleFilterBar } from "./_components/article-filter-bar";

export const revalidate = 60;

export default async function BlogPage() {
  const articles = await fetchPublicArticlesServer();

  return (
    <div className="pt-24 sm:pt-28">
      <ArticleFilterBar articles={articles} />
    </div>
  );
}
