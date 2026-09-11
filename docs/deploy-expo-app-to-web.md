# Deploy MatchXD To The Web

[MatchXD](../README.md) · [Deployment Guide](DEPLOYMENT.md) · [Getting Started](GETTING_STARTED.md)

Updated September 11, 2026. MatchXD is live at **[matchxd.vercel.app](https://matchxd.vercel.app)** on Vercel Hobby. Its GitHub integration deploys pushes to `main`. Expo exports the web target as a static website while Android and iOS remain in the same project. The hosted preview uses local demo accounts, data, and simulated purchases; publishing it does not connect a production dating backend.

## Current Setup

| Item | Status |
| --- | --- |
| GitHub repository | [strawhat19/MatchXD](https://github.com/strawhat19/MatchXD) |
| Local Git remote | `origin` points to `https://github.com/strawhat19/MatchXD.git` |
| Local / Vercel production branch | `main` |
| Expo project | [@strawhat19/matchxd](https://expo.dev/accounts/strawhat19/projects/matchxd) |
| Expo project ID | `b06e5192-7c43-448a-83c3-2a819dce899e` |
| Expo configuration | `owner` and `extra.eas.projectId` recorded in [app.config.ts](../app.config.ts) |
| Expo GitHub connection | `strawhat19/MatchXD` connected; base directory `/` |
| Web deployment configuration | [vercel.json](../vercel.json) added; local export passed |
| Vercel Hobby eligibility | Owner confirmed personal, noncommercial use on September 11, 2026 |
| Vercel project | [matchxd in strawhat19s-projects](https://vercel.com/strawhat19s-projects/matchxd) |
| Vercel project ID | `prj_TbeZKc8N8i37cLRn0lEta0XbWyQZ` |
| Vercel GitHub integration | Connected to `strawhat19/MatchXD` |
| Production web URL | [matchxd.vercel.app](https://matchxd.vercel.app) |
| GitHub About website | Saved as `https://matchxd.vercel.app` |
| Custom domain / native store releases | Deferred |

## Free Hosting Eligibility

The owner confirmed personal, noncommercial use on **September 11, 2026**, and this deployment uses Vercel Hobby. The plan is free, subject to usage limits, and restricted to personal, noncommercial use. No money was spent, and no paid plan, trial, add-on, or domain was purchased. See [Vercel Hobby](https://vercel.com/docs/plans/hobby).

If the app's use later becomes commercial, review hosting eligibility before that change; do not automatically upgrade to a paid plan. Provider limits and terms should be checked again when changing the app's use.

## Steps Completed

1. Confirmed that the existing working tree uses `main` and its `origin` remote points to the requested GitHub repository. Existing app changes were preserved.
2. Ran `eas init --non-interactive --force` while signed in as `strawhat19`. EAS created the project but could not edit the dynamic configuration automatically. Added `owner: strawhat19` and `extra.eas.projectId: b06e5192-7c43-448a-83c3-2a819dce899e` to [app.config.ts](../app.config.ts), then verified the association with `eas project:info`. Its web output remains `single`; native package identifiers remain `com.matchxd.app`. In Expo User Settings → Connections, connected the signed-in GitHub account. In the MatchXD project's GitHub settings, searched for `MatchXD` and connected `strawhat19/MatchXD`. Expo confirmed the connection with base directory `/`; EAS Workflows remain unconfigured.
3. Reviewed [Expo's web publishing instructions](https://docs.expo.dev/guides/publishing-websites/). The existing `export:web` script runs `expo export --platform web` and emits `dist`.
4. Added the following [Vercel configuration](../vercel.json):

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": null,
  "installCommand": "npm ci",
  "buildCommand": "npm run export:web",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

5. Added `.vercel/` to [.gitignore](../.gitignore). Exported `dist` files were already ignored. Source and configuration belong in Git; local project settings and generated output do not.
6. Ran the TypeScript check and a production web export using the installed dependencies and bundled Node 24 runtime. Both completed successfully. The local development server was not restarted.
7. After the owner confirmed noncommercial use, ran `vercel link --yes --project matchxd --scope strawhat19s-projects`. Vercel linked the local directory and automatically connected `https://github.com/strawhat19/MatchXD`. `vercel project inspect` confirmed the project, Node `24.x`, repository root `./`, framework **Other**, install command `npm ci`, build command `npm run export:web`, and output directory `dist`.
8. Committed the prepared configuration and documentation, then pushed `main`. GitHub automatically triggered a Vercel production build. Vercel installed dependencies, exported the web app, and reached **Ready**. The deployment identified GitHub as its source, `main` as its branch, and the pushed commit as its source revision.
9. Confirmed the stable production alias **matchxd.vercel.app**. Verified the landing page in Chrome, navigation through **Sign In**, a fresh direct load of `/sign-in`, and **Continue** reaching onboarding. No profile was submitted. Separate unauthenticated HTTP checks confirmed the routes and static assets load correctly.
10. Opened the gear next to **About** on [strawhat19/MatchXD](https://github.com/strawhat19/MatchXD), saved `https://matchxd.vercel.app` in **Website**, and confirmed the repository shows the link. The custom domain was left unconfigured.

The rewrite lets direct links such as `/sign-in` load the SPA entry. Vercel serves matching filesystem assets before applying rewrites, so JavaScript, CSS, images, and fonts retain their own responses. See [Vercel's rewrite configuration](https://vercel.com/docs/project-configuration/vercel-json#rewrites).

## Build Settings And Local Reproduction

Use Node **24.3 or newer within Node 24** to match the tested major version and [package.json](../package.json). The Vercel project uses Node `24.x`. From a fresh checkout, run:

```powershell
npm ci
npm run typecheck
npm run export:web
```

`npm ci` ran in the successful Vercel build. It was not rerun against the existing local development installation. The package and lockfile dependency declarations were checked and match.

The completed local export contained **75 files, 50,015,744 bytes (47.70 MiB)**. Its top level contains `index.html`, `favicon.ico`, `metadata.json`, `assets`, and `_expo`. The JavaScript entry is approximately **2.60 MB uncompressed**; profile images account for most of the total output. All script, stylesheet, and favicon references in the exported HTML resolve to generated files.

No Android or iOS build was run. Web verification is recorded below; it does not establish native device behavior or connected backend functionality.

## First Verified Git Deployment

This is a historical deployment record, not a claim that the first commit remains the latest version:

| Item | Verified Result |
| --- | --- |
| Date | September 11, 2026 |
| Source / branch | GitHub / `main` |
| Commit | [2e91e03df13c40c4f1d3d654419554736be5d251](https://github.com/strawhat19/MatchXD/commit/2e91e03df13c40c4f1d3d654419554736be5d251) |
| Deployment ID | `dpl_G1r54TqnQ549ZUNUVCB8HgHzTj3g` |
| Target / status | Production / **Ready** |
| GitHub commit status | Vercel **success** |
| Stable alias | [matchxd.vercel.app](https://matchxd.vercel.app) |
| Chrome checks | Landing loaded; Sign In navigation and fresh direct `/sign-in` load worked; Continue reached onboarding |
| Independent HTTP checks | 12 unauthenticated GET requests passed: `/`, `/sign-in`, seven CSS files, one JavaScript bundle, favicon, and one profile PNG |

All checked responses returned HTTP 200; static assets returned their expected content types rather than the SPA HTML fallback. GitHub's repository API confirmed the saved website and `main` default branch, and `eas project:info` reconfirmed the Expo association. The browser was returned to the signed-out landing page after the onboarding check. The observed Git-triggered deployment proves that the repository connection builds and publishes `main`. Use the [project dashboard](https://vercel.com/strawhat19s-projects/matchxd) for subsequent deployment status.

## Automatic Updates And Rollback

Vercel's [GitHub integration](https://vercel.com/docs/git/vercel-for-github) deploys pushes and merges to the configured production branch, `main`. An unpushed local commit cannot trigger it. Other branches can receive preview deployments. No separate GitHub Actions deployment workflow is needed.

Review changes, commit the intended files, and push `main`:

```powershell
git status
git diff
git push origin main
```

The push command assumes the intended changes have already been committed. In Vercel, confirm that the deployment's commit matches the push and its status is **Ready**, then check [the website](https://matchxd.vercel.app). Its stable URL stays the same across production deployments.

To undo a deployed change, create a revert commit for that change and push it to `main`, or merge a revert pull request into `main`. Vercel deploys the resulting source through the same process. Verify the revert deployment is **Ready** and the expected behavior is restored. This keeps the repository and deployed version aligned.

## Android And iOS Later

Vercel hosts the exported web target. The Expo project association identifies the same app for later Expo services; it does not require moving the web host to Expo. The current iOS bundle identifier and Android package stay `com.matchxd.app`, and platform-specific source files remain intact.

Native distribution is a separate phase: configure EAS build profiles, signing, store accounts, and submissions when ready. No EAS native builds, paid memberships, or store submissions were initiated here. Use the existing [native deployment guidance](DEPLOYMENT.md#standalone-mobile-builds) and [Expo build setup](https://docs.expo.dev/build/setup/) when that work begins. Web pushes do not automatically publish App Store or Play Store releases.
