import { redirect } from '@sveltejs/kit';
import { jwtVerify } from 'jose';
import type { Handle } from '@sveltejs/kit';

import { dev } from '$app/environment';
import { JWT_SECRET } from '$lib/constants/server';
import { EDGE_CONFIG } from '$env/static/private';
if (dev)
	process.env.EDGE_CONFIG = EDGE_CONFIG;

export const handle = (async ({ event, resolve }) => {
	const cookie = event.cookies.get('auth-token');
	if (cookie) {
		const response = await jwtVerify(cookie, JWT_SECRET)
			.catch(() => {
				event.cookies.delete('auth-token', { path: '/', domain: '.voxelified.com' });
				throw redirect(302, `/sign-in?redirect_uri=${encodeURIComponent(event.url.pathname + event.url.search)}`);
			});
		event.locals.session = response?.payload as any;
	}

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range';
		}
	});
}) satisfies Handle;