"use strict";

const JSON_URL = "data/life.json";

const RNG = RollerUtil.randomise;

// usage: _testRng(() => GenUtil.getFromTable(PARENTS_TIEFLING, RNG(8)))
function _testRng (rollFn) {
	const counts = {};
	for (let i = 0; i < 10000; ++i) {
		const roll = rollFn();
		const it = roll.display || roll.result;
		if (!counts[it]) counts[it] = 1;
		else counts[it]++;
	}
	return counts;
}

function rollSuppAlignment () {
	return GenUtil.getFromTable(SUPP_ALIGNMENT, RNG(6) + RNG(6) + RNG(6));
}
function rollSuppDeath () {
	return GenUtil.getFromTable(SUPP_DEATH, RNG(12));
}
function rollSuppClass () {
	return GenUtil.getFromTable(SUPP_CLASS, RNG(100));
}
function rollSuppOccupation () {
	return GenUtil.getFromTable(SUPP_OCCUPATION, RNG(100));
}
function rollSuppRace () {
	return GenUtil.getFromTable(SUPP_RACE, RNG(100));
}
function rollSuppRelationship () {
	return GenUtil.getFromTable(SUPP_RELATIONSHIP, RNG(4) + RNG(4) + RNG(4));
}
function rollSuppStatus () {
	return GenUtil.getFromTable(SUPP_STATUS, RNG(6) + RNG(6) + RNG(6));
}

function getPersonDetails (doRace, isParent) {
	const status = rollSuppStatus();
	const align = rollSuppAlignment().result;
	const occ = rollSuppOccupation().result;
	const relate = rollSuppRelationship().result;
	const out = [
		`<b>阵营：</b> ${align}`,
		`<b>工作职业：</b> ${occ}`,
		`<b>关系：</b> ${relate}`
	];
	if (!isParent) {
		out.push(`<b>状态：</b> ${status.result}`);
	}
	if (doRace) {
		const race = rollSuppRace().result;
		out.splice(index, 0, race);
	}
	return out;
}

function rollEvtAdventure () {
	return GenUtil.getFromTable(LIFE_EVENTS_ADVENTURES, RNG(100));
}
function rollEvtArcaneMatter () {
	return GenUtil.getFromTable(LIFE_EVENTS_ARCANE_MATTERS, RNG(10));
}
function rollEvtBoon () {
	return GenUtil.getFromTable(LIFE_EVENTS_BOONS, RNG(10));
}
function rollEvtCrime () {
	return GenUtil.getFromTable(LIFE_EVENTS_CRIME, RNG(8));
}
function rollEvtPunishment () {
	return GenUtil.getFromTable(LIFE_EVENTS_PUNISHMENT, RNG(12));
}
function rollEvtSupernatural () {
	return GenUtil.getFromTable(LIFE_EVENTS_SUPERNATURAL, RNG(100));
}
function rollEvtTragedy () {
	return GenUtil.getFromTable(LIFE_EVENTS_TRAGEDIES, RNG(12));
}
function rollEvtWar () {
	return GenUtil.getFromTable(LIFE_EVENTS_WAR, RNG(12));
}
function rollEvtWeird () {
	return GenUtil.getFromTable(LIFE_EVENTS_WEIRD_STUFF, RNG(12));
}

function choose (...lst) {
	return fmtChoice(rollOnArray(lst));
}

function chooseRender (...lst) {
	return fmtChoice(rollOnArray(lst), true);
}

function fmtChoice (str, render) {
	const raw = `({@i ${str}})`;
	return render ? Renderer.get().render(raw) : raw;
}

function rollOnArray (lst) {
	return lst[RNG(lst.length) - 1]
}

const RACES_SELECTABLE = ["Dwarf", "Elf", "Half-Elf", "Half-Orc", "Tiefling"];

const PARENTS_HALF_ELF = [
	{min: 1, max: 5, result: () => { const p = RNG(2); return `父母其中一方是精灵 ${fmtChoice(p === 1 ? "母亲" : "父亲")}，另一方是人类 ${fmtChoice(p === 1 ? "父亲" : "母亲")}。` }, display: "父母其中一方是精灵，另一方是人类。"},
	{min: 6, result: () => { const p = RNG(2); return `父母其中一方是精灵 ${fmtChoice(p === 1 ? "母亲" : "父亲")}，另一方是半精灵 ${fmtChoice(p === 1 ? "父亲" : "母亲")}。` }, display: "父母其中一方是精灵，另一方是半精灵。"},
	{min: 7, result: () => { const p = RNG(2); return `父母其中一方是人类 ${fmtChoice(p === 1 ? "母亲" : "父亲")}，另一方是半精灵 ${fmtChoice(p === 1 ? "父亲" : "母亲")}。` }, display: "父母其中一方是人类，另一方是半精灵。"},
	{min: 8, result: "双亲都是半精灵。"}
];

const PARENTS_HALF_ORC = [
	{min: 1, max: 3, result: () => { const p = RNG(2); return `父母其中一方是兽人 ${fmtChoice(p === 1 ? "母亲" : "父亲")}，另一方是人类 ${fmtChoice(p === 1 ? "父亲" : "母亲")}。` }, display: "父母其中一方是兽人，另一方是人类。"},
	{min: 4, max: 5, result: () => { const p = RNG(2); return `父母其中一方是兽人 ${fmtChoice(p === 1 ? "母亲" : "父亲")}，另一方是半兽人 ${fmtChoice(p === 1 ? "父亲" : "母亲")}。` }, display: "父母其中一方是兽人，另一方是半兽人。"},
	{min: 6, max: 7, result: () => { const p = RNG(2); return `父母其中一方是人类 ${fmtChoice(p === 1 ? "母亲" : "父亲")}，另一方是半兽人 ${fmtChoice(p === 1 ? "父亲" : "母亲")}。` }, display: "父母其中一方是人类，另一方是半兽人。"},
	{min: 8, display: "双亲都是半兽人。"}
];

const PARENTS_TIEFLING = [
	{min: 1, max: 4, display: "双亲都是人类，他们体内沉睡的炼狱血脉在你身上显现。"},
	{min: 5, max: 6, result: () => { const p = RNG(2); return `父母其中一方是提夫林 ${fmtChoice(p === 1 ? "母亲" : "父亲")}，另一方是人类 ${fmtChoice(p === 1 ? "父亲" : "母亲")}。` }, display: "父母其中一方是提夫林，另一方是人类。"},
	{min: 7, result: () => { const p = RNG(2); return `父母其中一方是提夫林 ${fmtChoice(p === 1 ? "母亲" : "父亲")}，另一方是魔鬼 ${fmtChoice(p === 1 ? "父亲" : "母亲")}。` }, display: "父母其中一方是提夫林，另一方是魔鬼。"},
	{min: 8, result: () => { const p = RNG(2); return `父母其中一方是人类 ${fmtChoice(p === 1 ? "母亲" : "父亲")}，另一方是魔鬼 ${fmtChoice(p === 1 ? "父亲" : "母亲")}。` }, display: "父母其中一方是人类，另一方是魔鬼。"}
];

