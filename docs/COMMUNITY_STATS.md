# Community Statistics

The public landing page shows the XO token image, User’s, Likes, and Matches between the daily allowance and plan comparison. Four equal columns extend to both page edges, using progressively lighter MatchXD pinks and the existing `CountUp` blur animation. The token image has an accessible XOs label without visible currency text. Zero stays at zero; positive totals animate when visible and respect reduced motion.

`CommunityStats` defaults `placeholders` to `false`; the landing page currently enables it with `placeholders` to preview 41,250 XOs, 1,250 users, 6,840 likes, and 920 matches. The sample XO total equals 33 per sample user, and mutual matches account for fewer than the total likes. Sample mode is visibly labeled. Set the landing prop to `false` to return to the zero-default public statistics.

`src/data/publicStatistics.ts` holds the current zero defaults separately from all local demo data. No public aggregation backend exists yet. Pass verified platform totals through the component’s `statistics` prop when that source is available; default mode displays those values directly. Never use seeded profiles, device-local matches, or the local wallet as public platform totals. The XOXO sample assumes coins issued; confirm that definition before connecting production aggregation.
