// Pflege-Minispiele im 3D-Stall: Striegeln und Hufe säubern.
// Reine Belohnungs-Aktivitäten: Das Pferd ist NIE traurig oder
// vernachlässigt – Pflege bringt nur zusätzliche Freude und Bonus-Sterne.
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const BONUS_STARS = 5;

function sparkleTexture(){
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d");
  ctx.font = "44px serif";
  ctx.textAlign = "center";
  ctx.fillText("✨", 32, 46);
  return new THREE.CanvasTexture(c);
}

function makeUi(container, hint, cursorEmoji){
  const ui = document.createElement("div");
  ui.style.cssText = "position:absolute; inset:0; pointer-events:none; z-index:6;";
  ui.innerHTML = `
    <div data-hint style="position:absolute; top:48px; left:50%; transform:translateX(-50%); background:rgba(10,4,30,.75); color:#fff; padding:8px 18px; border-radius:16px; font-weight:700; font-size:15px; max-width:86%; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${hint}</div>
    <div data-progress style="position:absolute; right:14px; top:50%; transform:translateY(-50%); display:flex; flex-direction:column-reverse; gap:4px; font-size:20px;"></div>
    <button data-exit style="position:absolute; bottom:14px; right:14px; pointer-events:auto; background:rgba(255,255,255,.14); color:#fff; border:2px solid rgba(255,255,255,.4); border-radius:16px; padding:10px 20px; font-size:16px; font-weight:700; font-family:inherit; cursor:pointer;">✔️ Fertig</button>
    <div data-cursor style="position:absolute; font-size:36px; pointer-events:none; transform:translate(-50%,-50%); display:none; filter:drop-shadow(0 3px 4px rgba(0,0,0,.4));">${cursorEmoji}</div>
  `;
  container.appendChild(ui);
  return ui;
}

function setHint(ui, text){ ui.querySelector("[data-hint]").textContent = text; }

// Kleine aufsteigende Funken im DOM (Fortschritts-Feedback)
function riseSparks(container, x, y){
  for(let i = 0; i < 3; i++){
    const s = document.createElement("div");
    s.textContent = "✨";
    s.className = "star-fly";
    s.style.left = (x + (Math.random()-0.5)*30) + "px";
    s.style.top = y + "px";
    s.style.setProperty("--dx", ((Math.random()-0.5)*40) + "px");
    s.style.setProperty("--dy", (-(70 + Math.random()*60)) + "px");
    document.body.appendChild(s);
    setTimeout(()=> s.remove(), 1050);
  }
}

function baseActivity(ctx, ui){
  const transient = []; // kurzlebige Funken-Sprites in der Szene
  const tex = sparkleTexture();
  const rc = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  function spawnSparkles(worldPos, n, big){
    if(transient.length > 32) return; // Partikel-Budget (30+ FPS auf iPad)
    for(let i = 0; i < (n||4); i++){
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent:true }));
      s.position.copy(worldPos);
      s.position.x += (Math.random()-0.5)*0.3;
      s.position.y += (Math.random()-0.5)*0.2;
      s.position.z += (Math.random()-0.5)*0.3;
      const sc = (big?0.28:0.16) + Math.random()*0.08;
      s.scale.set(sc, sc, 1);
      s.userData = { life: 0.9, vy: 0.5 + Math.random()*0.4 };
      ctx.scene.add(s);
      transient.push(s);
    }
  }
  function tickTransient(dt){
    for(let i = transient.length-1; i >= 0; i--){
      const s = transient[i];
      s.userData.life -= dt;
      s.position.y += s.userData.vy * dt;
      s.material.opacity = Math.max(0, s.userData.life / 0.9);
      if(s.userData.life <= 0){ ctx.scene.remove(s); s.material.dispose(); transient.splice(i,1); }
    }
  }
  function clearTransient(){
    transient.forEach(s=>{ ctx.scene.remove(s); s.material.dispose(); });
    transient.length = 0;
  }
  // Cursor folgt dem Finger
  const cursor = ui.querySelector("[data-cursor]");
  function moveCursor(e){
    const r = ctx.container.getBoundingClientRect();
    cursor.style.display = "block";
    cursor.style.left = (e.clientX - r.left) + "px";
    cursor.style.top = (e.clientY - r.top) + "px";
  }
  function raycastAt(e, targets){
    const r = ctx.el.getBoundingClientRect();
    ndc.set(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      -((e.clientY - r.top) / r.height) * 2 + 1
    );
    rc.setFromCamera(ndc, ctx.camera);
    return rc.intersectObjects(targets, true);
  }
  function celebrate(extraText){
    const headPos = ctx.horse.poke();
    ctx.spawnHearts(headPos);
    if(ctx.soundOn()) ctx.playSnort();
    ctx.onBonusStars(BONUS_STARS);
    setHint(ui, extraText + " +" + BONUS_STARS + " ⭐");
  }
  return { spawnSparkles, tickTransient, clearTransient, moveCursor, raycastAt, celebrate };
}

