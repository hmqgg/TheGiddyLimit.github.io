"use strict";

const STR_REPRINTED = "reprinted";

window.onload = async function load () {
	await ExcludeUtil.pInitialise();
	SortUtil.initHandleFilterButtonClicks();
	DataUtil.deity.loadJSON().then(onJsonLoad);
};

let list;
const sourceFilter = getSourceFilter();
const pantheonFilter = new Filter({
	header: "Pantheon", headerName: "神系",
	items: [
		"Celtic", "Egyptian", "Greek", "Norse",
		"Forgotten Realms", "Faerûnian",
		"Dawn War",
		"Dragonlance",
		"Eberron",
		"Greyhawk",
		"Nonhuman",
		"Elven", "Drow", "Dwarven", "Duergar", "Gnomish", "Halfling", "Orc"
	],
	displayFn: Parser.PantheonToDisplay
});
const categoryFilter = new Filter({
	header: "Category",
	items: [
		STR_NONE,
		"The Sovereign Host",
		"The Dark Six",
		"Other Faiths of Eberron",
		"The Gods of Good",
		"The Gods of Neutrality",
		"The Gods of Evil"
	],
	displayFn: Parser.PantheonCategoryToDisplay
});

function unpackAlignment (g) {
	g.alignment.sort(SortUtil.alignmentSort);
	if (g.alignment.length === 2 && g.alignment.includes("N")) {
		const out = [...g.alignment];
		if (out[0] === "N") out[0] = "NX";
		else out[1] = "NY";
		return out;
	}
	return MiscUtil.copy(g.alignment);
}

let filterBox;
async function onJsonLoad (data) {
	list = ListUtil.search({
		valueNames: ["name", "pantheon", "alignment", "domains", "symbol", "source", "uniqueid", "eng_name"],
		listClass: "deities",
		sortFunction: SortUtil.listSort
	});

	const alignmentFilter = new Filter({
		header: "Alignment", headerName: "阵营",
		items: ["L", "NX", "C", "G", "NY", "E", "N"],
		displayFn: Parser.alignmentAbvToFull
	});
	const domainFilter = new Filter({
		header: "Domain", headerName: "领域",
		items: [STR_NONE, "Arcana", "Death", "Forge", "Grave", "Knowledge", "Life", "Light", "Nature", "Order", "Tempest", "Trickery", "War"],
		displayFn: Parser.SubclassToDisplay
	});
	const miscFilter = new Filter({
		header: "Miscellaneous", headerName: "杂项",
		items: [STR_REPRINTED],
		displayFn: StrUtil.uppercaseFirst,
		deselFn: (it) => { return it === STR_REPRINTED }
	});

	filterBox = await pInitFilterBox(sourceFilter, alignmentFilter, pantheonFilter, categoryFilter, domainFilter, miscFilter);

	list.on("updated", () => {
		filterBox.setCount(list.visibleItems.length, list.items.length);
	});
	// filtering function
	$(filterBox).on(
		FilterBox.EVNT_VALCHANGE,
		handleFilterChange
	);

	const subList = ListUtil.initSublist({
		valueNames: ["name", "pantheon", "alignment", "domains", "id"],
		listClass: "subdeities",
		getSublistRow: getSublistItem
	});
	ListUtil.initGenericPinnable();

	addDeities(data);
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
			ExcludeUtil.checkShowAllExcluded(deitiesList, $(`#pagecontent`));
		});
}

function handleBrew (homebrew) {
	addDeities(homebrew);
	return Promise.resolve();
}

