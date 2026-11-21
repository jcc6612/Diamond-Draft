/* ============================================================================
   DIAMOND DRAFT V2 — ALL 30 MLB FRANCHISES + HISTORICAL RELOCATION INDEX
   Canonical franchID keys aligned with SABR Lahman Baseball Database
   ============================================================================ */

const FRANCHISES = {
  ARI: { id: 'ARI', name: 'Arizona Diamondbacks', abbr: 'ARI', primary: '#A71930', secondary: '#E3D4AD' },
  ATL: { id: 'ATL', name: 'Atlanta Braves', abbr: 'ATL', primary: '#CE1141', secondary: '#C8D0DC' },
  BAL: { id: 'BAL', name: 'Baltimore Orioles', abbr: 'BAL', primary: '#DF4601', secondary: '#C8D0DC' },
  BOS: { id: 'BOS', name: 'Boston Red Sox', abbr: 'BOS', primary: '#BD3039', secondary: '#C8D0DC' },
  CHC: { id: 'CHC', name: 'Chicago Cubs', abbr: 'CHC', primary: '#0E3386', secondary: '#CC3433' },
  CHW: { id: 'CHW', name: 'Chicago White Sox', abbr: 'CHW', primary: '#7A8596', secondary: '#E4E9F0' },
  CIN: { id: 'CIN', name: 'Cincinnati Reds', abbr: 'CIN', primary: '#C6011F', secondary: '#C8D0DC' },
  CLE: { id: 'CLE', name: 'Cleveland Guardians', abbr: 'CLE', primary: '#C41E3A', secondary: '#C8D0DC' },
  COL: { id: 'COL', name: 'Colorado Rockies', abbr: 'COL', primary: '#6B4C9A', secondary: '#C4CED4' },
  DET: { id: 'DET', name: 'Detroit Tigers', abbr: 'DET', primary: '#FA4616', secondary: '#C8D0DC' },
  FLA: { id: 'FLA', name: 'Miami Marlins', abbr: 'MIA', primary: '#00A3E0', secondary: '#EF3340' },
  HOU: { id: 'HOU', name: 'Houston Astros', abbr: 'HOU', primary: '#EB6E1F', secondary: '#C8D0DC' },
  KCR: { id: 'KCR', name: 'Kansas City Royals', abbr: 'KCR', primary: '#1D5DA8', secondary: '#BD9B60' },
  ANA: { id: 'ANA', name: 'Los Angeles Angels', abbr: 'LAA', primary: '#BA0021', secondary: '#C4CED4' },
  LAD: { id: 'LAD', name: 'Los Angeles Dodgers', abbr: 'LAD', primary: '#1E73BE', secondary: '#E4E9F0' },
  MIL: { id: 'MIL', name: 'Milwaukee Brewers', abbr: 'MIL', primary: '#B6922E', secondary: '#C8D0DC' },
  MIN: { id: 'MIN', name: 'Minnesota Twins', abbr: 'MIN', primary: '#D31145', secondary: '#C8D0DC' },
  NYM: { id: 'NYM', name: 'New York Mets', abbr: 'NYM', primary: '#FF5910', secondary: '#0057B8' },
  NYY: { id: 'NYY', name: 'New York Yankees', abbr: 'NYY', primary: '#6C84A6', secondary: '#E4E9F0' },
  OAK: { id: 'OAK', name: 'Athletics', abbr: 'OAK', primary: '#007A53', secondary: '#EFB21E' },
  PHI: { id: 'PHI', name: 'Philadelphia Phillies', abbr: 'PHI', primary: '#E81828', secondary: '#C8D0DC' },
  PIT: { id: 'PIT', name: 'Pittsburgh Pirates', abbr: 'PIT', primary: '#E5B21E', secondary: '#C8D0DC' },
  SDP: { id: 'SDP', name: 'San Diego Padres', abbr: 'SDP', primary: '#C69214', secondary: '#C8D0DC' },
  SFG: { id: 'SFG', name: 'San Francisco Giants', abbr: 'SFG', primary: '#FD5A1E', secondary: '#C8D0DC' },
  SEA: { id: 'SEA', name: 'Seattle Mariners', abbr: 'SEA', primary: '#008C8C', secondary: '#C4CED4' },
  STL: { id: 'STL', name: 'St. Louis Cardinals', abbr: 'STL', primary: '#C41E3A', secondary: '#C8D0DC' },
  TBD: { id: 'TBD', name: 'Tampa Bay Rays', abbr: 'TBR', primary: '#2E7CC4', secondary: '#8FBCE6' },
  TEX: { id: 'TEX', name: 'Texas Rangers', abbr: 'TEX', primary: '#C0111F', secondary: '#0052A5' },
  TOR: { id: 'TOR', name: 'Toronto Blue Jays', abbr: 'TOR', primary: '#1E6BB8', secondary: '#C8D0DC' },
  WSN: { id: 'WSN', name: 'Washington Nationals', abbr: 'WSN', primary: '#AB0003', secondary: '#C8D0DC' }
};

