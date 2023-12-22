import { onMount } from 'svelte';
import { get, writable } from 'svelte/store';

export const editor = {
	active: writable(false),
	canSave: writable(false),
	isSaving: writable(false),
	callback: null as (() => void) | null
};
export const sudoModal = writable(false);
export const sudoEnabled = writable(false);

export function enableSudoMode() {
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

export function setEditorCallback(callback: () => Promise<void>) {
	onMount(() => {
		editor.callback = () => {
			editor.callback = null;
			editor.isSaving.set(true);
			callback().then(() => editor.isSaving.set(false));
		};
		return () => editor.callback = null;
	});
}