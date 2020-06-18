"use strict";

const JSON_DIR = "data/bestiary/";
const META_URL = "meta.json";
const FLUFF_INDEX = "fluff-index.json";
const JSON_LIST_NAME = "monster";
const ECGEN_BASE_PLAYERS = 4; // assume a party size of four
const renderer = Renderer.get();

window.PROF_MODE_BONUS = "bonus";
window.PROF_MODE_DICE = "dice";
window.PROF_DICE_MODE = PROF_MODE_BONUS;

function imgError (x) {
	if (x) $(x).remove();
	$(`#pagecontent th.name`).css("padding-right", "0.3em");
	$(`.mon__wrp-size-type-align`).css("max-width", "none");
	$(`.mon__wrp-hp`).css("max-width", "none");
}

function handleStatblockScroll (event, ele) {
	$(`#token_image`)
		.toggle(ele.scrollTop < 32)
		.css({
			opacity: (32 - ele.scrollTop) / 32,
			top: -ele.scrollTop
		});
}

const _MISC_FILTER_SPELLCASTER = "Spellcaster, ";
function ascSortMiscFilter (a, b) {
	if (a.includes(_MISC_FILTER_SPELLCASTER) && b.includes(_MISC_FILTER_SPELLCASTER)) {
		a = Parser.attFullToAbv(a.replace(_MISC_FILTER_SPELLCASTER, ""));
		b = Parser.attFullToAbv(b.replace(_MISC_FILTER_SPELLCASTER, ""));
		return SortUtil.ascSortAtts(b, a);
	} else return SortUtil.ascSort(a, b);
}

function getAllImmRest (toParse, key) {
	function recurse (it) {
		if (typeof it === "string") {
			out.push(it);
		} else if (it[key]) {
			it[key].forEach(nxt => recurse(nxt));
		}
	}
	const out = [];
	toParse.forEach(it => {
		recurse(it);
	});
	return out;
}

const meta = {};
const languages = {};

function pLoadMeta () {
	return new Promise(resolve => {
		DataUtil.loadJSON(JSON_DIR + META_URL)
			.then((data) => {
				// Convert the legendary Group JSONs into a look-up, i.e. use the name as a JSON property name
				data.legendaryGroup.forEach(lg => {
					meta[lg.source] = meta[lg.source] || {};
					meta[lg.source][lg.name] = lg;
				});

				Object.keys(data.language).forEach(k => languages[k] = data.language[k]);
				languageFilter.items = Object.keys(languages).sort((a, b) => SortUtil.ascSortLower(languages[a], languages[b]));
				resolve();
			});
	});
}

// for use in homebrew only
function addLegendaryGroups (toAdd) {
	if (!toAdd || !toAdd.length) return;

	toAdd.forEach(lg => {
		meta[lg.source] = meta[lg.source] || {};
		meta[lg.source][lg.name] = lg;
	});
}

let ixFluff = {};
async function pLoadFluffIndex () {
	ixFluff = await DataUtil.loadJSON(JSON_DIR + FLUFF_INDEX);
}

function handleBrew (homebrew) {
	addLegendaryGroups(homebrew.legendaryGroup);
	addMonsters(homebrew.monster);
	return Promise.resolve();
}

function pPostLoad () {
	return new Promise(resolve => {
		BrewUtil.pAddBrewData()
			.then(handleBrew)
			.then(() => BrewUtil.bind({list}))
			.then(() => BrewUtil.pAddLocalBrewData())
			.catch(BrewUtil.pPurgeBrew)
			.then(async () => {
				BrewUtil.makeBrewButton("manage-brew");
				BrewUtil.bind({filterBox, sourceFilter});
				await ListUtil.pLoadState();
				resolve();
			});
	})
}

let filterBox;
let encounterBuilder;
window.onload = async function load () {
	filterBox = await pInitFilterBox(
		sourceFilter,
		crFilter,
		typeFilter,
		tagFilter,
		environmentFilter,
		defenceFilter,
		conditionImmuneFilter,
		traitFilter,
		actionReactionFilter,
		miscFilter,
		spellcastingTypeFilter,
		sizeFilter,
		speedFilter,
		speedTypeFilter,
		alignmentFilter,
		saveFilter,
		skillFilter,
		senseFilter,
		languageFilter,
		damageTypeFilter,
		acFilter,
		averageHpFilter,
		abilityScoreFilter
	);
	encounterBuilder = new EncounterBuilder();
	await ExcludeUtil.pInitialise();
	SortUtil.initHandleFilterButtonClicks();
	encounterBuilder.initUi();
	pLoadMeta()
		.then(pLoadFluffIndex)
		.then(multisourceLoad.bind(null, JSON_DIR, JSON_LIST_NAME, pPageInit, addMonsters, pPostLoad))
		.then(() => {
			if (History.lastLoadedId == null) History._freshLoad();
			ExcludeUtil.checkShowAllExcluded(monsters, $(`#pagecontent`));
			encounterBuilder.initState();
		});
};

