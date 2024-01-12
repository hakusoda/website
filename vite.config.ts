import icons from 'unplugin-icons/vite'
import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
export default {
	build: {
		target: 'esnext'
	},
	plugins: [sveltekit(), icons({
		scale: 1,
		compiler: 'svelte',
		iconCustomizer(collection, icon, props) {
			props['font-size'] = '16px';
		}
	})]
} satisfies UserConfig;