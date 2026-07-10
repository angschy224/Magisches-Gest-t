// Reit-Aktivitäten im Gelände: Koppelreiten (Blumen sammeln, erster
// Galopp) und Waldausritt (geführter Pfad, Sprünge, Sternenlaternen).
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { toon, emojiTexture } from "./reiten3d.js";

function makeTree(g, glow){
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 1.2, 7), toon(0x5c3d28, g.gm));
  trunk.position.y = 0.6;
  const crown = glow
    ? new THREE.Mesh(new THREE.SphereGeometry(0.85, 9, 7), new THREE.MeshBasicMaterial({ color: [0x7c5bd6, 0x4fb2b2, 0x9c69dd][Math.floor(Math.random() * 3)] }))
    : new THREE.Mesh(new THREE.SphereGeometry(0.85, 9, 7), toon(0x4a6b4f, g.gm));
  crown.position.y = 1.7;
  crown.scale.y = 1.15;
  tree.add(trunk, crown);
  return tree;
}

// ---------- Koppelreiten (ab Kapitel 6) ----------
const FLOWER_COUNT = 10;

export function startKoppelreiten(g){
  g.scene.background = new THREE.Color(0x35245e);
  g.scene.fog = new THREE.Fog(0x35245e, 12, 26);
  const ground = new THREE.Mesh(new THREE.CylinderGeometry(16, 16, 0.2, 24), toon(0x5f8a5a, g.gm));
  ground.position.y = -0.1;
  g.scene.add(ground);
  // Zaun rundherum
  for(let i = 0; i < 26; i++){
    const a = (i / 26) * Math.PI * 2;
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.0, 0.14), toon(0x8a6242, g.gm));
    post.position.set(Math.sin(a) * 15, 0.5, Math.cos(a) * 15);
    g.scene.add(post);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.1, 0.08), toon(0x8a6242, g.gm));
    rail.position.set(Math.sin(a + 0.12) * 15, 0.75, Math.cos(a + 0.12) * 15);
    rail.rotation.y = a + 0.12 + Math.PI / 2;
    g.scene.add(rail);
  }
  for(let i = 0; i < 6; i++){
    const tree = makeTree(g, false);
    const a = Math.random() * Math.PI * 2, r = 10 + Math.random() * 4;
    tree.position.set(Math.sin(a) * r, 0, Math.cos(a) * r);
    g.scene.add(tree);
  }
  // Zauberblumen des Nebelgeists
  const flowerTex = emojiTexture("🌸", 72);
  const flowers = [];
  for(let i = 0; i < FLOWER_COUNT; i++){
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: flowerTex, transparent: true }));
    const a = (i / FLOWER_COUNT) * Math.PI * 2 + Math.random() * 0.5;
    const r = 4 + Math.random() * 9;
    s.position.set(Math.sin(a) * r, 0.45, Math.cos(a) * r);
    s.scale.set(0.7, 0.7, 1);
    g.scene.add(s);
    flowers.push(s);
  }

  let target = null, collected = 0, gallopHintShown = false;
  const groundRay = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  g.rider.setGait("stand");
  g.setHint("Tippe auf die Wiese, um dorthin zu reiten 🌸");
  g.setCounter("0 / " + FLOWER_COUNT);

  function onUp(e, wasTap){
    if(!wasTap) return;
    const r = g.el.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    groundRay.setFromCamera(ndc, g.camera);
    const hit = groundRay.intersectObject(ground)[0];
    if(!hit) return;
    target = hit.point.clone();
    target.y = 0;
    const d = target.distanceTo(g.rider.root.position);
    if(d > 7 && !gallopHintShown){ gallopHintShown = true; g.setHint("Wiii – dein erster leichter Galopp! 🌟"); }
    g.rider.setGait(d > 7 ? "galopp" : "schritt");
  }

  const dir = new THREE.Vector3(), camPos = new THREE.Vector3();
  function tick(t, dt){
    if(target){
      dir.copy(target).sub(g.rider.root.position);
      dir.y = 0;
      const d = dir.length();
      if(d < 0.3){ target = null; g.rider.setGait("stand"); }
      else {
        dir.normalize();
        const targetRot = Math.atan2(dir.x, dir.z);
        let dr = targetRot - g.rider.root.rotation.y;
        while(dr > Math.PI) dr -= Math.PI * 2;
        while(dr < -Math.PI) dr += Math.PI * 2;
        g.rider.root.rotation.y += dr * Math.min(1, dt * 3);
        g.rider.root.position.addScaledVector(dir, g.rider.speed * dt);
        if(d < 4 && g.rider.speed > 3) g.rider.setGait("schritt"); // sanft auslaufen
      }
    }
    // Blumen einsammeln
    flowers.forEach(f=>{
      if(!f.visible) return;
      f.position.y = 0.45 + Math.sin(t * 2 + f.position.x) * 0.08;
      if(f.position.distanceTo(g.rider.root.position) < 1.6){
        f.visible = false;
        collected++;
        g.setCounter(collected + " / " + FLOWER_COUNT);
        g.setHint(collected < FLOWER_COUNT ? "Eine Zauberblume! Noch " + (FLOWER_COUNT - collected) + " ✨" : "Alle Blumen gefunden!");
        g.spawnSparkles(f.position, 5);
        if(collected === FLOWER_COUNT) g.finish("Der Nebelgeist strahlt: Seine Zauberblumen sind gerettet!", 8);
      }
    });
    // Kamera hinter dem Reiter
    const back = new THREE.Vector3(Math.sin(g.rider.root.rotation.y + Math.PI), 0, Math.cos(g.rider.root.rotation.y + Math.PI)).multiplyScalar(5.4);
    camPos.copy(g.rider.root.position).add(back).add(new THREE.Vector3(0, 3.2, 0));
    g.camera.position.lerp(camPos, Math.min(1, dt * 2.5));
    g.camera.lookAt(g.rider.root.position.x, 1.2, g.rider.root.position.z);
  }
  return { tick, onUp };
}

