import { get, writable } from 'svelte/store';

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