class RenderBestiary {
	static _getRenderedSection (sectionTrClass, sectionEntries, sectionLevel) {
		const renderer = Renderer.get();
		const renderStack = [];
		if (sectionTrClass === "legendary") {
			const cpy = MiscUtil.copy(sectionEntries).map(it => {
				if (it.name && it.entries) {
					it.name = `${it.name}.`;
					it.type = it.type || "item";
				}
				return it;
			});
			const toRender = {type: "list", style: "list-hang-notitle", items: cpy};
			renderer.recursiveRender(toRender, renderStack, {depth: sectionLevel});
		} else {
			sectionEntries.forEach(e => {
				if (e.rendered) renderStack.push(e.rendered);
				else renderer.recursiveRender(e, renderStack, {depth: sectionLevel + 1});
			});
		}
		return `<tr class='${sectionTrClass}'><td colspan='6' class="mon__sect-row-inner">${renderStack.join("")}</td></tr>`;
	}

	static _getPronunciationButton (mon) {
		const basename = mon.soundClip.substr(mon.soundClip.lastIndexOf("/") + 1);

		return `<button class="btn btn-xs btn-default btn-name-pronounce">
			<span class="glyphicon glyphicon-volume-up name-pronounce-icon"></span>
			<audio class="name-pronounce">
			   <source src="${mon.soundClip}" type="audio/mpeg">
			   <source src="audio/bestiary/${basename}" type="audio/mpeg">
			</audio>
		</button>`;
	}

	static updateParsed (mon) {
		delete mon._pTypes;
		delete mon._pCr;
		RenderBestiary.initParsed(mon);
	}

	static initParsed (mon) {
		mon._pTypes = mon._pTypes || Parser.monTypeToFullObj(mon.type); // store the parsed type
		mon._pCr = mon._pCr || (mon.cr === undefined || mon.cr === "Unknown" ? "不明" : (mon.cr.cr || mon.cr));
	}

