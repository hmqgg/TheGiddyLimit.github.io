"use strict";

const JSON_URL = "data/backgrounds.json";
const JSON_FLUFF_URL = "data/fluff-backgrounds.json";
const renderer = Renderer.get();

let list;
const sourceFilter = getSourceFilter();
const skillFilter = new Filter({header: "Skill Proficiencies", headerName: "技能熟练", displayFn: Parser.SkillToDisplay});
const toolFilter = new Filter({header: "Tool Proficiencies", headerName: "工具熟练", displayFn: Parser.translateKeyToDisplay});
const languageFilter = new Filter({header: "Language Proficiencies", headerName: "语言熟练", displayFn: Parser.LanguageToDisplay});
let filterBox;

window.onload = async function load () {
	filterBox = await pInitFilterBox(
		sourceFilter,
		skillFilter,
		toolFilter,
		languageFilter
	);
	await ExcludeUtil.pInitialise();
	SortUtil.initHandleFilterButtonClicks();
	onJsonLoad(await DataUtil.loadJSON(JSON_URL));
};

function onJsonLoad (data) {
	list = ListUtil.search({
		valueNames: ["name", "source", "skills", "uniqueid", "eng_name"],
		listClass: "backgrounds"
	});

	list.on("updated", () => {
		filterBox.setCount(list.visibleItems.length, list.items.length);
	});

	$(filterBox).on(
		FilterBox.EVNT_VALCHANGE,
		handleFilterChange
	);

	const subList = ListUtil.initSublist({
		valueNames: ["name", "skills", "id"],
		listClass: "subbackgrounds",
		getSublistRow: getSublistItem
	});
	ListUtil.initGenericPinnable();

	addBackgrounds(data);
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
			ExcludeUtil.checkShowAllExcluded(bgList, $(`#pagecontent`));
		});
}

function handleBrew (homebrew) {
	addBackgrounds(homebrew);
	return Promise.resolve();
}

let bgList = [];
let bgI = 0;
function addBackgrounds (data) {
	if (!data.background || !data.background.length) return;

	bgList = bgList.concat(data.background);

	const bgTable = $("ul.backgrounds");
	let tempString = "";
	for (; bgI < bgList.length; bgI++) {
		const bg = bgList[bgI];
		if (ExcludeUtil.isExcluded(bg.name, "background", bg.source)) continue;

		const skillDisplay = Renderer.background.getSkillSummary(bg.skillProficiencies, true, bg._fSkills = []);
		Renderer.background.getToolSummary(bg.toolProficiencies, true, bg._fTools = []);
		Renderer.background.getLanguageSummary(bg.languageProficiencies, true, bg._fLangs = []);

		// populate table
		tempString +=
			`<li class="row" ${FLTR_ID}="${bgI}" onclick="ListUtil.toggleSelected(event, this)" oncontextmenu="ListUtil.openContextMenu(event, this)">
				<a id="${bgI}" href="#${UrlUtil.autoEncodeHash(bg)}" title="${bg.name}">
					<span class="name col-4">${bg.name.replace("Variant ", "").replace("变体", "")}</span>
					<span class="skills col-6">${skillDisplay}</span>
					<span class="source col-2 text-align-center ${Parser.sourceJsonToColor(bg.source)}" title="${Parser.sourceJsonToFull(bg.source)}">${Parser.sourceJsonToAbv(bg.source)}</span>
					
					<span class="uniqueid hidden">${bg.uniqueId ? bg.uniqueId : bgI}</span>
					<span class="eng_name hidden">${bg.ENG_name ? bg.ENG_name : bg.name}</span>
				</a>
			</li>`;

		// populate filters
		sourceFilter.addIfAbsent(bg.source);
		skillFilter.addIfAbsent(bg._fSkills);
		toolFilter.addIfAbsent(bg._fTools);
		languageFilter.addIfAbsent(bg._fLangs);
	}
	const lastSearch = ListUtil.getSearchTermAndReset(list);
	bgTable.append(tempString);

	// sort filters
	sourceFilter.items.sort(SortUtil.srcSort_ch);
	skillFilter.items.sort(SortUtil.ascSort);
	toolFilter.items.sort(SortUtil.ascSort);
	languageFilter.items.sort(SortUtil.ascSort);

	list.reIndex();
	if (lastSearch) list.search(lastSearch);
	list.sort("source");
	filterBox.render();
	handleFilterChange();

	ListUtil.setOptions({
		itemList: bgList,
		getSublistRow: getSublistItem,
		primaryLists: [list]
	});
	ListUtil.bindPinButton();
	Renderer.hover.bindPopoutButton(bgList);
	UrlUtil.bindLinkExportButton(filterBox);
	ListUtil.bindDownloadButton();
	ListUtil.bindUploadButton();
}

