/* ============================================================================
   PRIORITY 7: DETERMINISTIC SEEDED PRNG (Mulberry32)
   Powers Daily Challenge, Community Seeds, Shareable Runs & Reproducible Sims
   ============================================================================ */
function hashSeedString(str) {
  let h = 2166136261 >>> 0;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function createSeededRng(seedStr) {
  let a = hashSeedString(seedStr) || 1;
  return function nextRand() {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getTodaySeed() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

function generateRandomSeed() {
  return String(Math.floor(10000000 + Math.random() * 89999999));
}

/* ============================================================================
   PHASE 2 & 5: GAME MODES & ROSTER SCHEMAS
   ============================================================================ */

const QUICK_SLOTS = [
  { id: 'OF1', label: 'OF', accept: ['OF'], area: 'field', x: 30, y: 31 },
  { id: 'OF2', label: 'OF', accept: ['OF'], area: 'field', x: 70, y: 31 },
  { id: 'IF1', label: 'IF', accept: ['IF'], area: 'field', x: 34, y: 58 },
  { id: 'IF2', label: 'IF', accept: ['IF'], area: 'field', x: 66, y: 58 },
  { id: 'SP1', label: 'SP', accept: ['SP'], area: 'field', x: 50, y: 66 },
  { id: 'DH',  label: 'DH', accept: ['DH','OF','IF'], area: 'dugout' },
  { id: 'RP1', label: 'RP', accept: ['RP'], area: 'dugout' }
];

const FULL_SLOTS = [
  { id: 'LF',  label: 'LF', accept: ['LF','OF'], area: 'field', x: 24, y: 34 },
  { id: 'CF',  label: 'CF', accept: ['CF','OF'], area: 'field', x: 50, y: 21 },
  { id: 'RF',  label: 'RF', accept: ['RF','OF'], area: 'field', x: 76, y: 34 },
  { id: '3B',  label: '3B', accept: ['3B','IF'], area: 'field', x: 32, y: 61 },
  { id: 'SS',  label: 'SS', accept: ['SS','IF'], area: 'field', x: 40, y: 49 },
  { id: '2B',  label: '2B', accept: ['2B','IF'], area: 'field', x: 60, y: 49 },
  { id: '1B',  label: '1B', accept: ['1B','IF'], area: 'field', x: 68, y: 61 },
  { id: 'C',   label: 'C',  accept: ['C'],       area: 'field', x: 50, y: 86 },
  { id: 'SP1', label: 'SP1', accept: ['SP'],     area: 'field', x: 50, y: 66, rot: 0 },
  { id: 'SP2', label: 'SP2', accept: ['SP'],     area: 'field', x: 50, y: 66, rot: 1 },
  { id: 'SP3', label: 'SP3', accept: ['SP'],     area: 'field', x: 50, y: 66, rot: 2 },
  { id: 'DH',  label: 'DH',  accept: ['DH','OF','IF'], area: 'dugout' },
  { id: 'RP1', label: 'RP1', accept: ['RP'],     area: 'dugout' },
  { id: 'RP2', label: 'RP2', accept: ['RP'],     area: 'dugout' },
  { id: 'RP3', label: 'RP3', accept: ['RP'],     area: 'dugout' }
];

const GAME_MODES = [
  { id: 'QUICK', name: 'Quick Draft', tag: 'Flagship', flagship: true, slots: QUICK_SLOTS, rerolls: 2, pace: '10–15 min', desc: '7-player roster built for fast, agonizing tradeoffs. 2 OF, 2 IF, 1 SP on the field; DH and RP in the dugout & bullpen.' },
  { id: 'FULL', name: 'Full Team', tag: '15 Slots', flagship: false, slots: FULL_SLOTS, rerolls: 3, pace: '25–35 min', desc: 'Complete 9-man defensive diamond, 3-man starting rotation, DH, and 3-arm bullpen. True positional scarcity.' },
  { id: 'HOF', name: 'Hall of Fame', tag: 'Pure Legends', flagship: false, slots: QUICK_SLOTS, rerolls: 1, pace: '8–12 min', desc: 'Only verified Cooperstown Hall of Famers appear in the scouting room. Peak vs. chemistry among immortals.' },
  { id: 'FRANCHISE', name: 'Franchise Mode', tag: '1 Club', flagship: false, slots: QUICK_SLOTS, rerolls: 2, pace: '10–15 min', needsConfig: 'franchise', desc: 'Lock one franchise and roll across its historical decades. Build an all-time single-club juggernaut.' },
  { id: 'DECADE', name: 'Decade Mode', tag: '1 Era', flagship: false, slots: QUICK_SLOTS, rerolls: 2, pace: '10–15 min', needsConfig: 'decade', desc: 'Lock a single decade and draft across rival clubs from that era.' },
  { id: 'BLIND', name: 'Blind Draft', tag: 'No Stats', flagship: false, slots: QUICK_SLOTS, rerolls: 1, pace: '10–12 min', blind: true, desc: 'All statistical production is masked. Rely strictly on player names, franchises, years active, and period awards.' },
  { id: 'IRONMAN', name: 'Ironman Mode', tag: '0 Rerolls', flagship: false, slots: QUICK_SLOTS, rerolls: 0, pace: '10–15 min', desc: 'No skips. No rerolls. Draft from every single Franchise + Era roll the vault hands you.' }
];

/* ============================================================================
   WEB AUDIO SYNTHESIZED SFX (Sandbox-safe, user-gesture initialized)
   ============================================================================ */
let soundEnabled = true;
let audioCtx = null;

function playTone(freq, dur = 0.08, type = 'triangle', vol = 0.06) {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
  } catch (_) {}
}

function sfxRoll() { playTone(260, 0.06, 'sine', 0.05); setTimeout(() => playTone(390, 0.09, 'triangle', 0.06), 60); }
function sfxDraft() { playTone(330, 0.07, 'triangle', 0.06); setTimeout(() => playTone(494, 0.12, 'triangle', 0.07), 70); }
function sfxWin() { playTone(440, 0.1, 'triangle', 0.06); setTimeout(() => playTone(554, 0.1, 'triangle', 0.06), 90); setTimeout(() => playTone(659, 0.2, 'triangle', 0.07), 180); }

/* ============================================================================
   DYNASTY PERSISTENCE (try/catch localStorage)
   ============================================================================ */
const TROPHIES = [
  { id: 'first_run', name: 'Vault Opened', desc: 'Complete your first 162-game Diamond Draft run.' },
  { id: 'centurion', name: 'Centurion', desc: 'Finish a 162-game season with 100 or more wins.' },
  { id: 'historic', name: 'History Maker', desc: 'Surpass the 116-win MLB record (117+ wins).' },
  { id: 'dream_team', name: 'Dream Team', desc: 'Reach 125 or more wins in a single season.' },
  { id: 'october_champ', name: 'October Dynasty', desc: 'Win the World Series.' },
  { id: 'clubhouse', name: 'Clubhouse Core', desc: 'Build a roster with real-life teammate chemistry.' },
  { id: 'blind_genius', name: 'Blind Genius', desc: 'Win 95+ games in Blind Draft mode.' },
  { id: 'iron_will', name: 'Iron Will', desc: 'Win 95+ games in Ironman Mode.' },
  { id: 'story_weaver', name: 'Baseball Storyteller', desc: 'Complete a Legendary Named Story during a draft run.' },
  { id: 'story_over_star', name: 'Story Over Star', desc: 'Pass on a Hall of Famer to complete a Named Story.' },
  { id: 'impossible_goodbye', name: 'The Impossible Goodbye', desc: 'Seal an Impossible Sacrifice in the Roads Not Taken Hall.' },
  { id: 'perfect_162', name: 'The Impossible 162–0', desc: 'Go undefeated across an entire 162-game season.' }
];

const INNER_CIRCLE_ICONS = new Set([
  'Babe Ruth', 'Lou Gehrig', 'Ken Griffey Jr.', 'Honus Wagner', 'Stan Musial',
  'Rogers Hornsby', 'Roberto Clemente', 'Greg Maddux', 'Pedro Martinez',
  'Randy Johnson', 'Mariano Rivera', 'Clayton Kershaw', 'Shohei Ohtani',
  'Mike Schmidt', 'Jackie Robinson', 'Aaron Judge', 'Johnny Bench',
  'Joe Morgan', 'Ted Williams', 'Sandy Koufax', 'Bob Gibson', 'Rickey Henderson'
]);

const SACRIFICE_TIERS = {
  IMPOSSIBLE: { rank: 1, label: 'Impossible Sacrifice', cls: 'sac-impossible' },
  LEGENDARY:  { rank: 2, label: 'Legendary Sacrifice',  cls: 'sac-legendary' },
  HISTORIC:   { rank: 3, label: 'Historic Sacrifice',   cls: 'sac-historic' },
  MINOR:      { rank: 4, label: 'Minor Sacrifice',      cls: 'sac-minor' }
};

function classifySacrifice(draftedPlayer, passedPlayers, completedStories, franchiseId, franchiseName, decade) {
  if (!passedPlayers || passedPlayers.length === 0) return null;
  const topPassed = passedPlayers[0];
  const passedImpact = topPassed.type === 'H' ? hiddenHitterImpact(topPassed) : hiddenPitcherImpact(topPassed);
  const draftedImpact = draftedPlayer.type === 'H' ? hiddenHitterImpact(draftedPlayer) : hiddenPitcherImpact(draftedPlayer);
  const isInnerCircle = INNER_CIRCLE_ICONS.has(topPassed.name) || passedImpact >= 125;
  const hasMajorAward = (topPassed.awards || []).some(a => /MVP|Cy Young|World Series/i.test(a));
  const completedStory = (completedStories && completedStories.length > 0) ? completedStories[0] : null;
  const storyOverStar = !!(completedStory && (topPassed.hof || isInnerCircle) && (!draftedPlayer.hof || passedImpact > draftedImpact));

  let tier = 'MINOR';
  if (isInnerCircle && (passedImpact >= draftedImpact - 8 || storyOverStar)) {
    tier = 'IMPOSSIBLE';
  } else if (topPassed.hof) {
    tier = 'LEGENDARY';
  } else if (hasMajorAward || passedImpact >= 95) {
    tier = 'HISTORIC';
  }

  const painScore = Math.round((passedImpact + (topPassed.hof ? 18 : 0) + (isInnerCircle ? 24 : 0) + (storyOverStar ? 20 : 0)) * 10) / 10;
  const todayStr = new Date().toISOString().slice(0, 10);
  return {
    id: `${topPassed.name}__${draftedPlayer.name}__${franchiseId}__${decade}`,
    passedPlayer: topPassed.name,
    passedPos: topPassed.pos,
    passedHof: !!topPassed.hof,
    draftedPlayer: draftedPlayer.name,
    draftedPos: draftedPlayer.pos,
    draftedHof: !!draftedPlayer.hof,
    storyCompleted: completedStory ? completedStory.name : null,
    storyTier: completedStory ? completedStory.tier : null,
    storyOverStar,
    franchiseId,
    franchiseName,
    decade,
    tier,
    tierMeta: SACRIFICE_TIERS[tier],
    painScore,
    dateAchieved: todayStr
  };
}

function loadDynasty() {
  try {
    const raw = localStorage.getItem('diamond_draft_dynasty_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed.stories)) parsed.stories = [];
      if (!Array.isArray(parsed.sacrifices)) parsed.sacrifices = [];
      return parsed;
    }
  } catch (_) {}
  return { bestWins: 0, bestLosses: 162, runs: 0, titles: 0, trophies: [], stories: [], sacrifices: [], history: [] };
}

function saveDynasty(d) {
  try { localStorage.setItem('diamond_draft_dynasty_v2', JSON.stringify(d)); } catch (_) {}
}

let DYNASTY = loadDynasty();

/* ============================================================================
   RUN STATE & DRAFT ENGINE
   ============================================================================ */
let state = {
  view: 'home',
  pendingModeId: null,
  pendingLock: null,
  mode: null,
  lockValue: null,
  roster: {},          // slotId -> player
  draftedKeys: new Set(),
  usedPools: new Set(),  // `${franchiseId}__${decade}` permanently removed once drafted from
  draftHistory: [],      // Priority 4: { pickNumber, slotId, franchiseId, franchiseName, decade, draftedPlayer, passedPlayers }
  seed: '',
  rng: null,
  rerollsLeft: 0,
  currentRoll: null,   // { franchiseId, decade, players }
  activeFilter: 'ALL',
  hofOnlyFilter: false,
  awardOnlyFilter: false,
  sortBy: 'ALPHA_ASC',
  searchQuery: '',
  selectedPlayerId: null,
  activeRotIndex: 0,   // for Full Team SP1/SP2/SP3 toggle
  simResult: null,
  simTimer: null
};

function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2600);
}

