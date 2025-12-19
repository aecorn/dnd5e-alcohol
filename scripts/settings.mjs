
export const THRESHOLD_FORMULA_DEFAULTS = {
  tipsy: "m + p",
  drunk: "(s / 2) + p",
  wasted: "10 + m + p",
  incapacitated: "s + p",
};

export const THRESHOLD_SETTING_KEYS = {
  tipsy: "thresholdFormulaTipsy",
  drunk: "thresholdFormulaDrunk",
  wasted: "thresholdFormulaWasted",
  incapacitated: "thresholdFormulaIncapacitated",
};

class ThresholdFormulaResetForm extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "dnd5e-alcohol-threshold-reset",
      title: "Reset Alcohol Threshold Formulas",
      template: "modules/dnd5e-alcohol/templates/threshold-formula-reset.html",
      width: 480,
      height: "auto",
      submitOnChange: false,
      closeOnSubmit: true,
    });
  }

  getData() {
    return {
      defaults: THRESHOLD_FORMULA_DEFAULTS,
    };
  }

  async _updateObject() {
    await Promise.all([
      game.settings.set("dnd5e-alcohol", THRESHOLD_SETTING_KEYS.tipsy, THRESHOLD_FORMULA_DEFAULTS.tipsy),
      game.settings.set("dnd5e-alcohol", THRESHOLD_SETTING_KEYS.drunk, THRESHOLD_FORMULA_DEFAULTS.drunk),
      game.settings.set("dnd5e-alcohol", THRESHOLD_SETTING_KEYS.wasted, THRESHOLD_FORMULA_DEFAULTS.wasted),
      game.settings.set("dnd5e-alcohol", THRESHOLD_SETTING_KEYS.incapacitated, THRESHOLD_FORMULA_DEFAULTS.incapacitated),
    ]);
    ui.notifications?.info("Alcohol threshold formulas reset to defaults.");
    game.settings?.sheet?.render(true);
  }
}

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
    game.settings.register('dnd5e-alcohol', 'skipConRollInebriation', {
      name: 'Skip Constitution Saving Throw for Inebriation.',
      hint: 'Apply inebriation and conditions directly to characters without the chatcard asking for a constitution save.',
      scope: 'world',     // "world" = sync to db, "client" = local storage
      config: true,       // false if you dont want it to show in module config
      type: new foundry.data.fields.BooleanField(),       // You want the primitive class, e.g. Number, not the name of the class as a string
      default: false,
      requiresReload: false, // true if you want to prompt the user to reload
    });

    game.settings.register("dnd5e-alcohol", THRESHOLD_SETTING_KEYS.tipsy, {
      name: "Tipsy threshold formula",
      scope: "world",
      config: true,
      type: String,
      default: THRESHOLD_FORMULA_DEFAULTS.tipsy,
      requiresReload: false,
    });
    game.settings.register("dnd5e-alcohol", THRESHOLD_SETTING_KEYS.drunk, {
      name: "Drunk threshold formula",
      scope: "world",
      config: true,
      type: String,
      default: THRESHOLD_FORMULA_DEFAULTS.drunk,
      requiresReload: false,
    });
    game.settings.register("dnd5e-alcohol", THRESHOLD_SETTING_KEYS.wasted, {
      name: "Wasted threshold formula",
      scope: "world",
      config: true,
      type: String,
      default: THRESHOLD_FORMULA_DEFAULTS.wasted,
      requiresReload: false,
    });
    game.settings.register("dnd5e-alcohol", THRESHOLD_SETTING_KEYS.incapacitated, {
      name: "Incapacitated threshold formula",
      scope: "world",
      config: true,
      type: String,
      default: THRESHOLD_FORMULA_DEFAULTS.incapacitated,
      requiresReload: false,
    });

    game.settings.registerMenu("dnd5e-alcohol", "resetThresholdFormulas", {
      name: "Reset Alcohol Threshold Formulas",
      label: "Reset",
      hint: "Restore the threshold formulas to their defaults.",
      type: ThresholdFormulaResetForm,
      restricted: true,
    });
});

Hooks.on("renderSettingsConfig", (_app, html) => {
  const root = html?.[0] ?? html;
  if (!root?.querySelector) return;

  const tipsyInput =
    root.querySelector("input[name='dnd5e-alcohol.thresholdFormulaTipsy']") ||
    root.querySelector("[data-setting-id='dnd5e-alcohol.thresholdFormulaTipsy']");
  const tipsyGroup = tipsyInput?.closest(".form-group");
  if (tipsyGroup && !root.querySelector("#dnd5e-alcohol-threshold-section")) {
    const section = document.createElement("div");
    section.id = "dnd5e-alcohol-threshold-section";

    const header = document.createElement("h3");
    header.textContent = "Alcohol Threshold Formulas";

    const rule = document.createElement("hr");

    section.appendChild(header);
    section.appendChild(rule);
    const hint = document.createElement("p");
    hint.className = "notes";
    hint.textContent =
      "Use m (CON mod), p (proficiency bonus when Deep Gut applies), s (CON score). Supports + - * /, parentheses, and percentages.";
    section.appendChild(hint);
    tipsyGroup.insertAdjacentElement("beforebegin", section);
  }

  const resetButton = root.querySelector("button[data-key='dnd5e-alcohol.resetThresholdFormulas']");
  const resetGroup = resetButton?.closest(".form-group");
  if (!resetGroup) return;

  const lastInput =
    root.querySelector("input[name='dnd5e-alcohol.thresholdFormulaIncapacitated']") ||
    root.querySelector("[data-setting-id='dnd5e-alcohol.thresholdFormulaIncapacitated']");
  const lastGroup = lastInput?.closest(".form-group");
  if (!lastGroup) return;

  lastGroup.insertAdjacentElement("afterend", resetGroup);
});
