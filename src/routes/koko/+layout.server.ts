import { ROBLOX_API } from '@hakumi/roblox-api';

import { requestError } from '$lib/server/util';
import { RequestErrorType } from '$lib/shared/enums';
import supabase, { handle_response } from '$lib/server/supabase';
export async function load({ locals: { session } }) {
	if (!session)
		throw requestError(401, RequestErrorType.Unauthenticated);

	const response = await supabase.rpc('website_get_user_koko_experiences', { target_user_id: session!.sub });
	handle_response(response);

	const experiences = await ROBLOX_API.experiences.get(response.data.map((item: any) => item.id))
	return { experiences };
}