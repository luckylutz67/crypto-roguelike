import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════
   GAME DATA — TOKENS, EVENTS, BOSSES, CARDS
═══════════════════════════════════════════════════════ */

const TOKENS = [
  { id:"SATO", name:"$SATO", desc:"Genesis block tribute. Satoshi approves.", emoji:"₿", risk:"medium", chain:"BTC L1", lore:"Block 0. Le début de tout." },
  { id:"PIZZA", name:"$PIZZA", desc:"10,000 BTC = 2 pizzas. Laszlo pleure encore.", emoji:"🍕", risk:"high", chain:"ETH", lore:"22 Mai 2010. L'achat le plus cher de l'histoire." },
  { id:"WAGMI", name:"$WAGMI", desc:"We Are Gonna Make It. Culture > charts.", emoji:"💎", risk:"low", chain:"SOL", lore:"Le rallying cry des crypto natives." },
  { id:"NGMI", name:"$NGMI", desc:"Not Gonna Make It. Contrarian degen play.", emoji:"💀", risk:"extreme", chain:"ETH", lore:"Un trade ironique. Ou pas." },
  { id:"HODL", name:"$HODL", desc:'"I AM HODLING" — La typo la plus rentable de l\'histoire.', emoji:"🙌", risk:"low", chain:"BTC", lore:"2013. GameKyuubi. Ivre. Légendaire." },
  { id:"WIF", name:"$WIF", desc:"Dog with hat. Zero utility. Max vibes.", emoji:"🐕", risk:"medium", chain:"SOL", lore:"Un chien avec un chapeau. $4B de market cap." },
  { id:"BONK", name:"$BONK", desc:"Bonk les bears. Solana speed.", emoji:"🔨", risk:"high", chain:"SOL", lore:"Le premier meme coin Solana. Airdrop légendaire." },
  { id:"PEPO", name:"$PEPO", desc:"Rare Pepe on-chain. Feels good, ser.", emoji:"🐸", risk:"medium", chain:"ETH", lore:"Une grenouille. Une communauté. Un mythe." },
  { id:"LAMBO", name:"$LAMBO", desc:"Still waiting. 2025 edition. Probably soon™", emoji:"🏎️", risk:"high", chain:"BSC", lore:"La promesse éternelle du crypto trader." },
  { id:"DEGEN", name:"$DEGEN", desc:"For the degens only. DYOR? lol.", emoji:"🎰", risk:"extreme", chain:"SOL", lore:"Si tu DYOR sur ce token, tu l'as déjà raté." },
  { id:"CHAD", name:"$CHAD", desc:"Gigachad energy. 1000x minimum. Trust me.", emoji:"💪", risk:"high", chain:"ETH", lore:"Le meme become token. Comme toujours." },
  { id:"SATS", name:"$SATS", desc:"1 Satoshi = 0.00000001 BTC. Accumule.", emoji:"🔐", risk:"medium", chain:"BTC L2", lore:"La plus petite unité. La plus grande conviction." },
];

const SIGNAL_LABELS = ["Momentum","Volume","Whale Act.","Social Buzz"];
const SIGNAL_ICONS = [
  ["💤","🔥","🔥🔥","🔥🔥🔥"],
  ["📉","📊","📊📊","🚀"],
  ["😴","👀","🐋","🚨"],
  ["💀","📡","📢","🌐"]
];

const RISK_META = {
  low:     { color:"#00ff88", label:"LOW RISK",    bg:"#00ff8822" },
  medium:  { color:"#ffaa00", label:"MEDIUM",      bg:"#ffaa0022" },
  high:    { color:"#ff6600", label:"HIGH RISK",   bg:"#ff660022" },
  extreme: { color:"#ff2255", label:"⚠ EXTREME",   bg:"#ff225522" },
};

const EVENTS = [
  {
    id:"influencer", badge:"ALPHA LEAK", badgeColor:"#ff6600",
    title:"CryptoGuru™ tweete sur $TOKEN",
    body:'"C\'est le prochain 100x. J\'ai vendu ma voiture. NFA. DYOR. WAGMI ser 🚀🌙"',
    sub:"2.4M followers • Pinned Tweet • Trending #1",
    choices:[
      { id:"fomo",    label:"🚀 FOMO IN",         sub:"Ape maintenant",     energy:30, win:0.38, winMult:0.28, loseMult:-0.22 },
      { id:"observe", label:"👀 Observer",          sub:"Watch seulement",   energy:5,  win:0.9,  winMult:0.02, loseMult:-0.01 },
      { id:"analyze", label:"📊 DYOR rapide",      sub:"Due diligence",     energy:15, win:0.62, winMult:0.16, loseMult:-0.05 },
    ]
  },
  {
    id:"whale", badge:"ON-CHAIN ALERT", badgeColor:"#4488ff",
    title:"Wallet Satoshi_Jr.eth entre en position",
    body:"43/47 trades gagnants • $2.3M déployés sur token inconnu • confirmé on-chain",
    sub:"Wallet actif depuis 2017 • Top 0.1% performers",
    choices:[
      { id:"copy",    label:"📋 Copy trade",        sub:"Follow the whale",   energy:20, win:0.68, winMult:0.22, loseMult:-0.15 },
      { id:"observe", label:"👁️ Juste observer",    sub:"Trop tard?",         energy:5,  win:0.6,  winMult:0.04, loseMult:-0.02 },
      { id:"counter", label:"🔄 Short (contra)",    sub:"Toi vs le whale",   energy:25, win:0.22, winMult:0.5,  loseMult:-0.32 },
    ]
  },
  {
    id:"pizza", badge:"ANNIVERSARY", badgeColor:"#ffd700",
    title:"🍕 BITCOIN PIZZA DAY",
    body:"22 Mai 2010 — Laszlo Hanyecz paie 10,000 BTC pour 2 pizzas Papa John's. Aujourd'hui vaut $800M.",
    sub:"Le marché célèbre. Les OGs ont les mains de diamant.",
    choices:[
      { id:"hodl",  label:"💎 HODL In Honor",      sub:"Culture > profit",   energy:0,  win:0.85, winMult:0.06, loseMult:0.03 },
      { id:"trade", label:"📈 Trade momentum",      sub:"Market pumpe",       energy:15, win:0.55, winMult:0.18, loseMult:-0.08 },
      { id:"sell",  label:"😅 Sell comme Laszlo",  sub:"Historique (bad)",   energy:10, win:0.1,  winMult:0.02, loseMult:-0.14 },
    ]
  },
  {
    id:"rug", badge:"🚨 DANGER", badgeColor:"#ff2255",
    title:"Rumeur rug pull — Telegram insider",
    body:'"Dev wallet moving. LP drain imminent. 30 min max. GET OUT NOW." — Vraie alerte ou FUD?',
    sub:"Source anonyme • Non vérifiée • Réputée fiable",
    choices:[
      { id:"exit",   label:"💨 Exit immédiat",     sub:"Better safe than rekt", energy:10, win:0.95, winMult:-0.02, loseMult:-0.02 },
      { id:"ignore", label:"🙈 C'est du FUD",       sub:"Hold position",      energy:0,  win:0.42, winMult:0.01,  loseMult:-0.42 },
      { id:"verify", label:"🔍 Vérify on-chain",   sub:"DYOR réel",          energy:20, win:0.7,  winMult:-0.02, loseMult:-0.09 },
    ]
  },
  {
    id:"crash", badge:"MARKET CRASH", badgeColor:"#ff2255",
    title:"BTC chute de -18% en 4 heures",
    body:"$890M liquidés. Fear & Greed: 6/100 — Extreme Fear. 'This is fine 🔥' — Crypto Twitter entier.",
    sub:"BitMEX lag • Binance down • 'Probably nothing'",
    choices:[
      { id:"dh",   label:"💎 Diamond hands",       sub:"HODL pas matter what", energy:5,  win:0.45, winMult:0.14,  loseMult:-0.24 },
      { id:"btd",  label:"💰 Buy the dip",         sub:"Accumulation time",  energy:25, win:0.42, winMult:0.4,   loseMult:-0.3 },
      { id:"exit", label:"🛡️ Reduce exposure",      sub:"Live to trade again", energy:15, win:0.95, winMult:-0.03, loseMult:-0.03 },
    ]
  },
];

