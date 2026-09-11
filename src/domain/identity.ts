export const uniqueId = (prefix = `Event`) => `${prefix}_${Date.now().toString(36)}_${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
export const profileId = (number: number, name: string, now = new Date()) => `User_${number}_${name.replace(/[^a-z0-9]/gi, ``) || `Demo`}_${now.getUTCMonth() + 1}_${now.getUTCDate()}_${now.getUTCFullYear()}_${uniqueId(`id`)}`;
