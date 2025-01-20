import { add_inebriation_points, decrease_inebriation_points, reset_inebriation} from "./inebriation_points.js";


export function increase_inebriation_macro(token, num_points){
  console.log(token.name);
  add_inebriation_points(token, num_points);
}

export function decrease_inebriation_macro(token, num_points){
  console.log(token.name);
  decrease_inebriation_points(token, num_points);
}

export function reset_inebriation_macro(token){
  console.log(token.name);
  reset_inebriation(token);
}

// Replace "my-module-id" with your module's unique ID
Hooks.once("ready", async () => {
    let macroName = "Increase Inebriation 1"; // Change to your macro's name
    // Check if macro exists in the world
    let existingMacro = game.macros.find(m => m.name === macroName);
    if (!existingMacro) {
    // Create the macro with the command script
      Macro.create({
        name: macroName,
        type: "script",
        command: `game.modules.get("dnd5e-alcohol")?.api?.increase_inebriation_macro(token, 1);`,
        img: "icons/svg/tankard.svg", // Optional: set an icon
        flags: { "dnd5e-alcohol": { created: true } }, // Optional flag to mark creation by this module
      });
    }

    macroName = "Decrease Inebriation 1"; // Change to your macro's name
    // Check if macro exists in the world
    existingMacro = game.macros.find(m => m.name === macroName);
    if (!existingMacro) {
      Macro.create({
        name: macroName,
        type: "script",
        command: `game.modules.get("dnd5e-alcohol")?.api?.decrease_inebriation_macro(token, 1);`,
        img: "icons/svg/down.svg", // Optional: set an icon
        flags: { "dnd5e-alcohol": { created: true } }, // Optional flag to mark creation by this module
      });
    }
    macroName = "Reset Inebriation"; // Change to your macro's name
    // Check if macro exists in the world
    existingMacro = game.macros.find(m => m.name === macroName);
    if (!existingMacro) {
      Macro.create({
        name: macroName,
        type: "script",
        command: `game.modules.get("dnd5e-alcohol")?.api?.reset_inebriation_macro(token);`,
        img: "icons/svg/sleep.svg", // Optional: set an icon
        flags: { "dnd5e-alcohol": { created: true } }, // Optional flag to mark creation by this module
      });
    }
  });


  