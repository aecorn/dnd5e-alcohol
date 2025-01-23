import { decrease_inebriation_points, add_inebriation_points } from "./inebriation_points.js";

Hooks.on("dnd5e.postActivityConsumption", async (activity) => {
    console.log("Drinking?");
    let parentItem = activity.parent.parent;
    let potency = parentItem.getFlag("dnd5e-alcohol", "potency");

    if (potency != undefined) {
        let properties = parentItem.getFlag("dnd5e-alcohol", "properties") || [];
        let actor = activity.actor;
        let inebriation_points = actor.getFlag("dnd5e-alcohol", "inebriation") || 0;
        console.log(actor);
        console.log(inebriation_points);


        let dc = 10 + potency + Math.floor(inebriation_points / 2);
        console.log(potency);
        console.log(inebriation_points);
        console.log(dc);
        let content = `
            Potency of drink: <strong>${potency}</strong><br>
            Pre-existing inebriation level: <strong>${inebriation_points}</strong><br>
            <b>${actor.name}</b> make a [[/save ability=con dc=${dc}]] save to avoid inebriation.<br><br>
            You can choose to fail the test.
            If you fail the test, apply the inebriation points and effects:
            <button class="apply-inebriation" data-actor-id="${actor.id}" data-potency="${potency}" data-properties="${properties}">Apply Inebriation</button>
            `;
    let chatData = {
              user: game.user._id,
              speaker: ChatMessage.getSpeaker(),
              content: content 
          };
          ChatMessage.create(chatData, {});

    }
    
  
  });

  Hooks.on("renderChatMessage", (message, html, data) => {
    html.find(".apply-inebriation").click(async (event) => {
        event.preventDefault();
        
        // Extract actor ID and potency from button attributes
        let actorId = event.currentTarget.dataset.actorId;
        let potency = parseInt(event.currentTarget.dataset.potency);
        let actor = game.actors.get(actorId);

        if (!actor) {
            console.error("Actor not found.");
            return;
        }

        // Fetch properties flag
        let properties = actor.items.contents
            .map(item => item.getFlag("dnd5e-alcohol", "properties"))
            .flat()
            .filter(p => p); // Remove undefined/null values

        // Apply inebriation logic
        if (properties.map(p => p.toLowerCase()).includes("sobering")) {
            decrease_inebriation_points(actor, potency);
        } else {
            add_inebriation_points(actor, potency);
        }

        // Disable button after use
        event.currentTarget.disabled = true;
    });
});