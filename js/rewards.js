"use strict";

const JSON_URL = "data/rewards.json";

window.onload = async function load () {
	await ExcludeUtil.pInitialise();
	SortUtil.initHandleFilterButtonClicks();
	DataUtil.loadJSON(JSON_URL).then(onJsonLoad);
};

let list;
const displayRewardType = function(item){
	switch(item){
		case "Blessing": return "祝福";
		case "Boon": return "恩惠";
		case "Charm": return "护咒";
		default: return item; 
	};
}
const sourceFilter = getSourceFilter();
const typeFilter = new Filter({
	header: "Type", headerName: "类型",
	items: [
		"Blessing",
		"Boon",
		"Charm"
	],
	displayFn: displayRewardType
});
let filterBox;
async function onJsonLoad (data) {
	filterBox = await pInitFilterBox(sourceFilter, typeFilter);

	list = ListUtil.search({
		valueNames: ["name", "type", "source", "uniqueid", "eng_name"],
		listClass: "rewards"
	});
	list.on("updated", () => {
		filterBox.setCount(list.visibleItems.length, list.items.length);
	});

	// filtering function
	$(filterBox).on(
		FilterBox.EVNT_VALCHANGE,
		handleFilterChange
	);

	const subList = ListUtil.initSublist({
		valueNames: ["name", "id"],
		listClass: "subrewards",
		getSublistRow: getSublistItem
	});

	addRewards(data);
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
			ExcludeUtil.checkShowAllExcluded(rewardList, $(`#pagecontent`));
		});
}

function handleBrew (homebrew) {
	addRewards(homebrew);
	return Promise.resolve();
}

let rewardList = [];
let rwI = 0;
function addRewards (data) {
	if (!data.reward || !data.reward.length) return;

	rewardList = rewardList.concat(data.reward);

	let tempString = "";
	for (; rwI < rewardList.length; rwI++) {
		const reward = rewardList[rwI];
		if (ExcludeUtil.isExcluded(reward.name, "reward", reward.source)) continue;

		tempString += `
			<li class='row' ${FLTR_ID}='${rwI}' onclick="ListUtil.toggleSelected(event, this)" oncontextmenu="ListUtil.openContextMenu(event, this)">
				<a id='${rwI}' href="#${UrlUtil.autoEncodeHash(reward)}" title="${reward.name}">
					<span class='name col-9'>${reward.name}</span>
					<span class='type col-1'>${displayRewardType(reward.type)}</span>
					<span class='source col-2 text-align-center ${Parser.sourceJsonToColor(reward.source)}' title="${Parser.sourceJsonToFull(reward.source)}">${Parser.sourceJsonToAbv(reward.source)}</span>
					
					<span class="uniqueid hidden">${reward.uniqueId ? reward.uniqueId : rwI}</span>
					<span class="eng_name hidden">${reward.ENG_name ? reward.ENG_name : reward.name}</span>
				</a>
			</li>`;

		// populate filters
		sourceFilter.addIfAbsent(reward.source);
		typeFilter.addIfAbsent(reward.type);
	}
	const lastSearch = ListUtil.getSearchTermAndReset(list);
	$("ul.rewards").append(tempString);

	// sort filters
	sourceFilter.items.sort(SortUtil.srcSort_ch);
	typeFilter.items.sort(SortUtil.ascSort);

	list.reIndex();
	if (lastSearch) list.search(lastSearch);
	list.sort("type");
	filterBox.render();
	handleFilterChange();

	ListUtil.setOptions({
		itemList: rewardList,
		getSublistRow: getSublistItem,
		primaryLists: [list]
	});
	ListUtil.bindPinButton();
	Renderer.hover.bindPopoutButton(rewardList);
	UrlUtil.bindLinkExportButton(filterBox);
	ListUtil.bindDownloadButton();
	ListUtil.bindUploadButton();
}

function handleFilterChange () {
	const f = filterBox.getValues();
	list.filter(function (item) {
		const r = rewardList[$(item.elm).attr(FLTR_ID)];
		return filterBox.toDisplay(
			f,
			r.source,
			r.type
		);
	});
	FilterBox.nextIfHidden(rewardList);
}

function getSublistItem (reward, pinId) {
	return `
		<li class="row" ${FLTR_ID}="${pinId}" oncontextmenu="ListUtil.openSubContextMenu(event, this)">
			<a href="#${UrlUtil.autoEncodeHash(reward)}" title="${reward.name}">
				<span class="name col-12">${reward.name}</span>
				<span class="id hidden">${pinId}</span>
			</a>
		</li>
	`;
}

function loadhash (id) {
	Renderer.get().setFirstSection(true);
	const $content = $("#pagecontent").empty();
	const reward = rewardList[id];

	$content.append(`
		${Renderer.utils.getBorderTr()}
		${Renderer.utils.getNameTr(reward)}
		<tr id="text"><td class="divider" colspan="6"><div></div></td></tr>
		${Renderer.reward.getRenderedString(reward)}
		${Renderer.utils.getPageTr(reward)}
		${Renderer.utils.getBorderTr()}
	`);

	ListUtil.updateSelected();
}

function loadsub (sub) {
	filterBox.setFromSubHashes(sub);
	ListUtil.setFromSubHashes(sub);
}
