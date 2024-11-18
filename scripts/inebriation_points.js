async function add_inebriation_points(token, num_points=1) {
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

      // Notify the user of the current inebriation level
      ui.notifications.info(`\${token.name}'s inebriation level is now \${inebriation}.`);
}


async function decrease_inebriation_points(token, num_points=1) {
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

    // Notify the user of the current inebriation level
    ui.notifications.info(`\${token.name}'s inebriation level is now \${inebriation}.`);
}

async function reset_inebriation(token) {
  if (!token) {
      ui.notifications.warn("Please select a token.");
      return;
    }

    // Update the token's inebriation flag
    await token.actor.setFlag("dnd5e-alcohol", "inebriation", 0);

    // Notify the user of the current inebriation level
    ui.notifications.info(`\${token.name}'s inebriation level is now 0.`);
}