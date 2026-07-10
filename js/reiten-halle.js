// Reit-Aktivitäten in der Halle: Voltigieren (Timing an der Longe)
// und Hallenreiten (durch schwebende Sternringe).
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { toon, emojiTexture } from "./reiten3d.js";

// Gemeinsame Reithalle: Sandboden, Bande, weicher warmer Nebel
function buildHalle(g){
  g.scene.background = new THREE.Color(0x2a1a4e);
  g.scene.fog = new THREE.Fog(0x2a1a4e, 9, 22);
  const floor = new THREE.Mesh(new THREE.CylinderGeometry(9.5, 9.5, 0.2, 28), toon(0xd9b98a, g.gm));
  floor.position.y = -0.1;
  g.scene.add(floor);
  // Bande (niedrige Wand) als Ring aus Segmenten
  for(let i = 0; i < 22; i++){
    const a = (i / 22) * Math.PI * 2;
    const seg = new THREE.Mesh(new THREE.BoxGeometry(2.7, 1.0, 0.16), toon(0x8a6242, g.gm));
    seg.position.set(Math.sin(a) * 9.2, 0.5, Math.cos(a) * 9.2);
    seg.rotation.y = a;
    g.scene.add(seg);
  }
}

// Position auf Kreisbahn (für Longe und Ringe-Runde)
function circlePos(theta, radius, out){
  out.set(Math.sin(theta) * radius, 0, Math.cos(theta) * radius);
  return out;
}

// ---------- Voltigieren (ab Kapitel 2) ----------
const VOLTI_ACTIONS = [
  { emoji: "🧎", label: "Knien" },
  { emoji: "🧍", label: "Stehen" },
  { emoji: "🙆", label: "Arme ausbreiten" }
];
const VOLTI_PROMPTS = 8;

export function startVoltigieren(g){
  buildHalle(g);
  const R = 3.2;
  // Longen-Pfosten in der Mitte + Leine zum Pferd
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.4, 8), toon(0x5c3d28, g.gm));
  pole.position.y = 0.7;
  g.scene.add(pole);
  const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
  const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0xc9a24e }));
  g.scene.add(line);
  // Funkenkreis auf dem Boden
  const sparkTex = emojiTexture("✨", 48);
  for(let i = 0; i < 16; i++){
    const a = (i / 16) * Math.PI * 2;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: sparkTex, transparent: true, opacity: 0.7 }));
    s.position.set(Math.sin(a) * R, 0.12, Math.cos(a) * R);
    s.scale.set(0.3, 0.3, 1);
    g.scene.add(s);
  }

  // Timing-UI: schrumpfender Kreis auf Ziel-Ring
  const timing = document.createElement("div");
  timing.style.cssText = "position:absolute; top:16%; left:50%; transform:translateX(-50%); width:130px; height:130px; pointer-events:none; display:none; z-index:7;";
  timing.innerHTML = `
    <div style="position:absolute; inset:22px; border:5px solid #ffd76a; border-radius:50%;"></div>
    <div data-shrink style="position:absolute; inset:0; border:5px dashed #fff; border-radius:50%;"></div>
    <div data-action style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; font-size:34px; color:#fff; text-shadow:0 2px 6px #000;"></div>
  `;
  g.container.appendChild(timing);
  const shrinkEl = timing.querySelector("[data-shrink]");
  const actionEl = timing.querySelector("[data-action]");

  let theta = 0, promptIdx = 0, hits = 0;
  let promptStart = -1, nextPromptAt = 3, action = null, feedback = 0;
  const PROMPT_DUR = 2.4;
  g.rider.setGait("schritt");
  g.setHint("Funkelstern läuft ruhig an der Longe – warte auf dein Zeichen ✨");
  g.setCounter("0 / " + VOLTI_PROMPTS);

  function pose(label){
    const av = g.rider.avatar;
    if(!av) return;
    g.rider.posing = true;
    if(label === "Knien"){ av.group.scale.setScalar(0.66); }
    else if(label === "Stehen"){ av.group.position.y = 1.85; }
    else { av.arms[0].rotation.z = -1.35; av.arms[1].rotation.z = 1.35; }
    setTimeout(()=>{
      av.group.scale.setScalar(0.85);
      av.group.position.y = 1.52;
      g.rider.posing = false;
    }, 1400);
  }

  function onUp(e, wasTap){
    if(!wasTap || promptStart < 0) return;
    const p = (performance.now() / 1000 - promptStart) / PROMPT_DUR;
    const scale = 1 - p; // 1 → 0; Ziel-Ring liegt bei ~0.33
    if(Math.abs(scale - 0.33) < 0.14){
      hits++;
      g.setHint("Super gemacht! " + action.label + " wie eine echte Voltigiererin 🌟");
      pose(action.label);
      g.spawnSparkles(g.rider.root.position.clone().add(new THREE.Vector3(0, 2.2, 0)), 6);
    } else {
      g.setHint("Fast! Beim nächsten Zeichen klappt es bestimmt 💜");
    }
    promptStart = -1;
    timing.style.display = "none";
    promptIdx++;
    g.setCounter(promptIdx + " / " + VOLTI_PROMPTS);
    feedback = performance.now() / 1000;
    nextPromptAt = feedback + 2.6;
  }

  function tick(t, dt){
    theta += (g.rider.speed / R) * dt * 0.55;
    circlePos(theta, R, g.rider.root.position);
    g.rider.root.rotation.y = theta + Math.PI / 2;
    line.geometry.setFromPoints([new THREE.Vector3(0, 1.2, 0), g.rider.root.position.clone().add(new THREE.Vector3(0, 1.4, 0))]);
    // Kamera außen mit Blick auf den Kreis
    g.camera.position.lerp(new THREE.Vector3(0.5, 3.4, 8.6), Math.min(1, dt * 2));
    g.camera.lookAt(g.rider.root.position.x * 0.5, 1.2, g.rider.root.position.z * 0.5);

    if(g.isFinished()) return;
    if(promptStart < 0 && promptIdx < VOLTI_PROMPTS && t > nextPromptAt){
      action = VOLTI_ACTIONS[promptIdx % VOLTI_ACTIONS.length];
      promptStart = t;
      timing.style.display = "block";
      actionEl.innerHTML = action.emoji + "<div style='font-size:14px; font-weight:700;'>" + action.label + "</div>";
      g.setHint("Gleich! Tippe, wenn der weiße Ring den goldenen erreicht …");
    }
    if(promptStart >= 0){
      const p = (t - promptStart) / PROMPT_DUR;
      if(p >= 1){
        promptStart = -1;
        timing.style.display = "none";
        promptIdx++;
        g.setCounter(promptIdx + " / " + VOLTI_PROMPTS);
        g.setHint("Kein Problem – Funkelstern trägt dich sicher weiter 💜");
        nextPromptAt = t + 2.6;
      } else {
        const inset = p * 42;
        shrinkEl.style.inset = inset + "px";
      }
    }
    if(promptIdx >= VOLTI_PROMPTS && promptStart < 0 && !g.isFinished()){
      g.finish("Was für eine Vorstellung! Der Nebelgeist klatscht begeistert.", 4 + hits);
    }
  }
  return { tick, onUp, destroy: ()=> timing.remove() };
}

