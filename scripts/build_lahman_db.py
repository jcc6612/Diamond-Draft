#!/usr/bin/env python3
"""
Diamond Draft V2 — Complete Historical Baseball Vault ETL (1890s–2020s)
-----------------------------------------------------------------------
Compiles official SABR Lahman Baseball Database CSV tables into:
  - data/compiled/historical-players.json
  - data/compiled/franchise-era-index.json

Target pool composition per Franchise × Decade (configurable):
  - Up to 55 Position Players (or all qualifying with --no-cap)
  - Up to 10+ Starting Pitchers
  - Up to 10+ Relief Pitchers
  (Ranked internally by historical franchise contribution: games/PA/IP, awards,
   All-Star selections, World Series rings, and Hall of Fame pedigree.
   No rating or score is ever written to the output JSON.)

Usage:
  python3 scripts/build_lahman_db.py --lahman-dir /path/to/lahman_csvs --out-dir data/compiled
"""

import argparse
import csv
import json
import os
from collections import defaultdict

TEAM_TO_FRANCHISE = {
    "BSN": "ATL", "MLN": "ATL", "ATL": "ATL",
    "MLA": "BAL", "SLA": "BAL", "BAL": "BAL",
    "BOS": "BOS",
    "CHN": "CHC", "CHC": "CHC",
    "CHA": "CHW", "CHW": "CHW",
    "CIN": "CIN", "CLE": "CLE", "COL": "COL", "DET": "DET",
    "FLO": "FLA", "MIA": "FLA", "FLA": "FLA",
    "HOU": "HOU",
    "KCA": "OAK", "PHA": "OAK", "OAK": "OAK", "ATH": "OAK",
    "KCR": "KCR",
    "LAA": "ANA", "CAL": "ANA", "ANA": "ANA",
    "BRO": "LAD", "LAN": "LAD", "LAD": "LAD",
    "SE1": "MIL", "ML4": "MIL", "MIL": "MIL",
    "WS1": "MIN", "MIN": "MIN",
    "NYN": "NYM", "NYM": "NYM",
    "NYA": "NYY", "NYY": "NYY",
    "PHI": "PHI", "PIT": "PIT",
    "SDN": "SDP", "SDP": "SDP",
    "NY1": "SFG", "SFN": "SFG", "SFG": "SFG",
    "SEA": "SEA", "SLN": "STL", "STL": "STL",
    "TBA": "TBD", "TBR": "TBD", "TBD": "TBD",
    "WS2": "TEX", "TEX": "TEX",
    "TOR": "TOR",
    "MON": "WSN", "WAS": "WSN", "WSN": "WSN",
    "ARI": "ARI",
}


