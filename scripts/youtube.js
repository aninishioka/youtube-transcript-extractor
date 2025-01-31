"use strict";


const SHOW_TRANSCRIPT_BTN_SELECTOR = 'button[aria-label="Show transcript"]';
const TRANSCRIPT_SEGMENT_SELECTOR = 'ytd-transcript-segment-renderer';
const TRANSCRIPT_TEXT_SELECTOR = '.segment-text';


chrome.runtime.onMessage.addListener(handleMessage);


async function handleMessage(request) {
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
  try {
    await waitForElementLoad(SHOW_TRANSCRIPT_BTN_SELECTOR);
    document.querySelector(SHOW_TRANSCRIPT_BTN_SELECTOR).click();

    await waitForElementLoad(TRANSCRIPT_TEXT_SELECTOR);
    const text = getTranscriptText();

    chrome.runtime.sendMessage({
      type: "write-to-clipboard",
      target: "popup",
      text
    });
  } catch {
    console.log('boo');
  }
}


/** Gets video transcript from DOM.
 * @returns {string} Transcript text.
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
 * Based on answers on https://stackoverflow.com/questions/34863788/how-to-check-if-an-element-has-been-loaded-on-a-page-before-running-a-script
 *
 * @param {string} selector CSS selector for element
 * @param {function} callback Function executed after element load
 * @returns {Promise}
 */
async function waitForElementLoad(selector, timeout = 1000) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(selector)) {
      resolve();
    }

    let timer;

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        if (timer) clearTimeout(timer);
        return resolve();
      }
    });

    observer.observe(document.body, {
      subtree: true,
      childList: true
    });

    timer = setTimeout(() => {
      observer.disconnect();
      return reject();
    }, timeout);

  });
}