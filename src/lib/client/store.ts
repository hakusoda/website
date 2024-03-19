import { onMount } from 'svelte';
import { browser } from '$app/environment';
import { get, readable, writable, type Readable } from 'svelte/store';

import type { MellowServer } from './types';
import { get_mellow_servers } from './api';
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
			editor.callback = null;
			editor.isSaving.set(true);
			callback().then(() => (editor.isSaving.set(false), editor.isCreating.set(false)));
		};
		return () => editor.callback = null;
	});
}