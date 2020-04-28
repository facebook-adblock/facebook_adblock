import hideIfSponsored from "./hide_if_sponsored";

let feedObserver = null;

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
  }
}

const pageObserver = new MutationObserver(onPageChange);

/**
 * Detect the current page and setup a page change observer.
 * This is because Facebook is using AJAX to load new content.
 *
 * THIS IS THE MAIN ENTRY POINT
 */
function setupPageObserver() {
  // remove ads on first load
  onPageChange();

  const fbContent = document.getElementsByClassName("fb_content")[0];
  pageObserver.observe(fbContent, {
    childList: true,
  });
  console.info("Monitoring page changes", [fbContent]);
}

window.addEventListener("beforeunload", () => {
  pageObserver.disconnect();
  if (feedObserver !== null) {
    feedObserver.disconnect();
    feedObserver = null;
  }
});

export { setupPageObserver as default };
