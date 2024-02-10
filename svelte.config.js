import adapter from '@sveltejs/adapter-vercel';
import { mdsvex } from 'mdsvex';
import preprocess from 'svelte-preprocess';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
export default {
	kit: {
		csrf: { checkOrigin: false },
		adapter: adapter({ split: true, runtime: 'edge' })
	},
	extensions: ['.svelte', '.md'],
	preprocess: [
		mdsvex({
			layout: {
				_: './src/routes/(docs)/article.svelte'
			},
			extensions: ['.md']
		}),
		preprocess({}),
		vitePreprocess()
	]
};