export const ECONOMY = {
  xoPerDollar: 10,
  freeMatchedMessages: true,
  timezone: `America/New_York`,
  ads: { reward: 5, limit: 3 },
  packs: [{ cents: 100, xo: 10 }, { cents: 500, xo: 50 }, { cents: 1000, xo: 100 }],
  costs: { pass: 1, like: 1, super: 1, rewind: 1, message: 1, firstMessage: 1, mxo: 1 },
} as const;
