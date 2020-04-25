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
];

const sponsoredTexts = [
  "Sponsored",
  "مُموَّل", // Arabic
  "赞助内容", // Chinese (Simplified)
  "贊助", // Chinese (Traditional)
  "Sponzorováno", // Czech
  "Gesponsord", // Dutch
  "May Sponsor", // Filipino
  "Sponsorisé", // French
  "Gesponsert", // German
  "Χορηγούμενη", // Greek
  "ממומן", // Hebrew
  "प्रायोजित", // Hindi
  "Bersponsor", // Indonesian
  "Sponsorizzato", // Italian
  "Sponsorowane", // Polish
  "Patrocinado", // Portuguese (Brazil)
  "Реклама", // Russian
  "Sponzorované", // Slovak
  "Publicidad", // Spanish
  "ได้รับการสนับสนุน", // Thai
  "Sponsorlu", // Turkish
  "Được tài trợ", // Vietnamese
];

const possibleSponsoredTextQueries = [
  'div[id^="feedsubtitle"] > :first-child',
  'div[id^="feed_sub_title"] > :first-child',
  'div[id^="feed__sub__title"] > :first-child',
  'div[id^="feedlabel"] > :first-child',
  'div[id^="fbfeed_sub_header_id"] > :nth-child(3)',
  'div[data-testid$="storysub-title"] > :first-child',
  'div[data-testid$="story-subtilte"] > :first-child',
  'div[data-testid$="story--subtilte"] > :first-child',
  'a[role="button"][aria-labelledby]',
  'a[role="link"] > span[aria-labelledby]', // FB5 design
  'div[role="button"] > span[aria-labelledby]', // FB5 design
  'div[data-testid*="subtitle"] > :first-child',
  'div[data-testid*="label"] > :first-child',
];

export { whitelist, blacklist, sponsoredTexts, possibleSponsoredTextQueries };
