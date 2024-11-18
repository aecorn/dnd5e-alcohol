// Replace "my-module-id" with your module's unique ID
Hooks.once("ready", () => {
    // Check if the macro already exists by name
    let macroName = "Increase Inebriation";
    let existingMacro = game.macros.find((m) => m.name === macroName);
  
    if (!existingMacro) {
      // Define the macro command script
      let command = `
        // Ensure a token is selected
        let token = canvas.tokens.controlled[0];
        if (!token) {
          ui.notifications.warn("Please select a token.");
          return;
        }
  
        // Get current inebriation level, default to 0 if undefined
        let inebriation = token.actor.getFlag("dnd5e-alcohol", "inebriation") || 0;
  
        // Increment inebriation by 1
        inebriation += 1;
  
        // Update the token's inebriation flag
        await token.actor.setFlag("dnd5e-alcohol", "inebriation", inebriation);
  
        // Notify the user of the current inebriation level
        ui.notifications.info(\`\${token.name}'s inebriation level is now \${inebriation}.\`);
      `;
  
      // Create the macro with the command script
      Macro.create({
        name: macroName,
        type: "script",
        command: command,
        img: "icons/svg/rum.svg", // Optional: set an icon
        flags: { "dnd5e-alcohol": { created: true } }, // Optional flag to mark creation by this module
      });
    }
  });