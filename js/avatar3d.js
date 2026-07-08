// Stilisierte Cartoon-Kinderfigur (Avatar) im gleichen Toon-Look wie das
// Pferd. Baut aus window.AVATAR_OPTIONS (js/avatar-data.js) die Figur,
// liefert eine Editor-Vorschau und rendert Portrait-Bilder für 2D-Ansichten.
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { makeGradientMap } from "./horse3d.js";

function toon(color, gradientMap){
  return new THREE.MeshToonMaterial({ color, gradientMap });
}
function optColor(category, id){
  const opt = (window.AVATAR_OPTIONS[category]||[]).find(o=>o.id===id);
  return opt ? opt.color : "#cccccc";
}

// Haare pro Frisur – alle aus weichen Grundformen.
function buildHair(styleId, mat, gradientMap){
  const g = new THREE.Group();
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.345, 18, 14, 0, Math.PI*2, 0, Math.PI*0.55), mat);
  cap.position.y = 0.02;
  const addStrand = (x, y, z, r)=>{
    const s = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), mat);
    s.position.set(x, y, z);
    g.add(s);
    return s;
  };
  if(styleId==="kurz"){
    g.add(cap);
  } else if(styleId==="bob"){
    g.add(cap);
    const rim = new THREE.Mesh(new THREE.SphereGeometry(0.35, 18, 12, 0, Math.PI*2, Math.PI*0.35, Math.PI*0.35), mat);
    rim.scale.set(1.02, 1.15, 1.02);
    g.add(rim);
  } else if(styleId==="zoepfe"){
    g.add(cap);
    [[-1],[1]].forEach(([side])=>{
      for(let i=0;i<3;i++) addStrand(side*0.34, -0.02 - i*0.13, 0.02, 0.09 - i*0.012);
      addStrand(side*0.34, -0.44, 0.02, 0.05);
    });
  } else if(styleId==="pferdeschwanz"){
    g.add(cap);
    for(let i=0;i<4;i++) addStrand(0, 0.12 - i*0.14, -0.3 - i*0.05, 0.11 - i*0.015);
  } else if(styleId==="locken"){
    for(let i=0;i<9;i++){
      const a = (i/9)*Math.PI*2;
      addStrand(Math.cos(a)*0.24, 0.16 + Math.sin(i*2.7)*0.06, Math.sin(a)*0.24, 0.13);
    }
    addStrand(0, 0.3, 0, 0.16);
  } else if(styleId==="lang"){
    g.add(cap);
    const back = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 12), mat);
    back.scale.set(0.95, 1.7, 0.55);
    back.position.set(0, -0.28, -0.18);
    g.add(back);
  } else { // wuschel
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), mat);
    puff.scale.set(1, 0.92, 1);
    puff.position.y = 0.08;
    g.add(puff);
  }
  return g;
}

function buildAccessory(accId, gradientMap, topMat){
  const g = new THREE.Group();
  if(accId==="hut"){
    const hutMat = toon(0x4a2c7a, gradientMap);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.44, 0.05, 16), hutMat);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.55, 14), hutMat);
    cone.position.y = 0.3;
    cone.rotation.z = 0.12;
    const star = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshBasicMaterial({color:0xffd76a}));
    star.position.set(0.12, 0.18, 0.2);
    g.add(brim, cone, star);
    g.position.y = 1.62; // sitzt auf dem Kopf
  } else if(accId==="umhang"){
    const capeMat = toon(0x6f4fc0, gradientMap);
    const cape = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12, 0, Math.PI), capeMat);
    cape.scale.set(1, 1.6, 0.5);
    cape.rotation.y = Math.PI;
    cape.position.set(0, 0.85, -0.16);
    const clasp = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), new THREE.MeshBasicMaterial({color:0xffd76a}));
    clasp.position.set(0, 1.12, 0.24);
    g.add(cape, clasp);
  } else if(accId==="zauberstab"){
    const cord = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.015, 6, 16, Math.PI), toon(0x5c3d28, gradientMap));
    cord.position.set(0, 1.16, 0.1);
    cord.rotation.x = Math.PI/2 + 0.4;
    const wand = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.22, 8), toon(0x8a5a36, gradientMap));
    wand.position.set(0, 1.0, 0.28);
    wand.rotation.z = 0.5;
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), new THREE.MeshBasicMaterial({color:0xffe9a8}));
    tip.position.set(0.09, 1.09, 0.28);
    g.add(cord, wand, tip);
  }
  return g;
}