const BOSSES = [
  {
    id:"whale_man", name:"THE WHALE MANIPULATOR", emoji:"🐋",
    color:"#4488ff", quote:'"The market is my playground, ser."',
    lore:"Ce wallet existe depuis 2013. 47 tokens manipulés. Son dernier rug: $4.2M de retail rekt. Son pattern est connu de tous — mais résister reste quasi impossible.",
    hp:3,
    phases:[
      { title:"Phase I — Le Fake Pump", desc:"Prix monte artificiellement. Volume suspect. FOMO général créé. C'est un piège classique.", safe:0 },
      { title:"Phase II — La Distribution", desc:"Le whale commence à distribuer. Retail achète. Exit scam en cours.", safe:0 },
      { title:"Phase III — Le Dump Final", desc:"Whale est sorti. Prix -60% en 3 minutes. Aftermath brutal.", safe:0 },
    ],
    choices:[
      ["🔴 Ignore le piège","🟡 Small position","🟢 FOMO all-in (danger)"],
      ["💨 Exit avant lui","💎 Croire au projet","📉 Short maintenant"],
      ["🛡️ Stoploss activé","🎲 Hold recovery","⚡ Revenge short"],
    ],
  },
  {
    id:"black", name:"BLACK THURSDAY", emoji:"🌊",
    color:"#ff2255", quote:'"Mars 2020. Je me souviens de tout."',
    lore:"Le 12 Mars 2020: BTC $8k → $3.8k en quelques heures. $1B liquidé. Même les HODLers hardcore ont capitulé. BitMEX en maintenance. C'est maintenant.",
    hp:4,
    phases:[
      { title:"Phase I — Première Vague",    desc:"BTC -15%. Altcoins -25%. Exchanges qui lagent.", safe:0 },
      { title:"Phase II — Cascade Liqui",    desc:"$500M liquidés en 1h. Panique systémique.", safe:1 },
      { title:"Phase III — Capitulation",    desc:"Tout le monde vend. Bottom proche? Ou pas?", safe:1 },
      { title:"Phase IV — Dead Cat Bounce",  desc:"+20% recovery. Fake-out ou vrai retournement?", safe:0 },
    ],
    choices:[
      ["🛡️ Réduire exposure","💎 Diamond hands","💰 DCA early"],
      ["😤 Hold no matter what","📉 Cut losses","🔄 Hedge"],
      ["🚀 All-in bottom","⏳ Wait confirmation","💨 Exit total"],
      ["💰 Take profit now","🎯 Hold récupération","🔴 Short le bounce"],
    ],
  },
  {
    id:"scam", name:"SCAM SEASON", emoji:"🎭",
    color:"#ff6600", quote:'"DYOR or get rekt forever, ser."',
    lore:"Pump.fun tourne à plein régime. 500 nouveaux tokens par heure. 80% seront ruggés avant demain matin. Peux-tu distinguer le gem du scam?",
    hp:3,
    phases:[
      { title:"Phase I — Token Overload",   desc:"5 tokens shillés simultanément. Lequel est réel?", safe:0 },
      { title:"Phase II — Fausse Sécurité", desc:'"LP locked, audit ok, team doxxée." (tout est faux)', safe:0 },
      { title:"Phase III — Rug Live",        desc:"Dev drain les LP en direct. -95% en 30 secondes.", safe:0 },
    ],
    choices:[
      ["🔍 DYOR sur tous","🎲 Random pick","🚫 Skip tout"],
      ["🔍 Vérify on-chain","🙏 Trust le narrative","🚨 Red flag = exit"],
      ["⚡ Exit en premier","😱 Panic sell mid-dump","💎 Bag hold (cope)"],
    ],
  },
];

const CARDS = [
  { id:"wagmi",    name:"WAGMI",            emoji:"💎", rarity:"rare",      desc:"+30% gains si 3 wins consécutifs",       color:"#4488ff" },
  { id:"dh",       name:"Diamond Hands",    emoji:"🙌", rarity:"uncommon",  desc:"-50% pertes sur rug / crash",            color:"#00ccff" },
  { id:"sniper",   name:"Sniper Entry",     emoji:"⚡", rarity:"rare",      desc:"+40% gain sur early entry réussi",       color:"#ffaa00" },
  { id:"fud",      name:"FUD Resistant",    emoji:"🛡️", rarity:"uncommon",  desc:"Ignore 1 événement négatif (auto)",      color:"#00ff88" },
  { id:"whalef",   name:"Whale Follower",   emoji:"🐋", rarity:"rare",      desc:"+50% si copie whale réussit",            color:"#4488ff" },
  { id:"pizza",    name:"Pizza Millionaire",emoji:"🍕", rarity:"legendary", desc:"×2 sur prochain gain",                   color:"#ffd700" },
  { id:"satoshi",  name:"Satoshi's Gift",   emoji:"₿",  rarity:"legendary", desc:"Résurrection à 500 si mort",             color:"#ffd700" },
  { id:"gm",       name:"GM Energy",        emoji:"🌅", rarity:"common",    desc:"+20 énergie bonus par round",            color:"#888888" },
  { id:"dyor",     name:"DYOR Master",      emoji:"🔍", rarity:"uncommon",  desc:"Scanner coûte 50% moins d'énergie",      color:"#00ccff" },
  { id:"paper",    name:"Paper Hands",      emoji:"📄", rarity:"common",    desc:"+10% gain mais exit toujours tôt",       color:"#888888" },
  { id:"alpha",    name:"Alpha Insider",    emoji:"🧠", rarity:"rare",      desc:"Aperçu du résultat avant de décider",   color:"#aa44ff" },
  { id:"ngmic",    name:"NGMI Reversal",    emoji:"💀", rarity:"rare",      desc:"Grosses pertes → petites pertes (×0.55)",color:"#ff2255" },
  { id:"laser",    name:"Laser Eyes",       emoji:"🔴", rarity:"uncommon",  desc:"+15% sur chaque trade gagnant",         color:"#ff6600" },
  { id:"giga",     name:"Gigachad",         emoji:"💪", rarity:"legendary", desc:"Tous les gains ×1.5 ce run",            color:"#ffd700" },
];

const RARITY_COLORS = { common:"#777777", uncommon:"#00ccff", rare:"#aa44ff", legendary:"#ffd700" };

/* ═══════════════════════════════════════════════════════
   GAME LOGIC
═══════════════════════════════════════════════════════ */

function genSignals(token) {
  const riskBias = { low:0.4, medium:0.55, high:0.7, extreme:0.85 }[token.risk];
  return SIGNAL_LABELS.map((_,i) => {
    const v = Math.random();
    const biased = i === 2 ? v * riskBias * 1.2 : v;
    return Math.min(3, Math.floor(biased * 4));
  });
}

