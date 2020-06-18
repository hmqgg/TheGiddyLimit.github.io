"use strict";

class NavBar {
	static init () {
		// render the visible elements ASAP
		window.addEventListener(
			"DOMContentLoaded",
			function () {
				NavBar.initElements();
				NavBar.highlightCurrentPage();
			}
		);
		window.addEventListener("load", NavBar.initHandlers);
	}

	static initElements () {
		const navBar = document.getElementById("navbar");

		addLi(navBar, "5etools.html", "首页");

		const ulRules = addDropdown(navBar, "规则");
		addLi(ulRules, "quickreference.html", "快速参照");
		addLi(ulRules, "variantrules.html", "变体&选用规则/杂项");
		addLi(ulRules, "tables.html", "表格");
		addDivider(ulRules);
		addLi(ulRules, "book.html", "地下城主指南", false, "DMG");
		addLi(ulRules, "book.html", "怪物图鉴", false, "MM");
		addLi(ulRules, "book.html", "玩家手册", false, "PHB");
		addDivider(ulRules);
		addLi(ulRules, "book.html", "拉尼卡的公会长指南", false, "GGR");
		addLi(ulRules, "book.html", "魔邓肯的众敌卷册", false, "MTF");
		addLi(ulRules, "book.html", "剑湾冒险指南", false, "SCAG");
		addLi(ulRules, "book.html", "瓦罗的怪物指南", false, "VGM");
		addLi(ulRules, "book.html", "姗纳萨的万事指南", false, "XGE");
		addDivider(ulRules);
		addLi(ulRules, "book.html", "冒险者联盟", false, "AL");
		addDivider(ulRules);
		addLi(ulRules, "books.html", "查看所有/自制内容");

		const ulPlayers = addDropdown(navBar, "玩家选项");
		addLi(ulPlayers, "races.html", "种族");
		addLi(ulPlayers, "classes.html", "职业");
		addLi(ulPlayers, "optionalfeatures.html", "职业能力选项");
		addLi(ulPlayers, "backgrounds.html", "背景");
		addLi(ulPlayers, "feats.html", "专长");
		addDivider(ulPlayers);
		addLi(ulPlayers, "statgen.html", "属性生成器");
		addDivider(ulPlayers);
		addLi(ulPlayers, "lifegen.html", "这是你的人生");
		addLi(ulPlayers, "names.html", "名称");

		const ulDms = addDropdown(navBar, "DM工具");
		addLi(ulDms, "dmscreen.html", "DM屏幕");
		addDivider(ulDms);
		const ulAdventures = addDropdown(ulDms, "冒险模组", true);
		addLi(ulAdventures, "adventure.html", "Lost Mines of Phandelver", true, "LMoP");
		addLi(ulAdventures, "adventure.html", "Hoard of the Dragon Queen", true, "HotDQ");
		addLi(ulAdventures, "adventure.html", "Rise of Tiamat", true, "RoT");
		addLi(ulAdventures, "adventure.html", "Princes of the Apocalypse", true, "PotA");
		addLi(ulAdventures, "adventure.html", "Out of the Abyss", true, "OotA");
		addLi(ulAdventures, "adventure.html", "Curse of Strahd", true, "CoS");
		addLi(ulAdventures, "adventure.html", "Storm King's Thunder", true, "SKT");
		addLi(ulAdventures, "adventure.html", "Tales from the Yawning Portal: The Sunless Citadel", true, "TftYP-TSC");
		addLi(ulAdventures, "adventure.html", "Tales from the Yawning Portal: The Forge of Fury", true, "TftYP-TFoF");
		addLi(ulAdventures, "adventure.html", "Tales from the Yawning Portal: The Hidden Shrine of Tamoachan", true, "TftYP-THSoT");
		addLi(ulAdventures, "adventure.html", "Tales from the Yawning Portal: White Plume Mountain", true, "TftYP-WPM");
		addLi(ulAdventures, "adventure.html", "Tales from the Yawning Portal: Dead in Thay", true, "TftYP-DiT");
		addLi(ulAdventures, "adventure.html", "Tales from the Yawning Portal: Against the Giants", true, "TftYP-AtG");
		addLi(ulAdventures, "adventure.html", "Tales from the Yawning Portal: Tomb of Horrors", true, "TftYP-ToH");
		addLi(ulAdventures, "adventure.html", "Tomb of Annihilation", true, "ToA");
		addLi(ulAdventures, "adventure.html", "The Tortle Package", true, "TTP");
		addLi(ulAdventures, "adventure.html", "Waterdeep: Dragon Heist", true, "WDH");
		addLi(ulAdventures, "adventure.html", "Lost Laboratory of Kwalish", true, "LLK");
		addLi(ulAdventures, "adventure.html", "Waterdeep: Dungeon of the Mad Mage", true, "WDMM");
		addLi(ulAdventures, "adventure.html", "Krenko's Way", true, "KKW");
		addDivider(ulAdventures);
		addLi(ulAdventures, "adventures.html", "查看所有/自制内容");
		addLi(ulDms, "cultsboons.html", "异教&恶魔恩惠");
		addLi(ulDms, "objects.html", "物件");
		addLi(ulDms, "ships.html", "船只");
		addLi(ulDms, "trapshazards.html", "陷阱&危险");
		addDivider(ulDms);
		addLi(ulDms, "crcalculator.html", "CR计算机");
		addLi(ulDms, "encountergen.html", "遭遇生成器");
		addLi(ulDms, "lootgen.html", "战利品生成器");

		const ulReferences = addDropdown(navBar, "参照资料");
		addLi(ulReferences, "bestiary.html", "怪物图鉴");
		addLi(ulReferences, "conditionsdiseases.html", "状态 & 疾病");
		addLi(ulReferences, "deities.html", "神祇");
		addLi(ulReferences, "items.html", "物品");
		addLi(ulReferences, "rewards.html", "其他奖励");
		addLi(ulReferences, "psionics.html", "灵能");
		addLi(ulReferences, "spells.html", "法术");

		const ulUtils = addDropdown(navBar, "其他功能");
		addLi(ulUtils, "blacklist.html", "内容黑名单");
		addLi(ulUtils, "inittrackerplayerview.html", "先攻追踪器:玩家检视");
		addLi(ulUtils, "managebrew.html", "管理所有自制内容");
		addDivider(ulUtils);
		addLi(ulUtils, "makebrew.html", "自制内容生成器");
		addLi(ulUtils, "demo.html", "渲染器 Demo");
		addLi(ulUtils, "converter.html", "文字转换器");
		addDivider(ulUtils);
		addLi(ulUtils, "roll20.html", "Roll20脚本小帮手");
		addLi(ulUtils, "makeshaped.html", "Roll20 Shaped Sheet JS Builder");

		// addLi(navBar, "donate.html", "捐献");

		const ulSettings = addDropdown(navBar, "设置");
		addButton(
			ulSettings,
			{
				html: styleSwitcher.getActiveStyleSheet() === StyleSwitcher.STYLE_DAY ? "夜晚模式" : "白昼模式",
				click: (evt) => {
					evt.preventDefault();
					styleSwitcher.toggleActiveStyleSheet();
				},
				className: "nightModeToggle"
			}
		);
		addButton(
			ulSettings,
			{
				html: "储存状态至档案",
				click: async (evt) => {
					evt.preventDefault();
					const sync = StorageUtil.syncGetDump();
					const async = await StorageUtil.pGetDump();
					const dump = {sync, async};
					DataUtil.userDownload("5etools", dump);
				},
				title: "Save any locally-stored data (loaded homebrew, active blacklists, DM Screen configuration,...) to a file."
			}
		);
		addButton(
			ulSettings,
			{
				html: "从档案读取状态",
				click: async (evt) => {
					evt.preventDefault();
					const dump = await DataUtil.pUserUpload();

					StorageUtil.syncSetFromDump(dump.sync);
					await StorageUtil.pSetFromDump(dump.async);
					location.reload();
				},
				title: "Load previously-saved data (loaded homebrew, active blacklists, DM Screen configuration,...) from a file."
			}
		);

		/**
		 * Adds a new item to the navigation bar. Can be used either in root, or in a different UL.
		 * @param appendTo - Element to append this link to.
		 * @param aHref - Where does this link to.
		 * @param aText - What text does this link have.
		 * @param [isSide] - True if this item
		 * @param [aHash] - Optional hash to be appended to the base href
		 */
		function addLi (appendTo, aHref, aText, isSide, aHash) {
			const hashPart = aHash ? `#${aHash}`.toLowerCase() : "";

			const li = document.createElement("li");
			li.setAttribute("role", "presentation");
			li.setAttribute("id", aText.toLowerCase().replace(/\s+/g, ""));
			li.setAttribute("data-page", `${aHref}${hashPart}`);
			if (isSide) {
				li.onmouseenter = function () { NavBar.handleSideItemMouseEnter(this) }
			} else {
				li.onmouseenter = function () { NavBar.handleItemMouseEnter(this) };
				li.onclick = function () { NavBar._dropdowns.forEach(ele => ele.classList.remove("open")) }
			}

			const a = document.createElement("a");
			a.href = `${aHref}${hashPart}`;
			a.innerHTML = aText;

			li.appendChild(a);
			appendTo.appendChild(li);
		}

		function addDivider (appendTo) {
			const li = document.createElement("li");
			li.setAttribute("role", "presentation");
			li.className = "divider";

			appendTo.appendChild(li);
		}

		/**
		 * Adds a new dropdown starting list to the navigation bar
		 * @param {String} appendTo - Element to append this link to.
		 * @param {String} text - Dropdown text.
		 * @param {boolean} [isSide=false] - If this is a sideways dropdown.
		 */
		function addDropdown (appendTo, text, isSide = false) {
			const li = document.createElement("li");
			li.setAttribute("role", "presentation");
			li.className = "dropdown dropdown--navbar";
			if (isSide) {
				li.onmouseenter = function () { NavBar.handleSideItemMouseEnter(this); };
			} else {
				li.onmouseenter = function () { NavBar.handleItemMouseEnter(this); };
			}

			const a = document.createElement("a");
			a.className = "dropdown-toggle";
			a.href = "#";
			a.setAttribute("role", "button");
			a.onclick = function (event) { NavBar.handleDropdownClick(this, event, isSide); };
			if (isSide) {
				a.onmouseenter = function () { NavBar.handleSideDropdownMouseEnter(this); };
				a.onmouseleave = function () { NavBar.handleSideDropdownMouseLeave(this); };
			}
			a.innerHTML = `${text} <span class="caret ${isSide ? "caret--right" : ""}"></span>`;

			const ul = document.createElement("li");
			ul.className = `dropdown-menu ${isSide ? "dropdown-menu--side" : ""}`;
			ul.onclick = function (event) { event.stopPropagation(); };

			li.appendChild(a);
			li.appendChild(ul);
			appendTo.appendChild(li);
			return ul;
		}

		/**
		 * Special LI for buttong
		 * @param appendTo The element to append to.
		 * @param options Options.
		 * @param options.html Button text.
		 * @param options.click Button click handler.
		 * @param options.title Button title.
		 * @param options.className Additional button classes.
		 */
		function addButton (appendTo, options) {
			const li = document.createElement("li");
			li.setAttribute("role", "presentation");

			const a = document.createElement("a");
			a.href = "#";
			if (options.className) a.className = options.className;
			a.onclick = options.click;
			a.innerHTML = options.html;

			if (options.title) li.setAttribute("title", options.title);

			li.appendChild(a);
			appendTo.appendChild(li);
		}
	}

