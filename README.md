# facebook_adblock

An open-source Ad Blocker for Facebook™

- Support the FB5 layout (Thanks to [Christos Botsikas](https://github.com/cbotsikas))
- Blocks both suggested posts and sidebar ads
- Does not slow down your computer
- Does not track/read your Facebook activity, or other websites
- You can inspect everything about this extension here, https://github.com/tiratatp/facebook_adblock/blob/master/src/main.js

This extension is 100% free and open source.

## Installation

### Chrome

https://chrome.google.com/webstore/detail/ad-blocker-for-facebook/kinpgphmiekapnpbmobneleaiemkefag

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/kinpgphmiekapnpbmobneleaiemkefag.svg)](https://chrome.google.com/webstore/detail/ad-blocker-for-facebook/kinpgphmiekapnpbmobneleaiemkefag)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/users/kinpgphmiekapnpbmobneleaiemkefag.svg)](https://chrome.google.com/webstore/detail/ad-blocker-for-facebook/kinpgphmiekapnpbmobneleaiemkefag)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/stars/kinpgphmiekapnpbmobneleaiemkefag.svg)](https://chrome.google.com/webstore/detail/ad-blocker-for-facebook/kinpgphmiekapnpbmobneleaiemkefag)

### Firefox

https://addons.mozilla.org/en-US/firefox/addon/fb_ad_block/ (Thanks to [Chih-Hsuan Yen](https://github.com/yan12125))

[![Mozilla Add-on](https://img.shields.io/amo/v/fb_ad_block.svg)](https://addons.mozilla.org/en-US/firefox/addon/fb_ad_block/)
[![Mozilla Add-on](https://img.shields.io/amo/users/fb_ad_block.svg)](https://addons.mozilla.org/en-US/firefox/addon/fb_ad_block/)
[![Mozilla Add-on](https://img.shields.io/amo/stars/fb_ad_block.svg)](https://addons.mozilla.org/en-US/firefox/addon/fb_ad_block/)

Enjoy!

_We are not affiliated, associated, authorized, endorsed by, or in any way officially connected with Facebook._

_Facebook is a registered trademark of the Facebook, Inc._

## Building

1. Run `npm run release`
1. The compiled extension should be in `dist/`
1. Load the unsigned extension into your browser

## Debugging

All processed DOM elements are flagged with `data-blocked` attribute. Possible values are:

- `whitelist`: whitelisted
- `blacklist`: blocked due to blacklist check
- `sponsored`: blocked due to sponsored label

You can use dev tools console with CSS selectors like `*[data-blocked]` or `*[data-blocked=sponsored]`.

For example add inline style properties to all existing hidden sponsored posts:

```
document.querySelectorAll("*[data-blocked=sponsored]").forEach((x) => {
  x.style.display="inherit";
  x.style.border="red 10px solid";
});
```

You can also inject css which applies to both existing and new processed elements:

```
document.head.insertAdjacentHTML("beforeend",
`<style>
  *[data-blocked] {
    display:inherit !important;
    border: red 10px solid;
  }
  *[data-blocked=whitelist] {
    border-color: green;
  }
</style>`);
```

## Publishing

1. Tag a commit with a string with this format `v*.*.*`
   - `git tag -a v2.0.0`
1. Push a tag to Github
1. Github action should publish the extension to both Firefox and Chrome
   - Firefox should be released in a couple of minutes
   - Chrome can take as long as a few months if it needs a review
