function add_tipsy(token){
    if (!token) {
        ui.notifications.warn("Please select a token.");
    } else {
        let tipsyEffect = {
            name: "Tipsy",
            id: "dnd5e-alcohol-tipsy", // Use the unique ID from your system
            icon: "icons/svg/daze.svg",
            statuses: ["tipsy"],
            changes: [], // Add any mechanical changes here if needed
            duration: {
                rounds: null, // Adjust duration as needed
                seconds: null
            },
            transfer: false, // Adjust transferability
            origin: null, // You can specify an origin if required
            disabled: false, // Ensure the effect is active
            tint: "#ffffff" // Optional: visual tint
        };
    
        let existingEffect = token.actor.effects.find(e => e.label === "Tipsy");
    
        if (existingEffect) {
            ui.notifications.info("The actor already has the 'Tipsy' condition.");
        } else {
            // Apply the effect
            token.actor.createEmbeddedDocuments("ActiveEffect", [tipsyEffect]).then(() => {
                console.log("Added 'Tipsy' condition to the actor.");
            }).catch(err => {
                console.error("Failed to apply the 'Tipsy' effect:", err);
            });
        }
    }
}

function add_drunk(token){
    if (!token) {
        ui.notifications.warn("Please select a token.");
    } else {
        let tipsyEffect = {
            name: "Drunk",
            id: "dnd5e-alcohol-drunk", // Use the unique ID from your system
            icon: "icons/svg/stoned.svg",
            statuses: ["drunk"],
            changes: [], // Add any mechanical changes here if needed
            duration: {
                rounds: null, // Adjust duration as needed
                seconds: null
            },
            transfer: false, // Adjust transferability
            origin: null, // You can specify an origin if required
            disabled: false, // Ensure the effect is active
            tint: "#ffffff" // Optional: visual tint
        };
    
        let existingEffect = token.actor.effects.find(e => e.label === "Drunk");
    
        if (existingEffect) {
            ui.notifications.info("The actor already has the 'Drunk' condition.");
        } else {
            // Apply the effect
            token.actor.createEmbeddedDocuments("ActiveEffect", [tipsyEffect]).then(() => {
                console.log("Added 'Drunk' condition to the actor.");
            }).catch(err => {
                console.error("Failed to apply the 'Drunk' effect:", err);
            });
        }
    }
}

function add_incapacitated(token){

}

function remove_cond(token, condition_name){
    if (!token) {
        ui.notifications.warn("Please select a token.");
    } else {
        // Find the effect by label
        let effect = token.actor.effects.find(e => e.label === condition_name);
    
        if (effect) {
            effect.delete().then(() => {
                console.log(`Removed '${condition_name}' condition from the actor.`);
            }).catch(err => {
                console.error("Failed to remove effect:", err);
            });
        } else {
            ui.notifications.info(`The actor does not have the '${condition_name}' condition.`);
        }
    }
}

