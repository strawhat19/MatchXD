# MatchXD

**Real people. Brighter connections.**

MatchXD is a dating app for adults, designed around personal expression, mutual connections, and premium features at accessible prices. Built for iOS, Android, and the web, it pairs a mobile-first experience with a polished desktop layout.

![MatchXD app preview](./public/assets/versions/MatchXD_v0000_0.gif)

[Getting Started](docs/GETTING_STARTED.md) · [Demo Guide](docs/DEMO_GUIDE.md) · [Development](docs/DEVELOPMENT.md) · [Deployment](docs/DEPLOYMENT.md)

## The Experience

- **Discover your people.** Explore profiles, shared interests, and personal preferences with likes, Super Likes, and rewinds.
- **Make the first move.** Send one first message for 1 XO before matching. Once you match, messages are free and unlimited.
- **Show more of yourself.** Build a profile with photos, interests, optional attributes, voice/video introductions, and links you choose to share.
- **Find a starting point with MXO.** Describe what matters to you and explore profiles through a conversational interface.
- **Connect on your terms.** Browse Profiler's opt-in directory, manage visibility, and use free blocking and reporting. MXD adds incognito.
- **Feel at home on any screen.** Responsive navigation, Light/Dark/System themes, and MatchXD's coral and charcoal visual identity carry across the app.

## Simple Pricing

| Plan | Monthly USD | Daily XOs | Daily Limit Per Action* |
| --- | ---: | ---: | ---: |
| Free | $0 | 33 | 1 |
| M | $3.33 | 88 | 3 |
| MX | $5.55 | 154 | 5 |
| MXD | $11.11 | 253 | 10 |

*Separate daily limits apply to rewinds, Super Likes, and first messages. Matched chat is free across every plan. Prices reflect the current app configuration; checkout is simulated in this release.*

See the [XO Economy](docs/XO_ECONOMY.md) for plan access, action costs, packs, daily resets, and subscription behavior.

## Project Status

The current release is a local preview with fictional adult profiles and saved activity on each device. Authentication, chat replies, AI recommendations, purchases, ads, and moderation use demo implementations. Live accounts, payments, a connected dating network, and store distribution require the integrations described in [Deployment](docs/DEPLOYMENT.md).

The app uses Expo, React Native, TypeScript, and Expo Router. Shared domain logic handles matching, visibility, action limits, and XO accounting. See [Verification](docs/VERIFICATION.md) for completed checks and their scope.

Expo and Vercel are connected to the GitHub repository. The first Vercel web deployment is pending; follow [Deploy Expo To Web](docs/deploy-expo-app-to-web.md) for the setup and current status. The owner confirmed this preview's personal, noncommercial use for Vercel Hobby.

## Documentation

| Guide | Contents |
| --- | --- |
| [Getting Started](docs/GETTING_STARTED.md) | Windows and Mac setup, web preview, phone access, and network troubleshooting |
| [Demo Guide](docs/DEMO_GUIDE.md) | Member and owner walkthroughs, local data, reset/recovery, and media behavior |
| [XO Economy](docs/XO_ECONOMY.md) | Plans, prices, action limits, balances, and messaging rules |
| [Development](docs/DEVELOPMENT.md) | Project structure, configuration, and verification commands |
| [Deployment](docs/DEPLOYMENT.md) | Web hosting, standalone builds, connected services, launch preparation, and cost planning |
| [Deploy Expo To Web](docs/deploy-expo-app-to-web.md) | Expo and GitHub linkage, web build settings, hosting status, and automatic updates from main |
| [Verification](docs/VERIFICATION.md) | Recorded results, known limitations, and unverified behavior |
| [Implementation Plan](docs/IMPLEMENTATION_PLAN.md) | Product scope and integration roadmap |

## Design

The connected-X identity represents two people crossing paths. Explore the [design concepts](docs/DESIGN_EXAMPLES.md), [landing design](docs/LANDING_DESIGN.md), and [asset provenance](docs/ASSET_PROVENANCE.md).

Designed by [Piratechs](https://piratechs.com).
