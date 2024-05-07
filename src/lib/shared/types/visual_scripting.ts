export interface Document {
	id: string
	name: string
	kind: string
	definition: Element[]
	created_by: {
		id: string
		name: string
		username: string
		avatar_url: string | null
	} | null
}

export type Element = BaseElement & (
	RootElement |
	TextElement |
	GenericElement |
	ConditionalStatementElement |
	StringValueWithVariableReferenceElement
)

export interface BaseElement {
	id: string
}

export interface RootElement {
	kind: 'special.root'
}

export interface TextElement {
	kind: 'no_op.comment'
	text: string
}

export interface StringValueWithVariableReferenceElement {
	kind:
		'action.mellow.member.roles.assign' |
		'action.mellow.message.reply' |
		'action.mellow.message.reaction.create'
	value: string
	reference: VariableReference
}

export interface VariableReference {
	path: string
}

export interface TextContainer {
	items: {
		type: 'string' | 'variable'
		value: string
	}[]
}

export interface GenericElement {
	kind:
		'action.mellow.member.ban' | 'action.mellow.member.kick' | 'action.mellow.member.sync' |
		'no_op.nothing'
}

export interface ConditionalStatementElement {
	kind: 'statement.if'
	blocks: StatementBlock[]
}

export interface StatementBlock {
	items: Element[]
	conditions: StatementBlockCondition[]
}

export interface StatementBlockCondition {
	kind: StatementConditionKind
	inputs: StatementInput[]
	condition?: {
		kind: ConditionKind
	}
}

export type StatementConditionKind = 'initial' | 'and' | 'or'

export type StatementInput =
	MatchStatementInput |
	VariableStatementInput

export interface MatchStatementInput {
	kind: 'match'
	value: any
}

export interface VariableStatementInput {
	kind: 'variable'
	value: VariableReference
}

export type ConditionKind =
	'generic.is' | 'generic.is_not' |
	'iterable.has_any_value' | 'iterable.does_not_have_any_value' | 'iterable.contains' | 'iterable.does_not_contain' | 'iterable.begins_with' | 'iterable.ends_with'