let list;
let printBookView;
const sourceFilter = getSourceFilter();
const crFilter = new RangeFilter({header: "Challenge Rating", headerName:"挑战等级", labels: true});
const sizeFilter = new Filter({
	header: "Size", headerName:"体型",
	items: [
		SZ_TINY,
		SZ_SMALL,
		SZ_MEDIUM,
		SZ_LARGE,
		SZ_HUGE,
		SZ_GARGANTUAN,
		SZ_VARIES
	],
	displayFn: Parser.sizeAbvToFull
});
const speedFilter = new RangeFilter({header: "Speed", headerName:"速度", min: 30, max: 30});
const speedTypeFilter = new Filter({header: "Speed Type", headerName:"速度类型", items: ["walk", "burrow", "climb", "fly", "hover", "swim"], displayFn: Parser.SpeedToDisplay});
const strengthFilter = new RangeFilter({header: "Strength",headerName:"力量", min: 1, max: 30});
const dexterityFilter = new RangeFilter({header: "Dexterity",headerName:"敏捷", min: 1, max: 30});
const constitutionFilter = new RangeFilter({header: "Constitution",headerName:"体质", min: 1, max: 30});
const intelligenceFilter = new RangeFilter({header: "Intelligence",headerName:"智力", min: 1, max: 30});
const wisdomFilter = new RangeFilter({header: "Wisdom",headerName:"睿知", min: 1, max: 30});
const charismaFilter = new RangeFilter({header: "Charisma",headerName:"魅力", min: 1, max: 30});
const abilityScoreFilter = new MultiFilter({name: "Ability Scores",headerName:"属性值", compact: true, mode: "and"}, strengthFilter, dexterityFilter, constitutionFilter, intelligenceFilter, wisdomFilter, charismaFilter);
const acFilter = new RangeFilter({header: "Armor Class",headerName:"护甲等级"});
const averageHpFilter = new RangeFilter({header: "Average Hit Points",headerName:"平均生命值"});
const typeFilter = new Filter({
	header: "Type", headerName: "生物类型",
	items: Parser.MON_TYPES,
	displayFn: Parser.monTypeToPlural
});
const tagFilter = new Filter({header: "Tag", headerName: "类型附标", items:["any race"], displayFn: Parser.MonsterTagToDisplay});
const alignmentFilter = new Filter({
	header: "Alignment", headerName: "阵营",
	items: ["L", "NX", "C", "G", "NY", "E", "N", "U", "A"],
	displayFn: Parser.alignmentAbvToFull
});
const languageFilter = new Filter({
	header: "Languages", headerName: "语言",
	displayFn: (k) => Parser.LanguageToDisplay(languages[k]),
	umbrellaItems: ["X", "XX"],
	umbrellaExcludes: ["CS"]
});
const damageTypeFilter = new Filter({
	header: "Damage Inflicted", headerName: "造成伤害",
	displayFn: (it) => Parser.dmgTypeToFull(it).toTitleCase(),
	items: ["A", "B", "C", "F", "O", "L", "N", "P", "I", "Y", "R", "S", "T"]
});
const senseFilter = new Filter({
	header: "Senses", headerName: "感官能力",
	displayFn: (it) => Parser.monSenseTagToFull(it).toTitleCase(),
	items: ["B", "D", "SD", "T", "U"]
});
const skillFilter = new Filter({
	header: "Skills", headerName: "技能",
	displayFn: Parser.SkillToDisplay,
	items: ["acrobatics", "animal handling", "arcana", "athletics", "deception", "history", "insight", "intimidation", "investigation", "medicine", "nature", "perception", "performance", "persuasion", "religion", "sleight of hand", "stealth", "survival"]
});
const saveFilter = new Filter({
	header: "Saves", headerName: "豁免",
	displayFn: Parser.attAbvToFull,
	items: [...Parser.ABIL_ABVS]
});
const environmentFilter = new Filter({
	header: "Environment", headerName: "环境",
	items: ["arctic", "coastal", "desert", "forest", "grassland", "hill", "mountain", "swamp", "underdark", "underwater", "urban"],
	displayFn: Parser.EnvironmentToDisplay
});
const DMG_TYPES = [
	"acid",
	"bludgeoning",
	"cold",
	"fire",
	"force",
	"lightning",
	"necrotic",
	"piercing",
	"poison",
	"psychic",
	"radiant",
	"slashing",
	"thunder"
];
const CONDS = [
	"blinded",
	"charmed",
	"deafened",
	"exhaustion",
	"frightened",
	"grappled",
	"incapacitated",
	"invisible",
	"paralyzed",
	"petrified",
	"poisoned",
	"prone",
	"restrained",
	"stunned",
	"unconscious",
	// not really a condition, but whatever
	"disease"
];
function dispVulnFilter (item) {
	return `${Parser.DamageToDisplay(item)}易伤`;
}
const vulnerableFilter = new Filter({
	header: "Vulnerabilities", headerName: "易伤",
	items: DMG_TYPES,
	displayFn: dispVulnFilter
});
function dispResFilter (item) {
	return `${Parser.DamageToDisplay(item)}抗性`;
}
const resistFilter = new Filter({
	header: "Resistance", headerName: "抗性",
	items: DMG_TYPES,
	displayFn: dispResFilter
});
function dispImmFilter (item) {
	return `${Parser.DamageToDisplay(item)}免疫`;
}
const immuneFilter = new Filter({
	header: "Immunity", headerName: "免疫",
	items: DMG_TYPES,
	displayFn: dispImmFilter
});
const defenceFilter = new MultiFilter({name: "Damage", headerName: "伤害", mode: "and"}, vulnerableFilter, resistFilter, immuneFilter);
const conditionImmuneFilter = new Filter({
	header: "Condition Immunity", headerName: "状态免疫",
	items: CONDS,
	displayFn: Parser.ConditionToDisplay
});
const traitFilter = new Filter({
	header: "Traits", headerName: "特性",
	items: [
		"Aggressive", "Ambusher", "Amorphous", "Amphibious", "Antimagic Susceptibility", "Brute", "Charge", "Damage Absorption", "Death Burst", "Devil's Sight", "False Appearance", "Fey Ancestry", "Flyby", "Hold Breath", "Illumination", "Immutable Form", "Incorporeal Movement", "Keen Senses", "Legendary Resistances", "Light Sensitivity", "Magic Resistance", "Magic Weapons", "Pack Tactics", "Pounce", "Rampage", "Reckless", "Regeneration", "Rejuvenation", "Shapechanger", "Siege Monster", "Sneak Attack", "Spider Climb", "Sunlight Sensitivity", "Turn Immunity", "Turn Resistance", "Undead Fortitude", "Water Breathing", "Web Sense", "Web Walker"
	],
	displayFn: function(t){
		switch(t){
			case "Aggressive": return "侵略性";
			case "Ambusher": return "伏击者";
			case "Amorphous": return "无定形";
			case "Amphibious": return "两栖";
			case "Antimagic Susceptibility": return "反魔法敏感";
			case "Brute": return "残暴";
			case "Charge": return "冲锋";
			case "Damage Absorption": return "伤害吸收";
			case "Death Burst": return "死亡自爆";
			case "Devil's Sight": return "魔鬼视界";
			case "False Appearance": return "拟形";
			case "Fey Ancestry": return "精类血统";
			case "Flyby": return "飞掠";
			case "Hold Breath": return "屏息";
			case "Illumination": return "照明";
			case "Immutable Form": return "不变形态";
			case "Incorporeal Movement": return "虚体移动";
			case "Keen Senses": return "敏锐感官";
			case "Legendary Resistances": return "传奇抗性";
			case "Light Sensitivity": return "光线敏感";
			case "Magic Resistance": return "魔法抗性";
			case "Magic Weapons": return "魔法武器";
			case "Pack Tactics": return "群体战术";
			case "Pounce": return "猛扑";
			case "Reckless": return "鲁莽";
			case "Regeneration": return "再生";
			case "Rejuvenation": return "复生";
			case "Rampage": return "暴走";
			case "Shapechanger": return "变形者";
			case "Siege Monster": return "攻城怪物";
			case "Sneak Attack": return "偷袭";
			case "Spider Climb": return "蛛行";
			case "Sunlight Sensitivity": return "日光敏感";
			case "Turn Immunity": return "驱散免疫";
			case "Turn Resistance": return "驱散抗性";
			case "Undead Fortitude": return "不死韧性";
			case "Water Breathing": return "水下呼吸";
			case "Web Sense": return "蛛网感知";
			case "Web Walker": return "蛛网行者";
			default: return t;
	};},
});
const actionReactionFilter = new Filter({
	header: "Actions & Reactions", headerName: "动作&反应",
	items: [
		"Frightful Presence", "Multiattack", "Parry", "Swallow", "Teleport", "Tentacles"
	],
	displayFn: function(a){
		switch(a){
			case "Frightful Presence": return "骇人威仪";
			case "Multiattack": return "多重攻击";
			case "Parry": return "格挡";
			case "Swallow": return "吞咽";
			case "Teleport": return "传送";
			case "Tentacles": return "触手";
			default: return a;
	};}
});
const miscFilter = new Filter({
	header: "Miscellaneous", headerName: "杂项",
	items: ["Familiar", "Lair Actions", "Legendary", "Named NPC", "Spellcaster", "Regional Effects", "Reactions", "Swarm", "Has Variants"],
	displayFn: function(m){
		switch(m){
			case "Familiar": return "魔宠";
			case "Lair Actions": return "巢穴动作";
			case "Legendary": return "传奇";
			case "Named NPC": return "具名NPC";
			case "Spellcaster": return "施法者";
			case "Spellcaster, int": return "施法者,智力";
			case "Spellcaster, wis": return "施法者,睿知";
			case "Spellcaster, cha": return "施法者,魅力";
			case "Regional Effects": return "区域效应";
			case "Swarm": return "集群";
			case "Has Variants": return "拥有变体";
			case "Reactions": return "反应";
			default: return m;
		};},
	deselFn: (it) => it === "Named NPC"
});
const spellcastingTypeFilter = new Filter({
	header: "Spellcasting Type", headerName: "施法类型",
	items: ["F", "I", "P", "S", "CB", "CC", "CD", "CP", "CR", "CS", "CL", "CW"],
	displayFn: Parser.monSpellcastingTagToFull
});

