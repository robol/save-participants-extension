chrome.runtime.onMessage.addListener(function(sender, message, sendResponse) {
    if (message = 'sp-monitor-is-enabled') {
        sendResponse(sp_monitor_is_enabled());
    }
    else {
        console.log('Invalid message received');
    }
});

function sp_get_global(name) {
  let html = document.getElementsByTagName('html')[0];

  if (! html.hasAttribute('data-' + name)) {
      return null;
  }
  else {
      return JSON.parse(html.getAttribute('data-' + name));
  }
}

function sp_set_global(name, value) {
    let html = document.getElementsByTagName('html')[0];
    console.log('Setting ' + name + ' to ' + JSON.stringify(value))
    html.setAttribute('data-' + name,
        JSON.stringify(value));
}

function sp_monitor_is_enabled() {
    let html = document.getElementsByTagName('html')[0];

    if (! html.hasAttribute('data-sp-monitor')) {
        return false;
    }

    return html.getAttribute('data-sp-monitor') == 'on';
}

function sp_monitor_set_enabled(enabled) {
    let html = document.getElementsByTagName('html')[0];
    html.setAttribute('data-sp-monitor', enabled ? 'on' : 'off');
    console.log('Called sp_monitor_set_enabled with enabled = ' + enabled);
    console.log('html / data-sp-monitor: ', html.getAttribute('data-sp-monitor'));
}

// Wait for a precsribed number of milliseconds inside an async function.
//
// This function has to be called with: await sp_timeout(N);
async function sp_timeout(N) {
    await new Promise(function(resolve, reject) {
        setTimeout(resolve, N);
    });
}

async function sp_google_meet_get_participants() {
     let participants = {};

     // In order to get the complete list of participants, we need
     // to scroll the list to the bottom.
     let scrollableElements = document.getElementsByClassName('HALYaf tmIkuc s2gQvd KKjvXb');
     if (scrollableElements.length == 0) {
         return [];
     }

     let se = scrollableElements[0];
     se.scrollTo(0, 0);

     // Wait for the scrolling to happen
     await sp_timeout(500);

     let scrollStep = se.offsetHeight;
     let scrollUnits = 0;

     while (scrollUnits <= se.scrollHeight) {

         // This works for Google Meets. We need to scroll down to get them all. The ID
         // is needed to make sure we do not count someone twice.
         Array.from(document.getElementsByClassName('HEu5Ef sMVRZe')).forEach(function (div) {
             var pid = div.getAttribute('data-participant-id');
             var labels = div.getElementsByClassName('cS7aqe NkoVdd');
             if (labels.length > 0) {
                 var name = labels[0].innerHTML;

                 participants[pid] = {
                   'name': name,
                   'id': pid
                 };
             }
         });

         se.scrollBy(0, scrollStep);
         scrollUnits += scrollStep;

         // Wait for the scrolling to happen
         await sp_timeout(500);
     }

     return participants;
}

async function sp_google_meet_open_sidebar() {
    // For Google Meet, we may try to open the sidebar if we manage
    let sidebar_btns = document.getElementsByClassName(
      'uArJ5e UQuaGc kCyAyd kW31ib foXzLb');

    if (sidebar_btns.length > 0) {
        sidebar_btns[0].click();
    }

    await sp_timeout(500);
}

async function sp_microsoft_teams_open_sidebar() {
    let roster = document.getElementsByTagName('calling-roster')[0];

    if (roster == undefined || roster.classList.contains('ng-hide')) {
        let btn = document.getElementById('roster-button');
        if (btn != undefined) {
          btn.click();
          await sp_timeout(500);
        }
    }
}

async function sp_microsoft_teams_get_participants() {
    let participants = {};

    await sp_microsoft_teams_open_sidebar();

    // This code works for Microsoft Teams
    Array.from(document.getElementsByTagName('li')).forEach(function (ll) {
        let datatid = ll.getAttribute('data-tid');
        if (datatid != null && datatid.includes('participantsInCall')) {
          // Get a unique identified for this participants
          let id_data = ll.getAttribute('id');
          let participant_id = id_data.substr(12); // Skip the prefix

	        let name = datatid.substr(19); // Skip the prefix.

	        participants[participant_id] = {
              'id': participant_id,
              'name': name
          };
        }
    });

    return participants;
}

