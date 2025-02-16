import { refresh_conditions } from "./conditions.mjs";


export async function add_inebriation_points(target, num_points=1) {
  const actor = target?.actor ?? target;

      // Get current inebriation level, default to 0 if undefined
      let inebriation = actor.getFlag("dnd5e-alcohol", "inebriation") || 0;

      // Increment inebriation by 1
      inebriation += num_points;

      // Update the token's inebriation flag
      await actor.setFlag("dnd5e-alcohol", "inebriation", inebriation);

      await refresh_conditions(actor, inebriation);

      // Notify the user of the current inebriation level
      ui.notifications.info(`${actor.name}'s inebriation level is now ${inebriation}.`);
}


export async function decrease_inebriation_points(target, num_points=1) {
  const actor = target?.actor ?? target;
    // Get current inebriation level, default to 0 if undefined
    let inebriation = actor.getFlag("dnd5e-alcohol", "inebriation") || 0;

    // Increment inebriation by 1
    inebriation -= num_points;

    if (inebriation < 0){
      inebriation = 0;
    }
    

    // Update the token's inebriation flag
    await actor.setFlag("dnd5e-alcohol", "inebriation", inebriation);

    await refresh_conditions(actor, inebriation);

    // Notify the user of the current inebriation level
    ui.notifications.info(`${actor.name}'s inebriation level is now ${inebriation}.`);
}

export async function reset_inebriation(target) {
  const actor = target?.actor ?? target;
  if (!actor) {
      ui.notifications.warn("Please send a token or actor.");
      return;
    }
    // Update the token's inebriation flag
    await actor.setFlag("dnd5e-alcohol", "inebriation", 0);

    await refresh_conditions(actor, 0);

    // Notify the user of the current inebriation level
    ui.notifications.info(`${actor.name}'s inebriation level is now 0.`);
}


