/* ============================================================================
   RENDERING: HOME / MODE SELECT
   ============================================================================ */
function renderHome() {
  const dbSum = HISTORICAL_DB.getSummary();
  document.getElementById('statPlayers').textContent = dbSum.totalPlayers.toLocaleString();
  document.getElementById('statEras').textContent = dbSum.totalPools.toLocaleString();
  const elFr = document.getElementById('statFranchises');
  const elDec = document.getElementById('statDecades');
  const elSrc = document.getElementById('statSource');
  const elBanner = document.getElementById('seedFallbackBanner');
  if (elFr) elFr.textContent = `${dbSum.totalFranchises} / ${dbSum.maxFranchises}`;
  if (elDec) elDec.textContent = dbSum.decadeSpan;
  if (elSrc) elSrc.textContent = dbSum.sourceLabel;
  const elLg = document.getElementById('statLargest');
  const elSm = document.getElementById('statSmallest');
  const elAvg = document.getElementById('statAvgPool');
  if (elLg) elLg.textContent = dbSum.largestPool ? `${dbSum.largestPool.key} (${dbSum.largestPool.total})` : '—';
  if (elSm) elSm.textContent = dbSum.smallestPool ? `${dbSum.smallestPool.key} (${dbSum.smallestPool.total})` : '—';
  if (elAvg) elAvg.textContent = dbSum.avgPoolSize;
  if (elBanner) elBanner.style.display = dbSum.isCompiled ? 'none' : 'flex';

  const missLine = document.getElementById('missingCoverageLine');
  if (missLine) {
    const mf = dbSum.missingFranchises || [];
    const md = dbSum.missingDecades || [];
    if (mf.length === 0 && md.length === 0) {
      missLine.textContent = 'Full 30-franchise, 14-decade coverage active (0 missing).';
    } else {
      missLine.textContent = `Missing Decades (${md.length}): ${md.length ? md.join(', ') : 'None'}  ·  Missing Franchises (${mf.length}): ${mf.length ? mf.join(', ') : 'None'}`;
    }
  }
  const decStrip = document.getElementById('decadeCoverageStrip');
  if (decStrip) {
    const present = new Set(dbSum.presentDecades || []);
    decStrip.innerHTML = SUPPORTED_DECADES.map(d =>
      `<span class="dec-pill ${present.has(d) ? 'covered' : ''}">${d} ${present.has(d) ? '✓' : '—'}</span>`
    ).join('');
  }
  document.getElementById('statBestRecord').textContent = DYNASTY.runs > 0 ? `${DYNASTY.bestWins}–${DYNASTY.bestLosses}` : '—';
  document.getElementById('statRuns').textContent = DYNASTY.runs;

  const grid = document.getElementById('modeGrid');
  grid.innerHTML = GAME_MODES.map(m => `
    <button class="mode-card ${m.flagship ? 'flagship' : ''}" data-mode="${m.id}">
      <div>
        <div class="mode-top">
          <span class="mode-name">${m.name}</span>
          <span class="mode-tag ${m.flagship ? 'flagship-tag' : ''}">${m.tag}</span>
        </div>
        <p class="mode-desc" style="margin-top:8px;">${m.desc}</p>
      </div>
      <div class="mode-meta">
        <span>${m.slots.length} Roster Slots</span>
        <span>${m.rerolls === 0 ? 'No Rerolls' : m.rerolls === 1 ? '1 Reroll' : m.rerolls + ' Rerolls'} · ${m.pace}</span>
      </div>
    </button>
  `).join('');

  grid.querySelectorAll('.mode-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.mode;
      const mode = GAME_MODES.find(x => x.id === id);
      if (mode.needsConfig) {
        openModeConfig(mode);
      } else {
        document.getElementById('modeConfigBar').classList.remove('visible');
        startRun(id);
      }
    });
  });
}

function openModeConfig(mode) {
  state.pendingModeId = mode.id;
  const bar = document.getElementById('modeConfigBar');
  const title = document.getElementById('modeConfigTitle');
  const chips = document.getElementById('modeConfigChips');
  bar.classList.add('visible');

  if (mode.needsConfig === 'franchise') {
    title.textContent = 'Lock One Franchise for Franchise Mode';
    const fIds = HISTORICAL_DB.getAllFranchiseIds();
    state.pendingLock = fIds[0];
    chips.innerHTML = fIds.map((fId, idx) => `
      <button class="chip ${idx === 0 ? 'selected' : ''}" data-val="${fId}">${FRANCHISES[fId]?.name || fId}</button>
    `).join('');
  } else {
    title.textContent = 'Lock One Decade for Decade Mode';
    const decs = HISTORICAL_DB.getAllDecades();
    state.pendingLock = decs[0];
    chips.innerHTML = decs.map((d, idx) => `
      <button class="chip ${idx === 0 ? 'selected' : ''}" data-val="${d}">${d}</button>
    `).join('');
  }

  chips.querySelectorAll('.chip').forEach(c => {
    c.addEventListener('click', () => {
      chips.querySelectorAll('.chip').forEach(x => x.classList.remove('selected'));
      c.classList.add('selected');
      state.pendingLock = c.dataset.val;
    });
  });
}

/* ============================================================================
   RENDERING: DRAFT ROOM (FIELD, DUGOUT, ROLL BANNER, SCOUTING DOSSIERS)
   ============================================================================ */
function renderDraftRoom() {
  updateTopPill();
  const filledCount = Object.keys(state.roster).length;
  const totalCount = state.mode.slots.length;
  const isComplete = filledCount === totalCount;

  document.getElementById('rosterProgressSub').textContent = `${filledCount} of ${totalCount} roster slots filled`;
  document.getElementById('simReadyBar').style.display = isComplete ? 'flex' : 'none';

  // Rotation toggle for Full Team mode (SP1 / SP2 / SP3)
  const rotWrap = document.getElementById('rotationToggleWrap');
  if (state.mode.id === 'FULL') {
    rotWrap.style.display = 'flex';
    rotWrap.innerHTML = [0, 1, 2].map(i => `
      <button class="filter-tab ${state.activeRotIndex === i ? 'active' : ''}" data-rot="${i}">SP${i + 1}</button>
    `).join('');
    rotWrap.querySelectorAll('button').forEach(b => {
      b.addEventListener('click', () => {
        state.activeRotIndex = Number(b.dataset.rot);
        renderFieldAndDugout();
        renderDraftRoom();
      });
    });
  } else {
    rotWrap.style.display = 'none';
  }

  renderFieldAndDugout();
  renderChemistry();
  renderRetiredChapters();
  renderRollAndDossiers(isComplete);
}

