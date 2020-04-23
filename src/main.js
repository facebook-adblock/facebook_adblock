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

/**
 * Facebook uses various techniques to hide an element
 * @param {Element} e
 * @returns {boolean} true if this element is hidden; Thus a text inside this element is not visible to the users.
 */
function isHidden(e) {
  const style = window.getComputedStyle(e);
  if (
    style.display === "none" ||
    style.opacity === "0" ||
    style.fontSize === "0px" ||
    style.visibility === "hidden" ||
    style.position === "absolute"
  ) {
    return true;
  }
  return false;
}

/**
 * Facebook uses various techniques to hide a text inside an element
 * @param {Element} e
 * @returns {string} a text hidden inside this DOM element; Returns an empty string if there is no hidden text.
 */
function getTextFromElement(e) {
  return (e.innerText === "" ? e.dataset.content : e.innerText) || "";
}

/**
 * For FB5, Facebook also hides a text directly inside a container element.
 * @param {Element} e
 * @returns {string} a text hidden inside this DOM element
 */
function getTextFromContainerElement(e) {
  // we only need the data-content of a container element, or any direct text inside it
  return (
    e.dataset.content ||
    Array.prototype.filter
      .call(e.childNodes, (element) => {
        return element.nodeType === Node.TEXT_NODE;
      })
      .map((element) => {
        return element.textContent;
      })
      .join("")
  );
}

/**
 * Return a text inside this given DOM element that is visible to the users
 * @param {Element} e
 * @returns {string}
 */
function getVisibleText(e) {
  if (isHidden(e)) {
    // stop if this is hidden
    return "";
  }
  const children = e.querySelectorAll(":scope > *");
  if (children.length !== 0) {
    // more level => recursive
    return (
      getTextFromContainerElement(e) +
      Array.prototype.slice.call(children).map(getVisibleText).flat().join("")
    );
  }
  // we have found the real text
  return getTextFromElement(e);
}

/**
 * Hide an element if this is a sponsored element
 * @param {Element} e
 * @returns {boolean} true if this is a sponsored element
 */
function hideIfSponsored(e) {
  // ignore if matches the whitelist
  if (
    whitelist.some((query) => {
      if (e.querySelector(query) !== null) {
        e.dataset.blocked = "whitelist";
        console.info(`Ignored (${query})`, [e]);
        return true;
      }
      return false;
    })
  ) {
    return false; // ignored this element
  }

  // hide right away if macthces the blacklist
  if (
    blacklist.some((query) => {
      if (e.querySelector(query) !== null) {
        e.style.display = "none";
        e.dataset.blocked = "blacklist";
        console.info(`AD Blocked (${query})`, [e]);
        return true;
      }
      return false;
    })
  ) {
    return true; // has ad
  }

  // Look through a list of possible locations of "Sponsored" tag, and see if it matches our list of `sponsoredTexts`
  return possibleSponsoredTextQueries.some((query) => {
    const result = e.querySelectorAll(query);
    return [...result].some((t) => {
      const visibleText = getVisibleText(t);
      if (
        sponsoredTexts.some(
          (sponsoredText) => visibleText.indexOf(sponsoredText) !== -1
        )
      ) {
        e.style.display = "none";
        e.dataset.blocked = "sponsored";
        console.info(
          `AD Blocked (query='${query}', visibleText='${visibleText}')`,
          [e]
        );
        return true;
      }
      return false;
    });
  });
}