function setTeamAccent(franchiseId) {
  const f = FRANCHISES[franchiseId] || FRANCHISES.BOS;
  document.documentElement.style.setProperty('--team-primary', f.primary);
  document.documentElement.style.setProperty('--team-secondary', f.secondary);
}

function switchView(name) {
  state.view = name;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  if (name === 'home') document.getElementById('viewHome').classList.add('active');
  if (name === 'draft') document.getElementById('viewDraft').classList.add('active');
  if (name === 'sim') document.getElementById('viewSim').classList.add('active');
  updateTopPill();
}

function updateTopPill() {
  const pill = document.getElementById('runStatusPill');
  const text = document.getElementById('runStatusText');
  if (!state.mode || state.view === 'home') {
    pill.style.display = 'none';
    return;
  }
  const filled = Object.keys(state.roster).length;
  const total = state.mode.slots.length;
  pill.style.display = 'inline-flex';
  if (state.view === 'sim') {
    text.textContent = `${state.mode.name} · Sim · Seed ${state.seed}`;
  } else {
    text.textContent = `${state.mode.name} · ${filled}/${total} · Seed ${state.seed}`;
  }
}

function getOpenSlotsForPlayer(player) {
  if (!state.mode || !player) return [];
  return state.mode.slots.filter(slot => {
    if (state.roster[slot.id]) return false;
    return player.elig.some(e => slot.accept.includes(e));
  });
}