// Baut die komplette Figur (~1.7 Einheiten hoch, Füße auf y=0).
export function buildAvatar(config, gradientMap){
  const gm = gradientMap || makeGradientMap();
  const cfg = Object.assign({}, window.AVATAR_DEFAULT, config||{});
  const skinMat = toon(optColor("skin", cfg.skin), gm);
  const hairMat = toon(optColor("hairColor", cfg.hairColor), gm);
  const topMat  = toon(optColor("topColor", cfg.topColor), gm);
  const pantsMat= toon(optColor("pantsColor", cfg.pantsColor), gm);
  const shoeMat = toon(0x4d3826, gm);
  const white   = new THREE.MeshBasicMaterial({color:0xffffff});
  const dark    = new THREE.MeshBasicMaterial({color:0x2a1c2e});
  const irisMat = new THREE.MeshBasicMaterial({color: optColor("eyes", cfg.eyes)});

  const avatar = new THREE.Group();

  // Beine + Schuhe
  [[-0.13],[0.13]].forEach(([x])=>{
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.45, 10), pantsMat);
    leg.position.set(x, 0.28, 0);
    const shoe = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), shoeMat);
    shoe.scale.set(1, 0.6, 1.4);
    shoe.position.set(x, 0.05, 0.04);
    avatar.add(leg, shoe);
  });

  // Oberkörper
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 0.55, 14), topMat);
  torso.position.y = 0.78;
  avatar.add(torso);

  // Arme + Hände
  const arms = [];
  [[-1],[1]].forEach(([side])=>{
    const arm = new THREE.Group();
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.4, 10), topMat);
    sleeve.position.y = -0.18;
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 8), skinMat);
    hand.position.y = -0.4;
    arm.add(sleeve, hand);
    arm.position.set(side*0.3, 1.0, 0);
    arm.rotation.z = side*0.25;
    avatar.add(arm);
    arms.push(arm);
  });

  // Kopf
  const headGroup = new THREE.Group();
  headGroup.position.y = 1.36;
  avatar.add(headGroup);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 16), skinMat);
  headGroup.add(head);

  // Große freundliche Augen (gleicher Stil wie beim Pferd)
  const eyeParts = [];
  [[-0.12],[0.12]].forEach(([x])=>{
    const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), white);
    eyeWhite.position.set(x, 0.03, 0.27);
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), irisMat);
    iris.position.set(x, 0.03, 0.32);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), dark);
    pupil.position.set(x, 0.03, 0.35);
    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.01, 6, 6), white);
    shine.position.set(x+0.018, 0.055, 0.365);
    headGroup.add(eyeWhite, iris, pupil, shine);
    eyeParts.push(eyeWhite, iris, pupil, shine);
  });

  // Lächeln + Wangen
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.016, 6, 14, Math.PI*0.75), dark);
  smile.position.set(0, -0.08, 0.29);
  smile.rotation.z = Math.PI + Math.PI*0.125;
  headGroup.add(smile);
  [[-0.19],[0.19]].forEach(([x])=>{
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), new THREE.MeshBasicMaterial({color:0xf2b8cf, transparent:true, opacity:0.7}));
    cheek.position.set(x, -0.06, 0.24);
    headGroup.add(cheek);
  });

  // Frisur
  const hair = buildHair(cfg.hair, hairMat, gm);
  hair.position.y = 1.42;
  avatar.add(hair);

  // Accessoire
  avatar.add(buildAccessory(cfg.accessory, gm, topMat));

  let blinkStart = -1, nextBlink = 2 + Math.random()*3;
  function tick(t, dt){
    // sanftes Wippen + Armschwingen (Idle)
    avatar.position.y = Math.sin(t*1.4)*0.015;
    arms[0].rotation.z = -0.25 + Math.sin(t*1.4)*0.05;
    arms[1].rotation.z = 0.25 - Math.sin(t*1.4)*0.05;
    headGroup.rotation.z = Math.sin(t*0.7)*0.03;
    if(blinkStart<0 && t>nextBlink) blinkStart = t;
    if(blinkStart>=0){
      const p = (t-blinkStart)/0.2;
      const s = p>=1 ? 1 : 1 - Math.sin(p*Math.PI)*0.85;
      eyeParts.forEach(e=> e.scale.y = s);
      if(p>=1){ blinkStart=-1; nextBlink = t + 2 + Math.random()*4; }
    }
  }

  return { group: avatar, tick };
}

// Editor-Vorschau: kleine Szene mit langsam drehender Figur.
export function initAvatarPreview(container, config){
  const rect = container.getBoundingClientRect();
  const w = Math.max(rect.width, 200), h = Math.max(rect.height, 260);
  const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 1.5));
  renderer.setSize(w, h);
  renderer.domElement.style.cssText = "position:absolute; inset:0; width:100%; height:100%;";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, w/h, 0.1, 20);
  camera.position.set(0, 1.05, 3.1);
  camera.lookAt(0, 0.85, 0);
  scene.add(new THREE.HemisphereLight(0xbfa7ff, 0x4a3526, 1.1));
  const warm = new THREE.PointLight(0xffc07a, 30, 12, 1.8);
  warm.position.set(1.5, 2.2, 2);
  scene.add(warm);

  const gm = makeGradientMap();
  let current = null;
  function setConfig(cfg){
    if(current){
      scene.remove(current.group);
      current.group.traverse(o=>{ if(o.geometry) o.geometry.dispose(); });
    }
    current = buildAvatar(cfg, gm);
    scene.add(current.group);
  }
  setConfig(config);

  let rafId = 0;
  function loop(now){
    rafId = requestAnimationFrame(loop);
    const t = now/1000;
    if(current){
      current.tick(t, 0.016);
      current.group.rotation.y = Math.sin(t*0.5)*0.5;
    }
    renderer.render(scene, camera);
  }
  rafId = requestAnimationFrame(loop);

  function destroy(){
    cancelAnimationFrame(rafId);
    scene.traverse(o=>{ if(o.geometry) o.geometry.dispose(); });
    renderer.dispose();
    if(renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
  }
  return { setConfig, destroy };
}

// Rendert ein Portrait (Brustbild) als PNG-DataURL für 2D-Ansichten.
export function renderAvatarPortrait(config, size){
  const s = size || 256;
  const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
  renderer.setSize(s, s);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 10);
  camera.position.set(0, 1.3, 1.7);
  camera.lookAt(0, 1.15, 0);
  scene.add(new THREE.HemisphereLight(0xbfa7ff, 0x4a3526, 1.15));
  const warm = new THREE.PointLight(0xffc07a, 20, 10, 1.8);
  warm.position.set(1.2, 2, 1.5);
  scene.add(warm);
  const avatar = buildAvatar(config, makeGradientMap());
  avatar.group.rotation.y = 0.15;
  scene.add(avatar.group);
  renderer.render(scene, camera);
  const url = renderer.domElement.toDataURL("image/png");
  scene.traverse(o=>{ if(o.geometry) o.geometry.dispose(); });
  renderer.dispose();
  return url;
}