function pPageInit (loadedSources) {
	sourceFilter.items = Object.keys(loadedSources).map(src => new FilterItem({item: src, changeFn: loadSource(JSON_LIST_NAME, addMonsters)}));
	sourceFilter.items.sort(SortUtil.srcSort_ch);

	list = ListUtil.search({
		valueNames: ["name", "source", "type", "cr", "group", "alias", "uniqueid", "eng_name"],
		listClass: "monsters",
		sortFunction: sortMonsters
	});
	list.on("updated", () => {
		filterBox.setCount(list.visibleItems.length, list.items.length);
	});

	// filtering function
	$(filterBox).on(
		FilterBox.EVNT_VALCHANGE,
		handleFilterChange
	);

	// sorting headers
	$("#filtertools").find("button.sort").click(function () {
		const $this = $(this);
		let direction = $this.data("sortby") === "desc" ? "asc" : "desc";

		$this.data("sortby", direction);
		$this.find('span').addClass($this.data("sortby") === "desc" ? "caret" : "caret caret--reverse");
		list.sort($this.data("sort"), {order: $this.data("sortby"), sortFunction: sortMonsters});
	});

	const subList = ListUtil.initSublist({
		valueNames: ["name", "source", "type", "cr", "count", "id", "uid"],
		listClass: "submonsters",
		sortFunction: sortMonsters,
		onUpdate: onSublistChange,
		uidHandler: (mon, uid) => ScaleCreature.scale(mon, Number(uid.split("_").last())),
		uidUnpacker: getUnpackedUid
	});
	const baseHandlerOptions = {shiftCount: 5};
	function addHandlerGenerator () {
		return (evt, proxyEvt) => {
			evt = proxyEvt || evt;
			if (lastRendered.isScaled) {
				if (evt.shiftKey) ListUtil.pDoSublistAdd(History.lastLoadedId, true, 5, getScaledData());
				else ListUtil.pDoSublistAdd(History.lastLoadedId, true, 1, getScaledData());
			} else ListUtil.genericAddButtonHandler(evt, baseHandlerOptions);
		};
	}
	function subtractHandlerGenerator () {
		return (evt, proxyEvt) => {
			evt = proxyEvt || evt;
			if (lastRendered.isScaled) {
				if (evt.shiftKey) ListUtil.pDoSublistSubtract(History.lastLoadedId, 5, getScaledData());
				else ListUtil.pDoSublistSubtract(History.lastLoadedId, 1, getScaledData());
			} else ListUtil.genericSubtractButtonHandler(evt, baseHandlerOptions);
		};
	}
	ListUtil.bindAddButton(addHandlerGenerator, baseHandlerOptions);
	ListUtil.bindSubtractButton(subtractHandlerGenerator, baseHandlerOptions);
	ListUtil.initGenericAddable();

	// print view
	printBookView = new BookModeView("bookview", $(`#btn-printbook`), "If you wish to view multiple creatures, please first make a list",
		($tbl) => {
			return new Promise(resolve => {
				const promises = ListUtil.genericPinKeyMapper();

				Promise.all(promises).then(toShow => {
					toShow.sort((a, b) => SortUtil.ascSort(a._displayName || a.name, b._displayName || b.name));

					let numShown = 0;

					const stack = [];

					const renderCreature = (mon) => {
						stack.push(`<table class="printbook-bestiary-entry"><tbody>`);
						stack.push(Renderer.monster.getCompactRenderedString(mon, renderer));
						if (mon.legendaryGroup) {
							const thisGroup = (meta[mon.legendaryGroup.source] || {})[mon.legendaryGroup.name];
							if (thisGroup) {
								stack.push(Renderer.monster.getCompactRenderedStringSection(thisGroup, renderer, "Lair Actions", "lairActions", 0));
								stack.push(Renderer.monster.getCompactRenderedStringSection(thisGroup, renderer, "Regional Effects", "regionalEffects", 0));
							}
						}
						stack.push(`</tbody></table>`);
					};

					stack.push(`<tr class="printbook-bestiary"><td>`);
					toShow.forEach(mon => renderCreature(mon));
					if (!toShow.length && History.lastLoadedId != null) {
						renderCreature(monsters[History.lastLoadedId]);
					}
					stack.push(`</td></tr>`);

					numShown += toShow.length;
					$tbl.append(stack.join(""));
					resolve(numShown);
				});
			});
		}, true
	);

	// proficiency bonus/dice toggle
	const profBonusDiceBtn = $("button#profbonusdice");
	profBonusDiceBtn.click(function () {
		if (window.PROF_DICE_MODE === PROF_MODE_DICE) {
			window.PROF_DICE_MODE = PROF_MODE_BONUS;
			this.innerHTML = "Use Proficiency Dice";
			$("#pagecontent").find(`span.render-roller, span.dc-roller`).each(function () {
				const $this = $(this);
				$this.attr("mode", "");
				$this.html($this.attr("data-roll-prof-bonus"));
			});
		} else {
			window.PROF_DICE_MODE = PROF_MODE_DICE;
			this.innerHTML = "Use Proficiency Bonus";
			$("#pagecontent").find(`span.render-roller, span.dc-roller`).each(function () {
				const $this = $(this);
				$this.attr("mode", "dice");
				$this.html($this.attr("data-roll-prof-dice"));
			});
		}
	});

	return Promise.resolve();
}