function handleFilterChange () {
	const f = filterBox.getValues();
	list.filter(function (item) {
		const bg = bgList[$(item.elm).attr(FLTR_ID)];
		return filterBox.toDisplay(
			f,
			bg.source,
			bg._fSkills,
			bg._fTools,
			bg._fLangs
		);
	});
	FilterBox.nextIfHidden(bgList);
}

function getSublistItem (bg, pinId) {
	return `
		<li class="row" ${FLTR_ID}="${pinId}" oncontextmenu="ListUtil.openSubContextMenu(event, this)">
			<a href="#${UrlUtil.autoEncodeHash(bg)}" title="${bg.name}">
				<span class="name col-4">${bg.name}</span>
				<span class="name col-8">${Renderer.background.getSkillSummary(bg.skillProficiencies || [], true)}</span>
				<span class="id hidden">${pinId}</span>
			</a>
		</li>
	`;
}

function loadhash (id) {
	renderer.setFirstSection(true);
	const $pgContent = $("#pagecontent").empty();
	const bg = bgList[id];

	function buildStatsTab () {
		const renderStack = [];
		const entryList = {type: "entries", entries: bg.entries};
		renderer.recursiveRender(entryList, renderStack);

		$pgContent.append(`
			${Renderer.utils.getBorderTr()}
			${Renderer.utils.getNameTr(bg)}
			<tr><td class="divider" colspan="6"><div></div></td></tr>
			<tr class="text"><td colspan="6">${renderStack.join("")}</td></tr>
			${Renderer.utils.getPageTr(bg)}
			${Renderer.utils.getBorderTr()}
		`);
	}

	const traitTab = Renderer.utils.tabButton(
		"特性",
		() => {},
		buildStatsTab
	);

	const infoTab = Renderer.utils.tabButton(
		"资讯",
		() => {},
		() => {
			function get$Tr () {
				return $(`<tr class="text">`);
			}
			function get$Td () {
				return $(`<td colspan="6" class="text">`);
			}

			$pgContent.append(Renderer.utils.getBorderTr());
			$pgContent.append(Renderer.utils.getNameTr(bg));
			let $tr = get$Tr();
			let $td = get$Td().appendTo($tr);
			$pgContent.append($tr);
			$pgContent.append(Renderer.utils.getBorderTr());

			DataUtil.loadJSON(JSON_FLUFF_URL).then((data) => {
				const baseFluff = data.background.find(it => (isStringMatch(it.name, bg.name) || isStringMatch(it.name, bg.ENG_name)) && it.source.toLowerCase() === bg.source.toLowerCase());
				if (bg.fluff && bg.fluff.entries) { // override; for homebrew usage only
					renderer.setFirstSection(true);
					$td.append(renderer.render({type: "section", entries: bg.fluff.entries}));
				} else if (baseFluff && baseFluff.entries) {
					renderer.setFirstSection(true);
					$td.append(renderer.render({type: "section", entries: baseFluff.entries}));
				} else {
					$td.empty();
					$td.append(HTML_NO_INFO);
				}
			});
		}
	);
	Renderer.utils.bindTabButtons(traitTab, infoTab);

	ListUtil.updateSelected();
}

function loadsub (sub) {
	filterBox.setFromSubHashes(sub);
	ListUtil.setFromSubHashes(sub);
}
