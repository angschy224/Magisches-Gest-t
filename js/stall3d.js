// 3D-Stall-Szene (Hauptbereich). Three.js per CDN, kein Build-Schritt.
// Fallback bei fehlendem WebGL übernimmt index.html (2D-Übersicht).
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { buildHorse, makeGradientMap } from "./horse3d.js";
import { buildAvatar } from "./avatar3d.js";
import { startStriegeln, startHufeSaeubern } from "./pflege3d.js";

const NAV_ICONS = [
  { id:"mathe",   emoji:"🐴", label:"Koppel",        pos:[-2.15, 2.75, -2.0] },
  { id:"deutsch", emoji:"📚", label:"Bibliothek",    pos:[ 2.15, 2.75, -2.0] },
  { id:"hsu",     emoji:"🌳", label:"Abenteuerwald", pos:[-2.55, 1.35,  0.4] },
  { id:"parent",  emoji:"⚙️", label:"Eltern",        pos:[ 2.55, 1.35,  0.4] }
];
// Pflege-Minispiele: reine Belohnungs-Aktivitäten, ab Kapitel 1 verfügbar
const CARE_ICONS = [
  { id:"striegeln", emoji:"🖌️", label:"Striegeln",    pos:[-1.5, 0.62, 1.6] },
  { id:"hufe",      emoji:"🪥", label:"Hufe säubern", pos:[-0.3, 0.58, 2.0] }
];

function toon(color, gradientMap, extra){
  return new THREE.MeshToonMaterial(Object.assign({color, gradientMap}, extra || {}));
}

function canvasTexture(draw, size){
  const c = document.createElement("canvas");
  c.width = c.height = size || 256;
  draw(c.getContext("2d"), c.width, c.height);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 1;
  return tex;
}

function iconTexture(emoji, label){
  return canvasTexture((ctx, w, h)=>{
    ctx.fillStyle = "rgba(30,16,64,0.55)";
    ctx.beginPath();
    ctx.roundRect(14, 14, w - 28, h - 28, 46);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,215,106,0.8)";
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.font = "108px serif";
    ctx.fillText(emoji, w / 2, h / 2 + 14);
    ctx.font = "bold 34px sans-serif";
    ctx.fillStyle = "#ffe9a8";
    ctx.fillText(label, w / 2, h - 42);
  });
}

function starWindowTexture(){
  return canvasTexture((ctx, w, h)=>{
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#0d0630");
    grad.addColorStop(1, "#2a1258");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    for(let i = 0; i < 60; i++){
      ctx.fillStyle = "rgba(255,235,170," + (0.4 + Math.random() * 0.6) + ")";
      const r = Math.random() * 2 + 0.6;
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#fff3c4";
    ctx.beginPath();
    ctx.arc(w * 0.72, h * 0.26, 20, 0, Math.PI * 2);
    ctx.fill();
  });
}

let audioCtx = null;
let userInteracted = false;
function playSnort(){
  try{
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if(audioCtx.state === "suspended") audioCtx.resume();
    const dur = 0.3;
    const buf = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * dur), audioCtx.sampleRate);
    const d = buf.getChannelData(0);
    for(let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 1.6);
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    const bp = audioCtx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 1.1;
    bp.frequency.setValueAtTime(520, audioCtx.currentTime);
    bp.frequency.exponentialRampToValueAtTime(160, audioCtx.currentTime + dur);
    const g = audioCtx.createGain();
    g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.22, audioCtx.currentTime + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    src.connect(bp); bp.connect(g); g.connect(audioCtx.destination);
    src.start();
  }catch(e){ /* Ton ist optional */ }
}

