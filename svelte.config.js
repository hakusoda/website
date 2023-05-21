import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
export default {
	kit: {
		adapter: adapter()
	},
	extensions: ['.svelte'],
	preprocess: [
		preprocess({}),
		vitePreprocess()
	]
};