"use strict";

window.onload = async function load () {
	await ExcludeUtil.pInitialise();
	EntryRenderer.item.buildList((incItemList) => {
		populateTablesAndFilters({item: incItemList});
	}, {}, true);
};

function rarityValue (rarity) {
	switch (rarity) {
		case "None": return 0;
		case "Common": return 1;
		case "Uncommon": return 2;
		case "Rare": return 3;
		case "Very Rare": return 4;
		case "Legendary": return 5;
		case "Artifact": return 6;
		case "Other": return 7;
		case "Varies": return 8;
		case "Unknown (Magic)": return 9;
		case "Unknown": return 10;
		default: return 11;
	}
}

function sortItems (a, b, o) {
	if (o.valueName === "name") return b._values.name.toLowerCase() > a._values.name.toLowerCase() ? 1 : -1;
	else if (o.valueName === "type") {
		if (b._values.type === a._values.type) return SortUtil.compareNames(a, b);
		return b._values.type.toLowerCase() > a._values.type.toLowerCase() ? 1 : -1;
	} else if (o.valueName === "source") {
		if (b._values.source === a._values.source) return SortUtil.compareNames(a, b);
		return b._values.source.toLowerCase() > a._values.source.toLowerCase() ? 1 : -1;
	} else if (o.valueName === "rarity") {
		if (b._values.rarity === a._values.rarity) return SortUtil.compareNames(a, b);
		return rarityValue(b._values.rarity) > rarityValue(a._values.rarity) ? 1 : -1;
	} else if (o.valueName === "count") {
		return SortUtil.ascSort(Number(a.values().count), Number(b.values().count));
	} else if (o.valueName === "weight") {
		return SortUtil.ascSort(Number(a.values().weight), Number(b.values().weight));
	} else if (o.valueName === "cost") {
		return SortUtil.ascSort(Number(a.values().cost), Number(b.values().cost));
	} else return 0;
}

let mundanelist;
let magiclist;
const sourceFilter = getSourceFilter();
const DEFAULT_HIDDEN_TYPES = new Set(["$", "Futuristic", "Modern", "Renaissance"]);
const typeFilter = new Filter({header: "Type", headerName: "類型", deselFn: (it) => DEFAULT_HIDDEN_TYPES.has(it), 
	items:["$","Trade Good","Adventuring Gear","Light Armor","Medium Armor","Heavy Armor","Shield","Simple Weapon","Martial Weapon","Melee Weapon","Ranged Weapon","Firearm","Ammunition","Explosive","Tool","Artisan Tool","Instrument","Gaming Set","Spellcasting Focus","Rod","Staff","Wand","Scroll","Ring","Wondrous Item","Potion","Poison","Mount","Vehicle","Tack and Harness","Renaissance","Modern","Futuristic"], displayFn: Parser.ItemTypeToDisplay});
