import { sessions, users } from "lib/schema";
import { db } from "lib/db";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia } from "lucia";

const adapter = new DrizzleSQLiteAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  getUserAttributes: (user) => ({
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    chips: user.chips,
    createdAt: user.createdAt,
  }),
  sessionCookie: {
    attributes: { secure: process.env.NODE_ENV === "production" },
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: typeof users.$inferSelect;
  }
}
