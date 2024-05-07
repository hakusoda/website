export interface MellowServer {
	id: string
	name: string
	owner: {
		kind: 'team'
		name: string
	} | {
		name: string
		username: string
	}
	avatar_url: string | null
}

export interface UpdateMellowUserServerSettingsPayload {
	is_onboarding?: boolean
	user_connections: {
		id: string
	}[]
}

export interface UpdateMellowServerLoggingPayload {
	channel_id?: string | null
	event_kinds?: number
}

export interface CreateMellowServerCommandPayload {
	name: string
	kind: 'slash_command'
	description: string
}