import __hideIfSponsored from "./hide_if_sponsored";

const possibleSponsoredTextQueries = [
  'a[role="link"] > span[aria-labelledby]',
  'div[role="button"] > span[aria-labelledby]',
  'span[dir="auto"] > span > div[role="button"]:not([aria-labelledby])',
];

function hideIfSponsored(e) {
  return __hideIfSponsored(possibleSponsoredTextQueries, e);
}

/**
 * check the element is a sponsored video
 */
function hideVideoIfSponsored(e) {
  // check sponsored video condition
  const childNode = e.querySelector(
    'div[aria-haspopup="menu"]:not([data-adblocked])'
  );
  if (childNode !== null) {
    childNode.dataset.adblocked = true;
    // flag a sponsored video
    e.style.display = "none";
    e.dataset.blocked = "sponsored";
    console.info(`AD Blocked (div[aria-haspopup="menu"])`, [childNode, e]);
  }
}

let feedObserver = null;
let watchObserver = null;

// wait for and observe FB5 feed element
function setFeedObserver() {
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
          setTimeout(setFeedObserver, 0);
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
    setTimeout(setFeedObserver, 1000);
  }
}

// wait for and observe FB5 feed element
function setWatchObserver() {
  // We are expecting to find a new feed div
  const feed = document.querySelector(
    'div[data-pagelet="MainFeed"]>div>div>div:not([data-adblock-monitored]):first-child'
  );

  if (feed !== null) {
    // flag as monitored
    feed.dataset.adblockMonitored = true;
    const feedContainer = feed.parentNode;
    watchObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // check if feed was reloaded without changing page
        if (
          mutation.target === feedContainer &&
          mutation.addedNodes.length > 0
        ) {
          watchObserver.disconnect();
          // check again for the new feed. Since the DOM has just changed, we
          // want to wait a bit and start looking for the new div after it was
          // rendered. We put our method at the end of the current queue stack
          setTimeout(setWatchObserver, 0);
        }
        // new feed posts added
        if (mutation.target === feed && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            hideVideoIfSponsored(node);
          });
        }
      });
    });
    // check for new feed posts
    watchObserver.observe(feed, {
      childList: true,
    });
    // check if the feed is replaced
    watchObserver.observe(feedContainer, {
      childList: true,
    });
    console.info("Monitoring watch updates", [feed]);
  } else {
    // no feed div was available yet in DOM. will check again
    setTimeout(setWatchObserver, 1000);
  }
}

function onPageChange() {
  if (isFBWatch()) {
    if (feedObserver !== null) {
      feedObserver.disconnect();
      feedObserver = null;
    }
    onPageChangeInWatch();
  } else {
    if (watchObserver !== null) {
      watchObserver.disconnect();
      watchObserver = null;
    }
    onPageChangeInNewFeed();
  }
}

function onPageChangeInNewFeed() {
  // there's a feed div that we don't monitor yet
  if (
    document.querySelector("div[role=feed]:not([data-adblock-monitored])") !==
    null
  ) {
    setFeedObserver();
    return;
  }
  // there's a feed loading placeholder
  if (document.getElementById("suspended-feed") !== null) {
    setFeedObserver();
    return;
  }
  // No new feed was detected
  // Cleanup observer when there's no feed monitored left in DOM
  if (
    feedObserver !== null &&
    document.querySelector("div[role=feed][data-adblock-monitored]") === null
  ) {
    feedObserver.disconnect();
    feedObserver = null;
  }
}

function onPageChangeInWatch() {
  // there's a feed div that we don't monitor yet
  if (
    document.querySelector(
      'div[data-pagelet="MainFeed"]>div>div>div:not([data-adblock-monitored]):first-child'
    ) !== null
  ) {
    setWatchObserver();
    return;
  }
  // there's a feed loading placeholder
  if (document.querySelector('div[role="progressbar"]') !== null) {
    setWatchObserver();
    return;
  }
  // No new feed was detected
  // Cleanup observer when there's no feed monitored left in DOM
  if (
    watchObserver !== null &&
    document.querySelector(
      'div[data-pagelet="MainFeed"]>div>div>div:first-child[data-adblock-monitored]'
    ) === null
  ) {
    watchObserver.disconnect();
    watchObserver = null;
  }
}

const pageObserver = new MutationObserver(onPageChange);

/**
 * Setup a mutation observer at the `root` element to detect a page change.
 * This is because Facebook is using AJAX to load new content.
 *
 * THIS IS THE MAIN ENTRY POINT
 */
function setupPageObserver() {
  // We are expecting to find a root div
  // as of April 2021, there's no pagelet root, fallback to observe mount_0_0
  const rootDiv =
    document.querySelector("div[data-pagelet=root]") ||
    document.querySelector("div[id^=mount_0_0]");
  // make sure there's a root element
  if (rootDiv !== null) {
    // trigger first page initiation
    onPageChange();

    pageObserver.observe(rootDiv, {
      childList: true,
      subtree: true,
    });
    console.info("Monitoring page changes", [rootDiv]);
  } else {
    // no page div was available yet in DOM. will check again
    setTimeout(setupPageObserver, 1000);
  }
}

// cleanup
window.addEventListener("beforeunload", () => {
  pageObserver.disconnect();

  if (feedObserver !== null) {
    feedObserver.disconnect();
    feedObserver = null;
  }

  if (watchObserver !== null) {
    watchObserver.disconnect();
    watchObserver = null;
  }
});

/**
 * Detect if it is a new FB5 layout
 * @returns {boolean} true if this is a new FB5 layout
 */
function isFB5() {
  return document.querySelectorAll("[id^=mount_0_0]").length > 0;
}

/**
 * Detect if it is on fb/watch
 * @returns {boolean} true if this is on fb/watch
 */
function isFBWatch() {
  return document.location.pathname === "/watch";
}

export { setupPageObserver, isFB5 };
