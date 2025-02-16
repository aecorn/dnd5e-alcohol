import { extract_potency_properties_from_name, create_alcohol_chat_message_for_actor} from "../drinking.mjs";
import { isOverlapping} from "./trail.mjs";



// Keg golems have an aura of 5 feet of intoxicating fumes (triggers on start of turn)
Hooks.on("combatTurnChange", async (combat) => {
    //console.log(combat);
    // Find Keg Golems in combat
    let featureName = "alcoholic fumes";
    let fume_combatants = combat.turns.filter(combatant => 
        combatant.actor.items.some(item => 
            item.name.toLowerCase().startsWith(featureName)));
    // Exit if no Keg Golems
    if (fume_combatants.length === 0){return;}

    // Exit if current combatant has feature
    let combatant = combat.turns[combat.turn];
    if (combatant.actor.items.some(item => item.name.toLowerCase().startsWith(featureName))){return;};

    // Combatant with turns area
    let size = canvas.dimensions.size;
    let token = combatant.token;
    let tokenArea = [
        [token.x, token.y],
        [token.x + token.width, token.y],
        [token.x + token.width, token.y + token.height],
        [token.x, token.y + token.height]
    ];

    // Look if the combatant is next to each golem
    for (let enemy of fume_combatants) {

        // We are looking at neighbouring squares if not a swarm, if swarm just in the monsters square.
        let isSwarm = enemy.actor.items.filter(
            item => item.name.toLowerCase().startsWith("alcoholic fumes")).some(
                item => item.name.includes("(in space)"));
        let fumeArea = [];
        if (isSwarm){
            fumeArea = [
                [enemy.token.x, enemy.token.y],
                [enemy.token.x + enemy.token.width, enemy.token.y],
                [enemy.token.x + enemy.token.width, enemy.token.y + enemy.token.height],
                [enemy.token.x, enemy.token.y + enemy.token.height]

            ];
        } else {
            fumeArea = [
                [enemy.token.x-size, enemy.token.y-size],
                [enemy.token.x + enemy.token.width+size, enemy.token.y-size],
                [enemy.token.x + enemy.token.width+size, enemy.token.y + enemy.token.height + size],
                [enemy.token.x - size, enemy.token.y + enemy.token.height + size]

            ];
        }
        if (isOverlapping(fumeArea, tokenArea, 0)){
            //console.log(`${token.name} is inside a ${enemy.name}'s fume area!`);
            let drink = random_alcohol_effect_in_inventory(enemy.actor);
            //console.log(`Applying highest potency drink effect:`, drink);
            let [potency, properties] = extract_potency_properties_from_name(drink);
            //console.log(combatant.actor);
            await create_alcohol_chat_message_for_actor(combatant.actor, potency, properties, 
                `${token.name} started their turn in the ${enemy.name}'s fume area! <span style="color:red">They are subject to one of the boozes its carrying!</span> <br>`);
        }
    }
});


function random_alcohol_effect_in_inventory(actor){
    let alcoholItems = actor.items.contents.filter(
        item => item?.effects.contents?.some(
            cont => cont.name.toLowerCase().startsWith("alcohol -")));
    //console.log(alcoholItems);
    let alcoholEffects = alcoholItems.map(item => item?.effects.contents[0]?.name);
    //console.log(alcoholEffects);
    let pickedName = alcoholEffects[Math.floor(Math.random() * alcoholEffects.length)];
    return pickedName;
}

function highest_potency_effect_in_inventory(actor){
    let max_potency = 0;
    let max_drink = "Alcohol - Potency 0";
    for (const item_index in actor.items.contents){
        let actor_item = actor.items.contents[item_index]
        //console.log(actor_item);
        let effects = actor_item?.effects;
        //console.log(effects);
        if (effects != undefined){
            if(effects.contents.length === 0){continue;}
            let effectName = effects.contents[0]?.name;
            //console.log(effectName);
            let match = effectName.match(/Potency (\d+)/);
            let potency = match ? parseInt(match[1], 10) : null;
            if (potency > max_potency){
                max_potency = potency;
                max_drink = effectName;
            }
        }
    }
    return max_drink;
}