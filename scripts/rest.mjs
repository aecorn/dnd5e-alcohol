import { reset_inebriation } from "./inebriation_points.mjs";
import { refresh_conditions } from "./conditions.mjs";


async function short_rest_reduces_inebriation(actor) {
    let inebriation = await actor.getFlag("dnd5e-alcohol", "inebriation") || 0;

    if (inebriation > 0) {
        let newInebriation = Math.max(0, inebriation - 1);
        await actor.setFlag("dnd5e-alcohol", "inebriation", newInebriation);
        refresh_conditions(actor);
        ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor }),
            content: `<b>${actor.name}'s inebriation level has decreased by 1 to ${newInebriation} because of a short rest.</b>`,
            type: CONST.CHAT_MESSAGE_STYLES.OTHER
        });

        console.log(`${actor.name} short rested. Inebriation reduced to ${newInebriation}.`);
    }
}


  Hooks.on("dnd5e.preLongRest", async (actor) => {
    let isWasted = await actor.getFlag("dnd5e-alcohol", "wasted_active") || false;
    //console.log(`Pre-rest hook for ${actor.name}. Checking for wasted state: ${isWasted}`);
    if (!isWasted) return;
    // If actor has the Deep Gut feat, they cannot fail this: exit
    if (actor.items.some(item => item.name.toLowerCase() == "deep gut")){return;}

    let alcoholLevel = await actor.getFlag("dnd5e-alcohol", "inebriation") || 0;

    let roll = await new Roll(`1d20 + @abilities.con.save`, actor.getRollData()).evaluate();
    //console.log(roll);
    await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor }),
        flavor: `<b>Wasted - Long Rest Constitution Save</b>: DC ${alcoholLevel} to gain benefits`
    });

    if (roll.total < alcoholLevel) {
        await actor.setFlag("dnd5e-alcohol", "failed_rest", true);
        ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor }),
            content: `<b>${actor.name} fails to rest properly due to extreme intoxication!</b><br>
                      They do not gain the benefits of their long rest (Like HP, hit dice, spell slots etc). 
                      But the alcohol-induced effects are removed.`,
            type: CONST.CHAT_MESSAGE_STYLES.OTHER
        });
    } else {
        await actor.setFlag("dnd5e-alcohol", "failed_rest", false);
    }
});

Hooks.on("dnd5e.preRestCompleted", async (actor, data) => {
    // To support Rest Recovery module we can do it in this hook instead?
    console.log(data);
    if (data.type === "long"){
        await reset_inebriation(actor);
    } else if (data.type === "short"){
        await short_rest_reduces_inebriation(actor);
    }

    if (await actor.getFlag("dnd5e-alcohol", "failed_rest")) {

        //console.log("Rest failed");
        //console.log(data);

        // Prevent HP Recovery
        data.deltas.hitPoints = 0;
        data.updateData["system.attributes.hp.value"] = actor.system.attributes.hp.value;

        // Prevent Spell Slot Recovery
        for (let i = 1; i <= 9; i++) {
            if (data.updateData[`system.spells.spell${i}.value`] !== undefined) {
                data.updateData[`system.spells.spell${i}.value`] = actor.system.spells[`spell${i}`]?.value || 0;
            }
        }
        if (data.updateData["system.spells.pact.value"] !== undefined) {
            data.updateData["system.spells.pact.value"] = actor.system.spells.pact?.value || 0;
        }

        // Prevent Hit Dice Recovery
        data.deltas.hitDice = 0;

        // Block Full Rest Effects
        data.longRest = false; // Prevents system applying long rest mechanics

        // Remove the failed_rest flag after blocking the rest
        await actor.unsetFlag("dnd5e-alcohol", "failed_rest");


  

        return false; // Stops normal long rest processing
    }
});