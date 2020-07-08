"use strict";

const JSON_URL = "data/races.json";

const ASI_SORT_POS = {
	Strength: 0,
	Dexterity: 1,
	Constitution: 2,
	Intelligence: 3,
	Wisdom: 4,
	Charisma: 5
};

window.onload = async function load () {
	await ExcludeUtil.pInitialise();
	SortUtil.initHandleFilterButtonClicks();
	DataUtil.loadJSON(JSON_URL).then(onJsonLoad);
};

function getAbilityObjs (abils) {
	function makeAbilObj (asi, amount) {
		return {
			asi: asi,
			amount: amount,
			_toIdString: () => {
				return `${asi}${amount}`
			}
		}
	}

	const out = new CollectionUtil.ObjectSet();
	if (abils.choose) {
		abils.choose.forEach(ch => {
			if (ch.predefined) {
				ch.predefined.forEach(pre => {
					Object.keys(pre).forEach(abil => out.add(makeAbilObj(abil, pre[abil])));
				});
			} else if (ch.weighted) {
				// add every ability + weight combo
				ch.weighted.from.forEach(f => {
					ch.weighted.weights.forEach(w => {
						out.add(makeAbilObj(f, w));
					});
				});
			} else {
				const by = ch.amount || 1;
				ch.from.forEach(asi => out.add(makeAbilObj(asi, by)));
			}
		});
	}
	Object.keys(abils).filter(abil => abil !== "choose").forEach(abil => out.add(makeAbilObj(abil, abils[abil])));
	return Array.from(out.values());
}

function mapAbilityObjToFull (abilObj) {
	return `${Parser.attAbvToFull(abilObj.asi)}${abilObj.amount < 0 ? "" : "+"}${abilObj.amount}`;
}

function getSpeedRating (speed) {
	return speed > 30 ? "Walk (Fast)" : speed < 30 ? "Walk (Slow)" : "Walk";
}

