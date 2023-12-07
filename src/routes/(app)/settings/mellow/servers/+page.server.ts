import supabase from '$lib/supabase';
import { requestError } from '$lib/util/server';
import { getDiscordToken } from '$lib/verification';
import { RequestErrorType } from '$lib/enums';
import type { PageServerLoad } from './$types';
import { createMellowServerDiscordRedirectUrl } from '$lib/util';

export const config = { regions: ['iad1'], runtime: 'edge' };
export const load = (async ({ url, parent }) => {
	const { session } = await parent();
	const response = await supabase.from('mellow_server_members').select<string, {
		server: {
			id: string
			name: string
			members: [{ count: number }]
			avatar_url: string
		}
	}>('server:mellow_servers ( id, name, avatar_url, members:mellow_server_members ( count ) )').eq('user_id', session!.sub);
	if (response.error) {
		console.error(response.error);
		throw requestError(500, RequestErrorType.ExternalRequestError);
	}

	let allServers: {
		id: string
		name: string
		icon: string | null
		owner: boolean
		features: string[]
		permissions: string
		approximate_member_count: number
		approximate_presence_count: number
	}[] = [];
	const code = url.searchParams.get('code');
	if (code && session) {
		const response = await getDiscordToken(code, createMellowServerDiscordRedirectUrl(url.origin));
		if (!response.success) {
			console.error(response.error);
			throw requestError(500, RequestErrorType.ExternalRequestError);
		}

		const response2 = await fetch('https://discord.com/api/v10/users/@me/guilds', {
			headers: {
				authorization: `${response.data.token_type} ${response.data.access_token}`
			}
		}).then(response => response.json());
		const response3 = await supabase.from('mellow_user_servers').upsert({
			data: response2,
			user_id: session.sub
		}, { onConflict: 'user_id' });
		if (response3.error) {
			console.error(response3.error);
			throw requestError(500, RequestErrorType.ExternalRequestError);
		}

		allServers = response2;
	} else if (session) {
		const response = await supabase.from('mellow_user_servers').select('data').eq('user_id', session.sub).limit(1).maybeSingle();
		if (response.error) {
			console.error(response.error);
			throw requestError(500, RequestErrorType.ExternalRequestError);
		}

		allServers = response.data?.data ?? [];
	}

	return { servers: response.data.map(item => item.server), allServers };
}) satisfies PageServerLoad;