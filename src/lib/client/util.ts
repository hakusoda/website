import type { EventResponseItem, EventResponseItemKind } from "$lib/shared/types";

// is there a way to have this return the type associated with the provided kind?
export function create_event_response_item(kind: EventResponseItemKind): EventResponseItem {
	if (kind === 'action.mellow.sync_profile')
		return { kind };
	else if (kind === 'statement.if')
		return { kind, blocks: [] };
	throw new TypeError(`${kind} is not a valid kind`);
}

export function parse_update_payload<T extends Record<any, any>>(old: Record<any, any>, new_: T): T {
	const final: Record<any, any> = {};
	for (const [key, value] of Object.entries(new_)) {
		if (JSON.stringify(value) !== JSON.stringify(old[key]))
			final[key] = value;
	}

	return final;
}