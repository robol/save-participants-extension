// This script is used to obtain the call object from the Angular
// controller in the page

async function sp_microsoft_teams_get_call_handler() {
    let call = null;
    let peopleService = null;

    try {
        let stage = angular.element(
            document.getElementsByTagName('calling-stage')[0]
        );
        let controller = stage.controller();
        call = controller.call;
        peopleService = controller.$scope.app.peopleService;
    } catch {
        call = null;
    }

    // Get participants
    let participants = {};

    if (call != null) {
        // Find myself first
        let myself = call.currentUserSkypeIdentity;
        let mymri = call.callerMri;
        participants[mymri] = {
            'name': myself.displayName,
            'id': mymri
        };

        // And then the others
        for (i = 0; i < call.participants.length; i++) {
            let user = call.participants[i];
            participants[user.mri] = {
                'id': user.mri,
                'name': user.displayName
            };
        }

        // The others have the MRI as id, so we can use it to
        // get the complete profiles
        let mris = Object.keys(participants);
        let profiles = await peopleService.getAllPeopleProfile(mris);

        // Add the profiles to the participants
        for (i = 0; i < profiles.length; i++) {
            if (participants.hasOwnProperty(profiles[i].mri)) {
                participants[profiles[i].mri].profile = profiles[i];
            }
        }
    }

    let event = new CustomEvent('sp_microsoft_teams_get_call', {
        detail: {
            'participants': participants
        }
    });

    document.dispatchEvent(event);
};

sp_microsoft_teams_get_call_handler();