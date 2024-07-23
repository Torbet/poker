import { dev } from '$app/environment';
import { sessions, users } from '$lib/schema';
import { db } from '$lib/server/db';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { Lucia } from 'lucia';

const adapter = new DrizzleSQLiteAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
	getUserAttributes: (user) => user,
	sessionCookie: { attributes: { secure: !dev } }
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: User;
	}
}
