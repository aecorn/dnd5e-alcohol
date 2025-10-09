import { calculate_thresholds } from "./conditions.mjs";

async function get_progressbar_data(_sheet){
  let thres = await calculate_thresholds(_sheet.actor);

  let inebriation_max = thres.incapacitated;
  let inebriation_points = await _sheet.actor.getFlag("dnd5e-alcohol", "inebriation") || 0;
  let inebriation_percent = Math.floor((inebriation_points / inebriation_max) * 100);

  let tipsyThres = Math.floor((thres.tipsy / inebriation_max) * 100);
  let drunkThres = Math.floor((thres.drunk / inebriation_max) * 100);
  let wastedThres = Math.floor((thres.wasted / inebriation_max) * 100);
  
  return {inebriation_points, inebriation_max, inebriation_percent, tipsyThres, drunkThres, wastedThres};

  }


Hooks.on("renderActorSheet5eCharacter", async (_sheet, html) => {
  //console.log(_sheet.constructor.name);
  if (_sheet.constructor.name === "ActorSheet5eCharacter2") {
    await add_inebriation_bar_to_dnd_sheet(_sheet, html);
  } else if (_sheet.constructor.name === "ActorSheet5eCharacter") {
    await add_inebriation_bar_to_old_dnd_sheet(_sheet, html);
  }
});
// renderActorSheet5eCharacter for foundryvtt 13
Hooks.on("renderCharacterActorSheet", async (_sheet, html) => {
  console.log(_sheet.constructor.name);
  if (_sheet.constructor.name === "CharacterActorSheet") {
    await add_inebriation_bar_to_dnd_sheet(_sheet, html);
  }
});


  //systems/dnd5e/templates/actors/character-sheet-2.hbs

  // Tidy5e sheets
  Hooks.on("tidy5e-sheet.renderActorSheet", async (_sheet, html, actor) => {
    await add_inebriation_bar_to_tidy_classic_sheet(_sheet, html);
  });
  Hooks.on("renderTidy5eActorSheetClassicV2Base2", async (_sheet, html, actor) => {
    //console.log(_sheet.constructor.name === "Tidy5eCharacterSheet");
    await add_inebriation_bar_to_tidy_classic_sheet(_sheet, html);
  });
  Hooks.on("renderTidy5eCharacterSheetQuadrone", async (_sheet, html, actor) => {      
    //console.log(_sheet.constructor.name === "Tidy5eCharacterSheetQuadrone");
    console.log("Render quadrone sheet");
    await add_inebriation_bar_to_tidy_quadrone_sheet(_sheet, html);
  });


