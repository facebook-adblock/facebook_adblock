import { allowedList, sponsoredTexts, blockedList } from "./constants";

/**
 * Facebook uses various techniques to hide an element
 * @param {Element} e
 * @returns {boolean} true if this element is hidden; Thus a text inside this element is not visible to the users.
 */
function isHidden(e) {
  const style = window.getComputedStyle(e);
  if (
    style.display === "none" ||
    style.opacity === "0" ||
    style.fontSize === "0px" ||
    style.visibility === "hidden" ||
    style.position === "absolute"
  ) {
    return true;
  }
  return false;
}

/**
 * Facebook uses various techniques to hide a text inside an element
 * @param {Element} e
 * @returns {string} a text hidden inside this DOM element; Returns an empty string if there is no hidden text.
 */
function getTextFromElement(e) {
  return (e.innerText === "" ? e.dataset.content : e.innerText) || "";
}

/**
 * For FB5, Facebook also hides a text directly inside a container element.
 * @param {Element} e
 * @returns {string} a text hidden inside this DOM element
 */
function getTextFromContainerElement(e) {
  // we only need the data-content of a container element, or any direct text inside it
  return (
    e.dataset.content ||
    Array.prototype.filter
      .call(e.childNodes, (element) => {
        return element.nodeType === Node.TEXT_NODE;
      })
      .map((element) => {
        return element.textContent;
      })
      .join("")
  );
}

/**
 * Return a text inside this given DOM element that is visible to the users
 * @param {Element} e
 * @returns {string}
 */
function getVisibleText(e) {
  if (isHidden(e)) {
    // stop if this is hidden
    return "";
  }
  const children = e.querySelectorAll(":scope > *");
  if (children.length !== 0) {
    // more level => recursive
    return (
      getTextFromContainerElement(e) +
      Array.prototype.slice.call(children).map(getVisibleText).flat().join("")
    );
  }
  // we have found the real text
  return getTextFromElement(e);
}

/**
 * Hide an element if this is a sponsored element
 * @param {String[]} possibleSponsoredTextQueries a list of selectors to look for a sponsored element
 * @param {Element} e DOM element
 * @returns {boolean} true if this is a sponsored element
 */
function hideIfSponsored(possibleSponsoredTextQueries, e) {
  // ignore if matches the allowedList
  if (
    allowedList.some((query) => {
      if (e.querySelector(query) !== null) {
        e.dataset.blocked = "allowedList";
        console.info(`Ignored (${query})`, [e]);
        return true;
      }
      return false;
    })
  ) {
    return false; // ignored this element
  }

  // hide right away if matches the blocked list
  if (
    blockedList.some((query) => {
      if (e.querySelector(query) !== null) {
        e.style.display = "none";
        e.dataset.blocked = "blockedList";
        console.info(`AD Blocked (${query})`, [e]);
        return true;
      }
      return false;
    })
  ) {
    return true; // has ad
  }

  // Look through a list of possible locations of "Sponsored" tag, and see if it matches our list of `sponsoredTexts`
  return possibleSponsoredTextQueries.some((query) => {
    const result = e.querySelectorAll(query);
    return [...result].some((t) => {
      const visibleText = getVisibleText(t);
      if (
        sponsoredTexts.some(
          (sponsoredText) => visibleText.indexOf(sponsoredText) !== -1
        )
      ) {
        e.style.display = "none";
        e.dataset.blocked = "sponsored";
        console.info(
          `AD Blocked (query='${query}', visibleText='${visibleText}')`,
          [e]
        );
        return true;
      }
      return false;
    });
  });
}

export { hideIfSponsored as default };
