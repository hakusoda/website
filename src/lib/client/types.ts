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