const BIRTHPLACES = [
	{min: 1, max: 50, result: "家中"},
	{min: 51, max: 55, result: "家族友人的家中"},
	{min: 56, max: 63, result: () => `医者或产婆的家中 ${choose("医者", "产婆")}`, display: "医者或产婆的家中"},
	{min: 64, max: 65, result: () => `四轮马车、运货车、或运货马车 ${choose("四轮马车", "运货车", "运货马车")}`, display: "四轮马车、运货车、或运货马车"},
	{min: 66, max: 68, result: () => `谷仓、牲舍、或其他附属建筑 ${choose("谷仓", "牲舍", "附属建筑")}`, display: "谷仓、牲舍、或其他附属建筑"},
	{min: 69, max: 70, result: "洞穴"},
	{min: 71, max: 72, result: "原野"},
	{min: 73, max: 74, result: "森林"},
	{min: 75, max: 77, result: "神庙"},
	{min: 78, result: "战场"},
	{min: 79, max: 80, result: () => `巷弄或街道 ${choose("巷弄", "街道")}`, display: "巷弄或街道"},
	{min: 81, max: 82, result: () => `妓院、酒馆、或旅店 ${choose("妓院", "酒馆", "旅店")}`, display: "妓院、酒馆、或旅店"},
	{min: 83, max: 84, result: () => `城堡、要塞、高塔、或宫殿 ${choose("城堡", "要塞", "高塔", "宫殿")}`, display: "城堡、要塞、高塔、或宫殿"},
	{min: 85, result: () => `下水道或垃圾堆 ${choose("下水道", "垃圾堆")}`, display: "下水道或垃圾堆"},
	{min: 86, max: 88, result: "在不同种族的人群之中"},
	{min: 89, max: 91, result: () => `在舟艇或船舰上 ${choose("舟艇", "船舰")}`, display: "在舟艇或船舰上"},
	{min: 92, max: 93, result: () => `在监狱或一个秘密组织的总部中 ${choose("监狱", "秘密组织的总部")}`, display: "在监狱或一个秘密组织的总部中"},
	{min: 94, max: 95, result: "在一名学者的研究室"},
	{min: 96, result: "在妖精荒野"},
	{min: 97, result: "在堕影冥界"},
	{min: 98, result: () => `在星界位面或乙太位面 ${choose("星界位面", "乙太位面")}`, display: "在星界位面或乙太位面"},
	{min: 99, result: "在一个你所选择的内层位面"},
	{min: 100, result: "在一个你所选择的外层位面"}
];

function absentParent (parent) {
	return GenUtil.getFromTable(ABSENT_PARENT, RNG(4)).result.replace("父母", `$& ${fmtChoice(parent)}</i>`);
}

function absentBothParents () {
	const p = ["母亲", "父亲"][RNG(2) - 1];
	return `${absentParent(p)} ${absentParent(otherParent(p))}`;
}

function otherParent (parent) {
	return parent === "母亲" ? "父亲" : "母亲";
}

function singleParentOrStep (parent) {
	const p = RNG(2);
	return `单亲${parent} 或 继${parent} ${fmtChoice(p === 1 ? parent : `继${parent}`)}. ${p === 1 ? `${absentParent(otherParent(parent))}` : absentBothParents()}`
}

const FAMILY = [
	{min: 1, result: () => `无。 ${absentBothParents()}`, display: "无"},
	{min: 2, result: () => `公共机构，例如收容所。 ${absentBothParents()}`, display: "公共机构，例如收容所"},
	{min: 3, result: () => `神殿。 ${absentBothParents()}`, display: "神殿"},
	{min: 4, max: 5, result: () => `孤儿院。 ${absentBothParents()}`, display: "孤儿院"},
	{min: 6, max: 7, result: () => `监护人。 ${absentBothParents()}`, display: "监护人"},
	{min: 8, max: 15, result: () => `父亲或母亲家族的姨母或叔父，或者两者皆具；或者是如同部落或氏族的大家族 ${choose("叔父", "姨母", "叔父和姨母", "如同部落或氏族的大家族")}. ${absentBothParents()}`, display: "父亲或母亲家族的姨母或叔父，或者两者皆具；或者是如同部落或氏族的大家族"},
	{min: 16, max: 25, result: () => `祖父母或外祖父母 ${choose("祖父", "外祖母", "祖父和外祖母")}. ${absentBothParents()}`, display: "祖父母或外祖父母"},
	{min: 26, max: 35, result: () => `领养家庭 (相同或不同种族) ${choose("相同种族", "不同种族")}. ${absentBothParents()}`, display: "领养家庭 (相同或不同种族)"},
	{min: 36, max: 55, result: () => singleParentOrStep("父亲"), display: "单亲父亲 或 继父"},
	{min: 56, max: 75, result: () => singleParentOrStep("母亲"), display: "单亲母亲 或 继母"},
	{min: 76, max: 100, result: "父母亲"}
];

const ABSENT_PARENT = [
	{min: 1, result: () => `你父母双亡 (${rollSuppDeath().result.lowercaseFirst()})。`, display: "你父母双亡 (roll on the {@table Supplemental Tables; Cause of Death|XGE|Cause of Death} supplemental table)."},
	{min: 2, result: () => `你的父母被监禁、奴役、或因为其他原因而被带走 ${choose("监禁", "奴役", "其他原因")}。`, display: "你的父母被监禁、奴役、或因为其他原因而被带走。"},
	{min: 3, result: "你的父母遗弃了你。"},
	{min: 4, result: "你的父母不知去向。Your parent disappeared to an unknown fate."}
];

const FAMILY_LIFESTYLE = [
	{min: 3, result: "悲惨 (-40)", "modifier": -40},
	{min: 4, max: 5, result: "困苦 (-20)", "modifier": -20},
	{min: 6, max: 8, result: "贫穷 (-10)", "modifier": -10},
	{min: 9, max: 12, result: "简朴 (+0)", "modifier": 0},
	{min: 13, max: 15, result: "舒适 (+10)", "modifier": 10},
	{min: 16, max: 17, result: "富裕 (+20)", "modifier": 20},
	{min: 18, result: "奢华 (+40)", "modifier": 40}
];

