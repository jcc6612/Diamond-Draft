/* ============================================================================
   DIAMOND DRAFT V2 — SCALABLE HISTORICAL PLAYER DATABASE & FRANCHISE-ERA INDEX
   Replaces manually maintained RAW_VAULT arrays with:
     1. Normalized Historical Player Table (Map<playerId, HistoricalPlayerRecord>)
     2. Franchise-Era Index (Map<"franchID__decade", { franchiseId, decade, playerIds, counts }>)
     3. Dynamic Pool Generator (returns EVERY qualifying player — zero curation/trimming)
     4. In-Browser Compiled JSON + Official SABR Lahman CSV Importer
   ============================================================================ */

class HistoricalDatabase {
  constructor() {
    this.players = new Map();            // playerId -> HistoricalPlayerRecord
    this.franchiseEraIndex = new Map();  // `${franchiseId}__${decade}` -> IndexEntry
    this.sourceLabel = 'Seed Historical Vault Active';
    this.isCompiled = false;
  }

  clear() {
    this.players.clear();
    this.franchiseEraIndex.clear();
  }

  /**
   * Insert or update a single normalized HistoricalPlayerRecord.
   */
  upsertPlayer(rec) {
    const f = resolveFranchise(rec.franchiseId);
    const franchiseId = f.id;
    const playerKey = rec.playerKey || rec.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const playerId = rec.playerId || `${franchiseId}-${rec.decade}-${playerKey}`;
    const startYear = Number(rec.startYear || rec.startYr) || 2000;
    const endYear = Number(rec.endYear || rec.endYr) || startYear;
    const primaryPos = rec.primaryPos || rec.pos || (rec.type === 'P' ? 'SP' : 'OF');
    const secondaryPositions = Array.isArray(rec.secondaryPositions) ? rec.secondaryPositions : [];

    const normalized = {
      id: playerId,
      playerId,
      playerKey,
      name: rec.name,
      franchiseId,
      franchiseName: f.name,
      decade: rec.decade,
      type: rec.type === 'P' ? 'P' : 'H',
      pos: primaryPos,
      primaryPos,
      secondaryPositions,
      elig: Array.isArray(rec.elig) && rec.elig.length ? rec.elig : HistoricalDatabase.deriveEligibility(primaryPos, secondaryPositions, rec.type),
      startYr: startYear,
      endYr: endYear,
      startYear,
      endYear,
      years: rec.years || (startYear === endYear ? `${startYear}` : `${startYear}–${endYear}`),
      seasons: Number(rec.seasonsWithFranchise || rec.seasons) || Math.max(1, endYear - startYear + 1),
      seasonsWithFranchise: Number(rec.seasonsWithFranchise || rec.seasons) || Math.max(1, endYear - startYear + 1),
      hof: !!rec.hof,
      awards: Array.isArray(rec.awards) ? rec.awards : [],
      acc: rec.acc || { gg: 0, mvp: 0, cy: 0, asg: 0, ss: 0, ws: 0 },
      stats: rec.stats || (rec.type === 'P'
        ? { era: Number(rec.era) || 3.80, whip: Number(rec.whip) || 1.26, k: Number(rec.k) || 100, sv: Number(rec.sv) || 0 }
        : { avg: Number(rec.avg) || 0.270, obp: Number(rec.obp) || 0.335, ops: Number(rec.ops) || 0.780, hr: Number(rec.hr) || 14, rbi: Number(rec.rbi) || 60 }),
      blurb: rec.blurb || `${rec.name} (${franchiseId}, ${startYear}–${endYear}).`
    };

    if (typeof generateHistoricalBlurb === 'function') {
      normalized.blurb = generateHistoricalBlurb(normalized);
    }
    this.players.set(playerId, normalized);
  }

  static deriveEligibility(primaryPos, secondaryPositions, type) {
    if (type === 'P') {
      const set = new Set();
      if (String(primaryPos).includes('SP') || secondaryPositions.includes('SP')) set.add('SP');
      if (String(primaryPos).includes('RP') || secondaryPositions.includes('RP')) set.add('RP');
      if (set.size === 0) set.add('SP');
      return Array.from(set);
    }
    const all = [primaryPos, ...secondaryPositions].join('/').split('/').map(s => s.trim()).filter(Boolean);
    const set = new Set(['DH']);
    for (const p of all) {
      set.add(p);
      if (['LF', 'CF', 'RF', 'OF'].includes(p)) set.add('OF');
      if (['C', '1B', '2B', '3B', 'SS', 'IF'].includes(p)) set.add('IF');
    }
    return Array.from(set);
  }