// ---------- Striegeln ----------
export function startStriegeln(ctx){
  const ui = makeUi(ctx.container, "Zieh die Bürste sanft über Funkelstern 🖌️", "🖌️");
  const base = baseActivity(ctx, ui);

  // Das Pferd dreht sich beim Striegeln gemütlich zur offenen Stallseite,
  // sodass seine linke Flanke (-x) zur Kamera zeigt. Alle Pflege-Zonen
  // liegen auf der sichtbaren Seite bzw. auf Rücken, Hals und Po.
  const zoneDefs = [
    [-0.7,1.2,0.5],[-0.75,1.25,-0.35],[-0.5,1.4,-1.05],[0,1.9,0.35],
    [0,1.95,-0.55],[-0.35,1.8,0.9],[-0.3,1.15,1.25],[-0.55,1.75,-0.75]
  ].map(p=>({ pos:new THREE.Vector3(p[0],p[1],p[2]), done:false }));
  const origRotY = ctx.horse.group.rotation.y;
  const glitter = []; // dauerhaft glänzende Stellen (haften am Pferd)
  const gTex = sparkleTexture();

  const progressBox = ui.querySelector("[data-progress]");
  zoneDefs.forEach(()=>{
    const dot = document.createElement("span");
    dot.textContent = "·";
    dot.style.cssText = "opacity:.5; text-align:center;";
    progressBox.appendChild(dot);
  });
  function fillProgress(){
    const doneCount = zoneDefs.filter(z=>z.done).length;
    [...progressBox.children].forEach((dot,i)=>{
      if(i < doneCount && dot.textContent !== "✨"){ dot.textContent = "✨"; dot.style.opacity = "1"; }
    });
    const r = progressBox.getBoundingClientRect();
    riseSparks(ctx.container, r.left + r.width/2, r.top);
    return doneCount;
  }

  let brushing = false, finished = false, exitAt = -1, lastBrush = 0;
  // Kamera bleibt in der offenen Stallfront, Pferd dreht die Flanke zu ihr
  const camPose = { pos:new THREE.Vector3(0.7,1.9,4.1), target:new THREE.Vector3(0,1.25,-0.4) };
  const local = new THREE.Vector3();

  function onDown(e){ brushing = true; base.moveCursor(e); onMove(e); }
  function onMove(e){
    base.moveCursor(e);
    if(!brushing || finished) return;
    const now = performance.now();
    if(now - lastBrush < 70) return; // Eingaben drosseln, schont die Framerate
    lastBrush = now;
    const hit = base.raycastAt(e, [ctx.horse.group])[0];
    if(!hit) return;
    ctx.horse.setRelaxed(true);
    base.spawnSparkles(hit.point, 2);
    local.copy(hit.point);
    ctx.horse.group.worldToLocal(local);
    zoneDefs.forEach(z=>{
      if(!z.done && z.pos.distanceTo(local) < 0.68){
        z.done = true;
        // Dauerhafter Glanz an der Stelle
        for(let i=0;i<3;i++){
          const g = new THREE.Sprite(new THREE.SpriteMaterial({ map:gTex, transparent:true, opacity:0.9 }));
          g.position.copy(z.pos);
          g.position.x += (Math.random()-0.5)*0.3;
          g.position.y += (Math.random()-0.5)*0.25;
          const sc = 0.12 + Math.random()*0.06;
          g.scale.set(sc, sc, 1);
          g.userData = { phase: Math.random()*6 };
          ctx.horse.group.add(g);
          glitter.push(g);
        }
        const doneCount = fillProgress();
        if(doneCount === zoneDefs.length && !finished){
          finished = true;
          base.celebrate("Wunderschön! Funkelstern glänzt und strahlt 💜");
          exitAt = performance.now()/1000 + 2.8;
        }
      }
    });
  }
  function onUp(){ brushing = false; if(!finished) ctx.horse.setRelaxed(false); }
  ctx.el.addEventListener("pointerdown", onDown);
  ctx.el.addEventListener("pointermove", onMove);
  ctx.el.addEventListener("pointerup", onUp);
  ctx.el.addEventListener("pointercancel", onUp);
  ui.querySelector("[data-exit]").onclick = ()=> ctx.onExit();

  function tick(t, dt){
    // Kamera weich zur Pflege-Ansicht führen, Pferd dreht sich gemütlich seitlich
    ctx.camera.position.lerp(camPose.pos, Math.min(1, dt*2.5));
    ctx.camera.lookAt(camPose.target);
    ctx.horse.group.rotation.y += (1.4 - ctx.horse.group.rotation.y) * Math.min(1, dt*1.8);
    glitter.forEach(g=>{ const k = 0.85 + Math.sin(t*3 + g.userData.phase)*0.2; g.material.opacity = Math.min(1, k); });
    base.tickTransient(dt);
    if(exitAt > 0 && t > exitAt) ctx.onExit();
  }
  function destroy(){
    ctx.el.removeEventListener("pointerdown", onDown);
    ctx.el.removeEventListener("pointermove", onMove);
    ctx.el.removeEventListener("pointerup", onUp);
    ctx.el.removeEventListener("pointercancel", onUp);
    glitter.forEach(g=>{ ctx.horse.group.remove(g); g.material.dispose(); });
    base.clearTransient();
    ctx.horse.group.rotation.y = origRotY;
    ctx.horse.setRelaxed(false);
    ui.remove();
  }
  return { tick, destroy };
}