const tierFilter = new Filter({header: "Tier", headerName: "階級", items: ["None", "Minor", "Major"]});
const propertyFilter = new Filter({header: "Property", headerName: "物品屬性", displayFn: StrUtil.uppercaseFirst});
const costFilter = new RangeFilter({header: "Cost", headerName: "價值", min: 0, max: 100, allowGreater: true, suffix: "金幣"});
const attachedSpellsFilter = new Filter({header: "Attached Spells", headerName: "附加法術", displayFn: (it) => it.split("|")[0].toTitleCase()});
let filterBox;
async function populateTablesAndFilters (data) {
	const rarityFilter = new Filter({
		header: "Rarity", headerName: "稀有度",
		items: ["None", "Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact", "Unknown", "Unknown (Magic)", "Other"],
		displayFn: Parser.translateItemKeyToDisplay
	});
	const attunementFilter = new Filter({header: "Attunement", headerName: "同調", items: ["Yes", "By...", "Optional", "No"], displayFn: function(str){
			switch(str){
			case "Yes": return "需要";
			case "By...": return "限定...";
			case "Optional": return "可選";
			case "No": return "不須";
			default: return str;
		};}});
	const categoryFilter = new Filter({
		header: "Category", headerName: "分類",
		items: ["Basic", "Generic Variant", "Specific Variant", "Other"],
		deselFn: (it) => it === "Specific Variant"
	});
	const miscFilter = new Filter({header: "Miscellaneous", headerName: "雜項", items: ["Charges", "Cursed", "Magic", "Mundane", "Sentient"], displayFn:function(str){switch(str){
		case "Magic": return "魔法物品";
		case "Mundane": return "尋常物品";
		case "Cursed": return "詛咒";
		case "Charges": return "充能";
		case "Sentient": return "智能";
		default: return str;
		}}});

	filterBox = await pInitFilterBox(sourceFilter, typeFilter, tierFilter, rarityFilter, propertyFilter, attunementFilter, categoryFilter, costFilter, miscFilter, attachedSpellsFilter);

	const mundaneOptions = {
		valueNames: ["name", "type", "cost", "weight", "source", "uniqueid", "eng_name"],
		listClass: "mundane",
		sortClass: "none",
		sortFunction: sortItems
	};
	mundanelist = ListUtil.search(mundaneOptions);
	const magicOptions = {
		valueNames: ["name", "type", "weight", "rarity", "source", "uniqueid", "eng_name"],
		listClass: "magic",
		sortClass: "none",
		sortFunction: sortItems
	};
	magiclist = ListUtil.search(magicOptions);

	const mundaneWrapper = $(`.ele-mundane`);
	const magicWrapper = $(`.ele-magic`);
	$(`.side-label--mundane`).click(() => {
		filterBox.setFromValues({"Miscellaneous": ["mundane"]});
		handleFilterChange();
	});
	$(`.side-label--magic`).click(() => {
		filterBox.setFromValues({"Miscellaneous": ["magic"]});
		handleFilterChange();
	});
	mundanelist.__listVisible = true;
	mundanelist.on("updated", () => {
		hideListIfEmpty(mundanelist, mundaneWrapper);
		filterBox.setCount(mundanelist.visibleItems.length + magiclist.visibleItems.length, mundanelist.items.length + magiclist.items.length);
	});
	magiclist.__listVisible = true;
	magiclist.on("updated", () => {
		hideListIfEmpty(magiclist, magicWrapper);
		filterBox.setCount(mundanelist.visibleItems.length + magiclist.visibleItems.length, mundanelist.items.length + magiclist.items.length);
	});

	// filtering function
	$(filterBox).on(
		FilterBox.EVNT_VALCHANGE,
		handleFilterChange
	);

	function hideListIfEmpty (list, $eles) {
		if (list.visibleItems.length === 0) {
			if (list.__listVisible) {
				list.__listVisible = false;
				$eles.hide();
			}
		} else if (!list.__listVisible) {
			list.__listVisible = true;
			$eles.show();
		}
	}

	$("#filtertools-mundane").find("button.sort").on("click", function (evt) {
		evt.stopPropagation();
		const $this = $(this);
		const direction = $this.data("sortby") === "asc" ? "desc" : "asc";
		$this.data("sortby", direction);
		SortUtil.handleFilterButtonClick.call(this, "#filtertools-mundane", $this, direction);
		mundanelist.sort($this.data("sort"), {order: $this.data("sortby"), sortFunction: sortItems});
	});

	$("#filtertools-magic").find("button.sort").on("click", function (evt) {
		evt.stopPropagation();
		const $this = $(this);
		const direction = $this.data("sortby") === "asc" ? "desc" : "asc";

		$this.data("sortby", direction);
		SortUtil.handleFilterButtonClick.call(this, "#filtertools-magic", $this, direction);
		magiclist.sort($this.data("sort"), {order: $this.data("sortby"), sortFunction: sortItems});
	});

	$("#itemcontainer").find("h3").not(":has(input)").click(function () {
		if ($(this).next("ul.list").css("max-height") === "500px") {
			$(this).siblings("ul.list").animate({
				maxHeight: "250px",
				display: "block"
			});
			return;
		}
		$(this).next("ul.list").animate({
			maxHeight: "500px",
			display: "block"
		}).siblings("ul.list").animate({
			maxHeight: "0",
			display: "none"
		});
	});

	RollerUtil.addListRollButton();
	addListShowHide();

	const subList = ListUtil.initSublist(
		{
			valueNames: ["name", "weight", "price", "count", "id"],
			listClass: "subitems",
			sortFunction: sortItems,
			getSublistRow: getSublistItem,
			onUpdate: onSublistChange
		}
	);
	ListUtil.initGenericAddable();

	addItems(data);
	BrewUtil.pAddBrewData()
		.then(handleBrew)
		.then(BrewUtil.pAddLocalBrewData)
		.catch(BrewUtil.pPurgeBrew)
		.then(async () => {
			BrewUtil.makeBrewButton("manage-brew");
			BrewUtil.bind({lists: [mundanelist, magiclist], filterBox, sourceFilter});
			await ListUtil.pLoadState();

			History.init(true);
			ExcludeUtil.checkShowAllExcluded(itemList, $(`#pagecontent`));
		});
}