export function initStall3d(opts){
  const { container, onNavigate, onParent, onMirror, onBonusStars, soundOn, avatarConfig } = opts;
  const rectOf = ()=>{
    const r = container.getBoundingClientRect();
    return { w: Math.max(r.width, 200), h: Math.max(r.height, 200) };
  };

  const renderer = new THREE.WebGLRenderer({ antialias:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  let { w, h } = rectOf();
  renderer.setSize(w, h);
  renderer.domElement.style.cssText = "position:absolute; inset:0; width:100%; height:100%; border-radius:22px;";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x150a3d);
  const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 40);

  // Max. 2 Lichtquellen: Hemisphäre + warme Laterne
  scene.add(new THREE.HemisphereLight(0xbfa7ff, 0x4a3526, 0.85));
  const lantern = new THREE.PointLight(0xffc07a, 55, 14, 1.8);
  lantern.position.set(1.9, 2.5, 0.7);
  scene.add(lantern);

  const gm = makeGradientMap();

  // ---- Raum ----
  const woodDark = toon(0x7a5236, gm), wood = toon(0x9a6c46, gm);
  const floor = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.2, 7.4), woodDark);
  floor.position.y = -0.1;
  scene.add(floor);
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(7.6, 3.8, 0.18), wood);
  backWall.position.set(0, 1.9, -3.6);
  scene.add(backWall);
  [[-3.75], [3.75]].forEach(([x])=>{
    const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.8, 7.4), wood);
    sideWall.position.set(x, 1.9, 0);
    scene.add(sideWall);
  });
  [[-1.6], [1.6]].forEach(([x])=>{
    const beam = new THREE.Mesh(new THREE.BoxGeometry(0.22, 3.8, 0.22), woodDark);
    beam.position.set(x * 2.2, 1.9, -3.45);
    scene.add(beam);
  });

  // Fenster mit Sternenhimmel
  const windowPane = new THREE.Mesh(
    new THREE.PlaneGeometry(1.7, 1.3),
    new THREE.MeshBasicMaterial({ map: starWindowTexture() })
  );
  windowPane.position.set(0, 2.1, -3.5);
  scene.add(windowPane);
  const frameMat = toon(0x5c3d28, gm);
  [[0, 2.1 + 0.68, 1.86, 0.14], [0, 2.1 - 0.68, 1.86, 0.14]].forEach(([x, y, fw, fh])=>{
    const bar = new THREE.Mesh(new THREE.BoxGeometry(fw, fh, 0.1), frameMat);
    bar.position.set(x, y, -3.48);
    scene.add(bar);
  });
  [[-0.9], [0.9], [0]].forEach(([x])=>{
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.42, 0.1), frameMat);
    bar.position.set(x, 2.1, -3.47);
    scene.add(bar);
  });

  // Stroh
  const strawMat = toon(0xe6c46a, gm);
  const pile = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 8), strawMat);
  pile.scale.set(1.4, 0.4, 1.1);
  pile.position.set(-2.2, 0.12, -2.3);
  scene.add(pile);
  for(let i = 0; i < 10; i++){
    const tuft = new THREE.Mesh(new THREE.SphereGeometry(0.16 + Math.random() * 0.1, 8, 6), strawMat);
    tuft.scale.y = 0.25;
    tuft.position.set((Math.random() - 0.5) * 6, 0.04, (Math.random() - 0.5) * 6);
    scene.add(tuft);
  }

  // Laterne (sichtbarer Körper zur Lichtquelle)
  const lanternGroup = new THREE.Group();
  const lampBody = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.34, 10), toon(0x4d3826, gm));
  const lampGlow = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0xffd98f }));
  lampGlow.position.y = -0.02;
  const lampTop = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.14, 10), toon(0x4d3826, gm));
  lampTop.position.y = 0.24;
  const lampChain = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.0, 6), toon(0x3a2a1c, gm));
  lampChain.position.y = 0.8;
  lanternGroup.add(lampBody, lampGlow, lampTop, lampChain);
  lanternGroup.position.copy(lantern.position);
  scene.add(lanternGroup);

  // ---- Pferd ----
  const horse = buildHorse(gm);
  horse.group.position.set(0, 0, -0.4);
  horse.group.rotation.y = 0.45;
  scene.add(horse.group);

  // ---- Avatar des Kindes (steht neben dem Pferd) ----
  let avatar = null;
  if(avatarConfig){
    avatar = buildAvatar(avatarConfig, gm);
    avatar.group.position.set(1.5, 0, 0.5);
    avatar.group.rotation.y = -0.5;
    scene.add(avatar.group);
  }

  // ---- Zauberspiegel (öffnet die Avatar-Erstellung) ----
  const mirrorGroup = new THREE.Group();
  const mirrorFrame = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.07, 10, 24), toon(0xc9a24e, gm));
  mirrorFrame.scale.set(1, 1.25, 1);
  const mirrorGlass = new THREE.Mesh(
    new THREE.CircleGeometry(0.48, 24),
    new THREE.MeshBasicMaterial({ color: 0xbcd6f5 })
  );
  mirrorGlass.scale.set(1, 1.25, 1);
  mirrorGlass.position.z = 0.02;
  const mirrorStar = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({color:0xffd76a}));
  mirrorStar.position.set(0, 0.72, 0.05);
  const mirrorFootL = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.75, 8), toon(0x8a6a34, gm));
  mirrorFootL.position.set(-0.25, -0.85, -0.06);
  mirrorFootL.rotation.z = 0.18;
  const mirrorFootR = mirrorFootL.clone();
  mirrorFootR.position.x = 0.25;
  mirrorFootR.rotation.z = -0.18;
  mirrorGroup.add(mirrorFrame, mirrorGlass, mirrorStar, mirrorFootL, mirrorFootR);
  mirrorGroup.position.set(2.95, 1.15, 1.9);
  mirrorGroup.rotation.y = -0.95;
  scene.add(mirrorGroup);

  // ---- Schwebende Navigations-Symbole ----
  const iconSprites = [];
  NAV_ICONS.forEach((icon, i)=>{
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: iconTexture(icon.emoji, icon.label), transparent:true }));
    sprite.position.set(icon.pos[0], icon.pos[1], icon.pos[2]);
    sprite.scale.set(1.0, 1.0, 1);
    sprite.userData = { navId: icon.id, baseY: icon.pos[1], phase: i * 1.7 };
    scene.add(sprite);
    iconSprites.push(sprite);
  });

  // ---- Pflege-Symbole (Striegeln, Hufe säubern) ----
  const careSprites = [];
  CARE_ICONS.forEach((icon, i)=>{
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: iconTexture(icon.emoji, icon.label), transparent:true }));
    sprite.position.set(icon.pos[0], icon.pos[1], icon.pos[2]);
    sprite.scale.set(0.72, 0.72, 1);
    sprite.userData = { careId: icon.id, baseY: icon.pos[1], phase: 2 + i * 1.3 };
    scene.add(sprite);
    careSprites.push(sprite);
  });

  // ---- Aktives Pflege-Minispiel ----
  let activity = null;
  function endActivity(){
    if(!activity) return;
    activity.destroy();
    activity = null;
    applyCamera(); // zurück zur freien Ansicht
    if(avatar) avatar.group.visible = true;
    [...iconSprites, ...careSprites].forEach(s=> s.material.opacity = 1);
  }
  function startCare(id){
    if(activity) return;
    // Das Kind "übernimmt" selbst Bürste bzw. Hufkratzer – Figur tritt beiseite
    if(avatar) avatar.group.visible = false;
    [...iconSprites, ...careSprites].forEach(s=> s.material.opacity = 0.15);
    const ctx = {
      scene, camera, el: renderer.domElement, container, horse,
      spawnHearts, soundOn, playSnort, onBonusStars,
      onExit: endActivity
    };
    activity = id === "striegeln" ? startStriegeln(ctx) : startHufeSaeubern(ctx);
  }

  // ---- Glitzerpartikel (sparsam) ----
  const P = 70;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(P * 3);
  for(let i = 0; i < P; i++){
    pPos[i * 3] = (Math.random() - 0.5) * 6.5;
    pPos[i * 3 + 1] = Math.random() * 3.2;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 6.5;
  }
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: 0xffd76a, size: 0.055, transparent: true, opacity: 0.85,
    blending: THREE.AdditiveBlending, depthWrite: false
  }));
  scene.add(particles);

  // Herzchen beim Antippen
  const heartTex = canvasTexture((ctx, cw, ch)=>{
    ctx.font = "96px serif";
    ctx.textAlign = "center";
    ctx.fillText("💖", cw / 2, ch / 2 + 34);
  }, 128);
  const hearts = [];
  function spawnHearts(pos){
    for(let i = 0; i < 6; i++){
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: heartTex, transparent:true }));
      s.position.copy(pos);
      s.position.x += (Math.random() - 0.5) * 0.5;
      s.scale.set(0.44, 0.44, 1);
      s.userData = { vy: 0.7 + Math.random() * 0.4, vx: (Math.random() - 0.5) * 0.5, life: 1.6 };
      scene.add(s);
      hearts.push(s);
    }
  }

  // ---- Kamera-Steuerung: Wischen + Pinch, begrenzt ----
  const target = new THREE.Vector3(0, 1.1, -0.2);
  let theta = -0.45, phi = 1.25, radius = 6.2;
  const clampView = ()=>{
    theta = THREE.MathUtils.clamp(theta, -0.85, 0.85);
    phi = THREE.MathUtils.clamp(phi, 0.95, 1.5);
    radius = THREE.MathUtils.clamp(radius, 3.6, 7.4);
  };
  function applyCamera(){
    clampView();
    camera.position.set(
      target.x + radius * Math.sin(phi) * Math.sin(theta),
      target.y + radius * Math.cos(phi),
      target.z + radius * Math.sin(phi) * Math.cos(theta)
    );
    camera.lookAt(target);
  }
  applyCamera();

  const pointers = new Map();
  let lastPinchDist = 0, downX = 0, downY = 0, moved = false;
  const el = renderer.domElement;
  function onDown(e){
    userInteracted = true;
    if(activity) return; // Minispiel übernimmt die Eingaben
    el.setPointerCapture && el.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if(pointers.size === 1){ downX = e.clientX; downY = e.clientY; moved = false; }
    if(pointers.size === 2){
      const pts = [...pointers.values()];
      lastPinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    }
  }
  function onMove(e){
    if(activity) return;
    if(!pointers.has(e.pointerId)) return;
    const prev = pointers.get(e.pointerId);
    const dx = e.clientX - prev.x, dy = e.clientY - prev.y;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if(Math.hypot(e.clientX - downX, e.clientY - downY) > 9) moved = true;
    if(pointers.size === 1){
      theta -= dx * 0.005;
      phi -= dy * 0.004;
      applyCamera();
    } else if(pointers.size === 2){
      const pts = [...pointers.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if(lastPinchDist > 0){ radius *= lastPinchDist / dist; applyCamera(); }
      lastPinchDist = dist;
    }
  }
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  function onUp(e){
    if(activity) return;
    pointers.delete(e.pointerId);
    lastPinchDist = 0;
    if(moved || pointers.size > 0) return;
    const r = el.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const iconHit = raycaster.intersectObjects(iconSprites, false)[0];
    if(iconHit){
      const id = iconHit.object.userData.navId;
      if(id === "parent") onParent(); else onNavigate(id);
      return;
    }
    const careHit = raycaster.intersectObjects(careSprites, false)[0];
    if(careHit){
      startCare(careHit.object.userData.careId);
      return;
    }
    if(onMirror && raycaster.intersectObject(mirrorGroup, true).length){
      onMirror();
      return;
    }
    if(raycaster.intersectObject(horse.group, true).length){
      const headPos = horse.poke();
      spawnHearts(headPos);
      if(soundOn()) playSnort();
    }
  }
  function onWheel(e){ e.preventDefault(); if(activity) return; radius *= 1 + Math.sign(e.deltaY) * 0.08; applyCamera(); }
  el.addEventListener("pointerdown", onDown);
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerup", onUp);
  el.addEventListener("pointercancel", onUp);
  el.addEventListener("wheel", onWheel, { passive:false });

  function onResize(){
    const s = rectOf();
    camera.aspect = s.w / s.h;
    camera.updateProjectionMatrix();
    renderer.setSize(s.w, s.h);
  }
  window.addEventListener("resize", onResize);

  // ---- Loop ----
  let rafId = 0, prevT = performance.now();
  let nextAutoSnort = 12 + Math.random() * 10;
  function loop(now){
    rafId = requestAnimationFrame(loop);
    const t = now / 1000;
    const dt = Math.min(0.05, (now - prevT) / 1000);
    prevT = now;

    horse.tick(t, dt, camera);
    if(avatar) avatar.tick(t, dt);
    if(activity) activity.tick(t, dt);
    mirrorGlass.material.color.setHSL(0.6, 0.55, 0.8 + Math.sin(t * 1.8) * 0.06);
    lantern.intensity = 55 + Math.sin(t * 7.3) * 3 + Math.sin(t * 13.1) * 2;
    lampGlow.material.color.setHSL(0.09, 1, 0.72 + Math.sin(t * 7.3) * 0.03);

    iconSprites.forEach(s=>{
      const k = 1 + Math.sin(t * 2 + s.userData.phase) * 0.05;
      s.scale.set(k, k, 1);
      s.position.y = s.userData.baseY + Math.sin(t * 1.1 + s.userData.phase) * 0.06;
    });
    careSprites.forEach(s=>{
      const k = 0.72 * (1 + Math.sin(t * 2 + s.userData.phase) * 0.05);
      s.scale.set(k, k, 1);
      s.position.y = s.userData.baseY + Math.sin(t * 1.1 + s.userData.phase) * 0.05;
    });

    const pos = pGeo.attributes.position;
    for(let i = 0; i < P; i++){
      let y = pos.getY(i) + dt * 0.12;
      if(y > 3.4) y = 0.05;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;

    for(let i = hearts.length - 1; i >= 0; i--){
      const s = hearts[i];
      s.userData.life -= dt;
      s.position.y += s.userData.vy * dt;
      s.position.x += s.userData.vx * dt;
      s.material.opacity = Math.max(0, s.userData.life / 1.6);
      if(s.userData.life <= 0){ scene.remove(s); s.material.dispose(); hearts.splice(i, 1); }
    }

    if(t > nextAutoSnort){
      nextAutoSnort = t + 14 + Math.random() * 14;
      if(userInteracted && soundOn()){ playSnort(); horse.poke(); }
    }

    renderer.render(scene, camera);
  }
  rafId = requestAnimationFrame(loop);

  function destroy(){
    if(activity){ try{ activity.destroy(); }catch(e){} activity = null; }
    cancelAnimationFrame(rafId);
    window.removeEventListener("resize", onResize);
    el.removeEventListener("pointerdown", onDown);
    el.removeEventListener("pointermove", onMove);
    el.removeEventListener("pointerup", onUp);
    el.removeEventListener("pointercancel", onUp);
    el.removeEventListener("wheel", onWheel);
    scene.traverse(obj=>{
      if(obj.geometry) obj.geometry.dispose();
      if(obj.material){
        (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(m=>{
          if(m.map) m.map.dispose();
          m.dispose();
        });
      }
    });
    renderer.dispose();
    if(el.parentNode) el.parentNode.removeChild(el);
  }

  return { destroy };
}
