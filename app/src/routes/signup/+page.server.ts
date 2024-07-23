import { users } from '$lib/schema';
import { lucia } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { LibsqlError } from '@libsql/client';
import { hash } from '@node-rs/argon2';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		return redirect(302, '/');
	}
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const username = formData.get('username');
		const email = formData.get('email');
		const password = formData.get('password');
		const confirmPassword = formData.get('confirmPassword');

		if (
			typeof username !== 'string' ||
			username.length < 3 ||
			username.length > 31 ||
			!/^[a-z0-9_-]+$/.test(username)
		) {
			return fail(400, { message: 'Invalid username.' });
		}

		if (typeof email !== 'string' || !/.+@.+/.test(email)) {
			return fail(400, { message: 'Invalid email.' });
		}

		if (typeof password !== 'string' || password.length < 8 || password.length > 255) {
			return fail(400, { message: 'Invalid password.' });
		}

		if (password !== confirmPassword) {
			return fail(400, { message: 'Passwords do not match.' });
		}

		const hashedPassword = await hash(password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		try {
			const [user] = await db
				.insert(users)
				.values({
					username,
					email,
					hashedPassword
				})
				.returning({ id: users.id });
			const session = await lucia.createSession(user.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		} catch (e) {
			if (e instanceof LibsqlError) {
				if (e.message.includes('username')) {
					return fail(400, { message: 'A user with that username already exists.' });
				}
				if (e.message.includes('email')) {
					return fail(400, { message: 'A user with that email already exists.' });
				}
			}
			return fail(500, { message: 'An unexpected error occurred.' });
		}

		return redirect(302, '/');
	}
};
