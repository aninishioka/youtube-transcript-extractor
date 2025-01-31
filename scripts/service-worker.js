"use strict";

async function handleMessage(request, sender, sendResponse) {
  if (request.target !== 'sw') {
    return;
  }

  switch (request.type) {
    case "copy-transcript":
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'get-text',
          target: 'content',
        });
      });
  }
}

chrome.runtime.onMessage.addListener(handleMessage);