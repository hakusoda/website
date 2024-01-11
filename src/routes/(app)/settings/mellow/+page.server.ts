import { requestError } from '$lib/util/server';
import { getDiscordToken } from '$lib/verification';
import { RequestErrorType } from '$lib/enums';
import supabase, { handleResponse } from '$lib/supabase';
import { createMellowServerDiscordRedirectUrl } from '$lib/util';
export async function load({ url, locals: { session } }) {
	const response = await supabase.rpc('website_get_user_mellow_servers', {
		target_user_id: session!.sub
	});
	handleResponse(response);

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
		handleResponse(response3);

		allServers = response2;
	} else if (session) {
		const response = await supabase.from('mellow_user_servers').select('data').eq('user_id', session.sub).limit(1).maybeSingle();
		handleResponse(response);

		allServers = response.data?.data! ?? [];
	}

	return {
		servers: response.data as {
			id: string
			name: string
			avatar_url: string | null
			owner_team_name: string | null
			owner_user_name: string | null
			owner_user_username: string | null
		}[],
		allServers
	};
}