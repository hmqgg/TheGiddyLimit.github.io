"use strict";

const JSON_URL = "data/objects.json";

function imgError (x) {
	if (x) $(x).remove();
	$(`.rnd-name`).find(`span.stats-source`).css("margin-right", "0");
}

function handleStatblockScroll (event, ele) {
	$(`#token_image`)
		.toggle(ele.scrollTop < 32)
		.css({
			opacity: (32 - ele.scrollTop) / 32,
			top: -ele.scrollTop
		})
}

window.onload = async function load () {
	await ExcludeUtil.pInitialise();
	SortUtil.initHandleFilterButtonClicks();
	DataUtil.loadJSON(JSON_URL).then(onJsonLoad);
};

let list;
function onJsonLoad (data) {
	list = ListUtil.search({
		valueNames: ["name", "size", "source", "uniqueid", "eng_name"],
		listClass: "objects",
		sortFunction: SortUtil.listSort
	});

	Renderer.hover.bindPopoutButton(objectsList);

	const subList = ListUtil.initSublist({
		valueNames: ["name", "size", "id"],
		listClass: "subobjects",
		itemList: objectsList,
		getSublistRow: getSublistItem,
		primaryLists: [list]
	});
	ListUtil.initGenericPinnable();

	addObjects(data);
	BrewUtil.pAddBrewData()
		.then(handleBrew)
		.then(() => BrewUtil.bind({list}))
		.then(() => BrewUtil.pAddLocalBrewData())
		.catch(BrewUtil.pPurgeBrew)
		.then(async () => {
			BrewUtil.makeBrewButton("manage-brew");
			BrewUtil.bind({list});
			await ListUtil.pLoadState();
			ListUtil.addListShowHide();

			History.init(true);
			ExcludeUtil.checkShowAllExcluded(objectsList, $(`#pagecontent`));
		});
}

function handleBrew (homebrew) {
	addObjects(homebrew);
	return Promise.resolve();
}

let objectsList = [];
let obI = 0;
function addObjects (data) {
	if (!data.object || !data.object.length) return;

	objectsList = objectsList.concat(data.object);

	let tempString = "";
	for (; obI < objectsList.length; obI++) {
		const obj = objectsList[obI];
		if (ExcludeUtil.isExcluded(obj.name, "object", obj.source)) continue;
		const abvSource = Parser.sourceJsonToAbv(obj.source);

		tempString += `
			<li class="row" ${FLTR_ID}="${obI}" onclick="ListUtil.toggleSelected(event, this)" oncontextmenu="ListUtil.openContextMenu(event, this)">
				<a id="${obI}" href="#${UrlUtil.autoEncodeHash(obj)}" title="${obj.name}">
					<span class="name col-8">${obj.name}</span>
					<span class="size col-2">${Parser.sizeAbvToFull(obj.size)}</span>
					<span class="source col-2 text-align-center ${Parser.sourceJsonToColor(obj.source)}" title="${Parser.sourceJsonToFull(obj.source)}">${abvSource}</span>

					<span class="uniqueid hidden">${obj.uniqueId ? obj.uniqueId : obI}</span>
					<span class="eng_name hidden">${obj.ENG_name ? obj.ENG_name : obj.name}</span>
				</a>
			</li>
		`;
	}
	const lastSearch = ListUtil.getSearchTermAndReset(list);
	$(`#objectsList`).append(tempString);

	list.reIndex();
	if (lastSearch) list.search(lastSearch);
	list.sort("size");

	ListUtil.setOptions({
		itemList: objectsList,
		getSublistRow: getSublistItem,
		primaryLists: [list]
	});
	ListUtil.bindPinButton();
	Renderer.hover.bindPopoutButton(objectsList);
	ListUtil.bindDownloadButton();
	ListUtil.bindUploadButton();
}

function getSublistItem (obj, pinId) {
	return `
		<li class="row" ${FLTR_ID}="${pinId}" oncontextmenu="ListUtil.openSubContextMenu(event, this)">
			<a href="#${UrlUtil.autoEncodeHash(obj)}" title="${obj.name}">
				<span class="name col-9">${obj.name}</span>
				<span class="ability col-3">${Parser.sizeAbvToFull(obj.size)}</span>
				<span class="id hidden">${pinId}</span>
			</a>
		</li>
	`;
}

const renderer = Renderer.get();
function loadhash (jsonIndex) {
	renderer.setFirstSection(true);

	const obj = objectsList[jsonIndex];

	const renderStack = [];

	if (obj.entries) renderer.recursiveRender({entries: obj.entries}, renderStack, {depth: 2});
	if (obj.actionEntries) renderer.recursiveRender({entries: obj.actionEntries}, renderStack, {depth: 2});

	const $content = $(`#pagecontent`).empty();

	console.log(obj);
	$content.append(`
		${Renderer.utils.getBorderTr()}
		${Renderer.utils.getNameTr(obj)}
		<tr class="text"><td colspan="6"><i>${obj.type !== "GEN" ? `${Parser.sizeAbvToFull(obj.size)} 物体` : `可变尺寸 物体`}</i><br></td></tr>
		<tr class="text"><td colspan="6">
			<b>护甲等级：</b> ${obj.ac}<br>
			<b>生命值：</b> ${obj.hp}<br>
			<b>伤害免疫：</b> ${obj.immune=="Varies (see below)"?"可变(见下)":Parser.monImmResToFull(obj.immune.split(", "))}<br>
			${obj.resist ? `<b>伤害抗性：</b> ${Parser.monImmResToFull(obj.resist.split(", "))}<br>` : ""}
			${obj.vulnerable ? `<b>伤害易伤：</b> ${Parser.monImmResToFull(obj.vulnerable.split(", "))}<br>` : ""}
		</td></tr>
		<tr class="text"><td colspan="6">${renderStack.join("")}</td></tr>
		${Renderer.utils.getPageTr(obj)}
		${Renderer.utils.getBorderTr()}
	`);

	const $floatToken = $(`#float-token`).empty();
	if (obj.tokenUrl || !obj.uniqueId) {
		const imgLink = obj.tokenUrl || UrlUtil.link(`img/objects/${obj.ENG_name.replace(/"/g, "")}.png`);
		$floatToken.append(`
			<a href="${imgLink}" target="_blank" rel="noopener">
				<img src="${imgLink}" id="token_image" class="token" onerror="imgError(this)" alt="${obj.name}">
			</a>`
		);
	} else imgError();

	ListUtil.updateSelected();
}
