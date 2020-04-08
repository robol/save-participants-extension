// This script is used to obtain the call object from the Angular
// controller in the page

function sp_microsoft_teams_get_call_handler() {
    let call = null;

    try {
        let stage = angular.element(
            document.getElementsByTagName('calling-stage')[0]
        );
        let controller = stage.controller();

        call = controller.call;
    } catch {
        call = null;
    }

    // Get participants
    let participants = {};

    if (call != null) {
        // Find myself first
        let myself = call.currentUserSkypeIdentity;
        participants[myself.id] = {
            'name': myself.displayName,
            'id': myself.id
        };

        // And then the others
        for (i = 0; i < call.participants.length; i++) {
            let user = call.participants[i];
            participants[user.id] = {
                'id': user.id,
                'name': user.displayName
            };
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