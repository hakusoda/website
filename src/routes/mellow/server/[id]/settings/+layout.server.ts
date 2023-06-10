import type { LayoutServerLoad } from './$types';
import { verifyServerMembership } from '$lib/util/server';
export const load = (async ({ params: { id }, locals: { getSession } }) => {
	await verifyServerMembership(await getSession(), id);
}) satisfies LayoutServerLoad;