function getMissingSlotTypes() {
  const open = state.mode.slots.filter(s => !state.roster[s.id]);
  const accepts = new Set();
  open.forEach(s => s.accept.forEach(a => accepts.add(a)));
  return accepts;
}

function getPoolKey(pool) {
  return `${pool.franchiseId}__${pool.decade}`;
}

function getUnusedPoolsForRun() {
  const allPools = HISTORICAL_DB.getAvailablePools(state.mode.id, state.lockValue);
  return allPools.filter(pool => !state.usedPools.has(getPoolKey(pool)));
}

function rollNextFranchiseEra(avoidCurrentKey = false) {
  const allPools = HISTORICAL_DB.getAvailablePools(state.mode.id, state.lockValue);
  // Priority 2: Permanently exclude every retired Franchise + Era pool in this run
  let unusedPools = allPools.filter(pool => !state.usedPools.has(getPoolKey(pool)));

  if (unusedPools.length === 0) {
    if (HISTORICAL_DB.isCompiled) {
      // Never recycle retired pools when the compiled Lahman database is active
      showToast('No unused Franchise + Era pools remain for this filter.');
      state.currentRoll = null;
      renderDraftRoom();
      return;
    }
    // Seed-archive-only safeguard for 15-slot / locked-filter runs before Lahman import
    unusedPools = allPools;
    showToast('Seed archive exhausted unique pools — compile or import Lahman DB for 300+ unique chapters.');
  }

  const missingAccepts = getMissingSlotTypes();
  let viable = unusedPools.filter(pool =>
    pool.players.some(p => !state.draftedKeys.has(p.playerKey) && p.elig.some(e => missingAccepts.has(e)))
  );
  if (viable.length === 0) viable = unusedPools;

  if (avoidCurrentKey && viable.length > 1 && state.currentRoll) {
    const curKey = getPoolKey(state.currentRoll);
    const diff = viable.filter(v => getPoolKey(v) !== curKey);
    if (diff.length > 0) viable = diff;
  }

  // Milestone #1: Balanced Power-Law Hybrid Weighting (Decade + Franchise Diversity + Within-Run Anti-Repeat)
  // Scales smoothly across both the 43-pool Seed Vault and 300-pool Compiled Lahman DB
  const recentFranchises = new Set(state.draftHistory.slice(-4).map(h => h.franchiseId));
  const recentDecades = new Set(state.draftHistory.slice(-3).map(h => h.decade));
  const decadePoolCounts = {};
  const franchisePoolCounts = {};
  for (const pool of viable) {
    decadePoolCounts[pool.decade] = (decadePoolCounts[pool.decade] || 0) + 1;
    franchisePoolCounts[pool.franchiseId] = (franchisePoolCounts[pool.franchiseId] || 0) + 1;
  }
  const weights = viable.map(pool => {
    const decWeight = Math.pow(decadePoolCounts[pool.decade] || 1, -0.55);
    const frWeight = Math.pow(franchisePoolCounts[pool.franchiseId] || 1, -0.40);
    let w = decWeight * frWeight;
    if (recentFranchises.has(pool.franchiseId)) w *= 0.35;
    if (recentDecades.has(pool.decade)) w *= 0.55;
    return w;
  });
  const totalW = weights.reduce((a, b) => a + b, 0);
  let rVal = (state.rng ? state.rng() : 0.5) * totalW;
  let picked = viable[viable.length - 1];
  for (let i = 0; i < viable.length; i++) {
    rVal -= weights[i];
    if (rVal <= 0) { picked = viable[i]; break; }
  }
  state.currentRoll = picked;
  state.selectedPlayerId = null;
  state.searchQuery = '';
  const searchEl = document.getElementById('playerSearch');
  if (searchEl) searchEl.value = '';
  const listEl = document.getElementById('dossierList');
  if (listEl) listEl.scrollTop = 0;
  setTeamAccent(picked.franchiseId);
  sfxRoll();
  renderDraftRoom();
}

