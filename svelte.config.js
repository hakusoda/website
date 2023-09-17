import adapter from '@sveltejs/adapter-vercel';
import preprocess from 'svelte-preprocess';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
export default {
	kit: {
		csrf: { checkOrigin: false },
		adapter: adapter({ runtime: 'edge' })
	},
	extensions: ['.svelte'],
	preprocess: [
		preprocess({}),
		vitePreprocess()
	]
};