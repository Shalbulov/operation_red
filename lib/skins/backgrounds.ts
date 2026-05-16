import type { Background } from "./types";

/* =========================================================================
   SVG DATA URIs — complex pattern art for each background.
   Each is a small SVG ~1-3KB embedded inline. Performance: parsed once,
   cached by the browser, no extra requests.
   ========================================================================= */

// Tactical command-center radar with rings, crosshairs, N/E/S/W bearings
const TAC_RADAR_SVG = encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800' width='800' height='800'>
  <defs>
    <radialGradient id='glow' cx='50%' cy='50%' r='50%'>
      <stop offset='0%' stop-color='%23e63946' stop-opacity='0.12'/>
      <stop offset='100%' stop-color='%23e63946' stop-opacity='0'/>
    </radialGradient>
  </defs>
  <rect width='800' height='800' fill='url(%23glow)'/>
  <g fill='none' stroke='%23e63946' stroke-width='1.2' opacity='0.35'>
    <circle cx='400' cy='400' r='100'/>
    <circle cx='400' cy='400' r='200'/>
    <circle cx='400' cy='400' r='300'/>
    <circle cx='400' cy='400' r='380' stroke-dasharray='3 4'/>
  </g>
  <g stroke='%23e63946' stroke-width='1' opacity='0.4'>
    <line x1='0' y1='400' x2='800' y2='400'/>
    <line x1='400' y1='0' x2='400' y2='800'/>
  </g>
  <g stroke='%23e63946' stroke-width='1' opacity='0.6'>
    <line x1='400' y1='80' x2='400' y2='100'/>
    <line x1='400' y1='700' x2='400' y2='720'/>
    <line x1='80' y1='400' x2='100' y2='400'/>
    <line x1='700' y1='400' x2='720' y2='400'/>
  </g>
  <g fill='%23e63946' opacity='0.7' font-family='ui-monospace,monospace' font-size='14' font-weight='700'>
    <text x='408' y='30'>360</text>
    <text x='770' y='406'>090</text>
    <text x='386' y='790'>180</text>
    <text x='10' y='406'>270</text>
  </g>
  <g stroke='%23e63946' stroke-width='2' opacity='0.5'>
    <line x1='395' y1='400' x2='405' y2='400'/>
    <line x1='400' y1='395' x2='400' y2='405'/>
  </g>
  <circle cx='400' cy='400' r='5' fill='none' stroke='%23e63946' stroke-width='1.5' opacity='0.7'/>
  <g stroke='%23ffffff' stroke-width='0.5' opacity='0.06'>
    <path d='M0,100 L800,100 M0,200 L800,200 M0,300 L800,300 M0,500 L800,500 M0,600 L800,600 M0,700 L800,700'/>
    <path d='M100,0 L100,800 M200,0 L200,800 M300,0 L300,800 M500,0 L500,800 M600,0 L600,800 M700,0 L700,800'/>
  </g>
</svg>`).replace(/\s+/g, " ");

// Concrete bunker with hazard chevrons + emergency light
const CONCRETE_SVG = encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800' width='800' height='800'>
  <defs>
    <pattern id='hazard' x='0' y='0' width='40' height='40' patternUnits='userSpaceOnUse' patternTransform='rotate(45)'>
      <rect width='20' height='40' fill='%23e63946' opacity='0.07'/>
      <rect x='20' width='20' height='40' fill='%23000000' opacity='0'/>
    </pattern>
    <radialGradient id='light' cx='100%' cy='30%' r='60%'>
      <stop offset='0%' stop-color='%23e63946' stop-opacity='0.28'/>
      <stop offset='50%' stop-color='%238b0000' stop-opacity='0.12'/>
      <stop offset='100%' stop-color='%23000000' stop-opacity='0'/>
    </radialGradient>
    <radialGradient id='spot' cx='0%' cy='0%' r='70%'>
      <stop offset='0%' stop-color='%23fff5e0' stop-opacity='0.1'/>
      <stop offset='100%' stop-color='%23fff5e0' stop-opacity='0'/>
    </radialGradient>
    <filter id='noise'>
      <feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' seed='5'/>
      <feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.18 0'/>
    </filter>
  </defs>
  <rect width='800' height='800' fill='%23181513'/>
  <rect width='800' height='800' filter='url(%23noise)'/>
  <rect width='800' height='800' fill='url(%23hazard)'/>
  <rect width='800' height='800' fill='url(%23spot)'/>
  <rect width='800' height='800' fill='url(%23light)'/>
  <g stroke='%23e63946' stroke-width='2' opacity='0.6'>
    <rect x='30' y='30' width='30' height='30' fill='none'/>
    <rect x='740' y='30' width='30' height='30' fill='none'/>
    <rect x='30' y='740' width='30' height='30' fill='none'/>
    <rect x='740' y='740' width='30' height='30' fill='none'/>
  </g>
  <g fill='%23e63946' opacity='0.45' font-family='ui-monospace,monospace' font-size='11' font-weight='700' letter-spacing='2'>
    <text x='80' y='52'>SECTOR 04 / RESTRICTED</text>
    <text x='80' y='770'>BUNKER-7 — LEVEL B3</text>
  </g>
  <circle cx='760' cy='250' r='10' fill='%23e63946' opacity='0.9'/>
  <circle cx='760' cy='250' r='18' fill='none' stroke='%23e63946' stroke-width='1.5' opacity='0.4'/>
  <circle cx='760' cy='250' r='30' fill='none' stroke='%23e63946' stroke-width='1' opacity='0.2'/>
</svg>`).replace(/\s+/g, " ");

