"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import db from "@/db";
import { authorizeUserToEditArticle } from "@/db/authz";
import { articles } from "@/db/schema";
import { stackServerApp } from "@/stack/server";

export type CreateArticleInput = {
  title: string;
  content: string;
  authorId: string;
  imageUrl?: string;
};

export type UpdateArticleInput = {
  title?: string;
  content?: string;
  imageUrl?: string;
};

export async function createArticle(data: CreateArticleInput) {
  const user = await stackServerApp.getUser();

  if (!user) {
    throw new Error("un authorized");
  }

  // TODO: Replace with actual database call
  console.log("✨ createArticle called:", data);

  await db.insert(articles).values({
    title: data.title,
    content: data.content,
    slug: `${Date.now()}`,
    published: true,
    authorId: user.id,
  });
  return { success: true, message: "Article create logged (stub)" };
}

export async function updateArticle(id: string, data: UpdateArticleInput) {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error("Un authorized");
  }

  if (!(await authorizeUserToEditArticle(user.id, +id))) {
    throw new Error("Forbidden");
  }

  const authorId = user.id;
  // TODO: Replace with actual database update
  await db
    .update(articles)
    .set({
      title: data.title,
      content: data.content,
    })
    .where(eq(articles.id, +id));
  console.log("📝 updateArticle called:", { id, ...data, authorId });
  return { success: true, message: `Article ${id} update logged (stub)` };
}

export async function deleteArticle(id: string) {
  // TODO: Replace with actual database delete
  console.log("🗑️ deleteArticle called:", id);
  await db.delete(articles).where(eq(articles.id, +id));
  return { success: true, message: `Article ${id} delete logged (stub)` };
}

// Form-friendly server action: accepts FormData from a client form and calls deleteArticle
export async function deleteArticleForm(formData: FormData): Promise<void> {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error("Un Authorized");
  }
  const id = formData.get("id");
  if (!id) {
    throw new Error("Missing article id");
  }

  if (!(await authorizeUserToEditArticle(user.id, +id))) {
    throw new Error("Forbidden");
  }

  await deleteArticle(String(id));
  // After deleting, redirect the user back to the homepage.
  redirect("/");
}