class EncounterBuilderUtils {
	static getSublistedEncounter () {
		return ListUtil.sublist.items.map(it => {
			const mon = monsters[Number(it._values.id)];
			if (mon.cr) {
				const crScaled = it._values.uid ? Number(getUnpackedUid(it._values.uid).scaled) : null;
				return {
					cr: it._values.cr,
					count: Number(it._values.count),

					// used for encounter adjuster
					crScaled: crScaled,
					uid: it._values.uid,
					hash: UrlUtil.autoEncodeHash(mon)
				}
			}
		}).filter(it => it && it.cr !== 100).sort((a, b) => SortUtil.ascSort(b.cr, a.cr));
	}

	static calculateListEncounterXp (playerCount) {
		return EncounterBuilderUtils.calculateEncounterXp(EncounterBuilderUtils.getSublistedEncounter(), playerCount);
	}

	static getCrCutoff (data) {
		data = data.filter(it => getCr(it) !== 100).sort((a, b) => SortUtil.ascSort(getCr(b), getCr(a)));

		// "When making this calculation, don't count any monsters whose challenge rating is significantly below the average
		// challenge rating of the other monsters in the group unless you think the weak monsters significantly contribute
		// to the difficulty of the encounter." -- DMG, p. 82

		// no cutoff for CR 0-2
		return getCr(data[0]) <= 2 ? 0 : getCr(data[0]) / 2;
	}

	/**
	 * @param data an array of {cr: n, count: m} objects
	 * @param playerCount number of players in the party
	 */
	static calculateEncounterXp (data, playerCount = ECGEN_BASE_PLAYERS) {
		data = data.filter(it => getCr(it) !== 100)
			.sort((a, b) => SortUtil.ascSort(getCr(b), getCr(a)));

		let baseXp = 0;
		let relevantCount = 0;
		if (!data.length) return {baseXp: 0, relevantCount: 0, adjustedXp: 0};

		const crCutoff = EncounterBuilderUtils.getCrCutoff(data);
		data.forEach(it => {
			if (getCr(it) >= crCutoff) relevantCount += it.count;
			baseXp += Parser.crToXpNumber(Parser.numberToCr(getCr(it))) * it.count;
		});

		const playerAdjustedXpMult = Parser.numMonstersToXpMult(relevantCount, playerCount);

		const adjustedXp = playerAdjustedXpMult * baseXp;
		return {baseXp, relevantCount, adjustedXp, meta: {crCutoff, playerCount, playerAdjustedXpMult}};
	}
}

