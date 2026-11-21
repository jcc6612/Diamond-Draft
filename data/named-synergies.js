/* ============================================================================
   DIAMOND DRAFT V2 — NARRATIVE-FIRST NAMED SYNERGY REGISTRY (MILESTONE #2)
   105+ Verified Cross-Pool Baseball Stories across all 30 MLB Franchises
   3 Tiers: Tier 1 (Legendary) · Tier 2 (Franchise) · Tier 3 (Baseball)
   Every story defines: Name · Story Text · Milestone Popup · Roads Not Taken Hook · Gameplay Bonus
   ============================================================================ */

const STORY_TIERS = {
  LEGENDARY: { rank: 1, label: 'Legendary Story', cls: 'tier-legendary', chemBonus: 9.0, clutchBonus: 0.068 },
  FRANCHISE: { rank: 2, label: 'Franchise Story', cls: 'tier-franchise', chemBonus: 6.2, clutchBonus: 0.044 },
  BASEBALL:  { rank: 3, label: 'Baseball Story',  cls: 'tier-baseball',  chemBonus: 4.2, clutchBonus: 0.026 }
};

function _mName(p, names) {
  const n = (p.name || '').toLowerCase();
  return names.some(x => n === x.toLowerCase());
}
function _mPool(p, fr, dec) {
  return (!fr || p.franchiseId === fr) && (!dec || p.decade === dec);
}
function _isPos(p, list) {
  if (list.includes(p.pos)) return true;
  return Array.isArray(p.elig) && p.elig.some(e => list.includes(e));
}

