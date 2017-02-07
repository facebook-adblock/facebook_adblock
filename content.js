(function() {
	"use strict";
	function remove_ads() {
		// remove sponsored posts
		var ucw = $(".userContentWrapper");
		// old version
		ucw.has(".uiStreamSponsoredLink").hide();
		// new version
		ucw.has("._m8c").hide();

		// new version has ".fbUserContent" instead of ucw
		var fuc = $(".fbUserContent");
		// old version
		fuc.has(".uiStreamSponsoredLink").hide();
		// new version
		fuc.has("._m8c").hide();
		//fuc.has('a[rel="nofollow"]').hide(); // not all rel="nofollow" is ad

		// so that the space will collape nicely when we remove sidebar ad
		$(".home_right_column").css("min-height", "inherit");
		// sidebar ads
		$("#pagelet_ego_pane").remove();

		// mobile version
		$("article.acw").remove();
	}
	var throttled = _.throttle(remove_ads, 1000);

	// make timeline long enough so we could always scroll
	// so that when we remove ads, we could still scroll to trigger ajax load
	$("#stream_pagelet").css("height", "10000px");

	// remove ads on the first load
	remove_ads();

	// keep removing ads when you are scrolling
	// (which causes Facebook to load stuff via ajax)
	$(document).on("scroll", throttled);
}());
