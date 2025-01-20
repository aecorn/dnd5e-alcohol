export const MONSTERS = [
    {
        name: "Drunken Ogre",
        type: "npc",
        img: "icons/creatures/mammals/bear-wine-barrel.webp",
        system: {
            details: { type: "giant", alignment: "chaotic neutral" },
            attributes: { hp: { value: 85, max: 85 }, ac: { value: 14 } },
            abilities: { str: 18, dex: 8, con: 16, int: 6, wis: 10, cha: 7 },
            traits: { senses: ["darkvision 60 ft"], languages: ["Giant"] },
            movement: { walk: 30 },
            actions: [
                { name: "Smash", type: "melee", damage: "2d8+4" }
            ]
        }
    },
    {
        name: "Ale Elemental",
        type: "npc",
        img: "icons/elements/water/elemental-beer-golden.webp",
        system: {
            details: { type: "elemental", alignment: "chaotic neutral" },
            attributes: { hp: { value: 100, max: 100 }, ac: { value: 16 } },
            abilities: { str: 14, dex: 12, con: 18, int: 4, wis: 12, cha: 10 },
            traits: { senses: ["tremorsense 30 ft"], languages: ["Primordial"] },
            movement: { walk: 40, swim: 30 },
            actions: [
                { name: "Foamy Slam", type: "melee", damage: "2d10+4" }
            ]
        }
    }
];