	static highlightCurrentPage () {
		let currentPage = window.location.pathname;
		currentPage = currentPage.substr(currentPage.lastIndexOf("/") + 1);

		if (!currentPage) currentPage = "5etools.html";

		let isSecondLevel = false;
		if (currentPage.toLowerCase() === "book.html" || currentPage.toLowerCase() === "adventure.html") {
			const hashPart = window.location.hash.split(",")[0];
			if (currentPage.toLowerCase() === "adventure.html") isSecondLevel = true;
			currentPage += hashPart.toLowerCase();
		}
		if (currentPage.toLowerCase() === "adventures.html") isSecondLevel = true;

		try {
			let current = document.querySelector(`li[data-page="${currentPage}"]`);
			if (current == null) {
				currentPage = currentPage.split("#")[0];
				if (NavBar.ALT_CHILD_PAGES[currentPage]) currentPage = NavBar.ALT_CHILD_PAGES[currentPage];
				current = document.querySelector(`li[data-page="${currentPage}"]`);
			}
			current.parentNode.childNodes.forEach(n => n.classList && n.classList.remove("active"));
			current.classList.add("active");

			let closestLi = current.parentNode;
			const setNearestParentActive = () => {
				while (closestLi !== null && (closestLi.nodeName !== "LI" || !closestLi.classList.contains("dropdown"))) closestLi = closestLi.parentNode;
				closestLi && closestLi.classList.add("active");
			};
			setNearestParentActive();
			if (isSecondLevel) {
				closestLi = closestLi.parentNode;
				setNearestParentActive();
			}
		} catch (ignored) { setTimeout(() => { throw ignored }); }
	}