def read_csv(path):
    if not os.path.exists(path):
        return []
    with open(path, encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def to_int(v, default=0):
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return default


def resolve_franchise(row, team_to_franch):
    if row.get("franchID"):
        return TEAM_TO_FRANCHISE.get(row["franchID"], row["franchID"])
    tid = row.get("teamID", "")
    return team_to_franch.get((to_int(row.get("yearID")), tid), TEAM_TO_FRANCHISE.get(tid, tid))


def build_database(lahman_dir, out_dir, min_year=1890, min_pa=50, min_ip=15.0,
                   target_pos=55, target_sp=10, target_rp=10, no_cap=False):
    people = {}
    for r in read_csv(os.path.join(lahman_dir, "People.csv")):
        pid = r.get("playerID")
        if pid:
            people[pid] = f"{r.get('nameFirst', '')} {r.get('nameLast', '')}".strip() or pid

    team_to_franch = {}
    ws_teams = set()
    for r in read_csv(os.path.join(lahman_dir, "Teams.csv")):
        yr = to_int(r.get("yearID"))
        tid = r.get("teamID", "")
        fid = r.get("franchID") or TEAM_TO_FRANCHISE.get(tid, tid)
        canon = TEAM_TO_FRANCHISE.get(fid, fid)
        team_to_franch[(yr, tid)] = canon
        if r.get("WSWin") == "Y":
            ws_teams.add((yr, canon))

    hof_players = set()
    for r in read_csv(os.path.join(lahman_dir, "HallOfFame.csv")):
        if r.get("inducted") == "Y" and r.get("category") == "Player":
            hof_players.add(r.get("playerID"))

    allstar_years = defaultdict(set)
    for r in read_csv(os.path.join(lahman_dir, "AllstarFull.csv")):
        allstar_years[r.get("playerID")].add(to_int(r.get("yearID")))

    awards_by_year = defaultdict(list)
    for r in read_csv(os.path.join(lahman_dir, "AwardsPlayers.csv")):
        awards_by_year[(r.get("playerID"), to_int(r.get("yearID")))].append(r.get("awardID", ""))

    fielding_pos = defaultdict(lambda: defaultdict(int))
    for r in read_csv(os.path.join(lahman_dir, "Fielding.csv")):
        yr = to_int(r.get("yearID"))
        if yr < min_year:
            continue
        fid = resolve_franchise(r, team_to_franch)
        dec = f"{(yr // 10) * 10}s"
        fielding_pos[(r["playerID"], fid, dec)][r.get("POS", "")] += to_int(r.get("G"), 1)

    franchise_career_years = defaultdict(set)

    batting_agg = {}
    for r in read_csv(os.path.join(lahman_dir, "Batting.csv")):
        yr = to_int(r.get("yearID"))
        if yr < min_year:
            continue
        fid = resolve_franchise(r, team_to_franch)
        dec = f"{(yr // 10) * 10}s"
        pid = r["playerID"]
        franchise_career_years[(pid, fid)].add(yr)
        k = (pid, fid, dec)
        if k not in batting_agg:
            batting_agg[k] = {"years": set(), "g": 0, "ab": 0, "h": 0, "bb": 0, "hbp": 0, "sf": 0, "d2": 0, "d3": 0, "hr": 0, "rbi": 0}
        a = batting_agg[k]
        a["years"].add(yr)
        a["g"] += to_int(r.get("G"))
        a["ab"] += to_int(r.get("AB"))
        a["h"] += to_int(r.get("H"))
        a["bb"] += to_int(r.get("BB"))
        a["hbp"] += to_int(r.get("HBP"))
        a["sf"] += to_int(r.get("SF"))
        a["d2"] += to_int(r.get("2B"))
        a["d3"] += to_int(r.get("3B"))
        a["hr"] += to_int(r.get("HR"))
        a["rbi"] += to_int(r.get("RBI"))

    pitching_agg = {}
    for r in read_csv(os.path.join(lahman_dir, "Pitching.csv")):
        yr = to_int(r.get("yearID"))
        if yr < min_year:
            continue
        fid = resolve_franchise(r, team_to_franch)
        dec = f"{(yr // 10) * 10}s"
        pid = r["playerID"]
        franchise_career_years[(pid, fid)].add(yr)
        k = (pid, fid, dec)
        if k not in pitching_agg:
            pitching_agg[k] = {"years": set(), "ipOuts": 0, "er": 0, "h": 0, "bb": 0, "so": 0, "sv": 0, "gs": 0, "g": 0}
        a = pitching_agg[k]
        a["years"].add(yr)
        a["ipOuts"] += to_int(r.get("IPouts"))
        a["er"] += to_int(r.get("ER"))
        a["h"] += to_int(r.get("H"))
        a["bb"] += to_int(r.get("BB"))
        a["so"] += to_int(r.get("SO"))
        a["sv"] += to_int(r.get("SV"))
        a["gs"] += to_int(r.get("GS"))
        a["g"] += to_int(r.get("G"))

    def summarize_awards(pid, fid, years_set):
        mvp = cy = gg = ss = asg = ws = 0
        for y in years_set:
            if y in allstar_years.get(pid, set()):
                asg += 1
            if (y, fid) in ws_teams:
                ws += 1
            for aw in awards_by_year.get((pid, y), []):
                if "Most Valuable" in aw:
                    mvp += 1
                elif "Cy Young" in aw:
                    cy += 1
                elif "Gold Glove" in aw:
                    gg += 1
                elif "Silver Slugger" in aw:
                    ss += 1
        tags = []
        if mvp: tags.append(f"{mvp}x MVP" if mvp > 1 else "MVP")
        if cy: tags.append(f"{cy}x Cy Young" if cy > 1 else "Cy Young")
        if asg: tags.append(f"{asg}x All-Star")
        if gg: tags.append(f"{gg}x Gold Glove")
        if ss: tags.append(f"{ss}x Silver Slugger")
        if ws: tags.append(f"{ws}x World Series" if ws > 1 else "World Series")
        return tags, {"mvp": mvp, "cy": cy, "asg": asg, "gg": gg, "ss": ss, "ws": ws}

    # Bucket candidates per (franchiseId, decade) by role (POS / SP / RP)
    buckets = defaultdict(lambda: {"POS": [], "SP": [], "RP": []})

    for (pid, fid, dec), a in batting_agg.items():
        pa = a["ab"] + a["bb"] + a["hbp"] + a["sf"]
        if pa < min_pa:
            continue
        pos_counts = [(pos, g) for pos, g in fielding_pos[(pid, fid, dec)].items() if pos and pos != "P"]
        pos_counts.sort(key=lambda x: x[1], reverse=True)
        # Skip pitchers who only hit before the DH era unless they played position games
        if not pos_counts and (pid, fid, dec) in pitching_agg and pitching_agg[(pid, fid, dec)]["ipOuts"] >= 90:
            continue
        primary_pos = pos_counts[0][0] if pos_counts else "DH"
        sec_pos = [p for p, _ in pos_counts[1:3]]
        yrs = sorted(a["years"])
        n = len(yrs)
        avg = a["h"] / a["ab"] if a["ab"] > 0 else 0.0
        obp = (a["h"] + a["bb"] + a["hbp"]) / pa if pa > 0 else avg
        singles = a["h"] - a["d2"] - a["d3"] - a["hr"]
        tb = singles + 2 * a["d2"] + 3 * a["d3"] + 4 * a["hr"]
        slg = tb / a["ab"] if a["ab"] > 0 else 0.0
        tags, acc = summarize_awards(pid, fid, a["years"])
        rec_id = f"{pid}-{fid}-{dec}-H"
        # Internal franchise-significance sort key (never written to JSON)
        sig = pa + a["g"] * 2 + acc["mvp"] * 1200 + acc["asg"] * 350 + acc["gg"] * 250 + acc["ws"] * 300 + (600 if pid in hof_players else 0)
        rec = {
            "playerId": rec_id,
            "playerKey": pid,
            "name": people.get(pid, pid),
            "franchiseId": fid,
            "decade": dec,
            "type": "H",
            "primaryPos": primary_pos,
            "secondaryPositions": sec_pos,
            "startYear": yrs[0],
            "endYear": yrs[-1],
            "seasonsWithFranchise": len(franchise_career_years[(pid, fid)]),
            "hof": pid in hof_players,
            "awards": tags,
            "acc": acc,
            "stats": {
                "avg": round(avg, 3),
                "obp": round(obp, 3),
                "ops": round(obp + slg, 3),
                "hr": round(a["hr"] / n),
                "rbi": round(a["rbi"] / n),
            },
            "blurb": f"{people.get(pid, pid)} appeared in {n} {dec} season(s) for {fid} ({yrs[0]}–{yrs[-1]}).",
        }
        buckets[(fid, dec)]["POS"].append((sig, rec))

    for (pid, fid, dec), a in pitching_agg.items():
        ip = a["ipOuts"] / 3.0
        if ip < min_ip:
            continue
        yrs = sorted(a["years"])
        n = len(yrs)
        is_sp = a["gs"] >= a["g"] * 0.4
        role = "SP" if is_sp else "RP"
        sec_pos = (["RP"] if is_sp else ["SP"]) if (a["gs"] >= 3 and (a["g"] - a["gs"]) >= 10) else []
        era = (a["er"] * 9.0) / ip if ip > 0 else 4.50
        whip = (a["h"] + a["bb"]) / ip if ip > 0 else 1.35
        tags, acc = summarize_awards(pid, fid, a["years"])
        rec_id = f"{pid}-{fid}-{dec}-P"
        sig = ip * 4 + a["sv"] * 12 + acc["cy"] * 1200 + acc["asg"] * 350 + acc["ws"] * 300 + (600 if pid in hof_players else 0)
        rec = {
            "playerId": rec_id,
            "playerKey": pid,
            "name": people.get(pid, pid),
            "franchiseId": fid,
            "decade": dec,
            "type": "P",
            "primaryPos": role,
            "secondaryPositions": sec_pos,
            "startYear": yrs[0],
            "endYear": yrs[-1],
            "seasonsWithFranchise": len(franchise_career_years[(pid, fid)]),
            "hof": pid in hof_players,
            "awards": tags,
            "acc": acc,
            "stats": {
                "era": round(era, 2),
                "whip": round(whip, 2),
                "k": round(a["so"] / n),
                "sv": round(a["sv"] / n),
            },
            "blurb": f"{people.get(pid, pid)} pitched in {n} {dec} season(s) for {fid} ({yrs[0]}–{yrs[-1]}).",
        }
        buckets[(fid, dec)][role].append((sig, rec))

    players_out = []
    era_index = defaultdict(list)

    for (fid, dec), roles in sorted(buckets.items()):
        for role_key, cap in (("POS", target_pos), ("SP", target_sp), ("RP", target_rp)):
            items = sorted(roles[role_key], key=lambda x: x[0], reverse=True)
            chosen = items if no_cap else items[:cap]
            for _, rec in chosen:
                players_out.append(rec)
                era_index[f"{fid}__{dec}"].append(rec["playerId"])

    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, "historical-players.json"), "w", encoding="utf-8") as f:
        json.dump(players_out, f, separators=(",", ":"))
    with open(os.path.join(out_dir, "franchise-era-index.json"), "w", encoding="utf-8") as f:
        json.dump(dict(era_index), f, separators=(",", ":"))

    pool_sizes = sorted([(k, len(v)) for k, v in era_index.items()], key=lambda x: x[1], reverse=True)
    franchises = sorted({k.split("__")[0] for k in era_index})
    decades = sorted({k.split("__")[1] for k in era_index})
    avg_sz = round(sum(x[1] for x in pool_sizes) / len(pool_sizes), 1) if pool_sizes else 0
    print(f"Players Loaded:       {len(players_out):,}")
    print(f"Franchise-Era Pools:  {len(era_index):,}")
    print(f"Franchises Covered:   {len(franchises)} / 30")
    print(f"Decades Covered:      {decades[0]}–{decades[-1]} ({len(decades)} decades)")
    print(f"Average Pool Size:    {avg_sz}")
    if pool_sizes:
        print(f"Largest Pool:         {pool_sizes[0][0]} ({pool_sizes[0][1]})")
        print(f"Smallest Pool:        {pool_sizes[-1][0]} ({pool_sizes[-1][1]})")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description="Compile SABR Lahman CSVs into Diamond Draft V2 historical JSON")
    ap.add_argument("--lahman-dir", required=True, help="Directory containing Lahman CSV files")
    ap.add_argument("--out-dir", default="data/compiled", help="Output directory for compiled JSON files")
    ap.add_argument("--min-year", type=int, default=1890)
    ap.add_argument("--target-pos", type=int, default=55)
    ap.add_argument("--target-sp", type=int, default=10)
    ap.add_argument("--target-rp", type=int, default=10)
    ap.add_argument("--no-cap", action="store_true", help="Include every qualifying player without the 55/10/10 target cap")
    args = ap.parse_args()
    build_database(
        args.lahman_dir, args.out_dir,
        min_year=args.min_year,
        target_pos=args.target_pos,
        target_sp=args.target_sp,
        target_rp=args.target_rp,
        no_cap=args.no_cap,
    )
