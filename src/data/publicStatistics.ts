export type PublicStatistics = Readonly<{ xoxos: number; users: number; likes: number; matches: number }>;

// Launch totals; local demo profiles and activity are not public platform statistics.
export const PUBLIC_STATISTICS: PublicStatistics = { xoxos: 0, users: 0, likes: 0, matches: 0 };
export const PLACEHOLDER_PUBLIC_STATISTICS: PublicStatistics = { xoxos: 612500, users: 31250, likes: 128840, matches: 64920 };