// ---------- Hufe säubern ----------
export function startHufeSaeubern(ctx){
  const ui = makeUi(ctx.container, "Funkelstern hebt ganz ruhig den Huf für dich 💜", "🪥");
  const base = baseActivity(ctx, ui);
  const stoneMat = new THREE.MeshToonMaterial({ color: 0x6b5a48 });
  const legs = ctx.horse.legs;
  const order = [0, 1, 2, 3];

  const progressBox = ui.querySelector("[data-progress]");
  order.forEach(()=>{
    const dot = document.createElement("span");
    dot.textContent = "🐾";
    dot.style.cssText = "opacity:.35;";
    progressBox.appendChild(dot);
  });

  let hoofIdx = 0, phase = "lift", pauseUntil = 0, finished = false, exitAt = -1;
  let stones = [];
  ctx.horse.setRelaxed(true); // bleibt die ganze Zeit entspannt

  function makeStones(leg){
    stones = [];
    for(let i = 0; i < 4; i++){
      const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.055 + Math.random()*0.02), stoneMat);
      stone.position.set(((i % 2) - 0.5) * 0.16, 0.05, 0.1 + Math.floor(i / 2) * 0.14);
      leg.add(stone);
      stones.push(stone);
    }
  }
  makeStones(legs[order[0]]);

  const hoofWorld = new THREE.Vector3();
  function currentLeg(){ return legs[order[hoofIdx]]; }

  function removeStone(stone){
    const wp = new THREE.Vector3();
    stone.getWorldPosition(wp);
    currentLeg().remove(stone);
    stone.geometry.dispose();
    stones = stones.filter(s=>s!==stone);
    base.spawnSparkles(wp, 3);
    if(stones.length === 0 && phase === "clean"){
      phase = "lower";
      const dot = progressBox.children[hoofIdx];
      dot.style.opacity = "1";
      const r = progressBox.getBoundingClientRect();
      riseSparks(ctx.container, r.left + r.width/2, r.top);
      setHint(ui, hoofIdx < 3 ? "Brav, Funkelstern! Gleich kommt der nächste Huf 💜" : "Alle Hufe blitzblank!");
    }
  }
  // Kindgerecht großzügig: Auch ein Tippen KNAPP neben ein Steinchen zählt.
  const projected = new THREE.Vector3();
  function stoneNear(e){
    const direct = base.raycastAt(e, stones)[0];
    if(direct) return direct.object;
    const r = ctx.el.getBoundingClientRect();
    let bestStone = null, bestDist = 46; // Pixel-Toleranz
    stones.forEach(stone=>{
      stone.getWorldPosition(projected);
      projected.project(ctx.camera);
      const sx = (projected.x + 1) / 2 * r.width + r.left;
      const sy = (-projected.y + 1) / 2 * r.height + r.top;
      const d = Math.hypot(e.clientX - sx, e.clientY - sy);
      if(d < bestDist){ bestDist = d; bestStone = stone; }
    });
    return bestStone;
  }
  function onTap(e){
    base.moveCursor(e);
    if(phase !== "clean" || finished) return;
    const stone = stoneNear(e);
    if(stone) removeStone(stone);
  }
  let lastScrape = 0;
  function onMove(e){
    base.moveCursor(e);
    if(phase !== "clean" || finished || e.buttons === 0) return;
    const now = performance.now();
    if(now - lastScrape < 60) return;
    lastScrape = now;
    const stone = stoneNear(e);
    if(stone) removeStone(stone);
  }
  ctx.el.addEventListener("pointerdown", onTap);
  ctx.el.addEventListener("pointermove", onMove);
  ui.querySelector("[data-exit]").onclick = ()=> ctx.onExit();

  function tick(t, dt){
    const leg = currentLeg();
    if(phase === "lift"){
      leg.position.y += (0.35 - leg.position.y) * Math.min(1, dt*2.2);
      leg.rotation.x += (0.7 - leg.rotation.x) * Math.min(1, dt*2.2);
      if(Math.abs(leg.position.y - 0.35) < 0.02){
        phase = "clean";
        setHint(ui, "Tippe die kleinen Steinchen sanft weg 🪥 (" + (hoofIdx+1) + ". Huf)");
      }
    } else if(phase === "lower"){
      leg.position.y += (0 - leg.position.y) * Math.min(1, dt*2.2);
      leg.rotation.x += (0 - leg.rotation.x) * Math.min(1, dt*2.2);
      if(Math.abs(leg.position.y) < 0.02){
        leg.position.y = 0; leg.rotation.x = 0;
        if(hoofIdx < 3){
          hoofIdx++;
          phase = "pause";
          pauseUntil = t + 0.8;
        } else if(!finished){
          finished = true;
          phase = "done";
          base.celebrate("Alle vier Hufe sind sauber – Funkelstern ist überglücklich!");
          exitAt = t + 2.8;
        }
      }
    } else if(phase === "pause" && t > pauseUntil){
      makeStones(currentLeg());
      phase = "lift";
    }
    // Kamera folgt dem aktiven Huf in ruhigem Tempo
    const hoof = leg.children[2];
    hoof.getWorldPosition(hoofWorld);
    if(phase === "done"){
      ctx.camera.position.lerp(new THREE.Vector3(4.3,2.2,2.3), Math.min(1, dt*2));
      ctx.camera.lookAt(0, 1.25, -0.35);
    } else {
      const camPos = new THREE.Vector3(hoofWorld.x + (hoofWorld.x >= 0 ? 0.7 : -0.7), hoofWorld.y + 0.4, hoofWorld.z + 1.05);
      ctx.camera.position.lerp(camPos, Math.min(1, dt*2.2));
      ctx.camera.lookAt(hoofWorld.x, hoofWorld.y + 0.1, hoofWorld.z);
    }
    base.tickTransient(dt);
    if(exitAt > 0 && t > exitAt) ctx.onExit();
  }
  function destroy(){
    ctx.el.removeEventListener("pointerdown", onTap);
    ctx.el.removeEventListener("pointermove", onMove);
    stones.forEach(s=>{ currentLeg().remove(s); s.geometry.dispose(); });
    legs.forEach(l=>{ l.position.y = 0; l.rotation.x = 0; });
    base.clearTransient();
    ctx.horse.setRelaxed(false);
    ui.remove();
  }
  return { tick, destroy };
}
