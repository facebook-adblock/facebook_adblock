(function() {
	function remove_ads() {
		// old version
		$(".userContentWrapper:has(.uiStreamSponsoredLink)").hide()
		// new version
		$(".userContentWrapper:has(._m8d)").hide()
		$(".userContentWrapper:has(._4dcu)").hide()
		// sidebar ads
		$("#pagelet_ego_pane").remove()
	}
	var throttled = _.throttle(remove_ads, 1000);

	// so that the space will collape nicely when we remove sidebar ad
	$(".home_right_column").css("min-height", "inherit");

	// remove ads on the first load
	remove_ads();

	// keep removing ads when you are scrolling
	// (which causes Facebook to load stuff via ajax)
	$(document).on("scroll", throttled);
}());
