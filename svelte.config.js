import adapter from '@sveltejs/adapter-vercel';
import { mdsvex } from 'mdsvex';
import preprocess from 'svelte-preprocess';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
export default {
	kit: {
		csrf: { checkOrigin: false },
		adapter: adapter({ runtime: 'edge' })
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