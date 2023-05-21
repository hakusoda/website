import { z } from 'zod';
import type { ZodEnum } from 'zod';
import { get, writable } from 'svelte/store';
import { THEMES, LOCALES } from './constants';

function setting<T extends [string, ...string[]]>(id: string, schema: ZodEnum<T>, initial: z.util.noUndefined<T[number]>) {
	const itemId = `settings.${id}`;
	const obj = writable(schema.default(initial).catch(initial).parse(globalThis.localStorage?.getItem(itemId)));
	if (globalThis.localStorage) {
		obj.subscribe(value => localStorage.setItem(itemId, value.toString()));
		window.addEventListener('storage', event => {
			if (event.storageArea === localStorage && event.key === itemId && event.newValue !== get(obj))
				obj.set(event.newValue as any);
		});
	}
	return obj;
}

export const theme = setting('theme', z.enum(THEMES), THEMES[0]);
export const locale = setting('locale', z.enum(LOCALES), LOCALES[0]);