// Reit-Aktivitäten: gemeinsame Infrastruktur (Szene, Reiter mit Gangarten,
// Overlay-UI, sanfte Musik, Nebel für Sichtweite UND Stimmung).
// Die vier Spiele liegen in reiten-halle.js und reiten-gelaende.js.
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { buildHorse, makeGradientMap } from "./horse3d.js";
import { buildAvatar } from "./avatar3d.js";
import { startVoltigieren, startHallenreiten } from "./reiten-halle.js";
import { startKoppelreiten, startWaldausritt } from "./reiten-gelaende.js";

export function toon(color, gm){ return new THREE.MeshToonMaterial({ color, gradientMap: gm }); }

export function emojiTexture(emoji, size){
  const c = document.createElement("canvas");
  c.width = c.height = size || 96;
  const ctx = c.getContext("2d");
  ctx.font = Math.round(c.width * 0.72) + "px serif";
  ctx.textAlign = "center";
  ctx.fillText(emoji, c.width / 2, c.height * 0.74);
  return new THREE.CanvasTexture(c);
}

// Gangarten: Geschwindigkeit, Beinschwung, sanftes Wippen
const GAITS = {
  stand:   { v: 0,   freq: 0, amp: 0,    bob: 0 },
  schritt: { v: 1.6, freq: 4, amp: 0.32, bob: 0.025 },
  trab:    { v: 3.0, freq: 7, amp: 0.5,  bob: 0.055 },
  galopp:  { v: 4.6, freq: 9, amp: 0.68, bob: 0.09 }
};

export function buildRider(gm, avatarConfig){
  const root = new THREE.Group();      // vom Spiel bewegt (Position/Drehung/Sprung)
  const bob = new THREE.Group();       // wippt im Takt der Gangart
  root.add(bob);
  const horse = buildHorse(gm);
  bob.add(horse.group);
  let avatar = null;
  if(avatarConfig){
    avatar = buildAvatar(avatarConfig, gm);
    avatar.group.scale.setScalar(0.85);
    avatar.group.position.set(0, 1.52, -0.15); // sitzt auf dem Rücken
    avatar.group.userData.baseY = 1.52;        // Idle-Wippen relativ zum Sitz
    bob.add(avatar.group);
  }
  let gait = "stand", speed = 0, posing = false;
  function setGait(name){ gait = name; }
  function tick(t, dt, camera){
    const g = GAITS[gait];
    speed += (g.v - speed) * Math.min(1, dt * 2.5);
    const moving = speed > 0.15;
    horse.tick(t, dt, camera);
    if(avatar && !posing) avatar.tick(t, dt);
    // Beinschwung (diagonale Paare) nur in Bewegung
    horse.legs.forEach((leg, i)=>{
      const phase = (i === 0 || i === 3) ? 0 : Math.PI;
      leg.rotation.x = moving ? Math.sin(t * g.freq + phase) * g.amp * (speed / (g.v || 1)) : 0;
    });
    bob.position.y = moving ? Math.abs(Math.sin(t * g.freq * 0.5)) * g.bob : 0;
  }
  return {
    root, horse, avatar,
    setGait, tick,
    get speed(){ return speed; },
    set posing(v){ posing = v; }
  };
}

// Sanfte Hintergrund-Musik (pentatonisch, sehr leise); nur wenn Ton an.
export function makeMusic(soundOn){
  let ctx = null, timer = 0, step = 0;
  const notes = [261.6, 293.7, 329.6, 392.0, 440.0, 523.3];
  function playNote(){
    if(!soundOn()) return;
    try{
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if(ctx.state === "suspended") ctx.resume();
      const o = ctx.createOscillator();
      o.type = "triangle";
      step = Math.max(0, Math.min(notes.length - 1, step + (Math.random() < 0.5 ? -1 : 1)));
      o.frequency.value = notes[step];
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.06);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.85);
      o.connect(g); g.connect(ctx.destination);
      o.start(); o.stop(ctx.currentTime + 0.9);
    }catch(e){ /* Musik ist optional */ }
  }
  return {
    start(){ if(!timer) timer = setInterval(playNote, 900); },
    stop(){ clearInterval(timer); timer = 0; }
  };
}

function makeUi(container, storyText, hint){
  const ui = document.createElement("div");
  ui.style.cssText = "position:absolute; inset:0; pointer-events:none; z-index:6;";
  ui.innerHTML = `
    <div data-hint style="position:absolute; top:12px; left:50%; transform:translateX(-50%); background:rgba(10,4,30,.7); color:#fff; padding:8px 18px; border-radius:16px; font-weight:700; font-size:15px; max-width:88%; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${hint}</div>
    <div data-counter style="position:absolute; top:52px; right:14px; background:rgba(10,4,30,.6); color:#ffd76a; padding:6px 14px; border-radius:14px; font-weight:800; font-size:16px;"></div>
    <button data-exit style="position:absolute; bottom:14px; right:14px; pointer-events:auto; background:rgba(255,255,255,.14); color:#fff; border:2px solid rgba(255,255,255,.4); border-radius:16px; padding:10px 20px; font-size:16px; font-weight:700; font-family:inherit; cursor:pointer;">✔️ Fertig</button>
    <div data-intro style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(10,4,30,.55); pointer-events:auto;">
      <div style="background:#241249; border-radius:22px; padding:26px; max-width:420px; text-align:center; color:#fff; margin:16px;">
        <p style="margin:0 0 16px; line-height:1.5;">${storyText}</p>
        <button data-start style="background:linear-gradient(180deg,#ffe9a8,#ffd76a); color:#2a1c4f; border:none; border-radius:18px; padding:14px 30px; font-size:19px; font-weight:800; font-family:inherit; cursor:pointer;">Los geht's! 🐎</button>
      </div>
    </div>
  `;
  container.appendChild(ui);
  return ui;
}

