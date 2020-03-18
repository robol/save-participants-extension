'use strict';

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.executeScript(
      tabs[0].id,
      { file: 'contentscript.js' }
    );
});

function sp_execute_js(code) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.executeScript(
        tabs[0].id,
        { 'code': code }
      );
  });
}

var downloadParticipantsButton = document.getElementById('downloadParticipantsButton');

downloadParticipantsButton.onclick = function(element) {
  sp_execute_js('sp_download_list();')
};

var monitorParticipantsButton = document.getElementById('monitorParticipantsButton');

// Update the name of the button
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, 'sp-monitor-is-enabled', function(monitor_enabled) {
    if (chrome.runtime.lastError) {
        console.log('ERROR: ', chrome.runtime.lastError);
    }
    else {
      if (monitor_enabled) {
        monitorParticipantsButton.innerHTML = "Stop monitoring";
      }
      else {
        monitorParticipantsButton.innerHTML = "Start monitoring";
      }
    }
  })
});

monitorParticipantsButton.onclick = function(element) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, 'sp-monitor-is-enabled', function(monitor_enabled) {
      if (chrome.runtime.lastError) {
          console.log('ERROR: ', chrome.runtime.lastError);
      }
      else {
        console.log('Monitor Enabled = ', monitor_enabled);
        if (! monitor_enabled) {
          sp_execute_js('sp_start_monitor();');
          monitorParticipantsButton.innerHTML = "Stop monitoring";
        }
        else {
          sp_execute_js('sp_stop_monitor();');
          monitorParticipantsButton.innerHTML = "Start monitoring";
          alert('Please wait a few seconds to download the report');
        }
      }
    })
  })
}
