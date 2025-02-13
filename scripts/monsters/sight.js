async function SightChatMessage(actor) {
    let chatContent =`
            <p><b>${actor.name} is Drunk and can see <span style="color:red">The Terror of the Barrom</span>.</b></p>
            <p>You must succeed on a <b>[[/save ability=wis dc=10]]</b> Wisdom saving throw or become frightened.</p>
            <button class="apply-condition" data-actor-id="${actor.id}" data-condition="frightened">Apply Frightened Condition</button>
            `;

    if (chatContent) {
        await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor }),
            content: chatContent,
            type: CONST.CHAT_MESSAGE_STYLES.OTHER
        });
    }
}


Hooks.on("combatTurn", async (combat) => {
    let token = combat.turns[combat.turn].token;

    console.log(token);
    // if token is not drunk, exit
    let isDrunk = token.actor.effects.some(effect => effect.name.toLowerCase() == "drunk");
    if (!isDrunk){return;}

    // If token is already frightened, exit
    let isFright = token.actor.effects.some(effect => effect.name.toLowerCase() == "frightened");
    if (isFright){return;}

    // Find tokens with the terror feature
    let featureName = "terror of the barrom";
    let terrorTokens = canvas.tokens.objects.children.filter(token => 
        token.actor.items.some(item => 
            item.name.toLowerCase() === featureName));
    
    // If no tokens have the feature, exit
    if (terrorTokens.length === 0){return;}

    // Check if the actor can see each of the terrors
    for (let terrorToken of terrorTokens) {
        // Check if updated token sees 
        //console.log(terrorToken);
        //console.log(token);
        //console.log(canvas.visibility.testVisibility(terrorToken, {object: token}));
        if (canvas.visibility.testVisibility(terrorToken, {object: token})){
            await SightChatMessage(token.actor);
            return;
        }
    }
});