function startRun(modeId, lockValue = null, customSeed = null) {
  if (state.simTimer) { clearInterval(state.simTimer); state.simTimer = null; }
  const mode = GAME_MODES.find(m => m.id === modeId) || GAME_MODES[0];
  const inputSeed = document.getElementById('seedInput')?.value?.trim();
  const seed = String(customSeed || inputSeed || generateRandomSeed());
  state.mode = mode;
  state.lockValue = lockValue;
  state.seed = seed;
  state.rng = createSeededRng(`${mode.id}:${lockValue || 'ALL'}:${seed}`);
  state.roster = {};
  state.draftedKeys = new Set();
  state.usedPools = new Set();
  state.draftHistory = [];
  state.rerollsLeft = mode.rerolls;
  state.activeFilter = 'ALL';
  state.hofOnlyFilter = false;
  state.awardOnlyFilter = false;
  state.activeRotIndex = 0;
  state.simResult = null;
  document.querySelectorAll('#filterTabs .filter-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.filter === 'ALL');
  });
  switchView('draft');
  rollNextFranchiseEra(false);
}

/* ============================================================================
   CHEMISTRY CALCULATION (Shared Franchises, Eras, Real Teammates, Title Cores)
   ============================================================================ */
function computeChemistry(rosterList) {
  const tags = [];
  let chemPoints = 0;
  const frCounts = {};
  const decCounts = {};
  let teammatePairs = 0;
  let lineagePairs = 0;
  let titleCorePairs = 0;
  let wsChampions = 0;

  for (const p of rosterList) {
    frCounts[p.franchiseId] = (frCounts[p.franchiseId] || 0) + 1;
    decCounts[p.decade] = (decCounts[p.decade] || 0) + 1;
    if (p.acc && p.acc.ws > 0) wsChampions++;
  }

  for (let i = 0; i < rosterList.length; i++) {
    for (let j = i + 1; j < rosterList.length; j++) {
      const a = rosterList[i];
      const b = rosterList[j];
      if (a.franchiseId === b.franchiseId) {
        const overlap = Math.min(a.endYr, b.endYr) >= Math.max(a.startYr, b.startYr);
        if (overlap) {
          teammatePairs++;
          chemPoints += 1.4;
        } else {
          lineagePairs++;
          chemPoints += 2.2;
        }
        if (a.acc.ws > 0 && b.acc.ws > 0) {
          titleCorePairs++;
          chemPoints += 1.0;
        }
      }
    }
  }

  // Primary drivers under one-time Franchise + Era rules: Shared Franchise / Organization & Shared Era
  for (const [fId, cnt] of Object.entries(frCounts)) {
    if (cnt >= 2) {
      chemPoints += (cnt - 1) * 2.4;
      tags.push(`Shared Franchise · ${FRANCHISES[fId]?.abbr || fId} ×${cnt}`);
    }
  }
  for (const [dec, cnt] of Object.entries(decCounts)) {
    if (cnt >= 2) {
      chemPoints += (cnt - 1) * 1.5;
      tags.push(`Shared Era · ${dec} ×${cnt}`);
    }
  }
  if (lineagePairs > 0) tags.unshift(`Cross-Decade Lineage ×${lineagePairs}`);
  if (wsChampions >= 3) {
    chemPoints += 1.8;
    tags.push(`Championship Pedigree ×${wsChampions}`);
  }
  if (teammatePairs > 0) tags.push(`Real Teammates ×${teammatePairs}`);

  // Narrative-First Named Stories (Legendary / Franchise / Baseball)
  const storyEval = (typeof evaluateNamedStories === 'function')
    ? evaluateNamedStories(rosterList)
    : { completed: [], potential: [], completedIds: new Set() };
  let storyClutchBonus = 0;
  for (const st of storyEval.completed) {
    chemPoints += st.tierMeta.chemBonus;
    storyClutchBonus += st.tierMeta.clutchBonus;
    tags.unshift(`★ ${st.name}`);
  }

  return {
    chemPoints: Math.min(28, chemPoints),
    storyClutchBonus: Math.min(0.14, storyClutchBonus),
    completedStories: storyEval.completed,
    potentialStories: storyEval.potential,
    tags,
    teammatePairs,
    lineagePairs,
    titleCorePairs,
    wsChampions
  };
}