const CHILDHOOD_HOME = [
	{min: 0, result: "On the streets"},
	{min: 1, max: 20, result: "Rundown shack"},
	{min: 21, max: 30, result: "No permanent residence; you moved around a lot"},
	{min: 31, max: 40, result: () => `Encampment or village ${choose("encampment", "village")} in the wilderness`, display: "Encampment or village in the wilderness"},
	{min: 41, max: 50, result: "Apartment in a rundown neighborhood"},
	{min: 51, max: 70, result: "Small house"},
	{min: 71, max: 90, result: "Large house"},
	{min: 91, max: 110, result: "豪宅"},
	{min: 111, result: () => `宫殿或城堡 ${choose("宫殿", "城堡")}`, display: "宫殿或城堡"}
];

const CHILDHOOD_MEMORIES = [
	{min: 3, result: "I am still haunted by my childhood, when I was treated badly by my peers."},
	{min: 4, max: 5, result: "I spent most of my childhood alone, with no close friends."},
	{min: 6, max: 8, result: "Others saw me as being different or strange, and so I had few companions."},
	{min: 9, max: 12, result: "I had a few close friends and lived an ordinary childhood."},
	{min: 13, max: 15, result: "I had several friends, and my childhood was generally a happy one."},
	{min: 16, max: 17, result: "I always found it easy to make friends, and I loved being around people."},
	{min: 18, result: "Everyone knew who I was, and I had friends everywhere I went."}
];

const LIFE_EVENTS_AGE = [
	{min: 1, max: 20, "age": () => RNG(20), result: "20岁或更年轻", "events": 1},
	{min: 21, max: 59, "age": () => RNG(10) + 20, result: "21\u201430岁", "events": () => RNG(4)},
	{min: 60, max: 69, "age": () => RNG(10) + 30, result: "31\u201440岁", "events": () => RNG(6)},
	{min: 70, max: 89, "age": () => RNG(10) + 40, result: "41\u201450岁", "events": () => RNG(8)},
	{min: 90, max: 99, "age": () => RNG(10) + 50, result: "51\u201460岁", "events": () => RNG(10)},
	{min: 100, "age": () => RNG(690) + 60, result: "61岁或更老", "events": () => RNG(12)} // max age = 750; max elven age
];

function _lifeEvtResult (title, rollResult) {
	const out = {
		result: `${title}: ${rollResult.result}`
	};
	if (rollResult.nextRoll) out.nextRoll = rollResult.nextRoll;
	return out;
}

function _lifeEvtResultArr (title, titles, ...rollResults) {
	return {
		title: title,
		result: titles.map((it, i) => `${it}: ${rollResults[i].result}`)
	}
}

let marriageIndex = 0;
function _lifeEvtPerson (title, personDetails) {
	return {
		title: title,
		result: personDetails
	}
}

const LIFE_EVENTS = [
	{min: 1, max: 10, result: "You suffered a tragedy. Roll on the Tragedies table.", nextRoll: () => _lifeEvtResult("Tragedy", rollEvtTragedy())},
	{min: 11, max: 20, result: "You gained a bit of good fortune. Roll on the Boons table.", nextRoll: () => _lifeEvtResult("Boon", rollEvtBoon())},
	{min: 21, max: 30, result: "You fell in love or got married. If you get this result more than once, you can choose to have a child instead. Work with your DM to determine the identity of your love interest.", nextRoll: () => _lifeEvtPerson(marriageIndex++ === 0 ? "Spouse" : "Spouse/Child", getPersonDetails())},
	{min: 31, max: 40, result: () => `You made an enemy of an adventurer. Roll a {@dice d6} ${fmtChoice(RNG(6))}. An odd number indicates you are to blame for the rift, and an even number indicates you are blameless. Use the supplemental tables and work with your DM to determine this hostile character's identity and the danger this enemy poses to you.`, display: "You made an enemy of an adventurer. Roll a {@dice d6}. An odd number indicates you are to blame for the rift, and an even number indicates you are blameless. Use the supplemental tables and work with your DM to determine this hostile character's identity and the danger this enemy poses to you.", nextRoll: () => _lifeEvtPerson("Enemy", getPersonDetails())},
	{min: 41, max: 50, result: "You made a friend of an adventurer. Use the supplemental tables and work with your DM to add more detail to this friendly character and establish how your friendship began.", nextRoll: () => _lifeEvtPerson("Friend", getPersonDetails())},
	{min: 51, max: 70, result: () => `You spent time working in a job related to your background. Start the game with an extra {@dice 2d6} ${fmtChoice(RNG(6) + RNG(6))} gp.`, display: "You spent time working in a job related to your background. Start the game with an extra {@dice 2d6} gp."},
	{min: 71, max: 75, result: "You met someone important. Use the supplemental tables to determine this character's identity and how this individual feels about you. Work out additional details with your DM as needed to fit this character into your backstory.", nextRoll: () => _lifeEvtPerson("Meeting", getPersonDetails())},
	{min: 76, max: 80, result: "You went on an adventure. Roll on the Adventures table to see what happened to you. Work with your DM to determine the nature of the adventure and the creatures you encountered.", nextRoll: () => _lifeEvtResult("Adventure", rollEvtAdventure())},
	{min: 81, max: 85, result: "You had a supernatural experience. Roll on the Supernatural Events table to find out what it was.", nextRoll: () => _lifeEvtResult("Supernatural Experience", rollEvtSupernatural())},
	{min: 86, max: 90, result: "You fought in a battle. Roll on the War table to learn what happened to you. Work with your DM to come up with the reason for the battle and the factions involved. It might have been a small conflict between your community and a band of orcs, or it could have been a major battle in a larger war.", nextRoll: () => _lifeEvtResult("War", rollEvtWar())},
	{min: 91, max: 95, result: "You committed a crime or were wrongly accused of doing so. Roll on the Crime table to determine the nature of the offense and on the Punishment table to see what became of you.", nextRoll: () => _lifeEvtResultArr("Crime and Punishment", ["Crime", "Punishment"], rollEvtCrime(), rollEvtPunishment())},
	{min: 96, max: 99, result: "You encountered something magical. Roll on the Arcane Matters table.", nextRoll: () => _lifeEvtResult("Arcane Matter", rollEvtArcaneMatter())},
	{min: 100, result: "Something truly strange happened to you. Roll on the Weird Stuff table.", nextRoll: () => _lifeEvtResult("Weird Stuff", rollEvtWeird())}
];

