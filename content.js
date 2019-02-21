const adblock = function adblock() {
  // Production steps of ECMA-262, Edition 5, 15.4.4.18
  // Reference: http://es5.github.io/#x15.4.4.18
  // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach#Polyfill
  if (!Array.prototype.forEach) {
    Array.prototype.forEach = function forEach(callback /* , thisArg */) {
      let T;
      let k;

      if (this == null) {
        throw new TypeError('this is null or not defined');
      }

      // 1. Let O be the result of calling toObject() passing the
      // |this| value as the argument.
      const O = Object(this);

      // 2. Let lenValue be the result of calling the Get() internal
      // method of O with the argument "length".
      // 3. Let len be toUint32(lenValue).
      const len = O.length >>> 0;

      // 4. If isCallable(callback) is false, throw a TypeError exception.
      // See: http://es5.github.com/#x9.11
      if (typeof callback !== 'function') {
        throw new TypeError(`${callback} is not a function`);
      }

      // 5. If thisArg was supplied, let T be thisArg; else let
      // T be undefined.
      if (arguments.length > 1) {
        T = arguments[1];
      }

      // 6. Let k be 0.
      k = 0;

      // 7. Repeat while k < len.
      while (k < len) {
        let kValue;

        // a. Let Pk be ToString(k).
        //    This is implicit for LHS operands of the in operator.
        // b. Let kPresent be the result of calling the HasProperty
        //    internal method of O with argument Pk.
        //    This step can be combined with c.
        // c. If kPresent is true, then
        if (k in O) {
          // i. Let kValue be the result of calling the Get internal
          // method of O with argument Pk.
          kValue = O[k];

          // ii. Call the Call internal method of callback with T as
          // the this value and argument list containing kValue, k, and O.
          callback.call(T, kValue, k, O);
        }
        // d. Increase k by 1.
        k += 1;
      }
      // 8. return undefined.
    };
  }

  // if e contains anything in whitelist, then ignore.
  const whitelist = [];

  // if e contains anything in blacklist, then hide.
  // a[data-hovercard][href*="hc_ref=ADS"] from https://github.com/uBlockOrigin/uAssets/issues/233
  // a[role="button"][target="_blank"] is used for good post now too.
  const blacklist = [
    '._m8c',
    '.uiStreamSponsoredLink',
    'a[data-hovercard][href*="hc_ref=ADS"]',
    'a[role="button"][rel~="noopener"][data-lynx-mode="async"]',
  ];

  const sponsoredTexts = [
    'Sponsored',
    'प्रायोजित', // Hindi
    'Patrocinado', // Portuguese (Brazil)
    'Bersponsor', // Indonesian
    'Publicidad', // Spanish
    'May Sponsor', // Filipino
    'Được tài trợ', // Vietnamese
    'ได้รับการสนับสนุน', // Thai
    'Sponsorlu', // Turkish
    '赞助内容', // Chinese Simplified
    '贊助', // Chinese (Taiwan)
    'Sponsorisé', // French
    'Gesponsert', // German
  ];

  function isHidden(e) {
    const style = window.getComputedStyle(e);
    if (
      style.display === 'none'
      || style.opacity === '0'
      || style.fontSize === '0px'
      || style.visibility === 'hidden'
    ) {
      return true;
    }
    return false;
  }

  function getVisibleText(e) {
    if (isHidden(e)) {
      // stop if this is hidden
      return [];
    }
    const children = e.querySelectorAll(':scope > *');
    if (children.length !== 0) {
      // more level => recursive
      return Array.prototype.slice
        .call(children)
        .map(getVisibleText)
        .flat();
    }
    // we have found the real text
    return e.innerText;
  }

  function hideIfSponsored(e) {
    if (
      whitelist.some((query) => {
        if (e.querySelector(query) !== null) {
          console.info(`Ignored (${query})`, [e]);
          return true;
        }
        return false;
      })
    ) {
      return false; // ignored this element
    }

    if (
      blacklist.some((query) => {
        if (e.querySelector(query) !== null) {
          e.style.display = 'none';
          console.info(`AD Blocked (${query})`, [e]);
          return true;
        }
        return false;
      })
    ) {
      return true; // has ad
    }

    const possibleSponsoredTags = e.querySelectorAll('div[id^="feed_sub_title"] > :first-child');
    possibleSponsoredTags.forEach((t) => {
      if (sponsoredTexts.indexOf(getVisibleText(t).join('')) !== -1) {
        e.style.display = 'none';
        console.info('AD Blocked (getVisibleText())', [e]);
        return true;
      }
      return false;
    });
    return false;
  }

  let feedObserver = null;
  function onPageChange() {
    let feed;
    if ((feed = document.getElementById('stream_pagelet')) !== null) {
      // if the user change page to homepage
      feed.querySelectorAll('div[id^="hyperfeed_story_id_"]').forEach(hideIfSponsored);
      feedObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.target.id.startsWith('hyperfeed_story_id_')) {
            hideIfSponsored(mutation.target);
          }
        });
      });
      feedObserver.observe(feed, {
        childList: true,
        subtree: true,
      });
    } else if ((feed = document.getElementById('pagelet_group_')) !== null) {
      // if the user change page to https://www.facebook.com/groups/*
      feed.querySelectorAll('div[id^="mall_post_"]').forEach(hideIfSponsored);
      feedObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.target.querySelectorAll('div[id^="mall_post_"]').forEach(hideIfSponsored);
        });
      });
      feedObserver.observe(feed, {
        childList: true,
        subtree: true,
      });
    }
    console.info('Monitoring', [feed]);
  }

  let fbContent = document.getElementsByClassName('fb_content')[0];
  const fbObserver = new MutationObserver(onPageChange);

  // if we can't find ".fb_content", then it must be a mobile website.
  // in that case, we don't need javascript to block ads
  if (fbContent !== undefined) {
    // remove on first load
    onPageChange();

    // Facebook uses ajax to load new content so
    // we need this to watch for page change
    fbObserver.observe(fbContent, {
      childList: true,
    });
  }

  // cleanup
  window.addEventListener('beforeunload', () => {
    fbObserver.disconnect();
    if (feedObserver !== null) {
      feedObserver.disconnect();
    }
    fbContent = null;
  });
};
adblock();
