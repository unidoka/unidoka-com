import { notFound } from "next/navigation";

// The blog feature is partially migrated: this route imports five
// modules (novel-readonly, content-meta, tiptap-headings, article-card,
// api/articles) that never landed in the repo. Rather than leave a
// build-breaking stub, the route renders the standard 404 until the
// underlying modules are reintroduced. Keep the file so the URL
// pattern is reserved.
export default function ArticlePage() {
  notFound();
}
