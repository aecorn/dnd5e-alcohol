const DRINKS_PRE = [
    { name: "Common Ale", potency: 1, properties: [], img: "icons/consumables/drinks/alcohol-beer-mug-yellow.webp", weight: 1, price: 2 },
    { name: "Stout Ale", potency: 2, properties: [], img: "icons/consumables/drinks/alcohol-beer-stein-wooden-brown.webp", weight: 1, price: 4 },
    { name: "Dwarven Ale",
        potency: 3,
        properties: ["Racial (Dwarf)"],
        img: "icons/consumables/drinks/alcohol-beer-stein-wooden-metal-brown.webp",
        weight: 1.5,
        price: 6,
        description: "Dwarven Ale. Known primarily to Mountain Dwarves and communities friendly to them, Dwarven Ale is renown for being the strongest brews known to the civilized races. There is a strong, almost bitter taste that bites the throat and punches the stomach of the weaker races.",
    },
    
    { name: "Common Wine", potency: 1, properties: [], img: "icons/consumables/drinks/wine-bottle-glass-white.webp", weight: 2, price: 5 },
    { name: "Mead", potency: 1, properties: ["Racial (Human)"], img: "icons/consumables/drinks/pitcher-dripping-white.webp", weight: 2, price: 6 },
    { name: "Aged Wine", potency: 2, properties: [], img: "icons/consumables/drinks/wine-amphora-cup-gray.webp", weight: 2.5, price: 12 },
    { name: "Elven Wine",
        potency: 3,
        properties: ["Racial (Elf)", "Infatuating"],
        img: "icons/consumables/drinks/wine-amphora-clay-pink.webp",
        weight: 1.8,
        price: 20,
        description: "Elven Wine. Elven Wines are some of the fanciest, most cultured alcohols spread wide with every community who trades with them...",
    },
    { name: "Orcish Wine",
        potency: 3,
        properties: ["Racial (Orc)", "Dangerous"],
        img: "icons/consumables/drinks/wine-amphora-clay-red.webp",
        weight: 2.2,
        price: 15,
        description: "Orcish Wine. Orcs typically aren't a race known for their wines, but that's all because of prejudice...",
    },
    
    { name: "Water",
        potency: 1,
        properties: ["Sobering"],
        img: "icons/consumables/drinks/water-jug-clay-brown.webp",
        weight: 2,
        price: 0.5,
        description: "Sobering: Rather than add to your Alcohol Level, you instead subtract this drink's Potency from your Alcohol Level.",
    },
    { name: "Brandy", potency: 2, properties: [], img: "icons/consumables/drinks/alcohol-jug-spirits-brown.webp", weight: 1.5, price: 10 },
    { name: "Gin", potency: 2, properties: [], img: "icons/consumables/drinks/alcohol-spirits-bottle-blue.webp", weight: 1.5, price: 12 },
    { name: "Halfling Tea",
        potency: 2,
        properties: ["Racial (Halfling)", "Disarming"],
        img: "icons/consumables/drinks/tea-jug-glowing-brown-pink.webp",
        weight: 0.8,
        price: 8,
        description: "Halfling Tea. These herbal concoctions aren't called any alcoholic name so many people tend to forget how potent they are...",
    },
    { name: "Tequila", potency: 2, properties: [], img: "icons/consumables/drinks/wine-amphora-clay-gray.webp", weight: 1.5, price: 10 },
    { name: "Vodka", potency: 2, properties: [], img: "icons/consumables/drinks/alcohol-jar-spirits-gray.webp", weight: 1.5, price: 10 },
    { name: "Whiskey", potency: 2, properties: [], img: "icons/consumables/drinks/tea-jug-gourd-brown.webp", weight: 1.5, price: 15 },
    { name: "Gnomish Whiskey",
        potency: 3,
        properties: ["Racial (Gnome)", "Wild Magic"],
        img: "icons/consumables/drinks/alcohol-spirits-bottle-green.webp",
        weight: 1.3,
        price: 18,
        description: "Gnomish Whiskey. Forest Gnomes don't have the facilities or attention span to brew whiskey the regular way...",
    },
    { name: "Draconic Tequila", 
        potency: 3, 
        properties: ["Racial (Dragonborn)"], 
        img: "icons/consumables/drinks/clay-jar-glowing-orange-blue.webp",
        weight: 1.4,
        price: 22,
        description: "Each race of dragon and their followers brew it to taste specific to a breed of dragon...",
    }
];


export const DRINKS = processDrinks(DRINKS_PRE);

/**
 * Postprocesses the DRINKS array into a format compatible with Foundry's compendium.
 */
function processDrinks(drinks) {
    return drinks.map(drink => ({
        name: drink.name,
        type: "consumable",
        img: drink.img,
        system: {
            consumableType: "potion",
            description: {
                value: `<p><b>Potency:</b> ${drink.potency}</p>
                        <p><b>Properties:</b> ${drink.properties.join(", ") || "None"}</p>
                        ${drink.description ? `<p><b>Description:</b> ${drink.description}</p>` : ""}`
            },
            rarity: "common",
            weight: drink.weight || 1, // Default weight: 1 lb
            price: { value: drink.price || 5, denomination: "gp" }, // Default price: 5 gp
            actionType: "consume",
            uses: {
                value: 1,
                max: 1,
                per: "charges",
                autoDestroy: true
            },
            consume: {
                type: "charges",
                target: "",
                amount: 1
            },
            activation: {
                type: "action",
                cost: 1,
                condition: ""
            }
        },
        effects: generateEffects(drink),
        flags: {
            "dnd5e-alcohol": {
                potency: drink.potency,
                properties: drink.properties
            }
        }
    }));
}

/**
 * Generates ActiveEffects for a drink based on its properties.
 */
function generateEffects(drink) {
    let effects = [];

    if (drink.properties.includes("Dangerous")) {
        effects.push({
            name: "Dangerous Drunk",
            icon: "icons/skills/melee/unarmed-fist-white.webp",
            changes: [
                { key: "system.bonuses.mwak.damage", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "1d4" }
            ],
            duration: { seconds: 3600 },
            transfer: false
        });
    }

    if (drink.properties.includes("Disarming")) {
        effects.push({
            name: "Disoriented Vision",
            icon: "icons/skills/perception/eye-worn-blue.webp",
            changes: [
                { key: "system.skills.prc.mod", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "-2" }
            ],
            duration: { seconds: 3600 },
            transfer: false
        });
    }

    if (drink.properties.includes("Infatuating")) {
        effects.push({
            name: "Easily Charmed",
            icon: "icons/magic/control/heart-pink.webp",
            changes: [
                { key: "system.abilities.wis.save", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "-2" }
            ],
            duration: { seconds: 3600 },
            transfer: false
        });
    }

    return effects;
}