let _$totalCr;
function onSublistChange () {
	_$totalCr = _$totalCr || $(`#totalcr`);
	const xp = EncounterBuilderUtils.calculateListEncounterXp(encounterBuilder.lastPlayerCount);
	_$totalCr.html(`${xp.baseXp.toLocaleString()} XP (<span class="help" title="Adjusted Encounter XP">Enc</span>: ${(xp.adjustedXp).toLocaleString()} XP)`);
	if (encounterBuilder.isActive()) encounterBuilder.updateDifficulty();
	else encounterBuilder.doSaveState();
}

function handleFilterChange () {
	const f = filterBox.getValues();
	list.filter(function (item) {
		const m = monsters[$(item.elm).attr(FLTR_ID)];
		return filterBox.toDisplay(
			f,
			m._fSources,
			m._pCr,
			m._pTypes.type,
			m._pTypes.tags,
			m.environment,
			[
				m._fVuln,
				m._fRes,
				m._fImm
			],
			m._fCondImm,
			m.traitTags,
			m.actionTags,
			m._fMisc,
			m.spellcastingTags,
			m.size,
			m._fSpeed,
			m._fSpeedType,
			m._fAlign,
			m._fSave,
			m._fSkill,
			m.senseTags,
			m.languageTags,
			m.damageTags,
			m._fAc,
			m._fHp,
			[
				m.str,
				m.dex,
				m.con,
				m.int,
				m.wis,
				m.cha
			]
		);
	});
	onFilterChangeMulti(monsters);
	encounterBuilder.resetCache();
}

let monsters = [];
let mI = 0;
const lastRendered = {mon: null, isScaled: false};
function getScaledData () {
	const last = lastRendered.mon;
	return {scaled: last._isScaledCr, uid: getUid(last.name, last.source, last._isScaledCr)};
}

function getUid (name, source, scaledCr) {
	return `${name}_${source}_${scaledCr}`.toLowerCase();
}

const _NEUT_ALIGNS = ["NX", "NY"];
const _addedHashes = new Set();
function addMonsters (data) {
	if (!data || !data.length) return;

	monsters = monsters.concat(data);

	const table = $("ul.monsters");
	let textStack = "";
	// build the table
	for (; mI < monsters.length; mI++) {
		const mon = monsters[mI];
		const monHash = UrlUtil.autoEncodeHash(mon);
		if (_addedHashes.has(monHash)) continue;
		_addedHashes.add(monHash);
		if (ExcludeUtil.isExcluded(mon.name, "monster", mon.source)) continue;
		RenderBestiary.initParsed(mon);
		mon._fSpeedType = Object.keys(mon.speed).filter(k => mon.speed[k]);
		if (mon._fSpeedType.length) mon._fSpeed = mon._fSpeedType.map(k => mon.speed[k].number || mon.speed[k]).sort((a, b) => SortUtil.ascSort(b, a))[0];
		else mon._fSpeed = 0;
		if (mon.speed.canHover) mon._fSpeedType.push("hover");
		mon._fAc = mon.ac.map(it => it.ac || it);
		mon._fHp = mon.hp.average;
		const tempAlign = typeof mon.alignment[0] === "object"
			? Array.prototype.concat.apply([], mon.alignment.map(a => a.alignment))
			: [...mon.alignment];
		if (tempAlign.includes("N") && !tempAlign.includes("G") && !tempAlign.includes("E")) tempAlign.push("NY");
		else if (tempAlign.includes("N") && !tempAlign.includes("L") && !tempAlign.includes("C")) tempAlign.push("NX");
		else if (tempAlign.length === 1 && tempAlign.includes("N")) Array.prototype.push.apply(tempAlign, _NEUT_ALIGNS);
		mon._fAlign = tempAlign;
		mon._fVuln = mon.vulnerable ? getAllImmRest(mon.vulnerable, "vulnerable") : [];
		mon._fRes = mon.resist ? getAllImmRest(mon.resist, "resist") : [];
		mon._fImm = mon.immune ? getAllImmRest(mon.immune, "immune") : [];
		mon._fCondImm = mon.conditionImmune ? getAllImmRest(mon.conditionImmune, "conditionImmune") : [];
		mon._fSave = mon.save ? Object.keys(mon.save) : [];
		mon._fSkill = mon.skill ? Object.keys(mon.skill) : [];
		mon._fSources = ListUtil.getCompleteSources(mon);

		const abvSource = Parser.sourceJsonToAbv(mon.source);

		textStack +=
			`<li class="row" ${FLTR_ID}="${mI}" onclick="ListUtil.toggleSelected(event, this)" oncontextmenu="ListUtil.openContextMenu(event, this)">
				<a id=${mI} href="#${monHash}" title="${mon.name}">
					${EncounterBuilder.getButtons(mI)}
					<span class="ecgen__name name col-4-2">${mon.name}</span>
					<span class="type col-4-1">${mon._pTypes.asText.uppercaseFirst()}</span>
					<span class="col-1-7 text-align-center cr">${mon._pCr}</span>
					<span title="${Parser.sourceJsonToFull(mon.source)}${Renderer.utils.getSourceSubText(mon)}" class="col-2 source text-align-center ${Parser.sourceJsonToColor(mon.source)}">${abvSource}</span>
					
					${mon.group ? `<span class="group hidden">${mon.group}</span>` : ""}
					<span class="alias hidden">${(mon.alias || []).map(it => `"${it}"`).join(",")}</span>
					<span class="uniqueid hidden">${mon.uniqueId ? mon.uniqueId : mI}</span>
					<span class="eng_name hidden">${mon.ENG_name ? mon.ENG_name : mon.name}</span>
				</a>
			</li>`;

		// populate filters
		sourceFilter.addIfAbsent(mon._fSources);
		crFilter.addIfAbsent(mon._pCr);
		strengthFilter.addIfAbsent(mon.str);
		dexterityFilter.addIfAbsent(mon.dex);
		constitutionFilter.addIfAbsent(mon.con);
		intelligenceFilter.addIfAbsent(mon.int);
		wisdomFilter.addIfAbsent(mon.wis);
		charismaFilter.addIfAbsent(mon.cha);
		speedFilter.addIfAbsent(mon._fSpeed);
		mon.ac.forEach(it => acFilter.addIfAbsent(it.ac || it));
		if (mon.hp.average) averageHpFilter.addIfAbsent(mon.hp.average);
		mon._pTypes.tags.forEach(t => tagFilter.addIfAbsent(t));
		mon._fMisc = mon.legendary || mon.legendaryGroup ? ["Legendary"] : [];
		if (mon.familiar) mon._fMisc.push("Familiar");
		if (mon.type.swarmSize) mon._fMisc.push("Swarm");
		if (mon.spellcasting) {
			mon._fMisc.push("Spellcaster");
			mon.spellcasting.forEach(sc => {
				if (sc.ability) {
					const scAbility = `${_MISC_FILTER_SPELLCASTER}${sc.ability}`;
					mon._fMisc.push(scAbility);
					miscFilter.addIfAbsent(scAbility);
				}
			});
		}
		if (mon.isNpc) mon._fMisc.push("Named NPC");
		if (mon.legendaryGroup && (meta[mon.legendaryGroup.source] || {})[mon.legendaryGroup.name]) {
			if ((meta[mon.legendaryGroup.source] || {})[mon.legendaryGroup.name].lairActions) mon._fMisc.push("Lair Actions");
			if ((meta[mon.legendaryGroup.source] || {})[mon.legendaryGroup.name].regionalEffects) mon._fMisc.push("Regional Effects");
		}
		if (mon.reaction) mon._fMisc.push("Reactions");
		if (mon.variant) mon._fMisc.push("Has Variants");
		traitFilter.addIfAbsent(mon.traitTags);
		actionReactionFilter.addIfAbsent(mon.actionTags);
		environmentFilter.addIfAbsent(mon.environment);
	}
	const lastSearch = ListUtil.getSearchTermAndReset(list);
	table.append(textStack);

	// sort filters
	sourceFilter.items.sort(SortUtil.srcSort_ch);
	crFilter.items.sort(SortUtil.ascSortCr);
	typeFilter.items.sort(SortUtil.ascSortLower);
	tagFilter.items.sort(SortUtil.ascSort);
	miscFilter.items.sort(ascSortMiscFilter);
	traitFilter.items.sort(SortUtil.ascSort);
	actionReactionFilter.items.sort(SortUtil.ascSortCr);

	list.reIndex();
	if (lastSearch) list.search(lastSearch);
	list.sort("type");
	filterBox.render();
	handleFilterChange();

	ListUtil.setOptions({
		itemList: monsters,
		getSublistRow: pGetSublistItem,
		primaryLists: [list]
	});

	function popoutHandlerGenerator (toList, $btnPop, popoutCodeId) {
		return (evt) => {
			if (evt.shiftKey) {
				Renderer.hover.handlePopoutCode(evt, toList, $btnPop, popoutCodeId);
			} else {
				if (lastRendered.mon != null && lastRendered.isScaled) Renderer.hover.doPopoutPreloaded($btnPop, lastRendered.mon, evt.clientX);
				else if (History.lastLoadedId !== null) Renderer.hover.doPopout($btnPop, toList, History.lastLoadedId, evt.clientX);
			}
		};
	}

	Renderer.hover.bindPopoutButton(monsters, popoutHandlerGenerator);
	UrlUtil.bindLinkExportButton(filterBox);
	ListUtil.bindDownloadButton();
	ListUtil.bindUploadButton(sublistFuncPreload);

	Renderer.utils.bindPronounceButtons();
}

