import { request } from '$lib/shared/util';
import { KOKO_API_KEY } from '$env/static/private';
import type { KokoExperienceServer } from '$lib/shared/types';
export async function load({ params }) {
	const response = await request<KokoExperienceServer[]>(`https://local-koko.hakumi.cafe/experience/${params.id}/servers`, 'GET', undefined, {
		'x-api-key': KOKO_API_KEY
	});
	return {
		items: response.success ? response.data : []
	};
}