import { useState, useEffect, useRef, useCallback } from "react";

/* ================== DATA ================== */

const TOKENS = [
  { id:"WAGMI", name:"$WAGMI", emoji:"💎", risk:"low", chain:"SOL", lore:"We Are Gonna Make It." },
  { id:"NGMI", name:"$NGMI", emoji:"💀", risk:"extreme", chain:"ETH", lore:"Not gonna make it." },
];

const CARDS = [
  { id:"sniper", name:"Sniper Entry", emoji:"⚡" },
  { id:"dh", name:"Diamond Hands", emoji:"🙌" },
];

function genSignals() {
  return [Math.floor(Math.random()*4),Math.floor(Math.random()*4)];
}

function resolve(action) {
  const rng = Math.random();
  if (action==="early") return {profit:rng>0.5?0.3:-0.2,win:rng>0.5};
  if (action==="wait") return {profit:rng>0.3?0.15:-0.05,win:rng>0.3};
  if (action==="ignore") return {profit:0,win:true};
  if (action==="scan") return {profit:0,win:true};
}

/* ================== APP ================== */

export default function App() {

  const [screen,setScreen]=useState("home");
  const [portfolio,setPortfolio]=useState(1000);
  const [energy,setEnergy]=useState(100);
  const [token,setToken]=useState(null);
  const [cards,setCards]=useState([]);

  const startRun=()=>{
    setPortfolio(1000);
    setEnergy(100);
    setToken(TOKENS[Math.floor(Math.random()*TOKENS.length)]);
    setScreen("game");
  };

  const action=(type)=>{
    const r=resolve(type);
    setPortfolio(p=>Math.max(0,p*(1+r.profit)));
    setEnergy(e=>Math.max(0,e-20));
    setToken(TOKENS[Math.floor(Math.random()*TOKENS.length)]);
  };

  /* ================== UI ================== */

  const Panel=({children})=>(
    <div style={{
      background:"#f5d98a",
      borderRadius:20,
      border:"5px solid #a0622a",
      padding:16,
      marginBottom:14
    }}>{children}</div>
  );

  const Btn=({children,onClick,color})=>(
    <button onClick={onClick} style={{
      background:color||"#f0a830",
      borderRadius:14,
      border:"4px solid #a06820",
      padding:12,
      fontWeight:"bold",
      cursor:"pointer"
    }}>{children}</button>
  );

  /* ================== HOME ================== */

  if(screen==="home") return (
    <div style={wrap}>

      <Panel>
        <div style={title}>🪙 CRYPTO ROGUELIKE</div>
        <div style={{textAlign:"center"}}>Survive the market</div>
      </Panel>

      <Btn onClick={startRun} color="#68c830">▶ START</Btn>

    </div>
  );

  /* ================== GAME ================== */

  if(screen==="game" && token) return (
    <div style={wrap}>

      {/* PORTFOLIO */}
      <Panel>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:40,fontWeight:900}}>${portfolio.toFixed(0)}</div>
          <div>⚡ {energy}/100</div>
        </div>
      </Panel>

      {/* TOKEN */}
      <Panel>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:24,fontWeight:900}}>{token.name}</div>
            <div>{token.chain}</div>
          </div>
          <div style={{fontSize:40}}>{token.emoji}</div>
        </div>

        <div style={{marginTop:10}}>
          "{token.lore}"
        </div>
      </Panel>

      {/* ACTIONS */}
      <Panel>
        <div style={{textAlign:"center",fontWeight:900}}>Choisir</div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>

          <Btn color="#68c830" onClick={()=>action("early")}>⚡ Early</Btn>
          <Btn onClick={()=>action("wait")}>✅ Wait</Btn>
          <Btn color="#e84830" onClick={()=>action("ignore")}>🚫 Ignore</Btn>
          <Btn onClick={()=>action("scan")}>🔍 Scan</Btn>

        </div>
      </Panel>

    </div>
  );

}

/* ================== STYLE ================== */

const wrap={
  background:"#e8c98a",
  minHeight:"100vh",
  padding:16,
  fontFamily:"Nunito, sans-serif",
  maxWidth:420,
  margin:"0 auto"
};

const title={
  fontSize:32,
  textAlign:"center",
  fontWeight:900
};
