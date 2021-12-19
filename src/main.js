import {
  setupPageObserver as setupClassicPageObserver,
  isClassicFacebook,
} from "./classic";
import { setupPageObserver as setupFB5PageObserver, isFB5 } from "./fb5";

console.info("ABfF:", "Ad Blocker for Facebook™ initialized");
if (isClassicFacebook()) {
  // Old Facebook design
  setupClassicPageObserver();
} else if (isFB5()) {
  // if it's FB5 design
  setupFB5PageObserver();
} else {
  // if we cannot detect a page element, then it must be a mobile website.
  // in that case, we don't need javascript to block ads.
  console.warn(
    "ABfF:",
    "Page element not found! If this is not a mobile Facebook, please file a bug report: https://github.com/facebook-adblock/facebook_adblock/issues/new"
  );
}

function enableDebug() {
  document.head.insertAdjacentHTML(
    "beforeend",
    `
<style>
  *[data-blocked] {
    display:inherit !important;
    border: red 10px solid;
  }
  *[data-blocked=allowedList] {
    border-color: green;
  }
  *[data-adblocked] {
    display:inherit !important;
    border: pink 10px solid;
  }
  *[data-adblock-monitored] {
    border: blue 10px solid;
  }
  *[data-adblock-observed] {
    border: aqua 10px solid;
  }
</style>`
  );
}
// enableDebug(); // Only uncomment this in development
