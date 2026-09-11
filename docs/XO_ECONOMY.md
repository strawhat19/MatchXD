# MatchXD XO Economy

[Project overview](../README.md) · [Demo guide](DEMO_GUIDE.md) · [Development](DEVELOPMENT.md)

XOs are MatchXD's in-app action currency. The current release simulates balances, purchases, subscriptions, and ad rewards locally; no money is charged. Prices below are the configured US pricing in USD.

## Plans And Daily Allowances

| Plan | Monthly USD | Daily XOs | Added Access |
| --- | ---: | ---: | --- |
| Free | $0 | 33 | Discovery, matching, messaging, basic preferences |
| M | $3.33 | 88 | Ethnicity preferences |
| MX | $5.55 | 154 | Salary and height preferences |
| MXD | $11.11 | 253 | Incognito |

Each paid tier includes the preceding tier's access. Daily grants are cumulative: 33 from Free, plus 55 from M, plus 66 from MX, plus 99 from MXD.

| Daily Action | Free | M | MX | MXD | XO Cost Each |
| --- | ---: | ---: | ---: | ---: | ---: |
| Rewind | 1 | 3 | 5 | 10 | 1 |
| Super Like | 1 | 3 | 5 | 10 | 1 |
| First message | 1 | 3 | 5 | 10 | 1 |

These are separate allowances for each action. Buying XOs does not bypass the caps. Upgrades retain usage already consumed that day; rewinding or removing a connection does not refund an allowance or reopen an introduction.

## Action Costs And Messaging

- Pass, like, Super Like, rewind, an unmatched first message, and MXO requests each cost 1 XO.
- Matched messages are always free, including at zero balance, with no daily message cap.
- A first message expresses interest. Only one can be sent per recipient until a mutual match opens free chat. A daily reset does not allow another introduction to the same person. Pending introductions receive no scripted reply.
- Blocking, reporting, unmatching, and privacy controls do not spend XOs. Incognito access still requires MXD.
- Failed charged actions do not spend XOs, and replayed operation IDs do not charge twice.

## Daily Reset And Spending Order

Daily XOs and action allowances reset at midnight `America/New_York`, including daylight-saving changes. Unused daily XOs expire; missed days do not accumulate. Unused action allowances do not roll over. Purchased XOs do not expire, and daily XOs are spent first.

## Packs And Ad Rewards

Packs preserve 10 XOs per $1:

| Price USD | Purchased XOs |
| --- | ---: |
| $1 | 10 |
| $5 | 50 |
| $10 | 100 |

A simulated ad reward adds 5 daily XOs, up to 3 times a day. Daily expiry and the separate action caps still apply.

## Upgrades And Cancellation

An upgrade grants only the difference from the highest daily allowance already granted that day. Cancellation retains access until the displayed simulated cancellation date, then returns to Free.

## Configuration And Connected Payments

Money is stored as integer cents, and XO balances are integers. Tier prices, cumulative grants, action limits, and access live in [plans.ts](../src/config/plans.ts). Action costs, packs, reward limits, and the reset timezone live in [economy.ts](../src/config/economy.ts). Matched messages are enforced as free by the [domain transition logic](../src/domain/transition.ts).

These are editable local balances, not payment security. A connected version needs server time, atomic wallet transactions, verified payment events, and server-enforced entitlements. See [Deployment](DEPLOYMENT.md) for integration and billing work, and [Verification](VERIFICATION.md) for the scope of the accounting checks already executed.