const LIFE_EVENTS_ADVENTURES = [
	{min: 1, max: 10, result: () => `You nearly died. You have nasty scars on your body, and you are missing an ear, {@dice 1d3} ${fmtChoice(RNG(3))} fingers, or {@dice 1d4} ${fmtChoice(RNG(4))} toes.`, display: "You nearly died. You have nasty scars on your body, and you are missing an ear, {@dice 1d3} fingers, or {@dice 1d4} toes."},
	{min: 11, max: 20, result: "You suffered a grievous injury. Although the wound healed, it still pains you from time to time."},
	{min: 21, max: 30, result: "You were wounded, but in time you fully recovered."},
	{min: 31, max: 40, result: "You contracted a disease while exploring a filthy warren. You recovered from the disease, but you have a persistent cough, pockmarks on your skin, or prematurely gray hair."},
	{min: 41, max: 50, result: "You were poisoned by a trap or a monster. You recovered, but the next time you must make a saving throw against poison, you make the saving throw with disadvantage."},
	{min: 51, max: 60, result: "You lost something of sentimental value to you during your adventure. Remove one trinket from your possessions."},
	{min: 61, max: 70, result: "You were terribly frightened by something you encountered and ran away, abandoning your companions to their fate."},
	{min: 71, max: 80, result: "You learned a great deal during your adventure. The next time you make an ability check or a saving throw, you have advantage on the roll."},
	{min: 81, max: 90, result: () => `You found some treasure on your adventure. You have {@dice 2d6} ${fmtChoice(RNG(6) + RNG(6))} gp left from your share of it.`, display: "You found some treasure on your adventure. You have {@dice 2d6} gp left from your share of it."},
	{min: 91, max: 99, result: () => `You found a considerable amount of treasure on your adventure. You have {@dice 1d20 + 50} ${fmtChoice(RNG(20) + 50)} gp left from your share of it.`, display: "You found a considerable amount of treasure on your adventure. You have {@dice 1d20 + 50} gp left from your share of it."},
	{min: 100, result: "You came across a common magic item (of the DM's choice)."}
];

const LIFE_EVENTS_ARCANE_MATTERS = [
	{min: 1, result: "You were charmed or frightened by a spell."},
	{min: 2, result: "You were injured by the effect of a spell."},
	{min: 3, result: "You witnessed a powerful spell being cast by a cleric, a druid, a sorcerer, a warlock, or a wizard."},
	{min: 4, result: "You drank a potion (of the DM's choice)."},
	{min: 5, result: "You found a spell scroll (of the DM's choice) and succeeded in casting the spell it contained."},
	{min: 6, result: "You were affected by teleportation magic."},
	{min: 7, result: "You turned invisible for a time."},
	{min: 8, result: "You identified an illusion for what it was."},
	{min: 9, result: "You saw a creature being conjured by magic."},
	{min: 10, result: () => `Your fortune was read by a diviner. Roll twice on the Life Events table, but don't apply the results. Instead, the DM picks one event as a portent of your future (which might or might not come true). ${fmtChoice(GenUtil.getFromTable(LIFE_EVENTS, RNG(100)).display || GenUtil.getFromTable(LIFE_EVENTS, RNG(100)).result)} ${fmtChoice(GenUtil.getFromTable(LIFE_EVENTS, RNG(100)).display || GenUtil.getFromTable(LIFE_EVENTS, RNG(100)).result)}`, display: "Your fortune was read by a diviner. Roll twice on the Life Events table, but don't apply the results. Instead, the DM picks one event as a portent of your future (which might or might not come true)."}
];

const LIFE_EVENTS_BOONS = [
	{min: 1, result: "A friendly wizard gave you a spell scroll containing one cantrip (of the DM's choice)."},
	{min: 2, result: "You saved the life of a commoner, who now owes you a life debt. This individual accompanies you on your travels and performs mundane tasks for you, but will leave if neglected, abused, or imperiled. Determine details about this character by using the supplemental tables and working with your DM."},
	{min: 3, result: "You found a riding horse."},
	{min: 4, result: () => `You found some money. You have {@dice 1d20} ${fmtChoice(RNG(20))} gp in addition to your regular starting funds.`, display: "You found some money. You have {@dice 1d20} gp in addition to your regular starting funds."},
	{min: 5, result: "A relative bequeathed you a simple weapon of your choice."},
	{min: 6, result: () => `You found something interesting. You gain one additional trinket ${fmtChoice(rollTrinket())}.`, display: "You found something interesting. You gain one additional trinket."},
	{min: 7, result: "You once performed a service for a local temple. The next time you visit the temple, you can receive healing up to your hit point maximum."},
	{min: 8, result: "A friendly alchemist gifted you with a potion of healing or a flask of acid, as you choose."},
	{min: 9, result: "You found a treasure map."},
	{min: 10, result: () => `A distant relative left you a stipend that enables you to live at the comfortable lifestyle for {@dice 1d20} ${fmtChoice(RNG(20))} years. If you choose to live at a higher lifestyle, you reduce the price of the lifestyle by 2 gp during that time period.`, display: "A distant relative left you a stipend that enables you to live at the comfortable lifestyle for {@dice 1d20} years. If you choose to live at a higher lifestyle, you reduce the price of the lifestyle by 2 gp during that time period."}
];

const LIFE_EVENTS_CRIME = [
	{min: 1, result: "Murder"},
	{min: 2, result: "Theft"},
	{min: 3, result: "Burglary"},
	{min: 4, result: "Assault"},
	{min: 5, result: "Smuggling"},
	{min: 6, result: "Kidnapping"},
	{min: 7, result: "Extortion"},
	{min: 8, result: "Counterfeiting"}
];

const LIFE_EVENTS_PUNISHMENT = [
	{min: 1, max: 3, result: "You did not commit the crime and were exonerated after being accused."},
	{min: 4, max: 6, result: "You committed the crime or helped do so, but nonetheless the authorities found you not guilty."},
	{min: 7, max: 8, result: "You were nearly caught in the act. You had to flee and are wanted in the community where the crime occurred."},
	{min: 9, max: 12, result: () => `You were caught and convicted. You spent time in jail, chained to an oar, or performing hard labor. You served a sentence of {@dice 1d4} years ${fmtChoice(RNG(4))} or succeeded in escaping after that much time.`, display: "You were caught and convicted. You spent time in jail, chained to an oar, or performing hard labor. You served a sentence of {@dice 1d4} years or succeeded in escaping after that much time."}
];

