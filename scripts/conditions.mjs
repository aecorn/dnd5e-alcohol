import {update_drunkards_third_leg} from "./items.mjs";
import {THRESHOLD_FORMULA_DEFAULTS, THRESHOLD_SETTING_KEYS} from "./settings.mjs";

const ALCOHOL_EFFECTS = {
    tipsy: {
        name: "Tipsy",
        id: "dnd5e-alcohol-tipsy",
        img: "icons/svg/daze.svg",
        icon: "icons/svg/daze.svg",
        description: "You are slightly inebriated. Gain +2 to Persuasion but suffer -2 to Insight skill rolls and Wisdom saving throws.",
        changes: [
            // +2 to Persuasion (CHA Skill)
            { key: "system.skills.per.bonuses.check", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "2" },

            // -2 to resisting Persuasion and Deception (Affects Wisdom (Insight))
            { key: "system.skills.ins.bonuses.check", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "-2" },

            // -2 to Saving Throws against Persuasion/Deception effects
            { key: "system.abilities.wis.bonuses.save", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "-2" }
        ]
    },
    drunk: {
        name: "Drunk",
        id: "dnd5e-alcohol-drunk",
        img: "icons/svg/down.svg",
        icon: "icons/svg/down.svg",
        description: "Drunk characters have a -2 penalty to both Intelligence and Wisdom checks and saving throws. Drunk characters suffer a -2 penalty to spell and weapon attacks.",
        changes: [
            { key: "system.bonuses.mwak.attack", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "-2", priority: 30 },
            { key: "system.bonuses.msak.attack", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "-2", priority: 30 },
            { key: "system.bonuses.rwak.attack", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "-2", priority: 30 },
            { key: "system.bonuses.rsak.attack", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "-2", priority: 30 },
            { key: "system.abilities.int.bonuses.save", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "-2", priority: 30 },
            { key: "system.abilities.wis.bonuses.save", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "-2", priority: 30 },
            { key: "system.abilities.int.bonuses.check", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "-2", priority: 30 },
            { key: "system.abilities.wis.bonuses.check", mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: "-2", priority: 20 }
        ]
    },
    wasted: {
        name: "Wasted",
        id: "dnd5e-alcohol-wasted",
        img: "icons/svg/stoned.svg",
        icon: "icons/svg/stoned.svg",
        description: "A wasted creature must make a Constitution saving throw at once an hour they are awake or spend one minute vomiting. While vomiting, they cannot perform any other actions and automatically fail all saving throws. Once a wasted creature begins a long rest, they must make a Constitution saving throw or fail to gain any benefit from the rest. Both saving throw DCs are equal to their Alcohol Level.",
        changes: [
            { key: "system.conditions.prone", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "true", priority: 50 },
            { key: "flags.dnd5e-alcohol.wasted_active", mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: "true" } // Custom flag to track state
        ],
        statuses: ["wasted", "poisoned"],
    },
    incapacitated: {
        name: "Incapacitated",
        id: "dnd5e-alcohol-incapacitated",
        icon: "icons/svg/paralysis.svg",
        statuses: ["incapacitated"],
        changes: [
        ]
    }
};




export async function calculate_thresholds(actor){
    let con_mod = actor.system.abilities.con.mod;
    let con_score = actor.system.abilities.con.value;

    let bonus = 0;
    if (await actor.items.some(item => item.name.toLowerCase() == "deep gut")){
        bonus += actor.system.attributes.prof;
    }

    const context = {
        m: con_mod,
        p: bonus,
        s: con_score,
    };

    const condition_thresholds = {
        tipsy: evaluate_threshold_formula(get_threshold_formula("tipsy"), context, "tipsy"),
        drunk: evaluate_threshold_formula(get_threshold_formula("drunk"), context, "drunk"),
        wasted: evaluate_threshold_formula(get_threshold_formula("wasted"), context, "wasted"),
        incapacitated: evaluate_threshold_formula(get_threshold_formula("incapacitated"), context, "incapacitated"),
    };
    condition_thresholds.drunk = Math.max(condition_thresholds.drunk, condition_thresholds.tipsy);
    condition_thresholds.wasted = Math.max(condition_thresholds.wasted, condition_thresholds.drunk);
    condition_thresholds.incapacitated = Math.max(condition_thresholds.incapacitated, condition_thresholds.wasted);
    return condition_thresholds;
}

function get_threshold_formula(key) {
    const stored = game.settings.get("dnd5e-alcohol", THRESHOLD_SETTING_KEYS[key]);
    if (typeof stored !== "string" || stored.trim() === "") {
        return THRESHOLD_FORMULA_DEFAULTS[key];
    }
    return stored;
}

