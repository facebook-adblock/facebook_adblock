// if e contains anything in whitelist, then ignore.
const whitelist = [];

// if e contains anything in blacklist, then hide.
// a[data-hovercard][href*="hc_ref=ADS"] from https://github.com/uBlockOrigin/uAssets/issues/233
// a[role="button"][target="_blank"] is used for good post now too.
const blacklist = [
  '._m8c',
  '.uiStreamSponsoredLink',
  'a[data-hovercard][href*="hc_ref=ADS"]',
  'a[role="button"][rel~="noopener"][data-lynx-mode="async"]',
];

const sponsoredTexts = [
  'Sponsored',
  'مُموَّل', // Arabic
  '赞助内容', // Chinese Simplified
  '贊助', // Chinese (Traditional)
  'Sponzorováno', // Czech
  'Gesponsord', // Dutch
  'May Sponsor', // Filipino
  'Sponsorisé', // French
  'Gesponsert', // German
  'प्रायोजित', // Hindi
  'Bersponsor', // Indonesian
  'Sponsorizzato', // Italian
  'Patrocinado', // Portuguese (Brazil)
  'Publicidad', // Spanish
  'ได้รับการสนับสนุน', // Thai
  'Sponsorlu', // Turkish
  'Được tài trợ', // Vietnamese
];

const possibleSponsoredTextQueries = [
  'div[id^="feedsubtitle"] > :first-child',
  'div[id^="feed_sub_title"] > :first-child',
  'div[id^="feed__sub__title"] > :first-child',
  'div[data-testid$="feedsubtitle"] > :first-child',
  'div[data-testid$="storysub-title"] > :first-child',
  'div[data-testid$="story-subtitle"] > :first-child',
  'div[data-testid$="story-subtilte"] > :first-child',
  'div[data-testid$="story--subtilte"] > :first-child',
];

function isHidden(e) {
  const style = window.getComputedStyle(e);
  if (
    style.display === 'none'
    || style.opacity === '0'
    || style.fontSize === '0px'
    || style.visibility === 'hidden'
  ) {
    return true;
  }
  return false;
}

function getTextFromElement(e) {
  return e.innerText === '' ? e.dataset.content : e.innerText;
}

function getVisibleText(e) {
  if (isHidden(e)) {
    // stop if this is hidden
    return [];
  }
  const children = e.querySelectorAll(':scope > *');
  if (children.length !== 0) {
    // more level => recursive
    return Array.prototype.slice
      .call(children)
      .map(getVisibleText)
      .flat();
  }
  // we have found the real text
  return getTextFromElement(e);
}

function hideIfSponsored(e) {
  if (
    whitelist.some((query) => {
      if (e.querySelector(query) !== null) {
        console.info(`Ignored (${query})`, [e]);
        return true;
      }
      return false;
    })
  ) {
    return false; // ignored this element
  }

  if (
    blacklist.some((query) => {
      if (e.querySelector(query) !== null) {
        e.style.display = 'none';
        console.info(`AD Blocked (${query})`, [e]);
        return true;
      }
      return false;
    })
  ) {
    return true; // has ad
  }

  return possibleSponsoredTextQueries.some((query) => {
    const result = e.querySelectorAll(query);
    return [...result].some((t) => {
      const visibleText = getVisibleText(t).join('');
      if (sponsoredTexts.some((sponsoredText) => visibleText.indexOf(sponsoredText) !== -1)) {
        e.style.display = 'none';
        console.info(`AD Blocked (${query}, getVisibleText())`, [e]);
        return true;
      }
      return false;
    });
  });
}

let feedObserver = null;
function onPageChange() {
  let feed = document.getElementById('stream_pagelet');
  if (feed !== null) {
    // if the user change page to homepage
    feed.querySelectorAll('div[id^="hyperfeed_story_id_"]').forEach(hideIfSponsored);
    feedObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.target.id.startsWith('hyperfeed_story_id_')) {
          hideIfSponsored(mutation.target);
        }
      });
    });
    feedObserver.observe(feed, {
      childList: true,
      subtree: true,
    });
    console.info('Monitoring', [feed]);
    return;
  }

  feed = document.getElementById('pagelet_group_');
  if (feed !== null) {
    // if the user change page to https://www.facebook.com/groups/*
    feed.querySelectorAll('div[id^="mall_post_"]').forEach(hideIfSponsored);
    feedObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.target.querySelectorAll('div[id^="mall_post_"]').forEach(hideIfSponsored);
      });
    });
    feedObserver.observe(feed, {
      childList: true,
      subtree: true,
    });
    console.info('Monitoring', [feed]);
  }
}

let fbContent = document.getElementsByClassName('fb_content')[0];
const fbObserver = new MutationObserver(onPageChange);

// if we can't find ".fb_content", then it must be a mobile website.
// in that case, we don't need javascript to block ads
if (fbContent !== undefined) {
  // remove on first load
  onPageChange();

  // Facebook uses ajax to load new content so
  // we need this to watch for page change
  fbObserver.observe(fbContent, {
    childList: true,
  });
}

// cleanup
window.addEventListener('beforeunload', () => {
  fbObserver.disconnect();
  if (feedObserver !== null) {
    feedObserver.disconnect();
  }
  fbContent = null;
});
