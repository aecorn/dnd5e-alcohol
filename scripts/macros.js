import { add_inebriation_points, decrease_inebriation_points, reset_inebriation} from "./inebriation_points.js";



function increase_inebriation_macro(token, num_points){
  add_inebriation_points(token, num_points);
}

function decrease_inebriation_macro(token, num_points){
  decrease_inebriation_points(token, num_points);
}

function reset_inebriation_macro(token){
  reset_inebriation(token);
}

// Replace "my-module-id" with your module's unique ID
Hooks.once("ready", () => {

    // Create the macro with the command script
    Macro.create({
      name: "Increase Inebriation 1",
      type: "script",
      command: `increase_inebriation_macro(token, 1);`,
      img: "icons/svg/tankard.svg", // Optional: set an icon
      flags: { "dnd5e-alcohol": { created: true } }, // Optional flag to mark creation by this module
    });

      Macro.create({
        name: "Decrease Inebriation 1",
        type: "script",
        command: `decrease_inebriation_macro(token, 1);`,
        img: "icons/svg/down.svg", // Optional: set an icon
        flags: { "dnd5e-alcohol": { created: true } }, // Optional flag to mark creation by this module
      });
    
      Macro.create({
        name: "Reset Inebriation",
        type: "script",
        command: `reset_inebriation_macro(token);`,
        img: "icons/svg/sleep.svg", // Optional: set an icon
        flags: { "dnd5e-alcohol": { created: true } }, // Optional flag to mark creation by this module
      });
  });


  