function evaluate_threshold_formula(formula, context, label) {
    try {
        const normalized = formula.toLowerCase().replace(/\s+/g, "");
        const withPercents = normalized.replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");

        if (!/^[0-9mps+\-*/().]+$/.test(withPercents)) {
            throw new Error("Invalid characters");
        }

        const tokens = tokenize_expression(withPercents);
        const rpn = to_rpn(tokens);
        const result = eval_rpn(rpn, context);

        if (!Number.isFinite(result)) {
            throw new Error("Invalid result");
        }

        return Math.floor(result);
    } catch (error) {
        console.warn(`Invalid ${label} threshold formula "${formula}". Falling back to defaults.`, error);
        const fallback = THRESHOLD_FORMULA_DEFAULTS[label];
        if (formula === fallback) {
            return 0;
        }
        return evaluate_threshold_formula(fallback, context, label);
    }
}

function tokenize_expression(expr) {
    const tokens = [];
    let i = 0;

    while (i < expr.length) {
        const char = expr[i];

        if (char >= "0" && char <= "9" || char === ".") {
            let num = char;
            i += 1;
            while (i < expr.length && ((expr[i] >= "0" && expr[i] <= "9") || expr[i] === ".")) {
                num += expr[i];
                i += 1;
            }
            if (num === "." || num.split(".").length > 2) {
                throw new Error("Invalid number");
            }
            tokens.push({type: "number", value: parseFloat(num)});
            continue;
        }

        if (char === "m" || char === "p" || char === "s") {
            tokens.push({type: "variable", value: char});
            i += 1;
            continue;
        }

        if ("+-*/()".includes(char)) {
            tokens.push({type: "operator", value: char});
            i += 1;
            continue;
        }

        throw new Error("Invalid token");
    }

    return tokens;
}

function to_rpn(tokens) {
    const output = [];
    const operators = [];
    let prevType = "start";

    const precedence = {
        "+": 1,
        "-": 1,
        "*": 2,
        "/": 2,
        "u-": 3,
        "u+": 3,
    };

    for (const token of tokens) {
        if (token.type === "number" || token.type === "variable") {
            output.push(token);
            prevType = "value";
            continue;
        }

        if (token.value === "(") {
            operators.push(token.value);
            prevType = "leftParen";
            continue;
        }

        if (token.value === ")") {
            while (operators.length && operators[operators.length - 1] !== "(") {
                output.push({type: "operator", value: operators.pop()});
            }
            if (!operators.length) {
                throw new Error("Mismatched parentheses");
            }
            operators.pop();
            prevType = "value";
            continue;
        }

        if ("+-*/".includes(token.value)) {
            let op = token.value;
            if (prevType === "start" || prevType === "leftParen" || prevType === "operator") {
                op = token.value === "-" ? "u-" : "u+";
            }

            while (operators.length) {
                const top = operators[operators.length - 1];
                if (top === "(") break;

                const topPrec = precedence[top];
                const opPrec = precedence[op];
                if (topPrec > opPrec || (topPrec === opPrec && op !== "u-" && op !== "u+")) {
                    output.push({type: "operator", value: operators.pop()});
                    continue;
                }
                break;
            }

            operators.push(op);
            prevType = "operator";
            continue;
        }
    }

    while (operators.length) {
        const op = operators.pop();
        if (op === "(") {
            throw new Error("Mismatched parentheses");
        }
        output.push({type: "operator", value: op});
    }

    return output;
}

function eval_rpn(tokens, context) {
    const stack = [];

    for (const token of tokens) {
        if (token.type === "number") {
            stack.push(token.value);
            continue;
        }

        if (token.type === "variable") {
            stack.push(Number(context[token.value] ?? 0));
            continue;
        }

        if (token.type === "operator") {
            if (token.value === "u-" || token.value === "u+") {
                if (stack.length < 1) throw new Error("Invalid expression");
                const value = stack.pop();
                stack.push(token.value === "u-" ? -value : value);
                continue;
            }

            if (stack.length < 2) throw new Error("Invalid expression");
            const right = stack.pop();
            const left = stack.pop();
            switch (token.value) {
                case "+":
                    stack.push(left + right);
                    break;
                case "-":
                    stack.push(left - right);
                    break;
                case "*":
                    stack.push(left * right);
                    break;
                case "/":
                    stack.push(left / right);
                    break;
                default:
                    throw new Error("Unsupported operator");
            }
            continue;
        }
    }

    if (stack.length !== 1) {
        throw new Error("Invalid expression");
    }

    return stack[0];
}