const LIFE_EVENTS_SUPERNATURAL = [
	{min: 1, max: 5, result: () => `You were ensorcelled by a fey and enslaved for {@dice 1d6} ${fmtChoice(RNG(6))} years before you escaped.`, display: "You were ensorcelled by a fey and enslaved for {@dice 1d6} years before you escaped."},
	{min: 6, max: 10, result: "You saw a demon and ran away before it could do anything to you."},
	{min: 11, max: 15, result: () => `A devil tempted you. Make a DC 10 Wisdom saving throw. On a failed save, your alignment shifts one step toward evil (if it's not evil already), and you start the game with an additional {@dice 1d20 + 50} ${fmtChoice(RNG(20) + 50)} gp.`, display: "A devil tempted you. Make a DC 10 Wisdom saving throw. On a failed save, your alignment shifts one step toward evil (if it's not evil already), and you start the game with an additional {@dice 1d20 + 50} gp."},
	{min: 16, max: 20, result: "You woke up one morning miles from your home, with no idea how you got there."},
	{min: 21, max: 30, result: "You visited a holy site and felt the presence of the divine there."},
	{min: 31, max: 40, result: "You witnessed a falling red star, a face appearing in the frost, or some other bizarre happening. You are certain that it was an omen of some sort."},
	{min: 41, max: 50, result: "You escaped certain death and believe it was the intervention of a god that saved you."},
	{min: 51, max: 60, result: "You witnessed a minor miracle."},
	{min: 61, max: 70, result: "You explored an empty house and found it to be haunted."},
	{min: 71, max: 75, result: () => { const p = RNG(6); return `You were briefly possessed. Roll a {@dice d6} to determine what type of creature possessed you: 1, celestial; 2, devil; 3, demon; 4, fey; 5, elemental; 6, undead ${fmtChoice(`${p}; ${["celestial", "devil", "demon", "fey", "elemental", "undead"][p - 1]}`)}.` }, display: "You were briefly possessed. Roll a {@dice d6} to determine what type of creature possessed you: 1, celestial; 2, devil; 3, demon; 4, fey; 5, elemental; 6, undead."},
	{min: 76, max: 80, result: "You saw a ghost."},
	{min: 81, max: 85, result: "You saw a ghoul feeding on a corpse."},
	{min: 86, max: 90, result: "A celestial or a fiend visited you in your dreams to give a warning of dangers to come."},
	{min: 91, max: 95, result: () => `You briefly visited the Feywild or the Shadowfell ${choose("Feywild", "Shadowfell")}.`, "results": "You briefly visited the Feywild or the Shadowfell."},
	{min: 96, max: 100, result: "You saw a portal that you believe leads to another plane of existence."}
];

const LIFE_EVENTS_TRAGEDIES = [
	{min: 1, max: 2, result: () => `A family member or a close friend died. Roll on the {@table Supplemental Tables; Cause of Death|XGE|Cause of Death} supplemental table to find out how.`, display: "A family member or a close friend died. Roll on the Cause of Death supplemental table to find out how.", nextRoll: () => _lifeEvtResult("Cause of Death", rollSuppDeath())},
	{min: 3, result: "A friendship ended bitterly, and the other person is now hostile to you. The cause might have been a misunderstanding or something you or the former friend did."},
	{min: 4, result: "You lost all your possessions in a disaster, and you had to rebuild your life."},
	{min: 5, result: () => `You were imprisoned for a crime you didn't commit and spent {@dice 1d6} ${fmtChoice(RNG(6))} years at hard labor, in jail, or shackled to an oar in a slave galley.`, display: "You were imprisoned for a crime you didn't commit and spent {@dice 1d6} years at hard labor, in jail, or shackled to an oar in a slave galley."},
	{min: 6, result: "War ravaged your home community, reducing everything to rubble and ruin. In the aftermath, you either helped your town rebuild or moved somewhere else."},
	{min: 7, result: "A lover disappeared without a trace. You have been looking for that person ever since."},
	{min: 8, result: "A terrible blight in your home community caused crops to fail, and many starved. You lost a sibling or some other family member."},
	{min: 9, result: "You did something that brought terrible shame to you in the eyes of your family. You might have been involved in a scandal, dabbled in dark magic, or offended someone important. The attitude of your family members toward you becomes indifferent at best, though they might eventually forgive you."},
	{min: 10, result: "For a reason you were never told, you were exiled from your community. You then either wandered in the wilderness for a time or promptly found a new place to live."},
	{min: 11, result: () => `A romantic relationship ended. Roll a {@dice d6} ${fmtChoice(RNG(6))}. An odd number means it ended with bad feelings, while an even number means it ended amicably.`, display: "A romantic relationship ended. Roll a {@dice d6}. An odd number means it ended with bad feelings, while an even number means it ended amicably."},
	{min: 12, result: () => `A current or prospective romantic partner of yours died. Roll on the {@table Supplemental Tables; Cause of Death|XGE|Cause of Death} supplemental table to find out how. If the result is murder, roll a {@dice d12}. On a 1, you were responsible, whether directly or indirectly.`, display: "A current or prospective romantic partner of yours died. Roll on the {@table Supplemental Tables; Cause of Death|XGE|Cause of Death} supplemental table to find out how. If the result is murder, roll a {@dice d12}. On a 1, you were responsible, whether directly or indirectly.", nextRoll: () => _lifeEvtResult("Cause of Death", (() => { const r = RNG(12); const p = GenUtil.getFromTable(SUPP_DEATH, r); return {result: `${p.result}${r === 2 && RNG(12) === 1 ? ` ${fmtChoice("you were responsible")}` : ""}`} })())}
];

const LIFE_EVENTS_WAR = [
	{min: 1, result: "You were knocked out and left for dead. You woke up hours later with no recollection of the battle."},
	{min: 2, max: 3, result: "You were badly injured in the fight, and you still bear the awful scars of those wounds."},
	{min: 4, result: "You ran away from the battle to save your life, but you still feel shame for your cowardice."},
	{min: 5, max: 7, result: "You suffered only minor injuries, and the wounds all healed without leaving scars."},
	{min: 8, max: 9, result: "You survived the battle, but you suffer from terrible nightmares in which you relive the experience."},
	{min: 10, max: 11, result: "You escaped the battle unscathed, though many of your friends were injured or lost."},
	{min: 12, result: "You acquitted yourself well in battle and are remembered as a hero. You might have received a medal for your bravery."}
];