// ---------- Waldausritt (ab Kapitel 8) ----------
const LOG_POSITIONS = [0.16, 0.32, 0.5, 0.68, 0.85];
const LANTERN_POSITIONS = [0.1, 0.24, 0.42, 0.58, 0.76, 0.92];

export function startWaldausritt(g){
  g.scene.background = new THREE.Color(0x1a0f3d);
  g.scene.fog = new THREE.Fog(0x1a0f3d, 5, 15);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), toon(0x2f4636, g.gm));
  ground.rotation.x = -Math.PI / 2;
  g.scene.add(ground);

  // Geführter Pfad durch den Wald
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0), new THREE.Vector3(6, 0, -8), new THREE.Vector3(0, 0, -16),
    new THREE.Vector3(-7, 0, -22), new THREE.Vector3(-2, 0, -30), new THREE.Vector3(6, 0, -36),
    new THREE.Vector3(1, 0, -44), new THREE.Vector3(-5, 0, -50)
  ]);
  // Leuchtende Bäume links und rechts des Pfads
  const treePos = new THREE.Vector3(), treeTangent = new THREE.Vector3();
  for(let i = 0; i < 34; i++){
    const u = i / 34;
    path.getPointAt(u, treePos);
    path.getTangentAt(u, treeTangent);
    const side = i % 2 === 0 ? 1 : -1;
    const normal = new THREE.Vector3(-treeTangent.z, 0, treeTangent.x).multiplyScalar(side * (2.6 + Math.random() * 2));
    const tree = makeTree(g, true);
    tree.position.copy(treePos).add(normal);
    g.scene.add(tree);
  }
  // Glühwürmchen
  const fireflyGeo = new THREE.BufferGeometry();
  const fireflyPos = new Float32Array(50 * 3);
  for(let i = 0; i < 50; i++){
    const u = Math.random();
    path.getPointAt(u, treePos);
    fireflyPos[i * 3] = treePos.x + (Math.random() - 0.5) * 8;
    fireflyPos[i * 3 + 1] = 0.5 + Math.random() * 2.5;
    fireflyPos[i * 3 + 2] = treePos.z + (Math.random() - 0.5) * 8;
  }
  fireflyGeo.setAttribute("position", new THREE.BufferAttribute(fireflyPos, 3));
  g.scene.add(new THREE.Points(fireflyGeo, new THREE.PointsMaterial({ color: 0xd7ff8a, size: 0.09, transparent: true, opacity: 0.9 })));

  // Baumstämme zum Überspringen
  const logs = LOG_POSITIONS.map(u=>{
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 2.4, 8), toon(0x6b4a2e, g.gm));
    path.getPointAt(u, treePos);
    path.getTangentAt(u, treeTangent);
    log.position.copy(treePos).setY(0.22);
    log.rotation.z = Math.PI / 2;
    log.rotation.y = Math.atan2(treeTangent.x, treeTangent.z) + Math.PI / 2;
    g.scene.add(log);
    return { u, mesh: log, jumped: false, passed: false };
  });
  // Versteckte Sternenlaternen neben dem Pfad
  const lanternTex = emojiTexture("🏮", 72);
  const lanterns = LANTERN_POSITIONS.map((u, i)=>{
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: lanternTex, transparent: true, opacity: 0.45 }));
    path.getPointAt(u, treePos);
    path.getTangentAt(u, treeTangent);
    const side = i % 2 === 0 ? 1 : -1;
    s.position.copy(treePos).add(new THREE.Vector3(-treeTangent.z, 0, treeTangent.x).multiplyScalar(side * 2.2));
    s.position.y = 1.1;
    s.scale.set(0.6, 0.6, 1);
    g.scene.add(s);
    return { sprite: s, found: false };
  });

  let u = 0, jumpT = -1, jumps = 0, found = 0;
  const SPEED = 0.016; // Pfad-Anteil pro Sekunde (~2,5 Minuten)
  const rayc = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const pos = new THREE.Vector3(), tangent = new THREE.Vector3(), camPos = new THREE.Vector3();
  g.rider.setGait("schritt");
  g.setHint("Folge dem leuchtenden Pfad – tippe Laternen an und springe über Stämme! 🌲");
  g.setCounter("🏮 0 / " + lanterns.length);

  function onUp(e, wasTap){
    if(!wasTap) return;
    const r = g.el.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    rayc.setFromCamera(ndc, g.camera);
    // Zuerst: Laterne angetippt?
    const hit = rayc.intersectObjects(lanterns.filter(l=>!l.found).map(l=>l.sprite))[0];
    if(hit){
      const lantern = lanterns.find(l=>l.sprite === hit.object);
      lantern.found = true;
      lantern.sprite.material.opacity = 1;
      lantern.sprite.scale.set(0.95, 0.95, 1);
      found++;
      g.setCounter("🏮 " + found + " / " + lanterns.length);
      g.setHint("Eine versteckte Sternenlaterne! ✨");
      g.spawnSparkles(lantern.sprite.position, 6);
      return;
    }
    // Sonst: Sprung, wenn ein Stamm nah ist
    const nextLog = logs.find(l=>!l.passed && l.u - u > 0 && l.u - u < 0.035);
    if(nextLog && jumpT < 0){
      jumpT = 0;
      nextLog.jumped = true;
      jumps++;
      g.setHint("Hui – toller Sprung! 🌟");
      g.spawnSparkles(g.rider.root.position.clone().add(new THREE.Vector3(0, 1.5, 0)), 5);
    }
  }

  function tick(t, dt){
    if(!g.isFinished()) u += SPEED * dt * (jumpT >= 0 ? 1.4 : 1);
    if(u >= 0.995 && !g.isFinished()){
      g.finish("Ihr habt den Wald durchquert! " + found + " Laternen leuchten nun im Dunkeln.", Math.min(11, 4 + found + (jumps > 3 ? 1 : 0)));
      u = 0.995;
    }
    path.getPointAt(Math.min(u, 0.999), pos);
    path.getTangentAt(Math.min(u, 0.999), tangent);
    g.rider.root.position.copy(pos);
    g.rider.root.rotation.y = Math.atan2(tangent.x, tangent.z);
    // Sprungbogen
    if(jumpT >= 0){
      jumpT += dt;
      const p = jumpT / 0.7;
      if(p >= 1) jumpT = -1;
      else g.rider.root.position.y = Math.sin(p * Math.PI) * 0.9;
    }
    // Stämme: ohne Sprung bremst Funkelstern sanft ab und steigt vorsichtig drüber
    logs.forEach(l=>{
      if(!l.passed && u > l.u + 0.01){
        l.passed = true;
        if(!l.jumped) g.setHint("Hopp – Funkelstern passt gut auf dich auf 💜");
      }
    });
    const nearLog = logs.find(l=>!l.passed && l.u - u > 0 && l.u - u < 0.03);
    g.rider.setGait(g.isFinished() ? "stand" : (nearLog && jumpT < 0 ? "schritt" : "trab"));
    if(nearLog && jumpT < 0) g.setHint("Ein Stamm! Tippe zum Springen 🪵");
    // Kamera folgt hinter dem Reiter
    camPos.copy(pos).addScaledVector(tangent, -5.2).add(new THREE.Vector3(0, 3.0, 0));
    g.camera.position.lerp(camPos, Math.min(1, dt * 3));
    g.camera.lookAt(pos.x + tangent.x * 2, 1.2, pos.z + tangent.z * 2);
  }
  return { tick, onUp };
}