function previewChemistryWith(candidate) {
  const current = Object.values(state.roster);
  const links = [];
  for (const p of current) {
    if (p.franchiseId === candidate.franchiseId) {
      const overlap = Math.min(p.endYr, candidate.endYr) >= Math.max(p.startYr, candidate.startYr);
      if (overlap) {
        links.push(`Teammate overlap with ${p.name} (${p.franchiseId})`);
      } else {
        links.push(`Cross-Decade ${FRANCHISES[p.franchiseId]?.name || p.franchiseId} lineage with ${p.name}`);
      }
    } else if (p.decade === candidate.decade) {
      links.push(`Shared ${p.decade} era with ${p.name} (${p.franchiseId})`);
    }
  }
  return links.slice(0, 4);
}

/* ============================================================================
   PHASE 3: HIDDEN SIMULATION ENGINE (Calibrated for Variance & Rare 162-0)
   Internal math only — NEVER displayed as OVR/Score in UI
   ============================================================================ */
/* Era run-environment baselines (1890s Dead-Ball through 2020s Modern) so every decade compares fairly */
const ERA_BASELINES = {
  '1890s': { avg: 0.278, obp: 0.345, ops: 0.720, hr: 5,  era: 4.10, whip: 1.42 },
  '1900s': { avg: 0.252, obp: 0.312, ops: 0.640, hr: 3,  era: 2.85, whip: 1.18 },
  '1910s': { avg: 0.255, obp: 0.320, ops: 0.655, hr: 4,  era: 2.95, whip: 1.21 },
  '1920s': { avg: 0.285, obp: 0.348, ops: 0.755, hr: 9,  era: 4.05, whip: 1.38 },
  '1930s': { avg: 0.282, obp: 0.348, ops: 0.760, hr: 11, era: 4.25, whip: 1.40 },
  '1940s': { avg: 0.262, obp: 0.334, ops: 0.715, hr: 10, era: 3.75, whip: 1.35 },
  '1950s': { avg: 0.260, obp: 0.332, ops: 0.730, hr: 14, era: 3.95, whip: 1.34 },
  '1960s': { avg: 0.250, obp: 0.316, ops: 0.695, hr: 13, era: 3.45, whip: 1.24 },
  '1970s': { avg: 0.258, obp: 0.325, ops: 0.715, hr: 12, era: 3.65, whip: 1.30 },
  '1980s': { avg: 0.260, obp: 0.325, ops: 0.725, hr: 13, era: 3.85, whip: 1.31 },
  '1990s': { avg: 0.266, obp: 0.335, ops: 0.755, hr: 15, era: 4.25, whip: 1.37 },
  '2000s': { avg: 0.266, obp: 0.334, ops: 0.760, hr: 16, era: 4.30, whip: 1.36 },
  '2010s': { avg: 0.254, obp: 0.320, ops: 0.730, hr: 16, era: 4.00, whip: 1.29 },
  '2020s': { avg: 0.246, obp: 0.316, ops: 0.722, hr: 17, era: 4.10, whip: 1.28 }
};

