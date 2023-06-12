export enum UserFlags {
	None,
	Staff = 1 << 1,
	Tester = 1 << 2
}

export enum TeamRole {
	Member,
	Admin = 200,
	Owner = 255
}

export enum RobloxLinkType {
	User,
	GroupRole
}

export enum RobloxLinkFlag {
	None,
	Verified = 1 << 1
}

export enum Platform {
	Discord
}

export enum MellowBindType {
	DiscordRoles
}
export enum MellowBindRequirementType {
	HasVerifiedUserLink,
	HasRobloxGroupRole,
	HasRobloxGroupRankInRange
}
export enum MellowBindRequirementsType {
	MeetAll,
	MeetOne
}

export enum MellowLinkImportType {
	RobloxGroupRolesToDiscordRoles
}

export enum MellowLinkListViewMode {
	Default,
	Compact
}

export enum RequestErrorType {
	InvalidBody,
	Unauthenticated,
	DatabaseUpdate
}