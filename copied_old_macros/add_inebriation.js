const potency = 1;

if (game.user.targets.first() === undefined){
            var target = token.actor;
            console.log(target);
        } else {
            console.log("getting targeted");
            let targeted = game.user.targets.first();
            var target = targeted.actor;
        }



const con_mod = target.system.abilities.con.mod;
const con_score = target.system.abilities.con.value;
let level = target.flags.inebriation_level;

if (level === undefined || level === 0) {
    target.update({"flags.inebriation_level": potency});
    level = potency;
    if (con_mod === 0){
        game.clt.applyCondition("Tipsy", target, {allowDuplicates: false, replaceExisting: true});
        console.log("Added Tipsy");
    }
}
else {
    level = potency + level;
    target.update({"flags.inebriation_level": level});
}
console.log(target);

let content = `${target.name} gained ${potency} inebriation level(s), now at ${level}`;

if (level === con_mod && con_mod > 0){
    game.clt.applyCondition("Tipsy", target, {allowDuplicates: false, replaceExisting: true});
    content += "<br>Became Tipsy";
}
if (level === Math.floor(con_score / 2)){
    game.clt.applyCondition("Drunk", target, {allowDuplicates: false, replaceExisting: true});
    content += "<br>Became Drunk";
}
if (level === (10 + con_mod)){
    game.clt.applyCondition(["Wasted", "Poisoned"], target, {allowDuplicates: false, replaceExisting: true});
content += "<br>Became Wasted and Poisoned";
}
if (level === con_score){
    game.clt.applyCondition("Incapacitated", target, {allowDuplicates: false, replaceExisting: true});
content += "<br>Became Incapacitated";
}

let chatData = {
	        user: game.user._id,
	        speaker: ChatMessage.getSpeaker(),
	        content: content
	    };
ChatMessage.create(chatData, {});