function sublistFuncPreload (json, funcOnload) {
	if (json.l && json.l.items && json.l.sources) { // if it's an encounter file
		json.items = json.l.items;
		json.sources = json.l.sources;
	}
	const loaded = Object.keys(loadedSources).filter(it => loadedSources[it].loaded);
	const lowerSources = json.sources.map(it => it.toLowerCase());
	const toLoad = Object.keys(loadedSources).filter(it => !loaded.includes(it)).filter(it => lowerSources.includes(it.toLowerCase()));
	const loadTotal = toLoad.length;
	if (loadTotal) {
		let loadCount = 0;
		toLoad.forEach(src => {
			loadSource(JSON_LIST_NAME, (monsters) => {
				addMonsters(monsters);
				if (++loadCount === loadTotal) {
					funcOnload();
				}
			})(src, "yes");
		});
	} else {
		funcOnload();
	}
}

function pGetSublistItem (mon, pinId, addCount, data = {}) {
	return new Promise(resolve => {
		const pMon = data.scaled ? ScaleCreature.scale(mon, data.scaled) : Promise.resolve(mon);

		pMon.then(mon => {
			RenderBestiary.updateParsed(mon);
			const subHash = data.scaled ? `${HASH_PART_SEP}${MON_HASH_SCALED}${HASH_SUB_KV_SEP}${data.scaled}` : "";
			RenderBestiary.initParsed(mon);

			resolve(`
				<li class="row row--bestiary_sublist" ${FLTR_ID}="${pinId}" oncontextmenu="ListUtil.openSubContextMenu(event, this)">
					<a href="#${UrlUtil.autoEncodeHash(mon)}${subHash}" title="${mon._displayName || mon.name}" draggable="false" class="ecgen__hidden">
						<span class="name col-5">${mon._displayName || mon.name}</span>
						<span class="type col-3">${mon._pTypes.asText.uppercaseFirst()}</span>
						<span class="cr col-2 text-align-center">${mon._pCr}</span>						
						<span class="count col-2 text-align-center">${addCount || 1}</span>
						<span class="id hidden">${pinId}</span>
						<span class="uid hidden">${data.uid || ""}</span>
					</a>
					
					<div class="list__item_inner ecgen__visible--flex">
						${EncounterBuilder.getButtons(pinId, true)}
						<span class="ecgen__name--sub col-5">${mon._displayName || mon.name}</span>
						<span class="col-1-5 help--hover ecgen__visible" onmouseover="EncounterBuilder.doStatblockMouseOver(event, this, ${pinId}, ${mon._isScaledCr})">Statblock</span>
						<span class="col-1-5 ecgen__visible help--hover" ${EncounterBuilder.getTokenMouseOver(mon)}>Token</span>
						${(mon._pCr !== "不明" && mon._pCr !== "Unknown") ? `
							<span class="col-2 text-align-center">
								<input value="${mon._pCr}" onchange="encounterBuilder.doCrChange(this, ${pinId}, ${mon._isScaledCr})" class="ecgen__cr_input form-control form-control--minimal input-xs">
							</span>
						` : `<span class="col-2 text-align-center">不明</span>`}
						<span class="col-2 text-align-center count">${addCount || 1}</span>
					</div>
				</li>
			`);
		});
	});
}

