// if e contains anything in whitelist, then ignore.
const whitelist = [];

// if e contains anything in blacklist, then hide.
// a[data-hovercard][href*="hc_ref=ADS"] from https://github.com/uBlockOrigin/uAssets/issues/233
// a[role="button"][target="_blank"] is used for good post now too.
const blacklist = [
  "._m8c",
  ".uiStreamSponsoredLink",
  'a[data-hovercard][href*="hc_ref=ADS"]',
  'a[role="button"][rel~="noopener"][data-lynx-mode="async"]',

  // Aria labels may be localised so use the same translations as sponsoredTexts
  'a[aria-label="Sponsored"]',
  'a[aria-label="مُموَّل"]', // Arabic
  'a[aria-label="赞助内容"]', // Chinese (Simplified)
  'a[aria-label="贊助"]', // Chinese (Traditional)
  'a[aria-label="Sponzorováno"]', // Czech
  'a[aria-label="Gesponsord"]', // Dutch
  'a[aria-label="May Sponsor"]', // Filipino
  'a[aria-label="Commandité"]', // French (Canada)
  'a[aria-label="Sponsorisé"]', // French
  'a[aria-label="Gesponsert"]', // German
  'a[aria-label="Χορηγούμενη"]', // Greek
  'a[aria-label="ממומן"]', // Hebrew
  'a[aria-label="प्रायोजित"]', // Hindi
  'a[aria-label="Hirdetés"]', // Hungarian
  'a[aria-label="Bersponsor"]', // Indonesian
  'a[aria-label="Sponsorizzato"]', // Italian
  'a[aria-label="Sponsorowane"]', // Polish
  'a[aria-label="Patrocinado"]', // Portuguese (Brazil)
  'a[aria-label="Sponsorizat"]', // Romanian
  'a[aria-label="Реклама"]', // Russian
  'a[aria-label="Sponzorované"]', // Slovak
  'a[aria-label="Publicidad"]', // Spanish
  'a[aria-label="ได้รับการสนับสนุน"]', // Thai
  'a[aria-label="Sponsorlu"]', // Turkish
  'a[aria-label="Được tài trợ"]', // Vietnamese
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
  "Sponsorowane", // Polish
  "Patrocinado", // Portuguese (Brazil)
  "Sponsorizat", // Romanian
  "Реклама", // Russian
  "Sponzorované", // Slovak
  "Publicidad", // Spanish
  "ได้รับการสนับสนุน", // Thai
  "Sponsorlu", // Turkish
  "Được tài trợ", // Vietnamese
];

export { whitelist, blacklist, sponsoredTexts };
