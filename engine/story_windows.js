// "He Opened Every Window in January" — 41 s RicksClips-formula short on the office set.
// odd act (windows open in winter) → mockery ("we're not penguins") → disaster (Dave blanks at 3 pm) → science (CO₂ ppm) + analogy → loop.
// Timings: film/story_windows.json (shorts/open-windows/timing.json). Run: XQ="&viewer=1&story=windows" node render.cjs out/windows.mp4 1080 1920 30
export default async function story(ctx) {
  const { THREE, SR, scene, camera, renderer, canvas, post, U, hemi, sun, SUNDIR, WW, HH, O, Z, FY, OUTF, thua, ti, ex, ALL,
    V, clamp, eio, lerp, place, idle, face, arm, Lw, dirW, look, headC, yawTo, hips, headTurn, resetScene, setLook } = ctx;

  // ---------- timing ----------
  const T = await (await fetch('./film/story_windows.json')).json();
  const LN = Object.fromEntries(T.lines.map(l => [l.id, l])), S = id => LN[id].start, E = id => LN[id].end, DUR = T.duration;
  const wt = (id, w) => { const x = LN[id].words.find(k => k.w.toLowerCase().replace(/[^a-z0-9']/g, '').startsWith(w)); return x ? x.t : S(id); };
  const cut = id => S(id) - 0.12;   // cut a hair before each line starts

  // ---------- cast ----------
  const KEV = OUTF[0], DAVE = OUTF[1], CO = [thua, ti, ex[4]];
  const ZB = Z - 6, ZD = Z - 2.9, CHZ = ZD - 0.55;
  const DESK = { kev: -6.2, co0: -2.1, dave: 2.1, co1: 6.2 };
  const WIN = [-6.2, -3.2];

  // ---------- set dressing ----------
  O.children.filter(o => /chair/i.test(o.name)).forEach(o => (o.visible = false));   // standing desks
  O.children.forEach(o => { if (Math.abs(o.position.z - ZD) < 0.01 && o.position.y > FY + 0.5 && /computerScreen|laptop/.test(o.name)) o.rotation.y = Math.PI; });   // screens face the people
  // winter sky in the windows
  O.children.forEach(o => { const p = o.geometry?.parameters; if (o.isMesh && p && p.width === 2.4 && p.height === 1.8) o.material.color.setRGB(0.86, 0.92, 1.0); });
  // sliding lower sashes
  const glassM = new THREE.MeshStandardMaterial({ color: '#cfe6ff', transparent: true, opacity: 0.35, roughness: 0.1, metalness: 0 });
  const frameM = new THREE.MeshStandardMaterial({ color: '#f7f5f0', roughness: 0.6 });
  const sashes = WIN.map(x => { const g = new THREE.Group(); const gl = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.9, 0.02), glassM); g.add(gl);
    for (const [w, h, px, py] of [[2.4, 0.07, 0, 0.45], [2.4, 0.07, 0, -0.45], [0.07, 0.95, -1.17, 0], [0.07, 0.95, 1.17, 0]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.06), frameM); b.position.set(px, py, 0.01); g.add(b); }
    g.position.set(x, FY + 1.85, ZB + 0.24); O.add(g); return g; });
  const sashOpen = (i, k) => (sashes[i].position.y = FY + 1.85 + 0.85 * k);
  // whiteboard screen (canvas)
  const wbC = document.createElement('canvas'); wbC.width = 1024; wbC.height = 480; const wg = wbC.getContext('2d'); const wbT = new THREE.CanvasTexture(wbC); wbT.colorSpace = THREE.SRGBColorSpace;
  const wb = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 1.5), new THREE.MeshStandardMaterial({ map: wbT, roughness: 0.5 })); wb.position.set(2.2, FY + 2.4, ZB + 0.2); O.add(wb);
  let wbMode = '';
  const drawWB = (mode) => { if (mode === wbMode) return; wbMode = mode; wg.fillStyle = '#fbfbf8'; wg.fillRect(0, 0, 1024, 480); wg.textAlign = 'center';
    if (mode === 'pitch') { wg.fillStyle = '#1d3c8f'; wg.font = 'bold 74px InterB, sans-serif'; wg.fillText('Q4 MEGA PITCH', 512, 100);
      const bars = [[180, 120, '#e8442a'], [360, 200, '#f2b02c'], [540, 290, '#2fa36b'], [720, 360, '#3d7be0']]; for (const [x, h, c] of bars) { wg.fillStyle = c; wg.fillRect(x, 440 - h, 110, h); }
      wg.strokeStyle = '#222'; wg.lineWidth = 8; wg.beginPath(); wg.moveTo(150, 445); wg.lineTo(880, 445); wg.stroke();
      wg.strokeStyle = '#e8442a'; wg.lineWidth = 10; wg.beginPath(); wg.moveTo(230, 300); wg.lineTo(410, 220); wg.lineTo(600, 140); wg.lineTo(790, 70); wg.stroke(); }
    else if (mode === 'math') { wg.fillStyle = '#222'; wg.font = 'bold 210px InterB, sans-serif'; wg.fillText('2 + 2 = ?', 512, 320); }
    else { wg.strokeStyle = '#e8442a'; wg.lineWidth = 8; wg.beginPath(); wg.moveTo(150, 140); wg.lineTo(500, 140); wg.stroke(); wg.strokeStyle = '#3d7be0'; wg.beginPath(); wg.moveTo(300, 250); wg.lineTo(800, 250); wg.stroke(); }
    wbT.needsUpdate = true; };

  // sleeping bag over Dave's head (the analogy)
  const bag = new THREE.Group(); { const m = new THREE.MeshStandardMaterial({ color: '#4f8a3c', roughness: 0.85 });
    const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.29, 0.22, 8, 24), m); b.scale.set(1, 1, 0.9); bag.add(b);
    const ink = new THREE.Mesh(b.geometry, new THREE.MeshBasicMaterial({ color: '#2a1612', side: THREE.BackSide })); ink.scale.setScalar(1.04); b.add(ink);
    const zip = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.6, 0.02), new THREE.MeshStandardMaterial({ color: '#f2cf2c' })); zip.position.set(0.12, 0, 0.27); zip.rotation.z = 0.05; bag.add(zip);
    const pull = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.03), new THREE.MeshStandardMaterial({ color: '#c0c0c0', metalness: 0.6, roughness: 0.3 })); pull.position.set(0.125, 0.2, 0.29); bag.add(pull);
    bag.traverse(o => { if (o.isMesh) o.castShadow = true; }); bag.visible = false; scene.add(bag); }

  // snow: deterministic particles flowing from the open windows into the room
  const dotT = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const r = g.createRadialGradient(32, 32, 2, 32, 32, 30); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.5, 'rgba(255,255,255,0.8)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); return t; })();
  const NS = 900, snowG = new THREE.BufferGeometry(), snowP = new Float32Array(NS * 3); snowG.setAttribute('position', new THREE.BufferAttribute(snowP, 3));
  const snow = new THREE.Points(snowG, new THREE.PointsMaterial({ map: dotT, size: 0.07, transparent: true, depthWrite: false, color: new THREE.Color(1.6, 1.6, 1.7), toneMapped: false })); snow.frustumCulled = false; scene.add(snow);
  const hash = (i, k = 0) => { const s = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return s - Math.floor(s); };
  const updSnow = (t, open) => { for (let i = 0; i < NS; i++) { const w = i % 2, x0 = WIN[w], life = 3.2, ph = hash(i, 1) * life, a = ((t + ph) % life), born = t - a;
      const on = open[w](born) > hash(i, 7); const vx = (hash(i, 2) - 0.5) * 1.4, vz = 1.3 + hash(i, 3) * 2.2, vy = -0.25 - hash(i, 4) * 0.35;
      const x = x0 + (hash(i, 5) - 0.5) * 2.1 + vx * a + 0.15 * Math.sin(a * 3 + i), y = FY + 1.45 + hash(i, 6) * 0.8 + vy * a + 0.1 * Math.sin(a * 4 + i * 0.3), z = ZB + 0.3 + vz * a;
      snowP.set(on && y > FY + 0.02 ? [x, y, z] : [0, -50, 0], i * 3); } snowG.attributes.position.needsUpdate = true; };

  // CO₂ bubbles
  const co2T = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.fillStyle = 'rgba(150,160,150,0.55)'; g.beginPath(); g.arc(64, 64, 56, 0, 7); g.fill(); g.lineWidth = 5; g.strokeStyle = 'rgba(60,60,60,0.8)'; g.stroke();
    g.fillStyle = '#2a2a2a'; g.font = 'bold 40px InterB, sans-serif'; g.textAlign = 'center'; g.fillText('CO₂', 64, 78); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const NB = 160, bubbles = Array.from({ length: NB }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: co2T, transparent: true, depthWrite: false })); s.visible = false; scene.add(s); return s; });

  // 2-D overlay: cards, ppm counter, bar graph
  const out = document.createElement('canvas'); out.width = WW; out.height = HH; const og = out.getContext('2d'); const K = WW / 1080;
  const backOut = x => { x = clamp(x); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
  const card = (text, t0, t1, t, y = 300, sz = 120, col = '#ffe36b', rot = -0.03) => { if (t < t0 || t > t1) return; const k = backOut((t - t0) / 0.3) * clamp((t1 - t) / 0.2);
    og.save(); og.translate(WW / 2, y * K); og.scale(k * K, k * K); og.rotate(rot); og.font = `${sz}px Anton, sans-serif`; og.textAlign = 'center'; og.textBaseline = 'middle';
    og.lineJoin = 'round'; og.lineWidth = sz * 0.2; og.strokeStyle = '#111'; og.strokeText(text, 0, 0); og.fillStyle = col; og.fillText(text, 0, 0); og.restore(); };
  const graph = (t0, t1, t) => { if (t < t0 || t > t1) return; const a = clamp((t - t0) / 0.3) * clamp((t1 - t) / 0.25), drop = eio(clamp((t - t0 - 1.6) / 1.4));
    og.save(); og.globalAlpha = a; og.scale(K, K); og.fillStyle = 'rgba(255,255,255,0.93)'; og.strokeStyle = '#111'; og.lineWidth = 8; const bx = 150, by = 150, bw = 780, bh = 520;
    og.beginPath(); og.roundRect(bx, by, bw, bh, 28); og.fill(); og.stroke(); og.fillStyle = '#111'; og.font = '64px Anton, sans-serif'; og.textAlign = 'center'; og.fillText('THINKING SCORE', bx + bw / 2, by + 80);
    const bars = [['FRESH AIR', 1, '#2fa36b'], ['1,400 PPM', 1 - 0.5 * drop, '#e8442a']]; bars.forEach(([lab, v, c], i) => { const x = bx + 150 + i * 310, h = 250 * v; og.fillStyle = c; og.fillRect(x, by + 450 - h, 170, h); og.strokeRect(x, by + 450 - h, 170, h);
      og.fillStyle = '#111'; og.font = '40px Anton, sans-serif'; og.fillText(lab, x + 85, by + 495); og.font = '52px Anton, sans-serif'; og.fillText(`${Math.round(v * 100)}%`, x + 85, by + 438 - h); });
    og.restore(); };
  const ppm = (t0, t1, t) => { if (t < t0 || t > t1) return; const v = Math.round((400 + 1000 * eio(clamp((t - t0 - 0.4) / 3.2))) / 10) * 10, hot = v >= 1400;
    card('CO₂', t0, t1, t, 190, 110, '#ffffff', 0); card(`${v.toLocaleString('en-US')} PPM`, t0 + 0.15, t1, t, 380, 150, hot ? '#ff5a3c' : '#ffe36b', -0.02); };

  // ---------- helpers ----------
  const COLD = new THREE.Color('#b9dcff');
  const chill = (c, k) => { if (k > 0) c.hm.material.uniforms.base.value.copy(c.tint).lerp(COLD, k * 0.55); };
  const talk = (c, t, a = 'talk', b = 'calm') => face(c, Math.sin(t * 22) > -0.2 ? a : b);
  const stand = (c, x, z, ry, t) => { place(c, x, z, ry, FY); idle(c, t); };
  const hug = (c, t) => { const j = 0.012 * Math.sin(t * 47); c.root.position.x += j; arm(c, 'Left', Lw(c, -0.16, 0.98 + j, 0.32)); arm(c, 'Right', Lw(c, 0.16, 0.95 - j, 0.32)); };
  const type = (c, t) => { const a = 0.03 * Math.sin(t * 28), b = 0.03 * Math.sin(t * 31 + 1); arm(c, 'Left', Lw(c, 0.16, 0.97 + a, 0.52)); arm(c, 'Right', Lw(c, -0.16, 0.97 + b, 0.52)); };
  const point = (c, t) => arm(c, 'Right', Lw(c, -0.12, 1.42 + 0.03 * Math.sin(t * 9), 0.85), dirW(c, -1, 0, 0));
  const doze = (c, k) => headTurn(c, 0.15 * k, 0.55 * k);
  const exhale = (cs, t, t0, t1, slot0) => { cs.forEach((c, ci) => { const h = headC(c), f = dirW(c, 0, 0, 1); for (let j = 0; j < 5; j++) { const s = bubbles[slot0 + ci * 5 + j], life = 2.2, a = (t - t0 + j * life / 5 + ci * 0.31) % life;
      if (t < t0 || t > t1 || (t - t0) < j * life / 5 * 0.2) continue; s.visible = true; s.position.copy(h).addScaledVector(f, 0.3 + a * 0.35).add(V(0.05 * Math.sin(a * 3 + j), -0.05 + a * 0.32, 0)); s.scale.setScalar(0.06 + a * 0.045); s.material.opacity = clamp(a * 3) * clamp((life - a) * 2); } }); };
  const fill = (n, t) => { for (let i = 0; i < n && i < 120; i++) { const s = bubbles[40 + i]; s.visible = true; s.position.set(-8 + hash(i, 11) * 16, FY + 0.6 + hash(i, 12) * 3.1 + 0.06 * Math.sin(t * 1.3 + i), ZB + 0.5 + hash(i, 13) * 8); s.scale.setScalar(0.2 + hash(i, 14) * 0.15); s.material.opacity = 0.85; } };
  const haze = (k) => { scene.fog.color.set('#9aa39a'); scene.fog.near = lerp(400, 1.5, k); scene.fog.far = lerp(4000, 22, k); };
  const winterLook = (bright = 0) => { setLook('day'); hemi.intensity = lerp(0.36, 0.6, bright); hemi.color.set(bright ? '#fff3e2' : '#a8c0ea'); sun.intensity = lerp(2.3, 2.4, bright); sun.color.set(bright ? '#ffe2b0' : '#e8eeff');
    SUNDIR.set(0.35, 0.5, -0.75).normalize(); U.uSat.value = 1.2; U.uCon.value = lerp(1.22, 1.14, bright); U.uWarm.value = lerp(-0.02, 0.08, bright); renderer.toneMappingExposure = lerp(0.46, 0.66, bright); U.uVig.value = 0.55; };
  const dof = (d, a) => { post.bokeh.enabled = d > 0; if (d > 0) { post.bokeh.uniforms.focus.value = d; post.bokeh.uniforms.aperture.value = a; } };

  // window states (open factor 0..1 over time)
  const W_OPEN = [t => (t < cut('shut') + 0.2 ? 1 : 0), t => (t < 0.9 ? 0 : t < cut('shut') + 0.6 ? eio((t - 0.9) / 0.9) : 1 - eio((t - cut('shut') - 0.6) / 0.9))];
  const W_LOOP = t => t > DUR - 0.35 ? eio((t - DUR + 0.35) / 0.35) * 0.2 : 0;

  const frame = (t) => {
    resetScene(); OUTF.forEach(c => (c.root.visible = false)); ex.forEach(c => (c.root.visible = false)); bag.visible = false; bubbles.forEach(b => (b.visible = false)); dof(0, 0); haze(0); snow.visible = t < cut('pitch');
    const loopSc = t >= cut('loop'); winterLook(loopSc ? 1 : 0);
    sashOpen(0, loopSc ? 0 : W_OPEN[0](t)); sashOpen(1, loopSc ? W_LOOP(t) : W_OPEN[1](t)); updSnow(t, W_OPEN);
    drawWB(t >= cut('analogy') && t < cut('loop') ? 'math' : t >= cut('pitch') && t < cut('loop') ? 'pitch' : 'doodle');
    const cold = t < cut('pitch') ? 1 : 0, sleepy = clamp((t - wt('blank', 'forgot')) / 1.2) * (t < cut('loop') ? 1 : 0);
    let lookAt = null;

    if (t < cut('pitch')) {
      // ---- morning, windows open: Kevin at the window, coworkers freezing at their desks, Dave at his
      const kturn = eio(clamp((t - 2.6) / 0.6)), atWin = t < cut('shut');
      if (atWin) { stand(KEV, -3.2, ZB + 0.8, lerp(Math.PI, 0.25, kturn), t); if (t < 2.6) { const up = eio(clamp((t - 0.7) / 1.1)); for (const s of ['Left', 'Right']) arm(KEV, s, Lw(KEV, (s === 'Left' ? 1 : -1) * 0.28, 1.1 + 0.55 * up, 0.42)); }
        face(KEV, t < cut('reply') ? 'calm' : 'smug'); }
      else { stand(KEV, DESK.kev, CHZ, 0.5, t); face(KEV, 'calm'); }
      if (atWin && t >= wt('reply', 'trust') && t < E('reply')) talk(KEV, t, 'smugt', 'smug');
      CO.forEach((c, i) => { const x = [DESK.co0, DESK.co1, -10][i]; if (x < -9) return; stand(c, x, CHZ, 0.25 * (i ? -1 : 1), t + i); hug(c, t + i * 0.3); face(c, t < cut('freeze') ? 'flat' : 'wide'); chill(c, cold); });
      if (t < cut('shut')) { const mocking = t >= cut('mock') && t < cut('reply'); stand(DAVE, DESK.dave, CHZ, mocking ? yawTo(DESK.dave, CHZ, -3.2, ZB + 0.8) : 0, t); chill(DAVE, cold);
        if (mocking) { point(DAVE, t); arm(DAVE, 'Left', Lw(DAVE, 0.2, 1.0, 0.1)); if (t > wt('mock', 'close')) talk(DAVE, t, 'shout', 'serioust'); else face(DAVE, 'serious'); } else { hug(DAVE, t); face(DAVE, t < cut('mock') ? 'pale' : 'serious'); } }
      else { // Dave shuts the window
        const k = eio(clamp((t - cut('shut') - 0.5) / 1.0)); stand(DAVE, -3.2, ZB + 0.8, Math.PI, t); for (const s of ['Left', 'Right']) arm(DAVE, s, Lw(DAVE, (s === 'Left' ? 1 : -1) * 0.28, 1.65 - 0.5 * k, 0.42));
        if (t > cut('shut') + 1.8) { place(DAVE, -3.2, ZB + 0.8, lerp(Math.PI, 0.2, eio((t - cut('shut') - 1.8) / 0.4)), FY); idle(DAVE, t); } face(DAVE, 'smug'); chill(DAVE, 0.4); }

      // shots
      if (t < cut('freeze')) { const u = eio(t / cut('freeze'));   // 1 push in on Kevin opening the window, snow pouring in
        look(V(lerp(-4.3, -3.7, u), lerp(1.75, 1.7, u), lerp(-21.6, -23.2, u)), V(-3.15, lerp(1.75, 1.6, u), ZB + 0.4), 42); dof(lerp(4.8, 2.5, u), 0.004); }
      else if (t < cut('mock')) { const u = (t - cut('freeze')) / (cut('mock') - cut('freeze'));   // 2 dolly along the shivering row
        look(V(lerp(-1.0, -1.3, u), 1.5, lerp(-21.5, -21.9, u)), V(-2.5, 1.45, -24.0), 40); dof(1.9, 0.006); }
      else if (t < cut('reply')) { const u = eio((t - cut('mock')) / (cut('reply') - cut('mock')));   // 3 low angle on Dave pointing
        { const dv = V(-3.2 - DESK.dave, 0, ZB + 0.8 - CHZ).normalize(); look(V(DESK.dave, 0, CHZ).addScaledVector(dv, 2.2 - 0.3 * u).add(V(0.3, 1.0, 0)), V(DESK.dave, 1.6, CHZ), 42); dof(2.1, 0.008); } }
      else if (t < cut('shut')) { const u = eio((t - cut('reply')) / (cut('shut') - cut('reply')));   // 4 Kevin deadpan, snow behind, slow push
        const h = headC(KEV); look(h.clone().add(V(0.45 - 0.1 * u, -0.05, 1.7 - 0.5 * u)), h.clone().add(V(0, -0.12, 0)), 36); dof(1.55 - 0.45 * u, 0.012); }
      else { const u = eio((t - cut('shut')) / (cut('pitch') - cut('shut')));   // 5 Dave slams it, Kevin watches from his desk
        look(V(lerp(-4.9, -4.6, u), 1.55, lerp(-22.2, -22.9, u)), V(-3.6, 1.45, ZB + 0.6), 44); dof(2.6, 0.005); }
    }
    else if (t < cut('loop')) {
      // ---- 3 pm pitch at the whiteboard; the room is sealed and the air goes stale
      const pitchK = clamp((t - cut('pitch')) / 6);
      haze(Math.min(0.75, 0.15 + pitchK * 0.5 + clamp((t - cut('ppm')) / 4) * 0.25));
      const AUD = [[KEV, 0.35, -24.05], [CO[0], 1.0, -23.75], [CO[1], 3.45, -23.75], [CO[2], 4.15, -24.1]];
      AUD.forEach(([c, x, z], i) => { stand(c, x, z, yawTo(x, z, 2.2, ZB + 0.75), t + i); doze(c, c === KEV ? 0 : sleepy * (0.8 + 0.2 * i)); face(c, c === KEV ? 'smug' : sleepy > 0.5 ? 'flat' : 'listen'); });
      const ana = t >= cut('analogy');
      stand(DAVE, 2.2, ZB + 0.75, ana ? 0.35 : 0, t);
      if (t < cut('blank')) { arm(DAVE, 'Left', Lw(DAVE, 0.55, 1.55 + 0.05 * Math.sin(t * 5), 0.25), dirW(DAVE, 1, 0, -0.3)); talk(DAVE, t, 'talk', 'calm'); }
      else if (!ana) { face(DAVE, t < cut('why') ? 'pale' : 'palet'); }
      if (ana) { arm(DAVE, 'Right', Lw(DAVE, -0.1, 1.85 + 0.03 * Math.sin(t * 14), 0.2), dirW(DAVE, -1, 0.3, 0)); const h = headC(DAVE); bag.visible = true; bag.position.copy(h).add(V(0, 0.1, 0)); bag.rotation.y = 0.35; bag.scale.setScalar(Math.min(1, backOutS((t - cut('analogy') - 0.2) / 0.35))); }

      if (t < cut('blank')) { const u = eio((t - cut('pitch')) / (cut('blank') - cut('pitch')));   // 6 over the audience, push toward Dave
        look(V(lerp(1.0, 1.6, u), lerp(1.45, 1.5, u), lerp(-22.2, -23.0, u)), V(2.2, 1.55, ZB + 0.6), 42); dof(lerp(3.3, 2.5, u), 0.006); }
      else if (t < cut('why')) { const u = eio((t - cut('blank')) / (cut('why') - cut('blank'))), dz = lerp(0.9, 2.6, u), fov = 2 * Math.atan(0.36 / dz) * 180 / Math.PI;   // 7 dolly-zoom "forgot every word"
        const h = headC(DAVE); look(h.clone().add(V(0, 0.02, dz)), h.clone().add(V(0, -0.05, 0)), fov, -0.08 * u); dof(dz, 0.014); }
      else if (t < cut('ppm')) { const u = eio((t - cut('why')) / (cut('ppm') - cut('why')));   // 8 profile ECU: CO₂ out of every mouth
        const h = headC(DAVE); look(h.clone().add(V(-1.15 + 0.15 * u, 0.05, 0.85 + 0.1 * u)), h.clone().add(V(-0.1, -0.05, 0.35)), 40); dof(1.4, 0.008);
        exhale([DAVE], t, wt('why', 'every') - 0.3, 99, 0); }
      else if (t < cut('study')) { const u = eio((t - cut('ppm')) / (cut('study') - cut('ppm')));   // 9 high wide, room filling up
        look(V(lerp(-2.6, -0.8, u), lerp(3.7, 4.0, u), lerp(-18.8, -19.6, u)), V(1.4, 1.2, -24.0), 44); exhale([DAVE, CO[0], CO[1], CO[2], KEV], t, S('ppm') - 2, 99, 0); fill(Math.round(10 + 110 * u), t); }
      else if (t < cut('analogy')) { const u = (t - cut('study')) / (cut('analogy') - cut('study'));   // 10 slow pan over the dozing audience
        DAVE.root.visible = false; look(V(2.2, 1.6, -25.65), V(lerp(3.9, 0.5, eio(u)), 1.5, -23.9), 50); fill(120, t); dof(2.3, 0.005); }
      else { const u = eio((t - cut('analogy')) / (cut('loop') - cut('analogy')));   // 11 sleeping-bag head vs "2 + 2 = ?"
        look(V(2.2, lerp(2.0, 1.95, u), lerp(-20.6, -21.2, u)), V(2.2, 1.9, ZB + 0.5), 52); fill(80, t); dof(3.5, 0.004); }
    }
    else {
      // ---- next morning: Dave walks straight past Kevin… toward the window (loops into line 1)
      const u = clamp((t - cut('loop')) / (DUR - 0.25 - cut('loop'))), P = [V(1.0, 0, -21.2), V(-0.15, 0, -24.0), V(-2.75, 0, -25.0)];
      const d1 = P[0].distanceTo(P[1]), d2 = P[1].distanceTo(P[2]), s = u * (d1 + d2), a = s < d1 ? P[0].clone().lerp(P[1], s / d1) : P[1].clone().lerp(P[2], (s - d1) / d2), dir = s < d1 ? P[1].clone().sub(P[0]) : P[2].clone().sub(P[1]);
      const ry = Math.atan2(dir.x, dir.z); place(DAVE, a.x, a.z, ry, FY); SR.clipAt(DAVE, 'walk', t * 1.1); face(DAVE, 'serious');
      if (u > 0.93) for (const sd of ['Left', 'Right']) arm(DAVE, sd, Lw(DAVE, (sd === 'Left' ? 1 : -1) * 0.25, 1.4, 0.45));
      stand(KEV, -1.0, -22.15, yawTo(-1.0, -22.15, a.x, a.z) * 0.85, t); face(KEV, u > 0.45 ? 'wide' : 'calm');
      [[CO[0], DESK.co0 - 1.4], [CO[1], DESK.dave + 0.1]].forEach(([c, x], i) => { stand(c, x, CHZ, 0.2, t + i); type(c, t + i); face(c, 'calm'); });
      const h = headC(DAVE); look(V(lerp(2.3, 0.6, u), 1.6, lerp(-19.4, -20.6, u)), h.clone().add(V(0, -0.2, 0)), 42); dof(h.distanceTo(camera.position), 0.004);
      lookAt = h;
    }

    ALL.forEach(c => SR.updateLimbs(c));
    const f = V(0, 1, -23); sun.target.position.copy(f); sun.position.copy(f).addScaledVector(SUNDIR, 60); const sc = sun.shadow.camera; sc.left = sc.bottom = -12; sc.right = sc.top = 12; sc.near = 1; sc.far = 140; sc.updateProjectionMatrix();
    U.uTime.value = t; post.render();
    // overlay
    og.clearRect(0, 0, WW, HH); og.drawImage(canvas, 0, 0);
    card('JANUARY', wt('hook', 'january') - 0.1, cut('freeze'), t, 300, 150, '#bfe3ff');
    card('-8°C OUTSIDE', S('freeze'), cut('mock'), t, 300, 120, '#bfe3ff');
    card('11:00 AM', S('shut') - 0.05, cut('pitch'), t, 300, 130);
    card('3:00 PM', S('pitch') - 0.05, wt('pitch', 'biggest'), t, 300, 130);
    card('?!', wt('blank', 'forgot'), cut('why'), t, 330, 200, '#ffffff', 0.05);
    ppm(S('ppm') - 0.05, cut('study'), t);
    card('HARVARD STUDY', S('study') - 0.05, cut('analogy'), t, 95, 80, '#ffffff', 0);
    graph(wt('study', 'harvard') + 0.2, cut('analogy'), t);
    card('NEXT MORNING', S('loop') - 0.1, wt('loop', 'dave'), t, 300, 120);
    return out.toDataURL('image/jpeg', 0.92);
  };
  const backOutS = x => { x = clamp(x); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
  window.frame = frame; window.DUR = DUR; window.ready = true;
}
