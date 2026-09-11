# Getting Started

[MatchXD](../README.md) · [Demo Guide](DEMO_GUIDE.md) · [Development](DEVELOPMENT.md) · [Deployment](DEPLOYMENT.md)

Run MatchXD locally on web, iOS, or Android with Expo. No environment variables, credentials, Supabase project, payment account, or paid service account are required for the local demo.

## Prerequisites

Install [Node.js](https://nodejs.org/en/download), Git, and Expo Go on your phone if you want to use a physical device. Use a supported Node 24 release matching the project's engine requirement: `^20.19.4 || ^22.13.0 || >=24.3.0`. Node **22.9 is too old**. Reopen your terminal after upgrading, then check `node --version`.

The app uses **Expo SDK 57**. Expo Go must support that SDK; it is a development host, not a standalone MatchXD installation. A simulator is optional when using a physical phone with Expo Go.

## Start On Windows

Open PowerShell in the repository. XAMPP, PHP, and Apache are not required; the project can stay in its current folder.

```powershell
npm install
npm start
```

Keep the terminal running. Press `w` for web, or start web directly with `npm run web`. Open the address printed by Expo rather than an Apache URL. Stop the server with `Ctrl+C`.

On the Codex Windows computer used for this project, the [local launcher](../scripts/start-local.ps1) can use the bundled supported Node runtime when the system Node is missing or too old. Install dependencies with supported Node first, then choose one command:

```powershell
.\scripts\start-local.ps1
.\scripts\start-local.ps1 -Web
```

The launcher is a convenience for this machine; installing supported Node is the portable setup. If PowerShell blocks a local script, follow your machine's script policy or use the normal npm commands with supported Node.

## Open On Your Phone

- Use an Expo Go version compatible with **SDK 57**. Update Expo Go if it reports an SDK mismatch.
- Connect the computer and phone to the same reachable Wi-Fi network. In Expo Go on Android, scan the terminal QR code; on iPhone, scan it with the Camera app and open Expo Go.
- On Windows, allow Node through the firewall on your trusted private network. A guest network, VPN, or Wi-Fi client isolation can stop the phone reaching the computer. Do not use `localhost` on your phone to reach your PC.
- If LAN access remains unavailable, use the optional tunnel below after installing its helper. Both devices need internet; tunnels are slower and create a temporary externally reachable development URL. See [Expo CLI networking](https://docs.expo.dev/more/expo-cli/).

```powershell
npm install -g @expo/ngrok
npx expo start --tunnel
```

If a compatible Expo Go client is unavailable or an integration needs custom native code, use a development build as described in [Deployment](DEPLOYMENT.md) and Expo's [development builds guide](https://docs.expo.dev/develop/development-builds/introduction/). Remote push requires additional native/backend setup; the current notification switches only save preferences.

## Continue On A Mac

Clone the same Git repository onto your Mac, install supported Node, then run these commands in the cloned folder:

```sh
npm ci
npm start
```

Use the existing lockfile and do not copy Windows `node_modules`. Your phone can use the new QR code; local browser/device state does not automatically move with the repository.

Install Xcode only when you need the iOS simulator or local native compilation. With a simulator installed, press `i` in Expo or use `npm run ios`. Android emulators need Android Studio; press `a` or use `npm run android`. A physical phone with Expo Go does not require those simulators. See [Expo development setup](https://docs.expo.dev/get-started/set-up-your-environment/).

## Next Steps

Follow the [Demo Guide](DEMO_GUIDE.md) to explore the local member and owner flows. [Development](DEVELOPMENT.md) covers configuration and checks; [Verification](VERIFICATION.md) records executed checks and known limitations. Before release, verify gestures, media pickers, keyboard behavior, and accessibility on actual target iPhone and Android devices; local domain tests do not prove those behaviors.