function resolve(action, token, cards, streak) {
  const rng = Math.random();
  const hasDH      = cards.some(c=>c.id==="dh");
  const hasSniper  = cards.some(c=>c.id==="sniper");
  const hasWAGMI   = cards.some(c=>c.id==="wagmi") && streak >= 2;
  const hasPizza   = cards.some(c=>c.id==="pizza");
  const hasLaser   = cards.some(c=>c.id==="laser");
  const hasGiga    = cards.some(c=>c.id==="giga");
  const hasNGMI    = cards.some(c=>c.id==="ngmic");
  const hasDYOR    = cards.some(c=>c.id==="dyor");
  const trapChance = { low:0.08, medium:0.18, high:0.32, extreme:0.48 }[token.risk];

  let r = { profit:0, energyCost:10, win:false, msg:"", sub:"", quality:"C", xp:20, scanInfo:null };

  const applyMults = (gain) => {
    if (gain > 0) {
      if (hasSniper && action==="early") gain *= 1.4;
      if (hasWAGMI) gain *= 1.3;
      if (hasPizza) gain *= 2;
      if (hasLaser) gain *= 1.15;
      if (hasGiga)  gain *= 1.5;
      if (cards.some(c=>c.id==="paper")) gain *= 1.1;
    } else {
      if (hasDH)   gain *= 0.5;
      if (hasNGMI) gain *= 0.55;
    }
    return gain;
  };

  if (action === "early") {
    r.energyCost = 25;
    if (rng < trapChance) {
      let loss = -(0.1 + rng * 0.28);
      r.profit = applyMults(loss); r.win = false;
      r.msg = "🎭 RUG CONFIRMED"; r.sub = "Dev wallet drainé. LP vidé. NGMI. Cope and seethe.";
      r.quality = "D"; r.xp = 12;
    } else if (rng < 0.52) {
      let loss = -(0.02 + rng * 0.09);
      r.profit = applyMults(loss); r.win = false;
      r.msg = "⏰ TROP TÔT"; r.sub = "Timing off. Le token n'était pas prêt. Patience ser.";
      r.quality = "C"; r.xp = 20;
    } else {
      let gain = 0.1 + rng * (token.risk==="extreme" ? 0.9 : 0.5);
      r.profit = applyMults(gain); r.win = true;
      r.msg = "⚡ ALPHA ENTRY"; r.sub = `+${(r.profit*100).toFixed(0)}% — Before everyone. Ser, tu es chad.`;
      r.quality = r.profit > 0.5 ? "S" : r.profit > 0.25 ? "A" : "B"; r.xp = 55;
    }
  } else if (action === "wait") {
    r.energyCost = 10;
    if (rng < 0.16) {
      r.profit = -(0.01 + rng * 0.04); r.win = false;
      r.msg = "⌛ MISSED THE PUMP"; r.sub = "Le token x6 sans toi. FOMO est réel ser.";
      r.quality = "C"; r.xp = 18;
    } else {
      let gain = 0.04 + rng * 0.19;
      r.profit = applyMults(gain); r.win = true;
      r.msg = "✅ CONFIRMED ENTRY"; r.sub = `+${(r.profit*100).toFixed(0)}% — Safe play. Discipline activée. WAGMI.`;
      r.quality = "A"; r.xp = 38;
    }
  } else if (action === "ignore") {
    r.energyCost = 5;
    if (rng < 0.26) {
      r.profit = 0; r.win = false;
      r.msg = "😤 MISSED 10x"; r.sub = `Token +${Math.floor(rng*800+400)}% sans toi. Cope. Seethe.`;
      r.quality = "D"; r.xp = 8;
    } else {
      r.profit = 0.004; r.win = true;
      r.msg = "🛡️ PERFECT SKIP"; r.sub = "Token ruggé 18min après. Capital préservé. Probably nothing.";
      r.quality = "A"; r.xp = 32;
    }
  } else if (action === "scan") {
    r.energyCost = hasDYOR ? 14 : 30;
    const found = rng > 0.32;
    r.profit = 0; r.win = found;
    r.msg = found ? "🧠 ALPHA TROUVÉ" : "📭 SCAN VIDE";
    r.sub = found ? "Wallet actif confirmé. Info = edge réel." : "Wallets dormants. Pas d'alpha ici.";
    r.quality = found ? "B" : "C"; r.xp = 24;
    if (found) r.scanInfo = `🐋 Wallet 0x...${Math.random().toString(36).substr(2,6).toUpperCase()} accumule $${(Math.random()*600+200).toFixed(0)}k`;
  }

  return r;
}

function resolveEvent(choice) {
  const rng = Math.random();
  const win = rng < choice.win;
  return { profit: win ? choice.winMult * (0.7 + Math.random()*0.6) : choice.loseMult * (0.7 + Math.random()*0.5), win };
}

function resolveBoss(boss, phaseIdx, choiceIdx) {
  const rng = Math.random();
  const safe = boss.phases[phaseIdx].safe;
  if (choiceIdx === safe) return { profit: rng < 0.68 ? 0.07+rng*0.13 : -0.04, win: rng < 0.68 };
  if (choiceIdx === (safe+1)%3) return { profit: rng < 0.48 ? 0.05+rng*0.12 : -(0.07+rng*0.12), win: rng < 0.48 };
  return { profit: rng < 0.28 ? 0.2+rng*0.45 : -(0.15+rng*0.22), win: rng < 0.28 };
}

function getRandomCards(n, existing) {
  const pool = CARDS.filter(c => !existing.some(e=>e.id===c.id));
  return [...pool].sort(()=>Math.random()-0.5).slice(0, n);
}

function calcScore(portfolio, history, cards, bossKilled) {
  const profit = (portfolio - 1000) / 10;
  const wins = history.filter(h=>h.win).length;
  const qual = history.length ? history.reduce((s,h)=>s+({S:4,A:3,B:2,C:1,D:0}[h.quality]||0),0)/history.length : 1;
  const disc = qual > 3.2 ? "S" : qual > 2.4 ? "A" : qual > 1.6 ? "B" : "C";
  const score = Math.round(
    Math.max(0,profit)*55 +
    wins*85 +
    cards.length*70 +
    (bossKilled?600:0) +
    history.length*45
  );
  return { profit: profit.toFixed(1), discipline: disc, score, wins, total: history.length };
}

