(function() {
	"use strict";
	function hide_if_sponsored(e) {
		// if e contains ._m8c, then hide
		0 != e.getElementsByClassName("_m8c").length && (e.style.display = "none")
	}

	function remove_sponsored_posts(c) {
		// new version has ".fbUserContent" instead of .userContentWrapper
		c.querySelectorAll(".fbUserContent, .userContentWrapper").forEach(hide_if_sponsored);
	}

	function onPageChange() {
		var new_root_tag = document.getElementById("stream_pagelet");

		// if the user change page to/from homepage
		if (new_root_tag !== root_tag) {
			// removing old observers
			stream_observer.disconnect();
			// add to new tag
			new_root_tag && stream_observer.observe(new_root_tag, {childList: true, subtree: true});
			root_tag = new_root_tag;
		}
	}

	var fb_content = document.getElementsByClassName("fb_content")[0],		
		fb_observer = new MutationObserver(onPageChange),
		root_tag = null,
		stream_observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				if (mutation.target.dataset.cursor) {
					remove_sponsored_posts(mutation.target);
				}
			});
		});

	// if we can't find ".fb_content", then it must be a mobile website.
	// in that case, we don't need javascript to block ads
	if (fb_content) {
		// remove on first load
		onPageChange();
		remove_sponsored_posts(fb_content);

		// Facebook uses ajax to load new content so
		// we need this to watch for page change
		fb_observer.observe(fb_content, {childList: true});
	}
}());
