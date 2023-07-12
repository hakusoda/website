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
	HasRobloxGroupRankInRange,
	InRobloxGroup,
	IsFriendsWith,
	MeetsOtherLink
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

export enum MellowServerAuditLogType {
	CreateServer,
	CreateRobloxLink,
	UpdateRobloxGlobalSettings,
	DeleteRobloxLink,
	UpdateRobloxLink,
	UpdateLogging
}

export enum MellowServerLogType {
	None,
	AuditLog = 1 << 0,
	ServerProfileSync = 1 << 1
}

export enum TeamAuditLogType {
	CreateTeam,
	RenameTeam,
	UpdateAvatar,
	UpdateProfile,
	CreateProject,
	UpdateProject,
	UpdateProjectAvatar,
	UpdateProjectBanner
}

export enum ProjectFlag {
	None
}

export enum UserNotificationType {
	TeamInvite,
	RemovedFromTeam,
	RobloxAccountRemoved,
	SOMETHING,
	TeamMemberJoined,
	TeamMemberLeft
}

export enum UserNotificationState {
	Unread,
	Read
}

export enum RequestErrorType {
	InvalidBody,
	Unauthenticated,
	DatabaseUpdate,
	MellowLinkRequirementMissingRole,
	Offline,
	Unknown,
	Unauthorised,
	ExternalRequestError,
	NotFound
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