async function add_inebriation_bar_to_dnd_sheet(_sheet, html){
    let {inebriation_points, inebriation_max, inebriation_percent, tipsyThres, drunkThres, wastedThres} = await get_progressbar_data(_sheet);
    let progressBarArea = `
    <div class="meter-group">
    <div class="label roboto-condensed-upper"><span>Inebriation Points</span></div>
    <div class="meter inebriation progress" role="meter" aria-valuemin="0" aria-valuenow="${inebriation_points}" aria-valuemax="${inebriation_max}" style="--bar-percentage: ${inebriation_percent}%">
    
    <!-- Threshold Lines Container -->
        <div class="inebriation-thresholds">
            <div class="inebriation-threshold" style="left: ${tipsyThres}%;"></div>
            <div class="inebriation-threshold" style="left: ${drunkThres}%;"></div>
            <div class="inebriation-threshold" style="left: ${wastedThres}%;"></div>
        </div>
  
        <div class="bar"></div>    
    
    <div class="label inebriation-score">
             <span class="value">${inebriation_points}</span>
            <span class="separator">/</span>
            <span class="max">${inebriation_max}</span>
        </div>
    </div>
    </div>`;

    let counterArea = ""
    if (_sheet.options.classes.includes("dnd5e2")) {
        counterArea = $(html).find(".card .stats").children().last();
      } else {
        counterArea = $(html).find(".counters");
      }
    
    counterArea.after(progressBarArea);
  };

  async function add_inebriation_bar_to_tidy_quadrone_sheet(_sheet, html){
    let {inebriation_points, inebriation_max, inebriation_percent, tipsyThres, drunkThres, wastedThres} = await get_progressbar_data(_sheet);
    
    $(html).find(".sidebar ").children().first().before(
      `<div data-tidy-render-scheme="handlebars" class="inebriation-tidy5e-classic-container" style="margin-bottom: 0.76rem;position: relative;width: 100%;height: 20px;" title="Inebriation Points">
       
      <div class="resource-container svelte-129gcyy">
        
           <div class="bar null bar-alco svelte-qx955f" style="width: ${inebriation_percent}%; height: 85%; background: linear-gradient(to right, #2473a1 0%, #94a810 100%); position: absolute;"></div>

          <div class="inebriation-text" style="font-size: 0.9rem;">
           Inebriation: 
            <span type="number" placeholder="0" value="${inebriation_points}" class="resource-value" maxlength="5" aria-describedby="tooltip">${inebriation_points}</span>
            <span class="resource-separator">/</span>
            <span type="number" placeholder="0" value="${inebriation_max}" class="resource-max" maxlength="5" aria-describedby="tooltip">${inebriation_max}</span>
          
          </div>
          <div class="inebriation-thresholds" style="position: absolute; ">
            <div class="inebriation-threshold" style="left: ${tipsyThres}%; position: absolute;"></div>
            <div class="inebriation-threshold" style="left: ${drunkThres}%; position: absolute;"></div>
            <div class="inebriation-threshold" style="left: ${wastedThres}%; position: absolute;"></div>
          </div>
      </div>
      `);
  };

  async function add_inebriation_bar_to_tidy_classic_sheet(_sheet, html){
    let {inebriation_points, inebriation_max, inebriation_percent, tipsyThres, drunkThres, wastedThres} = await get_progressbar_data(_sheet);
    
    $(html).find(".side-panel").children().first().before(
      `<div data-tidy-render-scheme="handlebars" class="inebriation-tidy5e-classic-container" style="margin-bottom: 1.25rem;position: relative;width: 100%;" title="Inebriation Points">
       
      <div class="resource-container svelte-129gcyy">
        
           <div class="bar null bar-alco svelte-qx955f" style="width: ${inebriation_percent}%; background: linear-gradient(to right, #2473a1 0%, #94a810 100%); position: absolute;"></div>

          <div class="inebriation-text" style="font-size: 0.9rem;">
           Inebriation: 
            <span type="number" placeholder="0" value="${inebriation_points}" class="resource-value" maxlength="5" aria-describedby="tooltip">${inebriation_points}</span>
            <span class="resource-separator">/</span>
            <span type="number" placeholder="0" value="${inebriation_max}" class="resource-max" maxlength="5" aria-describedby="tooltip">${inebriation_max}</span>
          
          </div>
          <div class="inebriation-thresholds" style="position: absolute; ">
            <div class="inebriation-threshold" style="left: ${tipsyThres}%; position: absolute;"></div>
            <div class="inebriation-threshold" style="left: ${drunkThres}%; position: absolute;"></div>
            <div class="inebriation-threshold" style="left: ${wastedThres}%; position: absolute;"></div>
          </div>
      </div>
      `);
  };




async function add_inebriation_bar_to_old_dnd_sheet(_sheet, html){
  let {inebriation_points, inebriation_max, inebriation_percent, tipsyThres, drunkThres, wastedThres} = await get_progressbar_data(_sheet);
  
  let conditions = "";
  if ((inebriation_points / inebriation_max * 100) >= tipsyThres){
    conditions += "Tipsy"
  }
  if ((inebriation_points / inebriation_max * 100) >= drunkThres){
    conditions += ", Drunk"
  }
  if ((inebriation_points / inebriation_max * 100) >= wastedThres){
    conditions += ", Wasted"
  }

  let progressBarArea = `

  <li class="attribute inebriation">
  <h4 class="attribute-name box-title">Inebriation</h4>
  <div class="attribute-value">
                 <span class="value">${inebriation_points}</span>
          <span class="separator">/</span>
          <span class="max">${inebriation_max}</span>
  </div>
  <footer class="attribute-footer">
  ${conditions}
  </footer>
</li>`;

  let counterArea = "";
  counterArea = $(html).find(".movement");
  
  counterArea.after(progressBarArea);
};