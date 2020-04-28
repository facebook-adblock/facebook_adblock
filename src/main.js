import {
  setupPageObserver as setupClassicPageObserver,
  isClassicFacebook,
} from "./classic";
import { setupPageObserver as setupFB5PageObserver, isFB5 } from "./fb5";

if (isClassicFacebook()) {
  // Old Facebook design
  setupClassicPageObserver();
} else if (isFB5()) {
  // if it's FB5 design
  setupFB5PageObserver();
} else {
  console.warn(
    "Page element not found! If this is not a mobile Facebook, please file a bug report: https://github.com/tiratatp/facebook_adblock/issues/new"
  );
}
// if we cannot detect a page element, then it must be a mobile website.
// in that case, we don't need javascript to block ads.