let list;
const sourceFilter = getSourceFilter();
const sizeFilter = new Filter({header: "Size", headerName: "体型", displayFn: Parser.sizeAbvToFull});
const asiFilter = new Filter({
	header: "Ability Bonus (Including Subrace)", headerName: "属性加值 (包括亚种)",
	items: [
		"任意力量增加",
		"任意敏捷增加",
		"任意体质增加",
		"任意智力增加",
		"任意感知增加",
		"任意魅力增加",
		"力量+2",
		"力量+1",
		"敏捷+2",
		"敏捷+1",
		"体质+2",
		"体质+1",
		"智力+2",
		"智力+1",
		"感知+2",
		"感知+1",
		"魅力+2",
		"魅力+1"
	]
});
let filterBox;
async function onJsonLoad (data) {
	list = ListUtil.search({
		valueNames: ['name', 'ability', 'size', 'source', 'clean-name', "uniqueid", "eng_name"],
		listClass: "races"
	});

	const jsonRaces = Renderer.race.mergeSubraces(data.race);
	const speedFilter = new Filter({header: "Speed", headerName: "速度", items: ["Climb", "Fly", "Swim", "Walk (Fast)", "Walk", "Walk (Slow)"], displayFn:Parser.SpeedToDisplay});
	const traitFilter = new Filter({
		header: "Traits", headerName: "特性",
		items: [
			"Amphibious",
			"Armor Proficiency",
			"Damage Resistance",
			"Darkvision", "Superior Darkvision",
			"Dragonmark",
			"Improved Resting",
			"Monstrous Race",
			"Natural Armor",
			"NPC Race",
			"Powerful Build",
			"Skill Proficiency",
			"Spellcasting",
			"Tool Proficiency",
			"Unarmed Strike",
			"Weapon Proficiency"
		],
		displayFn: function(t){
			switch(t){
				case "NPC Race": 		return "NPC种族";
				case "Monstrous Race":	return "怪物种族";
				case "Armor Proficiency": 	return "护甲熟练";
				case "Skill Proficiency": 	return "技能熟练";
				case "Tool Proficiency": 	return "工具熟练";
				case "Weapon Proficiency": 	return "武器熟练";
				case "Darkvision": 			return "黑暗视觉";
				case "Superior Darkvision": return "高级黑暗视觉";
				case "Natural Armor": 		return "天生护甲";
				case "Damage Resistance": 	return "伤害抗性";
				case "Spellcasting": 		return "施法";
				case "Unarmed Strike": 		return "徒手打击";
				case "Amphibious": 			return "两栖";
				case "Powerful Build": 		return "强健体格";
				case "Dragonmark": 			return "龙纹";
				case "Improved Resting": 	return "修整强化";
				default: return t;
			}
		},
		deselFn: (it) => {
			return it === "NPC Race";
		}
	});
	const languageFilter = new Filter({
		header: "Languages", headerName: "语言",
		items: [
			"Choose",
			"Common",
			"Abyssal",
			"Aquan",
			"Auran",
			"Celestial",
			"Draconic",
			"Dwarvish",
			"Elvish",
			"Giant",
			"Gnomish",
			"Goblin",
			"Halfling",
			"Infernal",
			"Orc",
			"Primordial",
			"Sylvan",
			"Terran",
			"Undercommon",
			"Other"
		],
		displayFn: Parser.LanguageToDisplay,
		umbrellaItems: ["Choose"]
	});

	filterBox = await pInitFilterBox(
		sourceFilter,
		asiFilter,
		sizeFilter,
		speedFilter,
		traitFilter,
		languageFilter
	);

	list.on("updated", () => {
		filterBox.setCount(list.visibleItems.length, list.items.length);
	});

	// filtering function
	$(filterBox).on(
		FilterBox.EVNT_VALCHANGE,
		handleFilterChange
	);

	const subList = ListUtil.initSublist({
		valueNames: ["name", "ability", "size", "id"],
		listClass: "subraces",
		getSublistRow: getSublistItem
	});
	ListUtil.initGenericPinnable();

	addRaces({race: jsonRaces});
	BrewUtil.pAddBrewData()
		.then(handleBrew)
		.then(() => BrewUtil.bind({list}))
		.then(() => BrewUtil.pAddLocalBrewData())
		.catch(BrewUtil.pPurgeBrew)
		.then(async () => {
			BrewUtil.makeBrewButton("manage-brew");
			BrewUtil.bind({filterBox, sourceFilter});
			await ListUtil.pLoadState();
			RollerUtil.addListRollButton();
			ListUtil.addListShowHide();

			History.init(true);
			ExcludeUtil.checkShowAllExcluded(raceList, $(`#pagecontent`));
		});
}

function handleBrew (homebrew) {
	addRaces(homebrew);
	return Promise.resolve();
}

