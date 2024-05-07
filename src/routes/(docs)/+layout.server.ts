export function load() {
	const modules: Record<string, {
		metadata?: {
			position?: number
		}
	}> = import.meta.glob('./**/*.md', { eager: true });
	return {
		articles: Object.entries(modules).map(([path, { metadata }]) => ({
			url: path.slice(1, -9),
			metadata
		}))
	};
};