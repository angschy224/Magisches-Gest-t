// Low-Poly-Pferd aus Grundformen mit Toon-Shading.
// Gleiche Three.js-Instanz wie stall3d.js (identische CDN-URL → Modul-Cache).
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export function makeGradientMap(){
  const data = new Uint8Array([90, 170, 255]);
  const tex = new THREE.DataTexture(data, 3, 1, THREE.RedFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

function toon(color, gradientMap, extra){
  return new THREE.MeshToonMaterial(Object.assign({color, gradientMap}, extra || {}));
}

const MANE_COLORS = [0xc9a2f5, 0xbb8ff0, 0xac7ce8, 0x9c69dd, 0x8b58d0, 0x7c4cc4];

export function buildHorse(gradientMap){
  const bodyMat  = toon(0xe9c9a3, gradientMap);
  const darkMat  = toon(0x9a7550, gradientMap);
  const hoofMat  = toon(0x6b5240, gradientMap);
  const pinkMat  = toon(0xf2b8cf, gradientMap);
  const whiteMat = toon(0xffffff, gradientMap);
  const blackMat = new THREE.MeshBasicMaterial({color:0x2a1c2e});
  const shineMat = new THREE.MeshBasicMaterial({color:0xffffff});

  const horse = new THREE.Group();

  // Körper
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 18), bodyMat);
  body.scale.set(0.78, 0.82, 1.5);
  body.position.y = 1.12;
  horse.add(body);

  // Beine
  const legs = [];
  [[0.34, 0.68], [-0.34, 0.68], [0.34, -0.78], [-0.34, -0.78]].forEach(([x, z])=>{
    const leg = new THREE.Group();
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.11, 0.6, 12), bodyMat);
    upper.position.y = 0.62;
    const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.42, 12), bodyMat);
    lower.position.y = 0.24;
    const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.12, 0.13, 12), hoofMat);
    hoof.position.y = 0.065;
    leg.add(upper, lower, hoof);
    leg.position.set(x, 0, z);
    horse.add(leg);
    legs.push(leg);
  });

  // Kopf-Baugruppe (Drehpunkt am Halsansatz)
  const headAssembly = new THREE.Group();
  headAssembly.position.set(0, 1.55, 0.85);
  horse.add(headAssembly);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.4, 0.95, 14), bodyMat);
  neck.position.set(0, 0.32, 0.16);
  neck.rotation.x = 0.42;
  headAssembly.add(neck);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.78, 0.42);
  headAssembly.add(headGroup);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.4, 20, 16), bodyMat);
  head.scale.set(0.88, 0.92, 1.1);
  headGroup.add(head);

  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12), toon(0xf3ddc0, gradientMap));
  muzzle.scale.set(0.95, 0.75, 1.0);
  muzzle.position.set(0, -0.1, 0.36);
  headGroup.add(muzzle);

  [[-0.09], [0.09]].forEach(([x])=>{
    const nostril = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), darkMat);
    nostril.position.set(x, -0.1, 0.57);
    headGroup.add(nostril);
  });

  // Große freundliche Augen
  const eyeParts = [];
  [[-0.24], [0.24]].forEach(([x])=>{
    const white = new THREE.Mesh(new THREE.SphereGeometry(0.115, 14, 12), whiteMat);
    white.position.set(x, 0.1, 0.27);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.068, 12, 10), blackMat);
    pupil.position.set(x * 1.04, 0.1, 0.34);
    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), shineMat);
    shine.position.set(x * 1.04 + 0.025, 0.14, 0.4);
    headGroup.add(white, pupil, shine);
    eyeParts.push(white, pupil, shine);
  });

  // Ohren (außen + rosa innen)
  const ears = [];
  [[-0.2, 1], [0.2, -1]].forEach(([x, side])=>{
    const ear = new THREE.Group();
    const outer = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 10), bodyMat);
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 8), pinkMat);
    inner.position.set(0, -0.02, 0.045);
    ear.add(outer, inner);
    ear.position.set(x, 0.42, -0.02);
    ear.rotation.z = -side * 0.18;
    headGroup.add(ear);
    ears.push(ear);
  });

  // Stirnschopf
  const forelock = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), toon(MANE_COLORS[0], gradientMap));
  forelock.scale.set(1, 0.8, 1.1);
  forelock.position.set(0, 0.42, 0.16);
  headGroup.add(forelock);

  // Mähne in Lila-Verlauf, deutlich sichtbar am Nacken entlang
  for(let i = 0; i < 6; i++){
    const r = 0.2 - i * 0.014;
    const tuft = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), toon(MANE_COLORS[i], gradientMap));
    const s = i / 5;
    tuft.scale.set(0.75, 1, 1.15);
    tuft.position.set(0, 1.02 - s * 0.95, 0.18 - s * 0.55);
    headAssembly.add(tuft);
  }

  // Schweif in Lila-Verlauf
  const tail = new THREE.Group();
  tail.position.set(0, 1.42, -1.32);
  MANE_COLORS.forEach((c, i)=>{
    const seg = new THREE.Mesh(new THREE.SphereGeometry(0.15 - i * 0.014, 10, 8), toon(c, gradientMap));
    seg.position.set(0, -i * 0.18, -i * 0.045);
    tail.add(seg);
  });
  horse.add(tail);

  // ---- Animation-State ----
  let lookTimer = 0;
  let nextTwitch = 2 + Math.random() * 4;
  let twitchStart = -1, twitchEar = 0;
  let nextBlink = 1.5 + Math.random() * 3;
  let blinkStart = -1;
  let relaxed = false; // Wohlfühl-Pose beim Striegeln: Augen zu, Ohren locker
  const camLocal = new THREE.Vector3();

  function tick(t, dt, camera){
    // Atmen
    const breath = 1 + Math.sin(t * 1.6) * 0.02;
    body.scale.set(0.78 * breath, 0.82 * (2 - breath), 1.5);

    if(relaxed){
      const k = Math.min(1, dt * 6);
      eyeParts.forEach(e => e.scale.y += (0.12 - e.scale.y) * k);
      ears[0].rotation.z += (-0.55 - ears[0].rotation.z) * k;
      ears[1].rotation.z += (0.55 - ears[1].rotation.z) * k;
      headAssembly.rotation.x += (0.08 - headAssembly.rotation.x) * Math.min(1, dt * 3);
      tail.rotation.z = Math.sin(t * 0.9) * 0.12;
      return;
    }
    ears[0].rotation.z += (-0.18 - ears[0].rotation.z) * Math.min(1, dt * 4);
    ears[1].rotation.z += (0.18 - ears[1].rotation.z) * Math.min(1, dt * 4);

    // Kopf heben/senken (Idle) bzw. zur Kamera schauen
    let targetYaw = 0, targetPitch = Math.sin(t * 0.55) * 0.07;
    if(lookTimer > 0){
      lookTimer -= dt;
      camLocal.copy(camera.position);
      horse.worldToLocal(camLocal);
      camLocal.sub(headAssembly.position);
      targetYaw = THREE.MathUtils.clamp(Math.atan2(camLocal.x, camLocal.z), -0.55, 0.55);
      targetPitch = THREE.MathUtils.clamp(Math.atan2(camLocal.y - 0.8, Math.hypot(camLocal.x, camLocal.z)) * 0.5, -0.15, 0.3);
    }
    headAssembly.rotation.y += (targetYaw - headAssembly.rotation.y) * Math.min(1, dt * 5);
    headAssembly.rotation.x += (-targetPitch - headAssembly.rotation.x) * Math.min(1, dt * 4);

    // Ohren zucken
    if(twitchStart < 0 && t > nextTwitch){ twitchStart = t; twitchEar = Math.random() < 0.5 ? 0 : 1; }
    if(twitchStart >= 0){
      const p = (t - twitchStart) / 0.35;
      if(p >= 1){ twitchStart = -1; nextTwitch = t + 2.5 + Math.random() * 5; ears[twitchEar].rotation.x = 0; }
      else ears[twitchEar].rotation.x = Math.sin(p * Math.PI) * 0.45;
    }

    // Blinzeln
    if(blinkStart < 0 && t > nextBlink){ blinkStart = t; }
    if(blinkStart >= 0){
      const p = (t - blinkStart) / 0.22;
      const s = p >= 1 ? 1 : 1 - Math.sin(p * Math.PI) * 0.85;
      eyeParts.forEach(e => e.scale.y = s);
      if(p >= 1){ blinkStart = -1; nextBlink = t + 2 + Math.random() * 4; }
    }

    // Schweif schwingen
    tail.rotation.z = Math.sin(t * 1.9) * 0.22;
    tail.rotation.x = Math.sin(t * 1.1) * 0.08 + 0.1;
  }

  // Antippen: Pferd schaut zur Kamera; liefert Welt-Position des Kopfes für Partikel.
  function poke(){
    lookTimer = 3.5;
    const pos = new THREE.Vector3();
    headGroup.getWorldPosition(pos);
    return pos;
  }

  function setRelaxed(v){ relaxed = !!v; }

  return { group: horse, tick, poke, setRelaxed, legs };
}