const LIFE_EVENTS_WEIRD_STUFF = [
	{min: 1, result: () => `You were turned into a toad and remained in that form for {@dice 1d4} ${fmtChoice(RNG(4))} weeks.`, display: "You were turned into a toad and remained in that form for {@dice 1d4} weeks."},
	{min: 2, result: "You were petrified and remained a stone statue for a time until someone freed you."},
	{min: 3, result: () => `You were enslaved by a hag, a satyr, or some other being and lived in that creature's thrall for {@dice 1d6} ${fmtChoice(RNG(6))} years.`, display: "You were enslaved by a hag, a satyr, or some other being and lived in that creature’s thrall for {@dice 1d6} years."},
	{min: 4, result: () => `A dragon held you as a prisoner for {@dice 1d4} ${fmtChoice(RNG(4))} months until adventurers killed it.`, display: "A dragon held you as a prisoner for {@dice 1d4} months until adventurers killed it."},
	{min: 5, result: "You were taken captive by a race of evil humanoids such as drow, kuo-toa, or quaggoths. You lived as a slave in the Underdark until you escaped."},
	{min: 6, result: "You served a powerful adventurer as a hireling. You have only recently left that service. Use the supplemental tables and work with your DM to determine the basic details about your former employer."},
	{min: 7, result: () => `You went insane for {@dice 1d6} ${fmtChoice(RNG(6))} years and recently regained your sanity. A tic or some other bit of odd behavior might linger.`, display: "You went insane for {@dice 1d6} years and recently regained your sanity. A tic or some other bit of odd behavior might linger."},
	{min: 8, result: "A lover of yours was secretly a silver dragon."},
	{min: 9, result: "You were captured by a cult and nearly sacrificed on an altar to the foul being the cultists served. You escaped, but you fear they will find you."},
	{min: 10, result: () => `You met a demigod, an archdevil, an archfey, a demon lord, or a titan, ${choose("demigod", "archdevil", "archfey", "demon lord", "titan")} and you lived to tell the tale.`, display: "You met a demigod, an archdevil, an archfey, a demon lord, or a titan, and you lived to tell the tale."},
	{min: 11, result: "You were swallowed by a giant fish and spent a month in its gullet before you escaped."},
	{min: 12, result: () => `A powerful being granted you a wish, but you squandered it on something frivolous.`, display: "A powerful being granted you a wish, but you squandered it on something frivolous."}
];

const SUPP_ALIGNMENT = [
	{min: 1, max: 3, result: () => rollOnArray(["混乱邪恶", "混乱中立"]), display: "混乱邪恶(50%) 或 混乱中立(50%)"},
	{min: 4, max: 5, result: "守序邪恶"},
	{min: 6, max: 8, result: "中立邪恶"},
	{min: 9, max: 12, result: "绝对中立"},
	{min: 13, max: 15, result: "中立善良"},
	{min: 16, max: 17, result: () => rollOnArray(["守序善良", "守序中立"]), display: "守序善良(50%) 或 守序中立(50%)"},
	{min: 18, result: () => rollOnArray(["混乱善良", "混乱中立"]), display: "混乱善良(50%) 或 混乱中立(50%)"}
];

const SUPP_DEATH = [
	{min: 1, result: "死因不明"},
	{min: 2, result: "被谋杀"},
	{min: 3, result: "在战斗中被杀"},
	{min: 4, result: "Accident related to class or occupation"},
	{min: 5, result: "Accident unrelated to class or occupation"},
	{min: 6, max: 7, result: "Natural causes, such as disease or old age"},
	{min: 8, result: "Apparent suicide"},
	{min: 9, result: () => `Torn apart by an animal or a natural disaster ${choose("animal", "natural disaster")}`, display: "Torn apart by an animal or a natural disaster"},
	{min: 10, result: () => "Consumed by a monster"},
	{min: 11, result: () => `Executed for a crime or tortured to death ${choose("executed for a crime", "tortured to death")}`, display: "Executed for a crime or tortured to death"},
	{min: 12, result: "Bizarre event, such as being hit by a meteorite, struck down by an angry god, or killed by a hatching slaad egg"}
];

const SUPP_CLASS = [
	{min: 1, max: 7, result: "野蛮人"},
	{min: 8, max: 14, result: "吟游诗人"},
	{min: 15, max: 29, result: "牧师"},
	{min: 30, max: 36, result: "德鲁伊"},
	{min: 37, max: 52, result: "战士"},
	{min: 53, max: 58, result: "武僧"},
	{min: 59, max: 64, result: "圣骑士"},
	{min: 65, max: 70, result: "游侠"},
	{min: 71, max: 84, result: "盗贼"},
	{min: 85, max: 89, result: "术士"},
	{min: 90, max: 94, result: "契术师"},
	{min: 95, max: 100, result: "法师"}
];

const SUPP_OCCUPATION = [
	{min: 1, max: 5, result: "学者"},
	{min: 6, max: 10, result: () => `冒险者(${rollSuppClass().result})`, display: "冒险者 (从职业表中掷骰决定)"},
	{min: 11, result: "贵族"},
	{min: 12, max: 26, result: () => `工匠 或 公会成员 ${choose("工匠", "公会成员")}`, display: "工匠 或 公会成员"},
	{min: 27, max: 31, result: "罪犯"},
	{min: 32, max: 36, result: "艺人"},
	{min: 37, max: 38, result: () => `放逐者、隐士、或 难民 ${choose("放逐者", "隐士", "难民")}`, display: "放逐者、隐士、或 难民"},
	{min: 39, max: 43, result: () => `探险家 或 浪人 ${choose("探险家", "浪人")}`, display: "探险家 或 浪人"},
	{min: 44, max: 55, result: () => `农夫 或 牧人 ${choose("农夫", "牧人")}`, display: "农夫 或 牧人"},
	{min: 56, max: 60, result: () => `猎人 或 陷阱捕兽者 ${choose("猎人", "陷阱捕兽者")}`, display: "猎人 或 陷阱捕兽者"},
	{min: 61, max: 75, result: "劳工"},
	{min: 76, max: 80, result: "商人"},
	{min: 81, max: 85, result: () => `政治家 或 官僚 ${choose("政治家", "官僚")}`, display: "政治家 或 官僚"},
	{min: 86, max: 90, result: "祭司"},
	{min: 91, max: 95, result: "水手"},
	{min: 96, max: 100, result: "士兵"}
];

const SUPP_RACE = [
	{min: 1, max: 40, result: "人类"},
	{min: 41, max: 50, result: "矮人"},
	{min: 51, max: 60, result: "精灵"},
	{min: 61, max: 70, result: "半身人"},
	{min: 71, max: 75, result: "龙裔"},
	{min: 76, max: 80, result: "地侏"},
	{min: 81, max: 85, result: "半精灵"},
	{min: 86, max: 90, result: "半兽人"},
	{min: 91, max: 95, result: "提夫林"},
	{min: 96, max: 100, result: "由DM决定"}
];

