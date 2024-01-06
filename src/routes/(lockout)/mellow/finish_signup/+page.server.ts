import { redirect } from '@sveltejs/kit';
export async function load({ locals: { session }}) {
	if (!session || !session.mellow_user_state)
		throw redirect(302, `/`);
}