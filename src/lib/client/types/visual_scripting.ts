import type { SvelteComponent } from 'svelte';
export type Variable = BaseVariable & (
	MapVariable |
	ListVariable |
	BasicVariable
)

export interface BaseVariable {
	display_icon?: typeof SvelteComponent<any>
	translation_key?: string
}

export interface MapVariable {
	kind: 'generic.map'
	definition: Record<string, Variable>
}

export interface ListVariable {
	kind: 'generic.list'
	definition: Variable[]
}

export interface BasicVariable {
	kind: 'generic.string'
}