	/**
	 * @param {Object} mon Creature data.
	 * @param {Object} meta Legendary metadata.
	 * @param {Object} options
	 * @param {jQuery} options.$btnScaleCr CR scaler button.
	 * @param {jQuery} options.$btnResetScaleCr CR scaler reset button.
	 */
	static $getRenderedCreature (mon, meta, options) {
		options = options || {};
		const renderer = Renderer.get();
		RenderBestiary.initParsed(mon);

		const trait = Renderer.monster.getOrderedTraits(mon, renderer);
		const legGroup = mon.legendaryGroup ? (meta[mon.legendaryGroup.source] || {})[mon.legendaryGroup.name] : null;

		const renderedVariants = (() => {
			const dragonVariant = Renderer.monster.getDragonCasterVariant(renderer, mon);
			const variants = mon.variant;
			if (!variants && !dragonVariant) return null;
			else {
				const rStack = [];
				(variants || []).forEach(v => renderer.recursiveRender(v, rStack));
				if (dragonVariant) rStack.push(dragonVariant);
				return `<td colspan=6>${rStack.join("")}</td>`;
			}
		})();

		const renderedSources = (() => {
			const srcCpy = {
				source: mon.source,
				sourceSub: mon.sourceSub,
				page: mon.page,
				otherSources: mon.otherSources,
				additionalSources: mon.additionalSources,
				externalSources: mon.externalSources
			};
			const additional = mon.additionalSources ? JSON.parse(JSON.stringify(mon.additionalSources)) : [];
			if (mon.variant && mon.variant.length > 1) {
				mon.variant.forEach(v => {
					if (v.variantSource) {
						additional.push({
							source: v.variantSource.source,
							page: v.variantSource.page
						})
					}
				})
			}
			srcCpy.additionalSources = additional;

			const pageTrInner = Renderer.utils._getPageTrText(srcCpy);
			if (mon.environment && mon.environment.length) {
				return [pageTrInner, `<i>环境： ${mon.environment.sort(SortUtil.ascSortLower).map(it => Parser.EnvironmentToDisplay(it)).join(", ")}</i>`];
			} else {
				return [pageTrInner];
			}
		})();

		return $$`
		${Renderer.utils.getBorderTr()}
		<tr><th class="name mon__name--token" colspan="6">
			<span><b class="stats-name copyable" onclick="Renderer.utils._pHandleNameClick(this, '${mon.source.escapeQuotes()}')">${mon._displayName || mon.name}</b>${mon.ENG_name ? (" <st style='font-size:80%;'>"+mon.ENG_name+"<st>") : ""}</span>
			${mon.soundClip ? RenderBestiary._getPronunciationButton(mon) : ""}
			<span class="stats-source ${Parser.sourceJsonToColor(mon.source)}" title="${Parser.sourceJsonToFull(mon.source)}${Renderer.utils.getSourceSubText(mon)}">${Parser.sourceJsonToAbv(mon.source)}</span>
		</th></tr>
		<tr><td colspan="6">
			<div class="mon__wrp-size-type-align"><i>${Parser.sizeAbvToFull(mon.size)} ${mon._pTypes.asText}, ${Parser.alignmentListToFull(mon.alignment).toLowerCase()}</i></div>
		</td></tr>
		<tr><td class="divider" colspan="6"><div></div></td></tr>
		
		<tr><td colspan="6"><strong>护甲等级：</strong> ${Parser.acToFull(mon.ac)}</td></tr>
		<tr><td colspan="6"><div class="mon__wrp-hp"><strong>生命值：</strong> ${Renderer.monster.getRenderedHp(mon.hp)}</div></td></tr>
		<tr><td colspan="6"><strong>速度：</strong> ${Parser.getSpeedString(mon)}</td></tr>
		<tr><td class="divider" colspan="6"><div></div></td></tr>
		
		<tr class="mon__ability-names">
			<th>力量</th><th>敏捷</th><th>体质</th><th>智力</th><th>睿知</th><th>魅力</th>
		</tr>
		<tr class="mon__ability-scores">
			<td>${Renderer.get().render(`{@d20 ${Parser.getAbilityModifier(mon.str)}|${mon.str} (${Parser.getAbilityModifier(mon.str)})|力量}`)}</td>
			<td>${Renderer.get().render(`{@d20 ${Parser.getAbilityModifier(mon.dex)}|${mon.dex} (${Parser.getAbilityModifier(mon.dex)})|敏捷}`)}</td>
			<td>${Renderer.get().render(`{@d20 ${Parser.getAbilityModifier(mon.con)}|${mon.con} (${Parser.getAbilityModifier(mon.con)})|体质}`)}</td>
			<td>${Renderer.get().render(`{@d20 ${Parser.getAbilityModifier(mon.int)}|${mon.int} (${Parser.getAbilityModifier(mon.int)})|智力}`)}</td>
			<td>${Renderer.get().render(`{@d20 ${Parser.getAbilityModifier(mon.wis)}|${mon.wis} (${Parser.getAbilityModifier(mon.wis)})|睿知}`)}</td>
			<td>${Renderer.get().render(`{@d20 ${Parser.getAbilityModifier(mon.cha)}|${mon.cha} (${Parser.getAbilityModifier(mon.cha)})|魅力}`)}</td>
		</tr>
		<tr><td class="divider" colspan="6"><div></div></td></tr>
		
		${mon.save ? `<tr><td colspan="6"><strong>豁免：</strong> ${Object.keys(mon.save).map(it => Renderer.monster.getSave(renderer, it, mon.save[it])).join(", ")}</td></tr>` : ""}
		${mon.skill ? `<tr><td colspan="6"><strong>技能：</strong> ${Renderer.monster.getSkillsString(renderer, mon)}</td></tr>` : ""}
		${mon.vulnerable ? `<tr><td colspan="6"><strong>伤害易伤：</strong> ${Parser.monImmResToFull(mon.vulnerable)}</td></tr>` : ""}
		${mon.resist ? `<tr><td colspan="6"><strong>伤害抗性：</strong> ${Parser.monImmResToFull(mon.resist)}</td></tr>` : ""}
		${mon.immune ? `<tr><td colspan="6"><strong>伤害免疫：</strong> ${Parser.monImmResToFull(mon.immune)}</td></tr>` : ""}
		${mon.conditionImmune ? `<tr><td colspan="6"><strong>状态免疫：</strong> ${Parser.monCondImmToFull(mon.conditionImmune)}</td></tr>` : ""}
		<tr><td colspan="6"><strong>感官：</strong> ${mon.senses ? `${Renderer.monster.getRenderedSenses(mon.senses)},` : ""} 被动感知 ${mon.passive || "\u2014"}</td></tr>
		<tr><td colspan="6"><strong>语言：</strong> ${mon.languages || "\u2014"}</td></tr>
		
		<tr><td colspan="6" style="position: relative;"><strong>挑战等级：</strong>
			<span>${Parser.monCrToFull(mon.cr)}</span>
			${options.$btnScaleCr || ""}
			${options.$btnResetScaleCr || ""}
		</td></tr>
		
		${trait ? `<tr><td class="divider" colspan="6"><div></div></td></tr>${RenderBestiary._getRenderedSection("trait", trait, 1)}` : ""}
		${mon.action ? `<tr><td colspan="6" class="mon__stat-header-underline"><span class="mon__sect-header-inner">动作</span></td></tr>
		${RenderBestiary._getRenderedSection("action", mon.action, 1)}` : ""}
		${mon.reaction ? `<tr><td colspan="6" class="mon__stat-header-underline"><span class="mon__sect-header-inner">反应</span></td></tr>
		${RenderBestiary._getRenderedSection("reaction", mon.reaction, 1)}` : ""}
		${mon.legendary ? `<tr><td colspan="6" class="mon__stat-header-underline"><span class="mon__sect-header-inner">传奇动作</span></td></tr>
		<tr class='legendary'><td colspan='6'><span class='name'></span> <span>${Renderer.monster.getLegendaryActionIntro(mon)}</span></td></tr>
		${RenderBestiary._getRenderedSection("legendary", mon.legendary, 1)}` : ""}
		
		${legGroup && legGroup.lairActions ? `<tr><td colspan="6" class="mon__stat-header-underline"><span class="mon__sect-header-inner">巢穴动作</span></td></tr>
		${RenderBestiary._getRenderedSection("lairaction", legGroup.lairActions, -1)}` : ""}
		${legGroup && legGroup.regionalEffects ? `<tr><td colspan="6" class="mon__stat-header-underline"><span class="mon__sect-header-inner">区域效应</span></td></tr>
		${RenderBestiary._getRenderedSection("regionaleffect", legGroup.regionalEffects, -1)}` : ""}
		
		${renderedVariants ? `<tr>${renderedVariants}</tr>` : ""}
		${renderedSources.length === 2
		? `<tr><td colspan="4">${renderedSources[0]}</td><td colspan="2" class="text-align-right mr-2">${renderedSources[1]}</td></tr>`
		: `<tr><td colspan="6">${renderedSources[0]}</td></tr>`}
		${Renderer.utils.getBorderTr()}`;
	}
}