async function handleBrew (homebrew) {
	const itemList = await EntryRenderer.item.getItemsFromHomebrew(homebrew);
	addItems({item: itemList});
}

let itemList = [];
let itI = 0;
function addItems (data) {
	if (!data.item || !data.item.length) return;
	itemList = itemList.concat(data.item);

	const liList = {mundane: "", magic: ""}; // store the <li> tag content here and change the DOM once for each property after the loop

	for (; itI < itemList.length; itI++) {
		const curitem = itemList[itI];
		if (ExcludeUtil.isExcluded(curitem.name, "item", curitem.source)) continue;
		if (curitem.noDisplay) continue;
		EntryRenderer.item.enhanceItem(curitem);

		const name = curitem.name;
		const rarity = curitem.rarity;
		const category = curitem.category;
		const source = curitem.source;
		const sourceAbv = Parser.sourceJsonToAbv(source);
		const sourceFull = Parser.sourceJsonToFull(source);
		const tierTags = [];
		tierTags.push(curitem.tier ? curitem.tier : "None");

		// for filter to use
		curitem._fTier = tierTags;
		curitem._fProperties = curitem.property ? curitem.property.map(p => curitem._allPropertiesPtr[p].name).filter(n => n) : [];
		curitem._fMisc = curitem.sentient ? ["Sentient"] : [];
		if (curitem.curse) curitem._fMisc.push("Cursed");
		const isMundane = rarity === "None" || rarity === "Unknown" || category === "Basic";
		curitem._fMisc.push(isMundane ? "Mundane" : "Magic");
		if (curitem.charges) curitem._fMisc.push("Charges");
		curitem._fCost = Parser.coinValueToNumber(curitem.value);
		if (isMundane) {
			liList["mundane"] += `
			<li class="row" ${FLTR_ID}=${itI} onclick="ListUtil.toggleSelected(event, this)" oncontextmenu="ListUtil.openContextMenu(event, this)">
				<a id="${itI}" href="#${UrlUtil.autoEncodeHash(curitem)}" title="${name}">
					<span class="name col-3">${name}</span>
					<span class="type col-4-3">${curitem.typeListText}</span>
					<span class="col-1-5 text-align-center">${curitem.value ? Parser.itemValueToDisplay(curitem.value.replace(/ +/g, "")) : "\u2014"}</span>
					<span class="col-1-5 text-align-center">${Parser.itemWeightToFull(curitem) || "\u2014"}</span>
					<span class="source col-1-7 text-align-center ${Parser.sourceJsonToColor(curitem.source)}" title="${sourceFull}">${sourceAbv}</span>
					<span class="cost hidden">${curitem._fCost}</span>
					<span class="weight hidden">${Parser.weightValueToNumber(curitem.weight)}</span>
					
					<span class="uniqueid hidden">${curitem.uniqueId ? curitem.uniqueId : itI}</span>
					<span class="eng_name hidden">${curitem.ENG_name ? curitem.ENG_name : curitem.name}</span>
				</a>
			</li>`;
		} else {
			liList["magic"] += `
			<li class="row" ${FLTR_ID}=${itI} onclick="ListUtil.toggleSelected(event, this)" oncontextmenu="ListUtil.openContextMenu(event, this)">
				<a id="${itI}" href="#${UrlUtil.autoEncodeHash(curitem)}" title="${name}">
					<span class="name col-3-5">${name}</span>
					<span class="type col-3-3">${curitem.typeListText}</span>
					<span class="col-1-5 text-align-center">${Parser.itemWeightToFull(curitem) || "\u2014"}</span>
					<span class="rarity col-2">${Parser.translateItemKeyToDisplay(rarity)}</span>
					<span class="source col-1-7 text-align-center ${Parser.sourceJsonToColor(curitem.source)}" title="${sourceFull}">${sourceAbv}</span>
					<span class="weight hidden">${Parser.weightValueToNumber(curitem.weight)}</span>
					
					<span class="uniqueid hidden">${curitem.uniqueId ? curitem.uniqueId : itI}</span>
					<span class="eng_name hidden">${curitem.ENG_name ? curitem.ENG_name : curitem.name}</span>
				</a>
			</li>`;
		}

		// populate filters
		sourceFilter.addIfAbsent(source);
		curitem.procType.forEach(t => typeFilter.addIfAbsent(t));
		tierTags.forEach(tt => tierFilter.addIfAbsent(tt));
		curitem._fProperties.forEach(p => propertyFilter.addIfAbsent(p));
		attachedSpellsFilter.addIfAbsent(curitem.attachedSpells);
	}
	const lastSearch = ListUtil.getSearchTermAndReset(mundanelist, magiclist);
	// populate table
	$("ul.list.mundane").append(liList.mundane);
	$("ul.list.magic").append(liList.magic);
	// populate table labels
	$(`h3.ele-mundane span.side-label`).text("尋常物品");
	$(`h3.ele-magic span.side-label`).text("魔法物品");
	// sort filters
	sourceFilter.items.sort(SortUtil.ascSort);
	//typeFilter.items.sort(SortUtil.ascSort);
	attachedSpellsFilter.items.sort(SortUtil.ascSortLower);

	mundanelist.reIndex();
	magiclist.reIndex();
	if (lastSearch) {
		mundanelist.search(lastSearch);
		magiclist.search(lastSearch);
	}
	mundanelist.sort("type", {order: "desc"});
	magiclist.sort("name", {order: "desc"});
	filterBox.render();
	handleFilterChange();

	ListUtil.setOptions({
		itemList: itemList,
		getSublistRow: getSublistItem,
		primaryLists: [mundanelist, magiclist]
	});
	ListUtil.bindAddButton();
	ListUtil.bindSubtractButton();
	EntryRenderer.hover.bindPopoutButton(itemList);
	UrlUtil.bindLinkExportButton(filterBox);
	ListUtil.bindDownloadButton();
	ListUtil.bindUploadButton();
}

