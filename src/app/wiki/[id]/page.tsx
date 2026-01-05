import { notFound } from "next/navigation";
import WikiArticleViewer from "@/components/wiki-article-viewer";
import { authorizeUserToEditArticle } from "@/db/authz";
import { getArticleById } from "@/lib/data/articles";
import { stackServerApp } from "@/stack/server";

interface ViewArticlePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ViewArticlePage({
  params,
}: ViewArticlePageProps) {
  const { id } = await params;

  // Mock permission check - in a real app, this would come from auth/user context
  let canEdit = false;

  try {
    const user = await stackServerApp.getUser();
    if (user) {
      canEdit = await authorizeUserToEditArticle(user.id, +id);
    }
  } catch (_err) {
    canEdit = false;
  }

  const article = await getArticleById(+id);
  if (!article) {
    notFound();
  }

  return <WikiArticleViewer article={article} canEdit={canEdit} />;
}