// sorting for form filtering
function sortMonsters (a, b, o) {
	function getPrimary () {
		if (o.valueName === "count") return SortUtil.ascSort(Number(a.values().count), Number(b.values().count));
		a = monsters[a.elm.getAttribute(FLTR_ID)];
		b = monsters[b.elm.getAttribute(FLTR_ID)];
		switch (o.valueName) {
			case "name":
				return SortUtil.ascSort(a.name, b.name);
			case "type":
				return SortUtil.ascSort(a._pTypes.asText, b._pTypes.asText);
			case "source":
				return SortUtil.ascSort(a.source, b.source);
			case "cr":
				return SortUtil.ascSortCr(a._pCr, b._pCr);
		}
	}
	return getPrimary() || SortUtil.ascSort(a.name, b.name) || SortUtil.ascSort(a.source, b.source);
}

let profBtn = null;
// load selected monster stat block
function loadhash (id) {
	const mon = monsters[id];

	renderStatblock(mon);

	loadsub([]);
	ListUtil.updateSelected();
}

function renderStatblock (mon, isScaled) {
	lastRendered.mon = mon;
	lastRendered.isScaled = isScaled;
	renderer.setFirstSection(true);

	const $content = $("#pagecontent").empty();
	const $wrpBtnProf = $(`#wrp-profbonusdice`);

	if (profBtn !== null) {
		$wrpBtnProf.append(profBtn);
		profBtn = null;
	}

	function buildStatsTab () {
		const $btnScaleCr = $(`
			<button id="btn-scale-cr" title="Scale Creature By CR (Highly Experimental)" class="mon__btn-scale-cr btn btn-xs btn-default">
				<span class="glyphicon glyphicon-signal"/>
			</button>`)
			.off("click").click((evt) => {
				evt.stopPropagation();
				const mon = monsters[History.lastLoadedId];
				const lastCr = lastRendered.mon ? lastRendered.mon.cr.cr || lastRendered.mon.cr : mon.cr.cr || mon.cr;
				Renderer.monster.getCrScaleTarget($btnScaleCr, lastCr, (targetCr) => {
					if (targetCr === Parser.crToNumber(mon.cr)) renderStatblock(mon);
					else History.setSubhash(MON_HASH_SCALED, targetCr);
				});
			}).toggle(Parser.crToNumber(mon.cr.cr || mon.cr) !== 100);

		const $btnResetScaleCr = $(`
			<button id="btn-reset-cr" title="Reset CR Scaling" class="mon__btn-reset-cr btn btn-xs btn-default">
				<span class="glyphicon glyphicon-refresh"></span>
			</button>`)
			.click(() => History.setSubhash(MON_HASH_SCALED, null))
			.toggle(isScaled);

		$content.append(RenderBestiary.$getRenderedCreature(mon, meta, {$btnScaleCr, $btnResetScaleCr}));

		const $floatToken = $(`#float-token`).empty();
		if (mon.tokenUrl || !mon.uniqueId) {
			const imgLink = Renderer.monster.getTokenUrl(mon);
			$floatToken.append(`
				<a href="${imgLink}" target="_blank" rel="noopener">
					<img src="${imgLink}" id="token_image" class="token" onerror="imgError(this)" alt="${mon.name}">
				</a>`
			);
		} else imgError();

		// inline rollers //////////////////////////////////////////////////////////////////////////////////////////////
		const isProfDiceMode = PROF_DICE_MODE === PROF_MODE_DICE;
		function _addSpacesToDiceExp (exp) {
			return exp.replace(/([^0-9d])/gi, " $1 ").replace(/\s+/g, " ");
		}

		// add proficiency dice stuff for attack rolls, since those _generally_ have proficiency
		// this is not 100% accurate; for example, ghouls don't get their prof bonus on bite attacks
		// fixing it would probably involve machine learning though; we need an AI to figure it out on-the-fly
		// (Siri integration forthcoming)
		$content.find(".render-roller")
			.filter(function () {
				return $(this).text().match(/^([-+])?\d+$/);
			})
			.each(function () {
				const bonus = Number($(this).text());
				const expectedPB = Parser.crToPb(mon.cr);

				// skills and saves can have expertise
				let expert = 1;
				let pB = expectedPB;
				let fromAbility;
				let ability;
				if ($(this).parent().attr("data-mon-save")) {
					const title = $(this).attr("title");
					ability = title.split(" ")[0].trim().toLowerCase().substring(0, 3);
					fromAbility = Parser.getAbilityModNumber(mon[ability]);
					pB = bonus - fromAbility;
					expert = (pB === expectedPB * 2) ? 2 : 1;
				} else if ($(this).parent().attr("data-mon-skill")) {
					const title = $(this).attr("title");
					ability = Parser.skillToAbilityAbv(title.toLowerCase().trim());
					fromAbility = Parser.getAbilityModNumber(mon[ability]);
					pB = bonus - fromAbility;
					expert = (pB === expectedPB * 2) ? 2 : 1;
				}
				const withoutPB = bonus - pB;
				try {
					// if we have proficiency bonus, convert the roller
					if (expectedPB > 0) {
						const profDiceString = _addSpacesToDiceExp(`${expert}d${pB * (3 - expert)}${withoutPB >= 0 ? "+" : ""}${withoutPB}`);

						$(this).attr("data-roll-prof-bonus", $(this).text());
						$(this).attr("data-roll-prof-dice", profDiceString);

						// here be (chromatic) dragons
						const cached = $(this).attr("onclick");
						const nu = `
							(function(it) {
								if (PROF_DICE_MODE === PROF_MODE_DICE) {
									Renderer.dice.rollerClick(event, it, '{"type":"dice","rollable":true,"toRoll":"1d20 + ${profDiceString}"}'${$(this).prop("title") ? `, '${$(this).prop("title")}'` : ""})
								} else {
									${cached.replace(/this/g, "it")}
								}
							})(this)`;

						$(this).attr("onclick", nu);

						if (isProfDiceMode) {
							$(this).html(profDiceString);
						}
					}
				} catch (e) {
					setTimeout(() => {
						throw new Error(`Invalid save or skill roller! Bonus was ${bonus >= 0 ? "+" : ""}${bonus}, but creature s PB was +${expectedPB} and relevant ability score (${ability}) was ${fromAbility >= 0 ? "+" : ""}${fromAbility} (should have been ${expectedPB + fromAbility >= 0 ? "+" : ""}${expectedPB + fromAbility} total)`);
					}, 0);
				}
			});

		$content.find("p").each(function () {
			$(this).html($(this).html().replace(/DC\s*(\d+)/g, function (match, capture) {
				const dc = Number(capture);

				const expectedPB = Parser.crToPb(mon.cr);

				if (expectedPB > 0) {
					const withoutPB = dc - expectedPB;
					const profDiceString = _addSpacesToDiceExp(`1d${(expectedPB * 2)}${withoutPB >= 0 ? "+" : ""}${withoutPB}`);

					return `DC <span class="dc-roller" mode="${isProfDiceMode ? "dice" : ""}" onmousedown="window.PROF_DICE_MODE === window.PROF_MODE_DICE &&  event.preventDefault()" onclick="dcRollerClick(event, this, '${profDiceString}')" data-roll-prof-bonus="${capture}" data-roll-prof-dice="${profDiceString}">${isProfDiceMode ? profDiceString : capture}</span>`;
				} else {
					return match; // if there was no proficiency bonus to work with, fall back on this
				}
			}));
		});
	}

	function buildFluffTab (isImageTab) {
		return Renderer.utils.buildFluffTab(
			isImageTab,
			$content,
			mon,
			Renderer.monster.getFluff.bind(null, mon, meta),
			`${JSON_DIR}${ixFluff[mon.source]}`,
			() => ixFluff[mon.source]
		);
	}

	// reset tabs
	const statTab = Renderer.utils.tabButton(
		"资料卡",
		() => {
			$wrpBtnProf.append(profBtn);
			$(`#float-token`).show();
		},
		buildStatsTab
	);
	const infoTab = Renderer.utils.tabButton(
		"资讯",
		() => {
			profBtn = profBtn || $wrpBtnProf.children().detach();
			$(`#float-token`).hide();
		},
		buildFluffTab
	);
	const picTab = Renderer.utils.tabButton(
		"图片",
		() => {
			profBtn = profBtn || $wrpBtnProf.children().detach();
			$(`#float-token`).hide();
		},
		() => buildFluffTab(true)
	);
	Renderer.utils.bindTabButtons(statTab, infoTab, picTab);
}

