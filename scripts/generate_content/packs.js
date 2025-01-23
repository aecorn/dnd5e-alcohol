import { DRINKS } from "./drinks.js";
import { MONSTERS } from "./monsters.js";
import { FEATS } from "./feats.js";


Hooks.once("ready", async () => {
    console.log("Checking for Alcohol-Themed Compendiums...");

    await ensureCompendium("dnd5e-alcohol", "drinks", "Alcoholic Drinks", "Item");
    await ensureCompendium("dnd5e-alcohol", "monsters", "Alcoholic Monsters", "Actor");
    await ensureCompendium("dnd5e-alcohol", "feats", "Alcohol-Themed Feats", "Item");

    await populateCompendium("dnd5e-alcohol.drinks", DRINKS);
    await populateCompendium("dnd5e-alcohol.monsters", MONSTERS);
    await populateCompendium("dnd5e-alcohol.feats", FEATS);
});

/**
 * Ensures a compendium exists, creating it if necessary.
 */
async function ensureCompendium(namespace, name, label, type) {
    let pack = game.packs.get(`${namespace}.${name}`);

    if (!pack) {
        console.log(`Creating ${label} Compendium...`);
        await CompendiumCollection.createCompendium({
            label: label,
            name: name,
            type: type,
            package: namespace
        });

        pack = game.packs.get(`${namespace}.${name}`);
        if (!pack) {
            console.error(`Failed to create ${label} Compendium.`);
            return;
        }
    }
    console.log(`${label} Compendium found.`);
}

/**
 * Populates a compendium with items if they are missing.
 */
async function populateCompendium(packName, dataList) {
    const pack = game.packs.get(packName);

    /* Unlock pack */

    if (!pack) {
        console.error(`Compendium '${packName}' not found.`);
        return;
    }

    const existingItems = await pack.getDocuments();
    let existingNames = new Set(existingItems.map(item => item.name));

    for (let data of dataList) {
        if (existingNames.has(data.name)) continue; // Skip if already exists

        if (data.type === "npc") {
            await Actor.create(data, { pack: packName });
        } else if (data.type === "consumable" || data.type === "feat") {
            await Item.create(data, { pack: packName });
        } else {
            console.error(`Invalid data type for ${data.name}`);
            continue;
        }
        console.log(`Added ${data.name} to ${packName}`);
    }

    /* Lock pack */

    ui.notifications.info(`${pack.metadata.label} updated with new content!`);
}