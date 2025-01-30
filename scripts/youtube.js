"use strict";

chrome.runtime.onMessage.addListener(handleMessage);


async function handleMessage(request, sender, sendResponse) {
  if (request.target !== 'content') {
    return;
  }

  switch (request.type) {
    case 'get-text':
      const text = showTranscript();

      chrome.runtime.sendMessage({
        type: "write-to-clipboard",
        target: "popup",
        text: text
      });
  }
}


function showTranscript() {
  const showTranscriptBtn = document.querySelector('button[aria-label="Show transcript"]');
  if (!showTranscriptBtn) return;

  showTranscriptBtn.click();

  const transcriptSegments = [...document.getElementsByClassName('ytd-transcript-segment-renderer')];
  const textSegments = transcriptSegments.map(ts => {
    const elem = ts.querySelector('.segment-text');
    if (elem) return elem.textContent;
  }).filter(text => !!text);

  return textSegments.join(' ');
}