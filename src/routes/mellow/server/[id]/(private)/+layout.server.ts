import { requestError } from '$lib/server/util';
import { RequestErrorType } from '$lib/shared/enums';
export async function load({ parent }) {
	const { is_member } = await parent();
	if (!is_member)
		throw requestError(403, RequestErrorType.NoPermission);
}