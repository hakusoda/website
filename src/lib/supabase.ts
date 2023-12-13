import { createClient } from '@supabase/supabase-js';
import type { PostgrestSingleResponse } from '@supabase/supabase-js';

import { requestError } from './util/server';
import { RequestErrorType } from './enums';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { SUPABASE_SERVICE_ROLE } from '$env/static/private';

const supabase = createClient(PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
	auth: {
		persistSession: false,
		autoRefreshToken: false
	}
});
export default supabase;

export function handleResponse<T extends PostgrestSingleResponse<any>>(response: T) {
	if (response.error) {
		console.error(response.error);
		throw requestError(500, RequestErrorType.DatabaseUpdate);
	}
	return response;
}