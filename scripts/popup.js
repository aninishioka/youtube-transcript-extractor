"use strict";

chrome.runtime.onMessage.addListener(handleMessage);

const TRANSCRIPT_BUTTON = document.getElementById('copy-button');

TRANSCRIPT_BUTTON.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'copy-transcript', target: "sw" });
});


async function handleMessage(request, sender, sendResponse) {
  if (request.target !== 'popup') {
    return;
  }

  switch (request.type) {
    case 'write-to-clipboard':
      await navigator.clipboard.writeText(request.text);
  }
}

