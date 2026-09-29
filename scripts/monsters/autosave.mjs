// Shared helper for the monster abilities (Slippery Trail, Terror of the Barrom):
// roll the saving throw for the actor and apply the condition if it fails.
export async function rollSaveAndApply(actor, {ability, dc, condition, label}) {
    let rolls = await actor.rollSavingThrow({ability, target: dc}, {configure: false}, {create: true});
    let total = rolls?.[0]?.total;
    // No roll was made (e.g. the roll was cancelled), so there is nothing to apply
    if (total === undefined) return;

    let failed = total < dc;
    if (failed) await actor.toggleStatusEffect(condition, {active: true});

    let conditionName = condition.charAt(0).toUpperCase() + condition.slice(1);
    let result = failed
        ? `<span style="color:red">failed</span> and is now <b>${conditionName}</b>`
        : `<span style="color:green">passed</span>`;
    await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: `<p><b>${actor.name}</b> ${result} the ${label} save (${total} vs DC ${dc}).</p>`,
        style: CONST.CHAT_MESSAGE_STYLES.OTHER
    });
}
