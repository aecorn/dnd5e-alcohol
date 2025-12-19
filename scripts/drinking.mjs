import { decrease_inebriation_points, add_inebriation_points } from "./inebriation_points.mjs";



// Fast forward application of alcoholic effects?
Hooks.on("dnd5e.postActivityConsumption", async (activity, hm, chatmsgdata) => {

    let actor = activity.actor;
    let alco_effects = activity.effects.filter(effect => 
        effect.effect.name.toLowerCase().startsWith("alcohol -")
    );
    if (alco_effects.length === 0){
        return;
    }
    let alco_effect = alco_effects[0].effect;

    actor.createEmbeddedDocuments("ActiveEffect", [alco_effect]);


    // Exit if this is not drinking a potion?
    if (chatmsgdata.data.flags.dnd5e.activity.type != "utility"){return;}
    if (chatmsgdata.data.flags.dnd5e.item.type != "consumable"){return;}
    if (chatmsgdata.data.flags.dnd5e.messageType != "usage"){return;}

    // We are sort of replacing the old chatmessage with our own, so we want to stop the default one.
    // This data is passed to the chatmessage creation, we hook into that below
    chatmsgdata.create = false;
    chatmsgdata.data.flags.delchatmessage = true;
});


// Stop initial chatmessage from system for drinking a drink
Hooks.on("preCreateChatMessage", (chatMessage) => {
    //console.log("Trying to delete chatmessage", chatMessage);
    let delchatflag = chatMessage.flags?.delchatmessage || false;
    //console.log("Delchatflag is", delchatflag);
    if (delchatflag === true){
        return false;
    }
    
});



Hooks.on("preCreateActiveEffect", async (effect, options, userId) => {
    let effectName = effect.name.toLowerCase();
    let actor = effect.parent;
    //console.log(effectName);
    //console.log(effect);
    //console.log(options);

    if (!effectName.startsWith("alcohol -")) {
        //console.log("Not an alcohol effect. Exiting.");
        return;  // Stops execution but allows the system to proceed normally.
    }
    

    let [potency, properties] = extract_potency_properties_from_name(effectName);

    let skipchatcard = game.settings.get('dnd5e-alcohol', 'skipConRollInebriation');
    if (skipchatcard){
        if (properties.map(p => p.toLowerCase()).includes("sobering")) {
            await decrease_inebriation_points(actor, potency);
        } else {
            await add_inebriation_points(actor, potency);
        }

        await apply_alcohol_properties_to_actor(actor, properties);
        return false;
    }

    create_alcohol_chat_message_for_actor(actor, potency, properties);
    return false;
    
});




export function extract_potency_properties_from_name(effectName){
    // Extract potency and properties
    let potency = 0;
    let properties = [];

    // Remove "Alcohol -" prefix and split the rest
    let parts = effectName.toLowerCase().replace("alcohol -", "").trim().split(" - ");

    for (let i = 0; i < parts.length; i++) {
        if (parts[i].toLowerCase().startsWith("potency ")) {
            let potencyValue = parts[i].toLowerCase().replace("potency ", "").trim();
            potency = parseInt(potencyValue, 10) || 0; // Ensure a valid number, default to 0
        } else {
            properties.push(parts[i]); // Collect the rest as properties
        }
    }
    return [potency, properties];
}


