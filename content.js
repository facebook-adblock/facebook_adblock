(function() {
    "use strict";
    function hideIfSponsored(e) {
        // if e contains ._m8c or .uiStreamSponsoredLink, then hide
        // a[data-hovercard][href*="hc_ref=ADS"] from https://github.com/uBlockOrigin/uAssets/issues/233
        var queries = ['._m8c', '.uiStreamSponsoredLink', 'a[data-hovercard][href*="hc_ref=ADS"]'];
        return queries.some(function(query) {
            if (e.querySelector(query) !== null) {
                e.style.display = "none";
                console.info("AD Blocked", [e]);
                return true;
            }
            return false;
        });
    }

    function onPageChange() {
        var feed;
        if ((feed = document.getElementById("stream_pagelet")) !== null) {
            // if the user change page to homepage
            feed.querySelectorAll('div[id^="hyperfeed_story_id_"]').forEach(hideIfSponsored);
            feedObserver = new MutationObserver(function(mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.target.id.startsWith("hyperfeed_story_id_")) {
                        hideIfSponsored(mutation.target);
                    }
                });
            });
            feedObserver.observe(feed, {childList: true, subtree: true});
        } else if ((feed = document.getElementById("pagelet_group_")) !== null) {
            // if the user change page to https://www.facebook.com/groups/*
            feed.querySelectorAll('div[id^="mall_post_"]').forEach(hideIfSponsored);
            feedObserver = new MutationObserver(function(mutations) {
                mutations.forEach(function (mutation) {
                    mutation.target.querySelectorAll('div[id^="mall_post_"]').forEach(hideIfSponsored);
                });
            });
            feedObserver.observe(feed, {childList: true, subtree: true});
        }
        console.info("Monitoring", [feed]);
    }

    var fbContent = document.getElementsByClassName("fb_content")[0],
        feedObserver = null,
        fbObserver = new MutationObserver(onPageChange);

    // if we can't find ".fb_content", then it must be a mobile website.
    // in that case, we don't need javascript to block ads
    if (fbContent !== undefined) {
        // remove on first load
        onPageChange();

        // Facebook uses ajax to load new content so
        // we need this to watch for page change
        fbObserver.observe(fbContent, {childList: true});
    }

    // cleanup
    window.addEventListener("beforeunload", function() {
        fbObserver.disconnect();
        if (feedObserver !== null) {
            feedObserver.disconnect();
        }        
        fbContent = null;
    });
}());
