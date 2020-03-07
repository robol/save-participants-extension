'use strict';

let downloadParticipantsButton = document.getElementById('downloadParticipantsButton');

downloadParticipantsButton.onclick = function(element) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.executeScript(
          tabs[0].id,
          { file: 'contentscript.js' }
        );
    });
};
