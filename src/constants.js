// if e contains anything in allowedList, then ignore.
const allowedList = [];

// if e contains anything in blockedList, then hide.
// a[data-hovercard][href*="hc_ref=ADS"] from https://github.com/uBlockOrigin/uAssets/issues/233
// a[role="button"][target="_blank"] is used for good post now too.
const staticBlockedList = [
  "._m8c",
  ".uiStreamSponsoredLink",
  'a[data-hovercard][href*="hc_ref=ADS"]',
  'a[role="button"][rel~="noopener"][data-lynx-mode="async"]',
];

const sponsoredTexts = [
  "Sponsored",
  "مُموَّل", // Arabic
  "赞助内容", // Chinese (Simplified)
  "贊助", // Chinese (Traditional)
  "Sponzorováno", // Czech
  "Gesponsord", // Dutch
  "May Sponsor", // Filipino
  "Commandité", // French (Canada)
  "Sponsorisé", // French
  "Gesponsert", // German
  "Χορηγούμενη", // Greek
  "ממומן", // Hebrew
  "प्रायोजित", // Hindi
  "Hirdetés", // Hungarian
  "Bersponsor", // Indonesian
  "Sponsorizzato", // Italian
  "広告", // Japanese
  "Sponsorowane", // Polish
  "Patrocinado", // Portuguese (Brazil)
  "Sponsorizat", // Romanian
  "Реклама", // Russian
  "Sponzorované", // Slovak
  "Publicidad", // Spanish
  "Sponsrad", // Swedish
  "ได้รับการสนับสนุน", // Thai
  "Sponsorlu", // Turkish
  "Được tài trợ", // Vietnamese
];

function getBlockedList() {
  // Aria labels may be localised so use the same translations as sponsoredTexts
  const ariaLabels = sponsoredTexts.map((t) => `a[aria-label="${t}"]`);

  return [...staticBlockedList, ...ariaLabels];
}

export { allowedList, sponsoredTexts };

export const blockedList = getBlockedList();