export async function create_alcohol_chat_message_for_actor(actor, potency, properties, prefix=""){
    let inebriation_points = await actor.getFlag("dnd5e-alcohol", "inebriation") || 0;
    
    let dc = 10 + potency + Math.floor(inebriation_points / 2);

    let save = `[[/save ability=con dc=${dc}]]`;

    // If actor has feat Temperance of Mind, we will see if wisdom is a better ability to save with
    if (actor.items.some(item => item.name.toLowerCase() == "temperance of mind")){
        if (actor.system.abilities.wis.value > actor.system.abilities.con.value){
            save = `[[/save ability=wis dc=${dc}]] (wis because of Temperance of Mind)`;
        } 
    }

    let content = `${prefix}
        Potency of drink: <strong>${potency}</strong><br>
        Extra properties: ${properties.join(", ")}<br>
        Pre-existing inebriation level: <strong>${inebriation_points}</strong><br>
        <b>${actor.name}</b> make a ${save} save to avoid inebriation.<br><br>
        You can choose to fail the test automatically.<br>
        If you fail the test, apply the inebriation points and effects (Sobering drinks will subtract inebriation points):
        <button class="apply-inebriation" data-actor-id="${actor.id}" data-potency="${potency}" data-properties="${properties.join(' - ')}">Apply Inebriation</button>
        `;

    // Add extra button to autofail if has Racial property + actor has related race -> one less potency
    let race = extract_race_from_racial_property(properties);
    if (race != null){
        // Check i actor has same race
        let race_name = actor.system.details?.race?.name || "Human";  // Sad human default
        if (race_name.toLowerCase().includes(race.toLowerCase())) {
            content += `<button class="apply-inebriation" data-actor-id="${actor.id}" data-potency="${potency-1}" data-properties="${properties.join(' - ')}">Fail on Purpose (1 less inebriation points because of racial property)</button>`;
        }
    }

    let chatData = {
              user: game.user._id,
              speaker: ChatMessage.getSpeaker(),
              content: content 
          };
    ChatMessage.create(chatData, {});

  };


  function extract_race_from_racial_property(properties){
    let racialProperty = properties.find(prop => prop.toLowerCase().startsWith("racial"));
    if (racialProperty) {
        // Extract the race using a regular expression
        let match = racialProperty.match(/\(([^)]+)\)/);
        if (match) {
            return match[1]; // Capture the race inside the parentheses
        }
    }
    return null;
  }


// renderChatMessageHTML for foundryvtt 13?
// dnd5e.renderChatMessage for foundryvtt 12?
Hooks.once("ready", () => {
    if (game.release.generation <= 12) {
        Hooks.on("dnd5e.renderChatMessage", (message, html) => {
            add_event_listeners_to_chat_message(html);
        });
    } else if (game.release.generation >= 13) {
        Hooks.on("renderChatMessageHTML", (message, html, data) => {
            add_event_listeners_to_chat_message(html);
        });
    }
});

function add_event_listeners_to_chat_message(html){
    html.querySelectorAll(".apply-inebriation").forEach((button) => {
        button.addEventListener("click", async (event) => {
            console.log("Apply inebriation clicked");
            event.preventDefault();

            const actorId = event.currentTarget.dataset.actorId;
            const potency = parseInt(event.currentTarget.dataset.potency);
            const properties = event.currentTarget.dataset.properties.split(" - ");
            const actor = game.actors.get(actorId);

            event.currentTarget.disabled = true;

            if (!actor) {
                console.error("Actor not found.");
                return;
            }

            if (properties.map(p => p.toLowerCase()).includes("sobering")) {
                await decrease_inebriation_points(actor, potency);
            } else {
                await add_inebriation_points(actor, potency);
            }

            await apply_alcohol_properties_to_actor(actor, properties);
        });
    });
}



