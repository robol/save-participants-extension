function savepart_main() {

    let participants_list = "";

    // This code works for Microsoft Teams
    Array.from(document.getElementsByTagName('li')).forEach(function (ll) {
        let datatid = ll.getAttribute('data-tid');
        if (datatid != null && datatid.includes('participantsInCall')) {
	        var name = datatid.substr(19); // Skip the prefix. 
	        console.log('Found partecipant: ' + name);
	        participants_list = participants_list + name + "\n";
        }
    });

    // And this works for Google Meets, assuming the class names are correct and not
    // linked to my specific session.
    Array.from(document.getElementsByClassName('cS7aqe NkoVdd')).forEach(function (div) {
        var name = div.innerHTML;
        console.log('Found partecipant: ' + name);
        participants_list = participants_list + name + "\n";
    });

    chrome.runtime.sendMessage(
      {
         action: 'download',
         message: "Participants:\n\n" + participants_list
      },
      function (response) {
          if (response.status != 'completed') {
              console.log('Download fallito');
          }
      });


}

savepart_main();
