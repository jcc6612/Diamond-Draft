#!/usr/bin/env python3
"""
Diamond Draft V2 — Historical Vault Audit Report Generator
----------------------------------------------------------
Runs Reports 1–7 directly against a compiled data/compiled/historical-players.json
file produced by scripts/build_lahman_db.py.

Usage:
  python3 scripts/audit_historical_vault.py --input data/compiled/historical-players.json
"""

import argparse
import json
from collections import defaultdict


def audit_vault(json_path):
    with open(json_path, encoding="utf-8") as f:
        players = json.load(f)

    pools = defaultdict(lambda: {"POS": 0, "SP": 0, "RP": 0, "HOF": 0, "total": 0})
    by_franchise = defaultdict(lambda: defaultdict(lambda: {"POS": 0, "SP": 0, "RP": 0, "HOF": 0, "total": 0}))
    player_decades = defaultdict(lambda: {"name": "", "decades": set(), "franchises": set()})
    hof_by_franchise = defaultdict(set)
    hof_by_decade = defaultdict(set)
    all_hof = set()

    for p in players:
        fid = p["franchiseId"]
        dec = p["decade"]
        key = f"{fid} {dec}"
        role = "POS" if p["type"] == "H" else ("SP" if "SP" in p.get("primaryPos", "") else "RP")
        pools[key][role] += 1
        pools[key]["total"] += 1
        by_franchise[fid][dec][role] += 1
        by_franchise[fid][dec]["total"] += 1
        if p.get("hof"):
            pools[key]["HOF"] += 1
            by_franchise[fid][dec]["HOF"] += 1
            hof_by_franchise[fid].add(p["playerKey"])
            hof_by_decade[dec].add(p["playerKey"])
            all_hof.add(p["playerKey"])

        pd = player_decades[p["playerKey"]]
        pd["name"] = p["name"]
        pd["decades"].add(dec)
        pd["franchises"].add(fid)

    sorted_pools = sorted(pools.items(), key=lambda x: x[1]["total"], reverse=True)

    print("=== REPORT 1: TOP 20 LARGEST FRANCHISE-ERA POOLS ===")
    for k, v in sorted_pools[:20]:
        print(f"  {k:12s} | {v['POS']:2d} POS | {v['SP']:2d} SP | {v['RP']:2d} RP | {v['total']:2d} Total")

    print("\n=== REPORT 2: 20 SMALLEST FRANCHISE-ERA POOLS ===")
    for k, v in sorted_pools[-20:]:
        print(f"  {k:12s} | {v['POS']:2d} POS | {v['SP']:2d} SP | {v['RP']:2d} RP | {v['total']:2d} Total")

    for label, fid in [("REPORT 3: YANKEES AUDIT (NYY)", "NYY"), ("REPORT 4: DODGERS AUDIT (LAD / BRO)", "LAD")]:
        print(f"\n=== {label} ===")
        for dec in sorted(by_franchise[fid].keys()):
            v = by_franchise[fid][dec]
            print(f"  {dec} | Total: {v['total']:2d} | HOF: {v['HOF']:2d} | POS: {v['POS']:2d} | SP: {v['SP']:2d} | RP: {v['RP']:2d}")

    print("\n=== REPORT 6: MULTI-DECADE PLAYER AUDIT (3+ DECADES) ===")
    multi = sorted(
        [(v["name"], len(v["decades"]), sorted(v["decades"]), sorted(v["franchises"]))
         for v in player_decades.values() if len(v["decades"]) >= 3],
        key=lambda x: (-x[1], x[0])
    )
    for bucket in (6, 5, 4, 3):
        matches = [m for m in multi if m[1] == bucket]
        print(f"  {bucket} Decades ({len(matches)} players): " + ", ".join(f"{m[0]} ({'/'.join(m[3])})" for m in matches[:15]))

    print("\n=== REPORT 7: HALL OF FAME COVERAGE ===")
    print(f"  Total Unique Hall of Famers in Vault: {len(all_hof)}")
    print("  By Decade:")
    for dec in sorted(hof_by_decade.keys()):
        print(f"    {dec}: {len(hof_by_decade[dec])}")
    print("  Top 10 Franchises by HOF Count:")
    for fid, s in sorted(hof_by_franchise.items(), key=lambda x: len(x[1]), reverse=True)[:10]:
        print(f"    {fid}: {len(s)}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", default="data/compiled/historical-players.json")
    args = ap.parse_args()
    audit_vault(args.input)
