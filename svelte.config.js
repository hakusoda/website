import adapter from '@sveltejs/adapter-vercel';
import { mdsvex } from 'mdsvex';
import { sveltePreprocess } from 'svelte-preprocess';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
export default {
	extensions: ['.md', '.svelte'],
	kit: {
		csrf: { checkOrigin: false },
		adapter: adapter({
			images: {
				domains: ['hakumi.cafe'],
				formats: ['image/avif', 'image/webp'],
				minimumCacheTTL: 300,
				sizes: [600, 1200]
			},
			runtime: 'edge'
		})
	},
	preprocess: [
		mdsvex({
			extension: '.md',
			layout: 'src/lib/interface/layouts/markdown.svelte'
		}),
		sveltePreprocess({}),
		vitePreprocess()
	]
};