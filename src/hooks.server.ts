import { redirect } from '@sveltejs/kit';
import { jwtVerify } from 'jose';

import { dev } from '$app/environment';
import { JWT_SECRET } from '$lib/constants/server';
import { EDGE_CONFIG } from '$env/static/private';
import type { UserSessionJWT } from '$lib/types';
if (dev)
	process.env.EDGE_CONFIG = EDGE_CONFIG;

export async function handle({ event, resolve }) {
	const cookie = event.cookies.get('auth-token');
	if (cookie) {
		const { payload } = await jwtVerify<UserSessionJWT>(cookie, JWT_SECRET)
			.catch(() => {
				event.cookies.delete('auth-token', { path: '/', domain: '.hakumi.cafe' });
				throw redirect(302, `/sign-in?redirect_uri=${encodeURIComponent(event.url.pathname + event.url.search)}`);
			});
		event.locals.session = payload;

		if (payload.source_connection_id && event.url.pathname !== '/migrate_from_third_party')
			throw redirect(302, '/migrate_from_third_party');
		if (payload.mellow_user_state && event.url.pathname !== '/mellow/finish_signup')
			throw redirect(302, '/mellow/finish_signup');
	}

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range';
		}
	});
}