const SUPP_RELATIONSHIP = [
	{min: 3, max: 4, result: "敌对"},
	{min: 5, max: 10, result: "友善"},
	{min: 11, max: 12, result: "冷淡"}
];

const SUPP_STATUS = [
	{min: 3, result: () => { return `死亡 (${rollSuppDeath().result.lowercaseFirst()})` }, display: "死亡 (从死因表中掷骰决定)", "dead": true},
	{min: 4, max: 5, result: () => `失踪 或 状况不明 ${choose("失踪", "状况不明")}`, display: "失踪 或 状况不明"},
	{min: 6, max: 8, result: () => `活着，但因为重伤、经济困难、或人际难题${choose("重伤", "经济困难", "人际难题")}而过得很糟糕`, display: "活着，但因为重伤、经济困难、或人际难题而过得很糟糕"},
	{min: 9, max: 12, result: "活着，且过得不错"},
	{min: 13, max: 15, result: "活着，且颇有成就"},
	{min: 16, max: 17, result: "活着，且恶名昭彰"},
	{min: 18, result: "活着，且享誉盛名"}
];

window.onload = function load () {
	ExcludeUtil.pInitialise(); // don't await, as this is only used for search
	DataUtil.loadJSON(JSON_URL).then(onJsonLoad);
};

let classList;
let bgList;
let trinketList;
let $selCha;
let $selRace;
let $selBg;
let $selClass;

function rollTrinket () {
	return rollOnArray(trinketList);
}

function onJsonLoad (data) {
	bgList = data.lifeBackground.sort((a, b) => SortUtil.ascSort(a.name, b.name));
	classList = data.lifeClass.sort((a, b) => SortUtil.ascSort(a.name, b.name));
	trinketList = data.lifeTrinket;

	$selRace = $(`#race`);
	$selCha = $(`#cha`);
	$selBg = $(`#background`);
	$selClass = $(`#class`);

	$selRace.append(`<option value="Random" selected>随机</option>`);
	$selRace.append(`<option value="Other">其他</option>`);
	RACES_SELECTABLE.forEach(r => $selRace.append(`<option value="${r}">${Parser.RaceToDisplay(r)}</option>`));
	for (let i = -5; i <= 5; ++i) {
		$selCha.append(`<option value="${i}" ${i === 0 ? "selected" : ""}>${i >= 0 ? "+" : ""}${i}</option>`)
	}
	$selBg.append(`<option value="-1" selected>随机</option>`);
	bgList.forEach((b, i) => $selBg.append(`<option value="${i}">${b.name}</option>`));
	$selClass.append(`<option value="-1" selected>随机</option>`);
	classList.forEach((c, i) => $selClass.append(`<option value="${i}">${c.name}</option>`));
}

function concatSentences (...lst) {
	const stack = [];
	lst.filter(it => it).forEach(it => {
		if (typeof it === "string" || typeof it === "number") {
			stack.push(it);
		} else if (typeof it === "function") {
			stack.push(it());
		} else { // array
			Array.prototype.push.apply(stack, ...it)
		}
	});
	return joinParaList(stack);
}

function joinParaList (lst) {
	return lst.join(`<br>`);
}

const _VOWELS = ["a", "e", "i", "o", "u"];
function addN (name) {
	const c = name[0].toLowerCase();
	return _VOWELS.includes(c) ? "n" : "";
}

// SECTIONS ============================================================================================================
// generated in Parents, but used throughout
let knowParents;
let race;
// PARENTS
function sectParents () {
	knowParents = RNG(100) > 5;
	const selRace = $selRace.val();
	race = (() => {
		if (selRace === "Random") return GenUtil.getFromTable(SUPP_RACE, RNG(100)).result;
		else if (selRace === "Other") {
			// generate anything besides the values displayed in the dropdown
			let out;
			do out = GenUtil.getFromTable(SUPP_RACE, RNG(100)).result;
			while (RACES_SELECTABLE.includes(out));
			return out;
		} else return selRace;
	})();

	const $parents = $(`#parents`);
	const knowParentsStr = knowParents ? "<b>双亲：</b>你知道你的双亲是谁。" : "<b>双亲：</b>你不晓得你的双亲是什么人。";

	let parentage = null;
	if (knowParents) {
		switch (race.toLowerCase()) {
			case "half-elf":
				parentage = `<b>${Parser.RaceToDisplay(race)}双亲：</b> ${GenUtil.getFromTable(PARENTS_HALF_ELF, RNG(8)).result}`;
				break;
			case "half-orc":
				parentage = `<b>${Parser.RaceToDisplay(race)}双亲：</b> ${GenUtil.getFromTable(PARENTS_HALF_ORC, RNG(8)).result}`;
				break;
			case "tiefling":
				parentage = `<b>${Parser.RaceToDisplay(race)}双亲：</b> ${GenUtil.getFromTable(PARENTS_TIEFLING, RNG(8)).result}`;
				break;
		}
	}

	if (selRace === "Other") {
		$parents.html(concatSentences(`<b>种族：</b> 其他 ${fmtChoice(`${Parser.RaceToDisplay(race)}; 使用{@table Supplemental Tables; Race|XGE|Supplemental Race}表生成`, true)}`, knowParentsStr, parentage));
	} else {
		$parents.html(concatSentences(`<b>种族：</b> ${Parser.RaceToDisplay(race)}${selRace === "Random" ? ` ${fmtChoice("使用{@table Supplemental Tables; Race|XGE|Supplemental Race}表生成", true)}` : ""}`, knowParentsStr, parentage));
	}

	if (knowParents) {
		const mum = getPersonDetails(false, true);
		const dad = getPersonDetails(false, true);
		$parents.append(`<h5>母亲</h5>`);
		$parents.append(joinParaList(mum));
		$parents.append(`<h5>父亲</h5>`);
		$parents.append(joinParaList(dad));
	}
}

// BIRTHPLACE
function sectBirthplace () {
	const $birthplace = $(`#birthplace`);
	const rollBirth = RNG(100);
	const birth = `<b>出生场所：</b> ${GenUtil.getFromTable(BIRTHPLACES, rollBirth).result}`;

	const strangeBirth = RNG(100) === 100 ? "A strange event coincided with your birth: the moon briefly turning red, all the milk within a mile spoiling, the water in the area freezing solid in midsummer, all the iron in the home rusting or turning to silver, or some other unusual event of your choice" : "";
	$birthplace.html(concatSentences(birth, strangeBirth));
}

