// Replace only through a separately authorized, server-verified integration.
export const connectionStatus = {
  auth: `Not connected`,
  firestore: `Not connected`,
  reports: `Unavailable`,
  source: `Device-only demo`,
} as const;

export const publicPages = {
  about: { title: `About MatchXD`, description: `An adult-only dating app prototype, with fictional profiles and local preview tools.`, paragraphs: [
    `MatchXD explores mutual connections, personal expression and privacy in a coral-and-charcoal interface. This release is a product preview, not a connected dating service.`,
    `Sample profiles represent fictional adults. Likes, matches, conversations, reports and wallet actions are simulated on this device. Nobody receives your preview messages.`,
  ] },
  privacy: { title: `Privacy & Local Data`, description: `Understand what the MatchXD preview saves on your device.`, paragraphs: [
    `Profile edits, preferences, simulated activity and existing signup-interest drafts are saved in browser localStorage on web and device storage on native. They are not Firebase accounts or a cloud backup. Use fictional information only; do not enter private contact details, precise locations, passwords or sensitive personal data into this demo.`,
    `Anyone with access to this browser or device may be able to read its local data. Clearing site data can remove it. Settings offers local reset and deletion; these are not cloud-account deletion requests.`,
    `The existing web app includes Vercel Analytics. This frontend update does not enable a new collector or connect reporting. Hosting and third-party links may have their own policies. Before a public launch, the operator must review actual collection, retention, consent and data disclosures.`,
  ] },
  terms: { title: `Preview Terms`, description: `Scope and limitations of the MatchXD local preview.`, paragraphs: [
    `This preview is intended only for adults aged 18 or older. Do not include information about minors. It is not a service for contacting real people, and simulated matching does not establish consent or identity.`,
    `Wallet balances, purchases, subscriptions and rewards are demonstrations, not money or paid entitlements. No live checkout is connected by this readiness work.`,
    `Respect others and use only content you have permission to use. Local reporting does not notify a moderation team. Final service terms and operational safety procedures require operator review before live accounts launch.`,
  ] },
  contact: { title: `Contact & Support`, description: `Preview support information and local-data troubleshooting.`, paragraphs: [
    `Support delivery is not connected in this preview. No form on this page sends a message or creates a support ticket. Do not submit urgent or sensitive information here.`,
    `For local storage errors, preserve your browser data and avoid resetting until you have reviewed what you need to keep. Use Settings to manage local preview data deliberately.`,
    `A verified support channel, operational moderation and account-deletion support must be configured before a connected launch.`,
  ] },
  safety: { title: `Safety & Community Guidelines`, description: `Adult-only demo boundaries and future moderation requirements.`, paragraphs: [
    `All sample profiles are fictional adults. Do not impersonate real people, upload another person's private information, or use the demo to contact anyone.`,
    `Blocking and reporting currently change local demo state only. Reports are not delivered to staff. Do not rely on these tools for an emergency or protection from a real person.`,
    `A live service needs verified enforcement of adult eligibility, private messaging permissions, abuse handling, block/report controls and content review before public use.`,
  ] },
} as const;
export type PublicPageKey = keyof typeof publicPages;