function hiddenHitterImpact(p) {
  const s = p.stats;
  const base = ERA_BASELINES[p.decade] || ERA_BASELINES['2000s'];
  const avgTerm = (s.avg - base.avg) * 140;
  const obpTerm = (s.obp - base.obp) * 170;
  const opsTerm = (s.ops - base.ops) * 95;
  const powTerm = (s.hr - base.hr) * 0.48 + (s.rbi - 62) * 0.14;
  const defTerm = p.acc.gg * 1.8 + (['SS','CF','C'].includes(p.pos) ? 2.4 : 0);
  const leadTerm = p.acc.mvp * 4.5 + p.acc.asg * 0.85 + p.acc.ws * 1.4 + (p.hof ? 2.0 : 0);
  const lonTerm = Math.min(p.seasons, 12) * 0.35;
  return 50 + avgTerm + obpTerm + opsTerm + powTerm + defTerm + leadTerm + lonTerm;
}

function hiddenPitcherImpact(p) {
  const s = p.stats;
  const base = ERA_BASELINES[p.decade] || ERA_BASELINES['2000s'];
  const eraTerm = (base.era - s.era) * 18.5;
  const whipTerm = (base.whip - s.whip) * 42;
  const kTerm = p.pos.includes('SP') ? (s.k - 125) * 0.11 : (s.k - 50) * 0.22;
  const svTerm = p.pos.includes('RP') ? Math.min(s.sv, 45) * 0.34 : 0;
  const leadTerm = p.acc.cy * 6.0 + p.acc.mvp * 4.5 + p.acc.asg * 0.9 + p.acc.gg * 1.1 + p.acc.ws * 1.4 + (p.hof ? 2.0 : 0);
  const lonTerm = Math.min(p.seasons, 12) * 0.32;
  return 50 + eraTerm + whipTerm + kTerm + svTerm + leadTerm + lonTerm;
}

