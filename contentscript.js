function google_meet_get_participants() {
     let participants = [];

     // This works for Google Meets, assuming the class names are correct and not
     // linked to my specific session.
     Array.from(document.getElementsByClassName('cS7aqe NkoVdd')).forEach(function (div) {
         var name = div.innerHTML;
         console.log('Found partecipant: ' + name);
         participants.push(name);
     });

     return participants;
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
    let participants_list = participants.join('\n');

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
        participants.push(google_meet_get_participants());
    }

    trigger_download(participants);
}

savepart_main();