let raceList = [];
let rcI = 0;
function addRaces (data) {
	if (!data.race || !data.race.length) return;

	raceList = raceList.concat(data.race);

	const racesTable = $("ul.races");
	let tempString = "";
	for (; rcI < raceList.length; rcI++) {
		const race = raceList[rcI];
		if (ExcludeUtil.isExcluded(race.name, "race", race.source)) continue;

		const ability = race.ability ? utils_getAbilityData(race.ability) : {asTextShort: "无"};
		if (race.ability) {
			const abils = getAbilityObjs(race.ability);
			race._fAbility = abils.map(a => mapAbilityObjToFull(a));
			const increases = {};
			abils.filter(it => it.amount > 0).forEach(it => increases[it.asi] = true);
			Object.keys(increases).forEach(it => race._fAbility.push(`任意${Parser.attAbvToFull(it)}增加`));
		} else race._fAbility = [];
		race._fSpeed = race.speed.walk ? [race.speed.climb ? "Climb" : null, race.speed.fly ? "Fly" : null, race.speed.swim ? "Swim" : null, getSpeedRating(race.speed.walk)].filter(it => it) : getSpeedRating(race.speed);
		race._fMisc = [
			race.darkvision === 120 ? "Superior Darkvision" : race.darkvision ? "Darkvision" : null,
			race.hasSpellcasting ? "Spellcasting" : null
		].filter(it => it).concat(race.traitTags || []);
		race._fSources = ListUtil.getCompleteSources(race);

		race._slAbility = ability.asTextShort;

		// convert e.g. "Elf (High)" to "High Elf" and add as a searchable field
		const bracketMatch = /^(.*?) \((.*?)\)$/.exec(race.name);

		tempString +=
			`<li class="row" ${FLTR_ID}='${rcI}' onclick="ListUtil.toggleSelected(event, this)" oncontextmenu="ListUtil.openContextMenu(event, this)">
				<a id='${rcI}' href="#${UrlUtil.autoEncodeHash(race)}" title="${race.name}">
					<span class='name col-4'>${race.name}</span>
					<span class='ability col-4'>${ability.asTextShort}</span>
					<span class='size col-2'>${Parser.sizeAbvToFull(race.size)}</span>
					<span class='source col-2 text-align-center ${Parser.sourceJsonToColor(race.source)}' title="${Parser.sourceJsonToFull(race.source)}">${Parser.sourceJsonToAbv(race.source)}</span>
					${bracketMatch ? `<span class="clean-name hidden">${bracketMatch[2]} ${bracketMatch[1]}</span>` : ""}
					
					<span class="uniqueid hidden">${race.uniqueId ? race.uniqueId : rcI}</span>
					<span class="eng_name hidden">${race.ENG_name ? race.ENG_name : race.name}</span>
				</a>
			</li>`;

		// populate filters
		sourceFilter.addIfAbsent(race._fSources);
		sizeFilter.addIfAbsent(race.size);
		asiFilter.addIfAbsent(race._fAbility);
	}
	const lastSearch = ListUtil.getSearchTermAndReset(list);
	racesTable.append(tempString);

	// sort filters
	sourceFilter.items.sort(SortUtil.srcSort_ch);
	sizeFilter.items.sort(ascSortSize);
	asiFilter.items.sort(ascSortAsi);

	function ascSortSize (a, b) {
		return SortUtil.ascSort(toNum(a), toNum(b));

		function toNum (size) {
			switch (size) {
				case "M":
					return 0;
				case "S":
					return -1;
				case "V":
					return 1;
			}
		}
	}

	function ascSortAsi (a, b) {
		if (a.startsWith("任意") && b.startsWith("任意")) {
			const aAbil = a.replace("任意", "").replace("增加", "").trim();
			const bAbil = b.replace("任意", "").replace("增加", "").trim();
			return ASI_SORT_POS[aAbil] - ASI_SORT_POS[bAbil];
		} else if (a.startsWith("任意")) {
			return -1;
		} else if (b.startsWith("任意")) {
			return 1;
		} else {
			const [aAbil, aScore] = a.split(" ");
			const [bAbil, bScore] = b.split(" ");
			return (ASI_SORT_POS[aAbil] - ASI_SORT_POS[bAbil]) || (Number(bScore) - Number(aScore));
		}
	}

	list.reIndex();
	if (lastSearch) list.search(lastSearch);
	list.sort("name");
	filterBox.render();
	handleFilterChange();

	ListUtil.setOptions({
		itemList: raceList,
		getSublistRow: getSublistItem,
		primaryLists: [list]
	});
	ListUtil.bindPinButton();
	Renderer.hover.bindPopoutButton(raceList);
	UrlUtil.bindLinkExportButton(filterBox);
	ListUtil.bindDownloadButton();
	ListUtil.bindUploadButton();

	Renderer.utils.bindPronounceButtons();
}

