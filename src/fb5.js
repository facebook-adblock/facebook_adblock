import __hideIfSponsored from "./hideIfSponsored";

const possibleSponsoredTextQueries = [
  'a[role="link"] span[aria-labelledby]',
  'div[role="button"] > span[aria-labelledby]',
  'span[dir="auto"] > span > div[role="button"]:not([aria-labelledby])',
  "span > a[aria-label]",
  // a new rule to find if span contains an order style
  "span[style*='order: 0;']>span[style*='order: 28;']",
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
    console.info("ABfF:", `AD Blocked (div[aria-haspopup="menu"])`, [
      childNode,
      e,
    ]);
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
    feedContainer.dataset.adblockObserved = true;
    feed.dataset.adblockMonitored = true;
    feedObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // check if feed was reloaded without changing page
        if (
          mutation.target === feedContainer &&
          mutation.addedNodes.length > 0
        ) {
          // fb starting replacing the feed div with existing data attributes.
          // We need to cleanup so that we can start observing again.
          if (mutation.addedNodes[0].dataset.adblockMonitored) {
            mutation.addedNodes[0].removeAttribute("data-adblock-monitored");
            delete mutation.addedNodes[0].dataset.adblockMonitored;
          }
          feedObserver.disconnect();
          // check again for the new feed. Since the DOM has just changed, we
          // want to wait a bit and start looking for the new div after it was
          // rendered. We put our method at the end of the current queue stack
          setTimeout(setFeedObserver, 0);
        }
        // new feed posts added
        if (mutation.target === feed && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(hideIfSponsored);
        }
      });
    });
    feedObserver.__observed = feedContainer;
    feedObserver.__monitored = feed;
    // check for new feed posts
    feedObserver.observe(feed, {
      childList: true,
    });
    // check if the feed is replaced
    feedObserver.observe(feedContainer, {
      childList: true,
    });
    console.info("ABfF:", "Monitoring feed updates", [feed]);
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
    const feedContainer = feed.parentNode;
    // flag as monitored
    feedContainer.dataset.adblockObserved = true;
    feed.dataset.adblockMonitored = true;
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
    watchObserver.__observed = feedContainer;
    watchObserver.__monitored = feed;
    // check for new feed posts
    watchObserver.observe(feed, {
      childList: true,
    });
    // check if the feed is replaced
    watchObserver.observe(feedContainer, {
      childList: true,
    });
    console.info("ABfF:", "Monitoring watch updates", [feed]);
  } else {
    // no feed div was available yet in DOM. will check again
    setTimeout(setWatchObserver, 1000);
  }
}

function onPageChange() {
  if (isFBWatch()) {
    cleanupFeedObserver();
    onPageChangeInWatch();
  } else {
    cleanupWatchObserver();
    onPageChangeInNewFeed();
  }
}

function checkRightRail() {
  const possibleAdNode = document.querySelector(
    "div[data-pagelet='RightRail'] > div:first-child > span:not([data-blocked])"
  );
  if (possibleAdNode != null) {
    __hideIfSponsored(["h3"], possibleAdNode);
  }
}

function onPageChangeInNewFeed() {
  // RightRail appears only on NewsFeed page
  checkRightRail();

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
    cleanupFeedObserver();
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
    cleanupWatchObserver();
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

    // flag as monitored
    rootDiv.dataset.adblockObserved = true;
    pageObserver.__observed = rootDiv;
    pageObserver.observe(rootDiv, {
      childList: true,
      subtree: true,
    });
    console.info("ABfF:", "Monitoring page changes", [rootDiv]);
  } else {
    // no page div was available yet in DOM. will check again
    setTimeout(setupPageObserver, 1000);
  }
}

// cleanup
window.addEventListener("beforeunload", () => {
  cleanupPageObserver();
  cleanupFeedObserver();
  cleanupWatchObserver();
});
function cleanupPageObserver() {
  if (pageObserver === null) {
    return;
  }
  if (pageObserver.__observed) {
    delete pageObserver.__observed.dataset.adblockObserved;
    delete pageObserver.__observed;
  }
  pageObserver.disconnect();
  // do not nullify pageObserver!
}
function cleanupFeedObserver() {
  if (feedObserver === null) {
    return;
  }
  if (feedObserver.__monitored) {
    delete feedObserver.__monitored.dataset.adblockMonitored;
    delete feedObserver.__monitored;
  }
  if (feedObserver.__observed) {
    delete feedObserver.__observed.dataset.adblockObserved;
    delete feedObserver.__observed;
  }
  feedObserver.disconnect();
  feedObserver = null;
}
function cleanupWatchObserver() {
  if (watchObserver === null) {
    return;
  }
  if (watchObserver.__monitored) {
    delete watchObserver.__monitored.dataset.adblockMonitored;
    delete watchObserver.__monitored;
  }
  if (watchObserver.__observed) {
    delete watchObserver.__observed.dataset.adblockObserved;
    delete watchObserver.__observed;
  }
  watchObserver.disconnect();
  watchObserver = null;
}

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
  return /^\/watch\/?$/.test(document.location.pathname);
}

export { setupPageObserver, isFB5 };
