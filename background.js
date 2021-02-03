chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        // Rule for matching at teams.microsoft.com
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: {
                    hostEquals: 'teams.microsoft.com'
                },
            })],
            actions: [
                new chrome.declarativeContent.ShowPageAction(),
            ]
        }]);

        // Rule for matching at meet.google.com
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: {
                    hostEquals: 'meet.google.com'
                },
            })],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.action == "download") {
            let msg = request.message;
            let monitor = request.monitor;

            // Format the date to be appended to the filename; unfortunately
            // Chrome does not allow to use ':' in filenames, so we cannot 
            // really format times as one would expect. 
            let now = new Date();
            let filename = 'participants-' + 
                (monitor ? 'monitor-' : '') +
                now.getFullYear() + '-' +
                (now.getMonth() + 1).toString().padStart(2, "0") + '-' +
                now.getDate().toString().padStart(2, "0") + '_' +
                now.getHours().toString().padStart(2, "0") + '-' +
                now.getMinutes().toString().padStart(2, "0") + '-' + 
                now.getSeconds().toString().padStart(2, "0") + 
                '.txt';

            var blob = new Blob([msg], {
                type: "text/plain"
            });
            var url = URL.createObjectURL(blob);
            chrome.downloads.download({
                url: url,
                filename: filename
            });

            sendResponse({
                status: 'completed'
            });
        }
    }
);