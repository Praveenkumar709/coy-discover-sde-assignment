import React, { useEffect, useRef, useState } from "react";
import { Heart, X, Users, Compass, Home, MapPin, Sparkles, RotateCcw } from "lucide-react";

const API = "http://localhost:5000";
function App() {
  const [tab, setTab] = useState("discover");
  const [feed, setFeed] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [drag, setDrag] = useState({x:0,y:0});
  const start = useRef(null);
  const current = feed[0];

  async function load() {
    setLoading(true);
    try {
      const [f,m] = await Promise.all([fetch(`${API}/feed`), fetch(`${API}/matches`)]);
      if (!f.ok || !m.ok) throw new Error("API unavailable");
      setFeed(await f.json()); setMatches(await m.json());
    } catch { setNotice({type:"error", text:"Could not connect to the server. Start the backend and try again."}); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function swipe(action) {
    if (!current) return;
    const chosen = current;
    setFeed(old => old.slice(1));
    setDrag({x: action === "like" ? 520 : -520, y: 0});
    try {
      const response = await fetch(`${API}/swipe`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({profileId:chosen.id, action})
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Swipe failed");
      if (result.matched) {
        setMatches(old => [result.match, ...old.filter(p => p.id !== result.match.id)]);
        setNotice({type:"match", profile:result.match});
      }
    } catch (e) { setNotice({type:"error", text:e.message}); await load(); }
    setTimeout(() => setDrag({x:0,y:0}), 180);
  }
  function pointerDown(e) { start.current = {x:e.clientX, y:e.clientY}; e.currentTarget.setPointerCapture?.(e.pointerId); }
  function pointerMove(e) {
    if (!start.current) return;
    setDrag({x:e.clientX-start.current.x, y:e.clientY-start.current.y});
  }
  function pointerUp() {
    if (!start.current) return;
    const dx = drag.x; start.current = null;
    if (dx > 100) swipe("like");
    else if (dx < -100) swipe("pass");
    else setDrag({x:0,y:0});
  }
  const rotation = Math.max(-14, Math.min(14, drag.x/22));

  return <div className="app-shell">
    <header className="topbar"><div className="brand"><span className="brand-mark">c</span><span>coy</span></div><div className="top-caption">Make the first move, naturally.</div><button className="avatar">P</button></header>
    <main>
      <section className="welcome"><div><p className="eyebrow">A LITTLE SPARK GOES A LONG WAY</p><h1>Discover your <em>people.</em></h1><p className="subhead">Meet interesting people around you. No pressure, just possibilities.</p></div><div className="sparkle"><Sparkles size={28}/></div></section>
      <nav className="tabs">
        <button className={tab==="home"?"active":""} onClick={()=>setTab("home")}><Home size={17}/> Home</button>
        <button className={tab==="discover"?"active":""} onClick={()=>setTab("discover")}><Compass size={17}/> Discover</button>
        <button className={tab==="matches"?"active":""} onClick={()=>setTab("matches")}><Users size={17}/> Matches <span className="count">{matches.length}</span></button>
      </nav>

      {tab==="home" && <section className="blank-home"><div className="empty-icon"><Heart/></div><h2>Your Coy home</h2><p>Your existing Coy experience would live here.</p></section>}

      {tab==="discover" && <section className="discover-layout">
        <div className="section-heading"><div><h2>Discover</h2><p>One profile at a time. See where it goes.</p></div><span className="remaining">{feed.length} left</span></div>
        {loading ? <div className="loading">Finding your people…</div> : current ? <>
          <div className="card-stage">
            <article className="profile-card" style={{transform:`translate(${drag.x}px, ${drag.y}px) rotate(${rotation}deg)`, transition:start.current?"none":"transform .22s ease", touchAction:"pan-y"}}
              onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp}>
              <img className="profile-photo" src={current.photo} alt={`${current.name}'s profile`} onError={e=>e.currentTarget.src="https://placehold.co/600x800/f5d9d4/633?text=Profile"}/>
              <div className="photo-shade"></div>
              {drag.x>35 && <div className="swipe-stamp like-stamp">LIKE</div>}
              {drag.x< -35 && <div className="swipe-stamp pass-stamp">PASS</div>}
              <div className="profile-info"><div className="profile-title"><h3>{current.name}, {current.age}</h3><span className="verified">✓</span></div>
                <p className="location"><MapPin size={15}/>{current.city} · {current.college}</p><p className="bio">{current.bio}</p>
                <div className="chips">{current.interests.map(x=><span key={x}>{x}</span>)}</div>
              </div>
            </article>
          </div>
          <div className="swipe-actions"><button className="action pass" onClick={()=>swipe("pass")} aria-label="Pass"><X size={27}/></button><span>Pass</span><button className="action like" onClick={()=>swipe("like")} aria-label="Like"><Heart size={25} fill="currentColor"/></button><span>Like</span></div>
          <p className="hint">Tip: drag the card left to pass or right to like</p>
        </> : <div className="empty-state"><div className="empty-icon"><Sparkles/></div><h2>You're all caught up!</h2><p>You've seen every profile for now. Check back later for new people.</p><button className="secondary" onClick={load}><RotateCcw size={16}/> Refresh feed</button></div>}
      </section>}

      {tab==="matches" && <section className="matches-section"><div className="section-heading"><div><h2>Your matches</h2><p>It's mutual. Say hello when you're ready.</p></div><span className="remaining">{matches.length} total</span></div>
        {matches.length ? <div className="match-grid">{matches.map(p=><article className="match-card" key={p.id}><img src={p.photo} alt={p.name}/><div><h3>{p.name}, {p.age}</h3><p><MapPin size={13}/>{p.city}</p><small>{p.interests.slice(0,2).join(" · ")}</small></div><span className="match-heart"><Heart size={17} fill="currentColor"/></span></article>)}</div> : <div className="empty-state"><div className="empty-icon"><Heart/></div><h2>No matches just yet</h2><p>When you and someone else like each other, your match will appear here.</p><button className="secondary" onClick={()=>setTab("discover")}><Compass size={16}/> Keep discovering</button></div>}
      </section>}
    </main>
    <footer>Made with care <span>♥</span> · Coy Discover demo</footer>
    {notice && <div className="modal-backdrop" onClick={()=>setNotice(null)}><div className="modal" onClick={e=>e.stopPropagation()}>
      {notice.type==="match" ? <><div className="match-confetti">💖</div><p className="eyebrow">SOMETHING MUTUAL</p><h2>It's a match!</h2><img className="modal-photo" src={notice.profile.photo} alt={notice.profile.name}/><p>You and <b>{notice.profile.name}</b> liked each other.</p><button className="primary" onClick={()=>{setNotice(null);setTab("matches");}}>See your matches</button></> :
      <><div className="empty-icon"><X/></div><h2>Something went wrong</h2><p>{notice.text}</p><button className="primary" onClick={()=>setNotice(null)}>Okay</button></>}
    </div></div>}
  </div>;
}
export default App;
