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
        let drunkEffect = {
            name: "Drunk",
            id: "dnd5e-alcohol-drunk", // Use the unique ID from your system
            icon: "icons/svg/down.svg",
            statuses: ["drunk"],
            changes: [
                { key: "system.bonuses.mwak.attack", mode: CONST.ACTIVE_EFFECT_MODES.DOWNGRADE, value: "2", priority: 30 },
                { key: "system.bonuses.msak.attack", mode: CONST.ACTIVE_EFFECT_MODES.DOWNGRADE, value: "2", priority: 30 },
                { key: "system.bonuses.rwak.attack", mode: CONST.ACTIVE_EFFECT_MODES.DOWNGRADE, value: "2", priority: 30 },
                { key: "system.bonuses.rsak.attack", mode: CONST.ACTIVE_EFFECT_MODES.DOWNGRADE, value: "2", priority: 30 },
                { key: "system.abilities.int.save", mode: CONST.ACTIVE_EFFECT_MODES.DOWNGRADE, value: "2", priority: 30 },
                { key: "system.abilities.wis.save", mode: CONST.ACTIVE_EFFECT_MODES.DOWNGRADE, value: "2", priority: 30 },
                { key: "system.abilities.int.check", mode: CONST.ACTIVE_EFFECT_MODES.DOWNGRADE, value: "2", priority: 30 },
                { key: "system.abilities.wis.check", mode: CONST.ACTIVE_EFFECT_MODES.DOWNGRADE, value: "2", priority: 20 }
            ],
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
            token.actor.createEmbeddedDocuments("ActiveEffect", [drunkEffect]).then(() => {
                console.log("Added 'Drunk' condition to the actor.");
            }).catch(err => {
                console.error("Failed to apply the 'Drunk' effect:", err);
            });
        }
    }
}

function add_wasted(token){
    if (!token) {
        ui.notifications.warn("Please select a token.");
    } else {
        let wastedEffect = {
            name: "wasted",
            id: "dnd5e-alcohol-wasted", // Use the unique ID from your system
            icon: "icons/svg/stoned.svg",
            statuses: ["wasted"],
            changes: [],
            duration: {
                rounds: null, // Adjust duration as needed
                seconds: null
            },
            transfer: false, // Adjust transferability
            origin: null, // You can specify an origin if required
            disabled: false, // Ensure the effect is active
            tint: "#ffffff" // Optional: visual tint
        };
    
        let existingEffect = token.actor.effects.find(e => e.label === "Wasted");
    
        if (existingEffect) {
            ui.notifications.info("The actor already has the 'Wasted' condition.");
        } else {
            // Apply the effect
            token.actor.createEmbeddedDocuments("ActiveEffect", [wastedEffect]).then(() => {
                console.log("Added 'Wasted' condition to the actor.");
            }).catch(err => {
                console.error("Failed to apply the 'Wasted' effect:", err);
            });
        }
    }
}

function add_incapacitated(token){
    game.clt.applyCondition("Incapacitated", token.actor, {allowDuplicates: false, replaceExisting: true});
    // Roll to see if player starts death saves?
}
function add_poisoned(token){
    game.clt.applyCondition("Poisoned", token.actor, {allowDuplicates: false, replaceExisting: true});
}

function remove_condition(token, condition_name){
    if (!token) {
        ui.notifications.warn("Please select a token.");
    } else {
        game.clt.removeCondition(condition_name, token.actor)
    }
}

