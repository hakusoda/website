import { z } from 'zod';
import type { ZodType } from 'zod';
import { get, writable } from 'svelte/store';
import { THEMES, LOCALES } from './constants';
import { MellowLinkListViewMode } from './enums';

function parse(value: string | null) {
	return Number.isNaN(value) ? value : Number(value);
}

function setting<T extends ZodType>(id: string, schema: T, initial: z.util.noUndefined<T['_type']>) {
	const itemId = `settings.${id}`;
	const obj = writable(schema.default(initial).catch(initial).parse(parse(globalThis.localStorage?.getItem(itemId))));
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
export const mellowLinkViewMode = setting('mellow.links.view_mode', z.nativeEnum(MellowLinkListViewMode), MellowLinkListViewMode.Default);