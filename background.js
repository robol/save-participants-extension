chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostEquals: 'teams.microsoft.com'},
        })
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()]
      }]);
    });

    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
        console.log(sender.tab ?
                    "from a content script:" + sender.tab.url :
                    "from the extension");
        if (request.action == "download") {
            let msg = request.message;

	        var blob = new Blob([msg], {type: "text/plain"});
	        var url = URL.createObjectURL(blob);
	        chrome.downloads.download({
          		url: url,
          		filename: 'participants.txt'
	        });

            sendResponse({ status: 'completed' });
        }
      });
  });
