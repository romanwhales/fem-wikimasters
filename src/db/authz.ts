import { eq } from "drizzle-orm";
import db from "@/db";
import { articles } from "@/db/schema";

export const authorizeUserToEditArticle =
  async function authorizeUserToEditArticle(
    loggedInUserId: string,
    articleId: number,
  ) {
    const response = await db
      .select({
        authorId: articles.authorId,
      })
      .from(articles)
      .where(eq(articles.id, articleId));
    if (!response.length) {
      return false;
    }
    console.log("Logged iNuser id ", loggedInUserId, response[0].authorId);
    return response[0].authorId === loggedInUserId;
  };
