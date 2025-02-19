import {add_empty_effect_actor} from "./drinking.mjs";

export async function update_drunkards_third_leg(actor, addEffects) {
    let existingEffect = actor.effects.find(e => e.name.toLowerCase() === "drunkard's third leg");
   
    if (!actor.items.some(item => item.name.toLowerCase() === "drunkard's third leg")) {
        existingEffect?.delete();
        return;
    }

    let item = actor.items.find(item => item.name.toLowerCase() === "drunkard's third leg");

 
    console.log("Drunkard's Third Leg is attuned and equipped.");
    // Calculate new speed value per movement
    let intoxicatedStates = new Set(["tipsy", "drunk", "wasted"]);
    let speed_bonus = 5 * ([...addEffects].filter(effect => 
        intoxicatedStates.has(effect.toLowerCase())
    ).length || 0);

    console.log("Speed bonus is", speed_bonus);

   // Item must be attuned and equipped
   if ((item.system.attuned || item.system.attunement === 2) && item.system.equipped) {
        // proceed
    } else {
        console.log("Drunkard's Third Leg is not attuned or equipped.");
        if (existingEffect){existingEffect?.delete()};
        return;
    }
    // If speed bonus is 0, remove the effect if it exists
    if (speed_bonus === 0) {
        if (existingEffect) {
            console.log("Removing effect because speed bonus is 0.");
            await existingEffect.delete();
        }
        return; // Exit early since no effect should be applied
    }

    // If an effect exists and already has the correct speed bonus, do nothing
    if (existingEffect) {
        let currentBonus = existingEffect.changes.find(c => c.key.startsWith("system.attributes.movement"));
        if (currentBonus && Number(currentBonus.value) === speed_bonus) {
            console.log("Effect already has correct speed bonus, no update needed.");
            return;
        }
        console.log("Removing outdated effect to apply new bonus.");
        await existingEffect.delete();
    }

    // Create active effect with new speed value
    let changes = [];
    for (let key in actor.system.attributes.movement) {
        let speed = actor.system.attributes.movement[key];
        if (Number.isInteger(speed) && speed > 0) {
            console.log("Actually adding movement speed bonus.", speed + speed_bonus);
            changes.push({
                key: `system.attributes.movement.${key}`,
                mode: 2, // Add mode
                value: speed_bonus
            });
        }
    }

    let description = `While you have the tipsy condition, your speed increases by 5 feet. It increases again when you have the drunk condition and again when you have the wasted condition. Your alcohol level does not inflict a penalty to attacks with this weapon.`;

    await add_empty_effect_actor(actor, "Drunkard's Third Leg", description, changes);
}