let feedObserver = null;
// wait for and observe FB5 feed element
function setFB5FeedObserver() {
  // We are expecting to find a new feed div
  const feed = document.querySelector(
    "div[role=feed]:not([data-adblock-monitored])"
  );
  if (feed !== null) {
    // check existing posts
    feed
      .querySelectorAll('div[data-pagelet^="FeedUnit_"]')
      .forEach(hideIfSponsored);

    const feedContainer = feed.parentNode;
    // flag this feed as monitored
    feed.dataset.adblockMonitored = true;
    feedObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // check if feed was reloaded without changing page
        if (
          mutation.target === feedContainer &&
          mutation.addedNodes.length > 0
        ) {
          feedObserver.disconnect();
          // check again for the new feed. Since the DOM has just changed, we
          // want to wait a bit and start looking for the new div after it was
          // rendered. We put our method at the end of the current queue stack
          setTimeout(setFB5FeedObserver, 0);
        }
        // new feed posts added
        if (mutation.target === feed && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (
              node.dataset.pagelet &&
              node.dataset.pagelet.startsWith("FeedUnit_")
            ) {
              hideIfSponsored(node);
            }
          });
        }
      });
    });
    // check for new feed posts
    feedObserver.observe(feed, {
      childList: true,
    });
    // check if the feed is replaced
    feedObserver.observe(feedContainer, {
      childList: true,
    });
    console.info("Monitoring feed updates", [feed]);
  } else {
    // no feed div was available yet in DOM. will check again
    setTimeout(setFB5FeedObserver, 1000);
  }
}

function onPageChange() {
  let feed = document.getElementById("stream_pagelet");
  if (feed !== null) {
    // if the user change page to homepage
    feed
      .querySelectorAll('div[id^="hyperfeed_story_id_"]')
      .forEach(hideIfSponsored);
    feedObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.target.id.startsWith("hyperfeed_story_id_")) {
          hideIfSponsored(mutation.target);
        }
      });
    });
    feedObserver.observe(feed, {
      childList: true,
      subtree: true,
    });
    console.info("Monitoring feed updates", [feed]);
    return;
  }

  feed = document.getElementById("pagelet_group_");
  if (feed !== null) {
    // if the user change page to https://www.facebook.com/groups/*
    feed.querySelectorAll('div[id^="mall_post_"]').forEach(hideIfSponsored);
    feedObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.target
          .querySelectorAll('div[id^="mall_post_"]')
          .forEach(hideIfSponsored);
      });
    });
    feedObserver.observe(feed, {
      childList: true,
      subtree: true,
    });
    console.info("Monitoring feed updates", [feed]);
    return;
  }

  // FB5 design
  // there's a feed div that we don't monitor yet
  feed = document.querySelector("div[role=feed]:not([data-adblock-monitored])");
  if (feed !== null) {
    setFB5FeedObserver();
    return;
  }
  // there's a feed loading placeholder
  feed = document.getElementById("suspended-feed");
  if (feed !== null) {
    setFB5FeedObserver();
    return;
  }
  // No new feed was detected
  // Cleanup observer when there's no feed monitored left in DOM
  if (
    feedObserver !== null &&
    document.querySelector("div[role=feed][data-adblock-monitored]") === null
  ) {
    feedObserver.disconnect();
  }
}

const fbObserver = new MutationObserver(onPageChange);
// wait for and observe FB5 page element
function setupFB5PageObserver() {
  // We are expecting to find a page div
  const pageDiv = document.querySelector(
    "div[data-pagelet=root] div[data-pagelet=page]"
  );
  // make sure there's a page element
  if (pageDiv !== null) {
    // trigger first page initiation
    onPageChange();

    // Facebook uses ajax to load new content so
    // we need to observe the container of the page
    // for any page changes
    fbObserver.observe(pageDiv.parentNode, {
      childList: true,
    });
    console.info("Monitoring page changes", [pageDiv]);
  } else {
    // no page div was available yet in DOM. will check again
    setTimeout(setupFB5PageObserver, 1000);
  }
}

let fbContent = document.getElementsByClassName("fb_content")[0];
if (fbContent !== undefined) {
  // Old Facebook design
  // remove on first load
  onPageChange();

  // Facebook uses ajax to load new content so
  // we need this to watch for page change
  fbObserver.observe(fbContent, {
    childList: true,
  });
  console.info("Monitoring page changes", [fbContent]);
} else if (document.getElementById("mount_0_0") !== null) {
  // if it's FB5 design
  setupFB5PageObserver();
}
// if we can't find ".fb_content", then it must be a mobile website.
// in that case, we don't need javascript to block ads

// cleanup
window.addEventListener("beforeunload", () => {
  fbObserver.disconnect();
  if (feedObserver !== null) {
    feedObserver.disconnect();
  }
  fbContent = null;
});