function handleFilterChange () {
	const f = filterBox.getValues();
	function listFilter (item) {
		const i = itemList[$(item.elm).attr(FLTR_ID)];
		return filterBox.toDisplay(
			f,
			i.source,
			i.procType,
			i._fTier,
			i.rarity,
			i._fProperties,
			i.attunementCategory,
			i.category,
			i._fCost,
			i._fMisc,
			i.attachedSpells
		);
	}
	mundanelist.filter(listFilter);
	magiclist.filter(listFilter);
	FilterBox.nextIfHidden(itemList);
}

function onSublistChange () {
	const totalWeight = $(`#totalweight`);
	const totalValue = $(`#totalvalue`);
	let weight = 0;
	let value = 0;
	ListUtil.sublist.items.forEach(it => {
		const item = itemList[Number(it._values.id)];
		const count = Number($(it.elm).find(".count").text());
		if (item.weight) weight += Number(item.weight) * count;
		if (item.value) value += Parser.coinValueToNumber(item.value) * count;
	});
	totalWeight.text(`${weight.toLocaleString()} 磅${weight > 1 ? "" : ""}`);
	totalValue.text(`${value.toLocaleString()} 金幣`)
}

function getSublistItem (item, pinId, addCount) {
	return `
		<li class="row" ${FLTR_ID}="${pinId}" oncontextmenu="ListUtil.openSubContextMenu(event, this)">
			<a href="#${UrlUtil.autoEncodeHash(item)}" title="${item.name}">
				<span class="name col-6">${item.name}</span>
				<span class="weight text-align-center col-2">${item.weight ? `${item.weight}磅${item.weight > 1 ? "" : ""}` : "\u2014"}</span>
				<span class="price text-align-center col-2">${item.value ? Parser.itemValueToDisplay(item.value) : "\u2014"}</span>
				<span class="count text-align-center col-2">${addCount || 1}</span>
				<span class="cost hidden">${item._fCost}</span>
				<span class="id hidden">${pinId}</span>
			</a>
		</li>
	`;
}