async function apply_alcohol_properties_to_actor(actor, properties){
    //console.log("Trying to apply extra properties:");
    //console.log(properties);
    // If the actor already has one of the traits active, remove it first
    let effectsToDelete = actor.effects.filter(effect => 
        effect.name.toLowerCase().startsWith("alcohol property -")
    );
    if (effectsToDelete.length > 0) {
        await actor.deleteEmbeddedDocuments("ActiveEffect", effectsToDelete.map(e => e.id));
    }

    // If there are no properties to apply, exit early
    if (properties.length === 0){
        return;
    }
    // If the Actor does not have the Drunk condition, they do not get the special properties / traits
    // Better to calculate Drunk threshold, because of async nature?
    if (!(actor.effects.some(effect => effect.name === "Drunk"))){
        //console.log("The character is not drunk?");
        return;
    };

    // Dangerous
    if (properties.map(p => p.toLowerCase()).includes("dangerous")){
        let changes = [
            {
              "key": "system.bonuses.mwak.damage",
              "mode": 2,
              "value": "2",
              "priority": 20
            }
          ];
          await add_empty_effect_actor(
            actor, 
            "Alcohol Property - Dangerous", 
            "Dangerous adds a +2 bonus to your melee weapon damage.",
            changes);
    }
    // Disarming
    if (properties.map(p => p.toLowerCase()).includes("disarming")){
        //console.log("Want to apply disarming");
        // Look for Racial
        let race_drink = extract_race_from_racial_property(properties);
        let race_char = actor.system.details.race?.name;
        if (race_drink != null & race_char != null){
            // Check i actor has same race (only impose disadvantage if racial does not match actor)
            console.log(actor);
            
            //console.log(race_name);
            if (!(race_char.toLowerCase().includes(race_drink.toLowerCase()))) {
                // Disadvantage on perception 
                //console.log("Making changes.");
                let changes = [
                    {
                      "key": "system.skills.prc.bonuses.check",
                      "mode": 2,
                      "value": "-5",
                      "priority": 20
                    }
                  ];
                  await add_empty_effect_actor(
                    actor,
                    "Alcohol Property - disarming",
                    "Disarming gives a -5 bonus to your perception checks while active.",
                    changes);
            }
        }
    }
    
    // Infatuating
    if (properties.map(p => p.toLowerCase()).includes("infatuating")){
        // Check for Fey Ancestry in actor
        if (!actor.items.some(item => item.name === "Fey Ancestry")){
            let changes = [
                {
                  "key": "system.abilities.cha.bonuses.save",
                  "mode": 2,
                  "value": "-2",
                  "priority": 20
                },
                {
                  "key": "system.abilities.wis.bonuses.save",
                  "mode": 2,
                  "value": "-2",
                  "priority": 20
                }
              ];
            await add_empty_effect_actor(
                actor, 
                "Alcohol Property - Infatuating", 
                "Infatuating gives a -2 to charisma and wisdom saves.",
                changes);
        } else {
            console.log("Wont apply Infatuating, because of Fey Ancestry.");
        }
    }

    //  Wild Magic
    if (properties.map(p => p.toLowerCase()).includes("wild magic")){
        
        const tableWild = await fromUuid("Compendium.dnd5e-alcohol.alcohol-rollable.RollTable.RQFzDZ09f5dFJgEI");
        const drawOptions = {
            displayChat: false,
            replacement: false
          };
        let { results } = await tableWild.draw(drawOptions);
        let result_text = results[0].text
        let content = 'Wild Magic results:<br><strong><p style="color: red;">' + result_text + `</p></strong><br><br>Characters with the Alcohol Property - Wild Magic trait, roll on the Wild Magic table, and will keep the effect they roll as long as they have the wild magic effect. (As long as it has a duration / applies some physical change (damage, summons are not reversed for example).)`;
        await add_empty_effect_actor(
            actor, 
            "Alcohol Property - Wild Magic", 
            `Drinker has effect from Wild magic table: <strong><p style="color: red;">${result_text}</p></strong>`,
            undefined
            );
        let chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: content 
        };
        await ChatMessage.create(chatData, {});

        // Autoroll on the Wild Magic table and show the GM only?
    }
}

export async function add_empty_effect_actor(actor, effectName, description = "", changes = undefined){
    let existingEffect = actor.effects.find(e => e.name === effectName);
    if (existingEffect) return; // Prevent duplicates

    let effect = {
        name: effectName,
        icon: "icons/svg/down.svg",
        origin: `dnd5e-alcohol-${effectName.toLowerCase()}`,
        disabled: false,
        duration: {},
        changes: changes,
        description: description,
    }
    // undefined + empty object causes error in v11
    if (changes === undefined){
        delete effect.changes;
    }

    await actor.createEmbeddedDocuments("ActiveEffect", [effect]);
}


// When the Drunk condition is removed, remove any active traits
Hooks.on("preDeleteActiveEffect", async (effect) => {
    if (effect.name != "Drunk"){
        return;
    }
    let actor = effect.parent;
    let effectsToDelete = actor.effects.filter(effect => 
        effect.name.toLowerCase().startsWith("alcohol property -")
    );
    await actor.deleteEmbeddedDocuments("ActiveEffect", effectsToDelete.map(e => e.id));

});
