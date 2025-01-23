new Dialog({
    title:'Drink Potency',
    content:`
      <form>
        <div class="form-group">
          <label>Potency of drink (empty to cancel):</label>
          <input type='text' name='inputField' value=1></input>
        </div>
      </form>`,
    buttons:{
      yes: {
        icon: "<i class='fas fa-check'></i>",
        label: `Post Potency.`
      },
  },
    default:'yes',
    close: html => {
      let result = html.find('input[name=\'inputField\']');
      if (result.val()!== '') {
          let potency = Number(result.val());
          if (game.user.targets.first() === undefined){
              var target = token.actor;
              console.log(target);
          } else {
              console.log("getting targeted");
              let targeted = game.user.targets.first();
              var target = targeted.actor;
          }
          console.log(target);
  
          let level = target.flags.inebriation_level;
          if (level === undefined){level = 0};
          let dc = 10 + potency + level;
          let content = `Potency of drink: <strong>${potency}</strong><br>Pre-existing inebriation level: <strong>${level}</strong><br><b>${target.name}</b> make a [[/save ability=con dc=${dc}]] save to avoid inebriation level.`;
          console.log(content);
          let chatData = {
              user: game.user._id,
              speaker: ChatMessage.getSpeaker(),
              content: content 
          };
          ChatMessage.create(chatData, {});
        }
      }
  }).render(true);