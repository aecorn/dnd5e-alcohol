import { extract_potency_properties_from_name, create_alcohol_chat_message_for_actor} from "../drinking.js";



// Keg golems have an aura of 5 feet of intoxicating fumes (triggers on start of turn)
Hooks.on("combatTurnChange", async (combat) => {
    
    // Find Keg Golems in combat
    let keg_golems = combat.turns.filter(combatant => 
        combatant.name.toLowerCase() === "keg golem"
    );
    // Exit if no Keg Golems
    if (keg_golems.length === 0){return;}

    // Exit if current combatant is a keg golem
    let combatant = combat.turns[combat.turn];
    if (combatant.name.toLowerCase() === "keg golem"){return;}

    // Combatant with turns area
    let size = canvas.dimensions.size;
    let token = combatant.token;
    let tokenArea = {
        x1: token.x,
        y1: token.y,
        x2: token.x + (token.width * size),
        y2: token.y + (token.height * size)
    };
    console.log(tokenArea);
    console.log(token.x, token.y, token.width);

    // Look if the combatant is next to each golem
    for (const golem of keg_golems) {
        let golemToken = golem.token; // Get the token object
        let fume_area = {
            x1: golemToken.x - 1*size,
            y1: golemToken.y - 1*size,
            x2: golemToken.x + 3*size,
            y2: golemToken.y + 3*size
        };
        if (isOverlapping(fume_area, tokenArea)){
            console.log(`${token.name} is inside a Keg Golem's fume area!`);
            let drink = highest_potency_effect_in_inventory(golem.actor);
            console.log(`Applying highest potency drink effect:`, drink);
            let [potency, properties] = extract_potency_properties_from_name(drink);
            create_alcohol_chat_message_for_actor(combatant.actor, potency, properties);
        }
    }
});