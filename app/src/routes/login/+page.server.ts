import { users } from '$lib/schema';
import { lucia } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { verify } from '@node-rs/argon2';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		return redirect(302, '/');
	}
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const email = formData.get('email');
		const password = formData.get('password');

		if (typeof email !== 'string' || !/.+@.+/.test(email)) {
			return fail(400, { message: 'Invalid email.' });
		}

		if (typeof password !== 'string' || password.length < 8 || password.length > 255) {
			return fail(400, { message: 'Invalid password.' });
		}

		const [user] = await db.select().from(users).where(eq(users.email, email));

		if (!user || !user.hashedPassword) {
			return fail(401, { message: 'Incorrect email or password.' });
		}
		const validPassword = await verify(user.hashedPassword, password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});
		if (!validPassword) {
			return fail(401, { message: 'Incorrect email or password.' });
		}
		const session = await lucia.createSession(user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		return redirect(302, '/');
	}
};