function simulateFullSeason(rosterMap, simSeed = null) {
  const simRng = createSeededRng(`SIM:${simSeed || state.seed || 'default'}:${Object.values(rosterMap).map(p => p.playerId).sort().join('|')}`);
  const players = Object.values(rosterMap);
  const hitters = players.filter(p => p.type === 'H');
  const sps = players.filter(p => p.type === 'P' && (p.pos.includes('SP') || Object.entries(rosterMap).some(([k,v]) => v === p && k.startsWith('SP'))));
  const rps = players.filter(p => p.type === 'P' && !sps.includes(p));

  const avgHit = hitters.length ? hitters.reduce((a, p) => a + hiddenHitterImpact(p), 0) / hitters.length : 45;
  const avgSp = sps.length ? sps.reduce((a, p) => a + hiddenPitcherImpact(p), 0) / sps.length : 45;
  const avgRp = rps.length ? rps.reduce((a, p) => a + hiddenPitcherImpact(p), 0) / rps.length : 45;
  const chem = computeChemistry(players);

  // Composite hidden team strength centered around ~58 (average) to ~98 (dream team)
  const rawPower = avgHit * 0.46 + avgSp * 0.34 + avgRp * 0.20 + chem.chemPoints * 0.55;

  // Map rawPower to realistic per-game true win probability via smooth logistic curve
  // Calibrated targets:
  // Weak (~44): 0.44 -> ~71 W (60-80)
  // Average (~56): 0.54 -> ~87 W (80-95)
  // Great (~66): 0.62 -> ~100 W (95-105)
  // Elite (~75): 0.68 -> ~110 W (105-115)
  // Historic (~84): 0.74 -> ~120 W (115-125)
  // Dream (~95+): 0.80–0.84 -> ~130–136 W (125-140)
  // 162-0 requires beating the odds 162 straight times — astronomically rare!
  const z = (rawPower - 51) / 26;
  const baseWinProb = Math.min(0.855, Math.max(0.36, 1 / (1 + Math.exp(-z))));

  // Simulate 6 monthly blocks totaling 162 games with streak/slump variance
  const monthDefs = [
    { name: 'April', games: 26 },
    { name: 'May', games: 28 },
    { name: 'June', games: 27 },
    { name: 'July', games: 26 },
    { name: 'August', games: 28 },
    { name: 'September', games: 27 }
  ];

  let totalW = 0, totalL = 0;
  let curStreak = 0, maxWinStreak = 0, curLossStreak = 0, maxLossStreak = 0;
  const months = [];

  for (const m of monthDefs) {
    // Monthly variance shock (hot stretch or slump)
    const monthShock = (simRng() - 0.5) * 0.10;
    let mW = 0, mL = 0;
    for (let g = 0; g < m.games; g++) {
      // Small momentum factor + opponent strength draw
      const oppNoise = (simRng() - 0.5) * 0.14;
      const momentum = curStreak >= 4 ? 0.015 : (curLossStreak >= 3 ? -0.015 : 0);
      const pWin = Math.min(0.95, Math.max(0.18, baseWinProb + monthShock + oppNoise + momentum));
      if (simRng() < pWin) {
        mW++; totalW++;
        curStreak++; curLossStreak = 0;
        if (curStreak > maxWinStreak) maxWinStreak = curStreak;
      } else {
        mL++; totalL++;
        curLossStreak++; curStreak = 0;
        if (curLossStreak > maxLossStreak) maxLossStreak = curLossStreak;
      }
    }
    let note = 'Steady pace';
    if (mW / m.games >= 0.78) note = 'Blistering hot streak';
    else if (mW / m.games >= 0.65) note = 'Dominant month';
    else if (mW / m.games <= 0.42) note = 'Brutal slump';
    months.push({ name: m.name, w: mW, l: mL, cumW: totalW, cumL: totalL, note });
  }

  // Determine win tier
  let tier = 'Weak Team';
  if (totalW === 162) tier = 'The Impossible 162–0';
  else if (totalW >= 125) tier = 'Dream Team';
  else if (totalW >= 115) tier = 'Historic Team';
  else if (totalW >= 105) tier = 'Elite Team';
  else if (totalW >= 95) tier = 'Great Team';
  else if (totalW >= 80) tier = 'Average Team';

  // Postseason Simulation (October variance is real — even 117-win clubs can fall!)
  const madePlayoffs = totalW >= 88;
  const series = [];
  let octoberOutcome = 'Missed Postseason';
  let wonWorldSeries = false;

  if (madePlayoffs) {
    const rounds = [
      { name: 'Division Series (Bo5)', need: 3, opp: 0.56 },
      { name: 'Championship Series (Bo7)', need: 4, opp: 0.60 },
      { name: 'World Series (Bo7)', need: 4, opp: 0.63 }
    ];
    let alive = true;
    for (const r of rounds) {
      if (!alive) break;
      // Log5 style series matchup with October variance
      const teamP = Math.min(0.76, baseWinProb);
      const gameProb = (teamP * (1 - r.opp)) / (teamP * (1 - r.opp) + r.opp * (1 - teamP));
      let w = 0, l = 0;
      while (w < r.need && l < r.need) {
        if (simRng() < gameProb) w++; else l++;
      }
      const won = w === r.need;
      series.push({ round: r.name, result: won ? `Won ${w}–${l}` : `Lost ${w}–${l}`, won });
      if (!won) {
        alive = false;
        octoberOutcome = `Eliminated in ${r.name.split(' (')[0]}`;
      }
    }
    if (alive) {
      wonWorldSeries = true;
      octoberOutcome = 'World Series Champions';
    }
  }

  // Pick Team MVP & Cy Young from drafted roster
  const sortedHitters = [...hitters].sort((a, b) => (hiddenHitterImpact(b) + simRng()*8) - (hiddenHitterImpact(a) + simRng()*8));
  const sortedPitchers = [...sps, ...rps].sort((a, b) => (hiddenPitcherImpact(b) + simRng()*8) - (hiddenPitcherImpact(a) + simRng()*8));
  const mvp = sortedHitters[0] || players[0];
  const cy = sortedPitchers[0] || players[players.length - 1];

  const mvpAvg = Math.min(.388, Math.max(.225, (mvp.stats.avg || .275) + (simRng() - 0.45) * 0.032)).toFixed(3).replace(/^0/, '');
  const mvpHr = Math.max(4, Math.round((mvp.stats.hr || 18) * (0.9 + simRng() * 0.35)));
  const mvpRbi = Math.max(35, Math.round((mvp.stats.rbi || 75) * (0.9 + simRng() * 0.32)));

  const cyEra = Math.max(1.38, (cy.stats.era || 3.40) + (simRng() - 0.52) * 0.55).toFixed(2);
  const cyIsSp = cy.pos.includes('SP');
  const cyLine = cyIsSp
    ? `${Math.max(10, Math.round(totalW * 0.18 + simRng()*4))}–${Math.max(1, Math.round(totalL * 0.14))} · ${cyEra} ERA · ${Math.round((cy.stats.k || 160) * (0.95 + simRng()*0.2))} K`
    : `${cyEra} ERA · ${Math.max(24, Math.round((cy.stats.sv || 32) * (0.95 + simRng()*0.3)))} SV · ${Math.round((cy.stats.k || 65) * 1.05)} K`;

  const bestMonth = [...months].sort((a, b) => (b.w / (b.w + b.l)) - (a.w / (a.w + a.l)))[0];

  return {
    wins: totalW,
    losses: totalL,
    tier,
    months,
    maxWinStreak,
    maxLossStreak,
    bestMonth,
    madePlayoffs,
    series,
    octoberOutcome,
    wonWorldSeries,
    mvp,
    mvpLine: `${mvpAvg} AVG · ${mvpHr} HR · ${mvpRbi} RBI`,
    cy,
    cyLine,
    chem
  };
}