  /**
   * Bulk load normalized player records and rebuild the Franchise × Decade index.
   */
  loadRecords(records, { replace = false, sourceLabel = null, isCompiled = null } = {}) {
    if (replace) this.clear();
    let count = 0;
    for (const rec of records) {
      if (!rec || !rec.name || !rec.franchiseId || !rec.decade) continue;
      this.upsertPlayer(rec);
      count++;
    }
    if (sourceLabel) this.sourceLabel = sourceLabel;
    if (typeof isCompiled === 'boolean') this.isCompiled = isCompiled;
    this.rebuildIndex();
    return count;
  }

  /**
   * Rebuild Franchise-Era Index dynamically from Historical Player Table.
   */
  rebuildIndex() {
    this.franchiseEraIndex.clear();
    for (const [playerId, p] of this.players.entries()) {
      const key = `${p.franchiseId}__${p.decade}`;
      if (!this.franchiseEraIndex.has(key)) {
        this.franchiseEraIndex.set(key, {
          key,
          franchiseId: p.franchiseId,
          decade: p.decade,
          playerIds: [],
          counts: { total: 0, pos: 0, sp: 0, rp: 0 }
        });
      }
      const entry = this.franchiseEraIndex.get(key);
      entry.playerIds.push(playerId);
      entry.counts.total++;
      if (p.type === 'H') entry.counts.pos++;
      else if (p.elig.includes('SP') && !p.elig.includes('RP')) entry.counts.sp++;
      else if (p.elig.includes('RP') && !p.elig.includes('SP')) entry.counts.rp++;
      else { entry.counts.sp++; entry.counts.rp++; }
    }
  }

  /**
   * Dynamic Franchise-Era Pool Generation:
   * Returns EVERY qualifying player for (franchiseId, decade).
   * Never curates, ranks, trims, or caps.
   */
  getFranchiseEraPool(franchiseId, decade, { hofOnly = false } = {}) {
    const key = `${franchiseId}__${decade}`;
    const idx = this.franchiseEraIndex.get(key);
    if (!idx) return { franchiseId, decade, players: [], counts: { total: 0, pos: 0, sp: 0, rp: 0 } };
    const players = [];
    for (const pid of idx.playerIds) {
      const p = this.players.get(pid);
      if (!p) continue;
      if (hofOnly && !p.hof) continue;
      players.push(p);
    }
    return {
      franchiseId,
      decade,
      players,
      counts: {
        total: players.length,
        pos: players.filter(p => p.type === 'H').length,
        sp: players.filter(p => p.type === 'P' && p.elig.includes('SP')).length,
        rp: players.filter(p => p.type === 'P' && p.elig.includes('RP')).length
      }
    };
  }

  /**
   * Returns all available Franchise × Decade pools matching mode constraints.
   */
  getAvailablePools(modeId, lockValue = null) {
    const hofOnly = modeId === 'HOF';
    const pools = [];
    for (const entry of this.franchiseEraIndex.values()) {
      if (modeId === 'FRANCHISE' && lockValue && entry.franchiseId !== lockValue) continue;
      if (modeId === 'DECADE' && lockValue && entry.decade !== lockValue) continue;
      const pool = this.getFranchiseEraPool(entry.franchiseId, entry.decade, { hofOnly });
      if (pool.players.length > 0) pools.push(pool);
    }
    return pools;
  }

  getAllFranchiseIds() {
    const set = new Set();
    for (const entry of this.franchiseEraIndex.values()) set.add(entry.franchiseId);
    return Array.from(set).sort();
  }

  getAllDecades() {
    const set = new Set();
    for (const entry of this.franchiseEraIndex.values()) set.add(entry.decade);
    return Array.from(set).sort();
  }

  getSummary() {
    const pools = Array.from(this.franchiseEraIndex.values());
    const sizes = pools.map(p => ({ key: `${p.franchiseId} ${p.decade}`, total: p.counts.total })).sort((a, b) => b.total - a.total);
    const avgPoolSize = sizes.length ? Number((sizes.reduce((s, x) => s + x.total, 0) / sizes.length).toFixed(1)) : 0;
    const decades = this.getAllDecades();
    return {
      totalPlayers: this.players.size,
      totalPools: this.franchiseEraIndex.size,
      totalFranchises: this.getAllFranchiseIds().length,
      maxFranchises: Object.keys(FRANCHISES).length,
      totalDecades: decades.length,
      presentDecades: decades,
      missingDecades: SUPPORTED_DECADES.filter(d => !decades.includes(d)),
      missingFranchises: Object.keys(FRANCHISES).filter(f => !this.getAllFranchiseIds().includes(f)),
      decadeSpan: decades.length > 1 ? `${decades[0]}–${decades[decades.length - 1]}` : (decades[0] || '—'),
      largestPool: sizes[0] || null,
      smallestPool: sizes[sizes.length - 1] || null,
      avgPoolSize,
      sourceLabel: this.sourceLabel,
      isCompiled: this.isCompiled
    };
  }