export async function refresh_conditions(actor, inebriation = null) {
    console.log("Refreshing conditions");

    let curr_ineb = inebriation || await actor.getFlag("dnd5e-alcohol", "inebriation") || 0;

    let addEffects = new Set();
    let removeEffects = new Set();
    let messages = { add: [], remove: [] };

    let isWasted = false;
    let incapacitated = false;

    let thres = await calculate_thresholds(actor);



    /* Inebriation >= Constitution modfier -> Tipsy */
    if (curr_ineb >= thres.tipsy && curr_ineb !== 0) {addEffects.add("Tipsy")};
    if (curr_ineb < thres.tipsy || curr_ineb === 0) {removeEffects.add("Tipsy")};

    /* Inebriation >= Half of constitution score (rounded down) -> Drunk */
    if (curr_ineb >= thres.drunk){ addEffects.add("Drunk")};
    if (curr_ineb < thres.drunk){removeEffects.add("Drunk")};

    /* If inebriation >= 10 + Constitution modifier -> Wasted (+ poisoned) */
    if (curr_ineb >= thres.wasted) {
        addEffects.add("Wasted");
        isWasted = true;
    }
    if (curr_ineb < thres.wasted) {
        removeEffects.add("Wasted");
        actor.unsetFlag("dnd5e-alcohol", "wasted_active");
    }

    /* If inebriation points equals Constitution -> Incapacitated */
    if (curr_ineb >= thres.incapacitated) {
        addEffects.add("Incapacitated");
        incapacitated = true;
    }
    if (curr_ineb < thres.incapacitated) removeEffects.add("Incapacitated");

    // Apply additions
    for (const effect of addEffects) {
        await addAlcoholEffect(actor, effect, false);
        messages.add.push(effect);
    }

    await update_drunkards_third_leg(actor, addEffects);

    // Apply removals
    for (const effect of removeEffects) {
        await removeAlcoholEffect(actor, effect, false);
        messages.remove.push(effect);
    }

    // Send a combined chat message for normal conditions
    if (messages.add.length > 0 || messages.remove.length > 0) {
        await AlcoholChatMessage(actor, messages.add, messages.remove);
    }

    // Send a separate chat message for Incapacitation
    if (incapacitated) {
        await AlcoholChatMessage(actor, ["Incapacitated"], [], true);
    }

    // Send a separate chat message for Wasted
    if (isWasted) {
        await AlcoholChatMessage(actor, ["Wasted"], [], false, true);
    }
}

Hooks.once("ready", () => {
    if (game.release.generation <= 12) {
        Hooks.on("dnd5e.renderChatMessage", (message, html, data) => {
            //console.log(html);
            add_click_event_apply_condition(html);
        });
    } else if (game.release.generation >= 13) {
        Hooks.on("renderChatMessageHTML", (message, html, data) => {
            add_click_event_apply_condition(html);
        });
    }
});

    
function add_click_event_apply_condition(html){
    html.querySelectorAll(".apply-condition").forEach((button) => {
        button.addEventListener("click", async (event) => {
            // Use querySelectorAll since html is now a native HTMLElement
            event.preventDefault();

            // Extract actor ID and condition from data attributes
            const actorId = event.currentTarget.dataset.actorId;
            const condition = event.currentTarget.dataset.condition;
            const actor = game.actors.get(actorId);

            // Disable the button to prevent re-use
            event.currentTarget.disabled = true;

            if (!actor) {
                console.error("Actor not found.");
                return;
            }

            actor.toggleStatusEffect(condition, { active: true });
        });
    });
};