const renderer = EntryRenderer.getDefaultRenderer();
function loadhash (id) {
	renderer.setFirstSection(true);
	const $content = $(`#pagecontent`).empty();
	const item = itemList[id];

	function buildStatsTab () {
		const $toAppend = $(`
		${EntryRenderer.utils.getBorderTr()}
		${EntryRenderer.utils.getNameTr(item)}
		<tr>
			<td id="typerarityattunement" class="typerarityattunement" colspan="6">
				<span id="type">Type</span><span id="rarity">, rarity</span>
				<span id="attunement">(requires attunement)</span>
			</td>
		</tr>
		<tr>
			<td id="valueweight" colspan="2"><span id="value">10gp</span> <span id="weight">45 lbs.</span></td>
			<td id="damageproperties" class="damageproperties" colspan="4"><span id="damage">Damage</span> <span id="damagetype">type</span> <span id="properties">(versatile)</span></td>
		</tr>
		<tr id="text"><td class="divider" colspan="6"><div></div></td></tr>
		${EntryRenderer.utils.getPageTr(item)}
		${EntryRenderer.utils.getBorderTr()}
	`);
		$content.append($toAppend);

		const source = item.source;
		const sourceFull = Parser.sourceJsonToFull(source);

		const type = item.type || "";
		if (type === "INS" || type === "GS") item.additionalSources = item.additionalSources || [];
		if (type === "INS") {
			if (!item.additionalSources.find(it => it.source === "XGE" && it.page === 83)) item.additionalSources.push({ "source": "XGE", "page": 83 })
		} else if (type === "GS") {
			if (!item.additionalSources.find(it => it.source === "XGE" && it.page === 81)) item.additionalSources.push({ "source": "XGE", "page": 81 })
		}
		const addSourceText = item.additionalSources ? `. Additional information from ${item.additionalSources.map(as => `<i>${Parser.sourceJsonToFull(as.source)}</i>, page ${as.page}`).join("; ")}.` : null;
		$content.find("td#source span").html(`<i>${sourceFull}</i>${item.page ? `, page ${item.page}${addSourceText || ""}` : ""}`);

		$content.find("td span#value").html(item.value ? Parser.itemValueToDisplay(item.value) + (item.weight ? "、" : "") : "");
		$content.find("td span#weight").html(item.weight ? item.weight + (Number(item.weight) === 1 ? "磅" : "磅") + (item.weightNote ? ` ${item.weightNote}` : "") : "");

		const [damage, damageType, propertiesTxt] = EntryRenderer.item.getDamageAndPropertiesText(item);
		$content.find("span#damage").html(damage);
		$content.find("span#damagetype").html(damageType);
		$content.find("span#properties").html(propertiesTxt);

		const typeRarityAttunement = EntryRenderer.item.getTypeRarityAndAttunementText(item).filter(Boolean).join(", ");
		$content.find("#typerarityattunement").html(typeRarityAttunement);

		$content.find("tr.text").remove();
		const renderStack = [];
		if (item.entries && item.entries.length) {
			const entryList = {type: "entries", entries: item.entries};
			renderer.recursiveEntryRender(entryList, renderStack, 1);
		}

		// tools, artisan tools, instruments, gaming sets
		if (type === "T" || type === "AT" || type === "INS" || type === "GS") {
			renderStack.push(`<p class="text-align-center"><i>參見「變體與可選規則」頁面的 <a href="${renderer.baseUrl}variantrules.html#${UrlUtil.encodeForHash(["Tool Proficiencies", "XGE"])}" target="_blank">工具熟練</a> 條目以瞭解更多情報。</i></p>`);
			if (type === "INS") {
				const additionEntriesList = {type: "entries", entries: TOOL_INS_ADDITIONAL_ENTRIES};
				renderer.recursiveEntryRender(additionEntriesList, renderStack, 1);
			} else if (type === "GS") {
				const additionEntriesList = {type: "entries", entries: TOOL_GS_ADDITIONAL_ENTRIES};
				renderer.recursiveEntryRender(additionEntriesList, renderStack, 1);
			}
		}
		if (item.additionalEntries) {
			const additionEntriesList = {type: "entries", entries: item.additionalEntries};
			renderer.recursiveEntryRender(additionEntriesList, renderStack, 1);
		}

		const renderedText = renderStack.join("")
			.split(item.name.toLowerCase())
			.join(`<i>${item.name.toLowerCase()}</i>`)
			.split(item.name.toLowerCase().toTitleCase())
			.join(`<i>${item.name.toLowerCase().toTitleCase()}</i>`);
		if (renderedText && renderedText.trim()) {
			$content.find("tr#text").show().after(`
			<tr class="text">
				<td colspan="6" class="text1">
					${renderedText}
				</td>
			</tr>
		`);
		} else $content.find("tr#text").hide();
	}

	function buildFluffTab (isImageTab) {
		return EntryRenderer.utils.buildFluffTab(
			isImageTab,
			$content,
			item,
			(fluffJson) => item.fluff || fluffJson.item.find(it => it.name === item.name && it.source === item.source),
			`data/fluff-items.json`,
			() => true
		);
	}

	const statTab = EntryRenderer.utils.tabButton(
		"物品",
		() => {},
		buildStatsTab
	);
	const infoTab = EntryRenderer.utils.tabButton(
		"情報",
		() => {},
		buildFluffTab
	);
	const picTab = EntryRenderer.utils.tabButton(
		"圖片",
		() => {},
		() => buildFluffTab(true)
	);

	// only display the "Info" tab if there's some fluff info--currently (2018-12-13), no official item has text fluff
	if (item.fluff) EntryRenderer.utils.bindTabButtons(statTab, infoTab, picTab);
	else EntryRenderer.utils.bindTabButtons(statTab, picTab);

	ListUtil.updateSelected();
}

