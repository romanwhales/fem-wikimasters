import { eq } from "drizzle-orm";
import db from "@/db/index";
import { articles, usersSync } from "@/db/schema";
import resend from "@/email/index";
import CelebrationTemplate from "@/email/templates/celebration-temlate";

const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : `http:localhost:3000`;
export default async function sendCelebrationEmail(
  articleId: number,
  pageviews: number,
) {
  const response = await db
    .select({
      email: usersSync.email,
      id: usersSync.id,
      title: articles.title,
      name: usersSync.name,
    })
    .from(articles)
    .leftJoin(usersSync, eq(articles.authorId, usersSync.id))
    .where(eq(articles.id, articleId));

  const { email, id, name, title } = response[0];
  if (!email) {
    console.log(
      `Skipping celebration email for ${articleId} on pageviews ${pageviews}, could not find email in database`,
    );
    return;
  }

  const emailRes = await resend.emails.send({
    from: "Wikimasters <onboarding@resend.dev>",
    to: "ssg315ass@yahoo.com",
    subject: `Your artcile on Wikimasters got ${pageviews} views`,
    react: (
      <CelebrationTemplate
        articleTitle={title}
        pageviews={pageviews}
        articleUrl={`${BASE_URL}/wiki/${articleId}`}
        name={name ?? "Friend"}
      />
    ),
  });

  if (emailRes.error) {
    console.log(
      `❌ error sending ${id} a celebration email for getting ${pageviews} on article ${articleId}`,
    );
  } else {
    console.log(
      `📧 SENT ${id} a celebration email for getting ${pageviews} on article ${articleId}`,
    );
  }
}
