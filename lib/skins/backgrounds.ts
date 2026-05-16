import type { Background } from "./types";

/* =========================================================================
   Minimal data-URI encoder for inline SVG.
   Only chars that break CSS need escaping: # (hex colors), < > and quotes.
   Browsers tolerate the rest. We use single quotes inside the SVG so we
   can wrap the whole thing in double quotes for url("...").
   ========================================================================= */
function svgUrl(svg: string): string {
  const cleaned = svg
    .replace(/[\n\t]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .replace(/"/g, "'") // single quotes inside SVG
    .replace(/%/g, "%25") // must be first
    .replace(/#/g, "%23")
    .replace(/</g, "%3C")
    .replace(/>/g, "%3E");
  return `url("data:image/svg+xml;utf8,${cleaned}")`;
}

/* =========================================================================
   1. VOID — minimal: corner brackets + watermark
   ========================================================================= */
const VOID_SVG = `
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800' preserveAspectRatio='xMidYMid slice'>
  <defs>
    <radialGradient id='vig' cx='50%' cy='50%' r='70%'>
      <stop offset='60%' stop-color='#000' stop-opacity='0'/>
      <stop offset='100%' stop-color='#8b0000' stop-opacity='0.25'/>
    </radialGradient>
  </defs>
  <rect width='800' height='800' fill='#0a0a0a'/>
  <rect width='800' height='800' fill='url(#vig)'/>
  <g stroke='#e63946' stroke-width='2' fill='none' opacity='0.7'>
    <path d='M30,30 L30,70 M30,30 L70,30'/>
    <path d='M770,30 L770,70 M770,30 L730,30'/>
    <path d='M30,770 L30,730 M30,770 L70,770'/>
    <path d='M770,770 L770,730 M770,770 L730,770'/>
  </g>
  <text x='40' y='790' fill='#e63946' opacity='0.5' font-family='ui-monospace,monospace' font-size='12' font-weight='700' letter-spacing='3'>OPS-RED // SECURE</text>
  <text x='620' y='28' fill='#e63946' opacity='0.5' font-family='ui-monospace,monospace' font-size='11' font-weight='700' letter-spacing='2'>v0.1 ACTIVE</text>
</svg>`;

/* =========================================================================
   2. TACTICAL RADAR — concentric rings, crosshair, azimuth bearings
   ========================================================================= */
const TAC_RADAR_SVG = `
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800' preserveAspectRatio='xMidYMid slice'>
  <defs>
    <radialGradient id='glow' cx='50%' cy='50%' r='50%'>
      <stop offset='0%' stop-color='#e63946' stop-opacity='0.18'/>
      <stop offset='30%' stop-color='#e63946' stop-opacity='0.05'/>
      <stop offset='100%' stop-color='#e63946' stop-opacity='0'/>
    </radialGradient>
    <radialGradient id='sweep' cx='50%' cy='50%' r='50%' fx='50%' fy='50%'>
      <stop offset='0%' stop-color='#e63946' stop-opacity='0.4'/>
      <stop offset='100%' stop-color='#e63946' stop-opacity='0'/>
    </radialGradient>
  </defs>
  <rect width='800' height='800' fill='#070707'/>
  <rect width='800' height='800' fill='url(#glow)'/>
  <g fill='none' stroke='#e63946' stroke-width='1.5' opacity='0.55'>
    <circle cx='400' cy='400' r='80'/>
    <circle cx='400' cy='400' r='160' opacity='0.85'/>
    <circle cx='400' cy='400' r='240' opacity='0.7'/>
    <circle cx='400' cy='400' r='320' opacity='0.55'/>
    <circle cx='400' cy='400' r='390' stroke-dasharray='4 6' opacity='0.4'/>
  </g>
  <g stroke='#e63946' stroke-width='1.2' opacity='0.6'>
    <line x1='0' y1='400' x2='800' y2='400'/>
    <line x1='400' y1='0' x2='400' y2='800'/>
  </g>
  <g fill='#e63946' opacity='0.85' font-family='ui-monospace,monospace' font-size='16' font-weight='700'>
    <text x='405' y='22'>360</text>
    <text x='763' y='405'>090</text>
    <text x='382' y='795'>180</text>
    <text x='8' y='405'>270</text>
  </g>
  <g stroke='#e63946' stroke-width='2' opacity='0.7'>
    <line x1='400' y1='38' x2='400' y2='58'/>
    <line x1='400' y1='742' x2='400' y2='762'/>
    <line x1='38' y1='400' x2='58' y2='400'/>
    <line x1='742' y1='400' x2='762' y2='400'/>
  </g>
  <g stroke='#e63946' stroke-width='1' opacity='0.4'>
    <line x1='395' y1='400' x2='405' y2='400'/>
    <line x1='400' y1='395' x2='400' y2='405'/>
  </g>
  <circle cx='400' cy='400' r='6' fill='none' stroke='#e63946' stroke-width='2' opacity='0.9'/>
  <circle cx='400' cy='400' r='2' fill='#e63946' opacity='1'/>
  <g stroke='#fff' stroke-width='0.5' opacity='0.06'>
    <path d='M0,100 L800,100 M0,200 L800,200 M0,300 L800,300 M0,500 L800,500 M0,600 L800,600 M0,700 L800,700'/>
    <path d='M100,0 L100,800 M200,0 L200,800 M300,0 L300,800 M500,0 L500,800 M600,0 L600,800 M700,0 L700,800'/>
  </g>
  <text x='30' y='30' fill='#e63946' opacity='0.6' font-family='ui-monospace,monospace' font-size='11' font-weight='700' letter-spacing='2'>RADAR // ONLINE</text>
  <text x='620' y='785' fill='#e63946' opacity='0.6' font-family='ui-monospace,monospace' font-size='11' font-weight='700' letter-spacing='2'>SWEEP 045°</text>
</svg>`;

/* =========================================================================
   3. CONCRETE BUNKER — texture, hazard chevrons, emergency lamp
   ========================================================================= */
const CONCRETE_SVG = `
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800' preserveAspectRatio='xMidYMid slice'>
  <defs>
    <pattern id='hazard' x='0' y='0' width='60' height='60' patternUnits='userSpaceOnUse' patternTransform='rotate(45)'>
      <rect width='30' height='60' fill='#e63946' opacity='0.1'/>
      <rect x='30' width='30' height='60' fill='transparent'/>
    </pattern>
    <radialGradient id='lamp' cx='90%' cy='30%' r='55%'>
      <stop offset='0%' stop-color='#e63946' stop-opacity='0.5'/>
      <stop offset='30%' stop-color='#e63946' stop-opacity='0.25'/>
      <stop offset='70%' stop-color='#8b0000' stop-opacity='0.1'/>
      <stop offset='100%' stop-color='#000' stop-opacity='0'/>
    </radialGradient>
    <radialGradient id='topspot' cx='10%' cy='10%' r='80%'>
      <stop offset='0%' stop-color='#fff5e0' stop-opacity='0.12'/>
      <stop offset='100%' stop-color='#fff5e0' stop-opacity='0'/>
    </radialGradient>
    <filter id='noise'>
      <feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' seed='5'/>
      <feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0'/>
    </filter>
  </defs>
  <rect width='800' height='800' fill='#1c1815'/>
  <rect width='800' height='800' filter='url(#noise)'/>
  <rect width='800' height='800' fill='url(#hazard)'/>
  <rect width='800' height='800' fill='url(#topspot)'/>
  <rect width='800' height='800' fill='url(#lamp)'/>
  <g stroke='#e63946' stroke-width='2.5' fill='none' opacity='0.7'>
    <path d='M30,30 L30,80 M30,30 L80,30'/>
    <path d='M770,30 L770,80 M770,30 L720,30'/>
    <path d='M30,770 L30,720 M30,770 L80,770'/>
    <path d='M770,770 L770,720 M770,770 L720,770'/>
  </g>
  <text x='90' y='52' fill='#e63946' opacity='0.85' font-family='ui-monospace,monospace' font-size='14' font-weight='700' letter-spacing='3'>SECTOR 04 // RESTRICTED</text>
  <text x='90' y='770' fill='#e63946' opacity='0.7' font-family='ui-monospace,monospace' font-size='12' font-weight='700' letter-spacing='3'>BUNKER-7 / LEVEL B3</text>
  <circle cx='720' cy='200' r='14' fill='#e63946' opacity='0.95'/>
  <circle cx='720' cy='200' r='26' fill='none' stroke='#e63946' stroke-width='2' opacity='0.55'/>
  <circle cx='720' cy='200' r='42' fill='none' stroke='#e63946' stroke-width='1' opacity='0.3'/>
  <circle cx='720' cy='200' r='62' fill='none' stroke='#e63946' stroke-width='1' opacity='0.15'/>
  <g fill='#666' opacity='0.3'>
    <circle cx='70' cy='130' r='4'/>
    <circle cx='70' cy='200' r='4'/>
    <circle cx='70' cy='270' r='4'/>
    <circle cx='70' cy='340' r='4'/>
    <circle cx='70' cy='410' r='4'/>
    <circle cx='70' cy='480' r='4'/>
    <circle cx='70' cy='550' r='4'/>
    <circle cx='70' cy='620' r='4'/>
  </g>
</svg>`;

/* =========================================================================
   4. TOPOGRAPHIC — military elevation map with two peaks + compass + grid
   ========================================================================= */
const TOPO_SVG = `
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800' preserveAspectRatio='xMidYMid slice'>
  <rect width='800' height='800' fill='#0b0a08'/>
  <g fill='none' stroke='#e63946' stroke-width='1.5'>
    <circle cx='200' cy='240' r='35' opacity='1'/>
    <circle cx='200' cy='240' r='65' opacity='0.85'/>
    <circle cx='200' cy='240' r='100' opacity='0.7' stroke-width='1.2'/>
    <circle cx='200' cy='240' r='140' opacity='0.55'/>
    <circle cx='200' cy='240' r='185' opacity='0.4'/>
    <circle cx='200' cy='240' r='230' opacity='0.28'/>
    <circle cx='200' cy='240' r='280' opacity='0.18'/>
  </g>
  <text x='180' y='245' fill='#e63946' opacity='0.95' font-family='ui-monospace,monospace' font-size='12' font-weight='700'>2840m</text>
  <g fill='none' stroke='#fff' stroke-width='1.4' opacity='0.6'>
    <circle cx='600' cy='560' r='45'/>
    <circle cx='600' cy='560' r='85' opacity='0.85'/>
    <circle cx='600' cy='560' r='130' opacity='0.7'/>
    <circle cx='600' cy='560' r='180' opacity='0.55'/>
    <circle cx='600' cy='560' r='235' opacity='0.4'/>
    <circle cx='600' cy='560' r='290' opacity='0.25'/>
  </g>
  <text x='580' y='565' fill='#fff' opacity='0.85' font-family='ui-monospace,monospace' font-size='12' font-weight='700'>1620m</text>
  <path d='M 100,420 Q 250,400 360,440 T 510,460 T 700,420' fill='none' stroke='#e63946' stroke-width='2' opacity='0.5' stroke-dasharray='7 5'/>
  <g stroke='#fff' stroke-width='1' opacity='0.06'>
    <path d='M0,80 L800,80 M0,160 L800,160 M0,240 L800,240 M0,320 L800,320 M0,400 L800,400 M0,480 L800,480 M0,560 L800,560 M0,640 L800,640 M0,720 L800,720'/>
    <path d='M80,0 L80,800 M160,0 L160,800 M240,0 L240,800 M320,0 L320,800 M400,0 L400,800 M480,0 L480,800 M560,0 L560,800 M640,0 L640,800 M720,0 L720,800'/>
  </g>
  <g transform='translate(720,95)'>
    <circle r='32' fill='#0b0a08' stroke='#e63946' stroke-width='1.5' opacity='0.9'/>
    <path d='M0,-26 L5,0 L0,5 L-5,0 Z' fill='#e63946'/>
    <path d='M0,26 L5,0 L0,-5 L-5,0 Z' fill='#e63946' opacity='0.3'/>
    <text x='-4' y='-36' fill='#e63946' font-family='ui-monospace,monospace' font-size='12' font-weight='700'>N</text>
    <text x='-4' y='42' fill='#e63946' opacity='0.4' font-family='ui-monospace,monospace' font-size='11' font-weight='700'>S</text>
  </g>
  <text x='20' y='25' fill='#e63946' opacity='0.7' font-family='ui-monospace,monospace' font-size='11' font-weight='700' letter-spacing='2'>43°15'N</text>
  <text x='700' y='790' fill='#e63946' opacity='0.7' font-family='ui-monospace,monospace' font-size='11' font-weight='700' letter-spacing='2'>76°54'E</text>
  <text x='20' y='790' fill='#e63946' opacity='0.6' font-family='ui-monospace,monospace' font-size='11' font-weight='700' letter-spacing='2'>OP // ALMATY</text>
</svg>`;

/* =========================================================================
   5. BLOOD MOON — moon disc, halo, stars, ground fog
   ========================================================================= */
const BLOOD_MOON_SVG = `
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800' preserveAspectRatio='xMidYMid slice'>
  <defs>
    <radialGradient id='moon' cx='50%' cy='50%' r='50%'>
      <stop offset='0%' stop-color='#ff8090' stop-opacity='1'/>
      <stop offset='40%' stop-color='#e63946' stop-opacity='0.85'/>
      <stop offset='70%' stop-color='#8b0000' stop-opacity='0.5'/>
      <stop offset='100%' stop-color='#8b0000' stop-opacity='0'/>
    </radialGradient>
    <radialGradient id='halo' cx='50%' cy='15%' r='55%'>
      <stop offset='0%' stop-color='#e63946' stop-opacity='0.35'/>
      <stop offset='100%' stop-color='#e63946' stop-opacity='0'/>
    </radialGradient>
    <radialGradient id='fog' cx='50%' cy='100%' r='65%'>
      <stop offset='0%' stop-color='#8b0000' stop-opacity='0.6'/>
      <stop offset='100%' stop-color='#8b0000' stop-opacity='0'/>
    </radialGradient>
    <radialGradient id='vignette' cx='50%' cy='50%' r='75%'>
      <stop offset='55%' stop-color='#000' stop-opacity='0'/>
      <stop offset='100%' stop-color='#000' stop-opacity='0.65'/>
    </radialGradient>
  </defs>
  <rect width='800' height='800' fill='#070608'/>
  <rect width='800' height='800' fill='url(#halo)'/>
  <circle cx='400' cy='135' r='110' fill='url(#moon)'/>
  <g fill='#8b0000' opacity='0.65'>
    <circle cx='392' cy='115' r='10'/>
    <circle cx='425' cy='145' r='6'/>
    <circle cx='375' cy='155' r='8'/>
    <circle cx='435' cy='105' r='5'/>
    <circle cx='405' cy='165' r='4'/>
  </g>
  <g fill='#fff'>
    <circle cx='80' cy='70' r='1.2' opacity='0.85'/>
    <circle cx='160' cy='180' r='1' opacity='0.55'/>
    <circle cx='250' cy='50' r='1.5' opacity='0.9'/>
    <circle cx='560' cy='150' r='1' opacity='0.65'/>
    <circle cx='700' cy='80' r='1.3' opacity='0.75'/>
    <circle cx='620' cy='220' r='0.9' opacity='0.55'/>
    <circle cx='60' cy='280' r='1' opacity='0.6'/>
    <circle cx='340' cy='35' r='0.8' opacity='0.45'/>
    <circle cx='480' cy='75' r='1.1' opacity='0.65'/>
    <circle cx='130' cy='320' r='0.7' opacity='0.35'/>
    <circle cx='670' cy='320' r='1' opacity='0.5'/>
    <circle cx='450' cy='200' r='0.7' opacity='0.45'/>
    <circle cx='280' cy='280' r='0.8' opacity='0.5'/>
    <circle cx='730' cy='400' r='0.9' opacity='0.55'/>
    <circle cx='50' cy='420' r='0.8' opacity='0.4'/>
  </g>
  <rect width='800' height='800' fill='url(#fog)'/>
  <g stroke='#8b0000' stroke-width='1.5' fill='none' opacity='0.25'>
    <path d='M0,720 Q200,700 400,720 T800,720'/>
    <path d='M0,750 Q200,735 400,750 T800,750'/>
    <path d='M0,780 Q200,770 400,780 T800,780'/>
  </g>
  <rect width='800' height='800' fill='url(#vignette)'/>
  <text x='30' y='790' fill='#e63946' opacity='0.5' font-family='ui-monospace,monospace' font-size='11' font-weight='700' letter-spacing='3'>FINAL NIGHT</text>
</svg>`;

/* =========================================================================
   BACKGROUND REGISTRY
   ========================================================================= */

const baseStyle = {
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
} as const;

export const BACKGROUNDS: Record<string, Background> = {
  void: {
    id: "void",
    name: "Void",
    description: "Чистая пустота с корнерами оперативной разметки.",
    rarity: "common",
    priceCents: 0,
    priceCoins: 0,
    style: {
      backgroundColor: "#0a0a0a",
      backgroundImage: svgUrl(VOID_SVG),
      ...baseStyle,
    },
  },
  tacGrid: {
    id: "tacGrid",
    name: "Tactical Radar",
    description: "Реальный радар командного пункта: концентрические кольца, прицел, азимуты.",
    rarity: "common",
    priceCents: 149,
    priceCoins: 200,
    style: {
      backgroundColor: "#070707",
      backgroundImage: svgUrl(TAC_RADAR_SVG),
      ...baseStyle,
    },
  },
  concrete: {
    id: "concrete",
    name: "Concrete Bunker",
    description: "Бетон, аварийная лампа, опасные шевроны. SECTOR 04 / RESTRICTED.",
    rarity: "rare",
    priceCents: 199,
    priceCoins: 500,
    style: {
      backgroundColor: "#1c1815",
      backgroundImage: svgUrl(CONCRETE_SVG),
      ...baseStyle,
    },
  },
  topo: {
    id: "topo",
    name: "Topographic",
    description: "Военная топокарта с двумя пиками, тропой и компасом. Координаты Алматы.",
    rarity: "rare",
    priceCents: 199,
    priceCoins: 500,
    style: {
      backgroundColor: "#0b0a08",
      backgroundImage: svgUrl(TOPO_SVG),
      ...baseStyle,
    },
  },
  bloodMoon: {
    id: "bloodMoon",
    name: "Blood Moon",
    description: "Кровавая луна, звёзды, туман. Финальная ночь миссии.",
    rarity: "epic",
    priceCents: 299,
    priceCoins: 1000,
    style: {
      backgroundColor: "#070608",
      backgroundImage: svgUrl(BLOOD_MOON_SVG),
      ...baseStyle,
    },
  },
};

export const DEFAULT_BACKGROUND_ID = "void";
export const BACKGROUND_LIST = Object.values(BACKGROUNDS);

export function getBackground(id: string | null | undefined): Background {
  if (!id) return BACKGROUNDS[DEFAULT_BACKGROUND_ID];
  return BACKGROUNDS[id] ?? BACKGROUNDS[DEFAULT_BACKGROUND_ID];
}
