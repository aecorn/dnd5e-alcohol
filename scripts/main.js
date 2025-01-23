import { increase_inebriation_macro, decrease_inebriation_macro, reset_inebriation_macro } from "./macros.js";


Hooks.once("ready", () => {
    console.log("dnd5e-alcohol module is ready.");

    // Register functions in the module API
    let module = game.modules.get("dnd5e-alcohol");
    if (module) {
        module.api = {
            increase_inebriation_macro,
            decrease_inebriation_macro,
            reset_inebriation_macro
        };
    }
});

