// THE FILM for EP02 "Aaji's Signboards" (Puneri Patya). A list of shots (Shots.film); every frame is a pure function of t.
// Bablu the auto-rickshaw is drawn here from G.* primitives: one big headlight eye with a visor lid,
// a grille mouth that lip-syncs to his voiceover, a marigold garland, the dented mudguard, an MH-12 plate.
(function () {
  const U = globalThis.U, G = globalThis.G, Ch = globalThis.Ch, Subs = globalThis.Subs, Shots = globalThis.Shots, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { clamp, lerp, ease } = U;
  const { T, ev, BEAT } = S;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  let VO = null, SUBS = [];

  const C = {
    sky: '#9FD3E8', ink: '#2A2320', black: '#1E1E22', yellow: '#F2C230', tile: '#B5452F', wood: '#7A4A2A',
    road: '#C9BBA4', ochre: '#E9C46A', cream: '#EFE3C8', teal: '#8AB6A8', terra: '#E07A5F', shutter: '#A7ADB3', marigold: '#F28C28',
  };

  const DEV = { fam: 'Noto Sans Devanagari', weight: 700 };
  // gradients + light helpers for the cinematic pass
  const lin = (ctx, x0, y0, x1, y1, stops) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); for (const [o, c] of stops) g.addColorStop(o, c); return g; };
  const rad = (ctx, x, y, r0, r1, stops) => { const g = ctx.createRadialGradient(x, y, r0, x, y, r1); for (const [o, c] of stops) g.addColorStop(o, c); return g; };
  const tint = (c, k) => G.tint(c, k);
  function softShadow(ctx, x, y, rx, ry, a = 0.38) { ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx); ctx.fillStyle = rad(ctx, 0, 0, 0, rx, [[0, `rgba(10,8,6,${a})`], [0.6, `rgba(10,8,6,${a * 0.5})`], [1, 'rgba(10,8,6,0)']]); ctx.beginPath(); ctx.arc(0, 0, rx, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  function ao(ctx, x, y, w, h, a = 0.35, up = false) { ctx.save(); ctx.fillStyle = lin(ctx, 0, up ? y + h : y, 0, up ? y : y + h, [[0, `rgba(20,10,5,${a})`], [1, 'rgba(20,10,5,0)']]); ctx.fillRect(x, y, w, h); ctx.restore(); }

  // ---------- the cast ----------
  const CAST = {
    arjun: { outfit: 'shirt', shirt: '#F4F1EA', bottoms: 'pants', pants: '#B8A27A', skin: '#8D5A3B', hairStyle: 'quiff', hair: '#1E1A1A', facialHair: 'mustache', shoes: '#5A3A2A' },
    aaji: { outfit: 'sari', robe: '#8A2233', shirt: '#2F7D3D', trim: '#3C9A4A', hairStyle: 'bun', hair: '#DADADA', glasses: 'round', glassesColor: '#C9A227', skin: '#B97D55' },
    keeper1: { outfit: 'shirt', shirt: '#EDE6D6', bottoms: 'pants', pants: '#4A4A55', skin: '#A86E4B', hairStyle: 'short', hair: '#2A2A2A', facialHair: 'mustache', build: 'broad' },
    keeper2: { outfit: 'kameez', shirt: '#D9E4E8', skin: '#C98A62', hairStyle: 'bald', hair: '#8A8A8A', glasses: 'square' },
    keeper3: { outfit: 'tee', shirt: '#E0703E', bottoms: 'pants', pants: '#2F3A5A', skin: '#8D5A3B', hairStyle: 'curly', hair: '#1E1A1A' },
  };
  globalThis.CAST = CAST;

  const mouthOf = (who, t) => { const m = Subs.mouth(VO, t, who); return m.talking ? m : null; };
  const talkMouth = (who, t, rest = 'smile') => { const m = mouthOf(who, t); return m ? (m.open > 0.45 ? 'open' : m.open > 0.15 ? 'o' : 'flat') : rest; };

  // ---------- BABLU, the auto-rickshaw (side view, facing right; origin = ground under the middle) ----------
  // o: x, y, s, t, face ('normal'|'wide'|'wink'|'worried'|'sleepy'|'happy'), look, dist (for wheel spin),
  //    inside(ctx) draws passengers in local coords, flag (0 up .. 1 down meter flag), squash
  function bablu(ctx, o) {
    const { x, y, s = 1, t = 0, face = 'normal', look = 0, dist = 0, inside = null, flag = 0, idle = true, sx = 1 } = o;
    const m = mouthOf('bablu', t);
    const talk = m ? m.open : 0;
    const vib = idle ? Math.sin(t * 46) * 1.6 : 0;
    ctx.save(); ctx.translate(x, y); ctx.scale(s * sx, s);
    // shadow
    softShadow(ctx, 10, 4, 330, 34, 0.55);
    ctx.translate(0, vib - talk * 4);
    // wheels
    const wheel = (wx) => {
      G.ellipse(ctx, wx, -50, 50, 50, { fill: rad(ctx, wx - 14, -64, 4, 56, [[0, '#4A4A52'], [0.7, '#1C1C20'], [1, '#0A0A0C']]), lw: 4, seed: 40 + wx });
      G.ellipse(ctx, wx, -50, 24, 24, { fill: rad(ctx, wx - 6, -58, 2, 26, [[0, '#FFFFFF'], [0.4, '#C9CED4'], [1, '#6E747A']]), lw: 3, seed: 41 + wx });
      const a = dist / 50;
      for (let k = 0; k < 3; k++) { const q = a + k * 2.094; G.line(ctx, [[wx, -50], [wx + Math.cos(q) * 20, -50 + Math.sin(q) * 20]], { color: '#2A2320', lw: 3, seed: 42 + k }); }
    };
    wheel(-170); wheel(190);
    // interior (the cabin openings) and the passengers
    G.rrect(ctx, -236, -400, 440, 170, 10, { fill: lin(ctx, 0, -400, 0, -230, [[0, '#2A2018'], [1, '#5A4636']]), lw: 0, seed: 50 });
    if (inside) { ctx.save(); inside(ctx); ctx.restore(); }
    // the black lower body
    G.poly(ctx, [[-258, -70], [-262, -235], [-200, -250], [120, -250], [205, -238], [250, -196], [268, -112], [244, -66], [130, -64], [130, -100], [-120, -100], [-120, -64]], { fill: lin(ctx, 0, -252, 0, -64, [[0, '#4A4A54'], [0.12, '#26262C'], [0.6, '#151518'], [1, '#08080A']]), lw: 5, seed: 51, step: 30 });
    // a long specular highlight on the glossy body
    ctx.save(); ctx.globalAlpha = 0.35; G.line(ctx, [[-240, -226], [200, -226], [238, -192]], { color: '#FFFFFF', lw: 5, seed: 511 }); ctx.globalAlpha = 0.12; G.line(ctx, [[-230, -140], [120, -140]], { color: '#FFFFFF', lw: 14, seed: 512 }); ctx.restore();
    // mudguards (the front one has the famous 2009 dent)
    G.line(ctx, [[-232, -66], [-224, -100], [-196, -118], [-150, -118], [-118, -96]], { color: '#3A3A40', lw: 9, seed: 52 });
    G.line(ctx, [[132, -70], [148, -104], [176, -118], [214, -114], [222, -104], [230, -110], [244, -80]], { color: '#3A3A40', lw: 9, seed: 53 });
    // MH 12 plate + "HORN OK PLEASE" on the side
    G.rrect(ctx, -236, -200, 92, 40, 5, { fill: '#F6F0E2', lw: 3, seed: 54 });
    G.text(ctx, 'MH 12', -190, -170, { size: 26, align: 'center', fam: 'Inter', weight: 800, color: '#1E1E22', boil: 0 });
    G.text(ctx, 'HORN OK PLEASE', -20, -165, { size: 30, align: 'center', fam: 'Permanent Marker', weight: 400, color: C.yellow, boil: 0.4 });
    // the canopy: roof, back panel, a pillar
    G.poly(ctx, [[-264, -236], [-264, -402], [-226, -448], [150, -454], [196, -428], [232, -312], [214, -300], [178, -414], [150, -420], [-222, -414], [-232, -402], [-232, -236]], { fill: lin(ctx, 0, -456, 0, -236, [[0, '#FFE38A'], [0.18, '#F7C93A'], [0.7, '#E2AE1C'], [1, '#B88A0E']]), lw: 5, seed: 55, step: 30 });
    ctx.save(); ctx.globalAlpha = 0.45; G.line(ctx, [[-220, -446], [150, -450]], { color: '#FFF6D0', lw: 6, seed: 551 }); ctx.restore();
    G.rrect(ctx, 6, -416, 26, 170, 4, { fill: lin(ctx, 6, 0, 32, 0, [[0, '#FFE38A'], [1, '#C99A12']]), lw: 4, seed: 56 });
    // green stripe on the roof edge
    G.line(ctx, [[-226, -430], [160, -436]], { color: '#2F7D3D', lw: 7, seed: 57 });
    // the windscreen
    G.poly(ctx, [[184, -414], [226, -312], [212, -302], [176, -404]], { fill: 'rgba(190,225,240,0.8)', lw: 3, seed: 58, step: 20 });
    // the meter on the driver's side with its flag
    G.rrect(ctx, 150, -300, 40, 54, 6, { fill: '#3A3A40', lw: 3, seed: 59 });
    ctx.save(); ctx.translate(170, -300); ctx.rotate(lerp(-0.2, 1.6, flag));
    G.rrect(ctx, -6, -70, 12, 70, 3, { fill: '#C9C9C9', lw: 2.5, seed: 60 }); G.rrect(ctx, -20, -96, 40, 30, 4, { fill: '#E0503E', lw: 3, seed: 61 });
    ctx.restore();
    // the mirror + marigold garland
    G.line(ctx, [[214, -330], [250, -372]], { color: '#2A2320', lw: 5, seed: 62 });
    G.ellipse(ctx, 256, -380, 16, 12, { fill: '#BFC4C8', lw: 3, seed: 63 });
    for (let k = 0; k < 7; k++) { const u = k / 6; const gx = lerp(244, 268, u) + Math.sin(t * 3 + k) * 1.5, gy = -360 + u * 70 + Math.sin(u * Math.PI) * 8; G.ellipse(ctx, gx, gy, 9, 9, { fill: k % 2 ? C.marigold : '#F7B733', lw: 2, seed: 64 + k }); }
    // THE EYE (the headlight) on the nose
    const ex = 238, ey = -178, er = 54;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rad(ctx, ex + 20, ey, 10, 170, [[0, 'rgba(255,240,190,0.35)'], [1, 'rgba(255,240,190,0)']]); ctx.fillRect(ex - 160, ey - 180, 360, 360); ctx.restore();
    G.ellipse(ctx, ex, ey, er + 9, er + 9, { fill: rad(ctx, ex - 20, ey - 24, 4, er + 12, [[0, '#FFFFFF'], [0.5, '#C9CED4'], [1, '#6E747A']]), lw: 4, seed: 70 });
    const shut = face === 'sleepy' ? 0.62 : face === 'happy' ? 0.35 : face === 'wide' ? 0 : face === 'worried' ? 0.22 : 0.18;
    const blink = (() => { const p = (t + 0.7) % 3.7; return p < 0.12 ? Math.sin((p / 0.12) * Math.PI) : 0; })();
    const closed = face === 'wink' ? 1 : Math.max(shut, blink);
    G.ellipse(ctx, ex, ey, er, er, { fill: rad(ctx, ex - 16, ey - 18, 4, er, [[0, '#FFFFFF'], [0.7, '#FFF6DA'], [1, '#E3D3A8']]), lw: 4, seed: 71 });
    if (closed < 0.95) {
      const pr = face === 'wide' ? 20 : 25;
      ctx.save(); ctx.beginPath(); ctx.arc(ex, ey, er - 2, 0, Math.PI * 2); ctx.clip();
      G.ellipse(ctx, ex + 14 + look * 10, ey + 4, pr, pr, { fill: '#2A2320', lw: 0, seed: 72 });
      G.ellipse(ctx, ex + 14 + look * 10, ey + 4, pr * 0.62, pr * 0.62, { fill: '#5A3A1E', lw: 0, seed: 721 });
      G.ellipse(ctx, ex + 14 + look * 10, ey + 4, pr * 0.34, pr * 0.34, { fill: '#0A0A0A', lw: 0, seed: 722 });
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(ex + 22 + look * 10, ey - 6, 7, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(ex + 6 + look * 10, ey + 12, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      // the glass dome reflection
      ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.beginPath(); ctx.ellipse(ex - 18, ey - 26, 24, 12, -0.6, 0, Math.PI * 2); ctx.fill();
      // the visor eyelid
      if (closed > 0.01) { ctx.fillStyle = C.yellow; ctx.fillRect(ex - er - 4, ey - er - 4, er * 2 + 8, (er * 2 + 8) * closed); }
      ctx.restore();
    } else {
      G.ellipse(ctx, ex, ey, er, er, { fill: C.yellow, lw: 4, seed: 73 });
      G.line(ctx, [[ex - 34, ey + 6], [ex, ey + 18], [ex + 34, ey + 6]], { color: '#2A2320', lw: 6, seed: 74 });
    }
    // visor brow
    const tilt = face === 'worried' ? -0.35 : face === 'wide' ? 0.05 : face === 'happy' ? 0.15 : 0.1;
    ctx.save(); ctx.translate(ex, ey - er - 8 - (face === 'wide' ? 12 : 0)); ctx.rotate(tilt);
    G.rrect(ctx, -er - 6, -14, er * 2 + 12, 20, 9, { fill: C.black, lw: 3.5, seed: 75 });
    ctx.restore();
    // the grille mouth
    const mx = 246, my = -100;
    if (talk > 0.08) G.ellipse(ctx, mx, my, 22 + talk * 4, 6 + talk * 18, { fill: '#5A1F1F', lw: 4, seed: 76 });
    else if (face === 'wide' || face === 'worried') G.ellipse(ctx, mx, my, 12, 14, { fill: '#5A1F1F', lw: 4, seed: 77 });
    else G.line(ctx, [[mx - 26, my - 6], [mx, my + 8], [mx + 22, my - 8]], { color: '#F6F0E2', lw: 6, seed: 78 });
    ctx.restore();
  }

  // ---------- the world ----------
  function sky(ctx, top = '#5FA8D8', bottom = '#E8F2EC', { sun = [920, 140], clouds = true, t = G.t } = {}) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(0.55, bottom); g.addColorStop(1, bottom); ctx.fillStyle = g; ctx.fillRect(-500, -500, W + 1000, H + 1000);
    if (sun) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rad(ctx, sun[0], sun[1], 10, 700, [[0, 'rgba(255,244,210,0.75)'], [0.15, 'rgba(255,236,190,0.35)'], [1, 'rgba(255,236,190,0)']]); ctx.fillRect(-500, -500, W + 1000, H + 1000); ctx.restore(); }
    if (clouds) for (let k = 0; k < 4; k++) { const cx = ((G.rnd(k, 3) * 1400 + t * (8 + k * 3)) % 1500) - 200, cy = 120 + k * 70; ctx.save(); ctx.globalAlpha = 0.55; for (let j = 0; j < 4; j++) { ctx.fillStyle = rad(ctx, cx + j * 60, cy - (j % 2) * 18, 5, 80, [[0, 'rgba(255,255,255,0.9)'], [1, 'rgba(255,255,255,0)']]); ctx.beginPath(); ctx.ellipse(cx + j * 60, cy - (j % 2) * 18, 90, 40, 0, 0, Math.PI * 2); ctx.fill(); } ctx.restore(); }
  }
  // far layer: Parvati hill with its temple, a hazy skyline and trees, softened by atmosphere
  function backdrop(ctx, t, y0 = 640) {
    ctx.save();
    ctx.fillStyle = lin(ctx, 0, y0 - 260, 0, y0 + 200, [[0, '#8FAFA0'], [1, '#B9CBBE']]);
    ctx.beginPath(); ctx.moveTo(-100, y0 + 200); ctx.quadraticCurveTo(200, y0 - 150, 430, y0 - 230); ctx.quadraticCurveTo(620, y0 - 250, 820, y0 - 90); ctx.quadraticCurveTo(1000, y0 - 40, 1200, y0 + 40); ctx.lineTo(1200, y0 + 200); ctx.fill();
    ctx.fillStyle = '#9DB2AA';
    ctx.fillRect(470, y0 - 330, 70, 100); ctx.beginPath(); ctx.moveTo(462, y0 - 330); ctx.lineTo(505, y0 - 410); ctx.lineTo(548, y0 - 330); ctx.fill(); // the temple shikhara
    ctx.fillRect(500, y0 - 430, 6, 22);
    for (let k = 0; k < 9; k++) { const bx = -60 + k * 140, bh = 120 + G.rnd(k, 9) * 140; ctx.fillStyle = k % 2 ? '#A9BDB6' : '#B5C6BF'; ctx.fillRect(bx, y0 + 60 - bh, 120, bh + 160); }
    for (let k = 0; k < 14; k++) { const tx = -40 + k * 85, ty = y0 + 60 + Math.sin(k * 2.1) * 20; ctx.fillStyle = rad(ctx, tx, ty - 20, 5, 70, [[0, '#7FA48A'], [1, '#6E9479']]); ctx.beginPath(); ctx.ellipse(tx, ty, 62, 50, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = 'rgba(225,236,232,0.35)'; ctx.fillRect(-100, y0 - 450, W + 200, 700); // haze
    ctx.restore();
  }
  function wires(ctx, y0, seed = 500) {
    for (let k = 0; k < 3; k++) { const pts = []; for (let i = 0; i <= 20; i++) { const u = i / 20; pts.push([-60 + u * (W + 120), y0 + k * 24 + 50 * 4 * u * (1 - u)]); } G.line(ctx, pts, { color: '#1E1A1A', lw: 2.5, seed: seed + k, step: 60 }); }
  }
  // a shop opening with its shutter: close 0 (open) .. 1 (shut)
  function shopFront(ctx, x, y, w, h, close, seed, { sign = null, signCol = '#2F7D74', sleepy = 0, t = 0, band = true } = {}) {
    G.rrect(ctx, x, y, w, h, 3, { fill: rad(ctx, x + w / 2, y + h * 0.4, 20, Math.max(w, h) * 0.8, [[0, '#7A6048'], [1, '#2E2218']]), lw: 4, seed });
    for (let r = 1; r < 4; r++) G.line(ctx, [[x + 10, y + r * h / 4], [x + w - 10, y + r * h / 4]], { color: '#8E6444', lw: 6, seed: seed + r });
    const boxCols = ['#E0703E', '#3FA89B', '#F2B84B', '#E8718D', '#B79CFF', '#F6F0E2'];
    for (let r = 0; r < 3; r++) for (let k = 0; k < Math.floor(w / 46); k++) if (G.rnd(seed, r, k) > 0.3) G.rrect(ctx, x + 14 + k * 46, y + r * h / 4 + h / 4 - 34, 34, 30, 3, { fill: boxCols[(k + r + seed) % 6], lw: 2.5, seed: seed + 10 + r * 9 + k });
    const sh = h * clamp(close);
    if (sh > 2) {
      G.rrect(ctx, x - 4, y - 2, w + 8, sh + 2, 2, { fill: lin(ctx, x, 0, x + w, 0, [[0, '#7D848B'], [0.35, '#C7CDD2'], [0.55, '#A3AAB1'], [1, '#6F767D']]), lw: 4, seed: seed + 60 });
      ctx.save(); ctx.beginPath(); ctx.rect(x - 4, y, w + 8, sh); ctx.clip();
      for (let yy = y + sh - 14; yy > y; yy -= 18) { ctx.fillStyle = 'rgba(40,40,50,0.35)'; ctx.fillRect(x - 4, yy, w + 8, 3); ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.fillRect(x - 4, yy + 3, w + 8, 2); }
      ctx.fillStyle = lin(ctx, 0, y, 0, y + 50, [[0, 'rgba(20,15,10,0.45)'], [1, 'rgba(20,15,10,0)']]); ctx.fillRect(x - 4, y, w + 8, 50);
      for (let k = 0; k < 6; k++) { ctx.fillStyle = `rgba(140,80,40,${0.08 + G.rnd(seed, k) * 0.1})`; ctx.beginPath(); ctx.ellipse(x + G.rnd(seed, k, 1) * w, y + sh - 10 - G.rnd(seed, k, 2) * 60, 30, 10, 0, 0, Math.PI * 2); ctx.fill(); } // rust at the bottom
      ctx.restore();
      G.rrect(ctx, x - 6, y + sh - 16, w + 12, 18, 4, { fill: '#6D7378', lw: 3.5, seed: seed + 62 });
      G.rrect(ctx, x + w / 2 - 18, y + sh - 12, 36, 12, 3, { fill: '#C9A227', lw: 2.5, seed: seed + 63 }); // the handle / lock
      if (close > 0.98 && band) { // the hanging "बंद 1–4" board
        G.line(ctx, [[x + w / 2 - 50, y + 40], [x + w / 2, y + 12], [x + w / 2 + 50, y + 40]], { color: '#2A2320', lw: 2.5, seed: seed + 64 });
        G.rrect(ctx, x + w / 2 - 70, y + 40, 140, 64, 6, { fill: '#F6F0E2', lw: 3.5, seed: seed + 65 });
        G.text(ctx, 'बंद १ ते ४', x + w / 2, y + 86, { size: 34, align: 'center', color: '#C0392B', ...DEV });
      }
      if (sleepy > 0) for (let k = 0; k < 3; k++) { const p = ((t * 0.5 + k / 3) % 1); ctx.save(); ctx.globalAlpha = sleepy * Math.sin(p * Math.PI); G.text(ctx, 'z', x + w * 0.75 + p * 80 + k * 10, y + h * 0.5 - p * 260, { size: 40 + p * 50, fam: 'Bungee', weight: 400, color: '#FFFFFF', stroke: '#2A2320', strokeW: 6 }); ctx.restore(); }
    }
    if (sign) {
      G.rrect(ctx, x - 10, y - 82, w + 20, 70, 6, { fill: lin(ctx, 0, y - 82, 0, y - 12, [[0, tint(signCol, 0.2)], [1, tint(signCol, -0.25)]]), lw: 4, seed: seed + 70 });
      ao(ctx, x - 10, y - 12, w + 20, 30, 0.4);
      G.text(ctx, sign, x + w / 2, y - 32, { size: Math.min(46, (w + 10) / sign.length * 2.4), align: 'center', color: '#FFF6DA', ...DEV });
    }
  }
  // an old Peth wada front: tiled roof, carved wooden balcony on the upper floor, a shop below
  function wada(ctx, x, y, w, h, col, seed, { shop = true, close = 1, sign = null, signCol, sleepy = 0, t = 0, balcony = true } = {}) {
    G.poly(ctx, [[x - 34, y], [x + w + 34, y], [x + w - 30, y - 96], [x + 30, y - 96]], { fill: lin(ctx, 0, y - 96, 0, y, [[0, '#D0654A'], [1, '#8E3220']]), lw: 4, seed, step: 30 });
    ctx.save(); ctx.beginPath(); ctx.moveTo(x - 34, y); ctx.lineTo(x + w + 34, y); ctx.lineTo(x + w - 30, y - 96); ctx.lineTo(x + 30, y - 96); ctx.clip();
    for (let k = 0; k < 4; k++) G.line(ctx, [[x - 40, y - 20 - k * 22], [x + w + 40, y - 20 - k * 22]], { color: 'rgba(80,20,10,0.4)', lw: 3, seed: seed + k });
    ctx.restore();
    G.rrect(ctx, x, y, w, h, 3, { fill: lin(ctx, x, y, x + w * 0.4, y + h, [[0, tint(col, 0.18)], [0.6, col], [1, tint(col, -0.22)]]), lw: 4, seed: seed + 5 });
    // plaster texture + weathering streaks
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    for (let k = 0; k < 26; k++) { ctx.fillStyle = `rgba(90,60,30,${0.04 + G.rnd(seed, k, 4) * 0.05})`; ctx.beginPath(); ctx.ellipse(x + G.rnd(seed, k, 1) * w, y + G.rnd(seed, k, 2) * h, 20 + G.rnd(seed, k, 3) * 50, 8 + G.rnd(seed, k, 5) * 30, 0, 0, Math.PI * 2); ctx.fill(); }
    for (let k = 0; k < 5; k++) { const sx = x + 20 + G.rnd(seed, k, 7) * (w - 40); ctx.fillStyle = lin(ctx, 0, y, 0, y + 260, [[0, 'rgba(70,50,30,0.16)'], [1, 'rgba(70,50,30,0)']]); ctx.fillRect(sx, y, 10 + G.rnd(seed, k, 8) * 14, 260); }
    ctx.fillStyle = lin(ctx, x + w - 90, 0, x + w, 0, [[0, 'rgba(30,15,5,0)'], [1, 'rgba(30,15,5,0.22)']]); ctx.fillRect(x + w - 90, y, 90, h);
    ctx.restore();
    ao(ctx, x, y, w, 46, 0.45);
    const up = y + 40;
    // windows with wooden frames
    for (let k = 0; k < 2; k++) { const wx = x + 34 + k * (w - 34 - 120); G.rrect(ctx, wx, up, 120, 150, 50, { fill: lin(ctx, wx, up, wx + 120, up + 150, [[0, '#8FB6C8'], [0.45, '#3E5C6A'], [1, '#22333C']]), lw: 4, seed: seed + 10 + k }); ctx.save(); ctx.globalAlpha = 0.35; G.line(ctx, [[wx + 20, up + 110], [wx + 70, up + 30]], { color: '#FFFFFF', lw: 8, seed: seed + 16 + k }); ctx.restore(); G.rrect(ctx, wx - 8, up - 8, 136, 166, 54, { fill: null, lw: 6, color: C.wood, seed: seed + 12 + k }); G.line(ctx, [[wx + 60, up], [wx + 60, up + 150]], { color: C.wood, lw: 5, seed: seed + 14 + k }); }
    if (balcony) { // the carved balcony rail
      const by = up + 170;
      G.rrect(ctx, x + 14, by, w - 28, 18, 3, { fill: C.wood, lw: 3.5, seed: seed + 20 });
      for (let k = 0; k < Math.floor((w - 40) / 30); k++) G.rrect(ctx, x + 24 + k * 30, by + 18, 12, 54, 5, { fill: '#9A6238', lw: 2.5, seed: seed + 21 + k });
      G.rrect(ctx, x + 14, by + 72, w - 28, 14, 3, { fill: C.wood, lw: 3.5, seed: seed + 19 });
      ao(ctx, x, by + 86, w, 60, 0.3);
      for (const bx of [x + 30, x + w - 30]) G.poly(ctx, [[bx - 14, by + 86], [bx + 14, by + 86], [bx, by + 130]], { fill: C.wood, lw: 3, seed: seed + 18 + bx, step: 12 });
    }
    if (shop) shopFront(ctx, x + 40, y + h - 300, w - 80, 290, close, seed + 100, { sign, signCol, sleepy, t });
  }
  function road(ctx, y0 = 1250) {
    G.rrect(ctx, -60, y0, W + 120, H - y0 + 60, 0, { fill: lin(ctx, 0, y0, 0, H, [[0, '#A89C8A'], [0.25, '#8E8475'], [1, '#5E574E']]), lw: 4, seed: 800 });
    G.rrect(ctx, -60, y0 - 4, W + 120, 26, 0, { fill: lin(ctx, 0, y0 - 4, 0, y0 + 22, [[0, '#D8D0C0'], [1, '#9C9384']]), lw: 0, seed: 802 }); // the kerb
    for (let k = 0; k < 120; k++) { ctx.fillStyle = `rgba(${G.rnd(k, 1) > 0.5 ? '255,255,255' : '20,15,10'},${0.06 + G.rnd(k, 2) * 0.08})`; ctx.fillRect(G.rnd(k, 3) * W, y0 + 30 + G.rnd(k, 4) * (H - y0), 3 + G.rnd(k, 5) * 6, 2 + G.rnd(k, 6) * 3); }
    ao(ctx, -60, y0 + 22, W + 120, 40, 0.3);
  }
  function rangoli(ctx, x, y, seed) {
    const cols = ['#E0503E', '#F2B84B', '#3FA89B', '#B79CFF'];
    for (let r = 3; r >= 1; r--) G.ellipse(ctx, x, y, r * 26, r * 10, { fill: cols[(r + seed) % 4], lw: 2, seed: seed + r, alpha: 0.85 });
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(x + Math.cos(a) * 66, y + Math.sin(a) * 26, 5, 0, Math.PI * 2); ctx.fill(); }
  }
  function lane(ctx, t, { close = 0, sleepy = 0 } = {}) {
    sky(ctx, undefined, undefined, { t });
    backdrop(ctx, t, 560);
    wada(ctx, -120, 420, 420, 830, C.ochre, 100, { close, sleepy, t, sign: 'चहा' });
    wada(ctx, 320, 360, 440, 890, C.teal, 200, { close, sleepy, t, sign: 'किराणा', signCol: '#B5452F' });
    wada(ctx, 780, 440, 420, 810, C.terra, 300, { close, sleepy, t, sign: 'मिठाई', signCol: '#6B4E8A' });
    wires(ctx, 330);
    road(ctx, 1250);
    rangoli(ctx, 540, 1300, 3);
  }
  function pinya(ctx, x, y, t, { flap = 0.05, s = 1, facing = 1 } = {}) { Ch.bird(ctx, { x, y, s, t, flap, color: '#8C8C9A', facing, seed: 900 }); G.ellipse(ctx, x + 18 * s * facing, y - 6 * s, 9 * s, 5 * s, { fill: '#3FA89B', lw: 0, seed: 901 }); }

  // ---------- EP02: the signboards ----------
  // a painted Puneri patya: wooden frame, cream paint, the first line in red; hangs from (x, y) top-centre
  function patya(ctx, x, y, w, lines, { size = 64, rot = 0, seed = 1, paint = '#F7F1E1', ink = '#2A2320', head = '#B3261E', frame = '#7A4A2A' } = {}) {
    const lh = size * 1.32, h = 70 + lines.length * lh;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    softShadow(ctx, 18, h * 0.55 + 24, w * 0.56, h * 0.6, 0.45);
    G.rrect(ctx, -w / 2 - 16, -16, w + 32, h + 32, 10, { fill: lin(ctx, 0, -16, 0, h + 16, [[0, tint(frame, 0.2)], [1, tint(frame, -0.3)]]), lw: 4, seed });
    G.rrect(ctx, -w / 2, 0, w, h, 6, { fill: lin(ctx, -w / 2, 0, w / 2, h, [[0, '#FFFBF0'], [0.6, paint], [1, tint(paint, -0.12)]]), lw: 0, seed: seed + 1 });
    // wood grain showing through + weathering
    ctx.save(); ctx.beginPath(); ctx.rect(-w / 2, 0, w, h); ctx.clip();
    for (let k = 0; k < 9; k++) { ctx.fillStyle = `rgba(120,80,40,${0.03 + G.rnd(seed, k) * 0.04})`; ctx.fillRect(-w / 2, (k + 0.5) * h / 9, w, 2 + G.rnd(seed, k, 1) * 3); }
    for (let k = 0; k < 4; k++) { ctx.fillStyle = 'rgba(110,70,30,0.08)'; ctx.beginPath(); ctx.ellipse(-w / 2 + G.rnd(seed, k, 2) * w, G.rnd(seed, k, 3) * h, 40, 16, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    lines.forEach((ln, i) => G.text(ctx, ln, 0, 34 + (i + 0.8) * lh, { size: i === 0 ? size * 1.04 : size, align: 'center', color: i === 0 ? head : ink, ...DEV }));
    for (const nx of [-w / 2 + 14, w / 2 - 14]) { G.ellipse(ctx, nx, 14, 8, 8, { fill: rad(ctx, nx - 2, 12, 1, 9, [[0, '#FFFFFF'], [1, '#6E747A']]), lw: 2, seed: seed + 9 }); }
    ctx.restore();
    return h;
  }
  const swingRot = (t, t0, amp = 0.22) => { const a = t - t0; return a < 0 ? 0 : amp * Math.exp(-3.2 * a) * Math.cos(10 * a); };
  function plaster(ctx, col, seed) {
    ctx.fillStyle = lin(ctx, 0, 0, W, H, [[0, tint(col, 0.15)], [1, tint(col, -0.3)]]); ctx.fillRect(-100, -100, W + 200, H + 200);
    for (let k = 0; k < 40; k++) { ctx.fillStyle = `rgba(90,60,30,${0.03 + G.rnd(seed, k, 4) * 0.05})`; ctx.beginPath(); ctx.ellipse(G.rnd(seed, k, 1) * W, G.rnd(seed, k, 2) * H, 30 + G.rnd(seed, k, 3) * 80, 12 + G.rnd(seed, k, 5) * 40, 0, 0, Math.PI * 2); ctx.fill(); }
  }
  function charger(ctx, x, y, s = 1) { G.rrect(ctx, x - 16 * s, y - 20 * s, 32 * s, 40 * s, 5, { fill: '#F6F0E2', lw: 3, seed: 2101 }); G.line(ctx, [[x, y + 20 * s], [x + 10 * s, y + 60 * s], [x - 14 * s, y + 90 * s]], { color: '#F6F0E2', lw: 5, seed: 2102 }); }

  // 1. HOOK: a sign drops in and swings on its nail
  function hook(ctx, t) {
    plaster(ctx, C.ochre, 2000);
    ao(ctx, -100, -100, W + 200, 260, 0.5);
    const y = t < ev.hook ? lerp(-900, 420, ease.inQuad(clamp(t / ev.hook))) : 420;
    patya(ctx, 540, y, 860, S.SIGNS.hook, { size: 76, rot: swingRot(t, ev.hook, 0.18), seed: 2010 });
    // the brass bell switch beside the door, a hint of what's to come
    G.rrect(ctx, 780, 1000, 110, 150, 14, { fill: lin(ctx, 780, 1000, 890, 1150, [[0, '#F2D27A'], [1, '#8A6418']]), lw: 4, seed: 2011 });
    G.ellipse(ctx, 835, 1075, 26, 26, { fill: rad(ctx, 828, 1068, 2, 28, [[0, '#FFFFFF'], [1, '#B33A2A']]), lw: 3, seed: 2012 });
  }
  // 2. The lane of signs: Bablu + Arjun with the charger
  function laneShot(ctx, t) {
    sky(ctx, undefined, undefined, { t });
    backdrop(ctx, t, 560);
    wada(ctx, -120, 420, 420, 830, C.ochre, 100, { close: 0, t, sign: 'चहा' });
    wada(ctx, 320, 360, 440, 890, C.teal, 200, { close: 0, t, sign: 'किराणा', signCol: '#B5452F' });
    wada(ctx, 780, 440, 420, 810, C.terra, 300, { close: 0, t, sign: 'मिठाई', signCol: '#6B4E8A' });
    wires(ctx, 330);
    // little patyas everywhere
    patya(ctx, 120, 700, 220, ['शांतता राखा!'], { size: 30, seed: 2020, rot: -0.04 });
    patya(ctx, 540, 640, 240, ['उधारी बंद.'], { size: 32, seed: 2021, rot: 0.03 });
    patya(ctx, 960, 720, 230, ['पार्किंग नाही!'], { size: 30, seed: 2022, rot: -0.02 });
    road(ctx, 1250);
    const face = t > T(2, 0.6) && t < T(2, 1.4) ? 'wink' : 'normal';
    bablu(ctx, { x: 300, y: 1290, s: 0.95, t, face, look: 0.6 });
    pinya(ctx, 240, 1290 - 0.95 * 454 - 18, t);
    Ch.person(ctx, { x: 820, y: 1300, s: 0.9, pose: 'stand', style: CAST.arjun, handR: [90, -330], handL: [-60, -280], eyes: 'normal', brows: 'worried', mouth: talkMouth('arjun', t, 'smile'), look: -0.4, seed: 1250 });
    charger(ctx, 820 + 0.9 * 90, 1300 - 0.9 * 330, 0.9);
    G.decor(() => {
      G.rrect(ctx, SAFE.x + 10, SAFE.y + 10, 520, 140, 18, { fill: 'rgba(20,20,24,0.82)', lw: 0, seed: 1100 });
      G.text(ctx, 'पुणे डायरीज', SAFE.x + 40, SAFE.y + 78, { size: 58, color: C.yellow, ...DEV });
      G.text(ctx, 'भाग २ · आजीच्या पाट्या', SAFE.x + 40, SAFE.y + 128, { size: 34, color: '#F6F0E2', ...DEV });
    });
  }
  // walking Arjun who stops at x1 by t1, then reacts
  function walker(ctx, t, t0, x0, x1, y, s, o = {}) {
    const u = clamp((t - t0) / 1.4), x = lerp(x0, x1, ease.outQuad(u)), walking = u < 1;
    Ch.person(ctx, { x, y, s, pose: walking ? 'walk' : 'stand', walk: walking ? (t - t0) * 2.2 : 0, style: CAST.arjun, seed: 1250, lookY: walking ? 0 : -0.7, look: -0.3, ...o, ...(walking ? { gesture: null } : {}) });
  }
  // 3. Sign 1: the parking sign over a chained scooter
  function sign1Shot(ctx, t) {
    plaster(ctx, C.teal, 2030);
    ao(ctx, -100, -100, W + 200, 200, 0.45);
    patya(ctx, 540, 300, 820, S.SIGNS.sign1, { size: 66, rot: swingRot(t, ev.sign1, 0.06), seed: 2031 });
    road(ctx, 1250);
    // a scooter, chained, with a comically big padlock
    const sx = 320, sy = 1240;
    softShadow(ctx, sx, sy + 10, 200, 20, 0.4);
    G.ellipse(ctx, sx - 120, sy - 40, 40, 40, { fill: '#1C1C20', lw: 3, seed: 2040 }); G.ellipse(ctx, sx + 130, sy - 40, 40, 40, { fill: '#1C1C20', lw: 3, seed: 2041 });
    G.poly(ctx, [[sx - 170, sy - 60], [sx - 60, sy - 150], [sx + 60, sy - 150], [sx + 100, sy - 230], [sx + 140, sy - 230], [sx + 170, sy - 70], [sx + 80, sy - 50], [sx - 90, sy - 50]], { fill: lin(ctx, 0, sy - 230, 0, sy - 50, [[0, '#F06A5A'], [1, '#9A2A20']]), lw: 4, seed: 2042, step: 20 });
    G.rrect(ctx, sx - 110, sy - 175, 140, 34, 14, { fill: '#2A2320', lw: 3, seed: 2043 });
    for (let k = 0; k < 7; k++) G.ellipse(ctx, sx - 100 + k * 26, sy - 48 + Math.sin(k) * 6, 14, 9, { fill: '#9AA0A6', lw: 2.5, seed: 2044 + k });
    G.rrect(ctx, sx + 70, sy - 70, 70, 60, 10, { fill: lin(ctx, 0, sy - 70, 0, sy - 10, [[0, '#F2D27A'], [1, '#8A6418']]), lw: 3, seed: 2052 });
    walker(ctx, t, ev.sign1, 1200, 760, 1300, 0.95, { brows: t > ev.sign1 + 4 ? 'up' : 'worried', mouth: talkMouth('arjun', t, 'o'), gesture: t > T(8) ? 'facepalm' : null });
  }
  // 4. Sign 2: on the lamp post, Pinya on top
  function sign2Shot(ctx, t) {
    sky(ctx, undefined, undefined, { t });
    backdrop(ctx, t, 700);
    wada(ctx, 520, 520, 700, 730, C.cream, 400, { close: 0, t, sign: 'पुस्तकं', signCol: '#2F7D74' });
    road(ctx, 1250);
    // the lamp post
    G.rrect(ctx, 250, 300, 34, 960, 8, { fill: lin(ctx, 250, 0, 284, 0, [[0, '#6E747A'], [0.4, '#C9CED4'], [1, '#4A4F55']]), lw: 3, seed: 2060 });
    G.poly(ctx, [[267, 300], [380, 250], [400, 270], [284, 330]], { fill: '#4A4F55', lw: 3, seed: 2061, step: 20 });
    G.ellipse(ctx, 392, 286, 30, 16, { fill: rad(ctx, 392, 290, 2, 30, [[0, '#FFF6D0'], [1, '#C9A227']]), lw: 3, seed: 2062 });
    const h = patya(ctx, 470, 470, 660, S.SIGNS.sign2, { size: 56, rot: -0.03 + swingRot(t, ev.sign2, 0.08), seed: 2063 });
    // Pinya pecks the sign
    const peck = Math.max(0, Math.sin((t - ev.sign2) * 9)) * ((t - ev.sign2) % 2 < 0.6 ? 1 : 0);
    pinya(ctx, 640, 470 - 20 + peck * 8, t);
    walker(ctx, t, ev.sign2, 1200, 820, 1300, 0.95, { gesture: 'think', headRot: 0.14, mouth: talkMouth('arjun', t, 'flat'), brows: 'up' });
  }
  // 5. The door: "ring ONCE"; Arjun rings twice
  function doorLeaves(ctx, open) {
    const dx = 290, dy = 520, dw = 500, dh = 780;
    G.rrect(ctx, dx - 40, dy - 40, dw + 80, dh + 40, 8, { fill: lin(ctx, 0, dy, 0, dy + dh, [[0, '#8E5A30'], [1, '#4A2A14']]), lw: 4, seed: 2070 });
    G.rrect(ctx, dx, dy, dw, dh, 4, { fill: open > 0 ? '#FFE8B0' : '#2A1A10', lw: 0, seed: 2071 });
    const lw = (dw / 2) * (1 - open * 0.85);
    for (const side of [0, 1]) {
      const x = side ? dx + dw - lw : dx;
      G.rrect(ctx, x, dy, lw, dh, 3, { fill: lin(ctx, x, 0, x + lw, 0, [[0, '#7A4422'], [0.5, '#9A5A2C'], [1, '#5A3018']]), lw: 3, seed: 2072 + side });
      for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) { const bx = x + (c + 0.5) * lw / 3, by = dy + 60 + r * 125; G.ellipse(ctx, bx, by, 8 * (lw / 250), 8, { fill: rad(ctx, bx - 2, by - 2, 1, 9, [[0, '#FFF0B0'], [1, '#9A7418']]), lw: 0, seed: 2080 + r * 3 + c }); }
    }
    ao(ctx, dx - 40, dy - 40, dw + 80, 60, 0.4);
  }
  function doorShot(ctx, t) {
    plaster(ctx, C.ochre, 2090);
    doorLeaves(ctx, 0);
    patya(ctx, 540, 240, 760, S.SIGNS.door, { size: 50, seed: 2091, rot: swingRot(t, ev.door, 0.05) });
    // the bell switch
    const bx = 900, by = 900;
    G.rrect(ctx, bx - 40, by - 55, 80, 110, 12, { fill: lin(ctx, bx - 40, by - 55, bx + 40, by + 55, [[0, '#F2D27A'], [1, '#8A6418']]), lw: 3, seed: 2093 });
    G.ellipse(ctx, bx, by, 20, 20, { fill: rad(ctx, bx - 5, by - 5, 2, 22, [[0, '#FFFFFF'], [1, '#B33A2A']]), lw: 3, seed: 2094 });
    for (const r of [ev.ring1, ev.ring2]) { const a = t - r; if (a > 0 && a < 0.6) for (let k = 0; k < 3; k++) { ctx.save(); ctx.globalAlpha = 1 - a / 0.6; ctx.strokeStyle = '#FFF3C4'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(bx, by, 40 + k * 30 + a * 120, -0.8, 0.8); ctx.stroke(); ctx.restore(); } }
    road(ctx, 1300);
    const press = [ev.ring1, ev.ring2].some((r) => t > r - 0.08 && t < r + 0.18);
    const after = t > ev.ring2 + 0.1;
    Ch.person(ctx, { x: 700, y: 1460, s: 1.05, pose: 'stand', style: CAST.arjun, handR: [press ? 192 : 170, press ? -535 : -520], eyes: after ? 'wide' : 'normal', brows: after ? 'worried' : 'neutral', mouth: after ? 'o' : talkMouth('arjun', t, 'flat'), sweat: after ? 1 : 0, look: 0.6, lookY: -0.3, seed: 1250 });
    charger(ctx, 700 - 1.05 * 60, 1460 - 1.05 * 300, 0.9);
  }
  // 6. The door flies open: Aaji
  function openShot(ctx, t) {
    plaster(ctx, C.ochre, 2090);
    const o = ease.outBack(clamp((t - ev.open) / 0.25), 1.4);
    // light spilling out of the house, behind her
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rad(ctx, 540, 900, 40, 700, [[0, 'rgba(255,230,170,0.6)'], [1, 'rgba(255,230,170,0)']]); ctx.fillRect(0, 0, W, H); ctx.restore();
    doorLeaves(ctx, o);
    G.rays(ctx, 540, 820, { n: 26, r0: 200, r1: 1100, color: 'rgba(255,230,160,0.35)', lw: 14, seed: 2100, spin: (t - ev.open) * 0.2 });
    road(ctx, 1300);
    Ch.person(ctx, { x: 540, y: 1390, s: 1.35, pose: 'stand', style: CAST.aaji, gesture: 'akimbo', brows: 'determined', eyes: 'normal', mouth: talkMouth('aaji', t, 'flat'), lookY: 0.4, seed: 1760 });
    const g = t - ev.open - 0.3; if (g > 0 && g < 0.4) G.star(ctx, 600, 640, 40 * Math.sin(g / 0.4 * Math.PI), { fill: '#FFFFFF', seed: 1770 });
    G.decor(() => G.text(ctx, 'आजी', SAFE.x + 20, SAFE.y + 90, { size: 80, color: '#F6F0E2', stroke: '#2A2320', strokeW: 9, ...DEV }));
  }
  // 7. PUNE RULE #2
  function ruleShot(ctx, t) {
    ctx.fillStyle = lin(ctx, 0, 0, W, H, [[0, '#C9A57A'], [1, '#7E5E3E']]); ctx.fillRect(-100, -100, W + 200, H + 200);
    for (let r = 0; r < 18; r++) for (let k = 0; k < 6; k++) { const bx = -60 + k * 210 + (r % 2) * 105, by = r * 110; ctx.fillStyle = `rgba(${120 + Math.round(G.rnd(r, k) * 40)},${70 + Math.round(G.rnd(r, k, 1) * 30)},${40 + Math.round(G.rnd(r, k, 2) * 20)},0.55)`; ctx.fillRect(bx + 4, by + 4, 200, 100); ctx.fillStyle = 'rgba(255,230,200,0.12)'; ctx.fillRect(bx + 4, by + 4, 200, 6); ctx.fillStyle = 'rgba(30,15,5,0.25)'; ctx.fillRect(bx + 4, by + 98, 200, 6); }
    const a = clamp((t - ev.rule) / 0.25);
    const sc = t < ev.rule ? 0 : lerp(1.7, 1, ease.outBack(a, 1.8));
    if (sc > 0) {
      ctx.save(); ctx.translate(540, 760); ctx.scale(sc, sc); ctx.rotate(-0.025);
      softShadow(ctx, 30, 40, 520, 400, 0.6);
      G.rrect(ctx, -440, -330, 880, 660, 20, { fill: lin(ctx, -440, -330, 440, 330, [[0, '#2A7A60'], [1, '#123A2E']]), lw: 8, seed: 1610 });
      ctx.strokeStyle = C.yellow; ctx.lineWidth = 6; ctx.strokeRect(-410, -300, 820, 600);
      G.text(ctx, 'पुण्याचा नियम #२', 0, -160, { size: 96, align: 'center', color: C.yellow, ...DEV });
      G.text(ctx, 'पाटी मालकापेक्षा', 0, -10, { size: 86, align: 'center', color: '#F6F0E2', ...DEV });
      G.text(ctx, 'जास्त कडक!', 0, 120, { size: 110, align: 'center', color: '#F6F0E2', ...DEV });
      ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.moveTo(-440, -330); ctx.lineTo(-100, -330); ctx.lineTo(-440, 60); ctx.fill(); ctx.restore();
      ctx.restore();
      const d = t - ev.rule; if (d < 0.8) for (let k = 0; k < 8; k++) { const ang = k * Math.PI / 4; ctx.save(); ctx.globalAlpha = 0.6 * (1 - d / 0.8); G.ellipse(ctx, 540 + Math.cos(ang) * (480 + d * 300), 760 + Math.sin(ang) * (360 + d * 200), 40 + d * 40, 26 + d * 20, { fill: '#E8DCC8', lw: 0, seed: 1620 + k }); ctx.restore(); }
    }
  }
  // 8. The courtyard: poha
  function courtyard(ctx, t) {
    ctx.fillStyle = lin(ctx, 0, 0, 0, 1100, [[0, '#F4D88E'], [1, '#C99A52']]); ctx.fillRect(-100, -100, W + 200, 1300);
    // wooden pillars + a carved beam
    G.rrect(ctx, -40, 180, W + 80, 60, 0, { fill: lin(ctx, 0, 180, 0, 240, [[0, '#9A5A2C'], [1, '#5A3018']]), lw: 0, seed: 2110 });
    for (const px of [60, 1000]) G.rrect(ctx, px - 30, 240, 60, 900, 6, { fill: lin(ctx, px - 30, 0, px + 30, 0, [[0, '#5A3018'], [0.5, '#9A5A2C'], [1, '#4A2810']]), lw: 0, seed: 2111 + px });
    // floor: Shahabad-stone tiles
    ctx.fillStyle = lin(ctx, 0, 1100, 0, H, [[0, '#8E8270'], [1, '#5E5446']]); ctx.fillRect(-100, 1100, W + 200, H);
    for (let r = 0; r < 8; r++) for (let k = -1; k < 8; k++) { ctx.fillStyle = (r + k) % 2 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'; ctx.fillRect(k * 160 + (r % 2) * 80, 1100 + r * 110, 158, 108); }
    ao(ctx, -100, 1100, W + 200, 60, 0.4);
    // the tulsi vrindavan
    const vx = 540, vy = 1120;
    G.rrect(ctx, vx - 90, vy - 230, 180, 230, 10, { fill: lin(ctx, vx - 90, 0, vx + 90, 0, [[0, '#FFFFFF'], [1, '#C9C0B0']]), lw: 0, seed: 2120 });
    G.rrect(ctx, vx - 110, vy - 260, 220, 40, 8, { fill: '#E07A5F', lw: 0, seed: 2121 });
    for (let k = 0; k < 9; k++) G.ellipse(ctx, vx - 60 + (k % 3) * 60 + Math.sin(k) * 10, vy - 300 - Math.floor(k / 3) * 46, 34, 22, { fill: k % 2 ? '#3C8A4A' : '#2F7A3C', lw: 0, seed: 2122 + k });
    // a shaft of sun
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = lin(ctx, 900, 0, 500, 1300, [[0, 'rgba(255,240,200,0.35)'], [1, 'rgba(255,240,200,0)']]); ctx.beginPath(); ctx.moveTo(700, 0); ctx.lineTo(1080, 0); ctx.lineTo(700, 1300); ctx.lineTo(300, 1300); ctx.fill(); ctx.restore();
  }
  function poha(ctx, x, y, t) {
    G.ellipse(ctx, x, y, 90, 30, { fill: rad(ctx, x - 20, y - 8, 4, 95, [[0, '#FFFFFF'], [1, '#A9AFB5']]), lw: 0, seed: 2130 });
    G.ellipse(ctx, x, y - 8, 70, 20, { fill: '#F2C230', lw: 0, seed: 2131 });
    for (let k = 0; k < 9; k++) G.ellipse(ctx, x - 50 + G.rnd(k, 1) * 100, y - 12 + G.rnd(k, 2) * 10, 5, 3, { fill: k % 3 ? '#3C8A4A' : '#E0503E', lw: 0, seed: 2132 + k });
    for (let k = 0; k < 3; k++) { const p = ((t * 0.5 + k / 3) % 1); ctx.save(); ctx.globalAlpha = 0.5 * Math.sin(p * Math.PI); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 6; ctx.beginPath(); for (let i = 0; i < 10; i++) { const yy = y - 30 - p * 160 - i * 10; const xx = x - 30 + k * 30 + Math.sin(i * 0.8 + t * 3 + k) * 10; i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); ctx.restore(); }
  }
  function courtShot(ctx, t) {
    courtyard(ctx, t);
    Ch.person(ctx, { x: 340, y: 1460, s: 1.05, pose: 'stand', style: CAST.aaji, handR: [190, -380], eyes: 'happy', brows: 'neutral', mouth: talkMouth('aaji', t, 'smile'), look: 0.5, seed: 1760 });
    const reach = clamp((t - ev.court - 1.5) / 0.6);
    Ch.person(ctx, { x: 790, y: 1460, s: 1.05, pose: 'stand', style: CAST.arjun, handL: [lerp(-60, -180, reach), lerp(-300, -390, reach)], eyes: 'happy', mouth: 'grin', look: -0.5, seed: 1250 });
    poha(ctx, 340 + 1.05 * 190 + 20, 1460 - 1.05 * 380 - 10, t);
  }
  // 9. The reveal: Aaji paints; the wall of old signs (since 1978)
  const OLD = [['शांतता राखा', '१९७८'], ['उगाच बेल वाजवू नये', '१९८४'], ['चपला बाहेर काढा', '१९८९'], ['दुपारी १-४ झोप', '१९९२'], ['उधारी बंद', '१९९७'], ['पार्किंग नाही', '२००३'], ['कुत्र्यापासून सावध', '२०११'], ['वायफाय विचारू नये', '२०१९']];
  function paintShot(ctx, t) {
    plaster(ctx, '#E9D3A0', 2140);
    OLD.forEach(([txt, yr], i) => {
      const x = 170 + (i % 3) * 370 + (Math.floor(i / 3) % 2) * 60, y = 260 + Math.floor(i / 3) * 230;
      patya(ctx, x, y, 300, [txt, yr], { size: 32, seed: 2150 + i, rot: (G.rnd(i, 7) - 0.5) * 0.1, paint: i % 2 ? '#F7F1E1' : '#FFF4D6' });
    });
    // the work table and the new sign being painted
    G.rrect(ctx, 120, 1160, 840, 40, 6, { fill: lin(ctx, 0, 1160, 0, 1200, [[0, '#A8683A'], [1, '#5A3018']]), lw: 0, seed: 2160 });
    for (const lx of [160, 900]) G.rrect(ctx, lx, 1200, 30, 260, 4, { fill: '#5A3018', lw: 0, seed: 2161 + lx });
    G.rrect(ctx, 300, 1040, 480, 120, 6, { fill: '#F7F1E1', lw: 0, seed: 2163 });
    const prog = clamp((t - ev.paint - 0.6) / 2.6);
    ctx.save(); ctx.beginPath(); ctx.rect(300, 1040, 480 * prog, 120); ctx.clip();
    G.text(ctx, 'नवीन लोकांचं स्वागत!', 540, 1118, { size: 44, align: 'center', color: '#B3261E', ...DEV });
    ctx.restore();
    for (const [px, col] of [[200, '#B3261E'], [250, '#2A2320'], [860, '#2F7D74']]) { G.rrect(ctx, px - 22, 1110, 44, 50, 8, { fill: '#DADAD6', lw: 0, seed: 2170 + px }); G.ellipse(ctx, px, 1114, 18, 6, { fill: col, lw: 0, seed: 2171 + px }); }
    const bx = 300 + 480 * prog, by = 1090 + Math.sin(t * 14) * 10;
    Ch.person(ctx, { x: 470, y: 1640, s: 1.0, pose: 'stand', style: CAST.aaji, handR: [bx - 470 - 10, by - 1640 + 20], eyes: 'normal', brows: 'neutral', mouth: 'smile', lookY: 0.6, look: 0.3, seed: 1760 });
    G.line(ctx, [[bx - 10, by + 20], [bx + 8, by - 30]], { color: '#8E6444', lw: 7, seed: 2180 }); G.ellipse(ctx, bx - 12, by + 26, 6, 8, { fill: '#B3261E', lw: 0, seed: 2181 });
    Ch.person(ctx, { x: 880, y: 1640, s: 1.0, pose: 'stand', style: CAST.arjun, eyes: 'wide', mouth: 'o', brows: 'up', look: -0.8, gesture: 'think', seed: 1250 });
    G.decor(() => { const a = ease.outBack(clamp((t - ev.paint - 2.2) / 0.3), 2); if (a > 0) { ctx.save(); ctx.translate(540, SAFE.y + 60); ctx.scale(a, a); G.rrect(ctx, -230, -55, 460, 100, 20, { fill: 'rgba(20,20,24,0.8)', lw: 0, seed: 2190 }); G.text(ctx, '१९७८ पासून!', 0, 18, { size: 60, align: 'center', color: C.yellow, ...DEV }); ctx.restore(); } });
  }
  // 10. The gift: Aaji lifts the new sign for Arjun
  function giftShot(ctx, t) {
    courtyard(ctx, t);
    const up = ease.outBack(clamp((t - ev.gift) / 0.5), 1.6);
    const hy = lerp(1000, 520, up);
    Ch.person(ctx, { x: 330, y: 1460, s: 1.05, pose: 'stand', style: CAST.aaji, handR: [200, -(1460 - hy) / 1.05 + 40], handL: [120, -(1460 - hy) / 1.05 + 40], eyes: 'happy', mouth: talkMouth('aaji', t, 'smile'), look: 0.6, seed: 1760 });
    patya(ctx, 560, hy - 40, 640, S.SIGNS.gift, { size: 50, seed: 2200, rot: Math.sin(t * 2) * 0.02 });
    const joy = t > T(25, 2);
    Ch.person(ctx, { x: 850, y: 1460, s: 1.05, pose: 'stand', style: CAST.arjun, gesture: joy ? 'cheer' : null, handL: joy ? undefined : [-30, -500], handR: joy ? undefined : [40, -500], eyes: 'happy', mouth: joy ? talkMouth('arjun', t, 'grin') : 'grin', look: -0.6, seed: 1250 });
    if (joy) for (let k = 0; k < 5; k++) { const a = t - T(25, 2) - k * 0.2; if (a > 0) { ctx.save(); ctx.globalAlpha = Math.max(0, 1 - a * 0.4); G.heart(ctx, 760 + k * 50, 900 - a * 200, 1 + k * 0.1, { seed: 2210 + k }); ctx.restore(); } }
  }
  // 11. Golden hour: the new sign on Aaji's gate; Bablu drives off
  function goldenShot(ctx, t) {
    sky(ctx, '#E9824A', '#FBD9A0', { t, sun: [880, 420] });
    G.ellipse(ctx, 880, 420, 80, 80, { fill: '#FFF0C0', lw: 0, seed: 1900 });
    backdrop(ctx, t, 620);
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(240,150,90,0.35)'; ctx.fillRect(-100, 0, W + 200, 700); ctx.restore();
    wada(ctx, 120, 470, 840, 780, C.ochre, 2220, { shop: false });
    // the gate + the new sign
    G.rrect(ctx, 380, 900, 320, 350, 8, { fill: lin(ctx, 0, 900, 0, 1250, [[0, '#8E5A30'], [1, '#4A2A14']]), lw: 0, seed: 2221 });
    patya(ctx, 540, 760, 460, S.SIGNS.gift, { size: 34, seed: 2200 });
    // Aaji waving from the balcony
    ctx.save(); ctx.translate(800, 690); ctx.scale(0.42, 0.42); Ch.person(ctx, { x: 0, y: 300, s: 1, pose: 'stand', style: CAST.aaji, gesture: 'wave', eyes: 'happy', mouth: 'smile', seed: 1760 }); ctx.restore();
    road(ctx, 1250);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 7; k++) { const a0 = 1.9 + k * 0.17 + Math.sin(t * 0.3 + k) * 0.02; ctx.fillStyle = lin(ctx, 880, 420, 880 + Math.cos(a0) * 1800, 420 + Math.sin(a0) * 1800, [[0, 'rgba(255,220,160,0.22)'], [1, 'rgba(255,220,160,0)']]); ctx.beginPath(); ctx.moveTo(880, 420); ctx.lineTo(880 + Math.cos(a0 - 0.035) * 2000, 420 + Math.sin(a0 - 0.035) * 2000); ctx.lineTo(880 + Math.cos(a0 + 0.035) * 2000, 420 + Math.sin(a0 + 0.035) * 2000); ctx.fill(); }
    ctx.restore();
    const dx = Math.max(0, t - ev.golden - 1.5) * 75, bx = 300 + dx;
    bablu(ctx, { x: bx, y: 1330, s: 0.85, t, dist: bx, face: 'happy', look: 0.2,
      inside: (c) => Ch.person(c, { x: -110, y: -150, s: 0.42, pose: 'sit', style: CAST.arjun, gesture: 'wave', eyes: 'happy', mouth: 'grin', seed: 1250, shadow: false }) });
    pinya(ctx, bx - 60, 1330 - 0.85 * 454 - 16, t);
  }
  // 12. The end card
  function endShot(ctx, t) {
    ctx.fillStyle = rad(ctx, 540, 900, 50, 1400, [[0, '#4A3A2A'], [1, '#120E0A']]); ctx.fillRect(-100, -100, W + 200, H + 200);
    G.rays(ctx, 540, 1000, { n: 30, r0: 200, r1: 1500, color: 'rgba(242,194,48,0.18)', lw: 16, seed: 2000, spin: (t - ev.meter) * 0.2 });
    const a = ease.outBack(clamp((t - ev.meter) / 0.35), 2);
    ctx.save(); ctx.translate(540, SAFE.y + 110); ctx.scale(a, a);
    G.text(ctx, 'पुणे डायरीज', 0, 10, { size: 120, align: 'center', color: C.yellow, stroke: '#1E1E22', strokeW: 10, ...DEV });
    G.text(ctx, 'बबलूसोबत राइड', 0, 100, { size: 56, align: 'center', color: '#F6F0E2', ...DEV });
    ctx.restore();
    const flag = ease.outBack(clamp((t - ev.meter) / 0.25), 1.5);
    bablu(ctx, { x: 520, y: 1110, s: 1.0, t, face: 'wink', flag, look: 0.4 });
    const b = ease.outCubic(clamp((t - ev.meter - 0.6) / 0.4));
    ctx.save(); ctx.globalAlpha = b;
    G.rrect(ctx, 140, 1170, 800, 210, 24, { fill: lin(ctx, 0, 1170, 0, 1380, [[0, '#FFFBEE'], [1, '#E8DCC0']]), lw: 5, seed: 2010 });
    G.text(ctx, 'पुढची राइड  →', 540, 1250, { size: 58, align: 'center', color: '#B5452F', ...DEV });
    G.text(ctx, 'रोहन विरुद्ध हिंजवडी ट्रॅफिक', 540, 1340, { size: 50, align: 'center', color: '#2A2320', ...DEV });
    ctx.restore();
  }

  const film = Shots.film([
    { at: 0, draw: hook, cam: Shots.combine(Shots.push(1.0, 1.05), Shots.shake(22, ev.hook, 6)) },
    { at: ev.lane, draw: laneShot, in: 'whip', cam: Shots.push(1, 1.06) },
    { at: ev.sign1, draw: sign1Shot, in: 'whip', cam: Shots.push(1.0, 1.06) },
    { at: ev.sign2, draw: sign2Shot, in: 'whip', cam: Shots.push(1.0, 1.06) },
    { at: ev.door, draw: doorShot, in: 'cut', cam: (s) => ({ zoom: 1 + 0.12 * ease.inOutQuad(clamp((s.t - ev.door) / (ev.ring1 - ev.door))) + (s.t > ev.ring2 ? 0.08 : 0) }) },
    { at: ev.open, draw: openShot, in: 'flash', cam: Shots.combine(Shots.shake(26, ev.open, 6), (s) => ({ zoom: 1.0 + 0.12 * ease.outCubic(clamp((s.t - ev.open - 0.4) / 0.3)), y: 60 * ease.outCubic(clamp((s.t - ev.open - 0.4) / 0.3)) })) },
    { at: ev.rule, draw: ruleShot, in: 'flash', cam: Shots.shake(24, ev.rule, 6) },
    { at: ev.court, draw: courtShot, in: 'cut', cam: Shots.push(1.0, 1.05) },
    { at: ev.paint, draw: paintShot, in: 'cut', cam: Shots.push(1.0, 1.04) },
    { at: ev.gift, draw: giftShot, in: 'cut', cam: Shots.push(1.0, 1.05) },
    { at: ev.golden, draw: goldenShot, in: 'cut', cam: Shots.push(1.04, 1.0) },
    { at: ev.meter, draw: endShot, in: 'flash' },
  ]);

  // ---------- the cinematic grade: key light from the sun, cool shadows, a colour grade, floating dust ----------
  function grade(ctx, t) {
    const look = t < ev.lane ? 'warm' : t < ev.door ? 'day' : t < ev.rule ? 'warm' : t < ev.court ? 'interior' : t < ev.golden ? 'warm' : t < ev.meter ? 'golden' : 'night';
    const L = {
      day: { key: 'rgba(255,236,200,0.22)', shade: 'rgba(40,60,110,0.22)', soft: 'rgba(255,200,150,0.12)', dust: 0.5 },
      warm: { key: 'rgba(255,220,170,0.25)', shade: 'rgba(60,40,30,0.25)', soft: 'rgba(255,180,120,0.14)', dust: 0.3 },
      noon: { key: 'rgba(255,250,230,0.32)', shade: 'rgba(40,60,110,0.16)', soft: 'rgba(255,230,180,0.12)', dust: 0.8 },
      interior: { key: 'rgba(255,200,150,0.15)', shade: 'rgba(20,10,30,0.35)', soft: 'rgba(255,150,90,0.12)', dust: 0.4 },
      golden: { key: 'rgba(255,190,120,0.30)', shade: 'rgba(70,30,60,0.25)', soft: 'rgba(255,140,60,0.18)', dust: 1 },
      night: { key: 'rgba(255,220,170,0.08)', shade: 'rgba(10,10,30,0.3)', soft: 'rgba(120,140,255,0.06)', dust: 0 },
    }[look];
    ctx.save();
    ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = rad(ctx, W * 0.92, -80, 50, 1700, [[0, L.key], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = lin(ctx, W, 0, 0, H, [[0, 'rgba(255,255,255,0)'], [0.55, 'rgba(255,255,255,0)'], [1, L.shade.replace(/rgba\((\d+),(\d+),(\d+),([\d.]+)\)/, (m, r, g, b, a) => `rgba(${255 - Math.round((255 - r) * a)},${255 - Math.round((255 - g) * a)},${255 - Math.round((255 - b) * a)},1)`)]]); ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = L.soft; ctx.fillRect(0, 0, W, H);
    if (L.dust > 0) { ctx.globalCompositeOperation = 'lighter'; for (let k = 0; k < 40; k++) { const x = (G.rnd(k, 1) * W + t * (6 + G.rnd(k, 2) * 14)) % W, y = (G.rnd(k, 3) * H * 0.75 + Math.sin(t * 0.7 + k) * 20); const r = 2 + G.rnd(k, 4) * 4; ctx.fillStyle = rad(ctx, x, y, 0, r * 3, [[0, `rgba(255,240,200,${0.35 * L.dust})`], [1, 'rgba(255,240,200,0)']]); ctx.fillRect(x - r * 3, y - r * 3, r * 6, r * 6); } }
    ctx.restore();
  }

  // the English subtitle under the Marathi caption, wrapped to the safe width
  function altLine(ctx, t) {
    const l = VO && [...VO.lines].reverse().find((q) => t >= q.t && t <= q.end + 0.4); if (!l || !l.alt) return;
    const size = 36, maxW = SAFE.w * 0.95, words = l.alt.split(' '), rows = [];
    let cur = '';
    for (const w of words) { const n = cur ? cur + ' ' + w : w; if (G.measure(ctx, n, size, 'Inter', 700) > maxW && cur) { rows.push(cur); cur = w; } else cur = n; }
    if (cur) rows.push(cur);
    const a = clamp((t - l.t) / 0.2);
    ctx.save(); ctx.globalAlpha = a;
    rows.forEach((r, i) => G.text(ctx, r, SAFE.x + SAFE.w / 2, SAFE.y + SAFE.h - 48 + i * 42, { size, fam: 'Inter', weight: 700, align: 'center', color: '#F2F2F2', stroke: '#000000', strokeW: 6, boil: 0 }));
    ctx.restore();
  }

  // the big comic word pops (SLAM!)
  function pops(ctx, t) {
    for (const p of S.pops) {
      const a = t - p.t; if (a < 0 || a > 0.7) continue;
      const k = ease.outBack(clamp(a / 0.14), 2.6);
      ctx.save(); ctx.globalAlpha = 1 - clamp((a - 0.5) / 0.2); ctx.translate(330, 760); ctx.rotate(-0.08 + 0.04 * Math.sin(p.t * 7)); ctx.scale(k * p.big, k * p.big);
      G.text(ctx, p.text, 0, 0, { size: 160, align: 'center', color: '#FF5A3C', stroke: '#2A2320', strokeW: 14, ...DEV });
      ctx.restore();
    }
  }

  Studio.film({
    post: { vignette: 0.32, grain: 0.035, paper: 0, bloom: 0.28 },
    fadeOut: 0.4,
    async init() {
      VO = await Studio.loadJSON('out/voice.json');
      SUBS = Subs.fromVoice({ ...VO, lines: VO.lines.map((l) => { const q = { ...l }; delete q.display; delete q.alt; return q; }) }, { maxWords: 5, hold: 0.4 }).sort((x, y) => x.t - y.t);
      SUBS.forEach((x, i) => { const n = SUBS[i + 1]; if (n && x.end > n.t - 0.03) x.end = n.t - 0.03; });
    },
    draw(ctx, t) {
      film(ctx, t);
      grade(ctx, t);
      pops(ctx, t);
      if (t < ev.meter) { Subs.draw(ctx, t, SUBS, { style: 'pop', y: SAFE.y + SAFE.h - 104 }); altLine(ctx, t); }
    },
  });
})();