	static initHandlers () {
		NavBar._dropdowns = [...document.getElementById("navbar").querySelectorAll(`li.dropdown--navbar`)];
		document.addEventListener("click", () => NavBar._dropdowns.forEach(ele => ele.classList.remove("open")));
		document.addEventListener("mousemove", evt => {
			NavBar._mouseX = evt.clientX;
			NavBar._mouseY = evt.clientY;
		});

		NavBar._clearAllTimers();
	}

	static handleDropdownClick (ele, event, isSide) {
		event.preventDefault();
		event.stopPropagation();
		if (isSide) return;
		NavBar._openDropdown(ele);
	}

	static _openDropdown (fromLink) {
		const noRemove = new Set();
		let parent = fromLink.parentNode;
		parent.classList.add("open");
		noRemove.add(parent);

		while (parent.nodeName !== "NAV") {
			parent = parent.parentNode;
			if (parent.nodeName === "LI") {
				parent.classList.add("open");
				noRemove.add(parent);
			}
		}

		NavBar._dropdowns.filter(ele => !noRemove.has(ele)).forEach(ele => ele.classList.remove("open"));
	}

	static handleItemMouseEnter (ele) {
		const $ele = $(ele);
		const timerIds = $ele.siblings("[data-timer-id]").map((i, e) => ({$ele: $(e), timerId: $(e).data("timer-id")})).get();
		timerIds.forEach(({$ele, timerId}) => {
			if (NavBar._timersOpen[timerId]) {
				clearTimeout(NavBar._timersOpen[timerId]);
				delete NavBar._timersOpen[timerId];
			}

			if (!NavBar._timersClose[timerId] && $ele.hasClass("open")) {
				const getTimeoutFn = () => {
					if (NavBar._timerMousePos[timerId]) {
						const [xStart, yStart] = NavBar._timerMousePos[timerId];
						// for generalised use, this should be made check against the bounding box for the side menu
						// and possibly also check Y pos; e.g.
						// || NavBar._mouseY > yStart + NavBar.MIN_MOVE_PX
						if (NavBar._mouseX > xStart + NavBar.MIN_MOVE_PX) {
							NavBar._timerMousePos[timerId] = [NavBar._mouseX, NavBar._mouseY];
							NavBar._timersClose[timerId] = setTimeout(() => getTimeoutFn(), NavBar.DROP_TIME / 2);
						} else {
							$ele.removeClass("open");
							delete NavBar._timersClose[timerId];
						}
					} else {
						$ele.removeClass("open");
						delete NavBar._timersClose[timerId];
					}
				};

				NavBar._timersClose[timerId] = setTimeout(() => getTimeoutFn(), NavBar.DROP_TIME);
			}
		});
	}

