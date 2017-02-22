(function() {
	"use strict";
	function hide(e){
		e && (e.style.display = "none")
	}

	function hide_if_sponsored(e) {
		0 != e.getElementsByClassName("_m8c").length && hide(e)
	}

	function remove_sponsored_posts(c) {
		if (typeof c.getElementsByClassName == "function") {
			c.querySelectorAll(".userContentWrapper").forEach(hide_if_sponsored);

			// new version has ".fbUserContent" instead of .userContentWrapper
			c.querySelectorAll(".fbUserContent").forEach(hide_if_sponsored);
		}
	}

	function onBodyChange() {
		var new_root_tag;

		if (!isMobile) {
			new_root_tag = document.getElementById("stream_pagelet");
		} else {
			new_root_tag = document.getElementById("MRoot");
		}

		// if the user change page to/from homepage
		if (new_root_tag !== root_tag) {
			// Adding observers
			stream_observer.disconnect();
			new_root_tag && stream_observer.observe(new_root_tag, {childList: true, subtree: true});
			root_tag = new_root_tag;
		}
	}

	// isMobile is from Facebook SDK for JavaScript
	var h = navigator.userAgent,
		isMobile = /\b(iPhone|iP[ao]d)/.test(h) || /\b(iP[ao]d)/.test(h) || /Android/i.test(h) || /Mobile/i.test(h),
		root_tag,
		body_observer = new MutationObserver(onBodyChange),
		stream_observer = new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				if (mutation.target.dataset.cursor) {
					remove_sponsored_posts(mutation.target);
				}
			});
		});

	// remove on first load
	onBodyChange();
	remove_sponsored_posts(document.body);

	// watch for page change
	body_observer.observe(document.body, {childList: true});
}());