function loadsub (sub) {
	filterBox.setFromSubHashes(sub);
	ListUtil.setFromSubHashes(sub);
}

const TOOL_INS_ADDITIONAL_ENTRIES = [
	"熟練於一項樂器代表著你熟悉於使用並演奏它的技巧。你同時也知曉一些常以該樂器演奏的經典曲目。",
	{
		"type": "entries",
		"name": "歷史",
		"entries": [
			"你的專業有助你回想那些與你樂器有關的傳說。"
		]
	},
	{
		"type": "entries",
		"name": "表演",
		"entries": [
			"當你將樂器融入你的演出時，你上演一齣優秀表演的能力將會因此提升。"
		]
	},
	{
		"type": "entries",
		"name": "作曲",
		"entries": [
			"做為一次長休的一部份，你可以為你的樂器譜寫一段新的旋律和歌詞。你可能可以使用這項能力以這段琅琅上口的曲調驚艷一名貴族、或是散佈流言蜚語。"
		]
	},
	{
		"type": "table",
		"caption": "樂器",
		"colLabels": [
			"用途", "DC"
		],
		"colStyles": [
			"col-10",
			"col-2 text-align-center"
		],
		"rows": [
			["辨識出一段旋律", "10"],
			["即興演奏一段旋律", "20"]
		]
	}
];

const TOOL_GS_ADDITIONAL_ENTRIES = [
	"熟練於一項遊戲套組代表著精通於一種遊戲類型，像是三龍牌、或是使用骰子的機率遊戲。",
	{
		"type": "entries",
		"name": "構成元件",
		"entries": [
			"一套遊戲套組內含遊玩某項特定遊戲或遊戲類型所需的所有材料，像是一副完整的牌組、或是一張棋盤和棋子。"
		]
	},
	{
		"type": "entries",
		"name": "歷史",
		"entries": [
			"你對這項遊戲的精通也包括了瞭解關於它的歷史、與它有關的重要事件、以及牽涉到它的著名歷史人物。"
		]
	},
	{
		"type": "entries",
		"name": "察言觀色",
		"entries": [
			"與某人一起玩遊戲是一個理解他們個人特質的好方法，這讓你可以更容易的分辨他們的謊言，並理解他們的情緒。"
		]
	},
	{
		"type": "entries",
		"name": "手上把戲",
		"entries": [
			"手上把戲在你想要於遊戲中作弊時是一項相當有用的技能，它讓你可以讓棋子換位、在掌中藏牌、或改變擲骰的結果。或者，藉由靈巧的操作遊戲中的元件以使目標全神貫注於遊戲中，也能在嘗試趁機扒竊時起到很好的分心效果。"
		]
	},
	{
		"type": "table",
		"caption": "遊戲套組",
		"colLabels": [
			"用途", "DC"
		],
		"colStyles": [
			"col-10",
			"col-2 text-align-center"
		],
		"rows": [
			["逮到玩家的作弊行為", "15"],
			["了解一名對手的個人特質", "15"]
		]
	}
];
