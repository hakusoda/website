export function createDiscordRedirectUri(origin: string) {
	return `${origin}/roblox/verify/platform/discord`;
}

export const uuidRegex = /\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/;

export const isUUID = (uuid: string) => uuidRegex.test(uuid);
export const hasFlag = (bits: number, bit: number) => (bits & bit) === bit;