function renderFieldAndDugout() {
  const selectedPlayer = state.currentRoll?.players.find(p => p.id === state.selectedPlayerId);
  const eligibleIds = new Set(getOpenSlotsForPlayer(selectedPlayer).map(s => s.id));

  // 1. Defensive Field Slots ONLY
  const fieldLayer = document.getElementById('fieldSlotsLayer');
  const fieldSlots = state.mode.slots.filter(s => s.area === 'field' && (s.rot === undefined || s.rot === state.activeRotIndex));
  fieldLayer.innerHTML = fieldSlots.map(slot => {
    const p = state.roster[slot.id];
    const accent = p ? (FRANCHISES[p.franchiseId]?.primary || '#B5C0D0') : '';
    const pulse = eligibleIds.has(slot.id) ? 'eligible-pulse' : '';
    return `
      <button class="field-slot ${p ? 'filled' : 'empty'} ${pulse}" data-slot="${slot.id}"
        style="left:${slot.x}%; top:${slot.y}%; ${p ? `--slot-accent:${accent};` : ''}">
        <span class="slot-pos">${slot.label}</span>
        <span class="slot-name">${p ? p.name : 'Open'}</span>
        ${p ? `<span class="slot-sub">${p.franchiseId} · ${p.decade}</span>` : ''}
      </button>
    `;
  }).join('');

  // 2. Dugout & Bullpen Slots (DH & RP strictly off-field)
  const dugoutGrid = document.getElementById('dugoutSlotsGrid');
  const dugoutSlots = state.mode.slots.filter(s => s.area === 'dugout');
  dugoutGrid.innerHTML = dugoutSlots.map(slot => {
    const p = state.roster[slot.id];
    const accent = p ? (FRANCHISES[p.franchiseId]?.primary || '#B5C0D0') : '';
    const pulse = eligibleIds.has(slot.id) ? 'eligible-pulse' : '';
    return `
      <button class="dugout-slot ${p ? 'filled' : ''} ${pulse}" data-slot="${slot.id}"
        style="${p ? `--slot-accent:${accent};` : ''}">
        <span class="dugout-role">${slot.label}</span>
        <div class="dugout-info">
          <div class="dugout-player ${p ? '' : 'empty'}">${p ? p.name : (slot.id === 'DH' ? 'Home Dugout — Open' : 'Bullpen — Open')}</div>
          ${p ? `<div class="dugout-era">${p.franchiseId} ${p.decade} · ${p.pos}</div>` : ''}
        </div>
      </button>
    `;
  }).join('');

  // Clicking an eligible open slot drafts the selected player straight into it!
  document.querySelectorAll('[data-slot]').forEach(btn => {
    btn.addEventListener('click', () => {
      const slotId = btn.dataset.slot;
      if (selectedPlayer && eligibleIds.has(slotId)) {
        draftPlayerToSlot(selectedPlayer, slotId);
      } else if (state.roster[slotId]) {
        const dp = state.roster[slotId];
        showToast(`${dp.name} (${dp.franchiseId} ${dp.decade}) — ${dp.awards.length ? dp.awards.join(', ') : dp.blurb}`);
      }
    });
  });
}

function renderStoriesStrip(players) {
  const storiesListEl = document.getElementById('storiesList');
  const storiesCountEl = document.getElementById('storiesCountLbl');
  if (!storiesListEl || !storiesCountEl || typeof evaluateNamedStories !== 'function') return;
  const evalRes = evaluateNamedStories(players);
  const comp = evalRes.completed || [];
  const pot = (evalRes.potential || []).slice(0, 6);
  storiesCountEl.textContent = `${comp.length} Completed · ${pot.length} Unlocked`;
  if (!comp.length && !pot.length) {
    storiesListEl.innerHTML = '<span style="font-size:12px; color:var(--mute);">Draft players to unlock hidden historical stories.</span>';
    return;
  }
  const compHtml = comp.map(st =>
    `<span class="story-chip completed ${st.tierMeta.cls}" title="${st.story}">☑ ${st.name}</span>`
  ).join('');
  const potHtml = pot.map(st =>
    `<span class="story-chip potential" title="Hidden Story Unlocked — keep rolling to discover who completes it">☐ ${st.name}</span>`
  ).join('');
  storiesListEl.innerHTML = compHtml + potHtml;
}

function renderChemistry() {
  const players = Object.values(state.roster);
  renderStoriesStrip(players);
  const wrap = document.getElementById('chemBadges');
  if (players.length < 2) {
    wrap.innerHTML = '<span class="chem-tag neutral">Draft players from shared clubs or eras to build chemistry</span>';
    return;
  }
  const chem = computeChemistry(players);
  if (chem.tags.length === 0) {
    wrap.innerHTML = '<span class="chem-tag neutral">No active franchise or teammate links yet</span>';
  } else {
    wrap.innerHTML = chem.tags.map(t => `<span class="chem-tag">${t}</span>`).join('');
  }
}

function renderRetiredChapters() {
  const wrap = document.getElementById('retiredChaptersList');
  const lbl = document.getElementById('retiredCountLbl');
  if (!wrap) return;
  const hist = state.draftHistory || [];
  if (lbl) lbl.textContent = `${hist.length} Sealed`;
  if (hist.length === 0) {
    wrap.innerHTML = '<span style="font-size:12px; color:var(--mute);">Each pick permanently seals that Franchise + Era for this run.</span>';
    return;
  }
  wrap.innerHTML = hist.map(item => {
    const accent = FRANCHISES[item.franchiseId]?.primary || '#B5C0D0';
    return `
      <div class="retired-item" style="--ret-accent:${accent};">
        <div>
          <span class="retired-era">${item.franchiseName} ${item.decade}</span>
          <span class="retired-arrow">&rarr;</span>
          <span class="retired-player">${item.draftedPlayer.name}</span>
        </div>
        <span class="retired-slot">${item.slotId}</span>
      </div>
    `;
  }).join('');
}

