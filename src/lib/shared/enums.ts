export enum UserFlag {
	None,
	Staff = 1 << 1,
	Tester = 1 << 2
}

export enum UserNotificationType {
	TeamInvite,
	RemovedFromTeam,
	UserConnectionModerated,
	SOMETHING,
	TeamMemberJoined,
	TeamMemberLeft
}

export enum UserNotificationState {
	Unread,
	Read
}

export enum UserConnectionKind {
	Discord,
	GitHub,
	Roblox,
	YouTube,
	Patreon
}

export enum TeamFlag {
	None,
	Verified = 1 << 0
}

export enum TeamRolePermission {
	None,
	ManageTeam = 1 << 0,
	InviteUsers = 1 << 1,
	ManageMembers = 1 << 2,
	ManageRoles = 1 << 3,
	Administrator = 1 << 4
}

export enum FeatureFlag {
	None,
	MellowSignUp = 1 << 0,
	UserConnections = 1 << 1
}

export enum MellowServerLogType {
	None,
	ActionLog = 1 << 0,
	ServerProfileSync = 1 << 1,
	VisualScriptingDocumentResult = 1 << 3
}

export enum MellowWebhookEventType {
	None,
	RobloxServerProfileSync = 1 << 0
}

// this is temporary, and will later be replaced with a fully-featured & user friendly system.
export enum MellowDefaultNickname {
	RobloxUsername = '{roblox_username}',
	RobloxDisplayName = '{roblox_display_name}',
	None = ''
}

export enum RequestErrorType {
	InvalidBody,
	Unauthenticated,
	DatabaseUpdate,
	Offline,
	Unknown,
	Unauthorised,
	ExternalRequestError,
	NotFound,
	NoPermission,
	NameTooShort,
	FetchError,
	FeatureFlagDisabled,
	InvalidQuery,
	NameTooLong
}

// https://discord.com/developers/docs/resources/channel#channel-object-channel-types
export enum DiscordChannelType {
	GuildText,
	UserDM,
	GuildVoice,
	GroupDM,
	GuildCategory,
	GuildAnnouncement,
	AnnouncementThread = 10,
	PublicThread,
	PrivateThread,
	GuildStageVoice,
	GuildDirectory,
	GuildForum
}