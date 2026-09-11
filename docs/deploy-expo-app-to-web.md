# Deploy MatchXD To The Web

[MatchXD](../README.md) · [Deployment Guide](DEPLOYMENT.md) · [Getting Started](GETTING_STARTED.md)

Updated September 11, 2026. MatchXD can export its Expo web target as a static website while keeping Android and iOS in the same project. Vercel is the preferred web host for this setup. Publishing the current app preserves its local demo accounts, data, and simulated purchases; it does not connect a production dating backend.

## Current Setup

| Item | Status |
| --- | --- |
| GitHub repository | [strawhat19/MatchXD](https://github.com/strawhat19/MatchXD) |
| Local Git remote | `origin` points to `https://github.com/strawhat19/MatchXD.git` |
| Local branch | `main` |
| Expo project | [@strawhat19/matchxd](https://expo.dev/accounts/strawhat19/projects/matchxd) |
| Expo project ID | `b06e5192-7c43-448a-83c3-2a819dce899e` |
| Expo configuration | `owner` and `extra.eas.projectId` recorded in [app.config.ts](../app.config.ts) |
| Expo GitHub connection | `strawhat19/MatchXD` connected; base directory `/` |
| Web deployment configuration | [vercel.json](../vercel.json) added; local export passed |
| Vercel GitHub integration | Pending |
| Production web URL | Pending; no successful deployment recorded yet |
| GitHub About website | Pending a verified production URL |
| Custom domain / native store releases | Deferred |

## Free Hosting Eligibility

Vercel Hobby is free, subject to usage limits, and restricted to personal, noncommercial use. Hosting is pending confirmation of whether this MatchXD deployment qualifies as a personal prototype or is part of a commercial project. A prototype with simulated payments does not by itself establish eligibility. No paid plan, trial, add-on, or domain purchase is part of this setup. See [Vercel Hobby](https://vercel.com/docs/plans/hobby).

If this deployment is commercial, choose a suitable host with an eligible free plan before publishing; do not automatically upgrade Vercel. Provider limits and terms should be checked again when publishing or changing the app's use.

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

The rewrite lets direct links such as `/sign-in` load the SPA entry. Vercel serves matching filesystem assets before applying rewrites, so JavaScript, CSS, images, and fonts retain their own responses. See [Vercel's rewrite configuration](https://vercel.com/docs/project-configuration/vercel-json#rewrites).

## Build Settings And Local Reproduction

Use Node **24.3 or newer within Node 24** to match the tested major version and [package.json](../package.json). Select Node `24.x` in the eventual Vercel project. From a fresh checkout, run:

```powershell
npm ci
npm run typecheck
npm run export:web
```

`npm ci` is the configured clean installation step for hosting; it was not rerun against the existing local development installation. The package and lockfile dependency declarations were checked and match.

The completed local export contained **75 files, 50,015,744 bytes (47.70 MiB)**. Its top level contains `index.html`, `favicon.ico`, `metadata.json`, `assets`, and `_expo`. The JavaScript entry is approximately **2.60 MB uncompressed**; profile images account for most of the total output. All script, stylesheet, and favicon references in the exported HTML resolve to generated files.

These checks establish that the web target exports locally. Remote build success, live routes, browser behavior, and automatic deployment from Git remain to be verified after hosting is connected. No Android or iOS build was run.

## Finish The Vercel Connection

These steps are pending, not a record of completed deployment:

1. Confirm free-plan eligibility, then import `strawhat19/MatchXD` into the intended Vercel account. Grant its GitHub integration access to this repository if needed.
2. Request project name `matchxd`. Use the repository root, framework preset **Other**, Node **24.x**, and the install/build/output settings in `vercel.json`.
3. Confirm the production branch is **main**. Commit and push the prepared application and deployment configuration to GitHub, then let Vercel build the imported repository.
4. Wait for the deployment to become **Ready**. Verify the homepage, direct navigation and refresh on `/sign-in`, and real JavaScript/CSS/image responses. Confirm that the deployment corresponds to the intended Git commit.
5. Prefer the shortest available project production alias, ideally `matchxd.vercel.app`. That name has not been reserved or confirmed. Record the actual stable production URL above; do not use a commit-specific preview address as the primary link.
6. Open the [GitHub repository](https://github.com/strawhat19/MatchXD), use the gear next to **About**, and save the verified production URL in **Website**. Leave the custom domain unconfigured.

Vercel's [GitHub integration](https://vercel.com/docs/git/vercel-for-github) creates deployments from GitHub pushes. Once `main` is configured as production, pushing or merging changes into that branch triggers the website update. An unpushed local commit cannot trigger it. Other branches can receive preview deployments. A separate GitHub Actions deployment workflow is unnecessary for this integration.

After the connection is verified, the ordinary update flow is to review changes, commit the intended files, and push `main`:

```powershell
git status
git diff
git push origin main
```

The push command assumes the intended changes have already been committed. Check the corresponding Vercel deployment before assuming the website changed.

## Android And iOS Later

Vercel hosts the exported web target. The Expo project association identifies the same app for later Expo services; it does not require moving the web host to Expo. The current iOS bundle identifier and Android package stay `com.matchxd.app`, and platform-specific source files remain intact.

Native distribution is a separate phase: configure EAS build profiles, signing, store accounts, and submissions when ready. No EAS native builds, paid memberships, or store submissions were initiated here. Use the existing [native deployment guidance](DEPLOYMENT.md#standalone-mobile-builds) and [Expo build setup](https://docs.expo.dev/build/setup/) when that work begins. Web pushes do not automatically publish App Store or Play Store releases.
