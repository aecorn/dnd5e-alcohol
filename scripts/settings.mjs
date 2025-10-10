
Hooks.once("init", () => {
game.settings.register('dnd5e-alcohol', 'showBarZeroInebriation', {
    name: 'Show bar when at zero inebriation',
    hint: 'Unchecking this will hide the inebriation bar from character sheets when the character has 0 inebriation points.',
    scope: 'world',     // "world" = sync to db, "client" = local storage
    config: true,       // false if you dont want it to show in module config
    type: new foundry.data.fields.BooleanField(),       // You want the primitive class, e.g. Number, not the name of the class as a string
    default: true,
    //onChange: value => { // value is the new value of the setting
    //  console.log(value)
    //},
    requiresReload: false, // true if you want to prompt the user to reload
    /** Creates a select dropdown */
    //choices: {
    //      1: "Option Label 1",
    //  2: "Option Label 2",
    //  3: "Option Label 3"
    //  },
    /** Number settings can have a range slider, with an optional step property */
    //range: {
    //  min: 0,
    //  step: 2,
    //  max: 10
    //},
    /** "audio", "image", "video", "imagevideo", "folder", "font", "graphics", "text", or "any" */
    //filePicker: "any"
  });
});