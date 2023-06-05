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