// Military topographic map with two peaks (red danger + white neutral), grid, compass
const TOPO_SVG = encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800' width='800' height='800'>
  <rect width='800' height='800' fill='%230b0a08'/>
  <g fill='none' stroke='%23e63946' opacity='0.85'>
    <circle cx='180' cy='220' r='40' stroke-width='1.6'/>
    <circle cx='180' cy='220' r='70' stroke-width='1.2' opacity='0.7'/>
    <circle cx='180' cy='220' r='105' stroke-width='1' opacity='0.55'/>
    <circle cx='180' cy='220' r='140' stroke-width='1' opacity='0.4'/>
    <circle cx='180' cy='220' r='180' stroke-width='1' opacity='0.3'/>
    <circle cx='180' cy='220' r='225' stroke-width='1' opacity='0.22'/>
    <circle cx='180' cy='220' r='270' stroke-width='1' opacity='0.15'/>
  </g>
  <g fill='%23e63946' opacity='0.9' font-family='ui-monospace,monospace' font-size='10' font-weight='700'>
    <text x='170' y='225'>2840m</text>
  </g>
  <g fill='none' stroke='%23ffffff' opacity='0.4'>
    <circle cx='600' cy='580' r='50' stroke-width='1.4'/>
    <circle cx='600' cy='580' r='90' stroke-width='1.2' opacity='0.8'/>
    <circle cx='600' cy='580' r='135' stroke-width='1' opacity='0.6'/>
    <circle cx='600' cy='580' r='180' stroke-width='1' opacity='0.45'/>
    <circle cx='600' cy='580' r='225' stroke-width='1' opacity='0.3'/>
    <circle cx='600' cy='580' r='270' stroke-width='1' opacity='0.2'/>
  </g>
  <g fill='%23ffffff' opacity='0.5' font-family='ui-monospace,monospace' font-size='10'>
    <text x='590' y='585'>1620m</text>
  </g>
  <path d='M 100,400 Q 250,380 350,420 T 500,440 T 700,400' fill='none' stroke='%23e63946' stroke-width='1.5' opacity='0.4' stroke-dasharray='6 4'/>
  <g stroke='%23ffffff' stroke-width='1' opacity='0.05'>
    <path d='M0,80 L800,80 M0,160 L800,160 M0,240 L800,240 M0,320 L800,320 M0,400 L800,400 M0,480 L800,480 M0,560 L800,560 M0,640 L800,640 M0,720 L800,720'/>
    <path d='M80,0 L80,800 M160,0 L160,800 M240,0 L240,800 M320,0 L320,800 M400,0 L400,800 M480,0 L480,800 M560,0 L560,800 M640,0 L640,800 M720,0 L720,800'/>
  </g>
  <g transform='translate(720,80)' opacity='0.7'>
    <circle r='28' fill='none' stroke='%23e63946' stroke-width='1.2'/>
    <path d='M0,-22 L4,0 L0,4 L-4,0 Z' fill='%23e63946'/>
    <path d='M0,22 L4,0 L0,-4 L-4,0 Z' fill='%23e63946' opacity='0.3'/>
    <text x='-3' y='-32' fill='%23e63946' font-family='ui-monospace,monospace' font-size='10' font-weight='700'>N</text>
  </g>
  <g fill='%23e63946' opacity='0.55' font-family='ui-monospace,monospace' font-size='9'>
    <text x='14' y='14'>43°15'N</text>
    <text x='720' y='790'>76°54'E</text>
  </g>
