import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { generateId } from "lucia";

const createId = () => generateId(15);

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(createId),

  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  avatar: text("avatar"),
  hashedPassword: text("hashed_password"),

  chips: integer("chips").notNull().default(1000),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: integer("expires_at").notNull(),
});