// SIBLINGS
function sectSiblings () {
	const $siblings = $(`#siblings`);
	function getBirthOrder (rollBirthOrder) {
		if (rollBirthOrder < 3) {
			return "双、三、或四胞胎"
		} else if (rollBirthOrder < 8) {
			return "兄姊";
		} else {
			return "弟妹";
		}
	}
	function getBirthOrderAndGender (rollBirthOrder) {
		if (rollBirthOrder < 3) {
			return chooseRender("兄弟", "姊妹")
		} else if (rollBirthOrder < 8) {
			return chooseRender("哥哥", "姊姊");
		} else {
			return chooseRender("弟弟", "妹妹");
		}
	}
	const rollSibCount = RNG(5);
	let sibCount = 0;
	switch (rollSibCount) {
		case 2:
			sibCount = RNG(3);
			break;
		case 3:
			sibCount = RNG(4) + 1;
			break;
		case 4:
			sibCount = RNG(6) + 2;
			break;
		case 5:
			sibCount = RNG(8) + 3;
			break;
	}
	console.log(race);
	if (race === "Elf" || race === "Dwarf") {
		sibCount = Math.max(sibCount - 2, 0);
	}

	if (sibCount > 0) {
		$siblings.empty();
		$siblings.append(`<p>你有 ${sibCount} 个兄弟姊妹。</p>`);
		for (let i = 0; i < sibCount; ++i) {
			let rollBirthOrder = RNG(6) + RNG(6);
			let birth_order = getBirthOrder(rollBirthOrder);
			let gender_order = getBirthOrderAndGender(rollBirthOrder);
			$siblings.append(`<h5>${birth_order} ${gender_order}</h5>`);
			$siblings.append(joinParaList(getPersonDetails()));
		}
	} else {
		$siblings.html("你是家中的独生子。");
	}
}

// FAMILY
function sectFamily () {
	const $family = $(`#family`);
	$family.empty();
	$family.append(`<b>家族：</b> ${GenUtil.getFromTable(FAMILY, RNG(100)).result}<br>`);
	let famIndex = 1;
	const $btnSuppFam = $(`<button class="btn btn-xs btn-default btn-supp-fam noprint"></button>`).on("click", () => {
		const supDetails = getPersonDetails();
		const $wrpRes = $(`<div class="output-wrp-border"/>`);
		$wrpRes.append(`<h5>家族成员 掷骰结果${famIndex++}</h5>`);
		$wrpRes.append(joinParaList(supDetails));
		$btnSuppFam.css("margin-bottom", 5);
		$btnSuppFam.after($wrpRes);
	});
	$family.append(`<span class="note">你可以从关系表中掷骰决定你的家族成员或其他你人生中的重要人物是如何看待你的。你也可以使用种族、工作职业、和阵营表以决定更多关于家族成员或抚养你长大的监护人的情报。</span>`);
	$family.append($btnSuppFam);

	const rollFamLifestyle = GenUtil.getFromTable(FAMILY_LIFESTYLE, RNG(6) + RNG(6) + RNG(6));
	$family.append(`<b>家族生活风格：</b> ${rollFamLifestyle.result}<br>`);
	const rollFamHome = Math.min(Math.max(RNG(100) + rollFamLifestyle.modifier, 0), 111);
	const rollFamHomeRes = GenUtil.getFromTable(CHILDHOOD_HOME, rollFamHome).result;
	$family.append(`<b>童年家园：</b> ${rollFamHomeRes}<br>`);

	const rollChildMems = Math.min(Math.max(RNG(6) + RNG(6) + RNG(6) + Number($selCha.val()), 3), 18);
	$family.append(`<b>童年回忆：</b> ${GenUtil.getFromTable(CHILDHOOD_MEMORIES, rollChildMems).result}`);
}

// PERSONAL DECISIONS
function sectPersonalDecisions () {
	const $personal = $(`#personal`).empty();
	const selBg = Number($selBg.val());
	const myBg = selBg === -1 ? rollOnArray(bgList) : bgList[selBg];
	$personal.append(`<b>背景：</b> ${myBg.name}<br>`);
	$personal.append(`<b>我成为了一名${myBg.name}，因为：</b> ${rollOnArray(myBg.reasons)}`);
}

// CLASS TRAINING
function sectClassTraining () {
	const $clss = $(`#clss`).empty();
	const selClass = Number($selClass.val());
	const myClass = selClass === -1 ? rollOnArray(classList) : classList[selClass];
	$clss.append(`<b>职业：</b> ${myClass.name}<br>`);
	$clss.append(`<b>我成为了一名${myClass.name}，因为：</b> ${rollOnArray(myClass.reasons)}`);
}

// LIFE EVENTS
function sectLifeEvents () {
	const $events = $(`#events`).empty();
	marriageIndex = 0;
	const $selAge = $(`#age`);
	const age = GenUtil.getFromTable(LIFE_EVENTS_AGE, Number($selAge.val()) || RNG(100));
	$events.append(`<b>现在年纪：</b> ${age.result} ${fmtChoice(`${age.age}岁`, true)}`);
	for (let i = 0; i < age.events; ++i) {
		$events.append(`<h5>人生大事 ${i + 1}</h5>`);
		const evt = GenUtil.getFromTable(LIFE_EVENTS, RNG(100));
		$events.append(`${evt.result}<br>`);
		if (evt.nextRoll) {
			if (evt.nextRoll.title) {
				const $wrp = $(`<div class="output-wrp-border"/>`);
				$wrp.append(`<h5>${evt.nextRoll.title}</h5>`);
				$wrp.append(joinParaList(evt.nextRoll.result));
				$events.append($wrp);
			} else {
				$events.append(`${evt.nextRoll.result}<br>`);
				if (evt.nextRoll.nextRoll) {
					$events.append(`${evt.nextRoll.nextRoll.result}<br>`);
				}
			}
		}
	}
}

function roll () {
	$(`.output`).show();

	sectParents();
	sectBirthplace();
	sectSiblings();
	sectFamily();
	sectPersonalDecisions();
	sectClassTraining();
	sectLifeEvents();
}

window.addEventListener("load", () => {
	$(`#age`).on("change", function () {
		if ($(this).val()) {
			$(this).addClass("italic")
		} else {
			$(this).removeClass("italic")
		}
	});

	$(`#xge_link`).replaceWith(Renderer.get().render(`《{@book 姗纳萨的万事指南|XGE|1|This Is Your Life}》`));
});
