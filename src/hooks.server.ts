import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';
import { errors, jwtVerify } from 'jose';

import { dev } from '$app/environment';
import supabase from '$lib/supabase';
import { JWT_SECRET } from '$lib/constants/server';
import { EDGE_CONFIG } from '$env/static/private';
import { createUserSession, createRefreshToken } from '$lib/util/server';
if (dev)
	process.env.EDGE_CONFIG = EDGE_CONFIG;

export const handle = (async ({ event, resolve }) => {
	const cookie = event.cookies.get('auth-token');
	if (cookie) {
		const response = await jwtVerify(cookie, JWT_SECRET)
			.catch(async error => {
				if (error instanceof errors.JWTExpired) {
					const refresh = event.cookies.get('refresh-token');
					if (refresh) {
						const response = await supabase.from('user_refresh_tokens')
							.delete()
							.eq('refresh_token', refresh)
							.select('user_id')
							.limit(1)
							.maybeSingle();
						if (response.data) {
							const { user_id } = response.data;

							const [token, newPayload] = await createUserSession(user_id);
							const refresh = await createRefreshToken(user_id);
							const cookieOptions = { path: '/', domain: 'voxelified.com', expires: new Date(Date.now() + 31556926000), sameSite: 'none', httpOnly: false } as const;
							event.cookies.set('auth-token', token, cookieOptions);
							event.cookies.set('refresh-token', refresh, cookieOptions);
		
							return { payload: newPayload };
						}
					}
				}

				event.cookies.delete('auth-token', { path: '/', domain: 'voxelified.com' });
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