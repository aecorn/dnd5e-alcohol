async function SightChatMessage(actor) {
    let chatContent =`
            <p><b>${actor.name} is Drunk and can see <span style="color:red">The Terror of the Barrom</span>.</b></p>
            <p>You must succeed on a <b>[[/save ability=wis dc=10]]</b> Wisdom saving throw or become frightened.</p>
            <button class="apply-condition" data-actor-id="${actor.id}" data-actor-uuid="${actor.uuid}" data-condition="frightened">Apply Frightened Condition</button>
            `;

    if (chatContent) {
        await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor }),
            content: chatContent,
            style: CONST.CHAT_MESSAGE_STYLES.OTHER
        });
    }
}

function canSeeToken(observer, target) {
    if (!observer.hasSight || target.document.hidden) return false;

    // Uncontrolled tokens have no vision source on the GM client. Keep this
    // temporary source out of the canvas collection and dispose of it afterward.
    const temporary = !observer.vision;
    const source = observer.vision ?? new CONFIG.Canvas.visionSourceClass({
        sourceId: `${observer.sourceId}.dnd5e-alcohol-sight`,
        object: observer,
    });
    try {
        if (temporary) {
            Object.assign(source.blinded, observer._getVisionBlindedStates());
            source.initialize(observer._getVisionSourceData());
        }
        const config = canvas.visibility._createVisibilityTestConfig(target.center, {object: target});
        return observer.document.detectionModes.some(mode => {
            const detection = CONFIG.Canvas.detectionModes[mode.id];
            // Hearing and tremorsense do not satisfy the feature's sight requirement.
            return detection && detection.type === detection.constructor.DETECTION_TYPES.SIGHT
                && detection.testVisibility(source, mode, config);
        });
    } finally {
        if (temporary) source.destroy();
    }
}

Hooks.on("combatTurnChange", async (combat) => {
    // This hook runs on every connected client; only one should post the card / roll the save
    if (game.user !== game.users.activeGM) return;
    if (!canvas.ready || combat.scene?.id !== canvas.scene?.id) return;
    const combatant = combat.turns[combat.turn];
    if (!combatant?.token?.actor) return;
    let token = combatant.token;
    const observer = token.object;
    if (!observer) return;

    // if token is not drunk, exit
    let isDrunk = token.actor.effects.some(effect => effect.name.toLowerCase() == "drunk");
    if (!isDrunk){return;}

    // If token is already frightened, exit
    let isFright = token.actor.effects.some(effect => effect.name.toLowerCase() == "frightened");
    if (isFright){return;}

    // Find tokens with the terror feature
    let featureName = "terror of the barrom";
    let terrorTokens = canvas.tokens.objects.children.filter(token =>
        token.actor && token.actor.items.some(item =>
            item.name.toLowerCase() === featureName));
    
    // If no tokens have the feature, exit
    if (terrorTokens.length === 0){return;}

    // Check if the actor can see each of the terrors
    for (let terrorToken of terrorTokens) {
        if (terrorToken !== observer && canSeeToken(observer, terrorToken)){
            await SightChatMessage(token.actor);
            return;
        }
    }
});
