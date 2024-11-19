if (game.user.targets.first() === undefined){
    var target = token.actor;
    console.log(target);
} else {
    console.log("getting targeted");
    let targeted = game.user.targets.first();
    var target = targeted.actor;
}


target.update({"flags.inebriation_level":  0});
console.log(target.flags.inebriation_level);

const conditions = ["Tipsy", "Drunk", "Wasted", "Incapacitated", "Poisoned"];
for (i = 0 ; i < conditions.length; i++){
console.log("Removing", conditions[i]);
await game.clt.removeCondition(conditions[i], target, {"warn": false});

}