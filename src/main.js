import setupClassicPageObserver from "./classic";
import setupFB5PageObserver from "./fb5";

/**
 * Detect if it is a classic Facebook layout
 * @returns {boolean} true if this is a classic Facebook layout
 */
function isClassicFacebook() {
  return document.getElementsByClassName("fb_content")[0] !== undefined;
}

/**
 * Detect if it is a new FB5 layout
 * @returns {boolean} true if this is a new FB5 layout
 */
function isFB5() {
  return document.getElementById("mount_0_0") !== null;
}

if (isClassicFacebook()) {
  // Old Facebook design
  setupClassicPageObserver();
} else if (isFB5()) {
  // if it's FB5 design
  setupFB5PageObserver();
} else {
  console.warn("Page element not found!");
}
// if we detect a page element, then it must be a mobile website.
// in that case, we don't need javascript to block ads