  async saveToIndexedDb(records, sourceLabel) {
    try {
      if (typeof indexedDB === 'undefined') return;
      const req = indexedDB.open('diamond_draft_vault_v2', 1);
      req.onupgradeneeded = () => { req.result.createObjectStore('vault'); };
      req.onsuccess = () => {
        const tx = req.result.transaction('vault', 'readwrite');
        tx.objectStore('vault').put({ records, sourceLabel }, 'compiled_archive');
      };
    } catch (_) {}
  }

  async tryLoadFromIndexedDb() {
    try {
      if (typeof indexedDB === 'undefined') return false;
      return await new Promise(resolve => {
        const req = indexedDB.open('diamond_draft_vault_v2', 1);
        req.onupgradeneeded = () => { req.result.createObjectStore('vault'); };
        req.onerror = () => resolve(false);
        req.onsuccess = () => {
          const tx = req.result.transaction('vault', 'readonly');
          const g = tx.objectStore('vault').get('compiled_archive');
          g.onerror = () => resolve(false);
          g.onsuccess = () => {
            const val = g.result;
            if (val && Array.isArray(val.records) && val.records.length > 0) {
              this.loadRecords(val.records, { replace: true, sourceLabel: val.sourceLabel || 'Compiled Lahman Database (Cached)', isCompiled: true });
              resolve(true);
            } else {
              resolve(false);
            }
          };
        };
      });
    } catch (_) {
      return false;
    }
  }