function renderRollAndDossiers(isComplete) {
  const roll = state.currentRoll;
  if (!roll) return;
  const f = FRANCHISES[roll.franchiseId] || { name: roll.franchiseId, primary: '#BD3039' };
  const _rollHdrEl = document.getElementById('rollFranchiseName');
  _rollHdrEl.textContent = getHistoricalFranchiseName(roll.franchiseId, roll.decade);
  const _rollCardEl = _rollHdrEl.closest('.roll-header');
  if (_rollCardEl) {
    _rollCardEl.classList.remove('era-reveal');
    void _rollCardEl.offsetWidth;
    _rollCardEl.classList.add('era-reveal');
  }
  const c = roll.counts || { total: roll.players.length, pos: 0, sp: 0, rp: 0 };
  const unusedLeft = getUnusedPoolsForRun().length;
  document.getElementById('rollDecadeLabel').textContent = `${roll.decade} · ${c.total} Players (${c.pos} POS · ${c.sp} SP · ${c.rp} RP) · One-time chapter (${unusedLeft} unused)`;
  const eraEl = document.getElementById('rollEraNarrative');
  if (eraEl) eraEl.textContent = getEraContextNarrative(roll.franchiseId, roll.decade, roll.players);

  const btnReroll = document.getElementById('btnReroll');
  if (state.mode.id === 'IRONMAN') {
    btnReroll.textContent = 'Ironman (0 Rerolls)';
    btnReroll.disabled = true;
  } else {
    btnReroll.textContent = `Reroll (${state.rerollsLeft} left)`;
    btnReroll.disabled = isComplete || state.rerollsLeft <= 0 || getUnusedPoolsForRun().length <= 1;
  }

  // Filter, search & sort full dynamic pool (zero trimming or rating sorts)
  const q = state.searchQuery.trim().toLowerCase();
  const filtered = roll.players.filter(p => {
    if (state.hofOnlyFilter && !p.hof) return false;
    if (state.awardOnlyFilter && (!p.awards || p.awards.length === 0)) return false;
    if (q) {
      const gem = getHistoricalLabels(p, { blind: !!state.mode.blind }).map(g => g.label).join(' ');
      const sec = (p.secondaryPositions || []).join(' ');
      const hay = `${p.name} ${p.pos} ${sec} ${p.awards.join(' ')} ${gem} ${p.hof ? 'hof hall of fame' : ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (state.activeFilter === 'POS' && p.type !== 'H') return false;
    if (state.activeFilter === 'OF' && !(p.type === 'H' && p.elig.includes('OF'))) return false;
    if (state.activeFilter === 'IF' && !(p.type === 'H' && p.elig.includes('IF'))) return false;
    if (state.activeFilter === 'SP' && !(p.type === 'P' && p.elig.includes('SP'))) return false;
    if (state.activeFilter === 'RP' && !(p.type === 'P' && p.elig.includes('RP'))) return false;
    if (state.activeFilter === 'ELIGIBLE') {
      if (state.draftedKeys.has(p.playerKey) || getOpenSlotsForPlayer(p).length === 0) return false;
    }
    return true;
  });

  if (state.sortBy === 'ALPHA_ASC') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (state.sortBy === 'ALPHA_DESC') {
    filtered.sort((a, b) => b.name.localeCompare(a.name));
  } else if (state.sortBy === 'SEASONS') {
    filtered.sort((a, b) => b.seasons - a.seasons || a.name.localeCompare(b.name));
  } else if (state.sortBy === 'CHRONO') {
    filtered.sort((a, b) => a.startYr - b.startYr || a.name.localeCompare(b.name));
  }

  document.getElementById('btnToggleHof')?.classList.toggle('active', !!state.hofOnlyFilter);
  document.getElementById('btnToggleAwards')?.classList.toggle('active', !!state.awardOnlyFilter);
  const countPill = document.getElementById('scoutingCountPill');
  if (countPill) {
    countPill.textContent = `Showing ${filtered.length} of ${roll.players.length} qualifying players`;
  }

  const list = document.getElementById('dossierList');
  if (filtered.length === 0) {
    list.innerHTML = `<div style="padding:24px; text-align:center; color:var(--mute);">No matching players in this filter. Try switching to "All" or clearing your search.</div>`;
  } else {
    list.innerHTML = filtered.map(p => {
      const alreadyDrafted = state.draftedKeys.has(p.playerKey);
      const openSlots = getOpenSlotsForPlayer(p);
      const isSelected = state.selectedPlayerId === p.id;
      const disabledClass = (alreadyDrafted || (!isComplete && openSlots.length === 0)) ? 'disabled-row' : '';

      let statsHtml = '';
      if (state.mode.blind) {
        statsHtml = `<div class="blind-mask">Stats concealed (Blind Draft)</div><div class="stat-sub">Evaluate by history &amp; accolades</div>`;
      } else if (p.type === 'H') {
        const avgStr = p.stats.avg.toFixed(3).replace(/^0/, '');
        const obpStr = p.stats.obp.toFixed(3).replace(/^0/, '');
        const opsStr = p.stats.ops.toFixed(3).replace(/^0/, '');
        statsHtml = `<div class="stat-line">${avgStr} / ${obpStr} · ${opsStr} OPS</div><div class="stat-sub">${p.stats.hr} HR · ${p.stats.rbi} RBI avg/yr</div>`;
      } else {
        const extra = p.pos.includes('RP') && p.stats.sv > 0 ? `${p.stats.sv} SV` : `${p.stats.k} K`;
        statsHtml = `<div class="stat-line">${p.stats.era.toFixed(2)} ERA · ${p.stats.whip.toFixed(2)} WHIP</div><div class="stat-sub">${extra} avg/yr</div>`;
      }

      const awardsLine = p.awards.length
        ? p.awards.slice(0, 4).map(a => /MVP|Cy Young|World Series|Hall of Fame/.test(a) ? `<span class="award-major-txt">${a}</span>` : `<span>${a}</span>`).join('<span class="award-dot"> · </span>')
        : `<span class="award-muted-txt">Era Contributor</span>`;
      const awardsHtml = `<div class="dossier-awards-line">${awardsLine}</div>`;

      const storiesHere = (!alreadyDrafted && openSlots.length > 0 && typeof getStoriesCompletedByCandidate === 'function')
        ? getStoriesCompletedByCandidate(p, Object.values(state.roster))
        : [];
      const storyReadyClass = storiesHere.length ? 'story-ready' : (p.hof ? 'hof-tier' : '');
      const storyBadgeHtml = storiesHere.length
        ? `<span class="story-avail-badge">★ Story Available · ${storiesHere[0].name}</span>`
        : '';

      return `
        <button class="dossier-row ${isSelected ? 'selected' : ''} ${disabledClass} ${storyReadyClass}" data-pid="${p.id}">
          <div>
            <div class="dossier-name-line">
              <span class="dossier-name">${p.name}</span>
              <span class="pos-badge">${p.pos}${(p.secondaryPositions && p.secondaryPositions.length) ? ' / ' + p.secondaryPositions.join(', ') : ''}</span>
              ${storyBadgeHtml}
              ${getHistoricalLabels(p, { blind: !!state.mode.blind }).slice(0, 1).map(g => `<span class="gem-tag ${g.cls}">${g.label}</span>`).join('')}
              ${alreadyDrafted ? '<span class="pos-badge">DRAFTED</span>' : ''}
            </div>
            <div class="dossier-tenure">${f.abbr} ${p.years} · ${p.seasons} ${p.seasons === 1 ? 'season' : 'seasons'} with club</div>
            <div class="dossier-awards">${awardsHtml}</div>
          </div>
          <div class="dossier-stats-col">${statsHtml}</div>
        </button>
      `;
    }).join('');

    list.querySelectorAll('.dossier-row').forEach(row => {
      row.addEventListener('click', () => {
        state.selectedPlayerId = row.dataset.pid;
        playTone(300, 0.04, 'sine', 0.04);
        renderFieldAndDugout();
        renderRollAndDossiers(isComplete);
      });
    });
  }

  renderInspector(isComplete);
}

function renderInspector(isComplete) {
  const box = document.getElementById('dossierInspector');
  if (isComplete) {
    box.innerHTML = `<div style="display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
      <span style="font-size:13.5px; color:var(--ink);">Your roster is complete. Head to Opening Day and test your club across 162 games.</span>
      <button id="btnInspectorSim" class="btn btn-primary">Simulate Season</button>
    </div>`;
    document.getElementById('btnInspectorSim').addEventListener('click', beginSeasonSimulation);
    return;
  }

  const p = state.currentRoll?.players.find(x => x.id === state.selectedPlayerId);
  if (!p) {
    box.innerHTML = `<div style="color:var(--mute); font-size:13px;">Select any scouting dossier above to read their historical profile, check clubhouse chemistry, and draft them into an open position.</div>`;
    return;
  }

  const already = state.draftedKeys.has(p.playerKey);
  const openSlots = already ? [] : getOpenSlotsForPlayer(p);
  const chemLinks = previewChemistryWith(p);
  const candidateStories = (!already && openSlots.length > 0 && typeof getStoriesCompletedByCandidate === 'function')
    ? getStoriesCompletedByCandidate(p, Object.values(state.roster))
    : [];
  const topPoolLegend = (state.currentRoll?.players || [])
    .filter(x => x.id !== p.id && x.hof)
    .sort((a, b) => (b.type === 'H' ? hiddenHitterImpact(b) : hiddenPitcherImpact(b)) - (a.type === 'H' ? hiddenHitterImpact(a) : hiddenPitcherImpact(a)))[0];
  const storyCalloutHtml = candidateStories.length ? candidateStories.slice(0, 2).map(st => `
    <div class="inspector-story-callout">
      <div class="inspector-story-title">★ ${st.tierMeta.label} Available · Completes ${st.name}</div>
      <div class="inspector-story-text">${st.story}</div>
      ${(!p.hof && topPoolLegend) ? `<div class="inspector-story-sacrifice">Roads Not Taken: Choosing ${p.name} here means passing on Hall of Famer ${topPoolLegend.name}.</div>` : ''}
    </div>
  `).join('') : '';

  box.innerHTML = `
    <div class="inspector-top">
      <div>
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <span style="font-weight:700; font-size:16.5px;">${p.name}</span>
          <span class="pos-badge">${p.pos}${(p.secondaryPositions && p.secondaryPositions.length) ? ' / ' + p.secondaryPositions.join(', ') : ''}</span>
          ${getHistoricalLabels(p, { blind: !!state.mode.blind }).map(g => `<span class="gem-tag ${g.cls}">${g.label}</span>`).join('')}
        </div>
        <div style="font-size:12px; color:var(--silver); margin-top:3px;">${getHistoricalFranchiseName(p.franchiseId, p.decade)} · ${p.years} (${p.seasons} ${p.seasons === 1 ? 'season' : 'seasons'} with franchise)${p.awards.length ? ' · ' + p.awards.join(', ') : ''}</div>
        <div class="inspector-blurb">“${p.blurb}”</div>
      </div>
    </div>
    ${storyCalloutHtml}
    ${chemLinks.length ? `<div style="margin-bottom:10px; display:flex; flex-wrap:wrap; gap:6px;">${chemLinks.map(l => `<span class="chem-tag">${l}</span>`).join('')}</div>` : ''}
    <div style="font-size:11.5px; color:var(--mute); margin-bottom:8px;">One-time opportunity: drafting locks out the rest of <strong style="color:var(--silver);">${FRANCHISES[p.franchiseId]?.name || p.franchiseId} (${p.decade})</strong> for this run.</div>
    <div class="slot-assign-row">
      ${already
        ? `<span style="font-size:12.5px; color:var(--mute);">Already drafted on your roster.</span>`
        : openSlots.length === 0
          ? `<span style="font-size:12.5px; color:var(--crimson);">No open roster slots fit ${p.pos}.</span>`
          : openSlots.map(s => `<button class="btn btn-accent" data-draft-slot="${s.id}">Draft to ${s.label}${s.area === 'dugout' ? ' (Dugout/Bullpen)' : ''}</button>`).join('')
      }
    </div>
  `;

  box.querySelectorAll('[data-draft-slot]').forEach(btn => {
    btn.addEventListener('click', () => draftPlayerToSlot(p, btn.dataset.draftSlot));
  });
}

let storyBannerTimer = null;
function showStoryMilestone(story, sacrificeName) {
  const el = document.getElementById('storyMilestoneBanner');
  if (!el) return;
  el.innerHTML = `
    <div class="milestone-tier">★ ${story.tierMeta.label} Completed</div>
    <div class="milestone-name">${story.name}</div>
    <div class="milestone-story">${story.story}</div>
    ${sacrificeName ? `<div class="milestone-sacrifice">Roads Not Taken: Passed on ${sacrificeName} to complete this story.</div>` : ''}
    <div class="milestone-bonus">Clubhouse Effect: ${story.bonusLabel}</div>
  `;
  el.classList.add('show');
  if (storyBannerTimer) clearTimeout(storyBannerTimer);
  storyBannerTimer = setTimeout(() => el.classList.remove('show'), 5400);
}

function draftPlayerToSlot(player, slotId) {
  const priorRoster = Object.values(state.roster);
  const newlyCompleted = (typeof getStoriesCompletedByCandidate === 'function')
    ? getStoriesCompletedByCandidate(player, priorRoster)
    : [];

  // 1. Add player to roster
  state.roster[slotId] = player;
  state.draftedKeys.add(player.playerKey);

  // 2. Priority 4: Record draftHistory including notable passedPlayers sacrificed from this pool
  const poolPlayers = state.currentRoll ? state.currentRoll.players : [];
  const passedPlayers = poolPlayers
    .filter(p => p.id !== player.id)
    .sort((a, b) => {
      const impA = a.type === 'H' ? hiddenHitterImpact(a) : hiddenPitcherImpact(a);
      const impB = b.type === 'H' ? hiddenHitterImpact(b) : hiddenPitcherImpact(b);
      return impB - impA;
    })
    .slice(0, 5);

  const passedHof = passedPlayers.find(pp => pp.hof) || passedPlayers[0] || null;
  const storySacrifice = (newlyCompleted.length > 0 && passedHof) ? passedHof.name : null;

  const fName = getHistoricalFranchiseName(player.franchiseId, player.decade);
  const sacrificeObj = (typeof classifySacrifice === 'function')
    ? classifySacrifice(player, passedPlayers, newlyCompleted, player.franchiseId, fName, player.decade)
    : null;
  state.draftHistory.push({
    pickNumber: Object.keys(state.roster).length,
    slotId,
    franchiseId: player.franchiseId,
    franchiseName: fName,
    decade: player.decade,
    draftedPlayer: player,
    passedPlayers,
    completedStories: newlyCompleted.map(s => ({ id: s.id, name: s.name, tier: s.tier, story: s.story })),
    storySacrifice,
    sacrifice: sacrificeObj
  });

  // 3. Permanently mark this Franchise + Era as retired for the rest of the run
  const usedKey = `${player.franchiseId}__${player.decade}`;
  state.usedPools.add(usedKey);

  sfxDraft();
  if (newlyCompleted.length > 0) {
    sfxWin();
    showStoryMilestone(newlyCompleted[0], storySacrifice);
  } else {
    showToast(`Drafted ${player.name} to ${slotId} — ${fName} (${player.decade}) sealed for this run.`);
  }

  // 4. Immediately roll a completely new unused Franchise + Era (or complete roster)
  const filled = Object.keys(state.roster).length;
  if (filled < state.mode.slots.length) {
    rollNextFranchiseEra(true);
  } else {
    state.selectedPlayerId = null;
    renderDraftRoom();
  }
}

/* ============================================================================
   PHASE 6: SEASON SIMULATION THEATER & END-OF-SEASON EXPERIENCE
   ============================================================================ */
function beginSeasonSimulation() {
  const result = simulateFullSeason(state.roster);
  state.simResult = result;
  switchView('sim');

  document.getElementById('endOfSeasonWrap').style.display = 'none';
  document.getElementById('btnPlayAgain').style.display = 'none';
  document.getElementById('btnSkipSim').style.display = 'inline-flex';
  document.getElementById('simTierLabel').textContent = 'Simulating 162-Game Regular Season...';
  document.getElementById('simRecordDisplay').textContent = '0–0';
  document.getElementById('simSubLine').textContent = 'Opening Day underway';

  const mGrid = document.getElementById('monthGrid');
  mGrid.innerHTML = result.months.map((m, idx) => `
    <div class="month-cell" id="mCell${idx}">
      <div class="month-name">${m.name}</div>
      <div class="month-rec" id="mRec${idx}">—</div>
      <div class="month-note" id="mNote${idx}">Pending</div>
    </div>
  `).join('');

  let step = 0;
  if (state.simTimer) clearInterval(state.simTimer);
  state.simTimer = setInterval(() => {
    revealMonth(step);
    step++;
    if (step >= result.months.length) {
      clearInterval(state.simTimer);
      state.simTimer = null;
      finalizeSeasonView();
    }
  }, 420);
}

function revealMonth(idx) {
  const m = state.simResult.months[idx];
  const cell = document.getElementById(`mCell${idx}`);
  if (!cell) return;
  cell.classList.add('active-month');
  document.getElementById(`mRec${idx}`).textContent = `${m.w}–${m.l}`;
  document.getElementById(`mNote${idx}`).textContent = m.note;
  document.getElementById('simRecordDisplay').textContent = `${m.cumW}–${m.cumL}`;
  document.getElementById('simSubLine').textContent = `Through ${m.name} · ${m.note}`;
  playTone(280 + idx * 35, 0.06, 'triangle', 0.05);
}

function finalizeSeasonView() {
  if (state.simTimer) { clearInterval(state.simTimer); state.simTimer = null; }
  const r = state.simResult;
  r.months.forEach((_, idx) => revealMonth(idx));

  document.getElementById('btnSkipSim').style.display = 'none';
  document.getElementById('btnPlayAgain').style.display = 'inline-flex';
  document.getElementById('simTierLabel').textContent = `${state.mode.name} · ${r.tier}`;
  document.getElementById('simRecordDisplay').textContent = `${r.wins}–${r.losses}`;
  document.getElementById('simSubLine').textContent = `${r.octoberOutcome} · Longest Win Streak: ${r.maxWinStreak}G`;

  // Commemorative Black Diamond Team Photo
  document.getElementById('photoHeadline').textContent = `${state.mode.name} Club · ${r.wins}–${r.losses} · Seed ${state.seed}`;
  document.getElementById('photoBadge').textContent = r.octoberOutcome;
  document.getElementById('teamPhotoRoster').innerHTML = state.mode.slots.map(slot => {
    const p = state.roster[slot.id];
    const accent = FRANCHISES[p.franchiseId]?.primary || '#B5C0D0';
    return `
      <div class="photo-player" style="--p-accent:${accent};">
        <div class="photo-player-pos">${slot.label} · ${p.pos}</div>
        <div class="photo-player-name">${p.name}</div>
        <div class="photo-player-club">${p.franchiseId} · ${p.decade}</div>
      </div>
    `;
  }).join('');

  // October Postseason
  document.getElementById('recapOctoberTitle').textContent = r.octoberOutcome;
  const sList = document.getElementById('recapSeriesList');
  if (!r.madePlayoffs) {
    sList.innerHTML = `<li><span>Postseason Qualification</span><span style="color:var(--mute);">Fell short of October</span></li>`;
  } else {
    sList.innerHTML = r.series.map(s => `
      <li>
        <span>${s.round}</span>
        <span style="font-family:'JetBrains Mono',monospace; color:${s.won ? 'var(--emerald)' : 'var(--crimson)'};">${s.result}</span>
      </li>
    `).join('');
  }

  // Team MVP & Cy Young
  document.getElementById('recapMvp').textContent = `${r.mvp.name} (${r.mvp.franchiseId} ${r.mvp.decade})`;
  document.getElementById('recapMvpLine').textContent = r.mvpLine;
  document.getElementById('recapCy').textContent = `${r.cy.name} (${r.cy.franchiseId} ${r.cy.decade})`;
  document.getElementById('recapCyLine').textContent = r.cyLine;

  // Autopsy & Chemistry
  document.getElementById('recapAutopsyHeadline').textContent = r.tier;
  const chemNote = r.chem.tags.length > 0
    ? `Clubhouse synergy (${r.chem.tags.slice(0, 2).join(' · ')}) helped swing tight games.`
    : `Built as a pure best-player-available assembly across distinct franchises and eras.`;
  document.getElementById('recapAutopsyText').textContent =
    `Peaked in ${r.bestMonth.name} (${r.bestMonth.w}–${r.bestMonth.l}) with a ${r.maxWinStreak}-game winning streak and a ${r.maxLossStreak}-game skid. ${chemNote}`;

  const teamAwards = [];
  if (r.wonWorldSeries) teamAwards.push('World Series Trophy');
  if (r.wins >= 117) teamAwards.push('New MLB Wins Record');
  if (r.maxWinStreak >= 10) teamAwards.push(`${r.maxWinStreak}-Game Win Streak`);
  if (r.chem.titleCorePairs > 0) teamAwards.push('Championship Core Synergy');
  document.getElementById('recapAwardsRow').innerHTML = teamAwards.length
    ? teamAwards.map(a => `<span class="award-chip major">${a}</span>`).join('')
    : `<span class="award-chip">162-Game Finisher</span>`;

  // Historical Ranking & Franchise Record Comparison
  const benchmarks = [
    { club: 'Your Diamond Draft Club', w: r.wins, l: r.losses, note: `${state.mode.name} · ${r.octoberOutcome}`, isUser: true },
    { club: '1906 Chicago Cubs', w: 116, l: 36, note: 'All-time MLB winning percentage (.763)' },
    { club: '2001 Seattle Mariners', w: 116, l: 46, note: 'AL & modern 162-game wins record' },
    { club: '1998 New York Yankees', w: 114, l: 48, note: 'World Series Champions' },
    { club: '2022 Los Angeles Dodgers', w: 111, l: 51, note: 'NL 162-game franchise record' },
    { club: '1927 New York Yankees', w: 110, l: 44, note: 'Murderers’ Row dynasty' },
    { club: '2018 Boston Red Sox', w: 108, l: 54, note: 'Red Sox franchise wins record' },
    { club: '2019 Houston Astros', w: 107, l: 55, note: 'Astros franchise wins record' },
    { club: '1998 Atlanta Braves', w: 106, l: 56, note: 'Braves modern wins record' }
  ].sort((a, b) => (b.w / (b.w + b.l)) - (a.w / (a.w + a.l)));

  document.getElementById('histComparisonBody').innerHTML = benchmarks.map(b => `
    <tr class="${b.isUser ? 'user-row' : ''}">
      <td>${b.club}</td>
      <td style="font-family:'JetBrains Mono',monospace; white-space:nowrap;">${b.w}–${b.l}</td>
      <td style="font-family:'JetBrains Mono',monospace;">${(b.w / (b.w + b.l)).toFixed(3).replace(/^0/, '')}</td>
      <td>${b.note}</td>
    </tr>
  `).join('');

  // Milestone #3: Run's Most Painful Sacrifice Spotlight + Roads Not Taken Sealed Vault Cards
  const spotEl = document.getElementById('runSacrificeSpotlight');
  if (spotEl) {
    const runSacs = state.draftHistory.map(h => h.sacrifice).filter(Boolean).sort((a, b) => b.painScore - a.painScore);
    const topSac = runSacs[0];
    if (topSac) {
      spotEl.style.display = 'block';
      spotEl.innerHTML = `
        <div style="font-family:'JetBrains Mono',monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#F28B82;">Run’s Defining Sacrifice · ${topSac.tierMeta.label}</div>
        <div style="font-family:'Instrument Serif',Georgia,serif; font-style:italic; font-size:21px; color:#FFFFFF; margin-top:4px;">
          “Passed on ${topSac.passedPlayer} to draft ${topSac.draftedPlayer}${topSac.storyCompleted ? ` — completing ${topSac.storyCompleted}` : ''} (${topSac.franchiseName} · ${topSac.decade}).”
        </div>
      `;
    } else {
      spotEl.style.display = 'none';
    }
  }
  const roadsWrap = document.getElementById('roadsNotTakenGrid');
  if (roadsWrap) {
    roadsWrap.innerHTML = state.draftHistory.map(item => {
      const accent = FRANCHISES[item.franchiseId]?.primary || '#B5C0D0';
      const passedHtml = item.passedPlayers.length
        ? item.passedPlayers.map(pp => `<span class="passed-name">${pp.name} <span style="color:var(--mute);">(${pp.pos})</span></span>`).join('')
        : '<span style="color:var(--mute); font-size:12px;">No other players in pool</span>';
      const storyBadge = (item.completedStories && item.completedStories.length)
        ? `<div class="road-story-badge">★ Completed <strong>${item.completedStories[0].name}</strong>${item.storySacrifice ? ` — Passed on ${item.storySacrifice}` : ''}</div>`
        : '';
      const sacBadge = item.sacrifice
        ? `<div class="sac-tier-badge ${item.sacrifice.tierMeta.cls}">${item.sacrifice.tierMeta.label}${item.sacrifice.storyOverStar ? ' · Story Over Star' : ''}</div>`
        : '';
      return `
        <div class="road-card" style="--r-accent:${accent};">
          <div class="road-era">${item.franchiseName} — ${item.decade}</div>
          <div class="road-drafted-lbl">Drafted (#${item.pickNumber} · ${item.slotId})</div>
          <div class="road-drafted-name">${item.draftedPlayer.name} <span style="font-size:12px; color:var(--silver); font-weight:500;">${item.draftedPlayer.pos}</span></div>
          ${sacBadge}
          ${storyBadge}
          <div class="road-passed-lbl">Archived Legends · Lost Timeline</div>
          <div class="road-passed-list">${passedHtml}</div>
        </div>
      `;
    }).join('');
  }

  document.getElementById('endOfSeasonWrap').style.display = 'block';
  recordDynastyRun(r);
  if (r.wonWorldSeries || r.wins >= 105) sfxWin();
}

function recordDynastyRun(r) {
  DYNASTY.runs += 1;
  if (r.wins > DYNASTY.bestWins) {
    DYNASTY.bestWins = r.wins;
    DYNASTY.bestLosses = r.losses;
  }
  if (r.wonWorldSeries) DYNASTY.titles += 1;

  const unlock = id => { if (!DYNASTY.trophies.includes(id)) DYNASTY.trophies.push(id); };
  unlock('first_run');
  if (r.wins >= 100) unlock('centurion');
  if (r.wins >= 117) unlock('historic');
  if (r.wins >= 125) unlock('dream_team');
  if (r.wonWorldSeries) unlock('october_champ');
  if (r.chem.teammatePairs > 0) unlock('clubhouse');
  const runStories = r.chem.completedStories || [];
  if (runStories.some(s => s.tier === 'LEGENDARY')) unlock('story_weaver');
  if (!Array.isArray(DYNASTY.stories)) DYNASTY.stories = [];
  for (const st of runStories) {
    if (!DYNASTY.stories.some(x => x.id === st.id)) {
      const histHit = state.draftHistory.find(h => (h.completedStories || []).some(cs => cs.id === st.id));
      DYNASTY.stories.unshift({
        id: st.id,
        name: st.name,
        tier: st.tier,
        story: st.story,
        players: (st.players || []).map(p => p.name).join(' + '),
        sacrifice: histHit?.storySacrifice || null
      });
    }
  }
  if (!Array.isArray(DYNASTY.sacrifices)) DYNASTY.sacrifices = [];
  for (const h of state.draftHistory) {
    const sc = h.sacrifice;
    if (!sc) continue;
    if (sc.storyOverStar) unlock('story_over_star');
    if (sc.tier === 'IMPOSSIBLE') unlock('impossible_goodbye');
    if (!DYNASTY.sacrifices.some(x => x.id === sc.id)) {
      DYNASTY.sacrifices.push({
        id: sc.id,
        passedPlayer: sc.passedPlayer,
        passedPos: sc.passedPos,
        draftedPlayer: sc.draftedPlayer,
        draftedPos: sc.draftedPos,
        storyCompleted: sc.storyCompleted,
        storyOverStar: sc.storyOverStar,
        franchiseName: sc.franchiseName,
        decade: sc.decade,
        tier: sc.tier,
        painScore: sc.painScore,
        dateAchieved: sc.dateAchieved
      });
    }
  }
  DYNASTY.sacrifices.sort((a, b) => (b.painScore || 0) - (a.painScore || 0));
  DYNASTY.sacrifices = DYNASTY.sacrifices.slice(0, 48);
  if (state.mode.id === 'BLIND' && r.wins >= 95) unlock('blind_genius');
  if (state.mode.id === 'IRONMAN' && r.wins >= 95) unlock('iron_will');
  if (r.wins === 162) unlock('perfect_162');

  DYNASTY.history.unshift({
    mode: state.mode.name,
    record: `${r.wins}–${r.losses}`,
    outcome: r.octoberOutcome,
    mvp: r.mvp.name
  });
  DYNASTY.history = DYNASTY.history.slice(0, 12);
  saveDynasty(DYNASTY);
}

/* ============================================================================
   MODALS: DYNASTY VAULT & LAHMAN JSON IMPORTER
   ============================================================================ */
function openDynastyModal() {
  document.getElementById('dynastySummary').innerHTML = `
    <div class="vault-stat"><span class="vault-stat-val">${DYNASTY.runs}</span><span class="vault-stat-lbl">Runs</span></div>
    <div class="vault-stat"><span class="vault-stat-val">${DYNASTY.runs ? DYNASTY.bestWins + '–' + DYNASTY.bestLosses : '—'}</span><span class="vault-stat-lbl">Best Record</span></div>
    <div class="vault-stat"><span class="vault-stat-val">${DYNASTY.titles}</span><span class="vault-stat-lbl">World Series</span></div>
    <div class="vault-stat"><span class="vault-stat-val">${DYNASTY.trophies.length}/${TROPHIES.length}</span><span class="vault-stat-lbl">Trophies</span></div>
  `;
  const sacWrap = document.getElementById('dynastySacrificesList');
  const sacCountsEl = document.getElementById('dynastySacrificeCounts');
  if (sacWrap) {
    const sacs = DYNASTY.sacrifices || [];
    const impN = sacs.filter(s => s.tier === 'IMPOSSIBLE').length;
    const legN = sacs.filter(s => s.tier === 'LEGENDARY').length;
    const sosN = sacs.filter(s => s.storyOverStar).length;
    if (sacCountsEl) sacCountsEl.textContent = `${impN} Impossible · ${legN} Legendary · ${sosN} Story-Over-Star`;
    sacWrap.innerHTML = sacs.length
      ? sacs.slice(0, 8).map(sc => `
          <div class="dynasty-sac-card sac-${(sc.tier || 'minor').toLowerCase()}">
            <div style="font-family:'JetBrains Mono',monospace; font-size:9.5px; letter-spacing:0.08em; text-transform:uppercase; color:${sc.tier === 'IMPOSSIBLE' ? '#F8A5A0' : sc.tier === 'LEGENDARY' ? '#F8D47C' : 'var(--silver)'};">${(SACRIFICE_TIERS[sc.tier]?.label || sc.tier)}${sc.storyOverStar ? ' · Story Over Star' : ''}</div>
            <div style="font-size:13px; font-weight:700; color:var(--ink); margin-top:3px;">Passed on ${sc.passedPlayer}</div>
            <div style="font-size:11.5px; color:var(--silver); margin-top:2px;">Drafted <strong>${sc.draftedPlayer}</strong> · ${sc.franchiseName} (${sc.decade})</div>
            ${sc.storyCompleted ? `<div style="font-size:11px; color:#F8D47C; margin-top:3px;">★ Completed ${sc.storyCompleted}</div>` : ''}
            <div style="font-family:'JetBrains Mono',monospace; font-size:10px; color:var(--mute); margin-top:4px;">Sealed ${sc.dateAchieved || ''}</div>
          </div>
        `).join('')
      : '<div style="font-size:12.5px; color:var(--mute);">Complete runs to immortalize your most painful Roads Not Taken sacrifices here.</div>';
  }
  const stCountEl = document.getElementById('dynastyStoryCount');
  if (stCountEl && typeof NAMED_STORIES !== 'undefined') {
    stCountEl.textContent = `${(DYNASTY.stories || []).length} / ${NAMED_STORIES.length} Discovered`;
  }
  const dsWrap = document.getElementById('dynastyStoriesList');
  if (dsWrap) {
    const colStories = DYNASTY.stories || [];
    dsWrap.innerHTML = colStories.length
      ? colStories.map(st => `
          <div class="dynasty-story-card tier-${(st.tier || 'baseball').toLowerCase()}">
            <div style="font-size:12.5px; font-weight:700; color:var(--ink);">★ ${st.name}</div>
            <div style="font-size:11px; color:var(--silver); margin-top:2px;">${st.players || ''}</div>
            ${st.sacrifice ? `<div style="font-size:10.5px; color:#F5B7B1; margin-top:3px;">Passed on ${st.sacrifice}</div>` : ''}
          </div>
        `).join('')
      : '<div style="font-size:12.5px; color:var(--mute);">Complete Named Stories during your drafts to collect baseball history here.</div>';
  }
  document.getElementById('trophyGrid').innerHTML = TROPHIES.map(t => {
    const u = DYNASTY.trophies.includes(t.id);
    return `
      <div class="trophy-item ${u ? 'unlocked' : ''}">
        <div class="trophy-name">${u ? '★ ' : ''}${t.name}</div>
        <div class="trophy-desc">${t.desc}</div>
      </div>
    `;
  }).join('');

  const rec = document.getElementById('recentRunsList');
  rec.innerHTML = DYNASTY.history.length
    ? `<table class="hist-table"><thead><tr><th>Mode</th><th>Record</th><th>October</th><th>MVP</th></tr></thead><tbody>${
        DYNASTY.history.map(h => `<tr><td>${h.mode}</td><td style="font-family:'JetBrains Mono',monospace;">${h.record}</td><td>${h.outcome}</td><td>${h.mvp}</td></tr>`).join('')
      }</tbody></table>`
    : `<div style="color:var(--mute); font-size:13px;">No completed runs yet. Start a Quick Draft to record your first season.</div>`;

  document.getElementById('modalDynasty').classList.add('open');
}

function handleVaultImport() {
  const raw = document.getElementById('importJsonArea').value.trim();
  if (!raw) { showToast('Paste a compiled historical-players.json array or upload CSVs above.'); return; }
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr) || arr.length === 0) throw new Error('Expected non-empty array');
    const replaceMode = document.getElementById('chkReplaceVault')?.checked;
    const added = HISTORICAL_DB.loadRecords(arr, { replace: !!replaceMode, sourceLabel: 'Compiled Lahman Database (JSON)', isCompiled: true });
    document.getElementById('modalImport').classList.remove('open');
    

document.getElementById('btnToggleHof')?.addEventListener('click', () => {
  state.hofOnlyFilter = !state.hofOnlyFilter;
  renderRollAndDossiers(Object.keys(state.roster).length === state.mode.slots.length);
});

document.getElementById('btnToggleAwards')?.addEventListener('click', () => {
  state.awardOnlyFilter = !state.awardOnlyFilter;
  renderRollAndDossiers(Object.keys(state.roster).length === state.mode.slots.length);
});

document.getElementById('sortSelect').addEventListener('change', e => {
  state.sortBy = e.target.value;
  renderRollAndDossiers(Object.keys(state.roster).length === state.mode.slots.length);
});

document.getElementById('lahmanFileInput').addEventListener('change', e => {
  handleLahmanFileUpload(e.target.files);
  e.target.value = '';
});

renderHome();
    if (state.view === 'draft') renderDraftRoom();
    showToast(`Loaded ${added.toLocaleString()} real historical player stints into the database.`);
  } catch (e) {
    showToast('Invalid JSON format. Check brackets and field names.');
  }
}

async function handleLahmanFileUpload(fileList) {
  if (!fileList || !fileList.length) return;
  const files = Array.from(fileList);
  const jsonFile = files.find(f => f.name.toLowerCase().endsWith('.json'));
  const replaceMode = document.getElementById('chkReplaceVault')?.checked;
  if (jsonFile) {
    try {
      const text = await jsonFile.text();
      const arr = JSON.parse(text);
      if (!Array.isArray(arr) || !arr.length) throw new Error('Empty JSON');
      const count = HISTORICAL_DB.loadRecords(arr, { replace: !!replaceMode, sourceLabel: 'Compiled Lahman Database', isCompiled: true });
      HISTORICAL_DB.saveToIndexedDb(Array.from(HISTORICAL_DB.players.values()), 'Compiled Lahman Database');
      document.getElementById('modalImport').classList.remove('open');
      renderHome();
      showToast(`Loaded ${count.toLocaleString()} historical stints from ${jsonFile.name}.`);
    } catch (_) {
      showToast('Could not parse JSON file.');
    }
    return;
  }

  const csvMap = {};
  for (const f of files) {
    const low = f.name.toLowerCase();
    if (low.includes('people') || low.includes('master')) csvMap.people = await f.text();
    else if (low.includes('batting') && !low.includes('post')) csvMap.batting = await f.text();
    else if (low.includes('pitching') && !low.includes('post')) csvMap.pitching = await f.text();
    else if (low.includes('fielding') && !low.includes('post')) csvMap.fielding = await f.text();
    else if (low.includes('awards')) csvMap.awards = await f.text();
    else if (low.includes('halloffame')) csvMap.hof = await f.text();
    else if (low.includes('allstar')) csvMap.allstar = await f.text();
    else if (low === 'teams.csv' || (low.includes('teams') && !low.includes('franch') && !low.includes('half'))) csvMap.teams = await f.text();
  }
  if (!csvMap.batting && !csvMap.pitching) {
    showToast('Select Lahman CSVs (People.csv, Batting.csv, Pitching.csv, Fielding.csv) or historical-players.json.');
    return;
  }
  const count = HISTORICAL_DB.ingestLahmanCsvBundle(csvMap, { replace: !!replaceMode });
  document.getElementById('modalImport').classList.remove('open');
  renderHome();
  showToast(`Indexed ${count.toLocaleString()} real MLB player-decade stints across ${HISTORICAL_DB.getSummary().totalPools} franchise-era pools!`);
}

/* ============================================================================
   EVENT WIRING & BOOT
   ============================================================================ */
document.getElementById('btnNewRun').addEventListener('click', () => {
  if (state.simTimer) { clearInterval(state.simTimer); state.simTimer = null; }
  renderHome();
  switchView('home');
});

document.getElementById('btnLaunchConfigured').addEventListener('click', () => {
  if (state.pendingModeId) startRun(state.pendingModeId, state.pendingLock);
});

document.getElementById('btnReroll').addEventListener('click', () => {
  if (state.rerollsLeft <= 0 || state.mode.id === 'IRONMAN') return;
  state.rerollsLeft -= 1;
  rollNextFranchiseEra(true);
});

document.querySelectorAll('#filterTabs .filter-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('#filterTabs .filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    state.activeFilter = tab.dataset.filter;
    renderRollAndDossiers(Object.keys(state.roster).length === state.mode.slots.length);
  });
});

document.getElementById('playerSearch').addEventListener('input', e => {
  state.searchQuery = e.target.value;
  renderRollAndDossiers(Object.keys(state.roster).length === state.mode.slots.length);
});

document.getElementById('btnStartSim').addEventListener('click', beginSeasonSimulation);
document.getElementById('btnSkipSim').addEventListener('click', finalizeSeasonView);
document.getElementById('btnPlayAgain').addEventListener('click', () => {
  renderHome();
  switchView('home');
});

document.getElementById('btnSound').addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  document.getElementById('btnSound').textContent = soundEnabled ? 'Sound: On' : 'Sound: Off';
});

document.getElementById('btnDynasty').addEventListener('click', openDynastyModal);
document.getElementById('closeDynasty').addEventListener('click', () => document.getElementById('modalDynasty').classList.remove('open'));
document.getElementById('modalDynasty').addEventListener('click', e => { if (e.target.id === 'modalDynasty') e.target.classList.remove('open'); });

document.getElementById('btnImport').addEventListener('click', () => document.getElementById('modalImport').classList.add('open'));
document.getElementById('closeImport').addEventListener('click', () => document.getElementById('modalImport').classList.remove('open'));
document.getElementById('modalImport').addEventListener('click', e => { if (e.target.id === 'modalImport') e.target.classList.remove('open'); });
document.getElementById('btnConfirmImport').addEventListener('click', handleVaultImport);

document.getElementById('btnDailySeed')?.addEventListener('click', () => {
  const daily = getTodaySeed();
  const inp = document.getElementById('seedInput');
  if (inp) inp.value = daily;
  startRun('QUICK', null, daily);
  showToast(`Daily Challenge started — Seed ${daily}`);
});

document.getElementById('btnCopySeed')?.addEventListener('click', () => {
  const seedText = state.seed || getTodaySeed();
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(seedText);
    } else {
      const ta = document.createElement('textarea');
      ta.value = seedText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    showToast(`Copied Run Seed: ${seedText}`);
  } catch (_) {
    showToast(`Run Seed: ${seedText}`);
  }
});

async function bootHistoricalVault() {
  let loadedCompiled = await HISTORICAL_DB.tryLoadCompiledDatabase('./data/compiled/historical-players.json');
  if (!loadedCompiled) {
    loadedCompiled = await HISTORICAL_DB.tryLoadFromIndexedDb();
  }
  if (!loadedCompiled && typeof SEED_HISTORICAL_PLAYERS !== 'undefined') {
    HISTORICAL_DB.loadRecords(SEED_HISTORICAL_PLAYERS, {
      replace: true,
      sourceLabel: 'Seed Historical Vault Active',
      isCompiled: false
    });
  }
  const seedInp = document.getElementById('seedInput');
  if (seedInp && !seedInp.value) seedInp.placeholder = `Daily: ${getTodaySeed()}`;
  renderHome();
}

bootHistoricalVault();

/* ============================================================================
   PWA SERVICE WORKER, INSTALL PROMPT & DYNASTY SAVE EXPORT / IMPORT
   ============================================================================ */
function exportDynastySave() {
  try {
    const payload = {
      app: 'diamond-draft',
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      dynasty: DYNASTY
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diamond-draft-save-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Dynasty save exported.');
  } catch (err) {
    showToast('Could not export Dynasty save.');
  }
}

async function importDynastySaveFile(file) {
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const incoming = (parsed && parsed.app === 'diamond-draft' && parsed.dynasty && typeof parsed.dynasty === 'object')
      ? parsed.dynasty
      : null;
    if (!incoming || typeof incoming.runs !== 'number' || !Array.isArray(incoming.trophies)) {
      showToast('Invalid Diamond Draft save file — existing Dynasty untouched.');
      return;
    }
    if (DYNASTY.runs > 0) {
      try { localStorage.setItem('diamond_draft_dynasty_v2_backup', JSON.stringify(DYNASTY)); } catch (_) {}
    }
    if (!Array.isArray(incoming.stories)) incoming.stories = [];
    if (!Array.isArray(incoming.sacrifices)) incoming.sacrifices = [];
    if (!Array.isArray(incoming.history)) incoming.history = [];
    DYNASTY = incoming;
    saveDynasty(DYNASTY);
    openDynastyModal();
    showToast(`Dynasty save restored (${DYNASTY.runs} runs).`);
  } catch (_) {
    showToast('Invalid JSON file — existing Dynasty untouched.');
  }
}

let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredInstallPrompt = e;
  const btn = document.getElementById('btnInstallApp');
  if (btn) btn.style.display = 'inline-flex';
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  const btn = document.getElementById('btnInstallApp');
  if (btn) btn.style.display = 'none';
  showToast('Diamond Draft installed.');
});

window.addEventListener('DOMContentLoaded', () => {
  const expBtn = document.getElementById('btnExportSave');
  const impBtn = document.getElementById('btnImportSave');
  const impInp = document.getElementById('importSaveInput');
  const instBtn = document.getElementById('btnInstallApp');
  if (expBtn) expBtn.addEventListener('click', exportDynastySave);
  if (impBtn && impInp) {
    impBtn.addEventListener('click', () => impInp.click());
    impInp.addEventListener('change', e => {
      const f = e.target.files && e.target.files[0];
      if (f) importDynastySaveFile(f);
      impInp.value = '';
    });
  }
  if (instBtn) {
    instBtn.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      try { await deferredInstallPrompt.userChoice; } catch (_) {}
      deferredInstallPrompt = null;
      instBtn.style.display = 'none';
    });
  }
});

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
