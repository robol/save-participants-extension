async function google_meet_get_participants() {
     let participants_dict = {};
     
     // In order to get the complete list of participants, we need
     // to scroll the list to the bottom.
     let scrollableElements = document.getElementsByClassName('HALYaf tmIkuc s2gQvd KKjvXb');
     if (scrollableElements.length == 0) {
         return [];
     }
     let se = scrollableElements[0];
     se.scrollTo(0, 0);
     // Wait for the scrolling to happen
     await new Promise(function (res, rej) { setTimeout(res, 500); });
     
     let scrollStep = se.offsetHeight;
     let scrollUnits = 0;
     
     while (scrollUnits <= se.scrollHeight) {
         console.log(scrollUnits);
         // This works for Google Meets. We need to scroll down to get them all. The ID
         // is needed to make sure we do not count someone twice.          
         Array.from(document.getElementsByClassName('HEu5Ef sMVRZe')).forEach(function (div) {
             var pid = div.getAttribute('data-participant-id');
             var labels = div.getElementsByClassName('cS7aqe NkoVdd');
             if (labels.length > 0) {
                 var name = labels[0].innerHTML;
                 console.log('Found partecipant: ' + name + ', ID: ' + pid);
                 participants_dict[pid] = name;
             }
         });
         
         se.scrollBy(0, scrollStep);
         scrollUnits += scrollStep;
         
         // Wait for the scrolling to happen
         await new Promise(function (res, rej) { setTimeout(res, 500); });
     }

     console.log(Object.values(participants_dict));
     return Object.values(participants_dict);
}

function google_meet_open_sidebar() {
    // For Google Meet, we may try to open the sidebar if we manage
    let sidebar_btns = document.getElementsByClassName(
      'uArJ5e UQuaGc kCyAyd kW31ib foXzLb');
    if (sidebar_btns.length > 0) {
        sidebar_btns[0].click();
    }

    return new Promise(function(resolve, reject) {
        setTimeout(resolve, 500);
    });
}

function microsofot_team_get_participants() {
    let participants = [];

    // This code works for Microsoft Teams
    Array.from(document.getElementsByTagName('li')).forEach(function (ll) {
        let datatid = ll.getAttribute('data-tid');
        if (datatid != null && datatid.includes('participantsInCall')) {
	        var name = datatid.substr(19); // Skip the prefix. 
	        console.log('Found partecipant: ' + name);
	        participants.push(name);
        }
    });

    return participants;
}

function trigger_download(participants) {
    let participants_list = participants.join("\n");

    if (participants.length == 0) {
      alert('No participants found!\nPlease check that the sidebar containing the list of participants is open.');
    }
    else {
        chrome.runtime.sendMessage(
          {
             action: 'download',
             message: participants_list
          },
          function (response) {
              if (response.status != 'completed') {
                  console.log('Download fallito');
              }
          }
        );
    }
}

async function savepart_main() {

    let participants = microsofot_team_get_participants();

    // In this case, we try to get participants from Google Meets
    if (participants.length == 0) {
        await google_meet_open_sidebar();
        participants = await google_meet_get_participants();
    }

    trigger_download(participants);
}

savepart_main();
