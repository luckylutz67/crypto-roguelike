import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════
   GAME DATA
═══════════════════════════════════════════════════════ */
const TOKENS = [
  { id:"SATO",  name:"$SATO",  desc:"Genesis block tribute. Satoshi approves.", emoji:"₿",  risk:"medium",  chain:"BTC L1", lore:"Block 0. Le début de tout." },
  { id:"PIZZA", name:"$PIZZA", desc:"10,000 BTC = 2 pizzas. Laszlo pleure encore.", emoji:"🍕", risk:"high",   chain:"ETH",    lore:"22 Mai 2010. L'achat le plus cher de l'histoire." },
  { id:"WAGMI", name:"$WAGMI", desc:"We Are Gonna Make It. Culture > charts.", emoji:"💎",  risk:"low",     chain:"SOL",    lore:"Le rallying cry des crypto natives." },
  { id:"NGMI",  name:"$NGMI",  desc:"Not Gonna Make It. Contrarian degen play.", emoji:"💀", risk:"extreme", chain:"ETH",    lore:"Un trade ironique. Ou pas." },
  { id:"HODL",  name:"$HODL",  desc:'\"I AM HODLING\" — La typo la plus rentable.', emoji:"🙌", risk:"low",  chain:"BTC",    lore:"2013. GameKyuubi. Ivre. Légendaire." },
  { id:"WIF",   name:"$WIF",   desc:"Dog with hat. Zero utility. Max vibes.", emoji:"🐕",  risk:"medium",  chain:"SOL",    lore:"Un chien avec un chapeau. $4B de market cap." },
  { id:"BONK",  name:"$BONK",  desc:"Bonk les bears. Solana speed.", emoji:"🔨",  risk:"high",    chain:"SOL",    lore:"Le premier meme coin Solana. Airdrop légendaire." },
  { id:"PEPO",  name:"$PEPO",  desc:"Rare Pepe on-chain. Feels good, ser.", emoji:"🐸",  risk:"medium",  chain:"ETH",    lore:"Une grenouille. Une communauté. Un mythe." },
  { id:"LAMBO", name:"$LAMBO", desc:"Still waiting. 2025 edition. Probably soon™", emoji:"🏎️", risk:"high", chain:"BSC",    lore:"La promesse éternelle du crypto trader." },
  { id:"DEGEN", name:"$DEGEN", desc:"For the degens only. DYOR? lol.", emoji:"🎰",  risk:"extreme", chain:"SOL",    lore:"Si tu DYOR sur ce token, tu l'as déjà raté." },
  { id:"CHAD",  name:"$CHAD",  desc:"Gigachad energy. 1000x minimum. Trust me.", emoji:"💪", risk:"high",  chain:"ETH",    lore:"Le meme become token. Comme toujours." },
  { id:"SATS",  name:"$SATS",  desc:"1 Satoshi = 0.00000001 BTC. Accumule.", emoji:"🔐",  risk:"medium",  chain:"BTC L2", lore:"La plus petite unité. La plus grande conviction." },
];

const SIGNAL_LABELS = ["Momentum","Volume","Whale Act.","Social Buzz"];
const SIGNAL_ICONS = [
  ["💤","🔥","🔥🔥","🔥🔥🔥"],
  ["📉","📊","📊📊","🚀"],
  ["😴","👀","🐋","🚨"],
  ["💀","📡","📢","🌐"]
];

const RISK_META = {
  low:     { label:"LOW RISK",   cls:"risk-low"  },
  medium:  { label:"MEDIUM",     cls:"risk-med"  },
  high:    { label:"HIGH RISK",  cls:"risk-high" },
  extreme: { label:"⚠ EXTREME",  cls:"risk-high" },
};

const EVENTS = [
  {
    id:"influencer", badge:"ALPHA LEAK 🔥", badgeColor:"#e84830",
    title:"CryptoGuru™ tweete sur $TOKEN",
    body:"\"C'est le prochain 100x. J'ai vendu ma voiture. NFA. DYOR. WAGMI ser 🚀🌙\"",
    sub:"2.4M followers • Pinned Tweet • Trending #1",
    choices:[
      { id:"fomo",    label:"🚀 FOMO IN",      sub:"Ape maintenant",     energy:30, win:0.38, winMult:0.28, loseMult:-0.22 },
      { id:"observe", label:"👀 Observer",      sub:"Watch seulement",    energy:5,  win:0.9,  winMult:0.02, loseMult:-0.01 },
      { id:"analyze", label:"📊 DYOR rapide",   sub:"Due diligence",      energy:15, win:0.62, winMult:0.16, loseMult:-0.05 },
    ]
  },
  {
    id:"whale", badge:"ON-CHAIN ALERT 🐋", badgeColor:"#4488ff",
    title:"Wallet Satoshi_Jr.eth entre en position",
    body:"43/47 trades gagnants • $2.3M déployés sur token inconnu • confirmé on-chain",
    sub:"Wallet actif depuis 2017 • Top 0.1% performers",
    choices:[
      { id:"copy",    label:"📋 Copy trade",    sub:"Follow the whale",   energy:20, win:0.68, winMult:0.22, loseMult:-0.15 },
      { id:"observe", label:"👁️ Observer",       sub:"Trop tard?",         energy:5,  win:0.6,  winMult:0.04, loseMult:-0.02 },
      { id:"counter", label:"🔄 Short (contra)", sub:"Toi vs le whale",    energy:25, win:0.22, winMult:0.5,  loseMult:-0.32 },
    ]
  },
  {
    id:"pizza", badge:"ANNIVERSARY 🍕", badgeColor:"#f0a830",
    title:"🍕 BITCOIN PIZZA DAY",
    body:"22 Mai 2010 — Laszlo Hanyecz paie 10,000 BTC pour 2 pizzas Papa John's. Aujourd'hui vaut $800M.",
    sub:"Le marché célèbre. Les OGs ont les mains de diamant.",
    choices:[
      { id:"hodl",  label:"💎 HODL In Honor",    sub:"Culture > profit",   energy:0,  win:0.85, winMult:0.06, loseMult:0.03 },
      { id:"trade", label:"📈 Trade momentum",    sub:"Market pumpe",       energy:15, win:0.55, winMult:0.18, loseMult:-0.08 },
      { id:"sell",  label:"😅 Sell comme Laszlo", sub:"Historique (bad)",   energy:10, win:0.1,  winMult:0.02, loseMult:-0.14 },
    ]
  },
  {
    id:"rug", badge:"🚨 DANGER", badgeColor:"#e84830",
    title:"Rumeur rug pull — Telegram insider",
    body:"\"Dev wallet moving. LP drain imminent. 30 min max. GET OUT NOW.\" — Vraie alerte ou FUD?",
    sub:"Source anonyme • Non vérifiée • Réputée fiable",
    choices:[
      { id:"exit",   label:"💨 Exit immédiat",   sub:"Better safe than rekt", energy:10, win:0.95, winMult:-0.02, loseMult:-0.02 },
      { id:"ignore", label:"🙈 C'est du FUD",     sub:"Hold position",         energy:0,  win:0.42, winMult:0.01,  loseMult:-0.42 },
      { id:"verify", label:"🔍 Vérify on-chain",  sub:"DYOR réel",             energy:20, win:0.7,  winMult:-0.02, loseMult:-0.09 },
    ]
  },
  {
    id:"crash", badge:"MARKET CRASH 📉", badgeColor:"#e84830",
    title:"BTC chute de -18% en 4 heures",
    body:"$890M liquidés. Fear & Greed: 6/100 — Extreme Fear. \"This is fine 🔥\" — Crypto Twitter.",
    sub:"BitMEX lag • Binance down • 'Probably nothing'",
    choices:[
      { id:"dh",   label:"💎 Diamond hands",     sub:"HODL pas matter what",  energy:5,  win:0.45, winMult:0.14,  loseMult:-0.24 },
      { id:"btd",  label:"💰 Buy the dip",        sub:"Accumulation time",     energy:25, win:0.42, winMult:0.4,   loseMult:-0.3 },
      { id:"exit", label:"🛡️ Reduce exposure",    sub:"Live to trade again",   energy:15, win:0.95, winMult:-0.03, loseMult:-0.03 },
    ]
  },
];

