Hooks.on("renderActorSheet", (_sheet, html) => {
    let con_mod = _sheet.object.system.abilities.con.mod;
    let con_score = _sheet.object.system.abilities.con.value;

    let inebriation_max = con_score;
    let inebriation_points = _sheet.object.getFlag("dnd5e-alcohol", "inebriation") || 0;
    let inebriation_percent = Math.floor((inebriation_points / inebriation_max) * 100);

    let tipsyThres = Math.floor((Math.max(1, con_mod) / inebriation_max) * 100);
    let drunkThres = Math.floor(((con_score / 2) / inebriation_max) * 100);
    let wastedThres = Math.floor(((10 + con_mod) / inebriation_max) * 100);
    
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
    </div>`
    
    let counterArea = ""
    if (_sheet.options.classes.includes("dnd5e2")) {
        counterArea = $(html).find(".card .stats").children().last();
      } else {
        counterArea = $(html).find(".counters");
      }
    
    counterArea.after(progressBarArea);
  });