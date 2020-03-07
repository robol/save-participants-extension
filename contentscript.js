function savepart_main() {

    let participants_list = "";

    Array.from(document.getElementsByTagName('li')).forEach(function (ll) {
        let datatid = ll.getAttribute('data-tid');
        if (datatid != null && datatid.includes('participantsInCall')) {
	        var name = datatid.substr(19); // Skip the prefix. 
	        console.log('Found partecipants: ' + name);
	        participants_list = participants_list + name + "\n";
        }
    });

	// alert("Partecipanti al corso:\n\n" + participants_list);
    chrome.runtime.sendMessage({ action: 'download', 
                                 message: "Partecipanti al corso:\n\n" + participants_list},
                               function (response) {
                                   if (response.status != 'completed') {
                                       console.log('Download fallito');
                                   }                                   
                               });


}

savepart_main();