const BOSSES = [
  {
    id:"whale_man", name:"THE WHALE MANIPULATOR", emoji:"🐋",
    color:"#4488ff", quote:'"The market is my playground, ser."',
    lore:"Ce wallet existe depuis 2013. 47 tokens manipulés. Son dernier rug: $4.2M de retail rekt.",
    hp:3,
    phases:[
      { title:"Phase I — Le Fake Pump", desc:"Prix monte artificiellement. FOMO créé. C'est un piège classique.", safe:0 },
      { title:"Phase II — La Distribution", desc:"Le whale distribue. Retail achète. Exit scam en cours.", safe:0 },
      { title:"Phase III — Le Dump Final", desc:"Whale sorti. Prix -60% en 3 minutes. Aftermath brutal.", safe:0 },
    ],
    choices:[
      ["🔴 Ignore le piège","🟡 Small position","🟢 FOMO all-in (danger)"],
      ["💨 Exit avant lui","💎 Croire au projet","📉 Short maintenant"],
      ["🛡️ Stoploss activé","🎲 Hold recovery","⚡ Revenge short"],
    ],
  },
  {
    id:"black", name:"BLACK THURSDAY", emoji:"🌊",
    color:"#e84830", quote:'"Mars 2020. Je me souviens de tout."',
    lore:"Le 12 Mars 2020: BTC $8k → $3.8k en quelques heures. $1B liquidé. BitMEX en maintenance.",
    hp:4,
    phases:[
      { title:"Phase I — Première Vague",   desc:"BTC -15%. Altcoins -25%. Exchanges qui lagent.", safe:0 },
      { title:"Phase II — Cascade Liqui",   desc:"$500M liquidés en 1h. Panique systémique.", safe:1 },
      { title:"Phase III — Capitulation",   desc:"Tout le monde vend. Bottom proche? Ou pas?", safe:1 },
      { title:"Phase IV — Dead Cat Bounce", desc:"+20% recovery. Fake-out ou vrai retournement?", safe:0 },
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
    color:"#f0a830", quote:'"DYOR or get rekt forever, ser."',
    lore:"Pump.fun tourne à plein régime. 500 nouveaux tokens/heure. 80% ruggés avant demain.",
    hp:3,
    phases:[
      { title:"Phase I — Token Overload",   desc:"5 tokens shillés simultanément. Lequel est réel?", safe:0 },
      { title:"Phase II — Fausse Sécurité", desc:'"LP locked, audit ok, team doxxée." (tout est faux)', safe:0 },
      { title:"Phase III — Rug Live",       desc:"Dev drain les LP en direct. -95% en 30 secondes.", safe:0 },
    ],
    choices:[
      ["🔍 DYOR sur tous","🎲 Random pick","🚫 Skip tout"],
      ["🔍 Vérify on-chain","🙏 Trust le narrative","🚨 Red flag = exit"],
      ["⚡ Exit en premier","😱 Panic sell mid-dump","💎 Bag hold (cope)"],
    ],
  },
];

const CARDS = [
  { id:"wagmi",   name:"WAGMI",           emoji:"💎", rarity:"rare",      desc:"+30% gains si 3 wins consécutifs",       color:"#4488ff" },
  { id:"dh",      name:"Diamond Hands",   emoji:"🙌", rarity:"uncommon",  desc:"-50% pertes sur rug / crash",            color:"#68c830" },
  { id:"sniper",  name:"Sniper Entry",    emoji:"⚡", rarity:"rare",      desc:"+40% gain sur early entry réussi",       color:"#f0a830" },
  { id:"fud",     name:"FUD Resistant",   emoji:"🛡️", rarity:"uncommon",  desc:"Ignore 1 événement négatif (auto)",      color:"#68c830" },
  { id:"whalef",  name:"Whale Follower",  emoji:"🐋", rarity:"rare",      desc:"+50% si copie whale réussit",            color:"#4488ff" },
  { id:"pizza",   name:"Pizza Millionaire",emoji:"🍕",rarity:"legendary", desc:"×2 sur prochain gain",                   color:"#f0c830" },
  { id:"satoshi", name:"Satoshi's Gift",  emoji:"₿",  rarity:"legendary", desc:"Résurrection à 500$ si mort",            color:"#f0c830" },
  { id:"gm",      name:"GM Energy",       emoji:"🌅", rarity:"common",    desc:"+20 énergie bonus par round",            color:"#a07040" },
  { id:"dyor",    name:"DYOR Master",     emoji:"🔍", rarity:"uncommon",  desc:"Scanner coûte 50% moins d'énergie",      color:"#68c830" },
  { id:"paper",   name:"Paper Hands",     emoji:"📄", rarity:"common",    desc:"+10% gain mais exit toujours tôt",       color:"#a07040" },
  { id:"alpha",   name:"Alpha Insider",   emoji:"🧠", rarity:"rare",      desc:"Aperçu du résultat avant de décider",    color:"#4488ff" },
  { id:"ngmic",   name:"NGMI Reversal",   emoji:"💀", rarity:"rare",      desc:"Grosses pertes → petites pertes (×0.55)",color:"#e84830" },
  { id:"laser",   name:"Laser Eyes",      emoji:"🔴", rarity:"uncommon",  desc:"+15% sur chaque trade gagnant",          color:"#f0a830" },
  { id:"giga",    name:"Gigachad",        emoji:"💪", rarity:"legendary", desc:"Tous les gains ×1.5 ce run",             color:"#f0c830" },
];

const RARITY_STYLES = {
  common:    { cls:"card-common",    label:"COMMON",    emoji:"●" },
  uncommon:  { cls:"card-uncommon",  label:"UNCOMMON",  emoji:"◆" },
  rare:      { cls:"card-rare",      label:"RARE",      emoji:"★" },
  legendary: { cls:"card-legendary", label:"LÉGENDAIRE",emoji:"★" },
};

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
  const hasDH     = cards.some(c=>c.id==="dh");
  const hasSniper = cards.some(c=>c.id==="sniper");
  const hasWAGMI  = cards.some(c=>c.id==="wagmi") && streak >= 2;
  const hasPizza  = cards.some(c=>c.id==="pizza");
  const hasLaser  = cards.some(c=>c.id==="laser");
  const hasGiga   = cards.some(c=>c.id==="giga");
  const hasNGMI   = cards.some(c=>c.id==="ngmic");
  const hasDYOR   = cards.some(c=>c.id==="dyor");
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
      r.msg = "✅ CONFIRMED ENTRY"; r.sub = `+${(r.profit*100).toFixed(0)}% — Safe play. WAGMI.`;
      r.quality = "A"; r.xp = 38;
    }
  } else if (action === "ignore") {
    r.energyCost = 5;
    if (rng < 0.26) {
      r.profit = 0; r.win = false;
      r.msg = "😤 MISSED 10x"; r.sub = `Token +${Math.floor(rng*800+400)}% sans toi. Cope.`;
      r.quality = "D"; r.xp = 8;
    } else {
      r.profit = 0.004; r.win = true;
      r.msg = "🛡️ PERFECT SKIP"; r.sub = "Token ruggé 18min après. Capital préservé.";
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
    Math.max(0,profit)*55 + wins*85 + cards.length*70 + (bossKilled?600:0) + history.length*45
  );
  return { profit: profit.toFixed(1), discipline: disc, score, wins, total: history.length };
}

/* ═══════════════════════════════════════════════════════
   SESSION SYSTEM
═══════════════════════════════════════════════════════ */
function generateSessionId() {
  return 'session_' + Math.random().toString(36).substr(2,9) + '_' + Date.now().toString(36);
}

