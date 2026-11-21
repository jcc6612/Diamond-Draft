# Diamond Draft V2: The 162-0 Challenge

Scalable historical database architecture for Diamond Draft, replacing manually maintained `RAW_VAULT` arrays with a normalized **Historical Player Table**, **Franchise-Era Index**, and an offline + in-browser **SABR Lahman ETL pipeline** capable of powering thousands of real MLB players across all 30 franchises and every decade.

## Architecture

- `data/franchises.js` — All 30 MLB franchises + historical relocation mapping (`BRO -> LAD`, `MON -> WSN`, `MLN -> ATL`, `PHA -> OAK`, etc.)
- `data/historical-db.js` — `HistoricalDatabase` class (`players` Map, `franchiseEraIndex` Map, dynamic `getFranchiseEraPool()` returning every qualifying player with zero trimming/curation, plus in-browser SABR Lahman CSV ingestor)
- `data/seed-historical-players.js` — Built-in normalized seed table (317 verified real MLB player-decade stints) so the app runs immediately out-of-the-box
- `scripts/build_lahman_db.py` — Zero-dependency Python 3 ETL script to compile official SABR Lahman CSV tables into `data/compiled/historical-players.json` and `data/compiled/franchise-era-index.json`
- `engine/game-engine.js` — Preserved draft engine, 7 game modes, chemistry system, calibrated variance 162-game & postseason simulator, and dynasty vault
- `app.js` — Scouting Room centerpiece (total eligible count, position filters, alphabetical/tenure/chronology sorting, instant search), low-profile top-down ballpark markers, off-field Dugout & Bullpen panel, and end-of-season recap
- `styles.css` & `index.html` — Black Diamond UI
- `assets/ballpark.jpg` — Realistic top-down stadium image
- `.github/copilot-instructions.md` — Product & architecture guardrails for Copilot

## Expanding to Thousands of Real MLB Players (SABR Lahman)

1. Download the CSV release from the SABR Lahman Baseball Database (`https://sabr.org/lahman-database/`).
2. Either upload `People.csv`, `Batting.csv`, `Pitching.csv`, `Fielding.csv`, `AwardsPlayers.csv`, and `HallOfFame.csv` directly via **Import Vault** inside the app, OR run offline:

```bash
python3 scripts/build_lahman_db.py --lahman-dir /path/to/lahman_csvs --out-dir data/compiled
```

Then upload `data/compiled/historical-players.json` in **Import Vault** (or load it directly on boot).
