import icons from 'unplugin-icons/vite'
import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
export default {
	build: {
		target: 'esnext'
	},
	plugins: [
		icons({
			compiler: 'svelte',
			scale: 1,
			iconCustomizer(_collection, _icon, props) {
				props['font-size'] = '16px';
			}
		}),
		sveltekit()
	],
	server: {
		allowedHosts: true,
		port: 5173,
		strictPort: true
	}
} satisfies UserConfig;