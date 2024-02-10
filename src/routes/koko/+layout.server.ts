import { ROBLOX_API } from '@hakumi/roblox-api';

import { requestError } from '$lib/util/server';
import { RequestErrorType } from '$lib/enums';
import supabase, { handleResponse } from '$lib/supabase';
export async function load({ locals: { session } }) {
	if (!session)
		throw requestError(401, RequestErrorType.Unauthenticated);

	const response = await supabase.rpc('website_get_user_koko_experiences', { target_user_id: session!.sub });
	handleResponse(response);

	const experiences = await ROBLOX_API.experiences.get(response.data.map((item: any) => item.id))
	return { experiences };
}