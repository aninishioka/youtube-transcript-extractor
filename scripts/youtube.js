"use strict";


const SHOW_TRANSCRIPT_BTN_SELECTOR = 'button[aria-label="Show transcript"]';
const TRANSCRIPT_SEGMENT_SELECTOR = 'ytd-transcript-segment-renderer';
const TRANSCRIPT_TEXT_SELECTOR = '.segment-text';


chrome.runtime.onMessage.addListener(handleMessage);


async function handleMessage(request, sender, sendResponse) {
  if (request.target !== 'content') {
    return;
  }

  switch (request.type) {
    case 'get-text':
      await getAndSendTranscript();
  }
}


/** Gets transcript from DOM and sends to popup.js
 */
async function getAndSendTranscript() {
  // wait for show transcript button to load
  waitForElementLoad(SHOW_TRANSCRIPT_BTN_SELECTOR, () => {
    document.querySelector(SHOW_TRANSCRIPT_BTN_SELECTOR).click();

    // wait for transcript-rendering element to load
    waitForElementLoad(TRANSCRIPT_TEXT_SELECTOR, () => {
      const text = getTranscriptText();

      chrome.runtime.sendMessage({
        type: "write-to-clipboard",
        target: "popup",
        text
      });
    });
  });
}


/** Gets video transcript from DOM.
 * @returns {string}
 */
function getTranscriptText() {
  const transcriptSegments = [...document.getElementsByClassName(TRANSCRIPT_SEGMENT_SELECTOR)];
  const textSegments = transcriptSegments.map(ts => {
    const elem = ts.querySelector(TRANSCRIPT_TEXT_SELECTOR);
    if (elem) return elem.textContent;
  }).filter(text => !!text);

  return textSegments.join(' ');
}


/** Executes callback function on element load.
 *
 * Based on answers on https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
 *
 * @param {string} selector CSS selector for element
 * @param {function} callback Function executed after element load
 * @returns {null}
 */
async function waitForElementLoad(selector, callback) {
  if (document.querySelector(selector)) {
    callback();
  }

  const observer = new MutationObserver(_ => {
    if (document.querySelector(selector)) {
      observer.disconnect();
      callback();
    }
  });

  observer.observe(document.body, {
    subtree: true,
    childList: true
  });
}