/* Maps historical Lahman teamIDs / aliases to canonical franchID */
const TEAM_TO_FRANCHISE = {
  BSN: 'ATL', MLN: 'ATL', ATL: 'ATL',
  MLA: 'BAL', SLA: 'BAL', BAL: 'BAL',
  BOS: 'BOS',
  CHN: 'CHC', CHC: 'CHC',
  CHA: 'CHW', CHW: 'CHW',
  CIN: 'CIN',
  CLE: 'CLE',
  COL: 'COL',
  DET: 'DET',
  FLO: 'FLA', MIA: 'FLA', FLA: 'FLA',
  HOU: 'HOU',
  KCA: 'OAK', PHA: 'OAK', OAK: 'OAK', ATH: 'OAK',
  KCR: 'KCR',
  LAA: 'ANA', CAL: 'ANA', ANA: 'ANA',
  BRO: 'LAD', LAN: 'LAD', LAD: 'LAD',
  SE1: 'MIL', ML4: 'MIL', MIL: 'MIL',
  WS1: 'MIN', MIN: 'MIN',
  NYN: 'NYM', NYM: 'NYM',
  NYA: 'NYY', NYY: 'NYY',
  PHI: 'PHI',
  PIT: 'PIT',
  SDN: 'SDP', SDP: 'SDP',
  NY1: 'SFG', SFN: 'SFG', SFG: 'SFG',
  SEA: 'SEA',
  SLN: 'STL', STL: 'STL',
  TBA: 'TBD', TBR: 'TBD', TBD: 'TBD',
  WS2: 'TEX', TEX: 'TEX',
  TOR: 'TOR',
  MON: 'WSN', WAS: 'WSN', WSN: 'WSN',
  ARI: 'ARI'
};

function resolveFranchise(code) {
  const fId = TEAM_TO_FRANCHISE[code] || code;
  return FRANCHISES[fId] || { id: fId, name: fId, abbr: fId, primary: '#9BA6B8', secondary: '#C8D0DC' };
}

const SUPPORTED_DECADES = [
  '1890s', '1900s', '1910s', '1920s', '1930s', '1940s', '1950s',
  '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'
];