async function addAlcoholEffect(actor, condition, chatMessage = true) {
    //console.log(`Adding alcohol effect: ${condition}`);
    if (!actor || !ALCOHOL_EFFECTS[condition.toLowerCase()]) return;
    let effectData = ALCOHOL_EFFECTS[condition.toLowerCase()];

    // If actor has deep gut, reduce skill penalties with half
    if (actor.items.some(item => item.name.toLowerCase() == "deep gut")){
        for (let change of effectData.changes){
            if (change.key.includes("skills") && change.value.startsWith("-")){
                change.value = Math.floor(parseInt(change.value)/2).toString()
            }
        }
    }

    // Check if effect already exists
    let existingEffect = actor.effects.find(e => e.name === effectData.name);
    if (existingEffect) return; // Prevent duplicates

    // Only add poisoned, if actor is now wasted, but not already poisoned.
    if (effectData.name.toLowerCase() === "wasted" && !actor.effects.some(e => e.name.toLowerCase() === "poisoned")){
        await actor.toggleStatusEffect("poisoned", {active: true});
    }
    // Only add incapacitated, if actor is now at incapacitated threshold, but not already incapacitated.
    if (effectData.name.toLowerCase() === "incapacitated"){
        if(!actor.effects.some(e => e.name.toLowerCase() === "incapacitated")){
            await actor.toggleStatusEffect("incapacitated", {active: true});
        }

    } else {
        await actor.createEmbeddedDocuments("ActiveEffect", [{
            name: effectData.name,
            icon: effectData.icon,
            origin: effectData.id,
            description: effectData.description,
            disabled: false,
            duration: {},
            changes: effectData.changes,
            statuses: [effectData.id]
        }]);
    }
    if (chatMessage){
        await AlcoholChatMessage(actor, condition, "add");
    }
    
}

async function AlcoholChatMessage(actor, addedConditions = [], removedConditions = [], isIncapacitated = false, isWasted = false) {
    let alcoholLevel = await actor.getFlag("dnd5e-alcohol", "inebriation") || 0;
    let chatContent = "";

    if (isIncapacitated) {
        chatContent = `
            <p><b>${actor.name} is now <span style="color:red">Incapacitated</span> due to alcohol poisoning.</b></p>
            <p>You must succeed on a <b>DC [[/save ability=con dc=${alcoholLevel}]]</b> Constitution saving throw or begin making death saving throws.</p>
            <p>Another creature can make a Medicine check to stabilize you as normal.</p>
        `;
    } else if (isWasted) {
        chatContent = `<p><b>${actor.name} is <span style="color:purple">Wasted</span> from excessive alcohol consumption.</b></p>`;

        // If the actor has the feat 
        if (actor.items.some(item => item.name.toLowerCase() == "deep gut")){
            chatContent += `<p>${actor.name} has the feat Deep Gut, and will not have to spend time vomiting while wasted.</p>`;
        } else {
            chatContent += `<p><b>Severe Intoxication Effect:</b> While Wasted, you must make a <b>DC [[/save ability=con dc=10]]</b> Constitution saving throw once per hour while awake.</p>
            <p>On a failed save, you spend one minute vomiting. While vomiting:</p>
            <ul>
                <li>You cannot take any actions.</li>
                <li>You automatically fail all saving throws.</li>
            </ul>
        `;
        }
    } else {
        if (addedConditions.length > 0) {
            chatContent += `<p><b>Drunken effects you have:</b> ${addedConditions.join(", ")}</p>`;
        }
        if (removedConditions.length > 0) {
            chatContent += `<p><b>Drunken effects you dont have (yet):</b> ${removedConditions.join(", ")}</p>`;
        }
        chatContent += `<p>Alcohol Level: ${alcoholLevel}</p>`;
    }

    if (chatContent) {
        await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor }),
            content: chatContent,
            type: CONST.CHAT_MESSAGE_STYLES.OTHER
        });
    }
}




async function removeAlcoholEffect(actor, condition, chatMessage = true) {
    if (!actor || !ALCOHOL_EFFECTS[condition.toLowerCase()]) return;

    let existingEffect = actor.effects.getName(condition) || false; 

    // Only remove poisoned effect if wasted is removed
    let hasWasted = actor.effects.some(e => e.name.toLowerCase() === "wasted");
    if (condition.toLowerCase() === "wasted" && hasWasted){
        await actor.toggleStatusEffect("poisoned", {active: false});
    }
    if (condition.toLowerCase() === "incapacitated"){
        await actor.toggleStatusEffect("incapacitated", {active: false});
        return; // If we dont return it might try to remove the status twice
    }

    if (existingEffect) {
        existingEffect.delete();
        if (chatMessage) {
            await AlcoholChatMessage(actor, condition, "remove");
        }
    }
}

Hooks.on("preCreateActiveEffect", async (effect, options, userId) => {

    // Find matching effect in ALCOHOL_EFFECTS
    let effectName = effect.name.toLowerCase();
    let alcoholEffect = Object.values(ALCOHOL_EFFECTS).find(e => e.name.toLowerCase() === effectName);

    if (alcoholEffect & effectName != "incapacitated") {

        // Modify the effect directly
        await effect.updateSource({
            img: alcoholEffect.img,
            changes: alcoholEffect.changes,
            description: alcoholEffect.description,
        });

        console.log(`Custom properties applied to ${effect.name} from the alcohol module.`);
    }
});
