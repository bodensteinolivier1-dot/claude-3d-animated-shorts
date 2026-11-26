// "He Opened Every Window in January" — ~44 s RicksClips-formula short on the office set (v2: heavy animation pass).
// odd act → mockery → reply → disaster → science (CO₂ ppm, Harvard study) → analogy → payoff ending + outro.
// Timings: film/story_windows.json (shorts/open-windows/timing.json), lip-sync envelope: film/story_windows_env.json.
// Render: XQ="&viewer=1&story=windows" node render.cjs out/windows.mp4 720 1280 30   (SFX_OUT=file.json dumps the sound cues)
export default async function story(ctx) {
  const { THREE, SR, scene, camera, renderer, canvas, post, U, hemi, sun, SUNDIR, WW, HH, O, Z, FY, OUTF, thua, ti, ex, ALL,
    V, clamp, eio, lerp, place, idle, face, arm, Lw, dirW, look, headC, yawTo, hips, headTurn, waveArms, resetScene, setLook, put, addFace, base } = ctx;

  // ---------- timing ----------
  const T = await (await fetch('./film/story_windows.json')).json();
  const ENV = await (await fetch('./film/story_windows_env.json')).json();
  const LN = Object.fromEntries(T.lines.map(l => [l.id, l])), S = id => LN[id].start, E = id => LN[id].end;
  const DUR = +(E('end') + 2.3).toFixed(2);   // outro hold after the last line
  const wt = (id, w, n = 0) => { const xs = LN[id].words.filter(k => k.w.toLowerCase().replace(/[^a-z0-9']/g, '').startsWith(w)); return xs[n] ? xs[n].t : S(id); };
  const amp = t => { const i = Math.round(t * 30); return ENV[i] ?? 0; };
  const hash = (i, k = 0) => { const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return s - Math.floor(s); };
  const seg = (t, a, b) => clamp((t - a) / (b - a));

  // ---------- extra faces: blinks + small talking mouths that keep the deadpan look ----------
  const blinkEyes = (g, F) => { g.strokeStyle = F.IK; g.lineWidth = 16; g.lineCap = 'round'; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * F.EX - 30, -52); g.quadraticCurveTo(sd * F.EX, -40, sd * F.EX + 30, -52); g.stroke(); } };
  const smallO = (g, w, h) => { g.fillStyle = '#5c1212'; g.strokeStyle = '#17141a'; g.lineWidth = 12; g.beginPath(); g.ellipse(0, 104, w, h, 0, 0, 7); g.fill(); g.stroke(); };
  const smugM = (g, F) => { g.strokeStyle = F.IK; g.lineWidth = F.LW; g.beginPath(); g.moveTo(-55, 205); g.quadraticCurveTo(10, 240, 75, 180); g.stroke(); };
  const rcEyes = (g, F) => { g.fillStyle = F.IK; for (const sd of [-1, 1]) { g.beginPath(); g.ellipse(sd * F.EX * 1.15, -18, 25, 31, 0, 0, 7); g.fill(); } };
  const rcBrows = (g, F, k = 1) => { g.strokeStyle = F.IK; g.lineCap = 'round'; g.lineWidth = 34; for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 40, -78 + 14 * k); g.lineTo(sd * 165, -100 - 10 * k); g.stroke(); } };
  const rcSmirk = (g, F) => { g.strokeStyle = F.IK; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(-34, 96); g.quadraticCurveTo(8, 108, 40, 88); g.stroke(); };
  addFace('calm', (g, F) => { rcBrows(g, F); rcEyes(g, F); rcSmirk(g, F); });
  addFace('calm_b', (g, F) => { rcBrows(g, F); blinkEyes(g, F); rcSmirk(g, F); });
  addFace('calm_t', (g, F) => { rcBrows(g, F); rcEyes(g, F); smallO(g, 24, 20); });
  addFace('calm_tb', (g, F) => { rcBrows(g, F); blinkEyes(g, F); smallO(g, 24, 20); });
  addFace('smug_b', (g, F) => { blinkEyes(g, F); F.brows(g, 0.2, -86); smugM(g, F); });
  addFace('angry', (g, F) => { F.lidEyes(g); F.brows(g, 0.9, -96, 46); F.mFrown(g, 50, 215); });
  addFace('angry_t', (g, F) => { F.lidEyes(g); F.brows(g, 0.9, -96, 46); F.mOpen(g, 80, 95, 185, true); });
  addFace('cold', (g, F) => { F.ringEyes(g, 16); F.brows(g, -0.4, -150, 30); F.mWavy(g, 215); });
  addFace('cold_t', (g, F) => { F.ringEyes(g, 16); F.brows(g, -0.4, -150, 30); g.fillStyle = '#fff'; g.strokeStyle = F.IK; g.lineWidth = 12; g.beginPath(); g.roundRect(-70, 190, 140, 46, 12); g.fill(); g.stroke(); g.beginPath(); g.moveTo(-70, 213); g.lineTo(70, 213); for (let x = -46; x <= 46; x += 23) { g.moveTo(x, 190); g.lineTo(x, 236); } g.stroke(); });   // chattering teeth
  addFace('sleep', (g, F) => { blinkEyes(g, F); F.mO(g, 18, 215); });
  addFace('yawn', (g, F) => { blinkEyes(g, F); F.mOpen(g, 90, 130, 175, true); });
  addFace('bliss', (g, F) => { blinkEyes(g, F); F.brows(g, -0.3, -120, 32); F.mSmile(g, 80, 195, 0.55); });
  const BLINKABLE = { calm: 'calm_b', calm_t: 'calm_tb', smug: 'smug_b', serious: 'calm_b', listen: 'calm_b' };

  // ---------- cast ----------
  const KEV = OUTF[0], DAVE = OUTF[1], THUA = thua, TI = ti, GREEN = ex[4];
  const XS = [SR.build({ ...base, jacket: '#e8442a', jacket2: '#b8321f', details: ['polo'], collarCol: '#ffffff', logoCol: '#f2cf2c' }),
    SR.build({ ...base, jacket: '#8a5cd6', jacket2: '#6a40b0', details: ['hoodie'], hat: 'cap', hatCol: '#f27fb2', capBack: true }),
    SR.build({ ...base, jacket: '#2fb3a6', jacket2: '#1f8379', pattern: ['stripes', '#ffffff'], details: ['bow'], tieCol: '#f2cf2c' }),
    SR.build({ ...base, jacket: '#f2cf2c', jacket2: '#c9a516', pattern: ['dots', '#ff7a59'], details: ['collar'], collarCol: '#3d7be0' })];
  XS.forEach((c, i) => { c.root.scale.setScalar(0.8); c.phase = 5 + i * 0.53; c.root.rotation.order = 'YXZ'; face(c, 'calm'); c.tint = c.hm.material.uniforms.base.value.clone(); ALL.push(c); });
  const [XR, XP, XT, XY] = XS;
  const CAST = [KEV, DAVE, THUA, TI, GREEN, ...XS];
  const ZB = Z - 6, ZD = Z - 2.9, CHZ = ZD - 0.55;
  const DX = 1.45;   // Dave's spot at the whiteboard (left end, chart on his left-hand side)
  const DESK = { kev: -6.2, thua: -2.1, dave: 2.1, ti: 6.2 };
  const WIN = [-6.2, -3.2], WZ = ZB + 0.85;   // where people stand at a window

  // ---------- set dressing ----------
  O.children.filter(o => /chair/i.test(o.name)).forEach(o => (o.visible = false));   // standing desks
  O.children.forEach(o => { if (Math.abs(o.position.z - ZD) < 0.01 && o.position.y > FY + 0.5 && /computerScreen|laptop/.test(o.name)) o.rotation.y = Math.PI; });   // screens face the people
  if (put) {   // extra CC0 props: a lived-in office
    await put('polyhaven', 'metal_trash_can', -4.15, ZD + 0.1, 0); await put('polyhaven', 'metal_trash_can', 4.15, ZD + 0.1, 0.6);
    await put('polyhaven', 'cardboard_box_01', 8.2, ZB + 2.6, 0.3); await put('polyhaven', 'cardboard_box_01', 8.25, ZB + 2.6, 0.9, { y: FY + 0.42 });
    await put('polyhaven', 'binder_notebook', -2.55, ZD - 0.05, 0.3, { y: FY + 0.66 }); await put('polyhaven', 'binder_notebook', 6.65, ZD - 0.1, -0.4, { y: FY + 0.66 });
    await put('polyhaven', 'standing_picture_frame_01', 1.6, ZD - 0.15, 0.5, { y: FY + 0.66 });
    await put('kenney', 'coatRackStanding', -8.3, Z - 0.2, 0.4, { k: 1.25 });
  }
  O.children.forEach(o => { const p = o.geometry?.parameters; if (!o.isMesh || !p || p.height !== 4.2) return; if (p.width === 18) o.material.color.set('#26c2ad'); else if (p.width === 0.2) o.material.color.set('#ffc94d'); });   // bright teal back wall, sunny side walls
  // canvas helper
  const ctex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const panel = (tex, w, h, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 })); m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = true; O.add(m); return m; };
  // calendar (JANUARY), motivational poster over the yellow one, sticky notes on monitors' wall
  panel(ctex(300, 400, (g) => { g.fillStyle = '#fff'; g.fillRect(0, 0, 300, 400); g.fillStyle = '#e8442a'; g.fillRect(0, 0, 300, 90); g.fillStyle = '#fff'; g.font = 'bold 54px InterB, sans-serif'; g.textAlign = 'center'; g.fillText('JANUARY', 150, 64);
    g.fillStyle = '#9fd3f5'; g.beginPath(); for (let i = 0; i < 5; i++) { g.moveTo(150 + 46 * Math.cos(i * 1.256), 150 + 46 * Math.sin(i * 1.256)); g.lineTo(150, 150); } g.strokeStyle = '#7ab6e0'; g.lineWidth = 6; g.stroke();
    g.fillStyle = '#333'; g.font = 'bold 22px InterB, sans-serif'; for (let d = 0; d < 31; d++) { const c = d % 7, r = Math.floor(d / 7); g.fillText(String(d + 1), 40 + c * 37, 240 + r * 36); } g.strokeStyle = '#e8442a'; g.lineWidth = 4; g.beginPath(); g.arc(40 + 3 * 37, 232 + 2 * 36, 16, 0, 7); g.stroke(); }), 0.62, 0.82, 4.6, FY + 2.35, ZB + 0.16);
  panel(ctex(330, 450, (g) => { g.fillStyle = '#1f3a5f'; g.fillRect(0, 0, 330, 450); g.fillStyle = '#f2cf2c'; g.beginPath(); g.moveTo(40, 300); g.lineTo(165, 110); g.lineTo(290, 300); g.closePath(); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(130, 163); g.lineTo(165, 110); g.lineTo(200, 163); g.closePath(); g.fill();
    g.fillStyle = '#fff'; g.font = 'bold 52px Anton, sans-serif'; g.textAlign = 'center'; g.fillText('TEAMWORK', 165, 375); g.font = '20px InterB, sans-serif'; g.fillText('together we climb', 165, 410); }), 1.05, 1.44, 7.3, FY + 2.4, ZB + 0.17);
  // big wall clock with live hands (time-lapse insert)
  const CLK = V(-0.8, FY + 3.0, ZB + 0.16); const clock = new THREE.Group(); clock.position.copy(CLK); O.add(clock);
  { const face = new THREE.Mesh(new THREE.CircleGeometry(0.36, 48), new THREE.MeshStandardMaterial({ map: ctex(256, 256, (g) => { g.fillStyle = '#fbfaf5'; g.beginPath(); g.arc(128, 128, 126, 0, 7); g.fill(); g.fillStyle = '#222'; g.font = 'bold 30px InterB, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      for (let h = 1; h <= 12; h++) { const a = h / 12 * Math.PI * 2; g.fillText(String(h), 128 + 96 * Math.sin(a), 128 - 96 * Math.cos(a)); } }), roughness: 0.5 })); clock.add(face);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.04, 10, 48), new THREE.MeshStandardMaterial({ color: '#2a1612', roughness: 0.4 })); clock.add(rim); }
  const hand = (l, w) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, l, 0.012), new THREE.MeshStandardMaterial({ color: '#17141a' })); m.geometry.translate(0, l / 2, 0); m.position.z = 0.02; clock.add(m); return m; };
  const hHand = hand(0.2, 0.035), mHand = hand(0.3, 0.022);
  const setClock = (hours) => { hHand.rotation.z = -(hours % 12) / 12 * Math.PI * 2; mHand.rotation.z = -(hours % 1) * Math.PI * 2; };

  // animated window view: snowy city (or bright morning), falling flakes drawn into the texture each frame
  const winC = document.createElement('canvas'); winC.width = 512; winC.height = 384; const wq = winC.getContext('2d'); const winT = new THREE.CanvasTexture(winC); winT.colorSpace = THREE.SRGBColorSpace;
  const BLD = Array.from({ length: 14 }, (_, i) => ({ x: i * 40 - 20 + hash(i, 1) * 20, w: 34 + hash(i, 2) * 30, h: 90 + hash(i, 3) * 170, c: ['#8a96a8', '#7c889c', '#9aa4b4', '#6f7c92'][i % 4] }));
  const drawWin = (t, morning) => { const g = wq, sky = g.createLinearGradient(0, 0, 0, 384);
    if (morning) { sky.addColorStop(0, '#8fc4ff'); sky.addColorStop(1, '#fff0d8'); } else { sky.addColorStop(0, '#9fb0c8'); sky.addColorStop(1, '#e6ecf4'); }
    g.fillStyle = sky; g.fillRect(0, 0, 512, 384); if (morning) { g.fillStyle = 'rgba(255,240,200,0.9)'; g.beginPath(); g.arc(400, 90, 40, 0, 7); g.fill(); }
    for (const b of BLD) { g.fillStyle = b.c; g.fillRect(b.x, 384 - b.h, b.w, b.h); g.fillStyle = '#ffffff'; g.fillRect(b.x - 2, 384 - b.h - 7, b.w + 4, 9);
      g.fillStyle = morning ? 'rgba(200,220,255,0.7)' : 'rgba(255,214,140,0.85)'; for (let yy = 384 - b.h + 16; yy < 370; yy += 22) for (let xx = b.x + 6; xx < b.x + b.w - 8; xx += 12) if (hash(xx, yy) > 0.45) g.fillRect(xx, yy, 6, 9); }
    g.fillStyle = '#ffffff'; g.fillRect(0, 368, 512, 16);
    g.fillStyle = 'rgba(255,255,255,0.95)'; for (let i = 0; i < 160; i++) { const sp = 30 + hash(i, 4) * 50, x = (hash(i, 5) * 560 + Math.sin(t * 1.3 + i) * 12 + t * 25) % 540 - 14, y = (hash(i, 6) * 384 + t * sp) % 400 - 8, r = 1 + hash(i, 7) * 2.6; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
    winT.needsUpdate = true; };
  O.children.forEach(o => { const p = o.geometry?.parameters; if (o.isMesh && p && p.width === 2.4 && p.height === 1.8) { o.material = new THREE.MeshBasicMaterial({ map: winT, toneMapped: true }); o.material.color.setRGB(1.6, 1.6, 1.6); } });
  O.children.forEach(o => { if (o.isMesh && o.geometry?.parameters?.width === 0.35 && Math.abs(o.position.z - (ZB + 0.14)) < 0.02) o.visible = false; });   // old flat "city" boxes: the texture has the city now

  const SHAFTS = O.children.filter(o => o.isMesh && o.material?.blending === THREE.AdditiveBlending && o.material.side === THREE.DoubleSide);
  SHAFTS.forEach(o => { o.geometry.computeBoundingBox(); const b = o.geometry.boundingBox; o.userData.x = (b.min.x + b.max.x) / 2; });
  // sliding lower sashes
  const glassM = new THREE.MeshStandardMaterial({ color: '#d8ecff', transparent: true, opacity: 0.28, roughness: 0.05, metalness: 0 });
  const frameM = new THREE.MeshStandardMaterial({ color: '#f7f5f0', roughness: 0.6 });
  const sashes = WIN.map(x => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.9, 0.02), glassM));
    for (const [w, h, px, py] of [[2.4, 0.07, 0, 0.45], [2.4, 0.07, 0, -0.45], [0.07, 0.95, -1.17, 0], [0.07, 0.95, 1.17, 0]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.06), frameM); b.position.set(px, py, 0.01); g.add(b); }
    g.position.set(x, FY + 1.85, ZB + 0.24); O.add(g); return g; });
  const sashOpen = (i, k) => (sashes[i].position.y = FY + 1.85 + 0.85 * k);

  // whiteboard (canvas)
  const wbC = document.createElement('canvas'); wbC.width = 1024; wbC.height = 480; const wg = wbC.getContext('2d'); const wbT = new THREE.CanvasTexture(wbC); wbT.colorSpace = THREE.SRGBColorSpace;
  const wb = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 1.5), new THREE.MeshStandardMaterial({ map: wbT, roughness: 0.5 })); wb.position.set(2.2, FY + 2.4, ZB + 0.2); O.add(wb);
  let wbMode = '';
  const drawWB = (mode) => { if (mode === wbMode) return; wbMode = mode; wg.fillStyle = '#fbfbf8'; wg.fillRect(0, 0, 1024, 480); wg.textAlign = 'center';
    if (mode === 'pitch') { wg.fillStyle = '#1d3c8f'; wg.font = 'bold 74px InterB, sans-serif'; wg.fillText('Q4 MEGA PITCH', 512, 100);
      const bars = [[180, 120, '#e8442a'], [360, 200, '#f2b02c'], [540, 290, '#2fa36b'], [720, 360, '#3d7be0']]; for (const [x, h, c] of bars) { wg.fillStyle = c; wg.fillRect(x, 440 - h, 110, h); }
      wg.strokeStyle = '#222'; wg.lineWidth = 8; wg.beginPath(); wg.moveTo(150, 445); wg.lineTo(880, 445); wg.stroke();
      wg.strokeStyle = '#e8442a'; wg.lineWidth = 10; wg.beginPath(); wg.moveTo(230, 300); wg.lineTo(410, 220); wg.lineTo(600, 140); wg.lineTo(790, 70); wg.stroke(); }
    else if (mode === 'math') { wg.fillStyle = '#222'; wg.font = 'bold 210px InterB, sans-serif'; wg.fillText('2 + 2 = ?', 512, 320); }
    else { wg.fillStyle = '#3d7be0'; wg.font = 'bold 54px InterB, sans-serif'; wg.fillText('TO DO:', 260, 110); wg.fillStyle = '#333'; wg.font = '44px InterB, sans-serif'; wg.textAlign = 'left'; wg.fillText('- Q4 pitch @ 3pm', 160, 200); wg.fillText('- fix printer', 160, 270); wg.fillText('- buy more coffee', 160, 340); }
    wbT.needsUpdate = true; };

  // props carried by people
  const mug = new THREE.Group(); { const m = new THREE.MeshStandardMaterial({ color: '#f4f1ea', roughness: 0.4 }); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.12, 20), m); mug.add(b);
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.03, 20), new THREE.MeshStandardMaterial({ color: '#e8442a', roughness: 0.5 })); st.position.y = 0.02; mug.add(st);
    const h = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.011, 8, 16), m); h.position.x = 0.06; mug.add(h); const ink = new THREE.Mesh(b.geometry, new THREE.MeshBasicMaterial({ color: '#2a1612', side: THREE.BackSide })); ink.scale.setScalar(1.08); b.add(ink);
    mug.traverse(o => { if (o.isMesh) o.castShadow = true; }); scene.add(mug); }
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.75, 8), new THREE.MeshStandardMaterial({ color: '#7a4a2a', roughness: 0.6 })); stick.castShadow = true; scene.add(stick);
  const aimStick = (from, to) => { const d = to.clone().sub(from), L = 0.75; stick.position.copy(from).addScaledVector(d.normalize(), L / 2 - 0.05); stick.quaternion.setFromUnitVectors(V(0, 1, 0), d); stick.visible = true; };
  // sleeping bag (the analogy)
  const bag = new THREE.Group(); { const m = new THREE.MeshStandardMaterial({ color: '#4f8a3c', roughness: 0.85 });
    const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.29, 0.22, 8, 24), m); b.scale.set(1, 1, 0.9); bag.add(b);
    const ink = new THREE.Mesh(b.geometry, new THREE.MeshBasicMaterial({ color: '#2a1612', side: THREE.BackSide })); ink.scale.setScalar(1.04); b.add(ink);
    const zip = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.6, 0.02), new THREE.MeshStandardMaterial({ color: '#f2cf2c' })); zip.position.set(0.12, 0, 0.27); zip.rotation.z = 0.05; bag.add(zip);
    bag.pull = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.03), new THREE.MeshStandardMaterial({ color: '#c0c0c0', metalness: 0.6, roughness: 0.3 })); bag.pull.position.set(0.125, -0.25, 0.29); bag.add(bag.pull);
    bag.traverse(o => { if (o.isMesh) o.castShadow = true; }); scene.add(bag); }
  // flying paper sheets
  const paperM = new THREE.MeshStandardMaterial({ color: '#fbfaf4', side: THREE.DoubleSide, roughness: 0.8 });
  const papers = Array.from({ length: 14 }, () => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.29), paperM); m.castShadow = true; scene.add(m); return m; });

  // particles
  const dotT = ctex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 2, 32, 32, 30); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.5, 'rgba(255,255,255,0.8)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  const NS = 1400, snowG = new THREE.BufferGeometry(), snowP = new Float32Array(NS * 3); snowG.setAttribute('position', new THREE.BufferAttribute(snowP, 3));
  const snow = new THREE.Points(snowG, new THREE.PointsMaterial({ map: dotT, size: 0.065, transparent: true, depthWrite: false, color: new THREE.Color(1.6, 1.6, 1.7), toneMapped: false })); snow.frustumCulled = false; scene.add(snow);
  const updSnow = (t, open, gust) => { for (let i = 0; i < NS; i++) { const w = i % 2, x0 = WIN[w], life = 3.0, ph = hash(i, 1) * life, a = ((t + ph) % life), born = t - a;
      const on = open[w](born) > hash(i, 7) && open[w](born) > 0.05; const g = 1 + 1.6 * gust(born); const vx = (hash(i, 2) - 0.5) * 1.6, vz = (1.3 + hash(i, 3) * 2.4) * g, vy = -0.2 - hash(i, 4) * 0.35;
      const x = x0 + (hash(i, 5) - 0.5) * 2.1 + vx * a + 0.18 * Math.sin(a * 3 + i), y = FY + 1.45 + hash(i, 6) * 0.8 + vy * a + 0.1 * Math.sin(a * 4 + i * 0.3), z = ZB + 0.3 + vz * a;
      snowP.set(on && y > FY + 0.02 && z < Z + 8 ? [x, y, z] : [0, -50, 0], i * 3); } snowG.attributes.position.needsUpdate = true; };
  const co2T = ctex(128, 128, (g) => { g.fillStyle = 'rgba(150,160,150,0.55)'; g.beginPath(); g.arc(64, 64, 56, 0, 7); g.fill(); g.lineWidth = 5; g.strokeStyle = 'rgba(60,60,60,0.8)'; g.stroke(); g.fillStyle = '#2a2a2a'; g.font = 'bold 40px InterB, sans-serif'; g.textAlign = 'center'; g.fillText('CO₂', 64, 78); });
  const sprites = (n, map) => Array.from({ length: n }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false })); s.visible = false; scene.add(s); return s; });
  const bubbles = sprites(200, co2T), vapor = sprites(60, dotT);
  const bang = ctex(128, 128, (g) => { g.fillStyle = '#fff'; g.beginPath(); g.arc(64, 60, 50, 0, 7); g.fill(); g.lineWidth = 6; g.strokeStyle = '#2a1612'; g.stroke(); g.fillStyle = '#e8442a'; g.font = 'bold 72px InterB, sans-serif'; g.textAlign = 'center'; g.fillText('!', 64, 86); });
  const zzz = ctex(128, 128, (g) => { g.fillStyle = '#fff'; g.strokeStyle = '#2a1612'; g.lineWidth = 8; g.font = 'bold 64px Anton, sans-serif'; g.textAlign = 'center'; g.strokeText('Z', 64, 84); g.fillText('Z', 64, 84); });
  const pops = sprites(6, bang), zs = sprites(36, zzz); pops.concat(zs).forEach(s => (s.material.depthTest = false));

  // 2-D overlay: cards, ppm counter, bar graph
  const out = document.createElement('canvas'); out.width = WW; out.height = HH; const og = out.getContext('2d'); const K = WW / 1080;
  const backOut = x => { x = clamp(x); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
  const card = (text, t0, t1, t, y = 300, sz = 120, col = '#ffe36b', rot = -0.03, shake = 0) => { if (t < t0 || t > t1) return; const k = backOut((t - t0) / 0.3) * clamp((t1 - t) / 0.2);
    og.save(); og.translate(WW / 2 + shake * Math.sin(t * 70) * 6 * K, y * K); og.scale(k * K, k * K); og.rotate(rot); og.font = `${sz}px Anton, sans-serif`; og.textAlign = 'center'; og.textBaseline = 'middle';
    og.lineJoin = 'round'; og.lineWidth = sz * 0.2; og.strokeStyle = '#111'; og.strokeText(text, 0, 0); og.fillStyle = col; og.fillText(text, 0, 0); og.restore(); };
  const graph = (t0, t1, t) => { if (t < t0 || t > t1) return; const a = clamp((t - t0) / 0.3) * clamp((t1 - t) / 0.25), drop = eio(clamp((t - t0 - 1.3) / 1.2)), pop = backOut((t - t0) / 0.35);
    og.save(); og.globalAlpha = a; og.translate(WW / 2, 410 * K); og.scale(K * pop, K * pop); og.translate(-540, -410); og.fillStyle = 'rgba(255,255,255,0.94)'; og.strokeStyle = '#111'; og.lineWidth = 8; const bx = 150, by = 150, bw = 780, bh = 520;
    og.beginPath(); og.roundRect(bx, by, bw, bh, 28); og.fill(); og.stroke(); og.fillStyle = '#111'; og.font = '64px Anton, sans-serif'; og.textAlign = 'center'; og.fillText('THINKING SCORE', bx + bw / 2, by + 80);
    const bars = [['FRESH AIR', 1, '#2fa36b'], ['1,400 PPM', 1 - 0.5 * drop, '#e8442a']]; bars.forEach(([lab, v, c], i) => { const x = bx + 150 + i * 310, h = 250 * v; og.fillStyle = c; og.fillRect(x, by + 450 - h, 170, h); og.strokeRect(x, by + 450 - h, 170, h);
      og.fillStyle = '#111'; og.font = '40px Anton, sans-serif'; og.fillText(lab, x + 85, by + 495); og.font = '52px Anton, sans-serif'; og.fillText(`${Math.round(v * 100)}%`, x + 85, by + 438 - h); });
    if (drop > 0.95) { og.fillStyle = '#e8442a'; og.font = '90px Anton, sans-serif'; og.save(); og.translate(bx + 640, by + 250); og.rotate(-0.2); og.lineWidth = 14; og.strokeStyle = '#111'; og.strokeText('-50%', 0, 0); og.fillText('-50%', 0, 0); og.restore(); }
    og.restore(); };
  const ppm = (t0, t1, t) => { if (t < t0 || t > t1) return; const v = Math.round((400 + 1000 * eio(clamp((t - t0 - 0.4) / 3.6))) / 10) * 10, hot = v >= 1400;
    card('CO₂ IN THE ROOM', t0, t1, t, 190, 84, '#ffffff', 0); card(`${v.toLocaleString('en-US')} PPM`, t0 + 0.15, t1, t, 340, 150, hot ? '#ff5a3c' : '#ffe36b', -0.02, hot ? 1 : 0); };
  const flash = (t, t0, d = 0.12) => { if (t >= t0 && t < t0 + d) { og.fillStyle = `rgba(255,255,255,${0.7 * (1 - (t - t0) / d)})`; og.fillRect(0, 0, WW, HH); } };

  // ---------- pose helpers ----------
  const COLD = new THREE.Color('#b9dcff');
  const chill = (c, k) => { if (k > 0) c.hm.material.uniforms.base.value.copy(c.tint).lerp(COLD, k * 0.5); };
  const SC = 0.8; const squash = (c, k) => { c.root.scale.set(SC * (1 + 0.5 * k), SC * (1 - k), SC * (1 + 0.5 * k)); };   // k>0 squash, k<0 stretch
  const blinkAt = (c, t) => { const i = CAST.indexOf(c), p = 2.6 + hash(i, 9) * 1.6, ph = (t + hash(i, 10) * 3) % p; return ph < 0.11; };
  const mood = (c, m, t) => face(c, blinkAt(c, t) && BLINKABLE[m] ? BLINKABLE[m] : m);
  const speak = (c, t, open, closed) => { const a = amp(t); c._talk = a; mood(c, a > 0.18 ? open : closed, t); headTurn(c, 0, 0.05 * Math.sin(t * 9) * clamp(a)); };
  const stand = (c, x, z, ry, t) => { place(c, x, z, ry, FY); c.root.scale.setScalar(SC); idle(c, t); headTurn(c, 0.07 * Math.sin(t * 1.3 + c.phase * 3), 0.03 * Math.sin(t * 1.9 + c.phase)); };
  const walk = (c, P, t0, t1, t, spd = 1.25) => { const k = seg(t, t0, t1), L = []; let tot = 0; for (let i = 1; i < P.length; i++) { L.push(P[i].distanceTo(P[i - 1])); tot += L[i - 1]; }
    let s = k * tot, i = 0; while (i < L.length - 1 && s > L[i]) { s -= L[i]; i++; } const a = P[i].clone().lerp(P[i + 1], clamp(s / L[i])), d = P[i + 1].clone().sub(P[i]);
    place(c, a.x, a.z, Math.atan2(d.x, d.z), FY); c.root.scale.setScalar(SC); if (k > 0 && k < 1) { SR.clipAt(c, 'walk', (t - t0) * spd); c._walk = (t - t0) * spd; } else idle(c, t); return a; };
  const hug = (c, t, k = 1) => { const j = 0.016 * Math.sin(t * 47) * k; c.root.position.x += j; c.root.position.y += Math.abs(j) * 0.4; arm(c, 'Left', Lw(c, -0.15, 0.98 + j, 0.32)); arm(c, 'Right', Lw(c, 0.15, 0.95 - j, 0.32)); };
  const type = (c, t) => { const a = 0.03 * Math.sin(t * 28), b = 0.03 * Math.sin(t * 31 + 1); arm(c, 'Left', Lw(c, 0.16, 0.97 + a, 0.52)); arm(c, 'Right', Lw(c, -0.16, 0.97 + b, 0.52)); };
  const jab = (c, t) => { const j = Math.max(0, Math.sin(t * 11)); arm(c, 'Right', Lw(c, -0.1, 1.38 + 0.04 * j, 0.6 + 0.3 * j), dirW(c, -1, 0, 0)); arm(c, 'Left', Lw(c, 0.3, 0.9, 0.05)); };
  const gest = (c, t, k = 1) => { const a = Math.sin(t * 4.2), b = Math.sin(t * 3.4 + 1); arm(c, 'Left', Lw(c, 0.45 + 0.15 * a * k, 1.25 + 0.25 * b * k, 0.35), dirW(c, 1, 0, -0.3)); };
  const doze = (c, t, k, i) => { const nod = Math.pow(Math.max(0, Math.sin(t * 1.4 + i * 1.7)), 6); headTurn(c, 0.1 * k, (0.35 + 0.35 * nod) * k); };
  const holdMug = (c, t, sip = 0) => { const p = Lw(c, -0.16 + 0.06 * sip, 1.0 + 0.55 * sip, 0.32 - 0.08 * sip); arm(c, 'Right', p, dirW(c, -1, -0.3, -0.3)); mug.visible = true; mug.position.copy(p).add(V(0, 0.07, 0)); mug.rotation.set(0, c.root.rotation.y + Math.PI / 2, -0.9 * sip); };
  const windowGrab = (c, k) => { for (const s of ['Left', 'Right']) arm(c, s, Lw(c, (s === 'Left' ? 1 : -1) * 0.28, 1.05 + 0.75 * k, 0.42)); };
  const mouthP = c => headC(c).add(dirW(c, 0, 0, 1).multiplyScalar(0.25)).add(V(0, -0.08, 0));
  // particles from mouths
  const breath = (pool, base, list, t, period, life, tex) => { list.forEach((c, ci) => { const m = mouthP(c), f = dirW(c, 0, 0, 1); for (let j = 0; j < 4; j++) { const s = pool[base + ci * 4 + j]; if (!s) continue;
      const u = (t + ci * 0.37) / period; let n = Math.floor(u); while (((n % 4) + 4) % 4 !== j) n--; const a = (u - n) * period; if (a < 0 || a > life) continue;
      s.visible = true; s.position.copy(m).addScaledVector(f, 0.05 + a * 0.3).add(V(0.06 * Math.sin(a * 4 + j + ci), a * 0.28, 0)); const sc = tex === 'co2' ? 0.06 + a * 0.05 : 0.05 + a * 0.14; s.scale.setScalar(sc); s.material.opacity = (tex === 'co2' ? 1 : 0.55) * clamp(a * 5) * clamp((life - a) * 2.5); } }); };
  const fill = (n, t) => { for (let i = 0; i < n && i < 120; i++) { const s = bubbles[80 + i]; s.visible = true; s.position.set(-8 + hash(i, 11) * 16, FY + 0.6 + hash(i, 12) * 3.1 + 0.08 * Math.sin(t * 1.3 + i), ZB + 0.5 + hash(i, 13) * 8); s.scale.setScalar(0.18 + hash(i, 14) * 0.15); s.material.opacity = 0.85; } };
  const popOver = (i, c, t0, t1, t) => { const s = pops[i]; if (t < t0 || t > t1) return; const h = headC(c); s.visible = true; s.position.set(h.x + 0.22, h.y + 0.42 + 0.04 * Math.sin(t * 9), h.z); s.scale.setScalar(0.36 * backOut((t - t0) / 0.25)); };
  const zOver = (c, i, t) => { const h = headC(c); for (let j = 0; j < 3; j++) { const s = zs[i * 3 + j], a = (t * 0.6 + j / 3 + i * 0.2) % 1; s.visible = true; s.position.set(h.x + 0.15 + a * 0.25, h.y + 0.3 + a * 0.45, h.z); s.scale.setScalar(0.1 + a * 0.12); s.material.opacity = clamp(a * 4) * clamp((1 - a) * 3); } };
  const flyPapers = (t, t0, srcs) => { papers.forEach((p, i) => { const a = t - t0 - hash(i, 20) * 0.6; if (a < 0 || a > 3.2) { p.visible = false; return; } const s = srcs[i % srcs.length];
      p.visible = true; p.position.set(s.x + (hash(i, 21) - 0.5) * 1.2 + a * (hash(i, 22) - 0.5) * 1.6, FY + 1.1 + a * 0.9 - a * a * 0.22 + 0.15 * Math.sin(a * 5 + i), s.z + a * (1.2 + hash(i, 23) * 1.6)); p.rotation.set(a * (3 + i % 3), a * 2.3 + i, a * (2 + i % 4)); }); };
  const haze = (k) => { k *= 0.7; scene.fog.color.set('#c8d6a0'); scene.fog.near = lerp(400, 2.5, k); scene.fog.far = lerp(4000, 26, k); };
  const grade = (mode) => { setLook('day'); SUNDIR.set(0.35, 0.5, -0.75).normalize(); U.uSat.value = 1.45; U.uVig.value = 0.3;
    const P = { cold: [0.6, '#c4d6f4', 2.7, '#f4f6ff', 1.1, 0.0, 0.64], stale: [0.58, '#f4e6c8', 2.6, '#ffe2b0', 1.1, 0.07, 0.62], morning: [0.75, '#fff3e2', 2.8, '#ffe9c4', 1.08, 0.09, 0.76] }[mode];
    hemi.intensity = P[0]; hemi.color.set(P[1]); sun.intensity = P[2]; sun.color.set(P[3]); U.uCon.value = P[4]; U.uWarm.value = P[5]; renderer.toneMappingExposure = P[6]; };
  const dof = (d, a) => { post.bokeh.enabled = d > 0; if (d > 0) { post.bokeh.uniforms.focus.value = d; post.bokeh.uniforms.aperture.value = a; } };
  let shakeAmt = 0; const cam = (p, tg, fov, roll = 0) => { const s = shakeAmt, c0 = CUTS.filter(c => c <= T0 + 1e-4).pop() ?? 0, k = eio(seg(T0, c0, c0 + 0.22)); look(p.clone().add(V(s * Math.sin(T0 * 61), s * Math.sin(T0 * 47 + 1), 0)), tg, fov * (1 + 0.16 * (1 - k)), roll); };
  let T0 = 0; const shakeAt = (t, t0, d = 0.35, a = 0.03) => { if (t >= t0 && t < t0 + d) shakeAmt = Math.max(shakeAmt, a * (1 - (t - t0) / d)); };
  const whip = (t, t1, A, B, d = 0.26) => B && t > t1 ? A.clone().lerp(B, eio((t - t1) / d)) : A;

  // ---------- story beats (absolute times) ----------
  const B = {
    walk0: 0.0, grab: 1.45, yank: 1.85, turn: 2.75, freeze: S('freeze') - 0.1, whipB: 4.95, mock: S('mock') - 0.1, inface: 6.9, reply: S('reply') - 0.1, rxn: 10.15,
    shut: S('shut') - 0.1, slam1: S('shut') + 0.25, cut2: S('shut') + 0.75, slam2: S('shut') + 1.05, clock: S('shut') + 1.55, pitch: S('pitch') - 0.1, hero: S('pitch') + 1.9,
    blank: S('blank') - 0.15, why: S('why') - 0.1, aud: S('why') + 1.8, ppm: S('ppm') - 0.1, top: S('ppm') + 2.5, study: S('study') - 0.1, plant: S('study') + 1.9,
    ana: S('analogy') - 0.1, stumble: S('analogy') + 1.9, morn: S('end') - 0.5, open: wt('end', 'opened') - 0.1, kev: E('end') - 0.05,
  };
  const CUTS = [0, B.grab, B.yank, B.turn, B.freeze, B.mock, B.inface, B.reply, B.rxn, B.shut, B.slam1, B.cut2, B.slam2, B.clock, B.pitch, B.hero, B.blank, B.why, B.aud, B.ppm, B.top, B.study, B.plant + 0.45, B.ana, B.ana + 0.6, B.stumble, B.stumble + 1.1, B.morn, B.open - 0.6, B.open, B.kev].sort((a, b) => a - b);
  // background coworkers: always busy (typing, pacing with papers, rummaging the shelf, reading a clipboard); shiver when it is cold
  const extras = (t, cold) => {
    const cz = (c, i) => { hug(c, t + i * 0.3); mood(c, Math.sin(t * 36 + i * 2) > 0 ? 'cold_t' : 'cold', t); chill(c, 1); };
    stand(XR, -6.2, CHZ, 0.1, t + 2); if (cold) cz(XR, 0); else { type(XR, t + 2); mood(XR, 'calm', t); }
    { const per = 6.4, u = ((t + 1.3) % per) / per, fw = u < 0.5, x = fw ? lerp(3.9, 6.9, u * 2) : lerp(6.9, 3.9, (u - 0.5) * 2);
      place(XP, x, -24.35, fw ? Math.PI / 2 : -Math.PI / 2, FY); XP.root.scale.setScalar(SC); SR.clipAt(XP, 'walk', t * 1.3); XP._walk = t * 1.3;
      if (cold) cz(XP, 1); else { arm(XP, 'Left', Lw(XP, 0.12, 1.02, 0.36)); arm(XP, 'Right', Lw(XP, -0.12, 1.02, 0.36)); mood(XP, 'calm', t); } }
    stand(XT, 7.6, -24.95, cold ? 0.2 : Math.PI, t + 3); if (cold) cz(XT, 2); else { const r = Math.sin(t * 3); arm(XT, 'Left', Lw(XT, 0.25, 1.35 + 0.1 * r, 0.4)); arm(XT, 'Right', Lw(XT, -0.25, 1.3 - 0.1 * r, 0.4)); mood(XT, 'calm', t); }
    stand(XY, -7.7, -24.85, 0.35, t + 4); if (cold) cz(XY, 3); else { arm(XY, 'Left', Lw(XY, 0.1, 1.15, 0.38)); arm(XY, 'Right', Lw(XY, -0.12, 1.12, 0.36)); headTurn(XY, 0, 0.25); mood(XY, 'calm', t); } };
  // window open factors
  const W_OPEN = [t => (t < B.slam2 - 0.25 ? 1 : t < B.slam2 ? 1 - eio(seg(t, B.slam2 - 0.25, B.slam2)) : t < B.morn ? 0 : 1),
    t => (t < B.yank ? 0 : t < B.slam1 - 0.25 ? eio((t - B.yank) / 0.22) : t < B.slam1 ? 1 - eio(seg(t, B.slam1 - 0.25, B.slam1)) : t < B.open ? 0 : eio((t - B.open) / 0.25))];
  const gust = t => (t > B.yank && t < B.yank + 1.2 ? Math.sin(seg(t, B.yank, B.yank + 1.2) * Math.PI) : 0) + (t > B.open && t < B.open + 1.2 ? Math.sin(seg(t, B.open, B.open + 1.2) * Math.PI) : 0);
  // sound cues for the mix (name, time)
  window.SFX = [['whoosh', B.yank - 0.05], ['wind_gust', B.yank], ['paper', B.yank + 0.2], ['pop', B.turn + 0.5], ['whip', B.whipB], ['stomp', B.mock + 0.2], ['stomp', B.mock + 0.65], ['stomp', B.mock + 1.1],
    ['sip', B.reply + 0.25], ['boing', B.rxn], ['slam', B.slam1], ['slam', B.slam2], ['tick_fast', B.clock], ['ding', B.pitch + 0.1], ['tap', B.hero + 0.5], ['tap', B.hero + 0.9], ['tap', B.hero + 1.3],
    ['scratch', B.blank], ['clatter', B.blank + 0.55], ['crickets', B.blank + 0.2], ['puff', B.why + 0.6], ['puff', B.why + 1.4], ['yawn', B.aud + 0.6], ['tick_up', B.ppm + 0.4], ['alarm', B.ppm + 4.0],
    ['whoosh', B.study], ['thud', B.plant + 0.45], ['whoosh', B.ana + 0.2], ['thud', B.ana + 0.6], ['zip', B.ana + 0.9], ['bonk', B.stumble + 1.1], ['rooster', B.morn + 0.1], ['whoosh', B.open - 0.05], ['wind_gust', B.open], ['sting', B.kev + 0.6]];
  window.MUSIC = { stop: B.blank, science: B.why, morning: B.morn, end: DUR };

  const TAKES = [[THUA, B.yank + 0.3], [TI, B.yank + 0.45], [XT, B.yank + 0.35], [XY, B.yank + 0.5], [XR, B.yank + 0.4], [DAVE, B.rxn, 0], [THUA, B.open + 0.35], [TI, B.open + 0.5], [XR, B.open + 0.45], [XY, B.open + 0.3]];
  const RED = new THREE.Color('#ff5a4a');
  const CREAM = new THREE.Color('#f6ead6'); ALL.forEach(c => c.tint && c.tint.copy(CREAM));   // warm cream heads like the reference
  const toonPass = (t) => { for (const c of ALL) { if (!c.root.visible) continue; const ph = c.phase || 0; let sy = 1 + 0.028 * Math.sin(t * 5.5 + ph * 4), up = 0;
      if (c._walk) { up += 0.05 * Math.abs(Math.sin(c._walk * Math.PI * 1.9)); sy *= 1 + 0.06 * Math.sin(c._walk * Math.PI * 3.8); }
      if (c._talk) { up += 0.03 * clamp(c._talk); sy *= 1 + 0.06 * clamp(c._talk); }
      let take = false; for (const [tc, t0, jh = 1] of TAKES) if (tc === c && t >= t0 && t < t0 + 0.65) { take = jh > 0; if (!take) continue; const u = (t - t0) / 0.65;
        if (u < 0.12) sy *= 1 - 0.2 * (u / 0.12); else if (u < 0.78) { const v = (u - 0.12) / 0.66; up += 0.34 * Math.sin(Math.PI * v); sy *= 1 + 0.22 * Math.sin(Math.PI * v); c.head.scale.copy(c._hs).multiplyScalar(1 + 0.4 * Math.sin(Math.PI * v)); } else sy *= 1 - 0.16 * Math.sin(Math.PI * (u - 0.78) / 0.22); }
      c.root.position.y += up; c.root.scale.set(c.root.scale.x / Math.sqrt(sy), c.root.scale.y * sy, c.root.scale.z / Math.sqrt(sy)); c.root.updateMatrixWorld(true);
      if (take) { arm(c, 'Left', Lw(c, 0.42, 1.65, 0.12), dirW(c, 1, 0.2, -0.5)); arm(c, 'Right', Lw(c, -0.42, 1.65, 0.12), dirW(c, -1, 0.2, -0.5)); face(c, 'wide'); }
      if (c === DAVE && t > B.mock && t < B.rxn + 0.3) c.hm.material.uniforms.base.value.lerp(RED, 0.4 * clamp((t - B.mock) / 0.6)); } };
  // ---- comic FX drawn over the frame, anchored to 3-D points ----
  const INK = '#1a1014';
  const proj = (P) => { const p = P.clone().project(camera), d = camera.position.distanceTo(P); return { x: (p.x + 1) / 2 * WW, y: (1 - p.y) / 2 * HH, ok: p.z < 1 && p.z > -1 && d > 0.3, m: v => v * HH / (2 * Math.tan(camera.fov * Math.PI / 360) * d) }; };
  const starPath = (r1, r2, n) => { og.beginPath(); for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, r = i % 2 ? r2 : r1; og.lineTo(Math.cos(a) * r, Math.sin(a) * r); } og.closePath(); };
  const burst = (P, t0, t, text, col = '#ffd21f') => { const u = (t - t0) / 0.6; if (u < 0 || u > 1) return; const q = proj(P); if (!q.ok) return; const s = backOut(u / 0.35) * (1 - clamp((u - 0.75) / 0.25)), r = Math.min(q.m(0.42), 260 * K) * s;
    og.save(); og.translate(q.x, q.y); og.rotate(-0.12 + 0.3 * u); og.lineJoin = 'round'; og.fillStyle = '#ffffff'; starPath(r * 1.12, r * 0.62, 12); og.fill(); og.fillStyle = col; starPath(r, r * 0.55, 12); og.fill(); og.lineWidth = 6 * K; og.strokeStyle = INK; og.stroke();
    og.rotate(-0.3 * u); og.font = `${Math.round(r * 0.42)}px Anton, sans-serif`; og.textAlign = 'center'; og.textBaseline = 'middle'; og.lineWidth = r * 0.09; og.strokeStyle = INK; og.strokeText(text, 0, 0); og.fillStyle = '#e8442a'; og.fillText(text, 0, 0); og.restore(); };
  const emanata = (c, t0, t) => { const u = (t - t0) / 0.55; if (u < 0 || u > 1 || !c.root.visible) return; const q = proj(headC(c)); if (!q.ok) return; const r = q.m(0.3);
    og.save(); og.translate(q.x, q.y); og.strokeStyle = INK; og.lineWidth = 7 * K; og.lineCap = 'round'; for (let i = 0; i < 9; i++) { const a = -Math.PI * (0.05 + 0.9 * i / 8), r1 = r * (1.25 + 0.3 * u), r2 = r1 + r * 0.35 * (1 - u); og.beginPath(); og.moveTo(Math.cos(a) * r1, Math.sin(a) * r1); og.lineTo(Math.cos(a) * r2, Math.sin(a) * r2); og.stroke(); } og.restore(); };
  const cloud = (x, y, r, a) => { og.globalAlpha = a; const C = [[0, 0, 0.6], ...[0, 1, 2, 3, 4].map(i => { const b = i / 5 * Math.PI * 2; return [Math.cos(b) * 0.55, Math.sin(b) * 0.45, 0.45]; })];   // ink pass then white pass = outline only on the outside
    for (const [pass, col, w] of [[0, INK, 10 * K], [1, '#ffffff', 0]]) { og.fillStyle = col; og.beginPath(); for (const [cx, cy, cr] of C) { og.moveTo(x + cx * r + cr * r + w / 2, y + cy * r); og.arc(x + cx * r, y + cy * r, cr * r + w / 2, 0, 7); } og.fill(); } og.globalAlpha = 1; };
  const steam = (c, t) => { const q = proj(headC(c)); if (!q.ok) return; for (const sd of [-1, 1]) for (let j = 0; j < 3; j++) { const a = (t * 1.6 + j / 3 + (sd > 0 ? 0.15 : 0)) % 1; cloud(q.x + sd * q.m(0.3 + 0.15 * a), q.y - q.m(0.15 + 0.45 * a), q.m(0.06 + 0.07 * a), 1 - a); } };
  const drop = (x, y, r, rot) => { og.save(); og.translate(x, y); og.rotate(rot); og.fillStyle = '#6cc3ff'; og.strokeStyle = INK; og.lineWidth = 4 * K; og.beginPath(); og.moveTo(0, -r * 1.8); og.quadraticCurveTo(r * 1.1, -r * 0.2, 0, r); og.quadraticCurveTo(-r * 1.1, -r * 0.2, 0, -r * 1.8); og.fill(); og.stroke(); og.restore(); };
  const sweat = (c, t) => { const q = proj(headC(c)); if (!q.ok) return; for (let j = 0; j < 4; j++) { const a = (t * 1.8 + j / 4) % 1, sd = j % 2 ? 1 : -1; drop(q.x + sd * q.m(0.25 + 0.3 * a), q.y - q.m(0.25 + 0.25 * a - 0.6 * a * a), q.m(0.035), sd * (0.4 + a)); } };
  const star5 = (x, y, r, col) => { og.save(); og.translate(x, y); og.fillStyle = col; og.strokeStyle = INK; og.lineWidth = 4 * K; og.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; og.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } og.closePath(); og.fill(); og.stroke(); og.restore(); };
  const dizzy = (c, t) => { const h = headC(c).add(V(0, 0.36, 0)); for (let j = 0; j < 3; j++) { const a = t * 6 + j * 2.1, q = proj(h.clone().add(V(Math.cos(a) * 0.32, 0.05 * Math.sin(a), Math.sin(a) * 0.32))); if (q.ok) star5(q.x, q.y, q.m(0.07), '#ffd21f'); } };
  const sparkle = (c, t) => { const q = proj(headC(c)); if (!q.ok) return; for (let j = 0; j < 5; j++) { const a = j / 5 * Math.PI * 2 + 0.5, s = Math.max(0, Math.sin(t * 7 + j * 1.9)), x = q.x + Math.cos(a) * q.m(0.48), y = q.y + Math.sin(a) * q.m(0.42) - q.m(0.1), r = q.m(0.07) * s;
      og.save(); og.translate(x, y); og.fillStyle = j % 2 ? '#ffe14d' : '#ffffff'; og.strokeStyle = INK; og.lineWidth = 3 * K; og.beginPath(); for (let i = 0; i < 8; i++) { const b = i / 8 * Math.PI * 2, rr = i % 2 ? r * 0.25 : r; og.lineTo(Math.cos(b) * rr, Math.sin(b) * rr); } og.closePath(); og.fill(); og.stroke(); og.restore(); } };
  const shiverLines = (c, t) => { if (!c.root.visible) return; const q = proj(c.root.position.clone().add(V(0, 0.75, 0))); if (!q.ok) return; og.save(); og.strokeStyle = INK; og.lineWidth = 5 * K; og.lineCap = 'round';
    for (const sd of [-1, 1]) for (let j = 0; j < 2; j++) { const x = q.x + sd * (q.m(0.42 + 0.1 * j) + 3 * K * Math.sin(t * 60 + j)), r = q.m(0.12); og.beginPath(); og.arc(x - sd * r, q.y - q.m(0.15 * j), r, sd > 0 ? -0.7 : Math.PI - 0.7, sd > 0 ? 0.7 : Math.PI + 0.7); og.stroke(); } og.restore(); };
  const speed = (c, t) => { const P = c.root.position.clone().add(V(0, 0.7, 0)), q = proj(P), q2 = proj(P.clone().addScaledVector(dirW(c, 0, 0, 1), -0.6)); if (!q.ok || !q2.ok) return; let dx = q2.x - q.x, dy = q2.y - q.y; const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
    og.save(); og.strokeStyle = 'rgba(255,255,255,0.9)'; og.lineCap = 'round'; for (let j = 0; j < 6; j++) { const o = (j - 2.5) * q.m(0.12), s0 = q.m(0.35) + (j % 2) * q.m(0.1), len = q.m(0.5 + 0.25 * ((j * 7) % 3)) * (0.8 + 0.2 * Math.sin(t * 20 + j));
      const x0 = q.x + dx * s0 - dy * o, y0 = q.y + dy * s0 + dx * o; og.lineWidth = 9 * K; og.strokeStyle = INK; og.beginPath(); og.moveTo(x0, y0); og.lineTo(x0 + dx * len, y0 + dy * len); og.stroke(); og.lineWidth = 5 * K; og.strokeStyle = '#ffffff'; og.stroke(); } og.restore(); };
  const dust = (P, t0, t) => { const u = (t - t0) / 0.7; if (u < 0 || u > 1) return; for (let j = 0; j < 6; j++) { const a = j / 6 * Math.PI * 2, q = proj(P.clone().add(V(Math.cos(a) * (0.2 + 0.5 * u), 0.1 + 0.15 * u, Math.sin(a) * (0.2 + 0.5 * u) * 0.5))); if (q.ok) { og.globalAlpha = 1 - u; og.fillStyle = '#e9dcc4'; og.strokeStyle = INK; og.lineWidth = 4 * K; og.beginPath(); og.arc(q.x, q.y, q.m(0.08 + 0.1 * u), 0, 7); og.fill(); og.stroke(); og.globalAlpha = 1; } } };
  const fxPass = (t) => {
    const W3 = V(-3.2, FY + 1.6, ZB + 0.45), W6 = V(-6.2, FY + 1.6, ZB + 0.45);
    if (t < B.pitch && t > B.yank + 0.3) [THUA, TI, ...XS, ...(t < B.mock ? [DAVE] : [])].forEach(c => shiverLines(c, t));
    if (t > B.open + 0.4) [THUA, TI, XR, XY].forEach(c => shiverLines(c, t));
    for (const [c, t0] of TAKES) emanata(c, t0 + 0.05, t);
    if (t > B.inface - 0.2 && t < B.rxn + 0.6) steam(DAVE, t);
    if ((t > B.mock + 0.1 && t < B.inface - 0.15) || (t > B.morn + 0.1 && t < B.open - 0.6)) speed(DAVE, t);
    if (t > B.blank + 0.1 && t < B.aud) sweat(DAVE, t);
    if (t > B.stumble + 1.1 && t < B.morn) dizzy(DAVE, t);
    if (t > B.open + 0.8 && t < B.kev) sparkle(DAVE, t);
    if (t > B.kev + 0.6) sparkle(KEV, t);
    burst(W3, B.yank + 0.02, t, 'YANK!', '#7fd4ff'); burst(W3, B.slam1, t, 'SLAM!'); burst(W6, B.slam2, t, 'SLAM!');
    burst(V(DX + 0.75, FY + 0.2, -24.9), B.blank + 0.55, t, 'CLANK!', '#d9e2ea'); burst(GREEN.root.position.clone().add(V(0, 0.3, 0.6)), B.plant + 0.45, t, 'THUD!', '#ffb02e'); dust(GREEN.root.position.clone().add(V(0, 0, 0.7)), B.plant + 0.45, t);
    if (DAVE.root.visible) { burst(headC(DAVE).add(V(0.15, 0.4, 0)), B.ana + 0.6, t, 'FLOMP!', '#8fdc6a'); burst(headC(DAVE).add(V(0, 0.3, -0.2)), B.stumble + 1.1, t, 'BONK!'); }
    burst(W3, B.open + 0.02, t, 'WHOOSH!', '#7fd4ff'); };
  // ---- word-by-word captions drawn in frame (pop in, keywords in colour) ----
  const WORDS = T.lines.flatMap(l => l.words);
  const KEYW = /JANUARY|FREEZING|PENGUINS|THREE|ELEVEN|WINDOW|FORGOT|CARBON|DIOXIDE|FOURTEEN|HUNDRED|HALF|HARVARD|SLEEPING|MATH|HIMSELF|BREATH|EVERY/;
  const caption = (t) => { let i = -1; for (let k = 0; k < WORDS.length; k++) if (t >= WORDS[k].t - 0.03) i = k; if (i < 0) return; const w = WORDS[i], nx = WORDS[i + 1], end = nx ? Math.min(nx.t - 0.03, w.t + 0.9) : w.t + 0.9; if (t > end) return;
    const txt = w.w.replace(/["“”]/g, '').replace(/\.\.\.$/, '.'), hot = false, p = backOut((t - w.t + 0.03) / 0.13), sz = 104;
    og.save(); og.translate(WW / 2, HH * 0.72); og.scale(K * (0.65 + 0.35 * p), K * (0.65 + 0.35 * p)); og.font = `${sz}px InterB, sans-serif`; og.textAlign = 'center'; og.textBaseline = 'middle'; og.lineJoin = 'round';
    const k = Math.min(1, 940 / og.measureText(txt).width); og.scale(k, k); og.lineWidth = sz * 0.2; og.strokeStyle = '#111'; og.strokeText(txt, 0, 0); og.fillStyle = '#ffffff'; og.fillText(txt, 0, 0); og.restore(); };

  const frame = (t) => {
    T0 = t; shakeAmt = 0;
    resetScene(); OUTF.forEach(c => (c.root.visible = false)); ex.forEach(c => (c.root.visible = false)); ALL.forEach(c => { c.root.scale.setScalar(SC); c._walk = 0; c._talk = 0; c._hs ??= c.head.scale.clone(); c.head.scale.copy(c._hs); });
    [bag, mug, stick].forEach(o => (o.visible = false)); bubbles.concat(vapor, pops, zs).forEach(b => (b.visible = false)); papers.forEach(p => (p.visible = false));
    dof(0, 0); haze(0);
    const morning = t >= B.morn, winter = t < B.pitch;
    grade(morning ? 'morning' : winter ? 'cold' : 'stale');
    sashOpen(0, W_OPEN[0](t)); sashOpen(1, W_OPEN[1](t)); updSnow(t, W_OPEN, gust); snow.visible = winter || morning;
    drawWin(t, morning); setClock(t < B.clock ? 9.2 + t * 0.002 : t < B.pitch ? lerp(11, 15, eio(seg(t, B.clock, B.pitch))) : 15 + (t - B.pitch) * 0.01);
    drawWB(t >= B.ana && !morning ? 'math' : t >= B.pitch && !morning ? 'pitch' : 'todo');

    if (winter) {
      // ===== morning, windows open =====
      const coldK = 1; extras(t, t > B.yank + 0.3);
      // coworkers at their desks
      const shiver = t > B.yank + 0.3;
      [[THUA, DESK.thua], [TI, DESK.ti]].forEach(([c, x], i) => { stand(c, x, CHZ, 0.15 * (i ? -1 : 1), t + i); if (shiver) { hug(c, t + i * 0.3); mood(c, Math.sin(t * 38 + i) > 0 ? 'cold_t' : 'cold', t); } else { type(c, t + i); mood(c, 'calm', t); } chill(c, shiver ? coldK : 0); });
      // Kevin
      if (t < B.grab) { const p = walk(KEV, [V(-4.9, 0, -24.15), V(-3.2, 0, WZ)], 0.05, B.grab - 0.05, t, 1.5); holdMug(KEV, t); mood(KEV, 'calm', t); }
      else if (t < B.shut) { const turnK = eio(seg(t, B.turn, B.turn + 0.45)), toDave = t >= B.reply ? 0.75 : t >= B.mock ? yawTo(-3.2, WZ, -1.9, -24.6) : 0.2, ry = t < B.turn ? Math.PI : lerp(Math.PI, toDave + (toDave < 0 ? 2 * Math.PI : 0), turnK) ;
        stand(KEV, -3.2, WZ, ry, t);
        if (t < B.turn) { const crouch = eio(seg(t, B.grab, B.yank)) * (1 - eio(seg(t, B.yank, B.yank + 0.15))); hips(KEV, -0.06 * crouch); windowGrab(KEV, t < B.yank ? 0.05 - 0.05 * crouch : eio(seg(t, B.yank, B.yank + 0.2))); squash(KEV, t > B.yank && t < B.yank + 0.25 ? -0.06 * Math.sin(seg(t, B.yank, B.yank + 0.25) * Math.PI) : 0.04 * crouch); mood(KEV, 'calm', t); }
        else { const sip = t > B.reply && t < B.reply + 1.0 ? Math.sin(seg(t, B.reply, B.reply + 1.0) * Math.PI) : 0; holdMug(KEV, t, sip);
          if (t >= wt('reply', 'trust') - 0.05 && t < E('reply') + 0.1) speak(KEV, t, 'smugt', 'smug'); else mood(KEV, t < B.mock ? 'calm' : 'smug', t); }
        chill(KEV, 0.2); }
      else { stand(KEV, -5.1, CHZ + 0.1, 0.6, t); holdMug(KEV, t, 0); mood(KEV, 'smug', t); }
      // Dave
      if (t < B.mock) { stand(DAVE, DESK.dave, CHZ, 0, t); if (shiver) { hug(DAVE, t); mood(DAVE, Math.sin(t * 41) > 0 ? 'cold_t' : 'cold', t); } else { type(DAVE, t); mood(DAVE, 'calm', t); } chill(DAVE, shiver ? coldK : 0); }
      else if (t < B.shut) { const P = [V(1.4, 0, -24.15), V(-1.85, 0, -24.6)], a = walk(DAVE, P, B.mock + 0.1, B.inface - 0.15, t, 1.7); chill(DAVE, 0.7);
        if (t > B.inface - 0.15) { place(DAVE, -1.85, -24.6, yawTo(-1.85, -24.6, -3.2, WZ), FY); idle(DAVE, t); DAVE.root.rotation.x = 0.1; jab(DAVE, t);
          if (t >= wt('mock', 'close') - 0.05) speak(DAVE, t, 'angry_t', 'angry'); else mood(DAVE, 'angry', t); if (t > B.rxn && t < B.shut) { DAVE.root.rotation.y = yawTo(-1.85, -24.6, -3.0, -23.6); DAVE.root.updateMatrixWorld(true); mood(DAVE, t < B.rxn + 0.3 ? 'wide' : 'squint', t); headTurn(DAVE, 0.08 * Math.sin(t * 40) * seg(t, B.rxn, B.rxn + 0.2), 0); } }
        else { DAVE.root.rotation.x = 0.12; mood(DAVE, 'angry', t); arm(DAVE, 'Left', Lw(DAVE, 0.32, 0.85, 0.1)); arm(DAVE, 'Right', Lw(DAVE, -0.32, 0.85, 0.1)); } }
      else { const w = t < B.cut2 ? 1 : 0, k = w ? eio(seg(t, B.slam1 - 0.25, B.slam1)) : eio(seg(t, B.slam2 - 0.25, B.slam2)); stand(DAVE, WIN[w], WZ, Math.PI, t); windowGrab(DAVE, 0.75 - 0.6 * k); hips(DAVE, -0.04 * k); mood(DAVE, 'angry', t); chill(DAVE, 0.5);
        if (t > B.clock - 0.2) { place(DAVE, -6.2, WZ, lerp(Math.PI, 0.3, eio(seg(t, B.clock - 0.2, B.clock + 0.2))), FY); idle(DAVE, t); arm(DAVE, 'Left', Lw(DAVE, 0.12, 0.95, 0.3)); arm(DAVE, 'Right', Lw(DAVE, -0.12, 0.95, 0.3)); mood(DAVE, 'smug', t); } }
      // breath vapour, papers
      if (shiver) breath(vapor, 0, [THUA, TI, DAVE, KEV], t, 1.1, 0.9, 'vapor');
      flyPapers(t, B.yank + 0.1, [V(-2.1, 0, ZD), V(-6.2, 0, ZD), V(2.1, 0, ZD)]);
      popOver(0, THUA, B.yank + 0.35, B.freeze + 0.8, t); popOver(1, TI, B.yank + 0.5, B.freeze + 0.8, t);

      // ---- shots ----
      if (t < B.grab) { const u = eio(seg(t, 0, B.grab)); cam(V(lerp(-0.6, -1.7, u), lerp(3.6, 2.2, u), lerp(-19.0, -21.2, u)), V(lerp(-3.0, -3.6, u), lerp(1.2, 1.35, u), -24.6), 48); dof(lerp(6, 4, u), 0.003); }   // A1 crane down: office, Kevin crosses to the window
      else if (t < B.turn) { const u = eio(seg(t, B.grab, B.turn)); shakeAt(t, B.yank + 0.05, 0.4, 0.035); cam(V(lerp(-2.25, -2.45, u), lerp(1.55, 1.6, u), lerp(-23.5, -23.85, u)), V(-3.25, 1.6, ZB + 0.2), 44); dof(2.2, 0.006); }   // A2 behind him: grab… YANK
      else if (t < B.freeze) { const u = eio(seg(t, B.turn, B.freeze)), h = headC(KEV); cam(V(-3.65, lerp(1.5, 1.55, u), lerp(-23.0, -23.55, u)), h.clone().add(V(0, -0.1, 0)), 40); dof(lerp(2.3, 1.8, u), 0.01); }   // A3 front: deadpan turn, snow blowing past
      else if (t < B.whipB) { const u = eio(seg(t, B.freeze, B.whipB)), h = headC(THUA); cam(V(-1.15 + 0.1 * u, 1.5, -22.35 - 0.15 * u), h.clone().add(V(0, 0.02, 0)), 40); dof(1.35, 0.012); }   // B1 Thua: chattering teeth
      else if (t < B.mock) { const A = headC(TI), Bh = headC(DAVE); cam(V(4.2, 1.85, -21.9), whip(t, B.whipB + 0.12, A, Bh).add(V(0, -0.1, 0)), 36, t > B.whipB + 0.12 && t < B.whipB + 0.38 ? 0.05 : 0); dof(2.3, 0.008); }   // B2 Ti → whip → Dave shivering
      else if (t < B.inface) { const p = DAVE.root.position; cam(V(p.x + 0.4, 1.85, -22.2), V(p.x - 0.3, 1.25, p.z), 44); dof(2.2, 0.006); }   // C1 Dave storms over
      else if (t < B.reply) { const u = eio(seg(t, B.inface, B.reply)); cam(V(-4.4 + 0.15 * u, 1.35, -24.5 - 0.05 * u), V(-1.85, 1.55, -24.6), 40); dof(2.5, 0.007); }   // C2 two-shot, low: Dave in his face
      else if (t < B.rxn) { const u = eio(seg(t, B.reply, B.rxn)), h = headC(KEV), f = dirW(KEV, 0, 0, 1); cam(V(lerp(-2.45, -2.65, u), 1.5, lerp(-23.7, -24.0, u)), h.clone().add(V(0, -0.1, 0)), 36); dof(h.distanceTo(camera.position), 0.012); }   // D1 Kevin sips… "Trust me"
      else if (t < B.shut) { const h = headC(DAVE), f = dirW(DAVE, 0, 0, 1); cam(V(-3.0, 1.55, -23.6), h.clone().add(V(0, -0.05, 0)), 34, 0.04); dof(1.0, 0.014); }   // D2 Dave: eye twitch
      else if (t < B.cut2) { shakeAt(t, B.slam1, 0.35, 0.05); cam(V(-1.75, 1.7, -24.75), V(-3.4, 1.55, ZB + 0.35), 50); dof(1.8, 0.005); }   // E1 SLAM
      else if (t < B.clock) { shakeAt(t, B.slam2, 0.35, 0.05); cam(V(-4.75, 1.7, -24.75), V(-6.4, 1.55, ZB + 0.35), 50); dof(1.8, 0.005); }   // E1b SLAM #2
      else { const u = eio(seg(t, B.clock, B.pitch)); cam(V(-0.8 + 0.1 * u, FY + 2.95, ZB + 1.25 - 0.25 * u), CLK.clone(), 38); dof(1.1, 0.01); }   // E2 clock time-lapse
    }
    else if (!morning) {
      // ===== 3 pm pitch; room sealed, air goes stale =====
      haze(Math.min(0.78, 0.12 + seg(t, B.pitch, B.ppm) * 0.35 + seg(t, B.ppm, B.study) * 0.3));
      const sleepy = seg(t, B.blank + 0.6, B.blank + 1.6);
      const AUD = [[KEV, 0.35, -24.05], [THUA, 1.0, -23.75], [TI, 3.45, -23.75], [GREEN, 4.15, -24.1], [XR, -0.35, -24.55], [XP, 2.45, -23.4], [XT, 4.8, -24.65], [XY, 5.1, -23.7]];
      AUD.forEach(([c, x, z], i) => { stand(c, x, z, yawTo(x, z, DX + 0.6, ZB + 0.75), t + i);
        if (c === KEV) { holdMug(KEV, t, t > B.plant + 0.9 && t < B.plant + 2.0 ? Math.sin(seg(t, B.plant + 0.9, B.plant + 2.0) * Math.PI) : 0); mood(KEV, 'smug', t); return; }
        if (t < B.blank) { mood(c, 'listen', t); headTurn(c, 0, 0.12 * Math.max(0, Math.sin(t * 3 + i))); return; }   // nodding along
        if (c === TI && t > B.aud + 0.4 && t < B.aud + 1.7) { const y = Math.sin(seg(t, B.aud + 0.4, B.aud + 1.7) * Math.PI); mood(c, 'yawn', t); arm(c, 'Left', Lw(c, 0.35, 1.3 + 0.9 * y, 0.05)); arm(c, 'Right', Lw(c, -0.35, 1.3 + 0.9 * y, 0.05)); squash(c, -0.06 * y); return; }
        if (c === GREEN && t > B.plant) { const f = eio(seg(t, B.plant, B.plant + 0.45)); c.root.rotation.x = 1.5 * f * f; mood(c, 'sleep', t); if (f >= 1) { arm(c, 'Left', Lw(c, 0.3, 1.5, 0.1)); arm(c, 'Right', Lw(c, -0.3, 1.5, 0.1)); } shakeAt(t, B.plant + 0.45, 0.25, 0.02); return; }   // FACEPLANT
        mood(c, sleepy > 0.5 ? 'sleep' : 'calm_b', t); doze(c, t, sleepy, i); if (sleepy > 0.8 && t > B.ppm) zOver(c, i, t); });
      // Dave at the board
      const ana = t >= B.ana;
      if (!ana) { const hero = t >= B.hero && t < B.blank, k = t < B.blank ? 1 : 1 - eio(seg(t, B.blank, B.blank + 0.9));
        stand(DAVE, DX, ZB + 0.75, t < B.blank ? 0.2 + 0.2 * Math.sin(t * 1.7) : 0.15, t);
        if (t < B.blank) { const a = Math.sin(t * 4.2), b2 = Math.sin(t * 3.4 + 1); arm(DAVE, 'Right', Lw(DAVE, -0.45 - 0.15 * a, 1.25 + 0.25 * b2, 0.35), dirW(DAVE, -1, 0, -0.3)); const tapK = hero ? Math.pow(Math.max(0, Math.sin((t - B.hero) * Math.PI / 0.4)), 4) : 0; const hp = Lw(DAVE, 0.42, 1.45 + 0.1 * Math.sin(t * 3), 0.15); arm(DAVE, 'Left', hp, dirW(DAVE, 1, 0, 0));
          aimStick(hp, V(DX + 1.4 + 0.25 * Math.sin(t * 2), FY + 2.1 + 0.25 * tapK, ZB + 0.25)); squash(DAVE, 0.03 * Math.sin(t * 8)); speak(DAVE, t, 'talk', 'calm'); }
        else { const drop = seg(t, B.blank, B.blank + 0.9); arm(DAVE, 'Right', Lw(DAVE, -0.45 + 0.2 * drop, 1.5 - 0.6 * eio(drop), 0.35)); const hp = Lw(DAVE, 0.42, 1.45 - 0.5 * eio(drop), 0.15); arm(DAVE, 'Left', hp, dirW(DAVE, 1, 0, 0));
          const fall = seg(t, B.blank + 0.25, B.blank + 0.6); if (fall < 1) aimStick(hp.clone().lerp(V(DX + 0.4, FY + 0.02, -24.9), fall * fall), V(DX + 1.1, FY + 0.6 - 0.6 * fall, -24.9)); else { stick.visible = true; stick.position.set(DX + 0.75, FY + 0.02, -24.9); stick.rotation.set(0, 0, Math.PI / 2); }
          if (t < B.why) mood(DAVE, 'pale', t); else { const br = Math.sin(t * 5.5); hips(DAVE, 0.015 * br); mood(DAVE, br > 0.3 ? 'palet' : 'pale', t); } } }
      else { // sleeping bag drops on his head, then he stumbles about
        const drop = seg(t, B.ana + 0.2, B.ana + 0.6), land = t > B.ana + 0.6, st = t > B.stumble, s = (t - B.stumble);
        const x = 2.2 + (st ? 0.45 * Math.sin(s * 2.2) : 0), z = ZB + 0.85 + (st ? 0.25 * Math.sin(s * 3.1) : 0), bonk = B.stumble + 1.1;
        stand(DAVE, x, z, st ? Math.sin(s * 2.6) * 0.9 : 0, t); if (st) { DAVE.root.rotation.z = 0.12 * Math.sin(s * 5); waveArms(DAVE, t); } else { const jolt = land ? eio(seg(t, B.ana + 0.6, B.ana + 0.8)) : 0; arm(DAVE, 'Left', Lw(DAVE, 0.4, 1.0 + 0.8 * jolt, 0.2)); arm(DAVE, 'Right', Lw(DAVE, -0.4, 1.0 + 0.8 * jolt, 0.2)); }
        const h = headC(DAVE); bag.visible = true; bag.position.copy(h).add(V(0, 0.1 + 2.2 * (1 - drop * drop), 0)); bag.rotation.set(0, DAVE.root.rotation.y + 0.35, DAVE.root.rotation.z); const sq = land ? Math.sin(seg(t, B.ana + 0.6, B.ana + 0.9) * Math.PI) * 0.15 : 0; bag.scale.set(1 + sq, 1 - sq, 1 + sq);
        bag.pull.position.y = -0.25 + 0.45 * eio(seg(t, B.ana + 0.9, B.ana + 1.3)); if (land) squash(DAVE, 0.08 * Math.sin(seg(t, B.ana + 0.6, B.ana + 0.85) * Math.PI)); shakeAt(t, B.ana + 0.6, 0.2, 0.02); shakeAt(t, bonk, 0.3, 0.05); }
      // CO₂
      if (t >= B.why && t < B.ppm) breath(bubbles, 0, t < B.aud ? [DAVE] : [THUA, TI, GREEN, KEV], t, 1.4, 1.6, 'co2');
      if (t >= B.ppm) { breath(bubbles, 0, [DAVE, THUA, TI, KEV], t, 1.4, 1.6, 'co2'); fill(Math.round(10 + 110 * seg(t, B.ppm, B.study)), t); }

      // ---- shots ----
      if (t < B.hero) { const u = eio(seg(t, B.pitch, B.hero)); cam(V(lerp(1.0, 1.4, u), 1.85, lerp(-21.6, -22.4, u)), V(2.0, 1.75, ZB + 0.6), 46); dof(lerp(3.7, 2.9, u), 0.005); }   // F1 over the audience
      else if (t < B.blank) { const u = eio(seg(t, B.hero, B.blank)); cam(V(lerp(2.0, 1.85, u), lerp(0.95, 1.0, u), lerp(-23.9, -24.15, u)), V(1.75, 1.8, ZB + 0.6), 50); dof(1.4, 0.007); }   // F2 low hero, pointer taps the chart
      else if (t < B.why) { const u = eio(seg(t, B.blank, B.why)), dz = lerp(0.9, 2.2, u), fov = 2 * Math.atan(0.36 / dz) * 180 / Math.PI, h = headC(DAVE); cam(h.clone().add(V(0, 0.02, dz)), h.clone().add(V(0, -0.05, 0)), fov, -0.08 * u); dof(dz, 0.014); }   // G dolly-zoom: blank
      else if (t < B.aud) { const u = eio(seg(t, B.why, B.aud)), h = headC(DAVE); cam(h.clone().add(V(1.05 - 0.15 * u, 0.05, 0.8 + 0.1 * u)), h.clone().add(V(0.1, -0.05, 0.35)), 40); dof(1.35, 0.008); }   // H1 profile: CO₂ puffs
      else if (t < B.ppm) { DAVE.root.visible = false; const u = eio(seg(t, B.aud, B.ppm)); cam(V(2.2, 1.6, -25.65), V(lerp(3.7, 2.4, u), 1.5, -23.9), 50); dof(1.9, 0.006); }   // H2 audience from Dave's spot
      else if (t < B.top) { const u = eio(seg(t, B.ppm, B.top)); cam(V(lerp(-2.6, -1.0, u), lerp(3.6, 4.0, u), lerp(-18.6, -19.4, u)), V(1.6, 1.2, -24.0), 44); }   // I1 high wide: filling up
      else if (t < B.study) { const u = (t - B.top) / (B.study - B.top), a = -0.6 + 0.9 * u; cam(V(2.2 + 3.0 * Math.sin(a), 3.7, -24.4 + 3.0 * Math.cos(a)), V(2.2, 1.0, -24.4), 52); }   // I2 orbit from above
      else if (t < B.ana) { DAVE.root.visible = false; stick.visible = false; const u = seg(t, B.study, B.ana); cam(V(2.2, 1.6, -25.65), V(lerp(3.9, 0.5, eio(u)), 1.5, -23.9), 50); dof(1.9, 0.006); }   // J pan: nodding off, faceplant, Kevin awake
      else if (t < B.stumble) { const u = eio(seg(t, B.ana, B.stumble)); cam(V(2.2, lerp(1.85, 1.9, u), lerp(-22.1, -22.4, u)), V(2.2, 1.8, ZB + 0.6), 46); dof(3.0, 0.005); }   // K1 the bag drops
      else { const u = eio(seg(t, B.stumble, B.morn)); cam(V(2.2, 2.0, lerp(-20.8, -21.3, u)), V(2.2, 1.9, ZB + 0.5), 52); dof(3.6, 0.004); }   // K2 stumbling vs "2 + 2 = ?"
    }
    else {
      // ===== next morning: payoff =====
      extras(t, t > B.open + 0.4);
      const P = [V(1.6, 0, -21.6), V(0.15, 0, -22.1), V(-0.2, 0, -24.2)];
      [[THUA, DESK.thua], [TI, DESK.ti]].forEach(([c, x], i) => { stand(c, x, CHZ, 0.15, t + i); if (t < B.open + 0.4) { type(c, t + i); mood(c, 'calm', t); } else { hug(c, t + i * 0.3, 0.6); mood(c, Math.sin(t * 38 + i) > 0 ? 'cold_t' : 'cold', t); chill(c, 0.6); } });
      const walkEnd = B.open - 0.6;
      if (t < walkEnd) { walk(DAVE, P, B.morn + 0.1, walkEnd + 0.15, t, 1.4); mood(DAVE, 'serious', t); DAVE.root.rotation.x = 0.06; }
      else { stand(DAVE, -3.2, WZ, t < B.open + 0.45 ? Math.PI : lerp(Math.PI, 0.15, eio(seg(t, B.open + 0.45, B.open + 0.9))), t);
        if (t < B.open + 0.45) { windowGrab(DAVE, t < B.open ? 0.05 : eio(seg(t, B.open, B.open + 0.2))); mood(DAVE, 'serious', t); }
        else { const br = eio(seg(t, B.open + 0.8, B.open + 1.4)); arm(DAVE, 'Left', Lw(DAVE, 0.75 * br + 0.2, 1.0 + 0.9 * br, 0.1), dirW(DAVE, 1, 0.2, -0.5)); arm(DAVE, 'Right', Lw(DAVE, -0.75 * br - 0.2, 1.0 + 0.9 * br, 0.1), dirW(DAVE, -1, 0.2, -0.5)); squash(DAVE, -0.05 * br); mood(DAVE, br > 0.5 ? 'bliss' : 'calm', t); } }
      const KP = V(-1.05, 0, -22.2), dp = DAVE.root.position, kr = t < B.kev ? yawTo(KP.x, KP.z, dp.x, dp.z) : lerp(yawTo(KP.x, KP.z, dp.x, dp.z), 0.15, eio(seg(t, B.kev, B.kev + 0.5)));
      stand(KEV, KP.x, KP.z, kr, t); const toast = eio(seg(t, B.kev + 0.6, B.kev + 1.0)); holdMug(KEV, t, 0.35 * toast); mood(KEV, t < B.open ? (t > B.morn + 1.2 ? 'wide' : 'calm') : 'smug', t);
      if (t > B.morn + 1.0 && t < B.morn + 2.0) popOver(0, KEV, B.morn + 1.0, B.morn + 2.0, t);
      if (t > B.open) breath(vapor, 0, [THUA, TI, DAVE], t, 1.1, 0.9, 'vapor');
      flyPapers(t, B.open + 0.1, [V(-2.1, 0, ZD), V(2.1, 0, ZD)]);
      // shots
      if (t < B.open - 0.6) { const u = eio(seg(t, B.morn, B.open - 0.6)), h = headC(DAVE); cam(V(lerp(2.8, 0.3, u), 1.6, lerp(-19.3, -19.9, u)), h.clone().add(V(0, -0.25, 0)), 44); dof(h.distanceTo(camera.position), 0.004); }   // L1 tracking: straight past Kevin
      else if (t < B.kev) { const u = eio(seg(t, B.open - 0.6, B.kev)); shakeAt(t, B.open + 0.05, 0.35, 0.03); cam(V(lerp(-2.75, -2.95, u), lerp(1.45, 1.5, u), lerp(-23.3, -23.0, u)), V(-3.2, 1.65, ZB + 0.3), 44); dof(2.2, 0.006); }   // L2 he flings it open, breathes in
      else { const u = eio(seg(t, B.kev, DUR)), h = headC(KEV); cam(V(KP.x + 0.15, 1.45, KP.z + lerp(1.9, 1.55, u)), h.clone().add(V(0, -0.02, 0)), 38); dof(lerp(1.9, 1.55, u), 0.012); }   // M Kevin to camera: toast
    }

    toonPass(t);
    for (const sh of SHAFTS) { const c = camera.position; sh.visible = !(Math.abs(c.x - sh.userData.x) < 1.7 && c.z < ZB + 5.8 && c.y < FY + 3.3); }
    ALL.forEach(c => SR.updateLimbs(c));
    const f = V(0, 1, -23); sun.target.position.copy(f); sun.position.copy(f).addScaledVector(SUNDIR, 60); const sc = sun.shadow.camera; sc.left = sc.bottom = -12; sc.right = sc.top = 12; sc.near = 1; sc.far = 140; sc.updateProjectionMatrix();
    U.uTime.value = t; post.render();
    // ---- overlay ----
    og.clearRect(0, 0, WW, HH); og.drawImage(canvas, 0, 0);
    card('JANUARY', wt('hook', 'january') - 0.1, B.freeze, t, 300, 150, '#bfe3ff');
    card('-8°C OUTSIDE', S('freeze'), B.mock, t, 300, 120, '#bfe3ff');
    card('11:00 AM', S('shut') - 0.05, B.clock + 0.4, t, 300, 130);
    card('3:00 PM', B.clock + 0.9, wt('pitch', 'biggest'), t, 300, 140);
    card('?!', wt('blank', 'forgot'), B.why, t, 330, 200, '#ffffff', 0.05);
    ppm(B.ppm + 0.05, B.study, t);
    card('HARVARD STUDY', S('study') - 0.05, B.ana, t, 95, 80, '#ffffff', 0);
    graph(wt('study', 'harvard') + 0.2, B.ana, t);
    card('NEXT MORNING', B.morn, wt('end', 'dave') + 0.2, t, 300, 120);
    card('TOLD YOU.', B.kev + 0.7, DUR + 1, t, 210, 150, '#ffe36b', -0.05);
    fxPass(t); caption(t);
    flash(t, B.yank + 0.02); flash(t, B.open + 0.02); flash(t, B.morn, 0.18);
    return out.toDataURL('image/jpeg', 0.92);
  };
  window.frame = frame; window.DUR = DUR; window.ready = true;
}