/* Era-accurate historical club names for relocated / renamed franchises */
const HISTORICAL_CLUB_NAMES = {
  LAD: { '1890s': 'Brooklyn Bridegrooms', '1900s': 'Brooklyn Superbas', '1910s': 'Brooklyn Robins', '1920s': 'Brooklyn Robins', '1930s': 'Brooklyn Dodgers', '1940s': 'Brooklyn Dodgers', '1950s': 'Brooklyn Dodgers' },
  SFG: { '1890s': 'New York Giants', '1900s': 'New York Giants', '1910s': 'New York Giants', '1920s': 'New York Giants', '1930s': 'New York Giants', '1940s': 'New York Giants', '1950s': 'New York Giants' },
  ATL: { '1890s': 'Boston Beaneaters', '1900s': 'Boston Beaneaters', '1910s': 'Boston Braves', '1920s': 'Boston Braves', '1930s': 'Boston Braves', '1940s': 'Boston Braves', '1950s': 'Milwaukee Braves', '1960s': 'Milwaukee / Atlanta Braves' },
  OAK: { '1900s': 'Philadelphia Athletics', '1910s': 'Philadelphia Athletics', '1920s': 'Philadelphia Athletics', '1930s': 'Philadelphia Athletics', '1940s': 'Philadelphia Athletics', '1950s': 'Philadelphia / KC Athletics', '1960s': 'KC / Oakland Athletics' },
  MIN: { '1900s': 'Washington Senators', '1910s': 'Washington Senators', '1920s': 'Washington Senators', '1930s': 'Washington Senators', '1940s': 'Washington Senators', '1950s': 'Washington Senators' },
  BAL: { '1900s': 'St. Louis Browns', '1910s': 'St. Louis Browns', '1920s': 'St. Louis Browns', '1930s': 'St. Louis Browns', '1940s': 'St. Louis Browns', '1950s': 'St. Louis Browns / Orioles' },
  WSN: { '1960s': 'Montreal Expos', '1970s': 'Montreal Expos', '1980s': 'Montreal Expos', '1990s': 'Montreal Expos', '2000s': 'Expos / Nationals' },
  NYY: { '1900s': 'New York Highlanders' },
  MIL: { '1960s': 'Seattle Pilots' },
  TEX: { '1960s': 'Washington Senators' },
  FLA: { '1990s': 'Florida Marlins', '2000s': 'Florida Marlins' },
  TBD: { '1990s': 'Tampa Bay Devil Rays', '2000s': 'Tampa Bay Rays' },
  ANA: { '1960s': 'California Angels', '1970s': 'California Angels', '1980s': 'California Angels', '1990s': 'California / Anaheim Angels' },
  CLE: { '1900s': 'Cleveland Naps', '1910s': 'Cleveland Indians', '1920s': 'Cleveland Indians', '1930s': 'Cleveland Indians', '1940s': 'Cleveland Indians', '1950s': 'Cleveland Indians', '1960s': 'Cleveland Indians', '1970s': 'Cleveland Indians', '1980s': 'Cleveland Indians', '1990s': 'Cleveland Indians', '2000s': 'Cleveland Indians', '2010s': 'Cleveland Indians' }
};

function getHistoricalFranchiseName(franchiseId, decade) {
  const f = resolveFranchise(franchiseId);
  if (HISTORICAL_CLUB_NAMES[f.id] && HISTORICAL_CLUB_NAMES[f.id][decade]) {
    return HISTORICAL_CLUB_NAMES[f.id][decade];
  }
  return f.name;
}