export function initReiten(opts){
  const { container, type, storyText, avatarConfig, soundOn, onBonusStars, onExit } = opts;
  const rect = container.getBoundingClientRect();
  const w = Math.max(rect.width, 200), h = Math.max(rect.height, 200);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(w, h);
  renderer.domElement.style.cssText = "position:absolute; inset:0; width:100%; height:100%; border-radius:22px;";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 60);
  scene.add(new THREE.HemisphereLight(0xbfa7ff, 0x4a3526, 0.95));
  const warm = new THREE.PointLight(0xffc07a, 60, 30, 1.6);
  warm.position.set(0, 6, 0);
  scene.add(warm);

  const gm = makeGradientMap();
  const rider = buildRider(gm, avatarConfig);
  scene.add(rider.root);

  const ui = makeUi(container, storyText, "");
  const hintEl = ui.querySelector("[data-hint]");
  const counterEl = ui.querySelector("[data-counter]");
  const music = makeMusic(soundOn);

  // Kurzlebige Funken
  const sparkTex = emojiTexture("✨", 64);
  const transient = [];
  function spawnSparkles(worldPos, n, big){
    if(transient.length > 30) return;
    for(let i = 0; i < (n || 4); i++){
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: sparkTex, transparent: true }));
      s.position.copy(worldPos);
      s.position.x += (Math.random() - 0.5) * 0.5;
      s.position.y += (Math.random() - 0.5) * 0.3;
      s.position.z += (Math.random() - 0.5) * 0.5;
      const sc = (big ? 0.4 : 0.22) + Math.random() * 0.1;
      s.scale.set(sc, sc, 1);
      s.userData = { life: 1.0, vy: 0.6 + Math.random() * 0.4 };
      scene.add(s);
      transient.push(s);
    }
  }

  let finished = false, exitAt = -1, started = false;
  const gameCtx = {
    THREE, scene, camera, renderer, el: renderer.domElement, container,
    rider, gm, soundOn, spawnSparkles,
    setHint: (text)=>{ hintEl.textContent = text; },
    setCounter: (text)=>{ counterEl.textContent = text; },
    finish: (text, stars)=>{
      if(finished) return;
      finished = true;
      rider.setGait("stand");
      hintEl.textContent = text + "  +" + stars + " ⭐";
      onBonusStars(stars);
      spawnSparkles(rider.root.position.clone().add(new THREE.Vector3(0, 2, 0)), 10, true);
      exitAt = performance.now() / 1000 + 3.2;
    },
    isFinished: ()=> finished
  };

  const game =
    type === "voltigieren" ? startVoltigieren(gameCtx) :
    type === "halle" ? startHallenreiten(gameCtx) :
    type === "koppel" ? startKoppelreiten(gameCtx) :
    startWaldausritt(gameCtx);

  // Ein-Finger-Eingabe: Spiel bekommt Down/Up (Up mit Tap-Info)
  let downTime = 0, downX = 0, downY = 0;
  function onDown(e){
    if(!started || finished) return;
    downTime = performance.now(); downX = e.clientX; downY = e.clientY;
    if(game.onDown) game.onDown(e);
  }
  function onUp(e){
    if(!started || finished) return;
    const wasTap = (performance.now() - downTime) < 300 && Math.hypot(e.clientX - downX, e.clientY - downY) < 12;
    if(game.onUp) game.onUp(e, wasTap);
  }
  renderer.domElement.addEventListener("pointerdown", onDown);
  renderer.domElement.addEventListener("pointerup", onUp);
  renderer.domElement.addEventListener("pointercancel", onUp);

  ui.querySelector("[data-exit]").onclick = ()=> onExit();
  ui.querySelector("[data-start]").onclick = ()=>{
    ui.querySelector("[data-intro]").remove();
    started = true;
    if(type === "voltigieren") music.start();
    if(game.onStart) game.onStart();
  };

  function onResize(){
    const r = container.getBoundingClientRect();
    camera.aspect = Math.max(r.width, 1) / Math.max(r.height, 1);
    camera.updateProjectionMatrix();
    renderer.setSize(Math.max(r.width, 200), Math.max(r.height, 200));
  }
  window.addEventListener("resize", onResize);

  let rafId = 0, prevT = performance.now();
  function loop(now){
    rafId = requestAnimationFrame(loop);
    const t = now / 1000;
    const dt = Math.min(0.05, (now - prevT) / 1000);
    prevT = now;
    rider.tick(t, dt, camera);
    if(started) game.tick(t, dt);
    for(let i = transient.length - 1; i >= 0; i--){
      const s = transient[i];
      s.userData.life -= dt;
      s.position.y += s.userData.vy * dt;
      s.material.opacity = Math.max(0, s.userData.life);
      if(s.userData.life <= 0){ scene.remove(s); s.material.dispose(); transient.splice(i, 1); }
    }
    if(exitAt > 0 && t > exitAt) onExit();
    renderer.render(scene, camera);
  }
  rafId = requestAnimationFrame(loop);

  function destroy(){
    cancelAnimationFrame(rafId);
    music.stop();
    window.removeEventListener("resize", onResize);
    renderer.domElement.removeEventListener("pointerdown", onDown);
    renderer.domElement.removeEventListener("pointerup", onUp);
    renderer.domElement.removeEventListener("pointercancel", onUp);
    if(game.destroy) game.destroy();
    ui.remove();
    scene.traverse(o=>{
      if(o.geometry) o.geometry.dispose();
      if(o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m=>{ if(m.map) m.map.dispose(); m.dispose(); });
    });
    renderer.dispose();
    if(renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
  }
  return { destroy };
}