function handleUnknownHash (link, sub) {
	const src = Object.keys(loadedSources).find(src => src.toLowerCase() === decodeURIComponent(link.split(HASH_LIST_SEP)[1]).toLowerCase());
	if (src) {
		loadSource(JSON_LIST_NAME, (monsters) => {
			addMonsters(monsters);
			History.hashChange();
		})(src, "yes");
	}
}

function dcRollerClick (event, ele, exp) {
	if (window.PROF_DICE_MODE === PROF_MODE_BONUS) return;
	const it = {
		type: "dice",
		rollable: true,
		toRoll: exp
	};
	Renderer.dice.rollerClick(event, ele, JSON.stringify(it));
}

function getUnpackedUid (uid) {
	return {scaled: Number(uid.split("_").last()), uid};
}

function getCr (obj) {
	if (obj.crScaled != null) return obj.crScaled;
	return typeof obj.cr === "string" ? obj.cr.includes("/") ? Parser.crToNumber(obj.cr) : Number(obj.cr) : obj.cr;
}

function loadsub (sub) {
	filterBox.setFromSubHashes(sub);
	ListUtil.setFromSubHashes(sub, sublistFuncPreload);

	printBookView.handleSub(sub);

	const scaledHash = sub.find(it => it.startsWith(MON_HASH_SCALED));
	if (scaledHash) {
		const scaleTo = Number(UrlUtil.unpackSubHash(scaledHash)[MON_HASH_SCALED][0]);
		const scaleToStr = Parser.numberToCr(scaleTo);
		const mon = monsters[History.lastLoadedId];
		if (Parser.isValidCr(scaleToStr) && scaleTo !== Parser.crToNumber(lastRendered.mon.cr)) {
			ScaleCreature.scale(mon, scaleTo).then(scaled => renderStatblock(scaled, true));
		}
	}

	encounterBuilder.handleSubhash(sub);
}