/* Historical Era Context Narratives (Storytelling only — zero simulation impact) */
const ERA_NARRATIVES = {
  'LAD__1950s': 'The Boys of Summer era. Captured Brooklyn’s first World Series in 1955 with Jackie Robinson, Duke Snider, Roy Campanella, Gil Hodges, and Pee Wee Reese before opening a new chapter in Los Angeles.',
  'SEA__1990s': 'The franchise’s first golden age—the 1995 Kingdome miracle featuring Ken Griffey Jr., Randy Johnson, Edgar Martinez, Jay Buhner, and Alex Rodriguez.',
  'SEA__2000s': 'Home of the 116-win 2001 juggernaut and Ichiro Suzuki’s 262-hit masterpiece, backed by Edgar Martinez, Felix Hernandez, and a shutdown bullpen.',
  'BOS__2000s': 'The Curse-Breaking decade. David Ortiz, Manny Ramirez, Pedro Martinez, Curt Schilling, and Dustin Pedroia delivered two World Series titles in four years.',
  'BOS__1990s': 'Fenway’s transitional slugger era—Mo Vaughn, Nomar Garciaparra, Roger Clemens, and Pedro Martinez’s 1999 Triple Crown masterpiece.',
  'BOS__1910s': 'The Dead-Ball dynasty. Four World Series championships anchored by Tris Speaker, Harry Hooper, Smoky Joe Wood, and a young two-way phenomenon named Babe Ruth.',
  'NYY__1920s': 'Murderers’ Row and the birth of Yankee Stadium—Babe Ruth, Lou Gehrig, Earle Combs, Tony Lazzeri, Waite Hoyt, and three championships.',
  'NYY__1990s': 'The Core Four dynasty—Derek Jeter, Mariano Rivera, Bernie Williams, Paul O’Neill, and Andy Pettitte capturing three titles including the 114-win 1998 club.',
  'NYY__2000s': 'Bronx star power from the 2000 Subway Series through the 2009 title, pairing Derek Jeter and Mariano Rivera with Alex Rodriguez, Mike Mussina, and Hideki Matsui.',
  'STL__1940s': 'The Cardinals’ wartime and postwar powerhouse—three World Series titles fueled by Stan Musial, Enos Slaughter, Marty Marion, and Mort Cooper.',
  'CHC__1930s': 'Three NL pennants at Wrigley Field behind Gabby Hartnett, Billy Herman, Hack Wilson’s 191-RBI 1930 season, Stan Hack, and Lon Warneke.',
  'DET__1960s': 'From Rocky Colavito and Norm Cash’s thunder to the unforgettable 1968 World Series champions led by Al Kaline, Denny McLain, and Mickey Lolich.',
  'PHI__1980s': 'Mike Schmidt and Steve Carlton delivered Philadelphia’s first World Series crown in 1980, followed by the 1983 pennant and Steve Bedrosian’s 1987 Cy Young.',
  'CIN__1970s': 'The Big Red Machine—back-to-back champions (1975–76) driven by Johnny Bench, Joe Morgan, Pete Rose, Tony Perez, and George Foster.',
  'SFG__1920s': 'John McGraw’s Polo Grounds juggernaut—four straight NL pennants (1921–24) and back-to-back titles led by Frankie Frisch, Bill Terry, Ross Youngs, and young Mel Ott.',
  'ATL__1990s': 'The division-title dynasty—Greg Maddux, Tom Glavine, John Smoltz, Chipper Jones, and Fred McGriff bringing the 1995 World Series to Atlanta.',
  'ATL__2000s': 'Sustained NL East mastery behind Chipper Jones, Andruw Jones’s Gold Glove defense, John Smoltz’s closer-to-starter reinvention, and Brian McCann.',
  'LAD__2010s': 'Seven straight NL West crowns built around Clayton Kershaw’s three Cy Youngs, Kenley Jansen, Justin Turner, Corey Seager, and Cody Bellinger.',
  'HOU__2010s': 'From rebuild to 100-win powerhouse—Jose Altuve, Alex Bregman, George Springer, Justin Verlander, and Gerrit Cole capturing the 2017 crown.'
};

function getEraContextNarrative(franchiseId, decade, players) {
  const key = `${franchiseId}__${decade}`;
  if (ERA_NARRATIVES[key]) return ERA_NARRATIVES[key];
  const club = getHistoricalFranchiseName(franchiseId, decade);
  const hofNames = (players || []).filter(p => p.hof).map(p => p.name).slice(0, 3);
  const wsChamps = (players || []).some(p => p.acc && p.acc.ws > 0);
  if (hofNames.length) {
    return `A defining ${decade} chapter for the ${club}${wsChamps ? ' featuring World Series champions' : ''}, headlined by Hall of Famers ${hofNames.join(', ')}.`;
  }
  const topNames = (players || []).slice(0, 3).map(p => p.name);
  return `Exploring the ${decade} ${club} archive—${(players || []).length} real historical contributors${topNames.length ? ` including ${topNames.join(', ')}` : ''}.`;
}

/* Storytelling-only Historical Gem labels (ZERO simulation impact) */
function getHistoricalGem(p) {
  if (p.hof) return { label: 'Hall of Famer', cls: 'gem-hof' };
  const acc = p.acc || {};
  if ((acc.ws || 0) >= 2 || ((acc.ws || 0) >= 1 && ((acc.mvp || 0) > 0 || (acc.cy || 0) > 0))) {
    return { label: 'World Series Hero', cls: 'gem-ws' };
  }
  if ((acc.mvp || 0) > 0 || (acc.cy || 0) > 0 || (p.seasons || 0) >= 10) {
    return { label: 'Franchise Legend', cls: 'gem-legend' };
  }
  if ((acc.ws || 0) >= 1 && (p.seasons || 0) >= 4) {
    return { label: 'Dynasty Piece', cls: 'gem-dynasty' };
  }
  if ((acc.asg || 0) >= 1 || (acc.gg || 0) >= 1 || (acc.ss || 0) >= 1) {
    return { label: 'Forgotten Star', cls: 'gem-star' };
  }
  return { label: 'Fan Favorite', cls: 'gem-fan' };
}
