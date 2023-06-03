import supabase from './supabase';
import type { RobloxLink } from './types';
import type { RobloxLinkType } from './enums';
export function getUserRobloxLinks(userId: string, linkType?: RobloxLinkType) {
	const filter = supabase.from('roblox_links').select<string, RobloxLink>('*').eq('owner', userId);
	if (linkType !== undefined)
		filter.eq('type', linkType);
	return filter.then(response => {
		if (response.error)
			return [];
		return response.data;
	});
}