</svg>`).replace(/\s+/g, " ");

// Blood moon — red moon disc, halo, stars, ground fog
const BLOOD_MOON_SVG = encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800' width='800' height='800'>
  <defs>
    <radialGradient id='moon' cx='50%' cy='50%' r='50%'>
      <stop offset='0%' stop-color='%23ff8090' stop-opacity='0.9'/>
      <stop offset='30%' stop-color='%23e63946' stop-opacity='0.7'/>
      <stop offset='60%' stop-color='%238b0000' stop-opacity='0.4'/>
      <stop offset='100%' stop-color='%238b0000' stop-opacity='0'/>
    </radialGradient>
    <radialGradient id='halo' cx='50%' cy='14%' r='55%'>
      <stop offset='0%' stop-color='%23e63946' stop-opacity='0.3'/>
      <stop offset='100%' stop-color='%23e63946' stop-opacity='0'/>
    </radialGradient>
    <radialGradient id='fog' cx='50%' cy='100%' r='60%'>
      <stop offset='0%' stop-color='%238b0000' stop-opacity='0.55'/>
      <stop offset='100%' stop-color='%238b0000' stop-opacity='0'/>
    </radialGradient>
    <radialGradient id='vignette' cx='50%' cy='50%' r='70%'>
      <stop offset='60%' stop-color='%23000000' stop-opacity='0'/>
      <stop offset='100%' stop-color='%23000000' stop-opacity='0.7'/>
    </radialGradient>
  </defs>
  <rect width='800' height='800' fill='%23080608'/>
  <rect width='800' height='800' fill='url(%23halo)'/>
  <circle cx='400' cy='115' r='95' fill='url(%23moon)'/>
  <g fill='%238b0000' opacity='0.6'>
    <circle cx='395' cy='100' r='8'/>
    <circle cx='420' cy='130' r='5'/>
    <circle cx='380' cy='140' r='6'/>
    <circle cx='430' cy='95' r='4'/>
  </g>
  <g fill='%23ffffff'>
    <circle cx='100' cy='80' r='1' opacity='0.8'/>
    <circle cx='180' cy='200' r='1' opacity='0.5'/>
    <circle cx='260' cy='60' r='1.5' opacity='0.9'/>
    <circle cx='580' cy='150' r='1' opacity='0.6'/>
    <circle cx='720' cy='90' r='1.2' opacity='0.7'/>
    <circle cx='640' cy='220' r='0.8' opacity='0.5'/>
    <circle cx='80' cy='280' r='1' opacity='0.6'/>
    <circle cx='350' cy='40' r='0.8' opacity='0.4'/>
    <circle cx='500' cy='80' r='1' opacity='0.6'/>
    <circle cx='150' cy='320' r='0.6' opacity='0.3'/>
    <circle cx='680' cy='320' r='1' opacity='0.5'/>
    <circle cx='460' cy='200' r='0.6' opacity='0.4'/>
  </g>
  <rect width='800' height='800' fill='url(%23fog)'/>
  <g stroke='%238b0000' stroke-width='1' fill='none' opacity='0.25'>
    <path d='M0,720 Q200,700 400,720 T800,720'/>
    <path d='M0,750 Q200,735 400,750 T800,750'/>
    <path d='M0,780 Q200,770 400,780 T800,780'/>
  </g>
  <rect width='800' height='800' fill='url(%23vignette)'/>
</svg>`).replace(/\s+/g, " ");

// Subtle void — corner vignette with watermark
const VOID_SVG = encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800' width='800' height='800'>
  <defs>
    <radialGradient id='v' cx='50%' cy='50%' r='65%'>
      <stop offset='65%' stop-color='%23000000' stop-opacity='0'/>
      <stop offset='100%' stop-color='%238b0000' stop-opacity='0.18'/>
    </radialGradient>
  </defs>
  <rect width='800' height='800' fill='url(%23v)'/>
  <g stroke='%23e63946' stroke-width='1' opacity='0.4' fill='none'>
    <path d='M30,30 L30,60 M30,30 L60,30'/>
    <path d='M770,30 L770,60 M770,30 L740,30'/>
    <path d='M30,770 L30,740 M30,770 L60,770'/>
    <path d='M770,770 L770,740 M770,770 L740,770'/>
  </g>
  <g fill='%23e63946' opacity='0.35' font-family='ui-monospace,monospace' font-size='10' font-weight='700' letter-spacing='3'>
    <text x='40' y='790'>OPS-RED // SECURE</text>
  </g>
</svg>`).replace(/\s+/g, " ");

/* =========================================================================
   BACKGROUND REGISTRY
   ========================================================================= */

export const BACKGROUNDS: Record<string, Background> = {
  void: {
    id: "void",
    name: "Void",
    description: "Чистая пустота с корнерами оперативной разметки.",
    rarity: "common",
    priceCents: 0,
    priceCoins: 0,
    style: {
      backgroundColor: "var(--bg-void)",
      backgroundImage: `url("data:image/svg+xml;charset=utf-8,${VOID_SVG}")`,
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
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
      backgroundImage: `url("data:image/svg+xml;charset=utf-8,${TAC_RADAR_SVG}")`,
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
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
      backgroundColor: "#161412",
      backgroundImage: `url("data:image/svg+xml;charset=utf-8,${CONCRETE_SVG}")`,
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
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
      backgroundImage: `url("data:image/svg+xml;charset=utf-8,${TOPO_SVG}")`,
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
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
      backgroundImage: `url("data:image/svg+xml;charset=utf-8,${BLOOD_MOON_SVG}")`,
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
    },
  },
};

export const DEFAULT_BACKGROUND_ID = "void";
export const BACKGROUND_LIST = Object.values(BACKGROUNDS);

export function getBackground(id: string | null | undefined): Background {
  if (!id) return BACKGROUNDS[DEFAULT_BACKGROUND_ID];
  return BACKGROUNDS[id] ?? BACKGROUNDS[DEFAULT_BACKGROUND_ID];
}