function handleFilterChange () {
	const f = filterBox.getValues();
	list.filter(function (item) {
		const r = raceList[$(item.elm).attr(FLTR_ID)];
		return filterBox.toDisplay(
			f,
			r._fSources,
			r._fAbility,
			r.size,
			r._fSpeed,
			r._fMisc,
			r.languageTags
		);
	});
	FilterBox.nextIfHidden(raceList);
}

function getSublistItem (race, pinId) {
	return `
		<li class="row" ${FLTR_ID}="${pinId}" oncontextmenu="ListUtil.openSubContextMenu(event, this)">
			<a href="#${UrlUtil.autoEncodeHash(race)}" title="${race.name}">
				<span class="name col-5">${race.name}</span>
				<span class="ability col-5">${race._slAbility}</span>
				<span class="size col-2">${Parser.sizeAbvToFull(race.size)}</span>
				<span class="id hidden">${pinId}</span>
			</a>
		</li>
	`;
}

const renderer = Renderer.get();
function loadhash (id) {
	renderer.setFirstSection(true);
	const $pgContent = $("#pagecontent").empty();
	const race = raceList[id];

	function buildStatsTab () {
		function getPronunciationButton () {
			return `<button class="btn btn-xs btn-default btn-name-pronounce">
				<span class="glyphicon glyphicon-volume-up name-pronounce-icon"></span>
				<audio class="name-pronounce">
				   <source src="${race.soundClip}" type="audio/mpeg">
				   <source src="audio/races/${/^(.*?)(\(.*?\))?$/.exec(race._baseName || race.name)[1].trim().toLowerCase()}.mp3" type="audio/mpeg">
				</audio>
			</button>`;
		}

		$pgContent.append(`
		<tbody>
		${Renderer.utils.getBorderTr()}
		<tr><th class="name" colspan="6">
		<span><b class="stats-name copyable" onclick="Renderer.utils._pHandleNameClick(this, '${race.source.escapeQuotes()}')">${race.name}</b>${race.ENG_name? (" <st style='font-size:80%;'>"+race.ENG_name+"</st>"):""}</span>
		${race.soundClip ? getPronunciationButton() : ""}
		<span class="stats-source ${Parser.sourceJsonToColor(race.source)}" title="${Parser.sourceJsonToFull(race.source)}">${Parser.sourceJsonToAbv(race.source)}</span>
		</th></tr>
		<tr><td colspan="6"><b>属性值：</b> ${(race.ability ? utils_getAbilityData(race.ability) : {asText: "无"}).asText}</td></tr>
		<tr><td colspan="6"><b>体型：</b> ${Parser.sizeAbvToFull(race.size)}</td></tr>
		<tr><td colspan="6"><b>速度：</b> ${Parser.getSpeedString(race)}</td></tr>
		<tr id="traits"><td class="divider" colspan="6"><div></div></td></tr>
		${Renderer.utils.getBorderTr()}
		</tbody>
		`);

		const renderStack = [];
		renderStack.push("<tr class='text'><td colspan='6'>");
		renderer.recursiveRender({type: "entries", entries: race.entries}, renderStack, {depth: 1});
		renderStack.push("</td></tr>");
		if (race.traitTags && race.traitTags.includes("NPC Race")) {
			renderStack.push(`<tr class="text"><td colspan="6"><section class="text-muted">`);
			renderer.recursiveRender(
				`{@i 注记： 这个种族被记载于{@i 《地下城主指南》}以做为创造非玩家角色的选项。它并非被设计做为玩家可用的种族。}`
				, renderStack, {depth: 2});
			renderStack.push(`</section></td></tr>`);
		}
		renderStack.push(Renderer.utils.getPageTr(race));

		$pgContent.find('tbody tr:last').before(renderStack.join(""));
	}

	function buildFluffTab (isImageTab) {
		return Renderer.utils.buildFluffTab(
			isImageTab,
			$pgContent,
			race,
			getFluff,
			`data/fluff-races.json`,
			() => true
		);
	}

	function getFluff (fluffJson) {
		const predefined = Renderer.utils.getPredefinedFluff(race, "raceFluff");
		if (predefined) return predefined;

		const subFluff = race._baseName && race.name.toLowerCase() === race._baseName.toLowerCase() ? "" : fluffJson.race.find(it => (isStringMatch(it.name, race.name) || isStringMatch(it.name, race.ENG_name)) && it.source.toLowerCase() === race.source.toLowerCase());

		const baseFluff = fluffJson.race.find(it => race._baseName && (isStringMatch(it.name, race._baseName) /*|| isStringMatch(it.name, race.ENG_name)*/) && race._baseSource && it.source.toLowerCase() === race._baseSource.toLowerCase());

		if (!subFluff && !baseFluff) return null;

		const findFluff = (toFind) => fluffJson.race.find(it => isStringMatch(toFind.name, it.name) && toFind.source.toLowerCase() === it.source.toLowerCase());

		const fluff = {type: "section"};

		const addFluff = (fluffToAdd, isBase) => {
			if (fluffToAdd.entries) {
				fluff.entries = fluff.entries || [];
				const toAdd = {type: "section", entries: MiscUtil.copy(fluffToAdd.entries)};
				if (isBase && !fluffToAdd.entries.length) toAdd.name = race._baseName;
				fluff.entries.push(toAdd);
			}
			if (fluffToAdd.images && !(isBase && subFluff && subFluff._excludeBaseImages)) {
				fluff.images = fluff.images || [];
				fluff.images.push(...MiscUtil.copy(fluffToAdd.images));
			}
			if (fluffToAdd._appendCopy) {
				const toAppend = findFluff(fluffToAdd._appendCopy);
				if (toAppend.entries) {
					fluff.entries = fluff.entries || [];
					const toAdd = {type: "section", entries: MiscUtil.copy(toAppend.entries)};
					if (isBase && !fluffToAdd.entries.length) toAdd.name = race._baseName;
					fluff.entries.push(toAdd);
				}
				if (toAppend.images) {
					fluff.images = fluff.images || [];
					fluff.images.push(...MiscUtil.copy(toAppend.images));
				}
			}
		};

		if (subFluff) addFluff(subFluff);
		if (baseFluff) addFluff(baseFluff, true);

		if ((subFluff && subFluff.uncommon) || (baseFluff && baseFluff.uncommon)) {
			const entryUncommon = {type: "section", entries: [MiscUtil.copy(fluffJson.meta.uncommon)]};
			if (fluff.entries) {
				fluff.entries.push(entryUncommon);
			} else {
				fluff.entries = [HTML_NO_INFO];
				fluff.entries.push(...entryUncommon.entries)
			}
		}

		if ((subFluff && subFluff.monstrous) || (baseFluff && baseFluff.monstrous)) {
			const entryMonstrous = {type: "section", entries: [MiscUtil.copy(fluffJson.meta.monstrous)]};
			if (fluff.entries) {
				fluff.entries.push(entryMonstrous);
			} else {
				fluff.entries = [HTML_NO_INFO];
				fluff.entries.push(...entryMonstrous.entries)
			}
		}

		if (fluff.entries.length && fluff.entries[0].type === "section") {
			const firstSection = fluff.entries.splice(0, 1)[0];
			fluff.entries.unshift(...firstSection.entries);
		}

		return fluff;
	}

	const traitTab = Renderer.utils.tabButton(
		"特性",
		() => {},
		buildStatsTab
	);
	const infoTab = Renderer.utils.tabButton(
		"资讯",
		() => {},
		buildFluffTab
	);
	const picTab = Renderer.utils.tabButton(
		"图片",
		() => {},
		buildFluffTab.bind(null, true)
	);

	Renderer.utils.bindTabButtons(traitTab, infoTab, picTab);

	ListUtil.updateSelected();
}

function loadsub (sub) {
	filterBox.setFromSubHashes(sub);
	ListUtil.setFromSubHashes(sub);
}
