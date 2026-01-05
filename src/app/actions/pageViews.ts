"use server";

import redis from "@/cache";
import sendCelebrationEmail from "@/email/celebration-email";

const keyFor = (id: number) => `pageviews:article${id}`;
const milestones = [10, 50, 100, 10000];

export async function incrementPageView(articleId: number) {
  const articleKey = keyFor(articleId);
  const newVal = await redis.incr(articleKey);
  if (milestones.includes(newVal)) {
    sendCelebrationEmail(articleId, newVal);
  }
  return newVal;
}
