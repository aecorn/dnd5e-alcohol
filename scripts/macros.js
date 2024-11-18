import { add_inebriation_points, decrease_inebriation_points, reset_inebriation} from "./inebriation_points.js";

// Replace "my-module-id" with your module's unique ID
Hooks.once("ready", () => {

    // Create the macro with the command script
    Macro.create({
      name: "Increase Inebriation",
      type: "script",
      command: `add_inebriation_points(token, 1);`,
      img: "icons/svg/tankard.svg", // Optional: set an icon
      flags: { "dnd5e-alcohol": { created: true } }, // Optional flag to mark creation by this module
    });

      Macro.create({
        name: "Decrease Inebriation",
        type: "script",
        command: `decrease_inebration_points(token, 1);`,
        img: "icons/svg/down.svg", // Optional: set an icon
        flags: { "dnd5e-alcohol": { created: true } }, // Optional flag to mark creation by this module
      });
    
      Macro.create({
        name: "Reset Inebriation",
        type: "script",
        command: `reset_inebriation(token);`,
        img: "icons/svg/sleep.svg", // Optional: set an icon
        flags: { "dnd5e-alcohol": { created: true } }, // Optional flag to mark creation by this module
      });
  });