function sp_trigger_participants_download(participants) {
  let participants_list = "";

  for (var id in participants) {
      participants_list = participants_list + participants[id]['name'] + '\n';
  }

  if (participants_list == "") {
    alert('No participants found!\nPlease check that the sidebar containing the list of participants is open.');
  }
  else {
      sp_trigger_download(participants_list);
  }
}

function sp_trigger_download(content) {
    chrome.runtime.sendMessage(
      {
         action: 'download',
         message: content
      },
      function (response) {
          if (chrome.runtime.lastError) {
            console.log('ERROR: ' + chrome.runtime.lastError);
          }
          else {
            if (response.status != 'completed') {
                console.log('Download failed');
            }
          }
      }
    );
}

async function sp_get_participants() {
  let participants = await sp_microsoft_teams_get_participants();

  // In this case, we try to get participants from Google Meets
  if (Object.keys(participants).length == 0) {
      await sp_google_meet_open_sidebar();
      participants = await sp_google_meet_get_participants();
  }

  return participants;
}

async function sp_download_list() {
    let participants = await sp_get_participants();
    sp_trigger_participants_download(participants);
}

async function sp_update_events() {
    console.log('Running sp_update_event(); monitor = ' + sp_monitor_is_enabled());

    let sp_monitor_events = sp_get_global('sp-monitor-events');

    console.log(sp_monitor_events);
    let sp_monitor_last_participants = sp_get_global('sp-monitor-last-participants');

    if (sp_monitor_is_enabled()) {
        let participants = await sp_get_participants();

        let joined_participants = {};
        let left_participants = {};

        for (var id in participants) {
            if (!(id in sp_monitor_last_participants)) {
                joined_participants[id] = participants[id];
            }
        }

        for (var id in sp_monitor_last_participants) {
            if (! (id in participants)) {
                left_participants[id] = sp_monitor_last_participants[id];
            }
        }

        sp_set_global('sp-monitor-last-participants', participants);

        console.log(joined_participants);
        console.log(left_participants);

        // Add relevant events
        if (Object.keys(joined_participants).length > 0) {
            sp_monitor_events.push({
                'timestamp': new Date(),
                'event': 'join',
                'participants': joined_participants
            });
        }

        if (Object.keys(left_participants).length > 0) {
            sp_monitor_events.push({
                'timestamp': new Date(),
                'event': 'leave',
                'participants': left_participants
            });
        }

        sp_set_global('sp-monitor-events', sp_monitor_events);
    }

    if (sp_monitor_is_enabled()) {
        setTimeout(sp_update_events, 5000);
    }
    else {
        console.log('Preparing data download');
        console.log(sp_monitor_events);
        let content = "";

        for (var event in sp_monitor_events) {
            let data = sp_monitor_events[event];

            if (data['event'] == 'join') {
                content += data['timestamp'].toString() + "\n";
                content += 'The following participants have joined:\n';
                for (var id in data['participants']) {
                    let name = data['participants'][id]['name'];
                    content += '  ' + name + '\n';
                }
                content += "\n\n";
            }

            if (data['event'] == 'leave') {
                content += data['timestamp'].toString() + "\n";
                content += 'The following participants have left:\n';
                for (var id in data['participants']) {
                    let name = data['participants'][id]['name'];
                    content += '  ' + name + '\n';
                }
                content += "\n\n";
            }
        }

        sp_trigger_download(content);
    }
}

async function sp_start_monitor() {
    sp_monitor_set_enabled(true);

    let sp_monitor_last_participants = await sp_get_participants();

    let sp_monitor_events = [{
      'timestamp': new Date(),
      'event': 'join',
      'participants': sp_monitor_last_participants
    }];

    sp_set_global('sp-monitor-last-participants', sp_monitor_last_participants);
    sp_set_global('sp-monitor-events', sp_monitor_events);

    setTimeout(sp_update_events, 2000);
}

async function sp_stop_monitor() {
    sp_monitor_set_enabled(false);
}
