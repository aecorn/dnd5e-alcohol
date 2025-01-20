import { refresh_conditions } from "./conditions.js";


export async function add_inebriation_points(token, num_points=1) {
    if (!token) {
        ui.notifications.warn("Please select a token.");
        return;
      }
      // Get current inebriation level, default to 0 if undefined
      let inebriation = token.actor.getFlag("dnd5e-alcohol", "inebriation") || 0;

      // Increment inebriation by 1
      inebriation += num_points;

      // Update the token's inebriation flag
      await token.actor.setFlag("dnd5e-alcohol", "inebriation", inebriation);

      refresh_conditions(token.actor);

      // Notify the user of the current inebriation level
      ui.notifications.info(`${token.name}'s inebriation level is now ${inebriation}.`);
}


export async function decrease_inebriation_points(token, num_points=1) {
  if (!token) {
      ui.notifications.warn("Please select a token.");
      return;
    }
    // Get current inebriation level, default to 0 if undefined
    let inebriation = token.actor.getFlag("dnd5e-alcohol", "inebriation") || 0;

    // Increment inebriation by 1
    inebriation -= num_points;

    if (inebriation < 0){
      inebriation = 0;
    }
    

    // Update the token's inebriation flag
    await token.actor.setFlag("dnd5e-alcohol", "inebriation", inebriation);

    refresh_conditions(token.actor);

    // Notify the user of the current inebriation level
    ui.notifications.info(`${token.name}'s inebriation level is now ${inebriation}.`);
}

export async function reset_inebriation(target) {
  const actor = target?.actor ?? target;
  if (!actor) {
      ui.notifications.warn("Please send a token or actor.");
      return;
    }
    // Update the token's inebriation flag
    await actor.setFlag("dnd5e-alcohol", "inebriation", 0);

    refresh_conditions(actor);

    // Notify the user of the current inebriation level
    ui.notifications.info(`${actor.name}'s inebriation level is now 0.`);
}


