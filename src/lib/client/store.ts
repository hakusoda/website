import { onMount } from 'svelte';
import { browser } from '$app/environment';
import type { GroupRole } from '@hakumi/roblox-open-cloud';
import { get, readable, writable, type Readable } from 'svelte/store';

import type { MellowServer } from './types';
import { get_mellow_servers, get_roblox_group_roles_for_mellow_server } from './api';
export const editor = {
	active: writable(false),
	canSave: writable(false),
	isSaving: writable(false),
	isCreating: writable(false),
	callback: null as (() => void) | null
};
export const sudoModal = writable(false);
export const sudoEnabled = writable(false);

let mellow_servers = writable(null as MellowServer[] | null);
let has_requested_mellow_servers = false;
export function use_mellow_servers(): Readable<MellowServer[] | null> {
	if (!browser)
		return readable(null);

	const current_value = get(mellow_servers);
	if (!current_value && !has_requested_mellow_servers) {
		has_requested_mellow_servers = true;
		get_mellow_servers().then(response => {
			if (response.success)
				mellow_servers.set(response.data);
		});
	}

	return mellow_servers;
}

let roblox_roles = writable({} as Record<number, GroupRole[]>);
let roblox_roles_request_queue: number[] = [];
export function use_roblox_group_roles(server_id: string, group_ids: number[]): Readable<Record<number, GroupRole[]>> {
	if (!browser)	
		return readable({});

	const current_value = get(roblox_roles);
	for (const group_id of group_ids) {
		if (!current_value[group_id] && !roblox_roles_request_queue.includes(group_id)) {
			roblox_roles_request_queue.push(group_id);
			get_roblox_group_roles_for_mellow_server(server_id, group_id).then(response => {
				if (response.success)
					roblox_roles.update(value => ({ ...value, [group_id]: response.data }));
				roblox_roles_request_queue = roblox_roles_request_queue.filter(item => item !== group_id);
			});
		}
	}

	return roblox_roles;
}

export function enable_sudo_mode() {
	sudoModal.set(true);
	return new Promise<boolean>(resolve => {
		const unsubscribe = sudoModal.subscribe(value => {
			if (!value) {
				unsubscribe();
				resolve(get(sudoEnabled));
			}
		});
	});
}

export function set_editor_callback(callback: () => Promise<void>) {
	onMount(() => {
		editor.callback = () => {
			editor.isSaving.set(true);
			callback()
				.finally(() => (editor.isSaving.set(false), editor.isCreating.set(false)));
		};
		return () => editor.callback = null;
	});
}