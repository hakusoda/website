import { requestError } from '$lib/server/util';
import { RequestErrorType } from '$lib/shared/enums';
export async function load({ params, parent }) {
	const item = (await parent()).experiences.find(item => item.id.toString() === params.id);
	if (!item)
		throw requestError(404, RequestErrorType.NotFound);

	return item;
}