	static handleSideItemMouseEnter (ele) {
		const timerId = $(ele).closest(`li.dropdown`).data("timer-id");
		if (NavBar._timersClose[timerId]) {
			clearTimeout(NavBar._timersClose[timerId]);
			delete NavBar._timersClose[timerId];
			delete NavBar._timerMousePos[timerId];
		}
	}

	static handleSideDropdownMouseEnter (ele) {
		const $ele = $(ele);
		const timerId = $ele.parent().data("timer-id") || NavBar._timerId++;
		$ele.parent().attr("data-timer-id", timerId);

		if (NavBar._timersClose[timerId]) {
			clearTimeout(NavBar._timersClose[timerId]);
			delete NavBar._timersClose[timerId];
		}

		if (!NavBar._timersOpen[timerId]) {
			NavBar._timersOpen[timerId] = setTimeout(() => {
				NavBar._openDropdown(ele);
				delete NavBar._timersOpen[timerId];
				NavBar._timerMousePos[timerId] = [NavBar._mouseX, NavBar._mouseY];
			}, NavBar.DROP_TIME);
		}
	}

	static handleSideDropdownMouseLeave (ele) {
		const $ele = $(ele);
		if (!$ele.parent().data("timer-id")) return;
		const timerId = $ele.parent().data("timer-id");
		clearTimeout(NavBar._timersOpen[timerId]);
		delete NavBar._timersOpen[timerId];
	}

	static _clearAllTimers () {
		Object.entries(NavBar._timersOpen).forEach(([k, v]) => {
			clearTimeout(v);
			delete NavBar._timersOpen[k];
		});
	}
}
NavBar.DROP_TIME = 250;
NavBar.MIN_MOVE_PX = 7;
NavBar.ALT_CHILD_PAGES = {
	"book.html": "books.html",
	"adventure.html": "adventures.html"
};
NavBar._timerId = 1;
NavBar._timersOpen = {};
NavBar._timersClose = {};
NavBar._timerMousePos = {};
NavBar._mouseX = null;
NavBar._mouseY = null;
NavBar.init();
