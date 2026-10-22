import "dotenv/config";
import { hashPassword } from "@/lib/auth";
import db from "@/lib/db";

/** Shared password for every seed account. Development only — documented in README.md. */
export const SEED_PASSWORD = "password123";

const HOUR = 60 * 60 * 1000;

const users = [
  {
    email: "maya@example.com",
    username: "Maya Okafor",
    handle: "maya",
    avatarUrl: "/avatars/maya.svg",
    bio: "Product engineer. Writing about frontend performance and team rituals.",
  },
  {
    email: "theo@example.com",
    username: "Theo Lindqvist",
    handle: "theo_l",
    avatarUrl: "/avatars/theo.svg",
    bio: "Staff engineer, reformed perfectionist.",
  },
  {
    // No avatar, so the UI's initials fallback gets exercised.
    email: "priya@example.com",
    username: "Priya Raman",
    handle: "priya",
    avatarUrl: null,
    bio: null,
  },
] as const;

type Handle = (typeof users)[number]["handle"];

// Newest first. `upvotedBy` covers 0, 1, 2 and 3 upvotes so counts in the feed vary.
const tweets: { by: Handle; hoursAgo: number; content: string; upvotedBy: Handle[] }[] = [
  { by: "maya", hoursAgo: 1, content: "Shipped dark-launch flags for the new onboarding flow. Watching the funnel like a hawk this afternoon.", upvotedBy: ["theo_l", "priya"] },
  { by: "theo_l", hoursAgo: 3, content: "Hot take: the best code review comment is a question, not a command.", upvotedBy: ["maya", "priya", "theo_l"] },
  { by: "priya", hoursAgo: 5, content: "If your standup regularly runs past 15 minutes, it's a meeting. Give it an agenda.", upvotedBy: ["maya"] },
  { by: "maya", hoursAgo: 9, content: "Moved the session read behind a Suspense boundary and the header now paints instantly. Small change, big feel.", upvotedBy: [] },
  { by: "theo_l", hoursAgo: 14, content: "Deleted 600 lines of config today. Nothing broke. Suspicious.", upvotedBy: ["priya"] },
  { by: "priya", hoursAgo: 20, content: "Pairing tip: swap the keyboard every time a test goes green. Keeps both people awake.", upvotedBy: ["maya", "theo_l"] },
  { by: "maya", hoursAgo: 28, content: "Accessibility audit found 3 icon buttons without labels. Fixed in 10 minutes, should have been caught in review.", upvotedBy: ["theo_l"] },
  { by: "theo_l", hoursAgo: 40, content: "Reminder that `git bisect run` exists and will find your regression while you get coffee.", upvotedBy: ["maya", "priya"] },
  { by: "priya", hoursAgo: 52, content: "Wrote the error message first, then the feature. The feature came out better.", upvotedBy: [] },
  { by: "maya", hoursAgo: 70, content: "Hello world. Setting up shop here.", upvotedBy: ["priya"] },
];

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed: NODE_ENV is production");
  }
  try {
    // Idempotent: remove only the seed accounts (cascades to their tweets and upvotes), then recreate.
    await db.user.deleteMany({ where: { email: { in: users.map((u) => u.email) } } });

    const passwordHash = await hashPassword(SEED_PASSWORD);
    const idByHandle = new Map<Handle, string>();
    for (const user of users) {
      const created = await db.user.create({ data: { ...user, passwordHash } });
      idByHandle.set(user.handle, created.id);
    }

    const now = Date.now();
    let upvoteCount = 0;
    for (const tweet of tweets) {
      await db.tweet.create({
        data: {
          content: tweet.content,
          userId: idByHandle.get(tweet.by)!,
          createdAt: new Date(now - tweet.hoursAgo * HOUR),
          upvotes: { create: tweet.upvotedBy.map((handle) => ({ userId: idByHandle.get(handle)! })) },
        },
      });
      upvoteCount += tweet.upvotedBy.length;
    }

    console.log(`Seeded ${users.length} users, ${tweets.length} tweets, ${upvoteCount} upvotes.`);
    console.log(`Log in as ${users.map((u) => u.email).join(", ")} with password "${SEED_PASSWORD}".`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