  /**
   * Priority 1: Attempt to auto-load ./data/compiled/historical-players.json on startup.
   * Returns true if compiled Lahman database loaded; false to fall back to seed archive.
   */
  async tryLoadCompiledDatabase(url = './data/compiled/historical-players.json') {
    try {
      if (typeof fetch !== 'function' || (typeof location !== 'undefined' && location.protocol === 'file:')) {
        return false;
      }
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) return false;
      const arr = await res.json();
      if (!Array.isArray(arr) || arr.length === 0) return false;
      this.loadRecords(arr, { replace: true, sourceLabel: 'Compiled Lahman Database', isCompiled: true });
      return true;
    } catch (_) {
      return false;
    }
  }

  /**
   * Parse official SABR Lahman CSV files right in the browser!
   * Supports People.csv, Batting.csv, Pitching.csv, Fielding.csv, AwardsPlayers.csv, HallOfFame.csv.
   */
  ingestLahmanCsvBundle(csvMap, { replace = true } = {}) {
    const parseCsv = (text) => {
      if (!text) return [];
      const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(Boolean);
      if (lines.length < 2) return [];
      const splitLine = (line) => {
        const out = [];
        let cur = '', inQ = false;
        for (let i = 0; i < line.length; i++) {
          const ch = line[i];
          if (ch === '"') { inQ = !inQ; }
          else if (ch === ',' && !inQ) { out.push(cur.trim()); cur = ''; }
          else { cur += ch; }
        }
        out.push(cur.trim());
        return out;
      };
      const headers = splitLine(lines[0]);
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const vals = splitLine(lines[i]);
        const obj = {};
        for (let c = 0; c < headers.length; c++) obj[headers[c]] = vals[c] || '';
        rows.push(obj);
      }
      return rows;
    };

    const peopleMap = new Map();
    for (const r of parseCsv(csvMap.people)) {
      if (r.playerID) peopleMap.set(r.playerID, `${r.nameFirst || ''} ${r.nameLast || ''}`.trim() || r.playerID);
    }

    const hofSet = new Set();
    for (const r of parseCsv(csvMap.hof)) {
      if (r.inducted === 'Y' && r.category === 'Player') hofSet.add(r.playerID);
    }

    const asgMap = new Map();
    for (const r of parseCsv(csvMap.allstar)) {
      if (!r.playerID || !r.yearID) continue;
      if (!asgMap.has(r.playerID)) asgMap.set(r.playerID, new Set());
      asgMap.get(r.playerID).add(Number(r.yearID));
    }

    const wsSet = new Set();
    for (const r of parseCsv(csvMap.teams)) {
      if (r.WSWin === 'Y') {
        const fId = resolveFranchise(r.franchID || r.teamID).id;
        wsSet.add(`${Number(r.yearID)}__${fId}`);
      }
    }

    const awardIndex = new Map(); // playerID__year -> awards[]
    for (const r of parseCsv(csvMap.awards)) {
      const k = `${r.playerID}__${r.yearID}`;
      if (!awardIndex.has(k)) awardIndex.set(k, []);
      awardIndex.get(k).push(r.awardID);
    }

    const posIndex = new Map(); // playerID__franchID__decade -> Map<pos, games>
    for (const r of parseCsv(csvMap.fielding)) {
      const yr = Number(r.yearID);
      if (!yr || yr < 1890) continue;
      const fId = resolveFranchise(r.franchID || r.teamID).id;
      const dec = `${Math.floor(yr / 10) * 10}s`;
      const k = `${r.playerID}__${fId}__${dec}`;
      if (!posIndex.has(k)) posIndex.set(k, new Map());
      const pm = posIndex.get(k);
      pm.set(r.POS, (pm.get(r.POS) || 0) + (Number(r.G) || 1));
    }

    const batAgg = new Map();
    for (const r of parseCsv(csvMap.batting)) {
      const yr = Number(r.yearID);
      if (!yr || yr < 1890) continue;
      const fId = resolveFranchise(r.franchID || r.teamID).id;
      const dec = `${Math.floor(yr / 10) * 10}s`;
      const k = `${r.playerID}__${fId}__${dec}`;
      if (!batAgg.has(k)) {
        batAgg.set(k, { playerID: r.playerID, fId, dec, years: new Set(), ab: 0, h: 0, bb: 0, hbp: 0, sf: 0, d2: 0, d3: 0, hr: 0, rbi: 0 });
      }
      const a = batAgg.get(k);
      a.years.add(yr);
      a.ab += Number(r.AB) || 0;
      a.h += Number(r.H) || 0;
      a.bb += Number(r.BB) || 0;
      a.hbp += Number(r.HBP) || 0;
      a.sf += Number(r.SF) || 0;
      a.d2 += Number(r['2B']) || 0;
      a.d3 += Number(r['3B']) || 0;
      a.hr += Number(r.HR) || 0;
      a.rbi += Number(r.RBI) || 0;
    }

    const pitAgg = new Map();
    for (const r of parseCsv(csvMap.pitching)) {
      const yr = Number(r.yearID);
      if (!yr || yr < 1890) continue;
      const fId = resolveFranchise(r.franchID || r.teamID).id;
      const dec = `${Math.floor(yr / 10) * 10}s`;
      const k = `${r.playerID}__${fId}__${dec}`;
      if (!pitAgg.has(k)) {
        pitAgg.set(k, { playerID: r.playerID, fId, dec, years: new Set(), ipOuts: 0, er: 0, h: 0, bb: 0, so: 0, sv: 0, gs: 0, g: 0 });
      }
      const a = pitAgg.get(k);
      a.years.add(yr);
      a.ipOuts += Number(r.IPouts) || 0;
      a.er += Number(r.ER) || 0;
      a.h += Number(r.H) || 0;
      a.bb += Number(r.BB) || 0;
      a.so += Number(r.SO) || 0;
      a.sv += Number(r.SV) || 0;
      a.gs += Number(r.GS) || 0;
      a.g += Number(r.G) || 0;
    }

    const records = [];
    const buildAwards = (pid, fId, yearsSet) => {
      let mvp = 0, cy = 0, gg = 0, ss = 0, asg = 0, ws = 0;
      const pAsg = asgMap.get(pid);
      for (const y of yearsSet) {
        if (pAsg && pAsg.has(y)) asg++;
        if (wsSet.has(`${y}__${fId}`)) ws++;
        const list = awardIndex.get(`${pid}__${y}`) || [];
        for (const aw of list) {
          if (aw.includes('Most Valuable')) mvp++;
          else if (aw.includes('Cy Young')) cy++;
          else if (aw.includes('Gold Glove')) gg++;
          else if (aw.includes('Silver Slugger')) ss++;
        }
      }
      const tags = [];
      if (mvp) tags.push(mvp > 1 ? `${mvp}x MVP` : 'MVP');
      if (cy) tags.push(cy > 1 ? `${cy}x Cy Young` : 'Cy Young');
      if (asg) tags.push(`${asg}x All-Star`);
      if (gg) tags.push(`${gg}x Gold Glove`);
      if (ss) tags.push(`${ss}x Silver Slugger`);
      if (ws) tags.push(ws > 1 ? `${ws}x World Series` : 'World Series');
      return { tags, acc: { mvp, cy, gg, ss, asg, ws } };
    };

    for (const [k, a] of batAgg.entries()) {
      const pa = a.ab + a.bb + a.hbp + a.sf;
      if (pa < 80) continue; // exclude cup-of-coffee / pitcher-only lines
      const pm = posIndex.get(k);
      let primaryPos = 'DH';
      let sec = [];
      if (pm && pm.size) {
        const sortedPos = Array.from(pm.entries()).filter(([pos]) => pos !== 'P').sort((x, y) => y[1] - x[1]);
        if (sortedPos.length) {
          primaryPos = sortedPos[0][0];
          sec = sortedPos.slice(1, 3).map(x => x[0]);
        }
      }
      const yrs = Array.from(a.years).sort((x, y) => x - y);
      const n = yrs.length;
      const avg = a.ab > 0 ? a.h / a.ab : 0;
      const obp = pa > 0 ? (a.h + a.bb + a.hbp) / pa : avg;
      const singles = a.h - a.d2 - a.d3 - a.hr;
      const tb = singles + 2 * a.d2 + 3 * a.d3 + 4 * a.hr;
      const slg = a.ab > 0 ? tb / a.ab : 0;
      const aw = buildAwards(a.playerID, a.fId, a.years);
      records.push({
        playerId: `${a.playerID}-${a.fId}-${a.dec}-H`,
        playerKey: a.playerID,
        name: peopleMap.get(a.playerID) || a.playerID,
        franchiseId: a.fId,
        decade: a.dec,
        type: 'H',
        primaryPos,
        secondaryPositions: sec,
        startYear: yrs[0],
        endYear: yrs[yrs.length - 1],
        seasonsWithFranchise: n,
        hof: hofSet.has(a.playerID),
        awards: aw.tags,
        acc: aw.acc,
        stats: { avg: Number(avg.toFixed(3)), obp: Number(obp.toFixed(3)), ops: Number((obp + slg).toFixed(3)), hr: Math.round(a.hr / n), rbi: Math.round(a.rbi / n) },
        blurb: `Historical ${resolveFranchise(a.fId).name} contributor (${yrs[0]}–${yrs[yrs.length - 1]}).`
      });
    }

    for (const [k, a] of pitAgg.entries()) {
      const ip = a.ipOuts / 3;
      if (ip < 20) continue;
      const yrs = Array.from(a.years).sort((x, y) => x - y);
      const n = yrs.length;
      const isSp = a.gs >= a.g * 0.4;
      const primaryPos = isSp ? 'SP' : 'RP';
      const sec = (a.gs >= 3 && (a.g - a.gs) >= 10) ? [isSp ? 'RP' : 'SP'] : [];
      const era = ip > 0 ? (a.er * 9) / ip : 4.50;
      const whip = ip > 0 ? (a.h + a.bb) / ip : 1.35;
      const aw = buildAwards(a.playerID, a.fId, a.years);
      records.push({
        playerId: `${a.playerID}-${a.fId}-${a.dec}-P`,
        playerKey: a.playerID,
        name: peopleMap.get(a.playerID) || a.playerID,
        franchiseId: a.fId,
        decade: a.dec,
        type: 'P',
        primaryPos,
        secondaryPositions: sec,
        startYear: yrs[0],
        endYear: yrs[yrs.length - 1],
        seasonsWithFranchise: n,
        hof: hofSet.has(a.playerID),
        awards: aw.tags,
        acc: aw.acc,
        stats: { era: Number(era.toFixed(2)), whip: Number(whip.toFixed(2)), k: Math.round(a.so / n), sv: Math.round(a.sv / n) },
        blurb: `Historical ${resolveFranchise(a.fId).name} ${isSp ? 'starting' : 'relief'} pitcher (${yrs[0]}–${yrs[yrs.length - 1]}).`
      });
    }

    const n = this.loadRecords(records, { replace, sourceLabel: 'Compiled Lahman Database (CSV)', isCompiled: true });
    this.saveToIndexedDb(Array.from(this.players.values()), 'Compiled Lahman Database (CSV)');
    return n;
  }
}

const HISTORICAL_DB = new HistoricalDatabase();