/* ═══════════════════════════════════════════════════════
   STYLES / THEME
═══════════════════════════════════════════════════════ */
const G = {
  bg:"#06060f", surface:"#0c0c1e", surf2:"#111128", surf3:"#161638",
  border:"#1c1c42", borderHi:"#2a2a5a",
  green:"#00ff88", orange:"#ff6600", gold:"#ffd700",
  red:"#ff2255", blue:"#4488ff", purple:"#aa44ff",
  cyan:"#00ddff", text:"#b8b8d8", dim:"#484870",
  mono:"'Share Tech Mono','Courier New',monospace",
  display:"'Orbitron','Share Tech Mono',monospace",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${G.bg}; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${G.bg}; }
  ::-webkit-scrollbar-thumb { background: ${G.border}; border-radius: 2px; }
  @keyframes glitch {
    0%,100%{transform:none;filter:none;clip-path:none}
    20%{transform:translateX(-3px) skewX(-2deg);filter:hue-rotate(90deg);clip-path:polygon(0 15%,100% 15%,100% 40%,0 40%)}
    40%{transform:translateX(3px) skewX(2deg);filter:hue-rotate(-90deg);clip-path:polygon(0 60%,100% 60%,100% 80%,0 80%)}
    60%{transform:none;filter:none;clip-path:none}
  }
  @keyframes glow-pulse {0%,100%{box-shadow:0 0 8px #00ff8866}50%{box-shadow:0 0 22px #00ff88,0 0 40px #00ff8833}}
  @keyframes float {0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
  @keyframes fadeUp {from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn {from{opacity:0}to{opacity:1}}
  @keyframes blink {0%,49%{opacity:1}50%,100%{opacity:0}}
  @keyframes shake {0%,100%{transform:translateX(0)}15%{transform:translateX(-6px)}30%{transform:translateX(6px)}45%{transform:translateX(-4px)}60%{transform:translateX(4px)}75%{transform:translateX(-2px)}}
  @keyframes scanline {0%{top:-10%}100%{top:110%}}
  @keyframes spin {from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes countUp {from{transform:scale(0.8);opacity:0}to{transform:scale(1);opacity:1}}
  .btn:hover{opacity:0.88;transform:translateY(-1px)}
  .btn:active{transform:translateY(0)}
  .card-hover:hover{border-color:${G.borderHi}!important;transform:translateY(-2px)}
`;

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
export default function CryptoRoguelike() {
  const [screen,       setScreen]       = useState("home");
  const [portfolio,    setPortfolio]    = useState(1000);
  const [round,        setRound]        = useState(1);
  const [energy,       setEnergy]       = useState(100);
  const [cards,        setCards]        = useState([]);
  const [history,      setHistory]      = useState([]);
  const [token,        setToken]        = useState(null);
  const [signals,      setSignals]      = useState([0,0,0,0]);
  const [outcome,      setOutcome]      = useState(null);
  const [streak,       setStreak]       = useState(0);
  const [boss,         setBoss]         = useState(null);
  const [bossPhase,    setBossPhase]    = useState(0);
  const [bossHp,       setBossHp]       = useState(0);
  const [bossWin,      setBossWin]      = useState(false);
  const [event,        setEvent]        = useState(null);
  const [cardChoices,  setCardChoices]  = useState([]);
  const [runScore,     setRunScore]     = useState(null);
  const [leaderboard,  setLeaderboard]  = useState([]);
  const [playerName,   setPlayerName]   = useState("ANON");
  const [nameInput,    setNameInput]    = useState("");
  const [naming,       setNaming]       = useState(false);
  const [meta,         setMeta]         = useState({ xp:0, runs:0, best:0 });
  const [glitch,       setGlitch]       = useState(false);
  const [processing,   setProcessing]   = useState(false);

  const tokenPool  = useRef([]);
  const eventQueue = useRef([]);
  const tokenIndex = useRef(0);

  // Inject CSS + load saved data
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
    const load = async () => {
      try { const r = await window.storage.get("crg_lb_v2",true); if(r) setLeaderboard(JSON.parse(r.value)); } catch(e){}
      try { const r = await window.storage.get("crg_meta_v2");     if(r) setMeta(JSON.parse(r.value));        } catch(e){}
      try { const r = await window.storage.get("crg_name");         if(r) setPlayerName(r.value);              } catch(e){}
    };
    load();
    return () => document.head.removeChild(style);
  }, []);

  const doGlitch = () => { setGlitch(true); setTimeout(()=>setGlitch(false), 600); };

  // ─── START RUN ───
  const newRun = () => {
    tokenPool.current  = [...TOKENS].sort(()=>Math.random()-0.5);
    eventQueue.current = [...EVENTS].sort(()=>Math.random()-0.5);
    tokenIndex.current = 0;
    const t = tokenPool.current[0];
    setPortfolio(1000); setRound(1); setEnergy(100);
    setCards([]); setHistory([]); setOutcome(null); setStreak(0);
    setBoss(null); setBossPhase(0); setBossHp(0); setBossWin(false);
    setEvent(null); setRunScore(null); setProcessing(false);
    setToken(t); setSignals(genSignals(t));
    setScreen("playing");
  };

  const advanceToken = useCallback((newRound) => {
    tokenIndex.current++;
    const t = tokenPool.current[tokenIndex.current % tokenPool.current.length];
    setToken(t); setSignals(genSignals(t));
  }, []);

  // ─── ROUTE AFTER ROUND ───
  const afterRound = useCallback((completedRound, newPort, newHistory) => {
    // Game over check
    if (newPort < 8) {
      if (cards.some(c=>c.id==="satoshi")) {
        doGlitch();
        setPortfolio(500);
        setCards(prev=>prev.filter(c=>c.id!=="satoshi"));
        const nr = completedRound + 1;
        setRound(nr);
        advanceToken(nr);
        setScreen("playing");
        return;
      }
      finishRun(newPort, newHistory, false);
      return;
    }
    if (completedRound >= 8) {
      // BOSS
      const b = BOSSES[Math.floor(Math.random()*BOSSES.length)];
      setBoss(b); setBossPhase(0); setBossHp(b.hp); setBossWin(false);
      setScreen("boss");
      return;
    }
    const nr = completedRound + 1;
    setRound(nr);
    // Card reward every 3 rounds (after round 2, 5)
    if (completedRound === 2 || completedRound === 5) {
      setCardChoices(getRandomCards(3, cards));
      setScreen("card_reward");
      return;
    }
    // Event (40% chance on even rounds)
    if (completedRound % 2 === 0 && Math.random() < 0.55 && eventQueue.current.length > 0) {
      setEvent(eventQueue.current.shift());
      setScreen("event");
      return;
    }
    advanceToken(nr);
    setScreen("playing");
  }, [cards, advanceToken]);

  // ─── TRADE ACTION ───
  const handleAction = useCallback((action) => {
    if (processing || outcome) return;
    setProcessing(true);
    const r = resolve(action, token, cards, streak);
    const delta = portfolio * r.profit;
    const newPort = Math.max(0, portfolio + delta);
    const newStreak = r.win ? streak + 1 : 0;
    const entry = { round, token:token.name, action, profit:r.profit, win:r.win, quality:r.quality };
    const newHistory = [...history, entry];
    const energyBonus = cards.some(c=>c.id==="gm") ? 20 : 0;

    setPortfolio(newPort);
    setStreak(newStreak);
    setEnergy(prev => Math.max(0, prev - r.energyCost + energyBonus));
    setHistory(newHistory);
    setOutcome({ ...r, delta, newPort, prevPort:portfolio });

    if (newStreak >= 3 && cards.some(c=>c.id==="wagmi")) doGlitch();

    setTimeout(() => {
      setOutcome(null);
      setProcessing(false);
      afterRound(round, newPort, newHistory);
    }, 2600);
  }, [processing, outcome, token, cards, streak, portfolio, round, history, afterRound]);

  // ─── EVENT ───
  const handleEvent = useCallback((choice) => {
    const r = resolveEvent(choice);
    const newPort = Math.max(0, portfolio * (1 + r.profit));
    setPortfolio(newPort);
    setEnergy(prev => Math.max(0, prev - choice.energy));
    setEvent(null);
    advanceToken(round);
    setScreen("playing");
  }, [portfolio, round, advanceToken]);

  // ─── CARD CHOICE ───
  const handleCardChoice = useCallback((card) => {
    setCards(prev => [...prev, card]);
    setCardChoices([]);
    advanceToken(round);
    setScreen("playing");
  }, [round, advanceToken]);

  // ─── BOSS ───
  const handleBoss = useCallback((choiceIdx) => {
    const r = resolveBoss(boss, bossPhase, choiceIdx);
    const newPort = Math.max(0, portfolio * (1 + r.profit));
    setPortfolio(newPort);
    doGlitch();
    const newHp = bossHp - 1;
    setBossHp(newHp);
    if (newHp <= 0) {
      setBossWin(true);
      setTimeout(() => finishRun(newPort, history, true), 1800);
    } else {
      setBossPhase(prev => prev + 1);
    }
  }, [boss, bossPhase, portfolio, bossHp, history]);

  // ─── FINISH ───
  const finishRun = useCallback(async (finalPort, hist, bossKilled) => {
    const s = calcScore(finalPort, hist, cards, bossKilled);
    setRunScore(s);
    setScreen("end");
    const newMeta = { xp: meta.xp + Math.round(s.score/40), runs: meta.runs+1, best: Math.max(meta.best, s.score) };
    setMeta(newMeta);
    try { await window.storage.set("crg_meta_v2", JSON.stringify(newMeta)); } catch(e){}
    const entry = { name:playerName, score:s.score, profit:s.profit, date:new Date().toLocaleDateString("fr-FR") };
    const lb = [...leaderboard];
    const ex = lb.findIndex(e=>e.name===playerName);
    if (ex>=0) { if(s.score>lb[ex].score) lb[ex]=entry; } else lb.push(entry);
    lb.sort((a,b)=>b.score-a.score);
    const top10 = lb.slice(0,10);
    setLeaderboard(top10);
    try { await window.storage.set("crg_lb_v2", JSON.stringify(top10), true); } catch(e){}
  }, [cards, meta, playerName, leaderboard]);

  const saveName = async () => {
    const n = (nameInput.trim() || "ANON").toUpperCase().slice(0,12);
    setPlayerName(n); setNaming(false);
    try { await window.storage.set("crg_name", n); } catch(e){}
  };

  /* ═══ RENDER HELPERS ═══ */
  const Wrap = ({children, shake=false}) => (
    <div style={{background:G.bg, minHeight:"100vh", fontFamily:G.mono, color:G.text, position:"relative", overflow:"hidden",
      animation: (glitch||shake) ? "glitch 0.5s" : "none",
      backgroundImage:`linear-gradient(${G.border}22 1px,transparent 1px),linear-gradient(90deg,${G.border}22 1px,transparent 1px)`,
      backgroundSize:"36px 36px"
    }}>
      {/* Scanline */}
      <div style={{position:"fixed",top:0,left:0,right:0,height:"2px",background:`linear-gradient(90deg,transparent,${G.green}44,transparent)`,
        animation:"scanline 5s linear infinite",pointerEvents:"none",zIndex:9999}} />
      <div style={{maxWidth:480, margin:"0 auto", padding:"16px", paddingBottom:32}}>
        {children}
      </div>
    </div>
  );

  const Badge = ({text, color=G.red}) => (
    <span style={{background:color,color:"#000",fontFamily:G.display,fontSize:9,fontWeight:700,letterSpacing:3,
      padding:"3px 10px",borderRadius:2,display:"inline-block",animation:"blink 1.4s infinite"}}>{text}</span>
  );

  const Tag = ({text,color=G.dim}) => (
    <span style={{border:`1px solid ${color}44`,color,fontSize:9,padding:"2px 7px",borderRadius:2,letterSpacing:2}}>{text}</span>
  );

  const Divider = () => <div style={{height:1,background:G.border,margin:"12px 0"}} />;

  const PortBar = ({val}) => (
    <div style={{height:4,background:G.surf2,borderRadius:2,overflow:"hidden",marginTop:4}}>
      <div style={{height:"100%",width:`${Math.min(100,Math.max(0,(val/2000)*100))}%`,
        background:`linear-gradient(90deg,${G.blue},${G.green})`,transition:"width 0.6s",
        boxShadow:`0 0 8px ${G.green}66`}} />
    </div>
  );

  const EnergyBar = ({val}) => {
    const col = val<30 ? G.red : val<60 ? G.orange : G.green;
    return (
      <div style={{height:3,background:G.surf2,borderRadius:2,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${val}%`,background:col,transition:"width 0.5s",boxShadow:`0 0 6px ${col}88`}} />
      </div>
    );
  };

  /* ═══ HOME ═══ */
  if (screen === "home") return (
    <Wrap>
      <div style={{textAlign:"center",padding:"24px 0 16px"}}>
        <div style={{fontFamily:G.display,fontSize:9,color:G.dim,letterSpacing:6,marginBottom:10}}>
          BLOCKCHAIN PROTOCOL // NOT FINANCIAL ADVICE
        </div>
        <div style={{fontFamily:G.display,fontSize:32,fontWeight:900,color:G.green,letterSpacing:3,
          textShadow:`0 0 30px ${G.green}88,0 0 60px ${G.green}33`,lineHeight:1,animation:"fadeUp 0.6s ease"}}>
          CRYPTO<br/>ROGUELIKE
        </div>
        <div style={{color:G.orange,fontSize:11,marginTop:10,letterSpacing:4}}>
          ⚡ LEARN TO TRADE — SURVIVE THE MARKET ⚡
        </div>
        <div style={{color:G.dim,fontSize:10,marginTop:4}}>
          runs courts • skill &gt; chance • każde run jest inny
        </div>
      </div>

      {/* Leaderboard */}
      <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:10,padding:"16px",marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <span style={{fontFamily:G.display,fontSize:10,color:G.gold,letterSpacing:3}}>🏆 HALL OF LEGENDS</span>
          <Tag text="SHARED" color={G.gold} />
        </div>
        {leaderboard.length===0 ? (
          <div style={{color:G.dim,fontSize:12,textAlign:"center",padding:"20px 0"}}>
            Aucune entrée.<br/>Sois le premier ser.<br/>
            <span style={{animation:"blink 1s infinite",display:"inline-block",marginTop:8}}>▋</span>
          </div>
        ) : leaderboard.slice(0,8).map((e,i) => (
          <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",
            borderBottom: i<leaderboard.length-1 ? `1px solid ${G.border}` : "none"}}>
            <span style={{fontFamily:G.display,fontSize:11,width:22,color:i===0?G.gold:i===1?"#c0c0c0":i===2?"#cd7f32":G.dim}}>
              {i===0?"①":i===1?"②":i===2?"③":`${i+1}.`}
            </span>
            <span style={{flex:1,fontSize:12,color:e.name===playerName?G.green:G.text,fontWeight:e.name===playerName?"bold":"normal"}}>
              {e.name}{e.name===playerName?" ◀":""}
            </span>
            <span style={{fontSize:11,color:Number(e.profit)>=0?G.green:G.red}}>
              {Number(e.profit)>=0?"+":""}{e.profit}%
            </span>
            <span style={{fontFamily:G.display,fontSize:12,color:G.gold,minWidth:60,textAlign:"right"}}>
              {Number(e.score).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Meta Stats */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
        {[["RUNS",meta.runs,G.blue],["BEST",Number(meta.best).toLocaleString(),G.gold],["XP",meta.xp,G.green]].map(([label,val,color])=>(
          <div key={label} style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:8,padding:"10px 8px",textAlign:"center"}}>
            <div style={{color:G.dim,fontSize:9,letterSpacing:3}}>{label}</div>
            <div style={{color,fontFamily:G.display,fontSize:16,fontWeight:700,marginTop:4}}>{val}</div>
          </div>
        ))}
      </div>

      {/* Name */}
      <div style={{marginBottom:12}}>
        {!naming ? (
          <button className="btn" onClick={()=>{setNameInput(playerName);setNaming(true);}}
            style={{width:"100%",background:G.surf2,border:`1px solid ${G.border}`,color:G.dim,padding:"9px 14px",
              fontSize:12,fontFamily:G.mono,borderRadius:7,cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}>
            👤 TRADER: <span style={{color:G.text,fontWeight:"bold"}}>{playerName}</span>
            <span style={{float:"right",color:G.dim}}>[modifier]</span>
          </button>
        ) : (
          <div style={{display:"flex",gap:8}}>
            <input value={nameInput} onChange={e=>setNameInput(e.target.value)} maxLength={12}
              onKeyDown={e=>e.key==="Enter"&&saveName()} autoFocus
              placeholder="TON NOM (max 12)"
              style={{flex:1,background:G.surf2,border:`2px solid ${G.green}`,color:G.green,padding:"9px 12px",
                fontSize:13,fontFamily:G.mono,borderRadius:7,outline:"none"}} />
            <button className="btn" onClick={saveName}
              style={{background:G.green,color:G.bg,border:"none",padding:"9px 18px",fontFamily:G.display,
                fontSize:12,borderRadius:7,cursor:"pointer",fontWeight:700,transition:"all 0.2s"}}>OK</button>
          </div>
        )}
      </div>

      {/* Start */}
      <button className="btn" onClick={newRun}
        style={{width:"100%",background:`linear-gradient(135deg,${G.green}18,${G.green}35)`,
          border:`2px solid ${G.green}`,color:G.green,padding:"18px",fontFamily:G.display,
          fontSize:18,fontWeight:900,borderRadius:10,cursor:"pointer",letterSpacing:5,
          textShadow:`0 0 20px ${G.green}`,animation:"glow-pulse 2s infinite",
          boxShadow:`inset 0 0 30px ${G.green}11`,transition:"all 0.2s",marginBottom:12}}>
        ▶ NEW RUN
      </button>

      <div style={{color:G.dim,fontSize:10,textAlign:"center",lineHeight:1.8}}>
        ₿ &nbsp; 🍕 &nbsp; 💎 &nbsp; WAGMI &nbsp; HODL &nbsp; GM &nbsp; 🐋<br/>
        Inspired by Satoshi's vision & Balatro's addiction<br/>
        <span style={{color:`${G.dim}88`}}>This is not financial advice, ser. DYOR. NFA.</span>
      </div>
    </Wrap>
  );

  /* ═══ PLAYING ═══ */
  if (screen === "playing" && token) {
    const risk = RISK_META[token.risk];
    const portDelta = outcome?.delta || 0;
    const isPos = portDelta >= 0;

    return (
      <Wrap>
        {/* Top bar */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <div>
            <div style={{color:G.dim,fontSize:9,letterSpacing:3}}>PORTFOLIO</div>
            <div style={{fontFamily:G.display,fontSize:22,fontWeight:900,
              color:portDelta<0?G.red:G.green,textShadow:`0 0 15px ${portDelta<0?G.red:G.green}66`,transition:"color 0.5s"}}>
              ${portfolio.toFixed(0)}
              {outcome && <span style={{fontSize:14,marginLeft:8,animation:"countUp 0.4s ease"}}>
                {isPos?"+":""}{portDelta.toFixed(0)}
              </span>}
            </div>
            <PortBar val={portfolio} />
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{color:G.dim,fontSize:9,letterSpacing:3}}>ROUND</div>
            <div style={{fontFamily:G.display,fontSize:18,color:G.text}}>
              {round}<span style={{color:G.dim}}>/8</span>
            </div>
            <div style={{fontSize:9,color:G.dim,marginTop:2}}>then BOSS</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{color:G.dim,fontSize:9,letterSpacing:3}}>ENERGY</div>
            <div style={{fontFamily:G.display,fontSize:18,color:energy<30?G.red:energy<60?G.orange:G.cyan}}>
              {energy}<span style={{color:G.dim}}>/100</span>
            </div>
          </div>
        </div>

        <EnergyBar val={energy} />

        {streak>=2 && (
          <div style={{textAlign:"center",color:G.gold,fontSize:11,letterSpacing:2,
            padding:"6px",background:`${G.gold}11`,borderRadius:6,margin:"8px 0",
            border:`1px solid ${G.gold}33`,animation:"fadeUp 0.3s"}}>
            🔥 STREAK ×{streak}{streak>=3?` — 💎 WAGMI BONUS +30% ACTIF`:""}
          </div>
        )}

        {/* Token Card */}
        <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:12,padding:"14px",
          margin:"10px 0",position:"relative",overflow:"hidden",animation:"fadeIn 0.4s"}}>
          <div style={{position:"absolute",top:0,right:0,background:risk.color,color:"#000",
            fontSize:9,padding:"5px 12px",fontFamily:G.display,fontWeight:700,letterSpacing:2,
            borderBottomLeftRadius:8}}>{risk.label}</div>

          <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:12}}>
            <div style={{fontSize:38,lineHeight:1,filter:`drop-shadow(0 0 8px ${risk.color}88)`}}>
              {token.emoji}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:G.display,fontSize:21,fontWeight:900,color:G.text,letterSpacing:1}}>
                {token.name}
              </div>
              <div style={{color:G.dim,fontSize:11,marginTop:3}}>{token.desc}</div>
              <div style={{marginTop:6,display:"flex",gap:6,flexWrap:"wrap"}}>
                <Tag text={`⛓ ${token.chain}`} color={G.blue} />
                <Tag text={`ROUND ${round}`} color={G.dim} />
              </div>
            </div>
          </div>

          <div style={{background:`${risk.color}08`,border:`1px solid ${risk.color}22`,
            borderRadius:6,padding:"6px 10px",marginBottom:10,fontSize:10,color:risk.color,fontStyle:"italic"}}>
            "{token.lore}"
          </div>

          {/* Signals */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
            {SIGNAL_LABELS.map((label,i) => (
              <div key={label} style={{background:G.surf2,border:`1px solid ${G.border}`,borderRadius:7,
                padding:"7px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{color:G.dim,fontSize:10}}>{label}</span>
                <span style={{fontSize:16,transition:"all 0.3s"}}>{SIGNAL_ICONS[i][signals[i]]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Outcome display */}
        {outcome && (
          <div style={{background:outcome.win?`${G.green}10`:`${G.red}10`,
            border:`1px solid ${outcome.win?G.green:G.red}66`,borderRadius:9,padding:"14px",
            marginBottom:10,animation:"fadeUp 0.35s ease",textAlign:"center"}}>
            <div style={{fontFamily:G.display,fontSize:15,fontWeight:900,
              color:outcome.win?G.green:G.red,marginBottom:6}}>{outcome.msg}</div>
            <div style={{color:G.text,fontSize:12,lineHeight:1.6}}>{outcome.sub}</div>
            {outcome.scanInfo && (
              <div style={{color:G.blue,fontSize:11,marginTop:8,background:`${G.blue}11`,
                padding:"6px 10px",borderRadius:5,border:`1px solid ${G.blue}33`}}>{outcome.scanInfo}</div>
            )}
            <div style={{marginTop:8,display:"flex",justifyContent:"center",gap:12}}>
              <span style={{fontSize:11,color:G.dim}}>QUALITÉ:&nbsp;
                <span style={{color:{S:G.gold,A:G.green,B:G.blue,C:G.orange,D:G.red}[outcome.quality],fontWeight:700}}>
                  {outcome.quality}
                </span>
              </span>
              <span style={{fontSize:11,color:G.dim}}>+{outcome.xp} XP</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!outcome && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
            {[
              { action:"early",  label:"⚡ ENTRY EARLY",   sub:"Max risque / Max gain",   color:G.orange, nrg:25  },
              { action:"wait",   label:"✅ ATTENDRE",        sub:"Confirmation d'abord",   color:G.green,  nrg:10  },
              { action:"ignore", label:"🚫 IGNORER",         sub:"Skip ce token",           color:G.dim,    nrg:5   },
              { action:"scan",   label:"🔍 SCANNER",         sub:"Info wallets on-chain",   color:G.blue,   nrg:30  },
            ].map(({action,label,sub,color,nrg})=>{
              const disabled = energy < nrg;
              return (
                <button key={action} className={disabled?"":"btn"} onClick={()=>handleAction(action)}
                  disabled={disabled}
                  style={{background:G.surface,border:`1px solid ${disabled?G.border:color}44`,
                    color:disabled?G.dim:color,padding:"13px 10px",fontFamily:G.mono,fontSize:12,
                    borderRadius:9,cursor:disabled?"not-allowed":"pointer",textAlign:"left",
                    opacity:disabled?0.4:1,transition:"all 0.2s",
                    boxShadow:disabled?"none":`0 0 0 0 ${color}00`}}>
                  <div style={{fontWeight:"bold",letterSpacing:0.5}}>{label}</div>
                  <div style={{fontSize:10,color:G.dim,marginTop:3}}>{sub}</div>
                  <div style={{fontSize:9,color:disabled?G.dim:color,marginTop:4,opacity:0.7}}>
                    ⚡ -{nrg} NRG {disabled?"(insuff.)":""}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Cards hand */}
        {cards.length>0 && (
          <div style={{marginTop:6}}>
            <div style={{color:G.dim,fontSize:9,letterSpacing:3,marginBottom:7}}>
              CARTES ACTIVES [{cards.length}]
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {cards.map(c=>(
                <div key={c.id} style={{background:G.surf2,border:`1px solid ${RARITY_COLORS[c.rarity]}44`,
                  borderRadius:6,padding:"4px 9px",display:"flex",alignItems:"center",gap:5,
                  boxShadow:`0 0 6px ${RARITY_COLORS[c.rarity]}22`}}>
                  <span style={{fontSize:14}}>{c.emoji}</span>
                  <span style={{fontSize:10,color:RARITY_COLORS[c.rarity]}}>{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{color:G.dim,fontSize:10,textAlign:"center",marginTop:10}}>
          {energy<30 ? "⚠️ LOW ENERGY — Choisir avec soin, ser" :
           processing ? "⏳ Résolution en cours..." :
           "DYOR • NFA • WAGMI • GM ser • Probably nothing"}
        </div>
      </Wrap>
    );
  }

  /* ═══ EVENT ═══ */
  if (screen === "event" && event) return (
    <Wrap>
      <div style={{padding:"20px 0",animation:"fadeIn 0.4s"}}>
        <Badge text={event.badge} color={event.badgeColor} />
        <div style={{fontFamily:G.display,fontSize:20,fontWeight:900,color:G.text,
          margin:"12px 0 6px",lineHeight:1.2}}>{event.title}</div>
        <div style={{color:G.dim,fontSize:10,marginBottom:16}}>ROUND {round} • ÉVÉNEMENT</div>

        <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:10,
          padding:"16px",marginBottom:16}}>
          <div style={{color:G.orange,fontSize:13,fontStyle:"italic",lineHeight:1.6,marginBottom:8}}>
            {event.body}
          </div>
          <div style={{color:G.dim,fontSize:10}}>— {event.sub}</div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          {event.choices.map(c=>(
            <button key={c.id} className="btn card-hover" onClick={()=>handleEvent(c)}
              style={{background:G.surface,border:`1px solid ${G.border}`,color:G.text,
                padding:"15px 16px",fontFamily:G.mono,fontSize:13,borderRadius:9,
                cursor:"pointer",textAlign:"left",transition:"all 0.2s",
                display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontWeight:"bold"}}>{c.label}</div>
                <div style={{fontSize:10,color:G.dim,marginTop:3}}>{c.sub}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0,marginLeft:12}}>
                <div style={{fontSize:10,color:c.energy>20?G.red:c.energy>0?G.orange:G.green,fontFamily:G.display}}>
                  {c.energy>0?`-${c.energy} NRG`:"FREE"}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div style={{color:G.dim,fontSize:10,textAlign:"center",marginTop:14}}>
          Tes décisions définissent ton run. NFA.
        </div>
      </div>
    </Wrap>
  );

  /* ═══ CARD REWARD ═══ */
  if (screen === "card_reward") return (
    <Wrap>
      <div style={{textAlign:"center",padding:"20px 0 16px",animation:"fadeIn 0.4s"}}>
        <div style={{fontFamily:G.display,fontSize:9,color:G.gold,letterSpacing:5,marginBottom:8}}>
          CARD REWARD
        </div>
        <div style={{fontFamily:G.display,fontSize:22,fontWeight:900,color:G.text}}>
          CHOISIS TON ARME
        </div>
        <div style={{color:G.dim,fontSize:11,marginTop:6}}>
          Une seule carte, ser. Elle changera ton run.
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {cardChoices.map((c,i)=>(
          <button key={c.id} className="btn card-hover" onClick={()=>handleCardChoice(c)}
            style={{background:G.surface,border:`2px solid ${RARITY_COLORS[c.rarity]}55`,
              borderRadius:12,padding:"18px",cursor:"pointer",textAlign:"left",
              transition:"all 0.25s",animation:`fadeUp ${0.2+i*0.1}s ease`,
              boxShadow:`0 0 20px ${RARITY_COLORS[c.rarity]}11`}}>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{fontSize:42,filter:`drop-shadow(0 0 10px ${RARITY_COLORS[c.rarity]}66)`,
                animation:"float 2.5s infinite",animationDelay:`${i*0.3}s`}}>{c.emoji}</div>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <span style={{fontFamily:G.display,fontSize:15,fontWeight:700,color:RARITY_COLORS[c.rarity]}}>
                    {c.name}
                  </span>
                  <span style={{fontSize:9,color:RARITY_COLORS[c.rarity],opacity:0.7,
                    letterSpacing:2,textTransform:"uppercase"}}>{c.rarity}</span>
                </div>
                <div style={{fontSize:12,color:G.text,lineHeight:1.5}}>{c.desc}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </Wrap>
  );

  /* ═══ BOSS ═══ */
  if (screen === "boss" && boss) {
    const phase = boss.phases[bossPhase] || boss.phases[boss.phases.length-1];
    const choices = boss.choices[bossPhase] || boss.choices[boss.choices.length-1];
    const hpPct = (bossHp/boss.hp)*100;

    return (
      <Wrap shake={glitch}>
        <div style={{textAlign:"center",padding:"16px 0 12px",animation:"fadeIn 0.5s"}}>
          <div style={{fontSize:52,animation:"float 1.5s infinite",
            filter:`drop-shadow(0 0 20px ${boss.color})`}}>{boss.emoji}</div>
          <div style={{fontFamily:G.display,fontSize:17,fontWeight:900,color:boss.color,
            marginTop:8,letterSpacing:2,textShadow:`0 0 20px ${boss.color}88`}}>{boss.name}</div>
          <div style={{color:G.dim,fontSize:11,fontStyle:"italic",marginTop:4}}>
            {boss.quote}
          </div>
        </div>

        {/* HP */}
        <div style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{color:G.dim,fontSize:9,letterSpacing:3}}>BOSS HP</span>
            <span style={{fontFamily:G.display,fontSize:12,color:boss.color}}>
              {"█".repeat(bossHp)}{"░".repeat(boss.hp-bossHp)} {bossHp}/{boss.hp}
            </span>
          </div>
          <div style={{height:8,background:G.surf2,borderRadius:4,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${hpPct}%`,background:`linear-gradient(90deg,${boss.color},${boss.color}aa)`,
              transition:"width 0.7s",boxShadow:`0 0 12px ${boss.color}`}} />
          </div>
        </div>

        {/* Lore (only first time) */}
        {bossPhase===0 && (
          <div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:9,
            padding:"12px",marginBottom:12,fontSize:11,color:G.text,lineHeight:1.7,animation:"fadeUp 0.4s"}}>
            {boss.lore}
          </div>
        )}

        {/* Phase info */}
        <div style={{background:`${boss.color}0e`,border:`1px solid ${boss.color}44`,borderRadius:9,
          padding:"14px",marginBottom:12}}>
          <div style={{fontFamily:G.display,fontSize:11,color:boss.color,letterSpacing:2,marginBottom:6}}>
            {phase.title}
          </div>
          <div style={{color:G.text,fontSize:12,lineHeight:1.6}}>{phase.desc}</div>
        </div>

        {/* Portfolio */}
        <div style={{display:"flex",justifyContent:"space-between",padding:"9px 0",
          borderTop:`1px solid ${G.border}`,marginBottom:12}}>
          <span style={{color:G.dim,fontSize:11}}>PORTFOLIO</span>
          <span style={{fontFamily:G.display,color:G.green,fontSize:15,fontWeight:700}}>
            ${portfolio.toFixed(0)}
          </span>
        </div>

        {/* Choices */}
        {!bossWin ? (
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {choices.map((choice,i)=>(
              <button key={i} className="btn card-hover" onClick={()=>handleBoss(i)}
                style={{background:G.surface,border:`1px solid ${G.border}`,color:G.text,
                  padding:"15px 16px",fontFamily:G.mono,fontSize:13,borderRadius:9,
                  cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}>
                {choice}
              </button>
            ))}
          </div>
        ) : (
          <div style={{textAlign:"center",padding:"20px",animation:"fadeUp 0.5s"}}>
            <div style={{fontSize:40,marginBottom:12}}>🎉</div>
            <div style={{fontFamily:G.display,fontSize:18,color:G.green,
              textShadow:`0 0 20px ${G.green}`,animation:"glow-pulse 1s infinite"}}>
              BOSS VAINCU — WAGMI
            </div>
          </div>
        )}

        <div style={{color:G.dim,fontSize:10,textAlign:"center",marginTop:12}}>
          BOSS BATTLE • SURVIVE = WIN • NFA AS ALWAYS
        </div>
      </Wrap>
    );
  }

  /* ═══ END ═══ */
  if (screen === "end" && runScore) {
    const isProfit = Number(runScore.profit) >= 0;
    const rank = leaderboard.findIndex(e=>e.name===playerName) + 1;
    const bossKilled = screen === "end" && bossWin;
    const emoji = bossWin ? "👑" : isProfit ? "📈" : "💀";
    const title = bossWin ? "LEGENDARY RUN" : isProfit ? "GG WP SER" : "REKT. NGMI.";
    const subtitle = bossWin ? "Boss vaincu. Hall of Legends confirmed." : isProfit ? "WAGMI était réel." : "Reviens plus fort. BUIDL harder.";

    return (
      <Wrap>
        <div style={{textAlign:"center",padding:"24px 0 16px",animation:"fadeIn 0.5s"}}>
          <div style={{fontSize:54,marginBottom:10,animation:"float 2s infinite"}}>{emoji}</div>
          <div style={{fontFamily:G.display,fontSize:24,fontWeight:900,
            color:bossWin?G.gold:isProfit?G.green:G.red,
            textShadow:`0 0 30px ${bossWin?G.gold:isProfit?G.green:G.red}88`}}>{title}</div>
          <div style={{color:G.dim,fontSize:12,marginTop:6}}>{subtitle}</div>
        </div>

        {/* Score card */}
        <div style={{background:G.surface,border:`1px solid ${bossWin?G.gold:G.border}`,
          borderRadius:12,padding:"18px",marginBottom:14,
          boxShadow:bossWin?`0 0 30px ${G.gold}33`:""  }}>
          <div style={{color:G.dim,fontSize:9,letterSpacing:4,marginBottom:14}}>RUN SUMMARY</div>
          {[
            ["💰 Profit",    `${Number(runScore.profit)>=0?"+":""}${runScore.profit}%`, isProfit?G.green:G.red],
            ["🧠 Discipline", runScore.discipline,    {S:G.gold,A:G.green,B:G.blue,C:G.orange,D:G.red}[runScore.discipline]||G.dim],
            ["✅ Wins",       `${runScore.wins}/${runScore.total}`, G.text],
            ["🎴 Cartes",     `${cards.length} cartes`, G.purple],
            ["⭐ SCORE",      Number(runScore.score).toLocaleString(), G.gold],
          ].map(([label,val,color],i)=>(
            <div key={label} style={{display:"flex",justifyContent:"space-between",
              padding:"8px 0",borderBottom:i<4?`1px solid ${G.border}`:"none"}}>
              <span style={{fontSize:12,color:G.dim}}>{label}</span>
              <span style={{fontFamily:G.display,fontSize:14,color,fontWeight:700}}>{val}</span>
            </div>
          ))}
        </div>

        {/* Rank */}
        {rank>0 && rank<=10 && (
          <div style={{textAlign:"center",color:G.gold,fontSize:13,fontFamily:G.display,
            padding:"10px",background:`${G.gold}11`,borderRadius:8,
            border:`1px solid ${G.gold}33`,marginBottom:14,animation:"fadeUp 0.5s"}}>
            🏆 RANG #{rank} SUR LE LEADERBOARD
          </div>
        )}

        {/* Cards this run */}
        {cards.length>0 && (
          <div style={{marginBottom:14}}>
            <div style={{color:G.dim,fontSize:9,letterSpacing:3,marginBottom:8}}>CARTES DE CE RUN</div>
            <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
              {cards.map(c=>(
                <div key={c.id} style={{background:G.surface,border:`1px solid ${RARITY_COLORS[c.rarity]}55`,
                  borderRadius:7,padding:"6px 11px",fontSize:12,display:"flex",alignItems:"center",gap:5}}>
                  {c.emoji} <span style={{color:RARITY_COLORS[c.rarity]}}>{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quote */}
        <div style={{color:G.dim,fontSize:11,textAlign:"center",fontStyle:"italic",
          lineHeight:1.8,marginBottom:18,padding:"12px",background:G.surface,
          borderRadius:8,border:`1px solid ${G.border}`}}>
          {isProfit
            ? '"Not your keys, not your coins. Mais ton score, il est bien à toi." — Satoshi (probablement)'
            : '"The best time to DYOR was yesterday. Second best: right now." — Crypto proverbe'}
        </div>

        <button className="btn" onClick={()=>setScreen("home")}
          style={{width:"100%",background:`linear-gradient(135deg,${G.green}18,${G.green}35)`,
            border:`2px solid ${G.green}`,color:G.green,padding:"15px",fontFamily:G.display,
            fontSize:15,fontWeight:900,borderRadius:10,cursor:"pointer",letterSpacing:4,marginBottom:8,transition:"all 0.2s"}}>
          ↩ BACK TO LOBBY
        </button>
        <button className="btn" onClick={newRun}
          style={{width:"100%",background:"transparent",border:`1px solid ${G.border}`,
            color:G.dim,padding:"11px",fontFamily:G.mono,fontSize:12,borderRadius:9,
            cursor:"pointer",transition:"all 0.2s"}}>
          ⚡ NEW RUN IMMEDIATELY (RAGE MODE)
        </button>
      </Wrap>
    );
  }

  return <Wrap><div style={{textAlign:"center",padding:40,color:G.dim}}>Loading...</div></Wrap>;
}