const NAMED_STORIES = [
  /* ==========================================================================
     TIER 1: LEGENDARY STORIES (22 Rare, Iconic Baseball Reunions)
     ========================================================================== */
  {
    id: 'murderers_row',
    tier: 'LEGENDARY',
    name: "Murderers' Row",
    story: 'The most feared one-two punch in baseball history reunites across eras—Babe Ruth and Lou Gehrig turning every inning into a home-run derby.',
    bonusLabel: 'Historic Power Surge & Run Production',
    sideA: p => _mName(p, ['Babe Ruth']),
    sideB: p => _mName(p, ['Lou Gehrig'])
  },
  {
    id: 'core_four',
    tier: 'LEGENDARY',
    name: 'The Core Four',
    story: 'Built in the Bronx and forged in October—two pillars of New York’s late-1990s dynasty reunite to lock down the postseason.',
    bonusLabel: 'Elite October Clutch & Clubhouse Leadership',
    sideA: p => _mPool(p, 'NYY', '1990s') && _mName(p, ['Derek Jeter', 'Mariano Rivera', 'Andy Pettitte', 'Jorge Posada']),
    sideB: p => _mPool(p, 'NYY', '2000s') && _mName(p, ['Derek Jeter', 'Mariano Rivera', 'Andy Pettitte', 'Jorge Posada'])
  },
  {
    id: 'big_red_machine',
    tier: 'LEGENDARY',
    name: 'Big Red Machine',
    story: 'Riverfront Stadium’s relentless 1970s juggernaut comes roaring back to life, reuniting Pete Rose with his Cincinnati championship core.',
    bonusLabel: 'Relentless OBP & Championship Grit',
    sideA: p => _mPool(p, 'CIN', '1970s') && _mName(p, ['Johnny Bench', 'Joe Morgan', 'Tony Perez', 'George Foster', 'Ken Griffey Sr.']),
    sideB: p => _mPool(p, 'PHI', '1980s') && _mName(p, ['Pete Rose'])
  },
  {
    id: 'boys_of_summer',
    tier: 'LEGENDARY',
    name: 'Boys of Summer',
    story: 'From Ebbets Field to Chavez Ravine, Brooklyn’s iconic 1950s champions pass the torch to Dodger blue’s modern legends.',
    bonusLabel: 'Cross-Era Franchise Aura & Poise',
    sideA: p => _mPool(p, 'LAD', '1950s') && _mName(p, ['Jackie Robinson', 'Duke Snider', 'Roy Campanella', 'Pee Wee Reese', 'Gil Hodges', 'Sandy Koufax']),
    sideB: p => (p.franchiseId === 'LAD' && (p.decade === '2010s' || p.decade === '2020s')) && _mName(p, ['Clayton Kershaw', 'Mookie Betts', 'Shohei Ohtani', 'Freddie Freeman'])
  },
  {
    id: 'refuse_to_lose',
    tier: 'LEGENDARY',
    name: 'Refuse to Lose',
    story: 'The Double, the sprint around third, the roar of the Kingdome—Ken Griffey Jr. and Edgar Martinez reunite to save baseball in Seattle all over again.',
    bonusLabel: 'Massive Offense & October Magic',
    sideA: p => _mName(p, ['Ken Griffey Jr.']),
    sideB: p => _mName(p, ['Edgar Martinez'])
  },
  {
    id: 'pirates_immortals',
    tier: 'LEGENDARY',
    name: 'Pirates Immortals',
    story: 'Sixty years of Pittsburgh greatness collide as The Flying Dutchman and The Great One share the same diamond.',
    bonusLabel: 'All-Time Franchise Prestige & Defense',
    sideA: p => _mPool(p, 'PIT', '1900s') && _mName(p, ['Honus Wagner']),
    sideB: p => _mPool(p, 'PIT', '1960s') && _mName(p, ['Roberto Clemente'])
  },
  {
    id: 'big_unit_battery',
    tier: 'LEGENDARY',
    name: 'The Big Unit Battery',
    story: 'Randy Johnson’s 100-mph slider meets Dan Wilson’s steady glove—one of the 1990s’ toughest pitcher-catcher partnerships back in sync.',
    bonusLabel: 'Dominant Pitching & Run Prevention',
    sideA: p => _mName(p, ['Randy Johnson']),
    sideB: p => _mName(p, ['Dan Wilson'])
  },
  {
    id: 'twin_aces_2001',
    tier: 'LEGENDARY',
    name: '2001 Co-MVP Twin Aces',
    story: 'Randy Johnson and Curt Schilling reunite to recreate the most terrifying two-headed postseason rotation in modern baseball.',
    bonusLabel: 'Historic Postseason Pitching Dominance',
    sideA: p => _mName(p, ['Randy Johnson']),
    sideB: p => _mName(p, ['Curt Schilling'])
  },
  {
    id: 'manny_and_papi',
    tier: 'LEGENDARY',
    name: 'Manny & Papi',
    story: 'The heart of the curse-breaking Red Sox lineup reunites—two right-left thunderbolts who turned Fenway nights into October folklore.',
    bonusLabel: 'Middle-of-Order Power & Clutch',
    sideA: p => _mName(p, ['Manny Ramirez']),
    sideB: p => _mName(p, ['David Ortiz'])
  },
  {
    id: 'swingin_as',
    tier: 'LEGENDARY',
    name: "Swingin' A's Dynasty",
    story: 'Green and gold swagger from baseball’s wildest three-peat—Reggie Jackson and Rollie Fingers reunite with October on the line.',
    bonusLabel: '3-Peat October Dominance',
    sideA: p => _mName(p, ['Reggie Jackson']),
    sideB: p => _mName(p, ['Rollie Fingers'])
  },
  {
    id: 'oriole_way',
    tier: 'LEGENDARY',
    name: 'The Oriole Way',
    story: 'Eddie Murray links back up with Baltimore’s 1970s dynasty—uniting championship pitching, vacuum-cleaner defense, and switch-hitting power.',
    bonusLabel: 'Fundamental Mastery & October Grit',
    sideA: p => _mPool(p, 'CLE', '1990s') && _mName(p, ['Eddie Murray']),
    sideB: p => _mPool(p, 'BAL', '1970s') && _mName(p, ['Brooks Robinson', 'Frank Robinson', 'Jim Palmer', 'Boog Powell'])
  },
  {
    id: 'queens_royalty_86',
    tier: 'LEGENDARY',
    name: '1986 Queens Royalty',
    story: 'Darryl Strawberry or Gary Carter reunites with Shea Stadium’s electric 1986 champions—loud, fearless, and built for Game 6 miracles.',
    bonusLabel: 'October Swagger & Run Production',
    sideA: p => (_mPool(p, 'NYY', '1990s') && _mName(p, ['Darryl Strawberry', 'David Cone'])) || (_mPool(p, 'WSN', '1980s') && _mName(p, ['Gary Carter'])),
    sideB: p => _mPool(p, 'NYM', '1980s') && _mName(p, ['Dwight Gooden', 'Keith Hernandez', 'Darryl Strawberry', 'Gary Carter'])
  },
  {
    id: 'rf_perfection_60s',
    tier: 'LEGENDARY',
    name: '1960s Right-Field Royalty',
    story: 'Roberto Clemente and Al Kaline—two cannons in right field, two timeless icons of 1960s excellence sharing one outfield.',
    bonusLabel: 'Elite Outfield Defense & Pure Hitting',
    sideA: p => _mName(p, ['Roberto Clemente']),
    sideB: p => _mName(p, ['Al Kaline'])
  },
  {
    id: 'batting_crown_lineage',
    tier: 'LEGENDARY',
    name: 'National League Batting Gods',
    story: 'Rogers Hornsby’s .400 peak meets Stan Musial’s timeless sweet swing—two of the purest hitters in National League history.',
    bonusLabel: 'Historic Contact & OBP Dominance',
    sideA: p => _mName(p, ['Rogers Hornsby']),
    sideB: p => _mName(p, ['Stan Musial'])
  },
  {
    id: 'marlins_2003_battery',
    tier: 'LEGENDARY',
    name: '2003 Marlins Upset Core',
    story: 'Pudge Rodriguez reunites with young Miguel Cabrera or Josh Beckett to recapture Florida’s stunning October charge through the Bronx.',
    bonusLabel: 'Giant-Slayer October Clutch',
    sideA: p => _mPool(p, 'TEX', '1990s') && _mName(p, ['Ivan Rodriguez']),
    sideB: p => _mPool(p, 'FLA', '2000s') && _mName(p, ['Miguel Cabrera', 'Josh Beckett', 'Mike Lowell', 'Juan Pierre'])
  },
  {
    id: 'royal_crown_85',
    tier: 'LEGENDARY',
    name: '1985 Royal Crown',
    story: 'George Brett and Bret Saberhagen reunite—the Hall of Fame third baseman and World Series MVP ace who owned October 1985.',
    bonusLabel: 'Championship Poise & Pitching',
    sideA: p => _mPool(p, 'KCR', '1980s') && _mName(p, ['George Brett', 'Frank White', 'Willie Wilson', 'Dan Quisenberry']),
    sideB: p => _mPool(p, 'BOS', '1990s') && _mName(p, ['Bret Saberhagen'])
  },
  {
    id: 'homerdome_87',
    tier: 'LEGENDARY',
    name: '1987 Homerdome Magic',
    story: 'Kirby Puckett and Frank Viola reunite—rekindling the deafening Metrodome roar that carried Minnesota to the 1987 World Series title.',
    bonusLabel: 'Home-Field Surge & October Clutch',
    sideA: p => _mPool(p, 'MIN', '1980s') && _mName(p, ['Kirby Puckett', 'Kent Hrbek', 'Gary Gaetti']),
    sideB: p => _mPool(p, 'BOS', '1990s') && _mName(p, ['Frank Viola'])
  },
  {
    id: 'padres_98_pennant',
    tier: 'LEGENDARY',
    name: '1998 San Diego Pennant',
    story: 'Kevin Brown’s sinker rejoins Tony Gwynn and Trevor Hoffman—bringing back the gritty 98-win Padres who stormed to the World Series.',
    bonusLabel: 'Ace-to-Closer Shutdown & Contact',
    sideA: p => _mPool(p, 'TEX', '1990s') && _mName(p, ['Kevin Brown']),
    sideB: p => _mPool(p, 'SDP', '1990s') && _mName(p, ['Tony Gwynn', 'Trevor Hoffman', 'Ken Caminiti', 'Steve Finley'])
  },
  {
    id: 'rally_monkey_2002',
    tier: 'LEGENDARY',
    name: '2002 Rally Monkey Champions',
    story: 'Troy Percival reunites with Anaheim’s fearless 2002 core—unleashing relentless late-inning comebacks and bullpen lockdown.',
    bonusLabel: 'Late-Inning Comeback Clutch',
    sideA: p => _mPool(p, 'TBD', '2000s') && _mName(p, ['Troy Percival']),
    sideB: p => _mPool(p, 'ANA', '2000s') && _mName(p, ['Garret Anderson', 'Tim Salmon', 'Darin Erstad', 'Vladimir Guerrero', 'Francisco Rodriguez'])
  },
  {
    id: 'south_side_2005',
    tier: 'LEGENDARY',
    name: '2005 South Side Sweep',
    story: 'Freddy Garcia reunites with Chicago’s 2005 champions—channeling the four-straight-complete-games pitching run that ended an 88-year wait.',
    bonusLabel: 'Postseason Pitching & Grit',
    sideA: p => (p.franchiseId === 'SEA') && _mName(p, ['Freddy Garcia']),
    sideB: p => _mPool(p, 'CHW', '2000s') && _mName(p, ['Frank Thomas', 'Paul Konerko', 'A.J. Pierzynski', 'Jermaine Dye', 'Mark Buehrle'])
  },
  {
    id: 'cy_young_twins_2019',
    tier: 'LEGENDARY',
    name: '2019 Twin Cy Young Aces',
    story: 'Zack Greinke and Justin Verlander reunite—pairing surgical pitch sequencing with triple-digit fastball dominance.',
    bonusLabel: 'Elite Rotation Dominance',
    sideA: p => _mPool(p, 'LAD', '2010s') && _mName(p, ['Zack Greinke']),
    sideB: p => _mPool(p, 'HOU', '2010s') && _mName(p, ['Justin Verlander', 'Jose Altuve', 'Yordan Alvarez', 'Alex Bregman'])
  },
  {
    id: 'deadball_icons_1909',
    tier: 'LEGENDARY',
    name: '1909 Pirates Champions',
    story: 'Honus Wagner and Vic Willis reunite from Pittsburgh’s 110-win 1909 World Series juggernaut—pure dead-ball toughness.',
    bonusLabel: 'Dead-Ball Run Prevention & Grit',
    sideA: p => _mPool(p, 'ATL', '1890s') && _mName(p, ['Vic Willis']),
    sideB: p => _mPool(p, 'PIT', '1900s') && _mName(p, ['Honus Wagner', 'Fred Clarke', 'Tommy Leach'])
  },

  /* ==========================================================================
     TIER 2: FRANCHISE STORIES (44 Club Identity & Multi-Era Stories)
     ========================================================================== */
  {
    id: 'fenway_century',
    tier: 'FRANCHISE',
    name: 'Fenway Century',
    story: 'A hundred years of Red Sox lore bridged in a single clubhouse—from the 1910s dead-ball champions to Boston’s modern October heroes.',
    bonusLabel: 'Red Sox Cross-Era Aura',
    sideA: p => _mPool(p, 'BOS', '1910s') && _mName(p, ['Babe Ruth', 'Tris Speaker', 'Smoky Joe Wood', 'Harry Hooper']),
    sideB: p => (p.franchiseId === 'BOS' && (p.decade === '1990s' || p.decade === '2000s')) && _mName(p, ['Pedro Martinez', 'David Ortiz', 'Manny Ramirez', 'Jason Varitek', 'Nomar Garciaparra'])
  },
  {
    id: 'braves_big_three',
    tier: 'FRANCHISE',
    name: 'Braves Big Three',
    story: 'Fourteen straight division titles built on surgical command—two legends of Atlanta’s iconic 1990s–2000s pitching dynasty reunite.',
    bonusLabel: 'Unhittable Pitching Staff',
    sideA: p => _mPool(p, 'ATL', '1990s') && _mName(p, ['Greg Maddux', 'Tom Glavine', 'John Smoltz']),
    sideB: p => _mPool(p, 'ATL', '2000s') && _mName(p, ['Greg Maddux', 'Tom Glavine', 'John Smoltz'])
  },
  {
    id: 'braves_cornerstone',
    tier: 'FRANCHISE',
    name: 'Braves Cornerstone',
    story: 'Chipper’s switch-hitting bat and Andruw’s supernatural center-field glove anchor Atlanta’s golden generation.',
    bonusLabel: 'Balanced Offense & Center-Field Defense',
    sideA: p => _mName(p, ['Chipper Jones']),
    sideB: p => _mName(p, ['Andruw Jones'])
  },
  {
    id: 'braves_95_clincher',
    tier: 'FRANCHISE',
    name: '1995 World Series Clincher',
    story: 'David Justice reunites with Atlanta’s 1990s core—bringing back the Game 6 solo blast that finally crowned the Braves.',
    bonusLabel: 'Postseason Power & Poise',
    sideA: p => _mPool(p, 'CLE', '1990s') && _mName(p, ['David Justice']),
    sideB: p => _mPool(p, 'ATL', '1990s') && _mName(p, ['Chipper Jones', 'Greg Maddux', 'Tom Glavine', 'John Smoltz', 'Fred McGriff'])
  },
  {
    id: 'braves_2021_october',
    tier: 'FRANCHISE',
    name: '2021 Atlanta October',
    story: 'Charlie Morton links up with Atlanta’s modern champions—channeling the fearless toughness of pitching on a broken leg in Game 1.',
    bonusLabel: 'October Grit & Rotation Depth',
    sideA: p => _mPool(p, 'HOU', '2010s') && _mName(p, ['Charlie Morton']),
    sideB: p => _mPool(p, 'ATL', '2020s') && _mName(p, ['Freddie Freeman', 'Ronald Acuna Jr.', 'Austin Riley', 'Ozzie Albies'])
  },
  {
    id: 'bronx_bashers',
    tier: 'FRANCHISE',
    name: 'Bronx Bashers',
    story: 'Yankee Stadium’s short porch trembles as generations of pinstriped sluggers stack towering home runs back-to-back.',
    bonusLabel: 'Pinstriped Home-Run Surge',
    sideA: p => _mPool(p, 'NYY', '1920s') && _mName(p, ['Babe Ruth', 'Lou Gehrig']),
    sideB: p => _mPool(p, 'NYY', '2020s') && _mName(p, ['Aaron Judge', 'Juan Soto', 'Giancarlo Stanton'])
  },
  {
    id: 'bronx_dynasty_first',
    tier: 'FRANCHISE',
    name: 'Bronx Dynasty Heart',
    story: 'Tino Martinez or Wade Boggs bridges the gap into New York’s late-90s juggernaut—clutch grand slams and championship polish.',
    bonusLabel: 'Clutch RBI & Lineup Discipline',
    sideA: p => (_mPool(p, 'SEA', '1990s') && _mName(p, ['Tino Martinez'])) || (_mPool(p, 'BOS', '1990s') && _mName(p, ['Wade Boggs'])),
    sideB: p => _mPool(p, 'NYY', '1990s') && _mName(p, ['Derek Jeter', 'Bernie Williams', 'Mariano Rivera', 'Paul O’Neill'])
  },
  {
    id: 'harveys_wallbangers',
    tier: 'FRANCHISE',
    name: "Harvey's Wallbangers",
    story: 'Robin Yount and Paul Molitor reunite—the relentless, high-contact engine that drove Milwaukee’s beloved 1982 pennant charge.',
    bonusLabel: 'High-Contact Offense & Speed',
    sideA: p => _mName(p, ['Robin Yount']),
    sideB: p => _mName(p, ['Paul Molitor'])
  },
  {
    id: 'olympic_stadium_core',
    tier: 'FRANCHISE',
    name: 'Olympic Stadium Golden Core',
    story: 'Before baseball left Montreal, the Expos built a Hall of Fame factory—Gary Carter reunites with his 1980s Montreal brothers.',
    bonusLabel: 'Expos Franchise Pride & Grit',
    sideA: p => _mPool(p, 'NYM', '1980s') && _mName(p, ['Gary Carter']),
    sideB: p => _mPool(p, 'WSN', '1980s') && _mName(p, ['Tim Raines', 'Andre Dawson', 'Larry Walker', 'Randy Johnson', 'Andres Galarraga'])
  },
  {
    id: 'atlanta_three_era',
    tier: 'FRANCHISE',
    name: 'Atlanta Three-Era Crown',
    story: 'From the 1890s Boston Beaneaters to modern Atlanta, 130 years of Braves baseball converge on one roster.',
    bonusLabel: '130-Year Franchise Continuity',
    sideA: p => _mPool(p, 'ATL', '1890s'),
    sideB: p => p.franchiseId === 'ATL' && (p.decade === '1990s' || p.decade === '2000s' || p.decade === '2020s')
  },
  {
    id: 'emerald_city_torch',
    tier: 'FRANCHISE',
    name: 'Emerald City Torch',
    story: 'The Kid hands the keys to Seattle’s outfield straight to Ichiro—blending 1990s flair with 2001’s 116-win precision.',
    bonusLabel: 'Elite Outfield Defense & Speed',
    sideA: p => _mName(p, ['Ken Griffey Jr.']),
    sideB: p => _mName(p, ['Ichiro Suzuki'])
  },
  {
    id: 'blake_street_bombers',
    tier: 'LEGENDARY',
    name: 'Blake Street Bombers',
    story: 'Larry Walker and Todd Helton reunite to unleash thin-air line drives and gold-glove polish across the lineup.',
    bonusLabel: 'Coors-Grade Contact & Power',
    sideA: p => _mName(p, ['Larry Walker']),
    sideB: p => _mName(p, ['Todd Helton'])
  },
  {
    id: 'rocktober_speed',
    tier: 'FRANCHISE',
    name: 'Mile High Sparkplugs',
    story: 'Juan Pierre’s blazing speed reunites with Colorado’s 2000s thunder—turning singles into doubles and doubles into chaos.',
    bonusLabel: 'Baserunning Chaos & OBP',
    sideA: p => _mPool(p, 'FLA', '2000s') && _mName(p, ['Juan Pierre', 'Preston Wilson']),
    sideB: p => _mPool(p, 'COL', '2000s') && _mName(p, ['Todd Helton', 'Larry Walker', 'Matt Holliday', 'Troy Tulowitzki'])
  },
  {
    id: 'jacobs_field_thunder',
    tier: 'FRANCHISE',
    name: 'Jacobs Field Thunder',
    story: 'Jim Thome reunites with Cleveland’s electrifying 1990s lineup that sold out 455 consecutive nights on the lakefront.',
    bonusLabel: 'Relentless Lineup Depth',
    sideA: p => _mPool(p, 'CHW', '2000s') && _mName(p, ['Jim Thome']),
    sideB: p => _mPool(p, 'CLE', '1990s') && _mName(p, ['Manny Ramirez', 'Roberto Alomar', 'Kenny Lofton', 'Omar Vizquel', 'Albert Belle'])
  },
  {
    id: 'modern_dodgers_mvp',
    tier: 'FRANCHISE',
    name: 'Chavez Ravine MVP Row',
    story: 'Freddie Freeman links up with Mookie Betts or Shohei Ohtani to recreate Los Angeles’s modern championship juggernaut.',
    bonusLabel: 'Top-of-Order OBP & Star Power',
    sideA: p => _mPool(p, 'ATL', '2020s') && _mName(p, ['Freddie Freeman']),
    sideB: p => _mPool(p, 'LAD', '2020s') && _mName(p, ['Mookie Betts', 'Shohei Ohtani', 'Clayton Kershaw'])
  },
  {
    id: 'dodgers_decade_bridge',
    tier: 'FRANCHISE',
    name: 'Chavez Ravine Continuity',
    story: 'Justin Turner, Corey Seager, or Clayton Kershaw bridges Los Angeles’s 2010s pennant runs into their 2020s championship era.',
    bonusLabel: 'Dodger Blue Chemistry & Depth',
    sideA: p => _mPool(p, 'LAD', '2010s') && _mName(p, ['Clayton Kershaw', 'Justin Turner', 'Corey Seager', 'Max Muncy', 'Cody Bellinger']),
    sideB: p => _mPool(p, 'LAD', '2020s') && _mName(p, ['Mookie Betts', 'Shohei Ohtani', 'Freddie Freeman', 'Will Smith', 'Walker Buehler'])
  },
  {
    id: 'blue_jays_1993',
    tier: 'LEGENDARY',
    name: '1993 Back-to-Back Champions',
    story: 'Paul Molitor or John Olerud reunites with Toronto’s SkyDome championship core—pure speed, discipline, and October swagger.',
    bonusLabel: 'Championship Pedigree & Speed',
    sideA: p => (_mPool(p, 'MIL', '1980s') && _mName(p, ['Paul Molitor'])) || (_mPool(p, 'SEA', '2000s') && _mName(p, ['John Olerud'])),
    sideB: p => _mPool(p, 'TOR', '1990s') && _mName(p, ['Rickey Henderson', 'Roberto Alomar', 'Joe Carter', 'Carlos Delgado', 'Dave Winfield'])
  },
  {
    id: 'terminator_92',
    tier: 'FRANCHISE',
    name: "The Terminator's Pennant",
    story: 'Tom Henke locks down the ninth inning for Toronto’s 1990s legends—specs on, splitter diving, game over.',
    bonusLabel: 'Late-Inning Shutdown',
    sideA: p => _mPool(p, 'TEX', '1990s') && _mName(p, ['Tom Henke']),
    sideB: p => _mPool(p, 'TOR', '1990s') && _mName(p, ['Roberto Alomar', 'Joe Carter', 'John Olerud', 'Carlos Delgado', 'Paul Molitor'])
  },
  {
    id: 'idiots_2004',
    tier: 'FRANCHISE',
    name: '2004 Curse Breakers',
    story: 'Keith Foulke or Johnny Damon reunites with Boston’s 2004 legends—bringing back the loose, fearless magic that ended an 86-year drought.',
    bonusLabel: 'Curse-Breaking October Clutch',
    sideA: p => (_mPool(p, 'CHW', '2000s') && _mName(p, ['Keith Foulke'])) || (_mPool(p, 'NYY', '2000s') && _mName(p, ['Johnny Damon'])),
    sideB: p => _mPool(p, 'BOS', '2000s') && _mName(p, ['David Ortiz', 'Pedro Martinez', 'Manny Ramirez', 'Curt Schilling', 'Jason Varitek'])
  },
  {
    id: 'red_sox_2007_mvp',
    tier: 'FRANCHISE',
    name: '2007 Fenway Champions',
    story: 'Mike Lowell or Josh Beckett reunites with Boston’s 2000s title core—steady gloves, clutch doubles, and October ice.',
    bonusLabel: 'Balanced Title Pedigree',
    sideA: p => _mPool(p, 'FLA', '2000s') && _mName(p, ['Mike Lowell', 'Josh Beckett']),
    sideB: p => _mPool(p, 'BOS', '2000s') && _mName(p, ['David Ortiz', 'Dustin Pedroia', 'Jason Varitek', 'Kevin Youkilis', 'Manny Ramirez'])
  },
  {
    id: 'captain_and_pedro',
    tier: 'FRANCHISE',
    name: 'Captain & Pedro',
    story: 'Jason Varitek’s game-calling meets Pedro Martinez at the absolute summit of pitching artistry.',
    bonusLabel: 'Ace Command & Pitching Poise',
    sideA: p => _mName(p, ['Jason Varitek']),
    sideB: p => _mName(p, ['Pedro Martinez'])
  },
  {
    id: 'bloody_sock_battery',
    tier: 'FRANCHISE',
    name: 'Bloody Sock Battery',
    story: 'Jason Varitek behind the dish, Curt Schilling gutting out October innings—pure postseason theater.',
    bonusLabel: 'Peak October Pitching Grit',
    sideA: p => _mName(p, ['Jason Varitek']),
    sideB: p => _mName(p, ['Curt Schilling'])
  },
  {
    id: 'desert_2001_champions',
    tier: 'FRANCHISE',
    name: '2001 Desert Champions',
    story: 'Steve Finley or Matt Williams reunites with Arizona’s 2001 miracle squad—defense, grit, and Game 7 walk-off magic.',
    bonusLabel: 'October Walk-Off Poise',
    sideA: p => (_mPool(p, 'SDP', '1990s') && _mName(p, ['Steve Finley', 'Reggie Sanders'])) || (_mPool(p, 'CLE', '1990s') && _mName(p, ['Matt Williams'])),
    sideB: p => _mPool(p, 'ARI', '2000s') && _mName(p, ['Luis Gonzalez', 'Randy Johnson', 'Curt Schilling', 'Mark Grace', 'Craig Counsell'])
  },
  {
    id: 'crime_dog_rays',
    tier: 'FRANCHISE',
    name: 'Tropicana Trailblazers',
    story: 'Fred McGriff or Greg Vaughn links Tampa Bay’s expansion roots with the 2008 pennant heroes who flipped the AL East upside down.',
    bonusLabel: 'Underdog Power & Grit',
    sideA: p => (_mPool(p, 'ATL', '1990s') || _mPool(p, 'SDP', '1990s')) && _mName(p, ['Fred McGriff', 'Greg Vaughn']),
    sideB: p => _mPool(p, 'TBD', '2000s') && _mName(p, ['Evan Longoria', 'Carl Crawford', 'Carlos Pena', 'Ben Zobrist'])
  },
  {
    id: 'arlington_bash',
    tier: 'FRANCHISE',
    name: 'Arlington Thunder',
    story: 'Jose Canseco or Ivan Rodriguez reunites with Texas’s 1990s sluggers—turning summer nights at The Ballpark into launch pads.',
    bonusLabel: 'High-Octane Slug & Power',
    sideA: p => (_mPool(p, 'BOS', '1990s') && _mName(p, ['Jose Canseco'])) || (_mPool(p, 'FLA', '2000s') && _mName(p, ['Ivan Rodriguez'])),
    sideB: p => _mPool(p, 'TEX', '1990s') && _mName(p, ['Juan Gonzalez', 'Rafael Palmeiro', 'Ivan Rodriguez', 'Ruben Sierra', 'Will Clark'])
  },
  {
    id: 'halo_cy_young_2005',
    tier: 'FRANCHISE',
    name: '2005 Halo Cy Young',
    story: 'Bartolo Colon rejoins Anaheim’s 2000s powerhouse—pairing a 21-win Cy Young heater with Vladimir Guerrero’s laser-beam bat.',
    bonusLabel: 'Rotation Bulk & Lineup Punch',
    sideA: p => _mPool(p, 'CLE', '1990s') && _mName(p, ['Bartolo Colon']),
    sideB: p => _mPool(p, 'ANA', '2000s') && _mName(p, ['Vladimir Guerrero', 'Garret Anderson', 'Francisco Rodriguez', 'Torii Hunter'])
  },
  {
    id: 'four_20_winners_71',
    tier: 'FRANCHISE',
    name: '1971 Four 20-Game Winners',
    story: 'Pat Dobson reunites with Jim Palmer and Baltimore’s legendary 1971 rotation—the rarest pitching feat in modern baseball.',
    bonusLabel: 'Historic Rotation Depth',
    sideA: p => _mPool(p, 'DET', '1960s') && _mName(p, ['Pat Dobson']),
    sideB: p => _mPool(p, 'BAL', '1970s') && _mName(p, ['Jim Palmer', 'Brooks Robinson', 'Frank Robinson', 'Mike Cuellar'])
  },
  {
    id: 'wrigley_century',
    tier: 'FRANCHISE',
    name: 'Wrigley Heritage',
    story: 'From the 1908 Cubs’ Tinker-to-Evers-to-Chance infield to the roaring 1930s pennant clubs—two golden eras of North Side baseball.',
    bonusLabel: 'Cubs Franchise Continuity',
    sideA: p => _mPool(p, 'CHC', '1900s'),
    sideB: p => _mPool(p, 'CHC', '1930s')
  },
  {
    id: 'polo_grounds_rivals',
    tier: 'FRANCHISE',
    name: 'Polo Grounds vs. Ebbets Field',
    story: '1920s New York Giants legends share a clubhouse with 1950s Brooklyn Dodgers—baseball’s fiercest crosstown rivalry turned into one superteam.',
    bonusLabel: 'Crosstown Rivalry Intensity',
    sideA: p => _mPool(p, 'SFG', '1920s') && _mName(p, ['Rogers Hornsby', 'Mel Ott', 'Bill Terry', 'Frankie Frisch']),
    sideB: p => _mPool(p, 'LAD', '1950s') && _mName(p, ['Jackie Robinson', 'Duke Snider', 'Roy Campanella', 'Pee Wee Reese'])
  },
  {
    id: 'tigers_68_champions',
    tier: 'FRANCHISE',
    name: '1968 Motown Roar',
    story: 'Detroit’s 1968 World Series heroes link up with St. Louis’s classic Cardinals—echoing the timeless Fall Classic rivalry of the Midwest.',
    bonusLabel: 'Midwest Championship Grit',
    sideA: p => _mPool(p, 'DET', '1960s') && _mName(p, ['Al Kaline', 'Norm Cash', 'Bill Freehan', 'Willie Horton', 'Mickey Lolich']),
    sideB: p => _mPool(p, 'STL', '1940s') && _mName(p, ['Stan Musial', 'Enos Slaughter', 'Johnny Mize', 'Red Schoendienst'])
  },
  {
    id: 'philly_80_champions',
    tier: 'FRANCHISE',
    name: '1980 Vet Stadium Champions',
    story: 'Mike Schmidt and Steve Carlton’s Phillies link up with their 1980 Fall Classic rivals from Kansas City—pure 1980s baseball theater.',
    bonusLabel: '1980s Pennant Pedigree',
    sideA: p => _mPool(p, 'PHI', '1980s') && _mName(p, ['Mike Schmidt', 'Steve Carlton', 'Pete Rose', 'Tug McGraw']),
    sideB: p => _mPool(p, 'KCR', '1980s') && _mName(p, ['George Brett', 'Dan Quisenberry', 'Willie Wilson', 'Frank White'])
  },
  {
    id: 'oakland_rickey_torch',
    tier: 'FRANCHISE',
    name: 'Man of Steal Lineage',
    story: 'Rickey Henderson bridges the Swingin’ A’s into modern speedball—turning every walk into a triple and rattling every pitcher alive.',
    bonusLabel: 'Elite Leadoff Chaos & Speed',
    sideA: p => _mPool(p, 'TOR', '1990s') && _mName(p, ['Rickey Henderson']),
    sideB: p => _mPool(p, 'OAK', '1970s') && _mName(p, ['Reggie Jackson', 'Sal Bando', 'Bert Campaneris', 'Catfish Hunter', 'Rollie Fingers'])
  },
  {
    id: 'el_presidente_battery',
    tier: 'FRANCHISE',
    name: "El Presidente's Battery",
    story: 'Dennis Martinez reunites with Gary Carter—pairing the pitcher who threw Montreal’s perfect game with the Expos’ beloved Hall of Fame catcher.',
    bonusLabel: 'Precision Command & Framing',
    sideA: p => (_mPool(p, 'BAL', '1970s') || _mPool(p, 'CLE', '1990s')) && _mName(p, ['Dennis Martinez']),
    sideB: p => (_mPool(p, 'WSN', '1980s') || _mPool(p, 'NYM', '1980s')) && _mName(p, ['Gary Carter'])
  },
  {
    id: 'big_cat_comeback',
    tier: 'FRANCHISE',
    name: "The Big Cat's Comeback",
    story: 'Andres Galarraga bridges his Montreal breakout into Atlanta’s late-90s juggernaut—towering tape-measure homers and pure joy.',
    bonusLabel: 'Clubhouse Heart & Power',
    sideA: p => _mPool(p, 'WSN', '1980s') && _mName(p, ['Andres Galarraga']),
    sideB: p => _mPool(p, 'ATL', '1990s') && _mName(p, ['Chipper Jones', 'Greg Maddux', 'Andruw Jones', 'Javy Lopez'])
  },
  {
    id: 'expansion_1998',
    tier: 'FRANCHISE',
    name: '1998 Expansion Twins',
    story: 'Born on the exact same Opening Day in 1998, Arizona and Tampa Bay link arms to prove expansion clubs belong on the biggest stage.',
    bonusLabel: 'Expansion Underdog Grit',
    sideA: p => p.franchiseId === 'ARI',
    sideB: p => p.franchiseId === 'TBD'
  },
  {
    id: 'expansion_1969',
    tier: 'FRANCHISE',
    name: '1969 Expansion Brothers',
    story: 'Kansas City and San Diego entered baseball together in 1969—reuniting pure hitters and clutch arms from the class of ’69.',
    bonusLabel: 'Contact & Late-Inning Lock',
    sideA: p => p.franchiseId === 'KCR',
    sideB: p => p.franchiseId === 'SDP'
  },
  {
    id: 'expansion_1977',
    tier: 'FRANCHISE',
    name: '1977 Expansion Rivals',
    story: 'Seattle and Toronto broke in together in 1977—pairing Pacific Northwest star power with Canada’s championship tradition.',
    bonusLabel: 'Expansion-Club Powerhouse',
    sideA: p => p.franchiseId === 'SEA',
    sideB: p => p.franchiseId === 'TOR'
  },
  {
    id: 'expansion_1993',
    tier: 'FRANCHISE',
    name: '1993 Expansion Class',
    story: 'Colorado and Florida debuted together in 1993—combining Coors-Field thunder with South Florida’s two-time World Series magic.',
    bonusLabel: '1993 Expansion Energy',
    sideA: p => p.franchiseId === 'COL',
    sideB: p => p.franchiseId === 'FLA'
  },
  {
    id: 'expansion_1961_62',
    tier: 'FRANCHISE',
    name: 'Original Expansion Pioneers',
    story: 'The Angels, Astros, and Mets broke open baseball’s first modern expansion wave—uniting iconic franchises born in 1961–62.',
    bonusLabel: 'Expansion Pioneer Synergy',
    sideA: p => p.franchiseId === 'ANA' || p.franchiseId === 'HOU',
    sideB: p => p.franchiseId === 'NYM'
  },
  {
    id: 'al_central_thunder',
    tier: 'FRANCHISE',
    name: 'Midwest Heavyweights',
    story: 'Frank Thomas or Paul Konerko pairs with Detroit’s 1960s sluggers or Minnesota’s 1980s heroes—blue-collar Midwest power.',
    bonusLabel: 'Lineup Muscle & Toughness',
    sideA: p => _mPool(p, 'CHW', '2000s') && _mName(p, ['Frank Thomas', 'Paul Konerko', 'Magglio Ordonez', 'Jim Thome']),
    sideB: p => (_mPool(p, 'DET', '1960s') && _mName(p, ['Al Kaline', 'Norm Cash', 'Willie Horton'])) || (_mPool(p, 'MIN', '1980s') && _mName(p, ['Kirby Puckett', 'Kent Hrbek']))
  },
  {
    id: 'houston_bronx_aces',
    tier: 'FRANCHISE',
    name: 'Modern Ace Lineage',
    story: 'Gerrit Cole bridges Houston’s 2019 strikeout machine straight into the modern Bronx—pure 99-mph postseason heat.',
    bonusLabel: 'High-Strikeout Staff Dominance',
    sideA: p => _mPool(p, 'HOU', '2010s') && _mName(p, ['Gerrit Cole']),
    sideB: p => _mPool(p, 'NYY', '2020s') && _mName(p, ['Aaron Judge', 'Juan Soto', 'Austin Wells', 'Luke Weaver'])
  },
  {
    id: 'seattle_alcs_95',
    tier: 'FRANCHISE',
    name: '1995 ALCS Rematch',
    story: 'Paul Sorrento or Omar Vizquel bridges Cleveland and Seattle’s unforgettable 1995 ALCS clash—two of the most beloved 1990s rosters.',
    bonusLabel: '1990s ALCS Intensity',
    sideA: p => _mPool(p, 'CLE', '1990s') && _mName(p, ['Paul Sorrento', 'Omar Vizquel', 'Manny Ramirez', 'Jim Thome', 'Kenny Lofton']),
    sideB: p => _mPool(p, 'SEA', '1990s') && _mName(p, ['Ken Griffey Jr.', 'Edgar Martinez', 'Jay Buhner', 'Dan Wilson', 'Randy Johnson'])
  },
  {
    id: 'san_diego_thunder',
    tier: 'FRANCHISE',
    name: 'San Diego 1990s Thunder',
    story: 'Gary Sheffield or Fred McGriff reunites with Tony Gwynn—blending .370 pure hitting with ferocious middle-of-order pop.',
    bonusLabel: 'Contact + Power Balance',
    sideA: p => (_mPool(p, 'ATL', '2000s') || _mPool(p, 'NYY', '2000s')) && _mName(p, ['Gary Sheffield']),
    sideB: p => _mPool(p, 'SDP', '1990s') && _mName(p, ['Tony Gwynn', 'Ken Caminiti', 'Trevor Hoffman', 'Fred McGriff'])
  },
  {
    id: 'houston_2017_battery',
    tier: 'FRANCHISE',
    name: 'Minute Maid Battery',
    story: 'Brian McCann’s veteran game-calling reunites with Houston’s 2010s aces—guiding triple-digit fastballs through October pressure.',
    bonusLabel: 'Veteran Pitch-Calling & Poise',
    sideA: p => _mPool(p, 'ATL', '2000s') && _mName(p, ['Brian McCann']),
    sideB: p => _mPool(p, 'HOU', '2010s') && _mName(p, ['Justin Verlander', 'Gerrit Cole', 'Charlie Morton', 'Jose Altuve'])
  },

  {
    id: 'ohio_baseball_royalty',
    tier: 'FRANCHISE',
    name: 'Ohio Baseball Royalty',
    story: 'Cincinnati’s Big Red Machine links up with Cleveland’s 1990s Jacobs Field thunder—uniting the two proudest franchises in Ohio.',
    bonusLabel: 'Midwest Power & OBP Surge',
    sideA: p => _mPool(p, 'CIN', '1970s'),
    sideB: p => _mPool(p, 'CLE', '1990s')
  },
  {
    id: 'keystone_state_rivals',
    tier: 'FRANCHISE',
    name: 'Keystone State Rivals',
    story: 'Pittsburgh’s proud heritage joins forces with Philadelphia’s 1980 champions—forging an all-Pennsylvania powerhouse.',
    bonusLabel: 'Pennsylvania Grit & Defense',
    sideA: p => p.franchiseId === 'PIT',
    sideB: p => _mPool(p, 'PHI', '1980s')
  },

  /* ==========================================================================
     TIER 3: BASEBALL STORIES (39 Classic Partnerships + 5 Dynamic Archetypes)
     ========================================================================== */
  {
    id: 'core_four_battery',
    tier: 'BASEBALL',
    name: 'Bronx Championship Battery',
    story: 'Jorge Posada’s fire behind the plate steadying Mariano Rivera or Andy Pettitte with the pennant hanging in the balance.',
    bonusLabel: 'Bullpen & Rotation Composure',
    sideA: p => _mName(p, ['Jorge Posada']),
    sideB: p => _mName(p, ['Mariano Rivera', 'Andy Pettitte', 'Roger Clemens'])
  },
  {
    id: 'subway_perfect_battery',
    tier: 'BASEBALL',
    name: 'Perfect Game Battery',
    story: 'David Cone reunites with Jorge Posada or Derek Jeter—reliving that electric July afternoon in the Bronx when Cone threw perfection.',
    bonusLabel: 'Peak Ace Command',
    sideA: p => _mPool(p, 'NYM', '1980s') && _mName(p, ['David Cone']),
    sideB: p => (_mPool(p, 'NYY', '1990s') || _mPool(p, 'NYY', '2000s')) && _mName(p, ['Jorge Posada', 'Derek Jeter', 'Mariano Rivera'])
  },
  {
    id: 'knuckleball_battery',
    tier: 'BASEBALL',
    name: 'Knuckleball Battery',
    story: 'Jason Varitek straps on the oversized mitt to tame Tim Wakefield’s dancing 65-mph knuckleball.',
    bonusLabel: 'Pitching Variance Shield',
    sideA: p => _mName(p, ['Jason Varitek']),
    sideB: p => _mName(p, ['Tim Wakefield'])
  },
  {
    id: 'mariners_craft_battery',
    tier: 'BASEBALL',
    name: 'Mariners Craft Battery',
    story: 'Dan Wilson and Jamie Moyer outthink every slugger in the league with changeups, edges, and veteran savvy.',
    bonusLabel: 'Defense & Pitching Efficiency',
    sideA: p => _mName(p, ['Dan Wilson']),
    sideB: p => _mName(p, ['Jamie Moyer'])
  },
  {
    id: 'braves_battery',
    tier: 'BASEBALL',
    name: 'Fulton County Battery',
    story: 'Javy Lopez frames the outside corner for Atlanta’s Hall of Fame arms—turning borderline strikes into effortless outs.',
    bonusLabel: 'Staff Control & Run Prevention',
    sideA: p => _mName(p, ['Javy Lopez']),
    sideB: p => _mName(p, ['Greg Maddux', 'Tom Glavine', 'John Smoltz'])
  },
  {
    id: 'dodger_battery',
    tier: 'BASEBALL',
    name: 'Modern Dodger Battery',
    story: 'Will Smith guides Clayton Kershaw’s vintage curveball through October traffic with calm precision.',
    bonusLabel: 'Rotation Stability & Offense',
    sideA: p => _mPool(p, 'LAD', '2020s') && _mName(p, ['Will Smith']),
    sideB: p => _mPool(p, 'LAD', '2010s') && _mName(p, ['Clayton Kershaw', 'Kenley Jansen', 'Zack Greinke'])
  },
  {
    id: 'golden_glove_keystone',
    tier: 'BASEBALL',
    name: 'Golden Glove Keystone',
    story: 'Omar Vizquel and Roberto Alomar reunite up the middle—turning impossible grounders into balletic double plays.',
    bonusLabel: 'Elite Team Defense',
    sideA: p => _mName(p, ['Omar Vizquel']),
    sideB: p => _mName(p, ['Roberto Alomar'])
  },
  {
    id: 'seattle_reunion_90s',
    tier: 'BASEBALL',
    name: '1990s Seattle Reunion',
    story: 'Ken Griffey Jr. and Alex Rodriguez share a lineup once again—what might have been if Seattle’s two prodigies never split.',
    bonusLabel: 'Superstar Offense Surge',
    sideA: p => _mName(p, ['Ken Griffey Jr.']),
    sideB: p => _mName(p, ['Alex Rodriguez'])
  },
  {
    id: 'bronx_left_side',
    tier: 'BASEBALL',
    name: 'Bronx Left Side',
    story: 'Derek Jeter and Alex Rodriguez lock down short and third, bringing marquee star power and relentless run production.',
    bonusLabel: 'Infield Offense & Star Power',
    sideA: p => _mName(p, ['Derek Jeter']),
    sideB: p => _mName(p, ['Alex Rodriguez'])
  },
  {
    id: 'world_series_arms',
    tier: 'BASEBALL',
    name: 'October Money Arms',
    story: 'Josh Beckett and Curt Schilling share a rotation—two fearless big-game starters built for Game 6 and Game 7.',
    bonusLabel: 'Big-Game Postseason Pitching',
    sideA: p => _mName(p, ['Josh Beckett']),
    sideB: p => _mName(p, ['Curt Schilling'])
  },
  {
    id: 'riverfront_to_shea',
    tier: 'BASEBALL',
    name: 'Riverfront to Shea Grit',
    story: 'Ray Knight or George Foster bridges the Big Red Machine into the 1986 Mets—old-school toughness and clutch October swings.',
    bonusLabel: 'Veteran Clutch & Grit',
    sideA: p => _mPool(p, 'NYM', '1980s') && _mName(p, ['Ray Knight', 'George Foster']),
    sideB: p => _mPool(p, 'CIN', '1970s') && _mName(p, ['Johnny Bench', 'Joe Morgan', 'Tony Perez', 'Pete Rose'])
  },
  {
    id: 'nasty_boys_90s',
    tier: 'BASEBALL',
    name: 'Late-Inning Fireballers',
    story: 'Randy Myers teams up with Trevor Hoffman or Dwight Gooden—bringing relentless 1980s–90s bullpen heat to the final six outs.',
    bonusLabel: 'Bullpen Lockdown',
    sideA: p => _mPool(p, 'NYM', '1980s') && _mName(p, ['Randy Myers']),
    sideB: p => _mPool(p, 'SDP', '1990s') && _mName(p, ['Trevor Hoffman', 'Kevin Brown', 'Tony Gwynn'])
  },
  {
    id: 'al_gold_glove_corners',
    tier: 'BASEBALL',
    name: 'Hot Corner Perfection',
    story: 'Brooks Robinson and Mike Schmidt—the greatest defensive and offensive third basemen in baseball history sharing one clubhouse.',
    bonusLabel: 'Infield Defense & Power',
    sideA: p => _mName(p, ['Brooks Robinson']),
    sideB: p => _mName(p, ['Mike Schmidt'])
  },
  {
    id: 'bo_and_kid',
    tier: 'BASEBALL',
    name: '1990s Highlight Reel',
    story: 'Bo Jackson and Ken Griffey Jr. in the same outfield—two once-in-a-century athletes who turned every game into prime-time theater.',
    bonusLabel: 'Explosive Athleticism & Defense',
    sideA: p => _mName(p, ['Bo Jackson']),
    sideB: p => _mName(p, ['Ken Griffey Jr.'])
  },
  {
    id: 'pure_hitters_club',
    tier: 'BASEBALL',
    name: 'The .350 Batting Clinic',
    story: 'Tony Gwynn and Ichiro Suzuki back-to-back—two surgical contact artists who turn every at-bat into a masterclass.',
    bonusLabel: 'Relentless On-Base Pressure',
    sideA: p => _mName(p, ['Tony Gwynn']),
    sideB: p => _mName(p, ['Ichiro Suzuki'])
  },
  {
    id: 'strikeout_artistry',
    tier: 'BASEBALL',
    name: 'Filth & Velocity',
    story: 'Pedro Martinez and Randy Johnson on the same staff—the two most unhittable peaks of the steroid era.',
    bonusLabel: 'Historic Strikeout Dominance',
    sideA: p => _mName(p, ['Pedro Martinez']),
    sideB: p => _mName(p, ['Randy Johnson'])
  },
  {
    id: 'lefty_legends',
    tier: 'BASEBALL',
    name: 'Southpaw Immortals',
    story: 'Sandy Koufax or Steve Carlton pairs with Clayton Kershaw—generations of unhittable left-handed curveballs and sliders.',
    bonusLabel: 'Southpaw Staff Mastery',
    sideA: p => _mName(p, ['Sandy Koufax', 'Steve Carlton']),
    sideB: p => _mName(p, ['Clayton Kershaw'])
  },
  {
    id: 'sandman_and_bells',
    tier: 'BASEBALL',
    name: 'Enter Sandman & Hells Bells',
    story: 'Mariano Rivera and Trevor Hoffman sharing a bullpen—the two greatest entrance songs and ninth-inning locks in baseball history.',
    bonusLabel: 'Unhittable Ninth Inning',
    sideA: p => _mName(p, ['Mariano Rivera']),
    sideB: p => _mName(p, ['Trevor Hoffman'])
  },
  {
    id: 'two_way_unicorns',
    tier: 'BASEBALL',
    name: 'Century-Spanning Unicorns',
    story: '1910s Babe Ruth meets 2020s Shohei Ohtani—the only two players in baseball history to conquer both the mound and the batter’s box.',
    bonusLabel: 'Mythic Two-Way Aura',
    sideA: p => _mPool(p, 'BOS', '1910s') && _mName(p, ['Babe Ruth']),
    sideB: p => _mPool(p, 'LAD', '2020s') && _mName(p, ['Shohei Ohtani'])
  },
  {
    id: 'iron_catchers',
    tier: 'BASEBALL',
    name: 'Field Generals Behind the Dish',
    story: 'Johnny Bench or Ivan Rodriguez links up with Roy Campanella or Gary Carter—unmatched leadership and pitch-framing mastery.',
    bonusLabel: 'Pitching Staff Command',
    sideA: p => _mName(p, ['Johnny Bench', 'Ivan Rodriguez']),
    sideB: p => _mName(p, ['Roy Campanella', 'Gary Carter', 'Bill Freehan'])
  },
  {
    id: 'switch_hit_thunder',
    tier: 'BASEBALL',
    name: 'Switch-Hitting Symmetry',
    story: 'Chipper Jones and Eddie Murray or Carlos Beltran—relentless power from both sides of the plate with zero platoon weakness.',
    bonusLabel: 'Platoon-Proof Lineup Depth',
    sideA: p => _mName(p, ['Chipper Jones']),
    sideB: p => _mName(p, ['Eddie Murray', 'Roberto Alomar', 'Bernie Williams'])
  },
  {
    id: 'canada_to_bronx',
    tier: 'BASEBALL',
    name: 'Rock Raines to the Bronx',
    story: 'Tim Raines reunites his 1980s Montreal speed with New York’s 1990s dynasty—sparking rallies from the top of the order.',
    bonusLabel: 'Leadoff OBP & Championship Speed',
    sideA: p => _mPool(p, 'WSN', '1980s') && _mName(p, ['Tim Raines']),
    sideB: p => _mPool(p, 'NYY', '1990s') && _mName(p, ['Derek Jeter', 'Bernie Williams', 'Mariano Rivera', 'Paul O’Neill'])
  },
  {
    id: 'boston_to_bronx_aces',
    tier: 'BASEBALL',
    name: 'Rocket & Sandman',
    story: 'Roger Clemens hands a seven-inning gem straight to Mariano Rivera—recreating New York’s turn-of-the-century postseason buzzsaw.',
    bonusLabel: 'Ace-to-Closer Dominance',
    sideA: p => (_mPool(p, 'BOS', '1990s') || _mPool(p, 'TOR', '1990s')) && _mName(p, ['Roger Clemens']),
    sideB: p => (_mPool(p, 'NYY', '1990s') || _mPool(p, 'NYY', '2000s')) && _mName(p, ['Mariano Rivera', 'Derek Jeter', 'Jorge Posada'])
  },
  {
    id: 'tor_nyy_southpaws',
    tier: 'BASEBALL',
    name: '1990s AL East Aces',
    story: 'David Wells or Jimmy Key bridges Toronto’s back-to-back titles straight into the Bronx dynasty—pure October craft.',
    bonusLabel: 'Big-Game Southpaw Poise',
    sideA: p => _mPool(p, 'TOR', '1990s') && _mName(p, ['David Wells', 'Jimmy Key']),
    sideB: p => _mPool(p, 'NYY', '1990s') && _mName(p, ['Derek Jeter', 'Jorge Posada', 'Bernie Williams', 'Mariano Rivera'])
  },
  {
    id: 'cleveland_nyy_bullpen',
    tier: 'BASEBALL',
    name: 'Late-1990s Setup Bridge',
    story: 'Jeff Nelson or Mike Jackson brings ruthless 1990s eighth-inning sliders to bridge your starter straight to the ninth.',
    bonusLabel: 'Setup-to-Closer Stability',
    sideA: p => (_mPool(p, 'SEA', '1990s') || _mPool(p, 'CLE', '1990s')) && _mName(p, ['Jeff Nelson', 'Mike Jackson']),
    sideB: p => (_mPool(p, 'NYY', '1990s') || _mPool(p, 'SEA', '2000s')) && _mName(p, ['Mariano Rivera', 'Kazuhiro Sasaki', 'Dan Wilson'])
  },
  {
    id: 'boone_brothers_sea',
    tier: 'BASEBALL',
    name: '116-Win Mariners Infield',
    story: 'Bret Boone bridges 1990s Seattle straight into 2001’s 116-win juggernaut—bat flips, double plays, and electric middle-infield pop.',
    bonusLabel: 'Infield Power & Energy',
    sideA: p => _mPool(p, 'SEA', '1990s') && _mName(p, ['Bret Boone', 'Dan Wilson', 'Jamie Moyer']),
    sideB: p => _mPool(p, 'SEA', '2000s') && _mName(p, ['Ichiro Suzuki', 'Edgar Martinez', 'John Olerud', 'Mike Cameron'])
  },
  {
    id: 'atl_col_pitching',
    tier: 'BASEBALL',
    name: 'Thin-Air & Fulton County',
    story: 'Mike Hampton or Rafael Soriano links Atlanta’s pitching tradition with Colorado’s 2000s sluggers—groundballs and tape-measure shots.',
    bonusLabel: 'Run Prevention & Lineup Balance',
    sideA: p => _mPool(p, 'COL', '2000s') && _mName(p, ['Mike Hampton', 'Todd Helton', 'Larry Walker']),
    sideB: p => _mPool(p, 'ATL', '2000s') && _mName(p, ['Chipper Jones', 'Andruw Jones', 'Greg Maddux', 'John Smoltz'])
  },
  {
    id: 'fla_lad_shortstops',
    tier: 'BASEBALL',
    name: 'Electric Shortstop Spark',
    story: 'Hanley Ramirez links his Marlins batting-title explosion with Los Angeles’s 2010s resurgence—gap-to-gap speed and swagger.',
    bonusLabel: 'Dynamic Offense & Speed',
    sideA: p => _mPool(p, 'FLA', '2000s') && _mName(p, ['Hanley Ramirez']),
    sideB: p => _mPool(p, 'LAD', '2010s') && _mName(p, ['Clayton Kershaw', 'Matt Kemp', 'Adrian Gonzalez', 'Justin Turner'])
  },
  {
    id: 'bal_min_dh_grit',
    tier: 'BASEBALL',
    name: '1987 Veteran Leader',
    story: 'Don Baylor brings his trademark toughness from 1970s Baltimore straight into Minnesota’s 1987 championship clubhouse.',
    bonusLabel: 'Clubhouse Leadership & RBI',
    sideA: p => _mPool(p, 'BAL', '1970s') && _mName(p, ['Don Baylor']),
    sideB: p => _mPool(p, 'MIN', '1980s') && _mName(p, ['Kirby Puckett', 'Kent Hrbek', 'Gary Gaetti', 'Frank Viola'])
  },
  {
    id: 'kcr_atl_pitching',
    tier: 'BASEBALL',
    name: 'October Craft Southpaw',
    story: 'Charlie Leibrandt bridges Kansas City’s 1985 title run into Atlanta’s worst-to-first 1991 miracle.',
    bonusLabel: 'Postseason Experience',
    sideA: p => _mPool(p, 'KCR', '1980s') && _mName(p, ['Charlie Leibrandt']),
    sideB: p => _mPool(p, 'ATL', '1990s') && _mName(p, ['Greg Maddux', 'Tom Glavine', 'John Smoltz', 'Chipper Jones'])
  },
  {
    id: 'sea_mil_no_hitter',
    tier: 'BASEBALL',
    name: 'Kingdome No-Hitter Arm',
    story: 'Chris Bosio links Milwaukee’s gritty 1980s rotation with Seattle’s unforgettable 1990s core.',
    bonusLabel: 'Rotation Toughness',
    sideA: p => _mPool(p, 'MIL', '1980s') && _mName(p, ['Chris Bosio']),
    sideB: p => _mPool(p, 'SEA', '1990s') && _mName(p, ['Ken Griffey Jr.', 'Edgar Martinez', 'Dan Wilson', 'Jay Buhner'])
  },
  {
    id: 'bos_tex_closer',
    tier: 'BASEBALL',
    name: '1990s Closer Pedigree',
    story: 'Jeff Russell or Tom Gordon links Boston’s 1990s bullpen with marquee AL sluggers—nail-biting ninth-inning escapes.',
    bonusLabel: 'Late-Inning Resilience',
    sideA: p => _mPool(p, 'BOS', '1990s') && _mName(p, ['Tom Gordon', 'Jeff Russell', 'Jeff Reardon']),
    sideB: p => (_mPool(p, 'NYY', '2000s') || _mPool(p, 'TEX', '1990s') || _mPool(p, 'MIN', '1980s')) && _mName(p, ['Mariano Rivera', 'Ivan Rodriguez', 'Kirby Puckett'])
  },
  {
    id: 'tbd_lad_bullpen',
    tier: 'BASEBALL',
    name: 'Lefty Specialist Lock',
    story: 'J.P. Howell bridges Tampa Bay’s 2008 pennant bullpen into Los Angeles’s 2010s NL West dynasty.',
    bonusLabel: 'Bullpen Matchup Edge',
    sideA: p => _mPool(p, 'TBD', '2000s') && _mName(p, ['J.P. Howell']),
    sideB: p => _mPool(p, 'LAD', '2010s') && _mName(p, ['Clayton Kershaw', 'Kenley Jansen', 'Justin Turner', 'Corey Seager'])
  },
  {
    id: 'bos_nyy_1920s_pipeline',
    tier: 'BASEBALL',
    name: 'The Fenway-to-Bronx Pipeline',
    story: 'Carl Mays, Sad Sam Jones, or Everett Scott reunites with their former Red Sox or Yankee teammates—revisiting the trades that built a dynasty.',
    bonusLabel: 'Dead-Ball-to-Live-Ball Chemistry',
    sideA: p => _mPool(p, 'BOS', '1910s') && _mName(p, ['Carl Mays', 'Sad Sam Jones', 'Everett Scott', 'Babe Ruth']),
    sideB: p => _mPool(p, 'NYY', '1920s') && _mName(p, ['Lou Gehrig', 'Earle Combs', 'Tony Lazzeri', 'Waite Hoyt', 'Bob Meusel'])
  },
  {
    id: 'cin_bal_1970_rematch',
    tier: 'BASEBALL',
    name: '1970 Fall Classic Reunion',
    story: 'Lee May bridges the 1970 World Series foes—uniting Cincinnati’s young Big Red Machine with Baltimore’s defensive masterpiece.',
    bonusLabel: '1970s Championship Polish',
    sideA: p => _mPool(p, 'CIN', '1970s') && _mName(p, ['Lee May', 'Johnny Bench', 'Joe Morgan']),
    sideB: p => _mPool(p, 'BAL', '1970s') && _mName(p, ['Brooks Robinson', 'Frank Robinson', 'Jim Palmer', 'Eddie Murray'])
  },
  {
    id: 'sea_ana_southpaw',
    tier: 'BASEBALL',
    name: 'AL West Craft',
    story: 'Jarrod Washburn links Anaheim’s 2002 championship rotation with Seattle’s 2000s veterans—steady innings and sharp defense.',
    bonusLabel: 'AL West Pitching Poise',
    sideA: p => _mPool(p, 'SEA', '2000s') && _mName(p, ['Jarrod Washburn', 'Aaron Sele']),
    sideB: p => _mPool(p, 'ANA', '2000s') && _mName(p, ['Vladimir Guerrero', 'Garret Anderson', 'Francisco Rodriguez', 'Troy Percival'])
  },
  {
    id: 'tex_nyy_closer',
    tier: 'BASEBALL',
    name: '1996 World Series MVP',
    story: 'John Wetteland brings his 1996 Fall Classic MVP fire from Texas straight back to New York’s dynasty core.',
    bonusLabel: 'October Ninth-Inning Fire',
    sideA: p => _mPool(p, 'TEX', '1990s') && _mName(p, ['John Wetteland']),
    sideB: p => _mPool(p, 'NYY', '1990s') && _mName(p, ['Derek Jeter', 'Bernie Williams', 'Mariano Rivera', 'Andy Pettitte'])
  },
  {
    id: 'atl_nyy_slug',
    tier: 'BASEBALL',
    name: '2009 Championship Switch-Hitter',
    story: 'Mark Teixeira brings his slick glove and switch-hitting power from Atlanta straight into New York’s 2009 title lineup.',
    bonusLabel: 'Infield Defense & Switch Power',
    sideA: p => _mPool(p, 'ATL', '2000s') && _mName(p, ['Mark Teixeira']),
    sideB: p => _mPool(p, 'NYY', '2000s') && _mName(p, ['Derek Jeter', 'Alex Rodriguez', 'Mariano Rivera', 'Jorge Posada', 'Hideki Matsui'])
  },
  {
    id: 'fla_nyy_2009',
    tier: 'BASEBALL',
    name: '2009 Power Arm',
    story: 'A.J. Burnett’s wicked curveball links South Florida’s fearless 2000s rotation with New York’s 2009 championship run.',
    bonusLabel: 'High-Strikeout Staff Boost',
    sideA: p => _mPool(p, 'FLA', '2000s') && _mName(p, ['A.J. Burnett']),
    sideB: p => _mPool(p, 'NYY', '2000s') && _mName(p, ['Derek Jeter', 'Alex Rodriguez', 'Jorge Posada', 'Mariano Rivera'])
  },

  /* --- 5 Dynamic Universal Baseball Stories (work across ALL 43 pools & full Lahman DB) --- */
  {
    id: 'universal_battery',
    tier: 'BASEBALL',
    name: 'Clubhouse Battery',
    story: 'A pitcher and catcher from the same franchise link up—speaking the same language on every two-strike pitch.',
    bonusLabel: 'Pitching Command & Catcher Framing',
    dynamic: true,
    matchPair: (a, b) => a.franchiseId === b.franchiseId && (
      (_isPos(a, ['C']) && _isPos(b, ['SP', 'RP'])) ||
      (_isPos(b, ['C']) && _isPos(a, ['SP', 'RP']))
    ),
    canOpen: p => _isPos(p, ['C', 'SP', 'RP'])
  },
  {
    id: 'universal_dp_duo',
    tier: 'BASEBALL',
    name: 'Double Play Duo',
    story: 'A shortstop and second baseman from the same era turn the infield into a no-fly zone up the middle.',
    bonusLabel: 'Up-the-Middle Defense',
    dynamic: true,
    matchPair: (a, b) => a.decade === b.decade && (
      (_isPos(a, ['SS']) && _isPos(b, ['2B'])) ||
      (_isPos(b, ['SS']) && _isPos(a, ['2B']))
    ),
    canOpen: p => _isPos(p, ['SS', '2B'])
  },
  {
    id: 'universal_ace_closer',
    tier: 'BASEBALL',
    name: 'Ace & Closer Lock',
    story: 'A dominant starter hands a seventh-inning lead straight to an elite closer from the same era—shortening every game to six innings.',
    bonusLabel: 'Late-Inning Shutdown',
    dynamic: true,
    matchPair: (a, b) => a.decade === b.decade && (
      (a.pos === 'SP' && b.pos === 'RP') ||
      (b.pos === 'SP' && a.pos === 'RP')
    ),
    canOpen: p => p.pos === 'SP' || p.pos === 'RP'
  },
  {
    id: 'universal_heart_order',
    tier: 'BASEBALL',
    name: 'Heart of the Order',
    story: 'Two 30-homer sluggers from the same franchise or era protect each other in the 3-and-4 holes—nowhere for opposing pitchers to hide.',
    bonusLabel: 'Lineup Protection & Slug',
    dynamic: true,
    matchPair: (a, b) => (a.franchiseId === b.franchiseId || a.decade === b.decade) &&
      a.type === 'H' && b.type === 'H' && (a.stats?.hr || 0) >= 30 && (b.stats?.hr || 0) >= 30,
    canOpen: p => p.type === 'H' && (p.stats?.hr || 0) >= 30
  },
  {
    id: 'universal_speed_defense',
    tier: 'BASEBALL',
    name: 'Speed & Defense',
    story: 'Two Gold Glove or 22-steal sparkplugs from the same era manufacture runs and steal extra-base hits in the gaps.',
    bonusLabel: 'Baserunning Pressure & Glove Work',
    dynamic: true,
    matchPair: (a, b) => a.decade === b.decade && a.type === 'H' && b.type === 'H' &&
      ((a.stats?.sb || 0) >= 22 || (a.acc?.gg || 0) >= 3) &&
      ((b.stats?.sb || 0) >= 22 || (b.acc?.gg || 0) >= 3),
    canOpen: p => p.type === 'H' && ((p.stats?.sb || 0) >= 22 || (p.acc?.gg || 0) >= 3)
  }
];