let deitiesList = [];
let dtI = 0;
function addDeities (data) {
	if (!data.deity || !data.deity.length) return;

	deitiesList = deitiesList.concat(data.deity);

	let tempString = "";
	for (; dtI < deitiesList.length; dtI++) {
		const g = deitiesList[dtI];
		if (ExcludeUtil.isExcluded(g.name, "deity", g.source)) continue;
		const abvSource = Parser.sourceJsonToAbv(g.source);

		g._fAlign = unpackAlignment(g);
		if (!g.category) g.category = STR_NONE;
		if (!g.domains) g.domains = [STR_NONE];
		g.domains.sort(SortUtil.ascSort);

		g._fReprinted = g.reprinted ? STR_REPRINTED : "";

		tempString += `
			<li class="row" ${FLTR_ID}="${dtI}" onclick="ListUtil.toggleSelected(event, this)" oncontextmenu="ListUtil.openContextMenu(event, this)">
				<a id="${dtI}" href="#${UrlUtil.autoEncodeHash(g)}" title="${g.name}">
					<span class="name col-3">${g.name}</span>
					<span class="pantheon col-2 text-align-center">${Parser.PantheonToDisplay(g.pantheon)}</span>
					<span class="alignment col-2 text-align-center">${g.alignment.map(a => Parser.alignmentAbvToFull(a)).join("")}</span>
					<span class="domains col-3 ${g.domains[0] === STR_NONE ? `list-entry-none` : ""}">${g.domains.map(d => Parser.SubclassToDisplay(d)).join(", ")}</span>
					<span class="source col-2 text-align-center ${Parser.sourceJsonToColor(abvSource)}" title="${Parser.sourceJsonToFull(g.source)}">${abvSource}</span>
					
					<span class="uniqueid hidden">${g.uniqueId ? g.uniqueId : dtI}</span>
					<span class="eng_name hidden">${g.ENG_name ? g.ENG_name : g.name}</span>
				</a>
			</li>
		`;

		sourceFilter.addIfAbsent(g.source);
		pantheonFilter.addIfAbsent(g.pantheon);
		categoryFilter.addIfAbsent(g.category);
	}
	const lastSearch = ListUtil.getSearchTermAndReset(list);
	$(`#deitiesList`).append(tempString);
	// sort filters
	sourceFilter.items.sort(SortUtil.srcSort_ch);
	categoryFilter.items.sort();

	list.reIndex();
	if (lastSearch) list.search(lastSearch);
	list.sort("pantheon");
	filterBox.render();
	handleFilterChange();

	ListUtil.setOptions({
		itemList: deitiesList,
		getSublistRow: getSublistItem,
		primaryLists: [list]
	});
	ListUtil.bindPinButton();
	Renderer.hover.bindPopoutButton(deitiesList);
	UrlUtil.bindLinkExportButton(filterBox);
	ListUtil.bindDownloadButton();
	ListUtil.bindUploadButton();
}

function handleFilterChange () {
	const f = filterBox.getValues();
	list.filter(function (item) {
		const g = deitiesList[$(item.elm).attr(FLTR_ID)];
		return filterBox.toDisplay(
			f,
			g.source,
			g._fAlign,
			g.pantheon,
			g.category,
			g.domains,
			g._fReprinted
		);
	});
	FilterBox.nextIfHidden(deitiesList);
}

function getSublistItem (g, pinId) {
	return `
		<li class="row" ${FLTR_ID}="${pinId}" oncontextmenu="ListUtil.openSubContextMenu(event, this)">
			<a href="#${UrlUtil.autoEncodeHash(g)}" title="${g.name}">
				<span class="name col-4">${g.name}</span>
				<span class="pantheon col-2">${g.pantheon}</span>
				<span class="alignment col-2">${g.alignment.join("")}</span>
				<span class="domains col-4 ${g.domains[0] === STR_NONE ? `list-entry-none` : ""}">${g.domains.join(", ")}</span>
				<span class="id hidden">${pinId}</span>
			</a>
		</li>
	`;
}

const renderer = Renderer.get();
function loadhash (jsonIndex) {
	renderer.setFirstSection(true);
	const deity = deitiesList[jsonIndex];

	function getDeityBody (deity, reprintIndex) {
		const renderStack = [];
		if (deity.entries) renderer.recursiveRender({entries: deity.entries}, renderStack);
		return `
		${reprintIndex ? `
			<tr><td colspan="6">
			<i class="text-muted">
			${reprintIndex === 1 ? `这个神祇是再印版本。` : ""} 以下版本被印于较旧的出版品中 (${Parser.sourceJsonToFull(deity.source)}${deity.page ? `-第${deity.page}页` : ""}).
			</i>
			</td></tr>
		` : ""}

		${Renderer.deity.getOrderedParts(deity, `<tr><td colspan="6">`, `</td></tr>`)}
		
		${deity.symbolImg ? `<tr><td colspan="6">${renderer.render({entries: [deity.symbolImg]})}</td></tr>` : ""}
		${renderStack.length ? `<tr class="text"><td colspan="6">${renderStack.join("")}</td></tr>` : ""}
		`;
	}

	const $content = $(`#pagecontent`).empty();
	$content.append(`
		${Renderer.utils.getBorderTr()}
		${Renderer.utils.getNameTr(deity, false, "", deity.title ? `, ${deity.title.toTitleCase()}` : "")}
		${getDeityBody(deity)}
		${deity.reprinted ? `<tr class="text"><td colspan="6"><i class="text-muted">注记：这个神祇已在更新的出版品中被再印。</i></td></tr>` : ""}
		${Renderer.utils.getPageTr(deity)}
		${deity.previousVersions ? `
		${Renderer.utils.getDividerTr()}
		${deity.previousVersions.map((d, i) => getDeityBody(d, i + 1)).join(Renderer.utils.getDividerTr())}
		` : ""}
		${Renderer.utils.getBorderTr()}
	`);

	ListUtil.updateSelected();
}

function loadsub (sub) {
	filterBox.setFromSubHashes(sub);
	ListUtil.setFromSubHashes(sub);
}