/* ═══════════════════════════════════════════════════════
   CSS GLOBAL
═══════════════════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@700;800;900&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  body { background:#e8c98a; }

  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:#d4a96a; }
  ::-webkit-scrollbar-thumb { background:#a06820; border-radius:2px; }

  @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes bounce   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
  @keyframes blink    { 0%,49%{opacity:1} 50%,100%{opacity:0} }
  @keyframes shake    { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
  @keyframes popIn    { 0%{transform:scale(0.7);opacity:0} 70%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
  @keyframes glowPulse { 0%,100%{box-shadow:inset 0 3px 0 #98e860,inset 0 -3px 0 #409820,0 5px 0 #286008,0 0 12px rgba(104,200,48,0.4)} 50%{box-shadow:inset 0 3px 0 #98e860,inset 0 -3px 0 #409820,0 5px 0 #286008,0 0 24px rgba(104,200,48,0.8)} }
  @keyframes resultSlide { from{transform:translateY(-10px);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes countUp  { from{transform:scale(0.8);opacity:0} to{transform:scale(1);opacity:1} }

  .panel {
    background:#f5d98a;
    border-radius:20px;
    border:5px solid #a0622a;
    box-shadow:inset 0 3px 0 #ffe8a0,inset 0 -4px 0 #c8842a,0 6px 0 #7a4a18,0 8px 12px rgba(0,0,0,0.3);
    padding:18px;
    margin-bottom:14px;
    position:relative;
    overflow:hidden;
  }
  .panel::before {
    content:'';position:absolute;inset:4px;border-radius:14px;
    border:2px dashed rgba(160,98,42,0.25);pointer-events:none;
  }

  .panel-title {
    font-family:'Fredoka One',cursive;font-size:18px;color:#7a4a18;
    text-align:center;margin-bottom:14px;text-shadow:0 2px 0 rgba(255,255,255,0.5);letter-spacing:1px;
  }

  .main-title {
    font-family:'Fredoka One',cursive;font-size:44px;color:#7a3a08;
    text-align:center;line-height:1;text-shadow:0 3px 0 #f5d98a,0 6px 0 rgba(0,0,0,0.15);margin-bottom:4px;
  }
  .main-title span { color:#c8450a; }
  .main-sub { font-size:13px;color:#a07040;text-align:center;font-weight:800;letter-spacing:1px;margin-bottom:20px; }

  .btn {
    background:#f0a830;border-radius:14px;border:4px solid #a06820;
    box-shadow:inset 0 3px 0 #ffd060,inset 0 -3px 0 #c07820,0 5px 0 #7a4a10,0 6px 8px rgba(0,0,0,0.25);
    padding:13px 18px;font-family:'Fredoka One',cursive;font-size:17px;color:#5a3008;
    text-align:center;cursor:pointer;display:block;width:100%;margin-bottom:10px;
    text-shadow:0 1px 0 rgba(255,255,255,0.4);transition:top 0.08s,box-shadow 0.08s;
    position:relative;top:0;border:none;outline:none;
  }
  .btn:active { top:3px; box-shadow:inset 0 2px 0 #ffd060,inset 0 -2px 0 #c07820,0 2px 0 #7a4a10; }
  .btn:hover  { filter:brightness(1.05); }
  .btn.green  {
    background:#68c830;border:4px solid #3a8010;color:#1a4008;
    box-shadow:inset 0 3px 0 #98e860,inset 0 -3px 0 #409820,0 5px 0 #286008,0 6px 8px rgba(0,0,0,0.25);
  }
  .btn.green-pulse { animation:glowPulse 2s infinite; }
  .btn.red {
    background:#e84830;border:4px solid #901808;color:#fff;
    box-shadow:inset 0 3px 0 #ff7860,inset 0 -3px 0 #b02818,0 5px 0 #701008,0 6px 8px rgba(0,0,0,0.25);
  }
  .btn.small { font-size:14px; padding:9px 14px; }
  .btn-row  { display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:0; }
  .btn-row .btn { margin-bottom:0; }

  .stats-row { display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px; }
  .stat-box {
    background:#e8a828;border-radius:14px;border:4px solid #a06820;
    box-shadow:inset 0 2px 0 #ffd060,inset 0 -2px 0 #c07820,0 4px 0 #7a4a10;
    padding:12px 8px;text-align:center;
  }
  .stat-icon { font-size:22px;display:block;margin-bottom:2px; }
  .stat-val  { font-family:'Fredoka One',cursive;font-size:26px;color:#5a3008;line-height:1; }
  .stat-label{ font-size:11px;color:#7a5028;font-weight:800;margin-top:2px; }

  .rounds-wrap { margin-bottom:14px; }
  .rounds { display:flex;gap:5px;justify-content:center;flex-wrap:wrap; }
  .rd {
    width:34px;height:34px;border-radius:50%;background:#d4a060;
    border:3px solid #a06820;box-shadow:inset 0 2px 0 #e8b870,0 3px 0 #7a4a10;
    font-family:'Fredoka One',cursive;font-size:13px;color:#7a5028;
    display:flex;align-items:center;justify-content:center;
  }
  .rd.done { background:#f0a830;color:#5a3008; }
  .rd.now  { background:#68c830;border-color:#3a8010;color:#1a4008;box-shadow:inset 0 2px 0 #98e860,0 3px 0 #286008; }
  .rd.boss { background:#e84830;border-color:#901808;color:#fff;box-shadow:inset 0 2px 0 #ff7860,0 3px 0 #701008; }

  .porto-val { font-family:'Fredoka One',cursive;font-size:48px;color:#5a3008;text-align:center;line-height:1;text-shadow:0 3px 0 rgba(255,255,255,0.4); }
  .porto-profit { font-family:'Fredoka One',cursive;font-size:20px;text-align:center;text-shadow:0 2px 0 rgba(255,255,255,0.4); }

  .bar-wrap { margin-top:10px; }
  .bar-label { font-family:'Fredoka One',cursive;font-size:13px;color:#7a4a18;display:flex;justify-content:space-between;margin-bottom:5px; }
  .bar-track { height:18px;background:#c88828;border-radius:10px;border:3px solid #a06820;box-shadow:inset 0 2px 4px rgba(0,0,0,0.3);overflow:hidden; }
  .bar-fill  { height:100%;border-radius:8px;transition:width 0.6s; }
  .bar-gold  { background:linear-gradient(90deg,#f0a830,#ffe060); }
  .bar-green { background:linear-gradient(90deg,#68c830,#a0f060); }
  .bar-red   { background:linear-gradient(90deg,#e84830,#ff8060); }

  .token-top   { display:flex;justify-content:space-between;align-items:center;margin-bottom:10px; }
  .token-name  { font-family:'Fredoka One',cursive;font-size:36px;color:#5a3008;text-shadow:0 3px 0 rgba(255,255,255,0.5); }
  .token-emoji { font-size:44px;animation:bounce 2s infinite; }
  .token-chain { font-size:13px;color:#a07040;font-weight:800; }
  .token-lore  { font-size:13px;color:#7a5030;line-height:1.6;font-weight:700;margin-bottom:12px;background:rgba(160,98,42,0.12);border-radius:10px;padding:10px 12px; }

  .risk-badge { display:inline-block;font-family:'Fredoka One',cursive;font-size:13px;padding:4px 14px;border-radius:20px;margin-bottom:10px; }
  .risk-low  { background:#68c830;color:#1a4008;border:3px solid #3a8010;box-shadow:0 3px 0 #286008; }
  .risk-med  { background:#f0a830;color:#5a3008;border:3px solid #a06820;box-shadow:0 3px 0 #7a4a10; }
  .risk-high { background:#e84830;color:#fff;border:3px solid #901808;box-shadow:0 3px 0 #701008; }

  .sigs { display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px; }
  .sig {
    background:#e8a828;border-radius:12px;border:3px solid #a06820;
    box-shadow:inset 0 2px 0 #ffd060,0 3px 0 #7a4a10;padding:10px 4px;text-align:center;
  }
  .sig-l { font-size:9px;color:#7a5028;font-weight:800;margin-bottom:5px; }
  .sig-v { font-size:18px; }

  .actions { display:grid;grid-template-columns:1fr 1fr;gap:10px; }
  .action {
    background:#f0a830;border-radius:16px;border:4px solid #a06820;
    box-shadow:inset 0 3px 0 #ffd060,inset 0 -3px 0 #c07820,0 5px 0 #7a4a10,0 6px 10px rgba(0,0,0,0.2);
    padding:16px 10px;cursor:pointer;position:relative;top:0;
    transition:top 0.08s,box-shadow 0.08s,filter 0.1s;text-align:left;outline:none;border:none;
  }
  .action:active { top:3px;box-shadow:inset 0 2px 0 #ffd060,0 2px 0 #7a4a10; }
  .action:hover  { filter:brightness(1.05); }
  .action.hot {
    background:#68c830;border:4px solid #3a8010;
    box-shadow:inset 0 3px 0 #98e860,inset 0 -3px 0 #409820,0 5px 0 #286008,0 6px 10px rgba(0,0,0,0.2);
  }
  .action.disabled { opacity:0.45;cursor:not-allowed; }
  .action-icon { font-size:24px;margin-bottom:5px;display:block; }
  .action-name { font-family:'Fredoka One',cursive;font-size:16px;color:#5a3008;margin-bottom:3px; }
  .action.hot .action-name { color:#1a4008; }
  .action-desc { font-size:11px;color:#7a5028;line-height:1.4;font-weight:700; }
  .action.hot .action-desc { color:#2a5010; }
  .action-cost { font-family:'Fredoka One',cursive;font-size:12px;color:#a06020;margin-top:5px; }
  .action.hot .action-cost { color:#386010; }

  .cards-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:10px; }
  .card-item {
    border-radius:14px;border:4px solid #a06820;
    box-shadow:inset 0 2px 0 #ffd060,0 4px 0 #7a4a10;
    padding:12px 6px;text-align:center;background:#f5d98a;
    animation:popIn 0.35s ease;
  }
  .card-common   { background:#f5d98a;border-color:#a06820; }
  .card-uncommon { background:#c8f0c8;border-color:#3a9040;box-shadow:inset 0 2px 0 #e0ffe0,0 4px 0 #1a6020; }
  .card-rare     { background:#c8e8ff;border-color:#4080c0;box-shadow:inset 0 2px 0 #e0f4ff,0 4px 0 #205080; }
  .card-legendary{ background:#ffe880;border-color:#c8922a;box-shadow:inset 0 2px 0 #fff4b0,0 4px 0 #905010,0 0 14px rgba(255,210,0,0.5); }
  .card-icon  { font-size:24px;margin-bottom:5px;display:block; }
  .card-name  { font-family:'Fredoka One',cursive;font-size:12px;color:#5a3008;margin-bottom:3px; }
  .card-rar   { font-size:10px;font-weight:800; }
  .rar-leg { color:#a06000; }
  .rar-rar { color:#205080; }
  .rar-unc { color:#1a6020; }
  .rar-com { color:#7a5028; }

  .outcome-panel {
    border-radius:16px;padding:16px;margin-bottom:12px;text-align:center;
    animation:resultSlide 0.35s ease;
  }
  .outcome-win  { background:#d8f5b8;border:4px solid #3a8010;box-shadow:inset 0 2px 0 #ecffe0,0 5px 0 #1a5008; }
  .outcome-loss { background:#ffd8c8;border:4px solid #901808;box-shadow:inset 0 2px 0 #ffe8e0,0 5px 0 #601008; }
  .outcome-title { font-family:'Fredoka One',cursive;font-size:22px;margin-bottom:6px; }
  .outcome-sub   { font-size:13px;color:#5a3008;font-weight:700;line-height:1.5; }
  .outcome-info  { background:rgba(64,128,192,0.15);border-radius:8px;padding:8px 10px;margin-top:8px;font-size:12px;color:#205080;font-weight:700;border:2px solid rgba(64,128,192,0.3); }
  .outcome-meta  { display:flex;justify-content:center;gap:16px;margin-top:8px;font-size:12px;color:#7a5028;font-weight:700; }

  .streak-banner {
    background:#fff4b0;border:3px solid #c8922a;border-radius:12px;
    padding:8px 12px;text-align:center;margin-bottom:10px;
    box-shadow:0 3px 0 #905010;font-family:'Fredoka One',cursive;font-size:14px;color:#7a4a00;
    animation:fadeUp 0.3s ease;
  }

  .lb-row { display:flex;align-items:center;padding:9px 0;border-bottom:2px dashed rgba(160,98,42,0.3);gap:10px; }
  .lb-row:last-child { border-bottom:none; }
  .lb-rank  { font-family:'Fredoka One',cursive;font-size:17px;color:#a07040;width:26px; }
  .lb-name  { font-family:'Fredoka One',cursive;font-size:16px;color:#5a3008;flex:1; }
  .lb-score { font-family:'Fredoka One',cursive;font-size:15px;color:#a07040; }
  .lb-profit{ font-family:'Fredoka One',cursive;font-size:14px;color:#2a8010;margin-left:5px; }
  .lb-me    { background:rgba(104,200,48,.15);border-radius:10px;padding:9px 10px;margin:4px -10px 0;border:2px solid rgba(58,128,16,.3); }
  .lb-me .lb-name { color:#2a8010; }

  .badge-label {
    display:inline-block;font-family:'Fredoka One',cursive;font-size:12px;
    padding:4px 12px;border-radius:20px;margin-bottom:10px;color:#fff;
    box-shadow:0 3px 0 rgba(0,0,0,0.2);animation:blink 2s infinite;
  }

  .event-choice {
    background:#f0a830;border-radius:14px;border:4px solid #a06820;
    box-shadow:inset 0 3px 0 #ffd060,inset 0 -3px 0 #c07820,0 4px 0 #7a4a10;
    padding:14px;cursor:pointer;position:relative;top:0;
    transition:top 0.08s,box-shadow 0.08s,filter 0.1s;
    display:flex;justify-content:space-between;align-items:center;outline:none;border:none;width:100%;text-align:left;
    margin-bottom:10px;
  }
  .event-choice:active { top:3px;box-shadow:inset 0 2px 0 #ffd060,0 2px 0 #7a4a10; }
  .event-choice:hover  { filter:brightness(1.05); }
  .ec-label { font-family:'Fredoka One',cursive;font-size:16px;color:#5a3008;margin-bottom:3px; }
  .ec-sub   { font-size:12px;color:#7a5028;font-weight:700; }
  .ec-cost  { font-family:'Fredoka One',cursive;font-size:13px;text-align:right; }

  .boss-hp-bar { height:20px;background:#c88828;border-radius:10px;border:3px solid #901808;box-shadow:inset 0 2px 4px rgba(0,0,0,0.4);overflow:hidden; }
  .boss-hp-fill { height:100%;border-radius:8px;background:linear-gradient(90deg,#e84830,#ff8060);transition:width 0.7s;box-shadow:0 0 8px rgba(232,72,48,0.6); }
  .boss-choice {
    background:#f0a830;border-radius:14px;border:4px solid #a06820;
    box-shadow:inset 0 3px 0 #ffd060,inset 0 -3px 0 #c07820,0 4px 0 #7a4a10;
    padding:14px 16px;cursor:pointer;position:relative;top:0;
    font-family:'Fredoka One',cursive;font-size:16px;color:#5a3008;
    transition:top 0.08s,box-shadow 0.08s;margin-bottom:8px;width:100%;text-align:left;outline:none;border:none;
  }
  .boss-choice:active { top:3px;box-shadow:inset 0 2px 0 #ffd060,0 2px 0 #7a4a10; }
  .boss-choice:hover  { filter:brightness(1.05); }

  .sep { height:6px;background:url("data:image/svg+xml,%3Csvg width='20' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='3' cy='3' r='2' fill='%23a06820' opacity='.4'/%3E%3C/svg%3E") repeat-x;margin:12px 0; }

  .session-tag {
    display:inline-block;background:rgba(90,48,8,0.12);border:2px solid rgba(160,98,42,0.3);
    border-radius:20px;padding:4px 12px;font-size:11px;color:#7a5028;font-weight:800;
  }

  .input-field {
    width:100%;background:#ffe8a0;border:4px solid #a06820;border-radius:12px;
    box-shadow:inset 0 3px 6px rgba(0,0,0,0.15);padding:12px 14px;
    font-family:'Fredoka One',cursive;font-size:16px;color:#5a3008;outline:none;
    margin-bottom:10px;
  }
  .input-field:focus { border-color:#68c830;box-shadow:inset 0 3px 6px rgba(0,0,0,0.15),0 0 0 2px rgba(104,200,48,0.3); }

  .end-stat-row {
    display:flex;justify-content:space-between;align-items:center;
    padding:9px 0;border-bottom:2px dashed rgba(160,98,42,0.3);
  }
  .end-stat-row:last-child { border-bottom:none; }
  .end-stat-label { font-size:14px;color:#7a5028;font-weight:800; }
  .end-stat-val   { font-family:'Fredoka One',cursive;font-size:18px;color:#5a3008; }

  .cards-active-row { display:flex;gap:6px;flex-wrap:wrap; }
  .card-mini {
    display:flex;align-items:center;gap:5px;padding:5px 10px;border-radius:10px;
    border:3px solid #a06820;font-size:12px;font-weight:800;background:#f5d98a;
  }
  .card-mini.rare-mini     { background:#c8e8ff;border-color:#4080c0; }
  .card-mini.uncommon-mini { background:#c8f0c8;border-color:#3a9040; }
  .card-mini.legendary-mini{ background:#ffe880;border-color:#c8922a; }

  .processing-dots::after { content:'...'; animation:blink 1s infinite; }

  .trophy-emoji { font-size:52px;text-align:center;display:block;animation:bounce 1.5s infinite; }
  .hero-title { font-family:'Fredoka One',cursive;font-size:32px;text-align:center;text-shadow:0 3px 0 rgba(255,255,255,0.4); }

  .info-bubble {
    background:rgba(90,48,8,0.08);border:2px dashed rgba(160,98,42,0.3);
    border-radius:12px;padding:10px 14px;font-size:12px;color:#7a5028;font-weight:700;
    line-height:1.6;text-align:center;margin-top:8px;
  }
`;

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
export default function CryptoRoguelike() {
  const [screen,       setScreen]       = useState("loading");
  const [sessionId,    setSessionId]    = useState("");
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
  const [processing,   setProcessing]   = useState(false);
  const [shaking,      setShaking]      = useState(false);
  const [sessionInput, setSessionInput] = useState("");
  const [sessionMode,  setSessionMode]  = useState("home"); // home | new | restore

  const tokenPool  = useRef([]);
  const eventQueue = useRef([]);
  const tokenIndex = useRef(0);

  /* ── Inject CSS ── */
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
    initLoad();
    return () => { try { document.head.removeChild(style); } catch(e){} };
  }, []);

  const initLoad = async () => {
    try {
      // Load session id
      const sRes = await window.storage.get("crg_session_id");
      let sid = sRes ? sRes.value : null;
      if (!sid) {
        sid = generateSessionId();
        await window.storage.set("crg_session_id", sid);
      }
      setSessionId(sid);
      // Load player data by session
      const nameRes = await window.storage.get(`crg_name_${sid}`);
      if (nameRes) setPlayerName(nameRes.value);
      const metaRes = await window.storage.get(`crg_meta_${sid}`);
      if (metaRes) setMeta(JSON.parse(metaRes.value));
      // Load shared leaderboard
      const lbRes = await window.storage.get("crg_lb_v3", true);
      if (lbRes) setLeaderboard(JSON.parse(lbRes.value));
    } catch(e) {}
    setScreen("home");
  };

  const doShake = () => { setShaking(true); setTimeout(()=>setShaking(false), 500); };

  /* ── NEW RUN ── */
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

  const advanceToken = useCallback(() => {
    tokenIndex.current++;
    const t = tokenPool.current[tokenIndex.current % tokenPool.current.length];
    setToken(t); setSignals(genSignals(t));
  }, []);

  /* ── AFTER ROUND ── */
  const afterRound = useCallback((completedRound, newPort, newHistory, currentCards) => {
    if (newPort < 8) {
      if (currentCards.some(c=>c.id==="satoshi")) {
        doShake();
        setPortfolio(500);
        setCards(prev=>prev.filter(c=>c.id!=="satoshi"));
        setRound(completedRound + 1);
        advanceToken();
        setScreen("playing");
        return;
      }
      finishRun(newPort, newHistory, false, currentCards);
      return;
    }
    if (completedRound >= 8) {
      const b = BOSSES[Math.floor(Math.random()*BOSSES.length)];
      setBoss(b); setBossPhase(0); setBossHp(b.hp); setBossWin(false);
      setScreen("boss");
      return;
    }
    const nr = completedRound + 1;
    setRound(nr);
    if (completedRound === 2 || completedRound === 5) {
      setCardChoices(getRandomCards(3, currentCards));
      setScreen("card_reward");
      return;
    }
    if (completedRound % 2 === 0 && Math.random() < 0.55 && eventQueue.current.length > 0) {
      setEvent(eventQueue.current.shift());
      setScreen("event");
      return;
    }
    advanceToken();
    setScreen("playing");
  }, [advanceToken]);

  /* ── TRADE ACTION ── */
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
    setOutcome({ ...r, delta, newPort });

    if (!r.win) doShake();

    setTimeout(() => {
      setOutcome(null);
      setProcessing(false);
      afterRound(round, newPort, newHistory, cards);
    }, 2800);
  }, [processing, outcome, token, cards, streak, portfolio, round, history, afterRound]);

  /* ── EVENT ── */
  const handleEvent = useCallback((choice) => {
    const r = resolveEvent(choice);
    const newPort = Math.max(0, portfolio * (1 + r.profit));
    setPortfolio(newPort);
    setEnergy(prev => Math.max(0, prev - choice.energy));
    setEvent(null);
    advanceToken();
    setScreen("playing");
  }, [portfolio, advanceToken]);

  /* ── CARD CHOICE ── */
  const handleCardChoice = useCallback((card) => {
    const newCards = [...cards, card];
    setCards(newCards);
    setCardChoices([]);
    advanceToken();
    setScreen("playing");
  }, [cards, advanceToken]);

  /* ── BOSS ── */
  const handleBoss = useCallback((choiceIdx) => {
    const r = resolveBoss(boss, bossPhase, choiceIdx);
    const newPort = Math.max(0, portfolio * (1 + r.profit));
    setPortfolio(newPort);
    if (!r.win) doShake();
    const newHp = bossHp - 1;
    setBossHp(newHp);
    if (newHp <= 0) {
      setBossWin(true);
      setTimeout(() => finishRun(newPort, history, true, cards), 1800);
    } else {
      setBossPhase(prev => prev + 1);
    }
  }, [boss, bossPhase, portfolio, bossHp, history, cards]);

  /* ── FINISH RUN ── */
  const finishRun = useCallback(async (finalPort, hist, bossKilled, currentCards) => {
    const s = calcScore(finalPort, hist, currentCards || cards, bossKilled);
    setRunScore(s);
    setScreen("end");
    const newMeta = { xp: meta.xp + Math.round(s.score/40), runs: meta.runs+1, best: Math.max(meta.best, s.score) };
    setMeta(newMeta);
    try { await window.storage.set(`crg_meta_${sessionId}`, JSON.stringify(newMeta)); } catch(e){}
    const entry = { name:playerName, score:s.score, profit:s.profit, date:new Date().toLocaleDateString("fr-FR"), session:sessionId.slice(0,12) };
    const lb = [...leaderboard];
    const ex = lb.findIndex(e=>e.name===playerName && e.session===entry.session);
    if (ex>=0) { if(s.score>lb[ex].score) lb[ex]=entry; } else lb.push(entry);
    lb.sort((a,b)=>b.score-a.score);
    const top10 = lb.slice(0,10);
    setLeaderboard(top10);
    try { await window.storage.set("crg_lb_v3", JSON.stringify(top10), true); } catch(e){}
  }, [cards, meta, playerName, leaderboard, sessionId]);

  /* ── SAVE NAME ── */
  const saveName = async () => {
    const n = (nameInput.trim() || "ANON").toUpperCase().slice(0,12);
    setPlayerName(n); setNaming(false);
    try { await window.storage.set(`crg_name_${sessionId}`, n); } catch(e){}
  };

  /* ── RESTORE SESSION ── */
  const restoreSession = async () => {
    const sid = sessionInput.trim();
    if (!sid) return;
    try {
      const nameRes = await window.storage.get(`crg_name_${sid}`);
      const metaRes = await window.storage.get(`crg_meta_${sid}`);
      if (nameRes || metaRes) {
        setSessionId(sid);
        await window.storage.set("crg_session_id", sid);
        if (nameRes) setPlayerName(nameRes.value);
        if (metaRes) setMeta(JSON.parse(metaRes.value));
        setSessionMode("home");
        alert("✅ Session restaurée ! Bienvenue de retour.");
      } else {
        alert("❌ Session introuvable. Vérifie ton ID.");
      }
    } catch(e) { alert("Erreur lors de la restauration."); }
  };

  /* ── HELPERS ── */
  const profitColor = (val) => {
    const n = Number(val);
    if (n > 0) return "#2a8010";
    if (n < 0) return "#901808";
    return "#a07040";
  };

  const energyBarClass = energy < 30 ? "bar-red" : energy < 60 ? "bar-gold" : "bar-green";

  const Wrap = ({ children }) => (
    <div style={{
      background:"#e8c98a",
      backgroundImage:"radial-gradient(circle at 20% 20%, #d4a96a 1px, transparent 1px), radial-gradient(circle at 80% 60%, #d4a96a 1px, transparent 1px)",
      backgroundSize:"40px 40px, 60px 60px",
      minHeight:"100vh", fontFamily:"'Nunito',sans-serif",
      animation: shaking ? "shake 0.5s" : "none",
    }}>
      <div style={{maxWidth:440, margin:"0 auto", padding:"16px 14px 60px"}}>
        {children}
      </div>
    </div>
  );

  const Sep = () => <div className="sep" />;

  const RoundTrack = () => (
    <div className="panel rounds-wrap">
      <div className="panel-title" style={{marginBottom:10}}>🗺️ Progression du run</div>
      <div className="rounds">
        {Array.from({length:8},(_,i)=>{
          const r = i+1;
          const cls = r < round ? "rd done" : r === round ? "rd now" : "rd";
          return <div key={r} className={cls}>{r < round ? "★" : r}</div>;
        })}
        <div className="rd boss">☠</div>
      </div>
    </div>
  );

  const PortfolioPanel = () => {
    const pct = (portfolio / 1000) * 100;
    const profit = ((portfolio - 1000)/10).toFixed(1);
    const isPos = Number(profit) >= 0;
    return (
      <div className="panel">
        <div className="panel-title">💰 Portfolio</div>
        <div className="porto-val">${portfolio.toFixed(0)}</div>
        <div className="porto-profit" style={{color: isPos ? "#2a8010" : "#901808"}}>
          {isPos ? "+" : ""}{profit}% ce run {isPos ? "🚀" : "📉"}
        </div>
        <div className="bar-wrap">
          <div className="bar-label"><span>⚡ Énergie</span><span>{energy} / 100</span></div>
          <div className="bar-track"><div className={`bar-fill ${energyBarClass}`} style={{width:`${energy}%`}} /></div>
        </div>
      </div>
    );
  };

  const StatsRow = () => (
    <div className="stats-row">
      <div className="stat-box">
        <span className="stat-icon">🔄</span>
        <div className="stat-val">R{round}</div>
        <div className="stat-label">Round</div>
      </div>
      <div className="stat-box">
        <span className="stat-icon">⭐</span>
        <div className="stat-val" style={{color:"#2a8010"}}>{history.filter(h=>h.win).length}</div>
        <div className="stat-label">Wins</div>
      </div>
      <div className="stat-box">
        <span className="stat-icon">🎴</span>
        <div className="stat-val">{cards.length}</div>
        <div className="stat-label">Cartes</div>
      </div>
    </div>
  );

  /* ═══════════════════
     SCREEN: LOADING
  ═══════════════════ */
  if (screen === "loading") return (
    <Wrap>
      <div style={{textAlign:"center",paddingTop:80}}>
        <div style={{fontSize:52,marginBottom:20}}>🪙</div>
        <div className="panel-title" style={{fontSize:20}}>Chargement<span className="processing-dots" /></div>
      </div>
    </Wrap>
  );

  /* ═══════════════════
     SCREEN: HOME
  ═══════════════════ */
  if (screen === "home") return (
    <Wrap>
      <div className="panel" style={{textAlign:"center",padding:"22px 18px 18px"}}>
        <div className="main-title">🪙 CRYPTO<br/><span>ROGUELIKE</span></div>
        <div className="main-sub">⚡ Survive the market · NFA · DYOR</div>
        <div style={{display:"flex",justifyContent:"center",gap:8,flexWrap:"wrap"}}>
          <span className="session-tag">SESSION: {sessionId.slice(0,14)}...</span>
        </div>
      </div>

      {/* Meta stats */}
      <div className="stats-row">
        {[["🔄","RUNS",meta.runs,"#5a3008"],["🏆","BEST",Number(meta.best).toLocaleString(),"#a06000"],["⚡","XP",meta.xp,"#2a8010"]].map(([icon,label,val,color])=>(
          <div className="stat-box" key={label}>
            <span className="stat-icon">{icon}</span>
            <div className="stat-val" style={{color}}>{val}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="panel">
        <div className="panel-title">🏆 Hall of Legends</div>
        {leaderboard.length === 0 ? (
          <div style={{textAlign:"center",color:"#a07040",fontSize:14,padding:"16px 0",fontWeight:800}}>
            Aucune entrée.<br/>Sois le premier ser 🫵
          </div>
        ) : leaderboard.slice(0,8).map((e,i)=>{
          const isMe = e.name===playerName && (e.session||"").startsWith(sessionId.slice(0,12));
          const medal = i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}`;
          return (
            <div key={i} className={`lb-row${isMe?" lb-me":""}`}>
              <span className="lb-rank">{medal}</span>
              <span className="lb-name">{e.name}{isMe?" ◀":""}</span>
              <span className="lb-score">{Number(e.score).toLocaleString()}</span>
              <span className="lb-profit">{Number(e.profit)>=0?"+":""}{e.profit}%</span>
            </div>
          );
        })}
      </div>

      {/* Name */}
      <div className="panel">
        <div className="panel-title">👤 Ton identité</div>
        {!naming ? (
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#e8a828",borderRadius:12,padding:"10px 14px",border:"3px solid #a06820",boxShadow:"inset 0 2px 0 #ffd060,0 3px 0 #7a4a10"}}>
            <span style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:"#5a3008"}}>🧑‍💻 {playerName}</span>
            <button className="btn small" onClick={()=>{setNameInput(playerName);setNaming(true);}} style={{width:"auto",marginBottom:0}}>Modifier</button>
          </div>
        ) : (
          <div>
            <input className="input-field" value={nameInput} onChange={e=>setNameInput(e.target.value)} maxLength={12}
              onKeyDown={e=>e.key==="Enter"&&saveName()} autoFocus placeholder="TON NOM (max 12)" />
            <div className="btn-row">
              <button className="btn green" onClick={saveName} style={{marginBottom:0}}>✅ Valider</button>
              <button className="btn" onClick={()=>setNaming(false)} style={{marginBottom:0}}>✕ Annuler</button>
            </div>
          </div>
        )}
      </div>

      {/* Session manager */}
      <div className="panel">
        <div className="panel-title">🔐 Gestion de session</div>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:12,color:"#7a5028",fontWeight:800,marginBottom:6}}>
            Ton ID de session (sauvegarde pour retrouver ta progression) :
          </div>
          <div style={{background:"#ffe8a0",border:"3px solid #a06820",borderRadius:10,padding:"10px 14px",fontFamily:"monospace",fontSize:12,color:"#5a3008",wordBreak:"break-all",boxShadow:"inset 0 2px 4px rgba(0,0,0,0.1)"}}>
            {sessionId}
          </div>
        </div>
        <div className="sep" />
        <div style={{fontSize:12,color:"#7a5028",fontWeight:800,marginBottom:8}}>
          Restaurer une session existante :
        </div>
        <input className="input-field" value={sessionInput} onChange={e=>setSessionInput(e.target.value)}
          placeholder="Colle ton ID de session ici" />
        <button className="btn" onClick={restoreSession} style={{background:"#a0c8f0",borderColor:"#4080c0",color:"#205080",boxShadow:"inset 0 3px 0 #d0e8ff,inset 0 -3px 0 #5090d0,0 5px 0 #204870"}}>
          🔄 Restaurer la session
        </button>
      </div>

      <Sep />

      <button className="btn green green-pulse" onClick={newRun} style={{fontSize:22,padding:"18px",marginBottom:12}}>
        ▶ NEW RUN !
      </button>

      <div className="info-bubble">
        ₿ • 🍕 • 💎 • WAGMI • HODL • GM • 🐋<br/>
        Inspiré par Satoshi's vision & Balatro's addiction<br/>
        <span style={{opacity:0.7}}>This is not financial advice, ser. DYOR. NFA.</span>
      </div>
    </Wrap>
  );

  /* ═══════════════════
     SCREEN: PLAYING
  ═══════════════════ */
  if (screen === "playing" && token) {
    const risk = RISK_META[token.risk];
    return (
      <Wrap>
        <StatsRow />
        <RoundTrack />
        <PortfolioPanel />

        {streak >= 2 && (
          <div className="streak-banner">
            🔥 STREAK ×{streak}{streak>=3 ? " — 💎 WAGMI BONUS +30% ACTIF" : ""}
          </div>
        )}

        <Sep />

        {/* Token */}
        <div className="panel" style={{animation:"fadeIn 0.4s"}}>
          <div className="panel-title">🎯 Token actif</div>
          <div className="token-top">
            <div>
              <div className="token-name">{token.name}</div>
              <div className="token-chain">{token.chain} · {token.desc.slice(0,30)}...</div>
            </div>
            <div className="token-emoji">{token.emoji}</div>
          </div>
          <div className="token-lore">"{token.lore}"</div>
          <span className={`risk-badge ${risk.cls}`}>● {risk.label}</span>
          <div className="sigs">
            {SIGNAL_LABELS.map((label,i) => (
              <div className="sig" key={label}>
                <div className="sig-l">{label}</div>
                <div className="sig-v">{SIGNAL_ICONS[i][signals[i]]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Outcome */}
        {outcome && (
          <div className={`outcome-panel ${outcome.win ? "outcome-win" : "outcome-loss"}`}>
            <div className="outcome-title" style={{color: outcome.win ? "#2a8010" : "#901808"}}>
              {outcome.msg}
            </div>
            <div className="outcome-sub">{outcome.sub}</div>
            {outcome.scanInfo && <div className="outcome-info">{outcome.scanInfo}</div>}
            <div className="outcome-meta">
              <span>QUALITÉ: <strong style={{color:{S:"#a06000",A:"#2a8010",B:"#205080",C:"#a06820",D:"#901808"}[outcome.quality]}}>{outcome.quality}</strong></span>
              <span>+{outcome.xp} XP</span>
              <span style={{color: outcome.delta >= 0 ? "#2a8010" : "#901808",animation:"countUp 0.4s"}}>
                {outcome.delta >= 0 ? "+" : ""}{outcome.delta.toFixed(0)}$
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        {!outcome && (
          <div className="panel">
            <div className="panel-title">🕹️ Choisir une action</div>
            <div className="actions">
              {[
                { action:"early",  icon:"⚡", name:"Entry Early",    desc:"Ape avant tout le monde !",        cost:25,  hot:true },
                { action:"wait",   icon:"✅", name:"Wait & Confirm", desc:"Entrée safe. Moins de gains.",      cost:10,  hot:false },
                { action:"ignore", icon:"🚫", name:"Ignorer",        desc:"Skip ce token. Préserve capital.", cost:5,   hot:false },
                { action:"scan",   icon:"🔍", name:"Scan Wallets",   desc:"Info on-chain avant de décider.",  cost:cards.some(c=>c.id==="dyor")?14:30, hot:false },
              ].map(({action,icon,name,desc,cost,hot})=>{
                const disabled = energy < cost || processing;
                return (
                  <button key={action} className={`action${hot?" hot":""}${disabled?" disabled":""}`}
                    onClick={()=>!disabled&&handleAction(action)} disabled={disabled}>
                    <span className="action-icon">{icon}</span>
                    <div className="action-name">{name}</div>
                    <div className="action-desc">{desc}</div>
                    <div className="action-cost">−{cost} NRG {disabled&&energy<cost?"(insuff.)":""}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {processing && !outcome && (
          <div style={{textAlign:"center",padding:"14px",fontFamily:"'Fredoka One',cursive",fontSize:16,color:"#7a4a18"}}>
            Résolution en cours<span className="processing-dots" />
          </div>
        )}

        {/* Cards */}
        {cards.length > 0 && (
          <div className="panel">
            <div className="panel-title">🎴 Cartes actives [{cards.length}]</div>
            <div className="cards-active-row">
              {cards.map(c => {
                const rs = RARITY_STYLES[c.rarity];
                return (
                  <div key={c.id} className={`card-mini ${c.rarity}-mini`}>
                    <span>{c.emoji}</span>
                    <span style={{color:"#5a3008",fontWeight:800,fontSize:11}}>{c.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="info-bubble">
          {energy < 30 ? "⚠️ LOW ENERGY — Choisir avec soin, ser" : "DYOR • NFA • WAGMI • GM ser • Probably nothing"}
        </div>
      </Wrap>
    );
  }

  /* ═══════════════════
     SCREEN: EVENT
  ═══════════════════ */
  if (screen === "event" && event) return (
    <Wrap>
      <StatsRow />
      <PortfolioPanel />
      <Sep />
      <div className="panel" style={{animation:"fadeIn 0.4s"}}>
        <div className="panel-title">⚡ ÉVÉNEMENT SPÉCIAL</div>
        <div style={{textAlign:"center",marginBottom:12}}>
          <span className="badge-label" style={{background:event.badgeColor}}>{event.badge}</span>
        </div>
        <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:"#5a3008",marginBottom:10,lineHeight:1.2}}>
          {event.title}
        </div>
        <div style={{background:"rgba(90,48,8,0.08)",borderRadius:12,padding:"12px 14px",marginBottom:10,border:"2px dashed rgba(160,98,42,0.3)"}}>
          <div style={{fontSize:14,color:"#7a3a08",fontWeight:800,lineHeight:1.6,marginBottom:6}}>{event.body}</div>
          <div style={{fontSize:12,color:"#a07040",fontWeight:700}}>— {event.sub}</div>
        </div>
        {event.choices.map(c => (
          <button key={c.id} className="event-choice" onClick={()=>handleEvent(c)}>
            <div>
              <div className="ec-label">{c.label}</div>
              <div className="ec-sub">{c.sub}</div>
            </div>
            <div className="ec-cost" style={{color: c.energy > 20 ? "#901808" : c.energy > 0 ? "#a06020" : "#2a8010"}}>
              {c.energy > 0 ? `−${c.energy} NRG` : "FREE ✓"}
            </div>
          </button>
        ))}
      </div>
      <div className="info-bubble">Tes décisions définissent ton run. NFA.</div>
    </Wrap>
  );

  /* ═══════════════════
     SCREEN: CARD REWARD
  ═══════════════════ */
  if (screen === "card_reward") return (
    <Wrap>
      <div className="panel" style={{textAlign:"center",animation:"popIn 0.4s"}}>
        <div style={{fontSize:40,marginBottom:8}}>🎴</div>
        <div className="main-title" style={{fontSize:30}}>CHOISIS TON<br/><span>ARME</span></div>
        <div style={{fontSize:13,color:"#a07040",fontWeight:800,marginTop:8}}>
          Une seule carte, ser. Elle changera ton run.
        </div>
      </div>
      <Sep />
      <div className="cards-grid">
        {cardChoices.map((c,i) => {
          const rs = RARITY_STYLES[c.rarity];
          return (
            <button key={c.id} className={`card-item ${rs.cls}`}
              onClick={()=>handleCardChoice(c)}
              style={{cursor:"pointer",animationDelay:`${i*0.1}s`,border:"none",outline:"none"}}>
              <span className="card-icon">{c.emoji}</span>
              <div className="card-name">{c.name}</div>
              <div className={`card-rar rar-${c.rarity.slice(0,3)}`}>{rs.emoji} {rs.label}</div>
              <div style={{fontSize:10,color:"#7a5028",marginTop:6,fontWeight:700,lineHeight:1.4}}>{c.desc}</div>
            </button>
          );
        })}
      </div>
      <div className="info-bubble">Les cartes durent tout le run. Choisis avec sagesse, ser.</div>
    </Wrap>
  );

  /* ═══════════════════
     SCREEN: BOSS
  ═══════════════════ */
  if (screen === "boss" && boss) {
    const phase = boss.phases[Math.min(bossPhase, boss.phases.length-1)];
    const choices = boss.choices[Math.min(bossPhase, boss.choices.length-1)];
    const hpPct = (bossHp/boss.hp)*100;
    return (
      <Wrap>
        <div className="panel" style={{textAlign:"center",animation:"fadeIn 0.5s",background:"#ffd8c8",borderColor:"#901808"}}>
          <div style={{fontSize:52,marginBottom:8,animation:"bounce 1.5s infinite"}}>{boss.emoji}</div>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:20,color:"#901808",letterSpacing:1,marginBottom:4}}>
            {boss.name}
          </div>
          <div style={{fontSize:13,color:"#a07040",fontStyle:"italic",fontWeight:700}}>{boss.quote}</div>
        </div>

        {/* HP */}
        <div className="panel">
          <div className="bar-label">
            <span style={{fontFamily:"'Fredoka One',cursive",fontSize:14}}>💀 BOSS HP</span>
            <span style={{fontFamily:"'Fredoka One',cursive",fontSize:14,color:"#e84830"}}>{bossHp} / {boss.hp}</span>
          </div>
          <div className="boss-hp-bar">
            <div className="boss-hp-fill" style={{width:`${hpPct}%`}} />
          </div>
        </div>

        {bossPhase === 0 && (
          <div className="panel" style={{animation:"fadeUp 0.4s"}}>
            <div style={{fontSize:13,color:"#5a3008",fontWeight:700,lineHeight:1.7}}>{boss.lore}</div>
          </div>
        )}

        <div className="panel" style={{background:"#ffd8c8",borderColor:"#901808"}}>
          <div style={{fontFamily:"'Fredoka One',cursive",fontSize:16,color:"#901808",marginBottom:8}}>{phase.title}</div>
          <div style={{fontSize:13,color:"#5a3008",fontWeight:700,lineHeight:1.6}}>{phase.desc}</div>
        </div>

        <PortfolioPanel />

        {!bossWin ? (
          <div className="panel">
            <div className="panel-title">⚔️ Choisis ta stratégie</div>
            {choices.map((choice,i)=>(
              <button key={i} className="boss-choice" onClick={()=>handleBoss(i)}>{choice}</button>
            ))}
          </div>
        ) : (
          <div className="panel" style={{textAlign:"center",background:"#d8f5b8",borderColor:"#3a8010",animation:"popIn 0.5s"}}>
            <div style={{fontSize:44,marginBottom:10}}>🎉</div>
            <div style={{fontFamily:"'Fredoka One',cursive",fontSize:22,color:"#2a8010"}}>BOSS VAINCU — WAGMI !</div>
          </div>
        )}

        <div className="info-bubble">BOSS BATTLE • SURVIVE = WIN • NFA AS ALWAYS</div>
      </Wrap>
    );
  }

  /* ═══════════════════
     SCREEN: END
  ═══════════════════ */
  if (screen === "end" && runScore) {
    const isProfit = Number(runScore.profit) >= 0;
    const rankIdx  = leaderboard.findIndex(e=>e.name===playerName&&(e.session||"").startsWith(sessionId.slice(0,12)));
    const rank     = rankIdx >= 0 ? rankIdx + 1 : null;
    const emoji    = bossWin ? "👑" : isProfit ? "📈" : "💀";
    const title    = bossWin ? "LEGENDARY RUN" : isProfit ? "GG WP SER" : "REKT. NGMI.";

    const discColor = {S:"#a06000",A:"#2a8010",B:"#205080",C:"#a06820",D:"#901808"}[runScore.discipline]||"#a07040";

    return (
      <Wrap>
        <div className="panel" style={{textAlign:"center",animation:"popIn 0.5s",
          background: bossWin ? "#ffe880" : isProfit ? "#d8f5b8" : "#ffd8c8",
          borderColor: bossWin ? "#c8922a" : isProfit ? "#3a8010" : "#901808"}}>
          <span className="trophy-emoji">{emoji}</span>
          <div className="hero-title" style={{color: bossWin ? "#a06000" : isProfit ? "#2a8010" : "#901808", marginTop:8}}>
            {title}
          </div>
          <div style={{fontSize:13,color:"#7a5028",fontWeight:800,marginTop:6}}>
            {bossWin ? "Boss vaincu. Hall of Legends confirmed." : isProfit ? "WAGMI était réel." : "Reviens plus fort. BUIDL harder."}
          </div>
        </div>

        {rank && rank <= 10 && (
          <div style={{background:"#ffe880",border:"4px solid #c8922a",borderRadius:14,boxShadow:"0 4px 0 #905010,0 0 14px rgba(255,210,0,0.4)",padding:"12px",textAlign:"center",marginBottom:14,animation:"fadeUp 0.5s"}}>
            <span style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:"#a06000"}}>
              🏆 RANG #{rank} SUR LE LEADERBOARD !
            </span>
          </div>
        )}

        {/* Score */}
        <div className="panel">
          <div className="panel-title">📊 RUN SUMMARY</div>
          {[
            ["💰 Profit",     `${Number(runScore.profit)>=0?"+":""}${runScore.profit}%`, profitColor(runScore.profit)],
            ["🧠 Discipline", runScore.discipline,   discColor],
            ["✅ Wins",       `${runScore.wins} / ${runScore.total}`, "#5a3008"],
            ["🎴 Cartes",     `${cards.length} cartes`, "#205080"],
            ["🔄 Rounds",     `${runScore.total} actions`, "#5a3008"],
          ].map(([label,val,color])=>(
            <div className="end-stat-row" key={label}>
              <span className="end-stat-label">{label}</span>
              <span className="end-stat-val" style={{color}}>{val}</span>
            </div>
          ))}
          <div style={{height:1,background:"rgba(160,98,42,0.3)",margin:"8px 0"}} />
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:4}}>
            <span style={{fontFamily:"'Fredoka One',cursive",fontSize:18,color:"#5a3008"}}>⭐ SCORE FINAL</span>
            <span style={{fontFamily:"'Fredoka One',cursive",fontSize:28,color:"#a06000"}}>{Number(runScore.score).toLocaleString()}</span>
          </div>
        </div>

        {/* Cards this run */}
        {cards.length > 0 && (
          <div className="panel">
            <div className="panel-title">🎴 Cartes de ce run</div>
            <div className="cards-active-row">
              {cards.map(c => (
                <div key={c.id} className={`card-mini ${c.rarity}-mini`}>
                  <span>{c.emoji}</span>
                  <span style={{color:"#5a3008",fontWeight:800,fontSize:11}}>{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quote */}
        <div className="info-bubble" style={{marginBottom:16}}>
          {isProfit
            ? '"Not your keys, not your coins. Mais ton score, il est bien à toi." — Satoshi (probablement)'
            : '"The best time to DYOR was yesterday. Second best: right now." — Crypto proverbe'}
        </div>

        <button className="btn green" style={{fontSize:22,padding:"18px",marginBottom:10}} onClick={newRun}>
          ⚡ NEW RUN (RAGE MODE)
        </button>
        <button className="btn" onClick={()=>setScreen("home")}>
          ↩ Retour au Lobby
        </button>
      </Wrap>
    );
  }

  return (
    <Wrap>
      <div style={{textAlign:"center",padding:40,color:"#a07040",fontFamily:"'Fredoka One',cursive",fontSize:18}}>
        Chargement<span className="processing-dots" />
      </div>
    </Wrap>
  );
}
