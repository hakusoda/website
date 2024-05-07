import type { ActionLogItem } from '$lib/shared/types';
export function get_data_change_value(data_change?: ActionLogItem['data_changes'][number]): any {
	if (!data_change)
		return null;
	
	if (data_change.kind === 'created')
		return data_change.value;
	else if (data_change.kind === 'updated')
		return data_change.new_value;
	return data_change.old_value;
}

export function parse_update_payload<T extends Record<any, any>>(old: Record<any, any>, new_: T): T {
	const final: Record<any, any> = {};
	for (const [key, value] of Object.entries(new_)) {
		if (JSON.stringify(value) !== JSON.stringify(old[key]))
			final[key] = value;
	}

	return final;
}