function evaluateNamedStories(rosterList) {
  const completed = [];
  const potential = [];
  const completedIds = new Set();

  for (const st of NAMED_STORIES) {
    if (st.dynamic) {
      let matchedPair = null;
      for (let i = 0; i < rosterList.length && !matchedPair; i++) {
        for (let j = i + 1; j < rosterList.length; j++) {
          if (st.matchPair(rosterList[i], rosterList[j])) {
            matchedPair = [rosterList[i], rosterList[j]];
            break;
          }
        }
      }
      if (matchedPair) {
        completedIds.add(st.id);
        completed.push({ ...st, tierMeta: STORY_TIERS[st.tier], players: matchedPair });
      }
      continue;
    }

    let matchA = null;
    let matchB = null;
    for (const p of rosterList) {
      if (!matchA && st.sideA(p)) matchA = p;
      else if (!matchB && st.sideB(p)) matchB = p;
    }
    if (!matchA || !matchB) {
      matchA = null; matchB = null;
      for (const p of rosterList) {
        if (!matchB && st.sideB(p)) matchB = p;
        else if (!matchA && st.sideA(p)) matchA = p;
      }
    }

    if (matchA && matchB && matchA.playerKey !== matchB.playerKey) {
      completedIds.add(st.id);
      completed.push({ ...st, tierMeta: STORY_TIERS[st.tier], players: [matchA, matchB] });
    } else if (matchA || matchB) {
      potential.push({ ...st, tierMeta: STORY_TIERS[st.tier], opener: matchA || matchB });
    }
  }

  completed.sort((a, b) => a.tierMeta.rank - b.tierMeta.rank);
  potential.sort((a, b) => a.tierMeta.rank - b.tierMeta.rank);
  return { completed, potential, completedIds };
}

function getStoriesCompletedByCandidate(candidate, rosterList) {
  if (!candidate || !rosterList || rosterList.length === 0) return [];
  const before = evaluateNamedStories(rosterList);
  const after = evaluateNamedStories([...rosterList, candidate]);
  return after.completed.filter(st => !before.completedIds.has(st.id));
}