// ---------- Hallenreiten (ab Kapitel 4) ----------
const RING_COUNT = 12;

export function startHallenreiten(g){
  buildHalle(g);
  const R = 6.5, LANE_W = 1.1;
  let theta = 0, lane = 0, targetLane = 0, collected = 0, holding = false;
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xffd76a });
  const rings = [];
  for(let i = 0; i < RING_COUNT; i++){
    const th = 1.0 + i * ((Math.PI * 4 - 1.5) / (RING_COUNT - 1)); // über 2 Runden
    const ringLane = [ -1, 0, 1 ][Math.floor(Math.random() * 3)];
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.07, 8, 20), ringMat.clone());
    const p = circlePos(th % (Math.PI * 2), R + ringLane * LANE_W, new THREE.Vector3());
    mesh.position.set(p.x, 1.4, p.z);
    mesh.rotation.y = (th % (Math.PI * 2)) + Math.PI / 2;
    g.scene.add(mesh);
    rings.push({ th, lane: ringLane, mesh, done: false });
  }
  const lastTh = rings[rings.length - 1].th;

  g.rider.setGait("schritt");
  g.setHint("Tippe links/rechts für die Spur – halte gedrückt für Trab! 💫");
  g.setCounter("0 / " + RING_COUNT);

  function onDown(){ holding = true; }
  function onUp(e, wasTap){
    holding = false;
    if(wasTap){
      const r = g.el.getBoundingClientRect();
      targetLane = Math.max(-1, Math.min(1, targetLane + (e.clientX - r.left < r.width / 2 ? -1 : 1)));
    }
  }

  const pos = new THREE.Vector3();
  function tick(t, dt){
    g.rider.setGait(g.isFinished() ? "stand" : (holding ? "trab" : "schritt"));
    theta += (g.rider.speed / R) * dt;
    lane += (targetLane - lane) * Math.min(1, dt * 4);
    circlePos(theta % (Math.PI * 2), R + lane * LANE_W, g.rider.root.position);
    g.rider.root.rotation.y = (theta % (Math.PI * 2)) + Math.PI / 2;

    // Ringe einsammeln
    rings.forEach(ring=>{
      if(ring.done) return;
      if(theta > ring.th - 0.06 && theta < ring.th + 0.25 && Math.abs(lane - ring.lane) < 0.5){
        ring.done = true;
        collected++;
        g.setCounter(collected + " / " + RING_COUNT);
        g.setHint("Sternring Nummer " + collected + "! ✨");
        g.spawnSparkles(ring.mesh.position, 6);
        ring.mesh.material.color.set(0x8adfb0);
      }
      // Ring pulsiert sanft
      const k = 1 + Math.sin(t * 2.2 + ring.th) * 0.06;
      ring.mesh.scale.set(k, k, 1);
    });

    // Kamera hinter dem Reiter
    const back = new THREE.Vector3(Math.cos(theta % (Math.PI * 2)), 0, -Math.sin(theta % (Math.PI * 2))).multiplyScalar(-3.4);
    pos.copy(g.rider.root.position).add(back).add(new THREE.Vector3(0, 2.4, 0));
    g.camera.position.lerp(pos, Math.min(1, dt * 3));
    g.camera.lookAt(g.rider.root.position.x, 1.4, g.rider.root.position.z);

    if(!g.isFinished() && theta > lastTh + 0.7){
      g.finish("Tolle Runde! " + collected + " Sternringe leuchten für dich.", Math.min(10, 3 + collected));
    }
  }
  return { tick, onDown, onUp };
}
