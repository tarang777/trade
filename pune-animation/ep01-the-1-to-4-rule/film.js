// THE FILM for EP01 "The 1-to-4 Rule". A list of shots (Shots.film); every frame is a pure function of t.
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

  // ---------- SHOTS ----------
  // 1. HOOK: the shutter slams on camera
  function hook(ctx, t) {
    ctx.fillStyle = lin(ctx, 0, 0, W, H, [[0, '#F0CF7A'], [1, '#B98A3E']]); ctx.fillRect(-100, -100, W + 200, H + 200);
    const c = t < ev.hook ? lerp(0.25, 1, ease.inQuad(clamp(t / ev.hook))) : 1;
    shopFront(ctx, 90, 470, 900, 900, c, 1000, { sign: 'मोबाईल · इलेक्ट्रॉनिक्स', signCol: '#2F7D74', sleepy: t > ev.hook + 0.4 ? 1 : 0, t, band: true });
    road(ctx, 1380);
  }
  // 2. Bablu in the Peth lane
  function laneShot(ctx, t) {
    lane(ctx, t);
    const face = t > T(2, 0.6) && t < T(2, 1.4) ? 'wink' : 'normal';
    bablu(ctx, { x: 520, y: 1280, s: 1.15, t, face, look: 0.3, inside: (c) => Ch.person(c, { x: -110, y: -150, s: 0.42, pose: 'sit', style: CAST.arjun, gesture: t > T(3, 0.5) ? 'wave' : 'phone', eyes: 'normal', mouth: 'smile', seed: 1250, shadow: false }) });
    pinya(ctx, 420, 1280 - 1.15 * 454 - 20, t);
    // the series badge
    G.decor(() => {
      G.rrect(ctx, SAFE.x + 10, SAFE.y + 10, 480, 140, 18, { fill: 'rgba(20,20,24,0.82)', lw: 0, seed: 1100 });
      G.text(ctx, 'पुणे डायरीज', SAFE.x + 40, SAFE.y + 78, { size: 58, color: C.yellow, ...DEV });
      G.text(ctx, 'भाग १ · एक ते चार', SAFE.x + 40, SAFE.y + 128, { size: 34, color: '#F6F0E2', ...DEV });
    });
  }
  // 3. Arjun in the back seat, phone at 2%
  function arjunShot(ctx, t) {
    ctx.fillStyle = rad(ctx, 760, 500, 40, 1400, [[0, '#7A6048'], [1, '#1E1712']]); ctx.fillRect(-100, -100, W + 200, H + 200);
    // the canopy frame and the street behind, out of focus
    ctx.save(); ctx.filter = 'blur(10px)'; ctx.fillStyle = '#E9C46A'; ctx.fillRect(-40, 120, 380, 700); ctx.fillStyle = '#8AB6A8'; ctx.fillRect(360, 160, 300, 640); ctx.restore();
    G.rrect(ctx, -40, 80, W + 80, 70, 0, { fill: lin(ctx, 0, 80, 0, 150, [[0, '#FFE38A'], [1, '#B88A0E']]), lw: 0, seed: 1199 });
    // seat back
    G.rrect(ctx, 60, 1050, 960, 300, 40, { fill: lin(ctx, 0, 1050, 0, 1350, [[0, '#3E9A90'], [1, '#1C4E48']]), lw: 5, seed: 1200 });
    const shake = t > T(5, 1) && t < T(6, 3) ? Math.sin(t * 40) * 10 : 0;
    Ch.person(ctx, { x: 420 + shake, y: 1900, s: 2.1, pose: 'stand', style: CAST.arjun, handR: [150, -620], handL: [-60, -420], brows: 'worried', eyes: 'wide', mouth: talkMouth('arjun', t, 'o'), sweat: 0.8, seed: 1250, look: 0.4 });
    // the phone, big
    const px = 650 + shake, py = 420;
    G.rrect(ctx, px, py, 300, 540, 36, { fill: '#1E1E22', lw: 5, seed: 1260 });
    G.rrect(ctx, px + 18, py + 30, 264, 480, 20, { fill: '#F6F0E2', lw: 3, seed: 1261 });
    const pct = t < T(6) ? 2 : 1;
    const flash = Math.floor(t * 3) % 2 === 0;
    G.rrect(ctx, px + 70, py + 180, 140, 70, 10, { fill: null, lw: 7, color: '#2A2320', seed: 1262 });
    G.rrect(ctx, px + 210, py + 200, 14, 30, 3, { fill: '#2A2320', lw: 0, seed: 1263 });
    if (flash) G.rrect(ctx, px + 78, py + 188, 14, 54, 3, { fill: '#E0503E', lw: 0, seed: 1264 });
    G.text(ctx, pct + '%', px + 150, py + 360, { size: 110, align: 'center', fam: 'Bungee', weight: 400, color: '#E0503E' });
    G.text(ctx, 'बॅटरी कमी', px + 150, py + 430, { size: 36, align: 'center', color: '#2A2320', ...DEV });
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rad(ctx, px + 150, py + 270, 20, 420, [[0, 'rgba(255,240,220,0.25)'], [1, 'rgba(255,240,220,0)']]); ctx.fillRect(px - 300, py - 200, 900, 900); ctx.restore(); // screen glow on his face
    G.decor(() => G.text(ctx, 'पुण्यात पहिला दिवस', SAFE.x + 20, SAFE.y + 80, { size: 64, color: C.yellow, stroke: '#2A2320', strokeW: 8, ...DEV }));
  }
  // 4. The dashboard clock: 1:05 PM
  function clockShot(ctx, t) {
    ctx.fillStyle = rad(ctx, 540, 760, 40, 1300, [[0, '#3A3A44'], [1, '#0C0C10']]); ctx.fillRect(-100, -100, W + 200, H + 200);
    const cx = 540, cy = 640, r = 310;
    softShadow(ctx, cx + 30, cy + 40, r + 60, r + 60, 0.6);
    G.ellipse(ctx, cx, cy, r + 30, r + 30, { fill: lin(ctx, cx - r, cy - r, cx + r, cy + r, [[0, '#FFE38A'], [1, '#A87C0C']]), lw: 6, seed: 1300 });
    G.ellipse(ctx, cx, cy, r, r, { fill: rad(ctx, cx - 80, cy - 100, 20, r * 1.2, [[0, '#FFFFFF'], [1, '#E6DCC0']]), lw: 5, seed: 1301 });
    for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; G.line(ctx, [[cx + Math.cos(a) * (r - 20), cy + Math.sin(a) * (r - 20)], [cx + Math.cos(a) * (r - 55), cy + Math.sin(a) * (r - 55)]], { color: '#2A2320', lw: k % 3 ? 5 : 10, seed: 1302 + k }); }
    const hr = (1 + 5 / 60) / 12 * Math.PI * 2 - Math.PI / 2, mn = 5 / 60 * Math.PI * 2 - Math.PI / 2;
    const beats = Math.floor((t - ev.clock) / BEAT); const sec = (beats * 6) / 60 * Math.PI * 2 - Math.PI / 2;
    G.line(ctx, [[cx, cy], [cx + Math.cos(hr) * 170, cy + Math.sin(hr) * 170]], { color: '#2A2320', lw: 18, seed: 1320 });
    G.line(ctx, [[cx, cy], [cx + Math.cos(mn) * 260, cy + Math.sin(mn) * 260]], { color: '#2A2320', lw: 12, seed: 1321 });
    G.line(ctx, [[cx, cy], [cx + Math.cos(sec) * 280, cy + Math.sin(sec) * 280]], { color: '#E0503E', lw: 5, seed: 1322 });
    G.ellipse(ctx, cx, cy, 18, 18, { fill: '#E0503E', lw: 3, seed: 1323 });
    ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.beginPath(); ctx.ellipse(cx - 110, cy - 150, 150, 60, -0.5, 0, Math.PI * 2); ctx.fill(); ctx.restore(); // glass reflection
    G.text(ctx, 'दुपारी १:०५', cx, cy + r + 180, { size: 120, align: 'center', color: '#F6F0E2', stroke: '#2A2320', strokeW: 10, ...DEV });
    // the marigold on the dash
    for (let k = 0; k < 9; k++) G.ellipse(ctx, 120 + k * 32, 1300 + Math.sin(k) * 8, 18, 18, { fill: k % 2 ? C.marigold : '#F7B733', lw: 2.5, seed: 1330 + k });
    if (t >= ev.uhoh) { const a = clamp((t - ev.uhoh) / 0.12); ctx.save(); ctx.globalAlpha = 0.25 * a; ctx.fillStyle = '#E0503E'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  }
  // 5. The three shops. i = 0,1,2; each bigger.
  const SHOPS = [
    { go: ev.shop1Go, slam: ev.slam1, sign: 'मोबाईल शॉप', col: C.ochre, signCol: '#2F7D74', keeper: 'keeper1', size: 0.8 },
    { go: ev.shop2Go, slam: ev.slam2, sign: 'हार्डवेअर', col: C.teal, signCol: '#B5452F', keeper: 'keeper2', size: 1.05 },
    { go: ev.shop3Go, slam: ev.slam3, sign: 'इलेक्ट्रिकल्स', col: C.terra, signCol: '#6B4E8A', keeper: 'keeper3', size: 1.4 },
  ];
  function shopShot(i) {
    return (ctx, t) => {
      const sp = SHOPS[i];
      sky(ctx, undefined, undefined, { t });
      backdrop(ctx, t, 520);
      // the shop: a wada with a big opening
      wada(ctx, 70, 380, 940, 870, sp.col, 400 + i * 50, { shop: false });
      const close = t < sp.slam - 0.45 ? lerp(0.05, 0.45, clamp((t - sp.go) / (sp.slam - 0.45 - sp.go))) : t < sp.slam ? lerp(0.45, 1, ease.inQuad(clamp((t - (sp.slam - 0.45)) / 0.45))) : 1;
      // the keeper inside, hand up on the shutter (drawn before the shutter so it covers him)
      const sx0 = 190, sy0 = 870, sw = 700, shh = 380;
      ctx.save(); ctx.beginPath(); ctx.rect(sx0, sy0, sw, shh); ctx.clip();
      G.rrect(ctx, sx0, sy0, sw, shh, 3, { fill: '#5A4636', lw: 0, seed: 470 });
      Ch.person(ctx, { x: 540, y: 1620, s: 1.0, pose: 'stand', style: CAST[sp.keeper], handR: [90, -600], handL: [-90, -600], eyes: i === 1 ? 'closed' : 'normal', mouth: i === 1 ? 'o' : 'flat', seed: 480 + i * 10 });
      ctx.restore();
      shopFront(ctx, sx0, sy0, sw, shh, close, 450 + i * 20, { sign: sp.sign, signCol: sp.signCol, sleepy: t > sp.slam + 0.3 ? 1 : 0, t });
      road(ctx, 1250);
      // Bablu races in and skids to a stop exactly on the slam
      const arrive = ease.outCubic(clamp((t - sp.go) / (sp.slam - sp.go)));
      const bx = lerp(-420, 300, arrive);
      const after = t > sp.slam;
      if (!after) for (let k = 0; k < 4; k++) { ctx.save(); ctx.globalAlpha = 0.45 * (1 - arrive); G.ellipse(ctx, bx - 320 - k * 60, 1260 - k * 8, 50 + k * 16, 26 + k * 6, { fill: '#E8DCC8', lw: 0, seed: 490 + k }); ctx.restore(); }
      bablu(ctx, { x: bx, y: 1290, s: 0.95, t, dist: bx, face: after ? (i === 2 ? 'wide' : 'worried') : 'normal', look: 0.6,
        inside: (c) => Ch.person(c, { x: -110, y: -150, s: 0.42, pose: 'sit', style: CAST.arjun, eyes: after ? 'wide' : 'normal', mouth: after ? 'o' : 'flat', brows: 'worried', seed: 1250, shadow: false }) });
      // Pinya: on the canopy, and on the third slam it tumbles off
      const top = 1290 - 0.95 * 454 - 18;
      if (i < 2 || t < sp.slam) pinya(ctx, bx - 60, top, t);
      else { const a = t - sp.slam; pinya(ctx, bx - 60 - a * 260, top - 380 * a + 700 * a * a, t, { flap: 1, s: 1.1 }); for (let k = 0; k < 5; k++) { const fx = bx - 60 + (G.rnd(k, 1) - 0.5) * 200, fy = top + a * 120 + G.rnd(k, 2) * 60; ctx.save(); ctx.globalAlpha = Math.max(0, 1 - a * 0.6); ctx.translate(fx, fy); ctx.rotate(Math.sin(t * 6 + k)); G.ellipse(ctx, 0, 0, 16, 6, { fill: '#C9C9D2', lw: 2, seed: 495 + k }); ctx.restore(); } }
      // the shop counter label, top-left
      G.decor(() => G.text(ctx, `दुकान ${'१२३'[i]}`, SAFE.x + 20, SAFE.y + 80, { size: 68, color: '#F6F0E2', stroke: '#2A2320', strokeW: 9, ...DEV }));
    };
  }
  // 6. The empty lane at noon
  function emptyShot(ctx, t) {
    lane(ctx, t, { close: 1, sleepy: 1 });
    // heat shimmer
    for (let k = 0; k < 4; k++) { const pts = []; for (let i = 0; i <= 12; i++) pts.push([100 + i * 75, 300 + k * 30 + Math.sin(t * 4 + i + k) * 8]); ctx.save(); ctx.globalAlpha = 0.25; G.line(ctx, pts, { color: '#FFFFFF', lw: 4, seed: 1500 + k }); ctx.restore(); }
    // the sleeping dog
    Ch.dog(ctx, { x: 920, y: 1250, s: 0.8, t, happy: 0, pose: 'sit', seed: 1510 });
    for (let k = 0; k < 2; k++) { const p = ((t * 0.6 + k / 2) % 1); ctx.save(); ctx.globalAlpha = Math.sin(p * Math.PI); G.text(ctx, 'z', 960 + p * 60, 1090 - p * 140, { size: 30 + p * 30, fam: 'Bungee', weight: 400, color: '#FFFFFF', stroke: '#2A2320', strokeW: 5 }); ctx.restore(); }
    bablu(ctx, { x: 330, y: 1240, s: 0.8, t, face: mouthOf('bablu', t) ? 'happy' : 'normal', look: 0.8 });
    const curfew = t < T(14, 0.5);
    Ch.person(ctx, { x: 740, y: 1250, s: 0.85, pose: 'stand', style: CAST.arjun, gesture: curfew ? 'shrug' : t > T(16) ? 'facepalm' : 'think', eyes: curfew ? 'wide' : 'normal', brows: 'worried', mouth: talkMouth('arjun', t, 'o'), look: -0.6, seed: 1250 });
    // the vamkukshi card
    const v0 = T(15, 1), v1 = T(17);
    if (t > v0 && t < v1) G.decor(() => {
      const a = ease.outBack(clamp((t - v0) / 0.3), 2);
      ctx.save(); ctx.translate(540, SAFE.y + 120); ctx.scale(a, a); ctx.rotate(-0.03);
      G.rrect(ctx, -420, -90, 840, 180, 22, { fill: '#F6F0E2', lw: 5, seed: 1520 });
      G.text(ctx, 'वामकुक्षी', 0, -10, { size: 70, align: 'center', color: '#B5452F', ...DEV });
      G.text(ctx, 'जेवणानंतरची पवित्र झोप', 0, 58, { size: 42, align: 'center', color: '#2A2320', ...DEV });
      ctx.restore();
    });
  }
  // 7. PUNE RULE #1
  function ruleShot(ctx, t) {
    ctx.fillStyle = lin(ctx, 0, 0, W, H, [[0, '#C9A57A'], [1, '#7E5E3E']]); ctx.fillRect(-100, -100, W + 200, H + 200);
    // laterite stone blocks, like the old wada walls
    for (let r = 0; r < 18; r++) for (let k = 0; k < 6; k++) { const bx = -60 + k * 210 + (r % 2) * 105, by = r * 110; ctx.fillStyle = `rgba(${120 + Math.round(G.rnd(r, k) * 40)},${70 + Math.round(G.rnd(r, k, 1) * 30)},${40 + Math.round(G.rnd(r, k, 2) * 20)},0.55)`; ctx.fillRect(bx + 4, by + 4, 200, 100); ctx.fillStyle = 'rgba(255,230,200,0.12)'; ctx.fillRect(bx + 4, by + 4, 200, 6); ctx.fillStyle = 'rgba(30,15,5,0.25)'; ctx.fillRect(bx + 4, by + 98, 200, 6); }
    const a = clamp((t - ev.rule) / 0.25);
    const sc = t < ev.rule ? 0 : lerp(1.7, 1, ease.outBack(a, 1.8));
    if (sc > 0) {
      ctx.save(); ctx.translate(540, 760); ctx.scale(sc, sc); ctx.rotate(-0.025);
      softShadow(ctx, 30, 40, 520, 400, 0.6);
      G.rrect(ctx, -440, -330, 880, 660, 20, { fill: lin(ctx, -440, -330, 440, 330, [[0, '#2A7A60'], [1, '#123A2E']]), lw: 8, seed: 1610 });
      ctx.strokeStyle = C.yellow; ctx.lineWidth = 6; ctx.strokeRect(-410, -300, 820, 600);
      G.text(ctx, 'पुण्याचा नियम #१', 0, -160, { size: 96, align: 'center', color: C.yellow, ...DEV });
      G.text(ctx, 'दुपारी १ ते ४,', 0, -10, { size: 86, align: 'center', color: '#F6F0E2', ...DEV });
      G.text(ctx, 'पुणं झोपतं!', 0, 120, { size: 110, align: 'center', color: '#F6F0E2', ...DEV });
      ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.moveTo(-440, -330); ctx.lineTo(-100, -330); ctx.lineTo(-440, 60); ctx.fill(); ctx.restore(); // sheen
      ctx.restore();
      // dust puffs from the stamp
      const d = t - ev.rule; if (d < 0.8) for (let k = 0; k < 8; k++) { const ang = k * Math.PI / 4; ctx.save(); ctx.globalAlpha = 0.6 * (1 - d / 0.8); G.ellipse(ctx, 540 + Math.cos(ang) * (480 + d * 300), 760 + Math.sin(ang) * (360 + d * 200), 40 + d * 40, 26 + d * 20, { fill: '#E8DCC8', lw: 0, seed: 1620 + k }); ctx.restore(); }
      // Pinya returns, a little bandaged, onto the board
      if (t > ev.rule + 1) { const p = ease.outCubic(clamp((t - ev.rule - 1) / 0.6)); pinya(ctx, lerp(1200, 820, p), lerp(200, 420 - 18, p), t, { flap: p < 1 ? 1 : 0.05, facing: -1 }); if (p >= 1) G.rrect(ctx, 790, 380, 40, 12, 3, { fill: '#F6F0E2', lw: 2, seed: 1630 }); }
    }
  }
  // 8. Aaji at her balcony
  function balcony(ctx, t, { lean = 0 } = {}) {
    sky(ctx, undefined, undefined, { t, sun: [980, 60] });
    // the big wada wall
    G.poly(ctx, [[-60, 300], [W + 60, 300], [W - 40, 170], [40, 170]], { fill: lin(ctx, 0, 170, 0, 300, [[0, '#D0654A'], [1, '#8E3220']]), lw: 5, seed: 1700, step: 40 });
    G.rrect(ctx, -20, 300, W + 40, H, 0, { fill: lin(ctx, 0, 300, W, H, [[0, '#F4D88E'], [1, '#B98A3E']]), lw: 5, seed: 1701 });
    ao(ctx, -20, 300, W + 40, 80, 0.5);
    // the doorway behind Aaji
    G.rrect(ctx, 250, 470, 210, 500, 14, { fill: '#5A3A22', lw: 6, seed: 1702 });
    G.rrect(ctx, 620, 470, 210, 500, 14, { fill: '#5A3A22', lw: 6, seed: 1704 });
    G.rrect(ctx, 230, 450, 620, 540, 18, { fill: null, color: C.wood, lw: 12, seed: 1703 });
    G.rrect(ctx, 460, 470, 160, 500, 4, { fill: '#2E2218', lw: 4, seed: 1705 });
  }
  function balconyRail(ctx, y, wallTo = H + 40) {
    G.rrect(ctx, -20, y + 140, W + 40, wallTo - y - 140, 0, { fill: lin(ctx, 0, y + 140, 0, wallTo, [[0, '#D9B46A'], [1, '#B98A3E']]), lw: 4, seed: 1709 });
    ao(ctx, -20, y + 142, W + 40, 70, 0.45);
    G.rrect(ctx, 80, y, 920, 28, 4, { fill: C.wood, lw: 5, seed: 1710 });
    for (let k = 0; k < 22; k++) G.rrect(ctx, 100 + k * 41, y + 28, 18, 90, 8, { fill: '#9A6238', lw: 3, seed: 1711 + k });
    G.rrect(ctx, 80, y + 118, 920, 24, 4, { fill: C.wood, lw: 5, seed: 1740 });
    for (const bx of [130, 950]) G.poly(ctx, [[bx - 24, y + 142], [bx + 24, y + 142], [bx, y + 230]], { fill: C.wood, lw: 4, seed: 1741 + bx, step: 14 });
    // a tulsi pot on the rail
    G.rrect(ctx, 850, y - 70, 90, 70, 10, { fill: '#B5452F', lw: 4, seed: 1750 });
    for (let k = 0; k < 6; k++) G.ellipse(ctx, 870 + (k % 3) * 25, y - 90 - Math.floor(k / 3) * 30, 18, 12, { fill: '#3C8A4A', lw: 2.5, seed: 1751 + k });
  }
  function aajiShot(ctx, t) {
    balcony(ctx, t);
    Ch.person(ctx, { x: 540, y: 1400, s: 1.35, pose: 'stand', style: CAST.aaji, gesture: mouthOf('aaji', t) ? 'point' : 'akimbo', brows: 'up', eyes: 'normal', look: 0.2, lookY: 0.6, mouth: talkMouth('aaji', t, 'smile'), seed: 1760 });
    balconyRail(ctx, 960);
    // the glint on her spectacles
    const g = t - ev.aaji - 0.25; if (g > 0 && g < 0.4) G.star(ctx, 600, 660, 34 * Math.sin(g / 0.4 * Math.PI), { fill: '#FFFFFF', seed: 1770 });
    G.decor(() => G.text(ctx, 'आजी', SAFE.x + 20, SAFE.y + 90, { size: 80, color: '#F6F0E2', stroke: '#2A2320', strokeW: 9, ...DEV }));
  }
  // 9. Arjun: "Charger… dying…"
  function dyingShot(ctx, t) {
    ctx.fillStyle = rad(ctx, 540, 700, 50, 1300, [[0, '#C9BBA4'], [1, '#6E6456']]); ctx.fillRect(-100, -100, W + 200, H + 200);
    const droop = ease.inOutQuad(clamp((t - T(21)) / (BEAT * 3)));
    Ch.person(ctx, { x: 540, y: 1900 + droop * 60, s: 2.0, pose: 'stand', style: CAST.arjun, gesture: 'phone', headRot: -0.15 * droop, eyes: 'closed', brows: 'worried', mouth: talkMouth('arjun', t, 'o'), sweat: 1, seed: 1250 });
    G.decor(() => G.text(ctx, '1%', 820, 520, { size: 120, align: 'center', fam: 'Bungee', weight: 400, color: '#E0503E', stroke: '#2A2320', strokeW: 10 }));
  }
  // 10. The basket comes down; Arjun catches it
  function basketShot(ctx, t) {
    sky(ctx, undefined, undefined, { t });
    // upper: the balcony, seen from below (Aaji small, leaning over)
    G.rrect(ctx, -20, 0, W + 40, 1000, 0, { fill: lin(ctx, 0, 0, W, 1000, [[0, '#F4D88E'], [1, '#B98A3E']]), lw: 5, seed: 1800 });
    Ch.person(ctx, { x: 640, y: 690, s: 0.75, pose: 'stand', style: CAST.aaji, handR: [120, -330], handL: [-60, -300], lookY: 1, look: -0.2, mouth: talkMouth('aaji', t, 'smile'), eyes: 'happy', seed: 1760 });
    ctx.save(); ctx.translate(0, -560); balconyRail(ctx, 960, 1560); ctx.restore();
    // the lane below
    road(ctx, 1000);
    // the basket on its rope
    const u = ease.inOutSine ? ease.inOutSine(clamp((t - ev.basket) / (ev.catch - ev.basket))) : ease.inOutQuad(clamp((t - ev.basket) / (ev.catch - ev.basket)));
    const swing = Math.sin(t * 3.2) * 18 * (1 - clamp((t - ev.catch) * 2));
    const handX = 640 + 0.75 * 120, handY = 690 - 0.75 * 330;
    const bx = 600 + swing, by = lerp(handY + 120, 940, u);
    G.line(ctx, [[handX, handY], [bx, by - 40]], { color: '#6B4A2A', lw: 4, seed: 1820 });
    G.ellipse(ctx, bx, by + 10, 90, 34, { fill: '#C89B5A', lw: 4, seed: 1821, hatch: { color: 'rgba(90,50,20,0.35)', gap: 9 } });
    G.rrect(ctx, bx - 90, by - 30, 180, 40, 12, { fill: '#D9AE6E', lw: 4, seed: 1822 });
    G.line(ctx, [[bx - 80, by - 26], [bx, by - 70], [bx + 80, by - 26]], { color: '#8E6444', lw: 5, seed: 1823 });
    // the charger cable peeking out
    G.line(ctx, [[bx - 20, by - 30], [bx - 30, by - 70], [bx - 10, by - 90]], { color: '#F6F0E2', lw: 6, seed: 1824 });
    G.rrect(ctx, bx - 22, by - 108, 24, 22, 3, { fill: '#F6F0E2', lw: 3, seed: 1825 });
    // Arjun reaching up, then hugging it
    const caught = t >= ev.catch;
    if (caught) G.rays(ctx, 560, 1000, { n: 24, r0: 120, r1: 900, color: 'rgba(242,194,48,0.55)', lw: 12, seed: 1830, spin: (t - ev.catch) * 0.3 });
    Ch.person(ctx, { x: 560, y: 1680, s: 1.25, pose: 'stand', style: CAST.arjun, handR: caught ? [60, -520] : [70, -640 + Math.sin(t * 8) * 10], handL: caught ? [-40, -500] : [-30, -560], lookY: caught ? 0 : -1, eyes: caught ? 'happy' : 'wide', brows: caught ? 'neutral' : 'worried', mouth: caught ? 'grin' : 'o', seed: 1250 });
    if (caught) { for (let k = 0; k < 4; k++) { const a = t - ev.catch - k * 0.15; if (a > 0) { ctx.save(); ctx.globalAlpha = Math.max(0, 1 - a * 0.5); G.heart(ctx, 420 + k * 90, 900 - a * 220, 1 + k * 0.1, { seed: 1840 + k }); ctx.restore(); } } }
  }
  // 11. Golden hour: the shutters roll up, Bablu drives off with Arjun waving
  function goldenShot(ctx, t) {
    sky(ctx, '#E9824A', '#FBD9A0', { t, sun: [880, 420] });
    G.ellipse(ctx, 880, 420, 80, 80, { fill: '#FFF0C0', lw: 0, seed: 1900 });
    backdrop(ctx, t, 620);
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgba(240,150,90,0.35)'; ctx.fillRect(-100, 0, W + 200, 700); ctx.restore();
    // the wada row, with 5 small shops
    const cols = [C.ochre, C.teal, C.terra, C.cream, C.ochre];
    for (let k = 0; k < 5; k++) {
      const x = -40 + k * 232, w = 232;
      G.poly(ctx, [[x - 10, 620], [x + w + 10, 620], [x + w - 20, 540], [x + 20, 540]], { fill: lin(ctx, 0, 540, 0, 620, [[0, '#D0654A'], [1, '#8E3220']]), lw: 4, seed: 1910 + k, step: 30 });
      G.rrect(ctx, x, 620, w, 640, 2, { fill: lin(ctx, x, 620, x + w, 1260, [[0, tint(cols[k], 0.15)], [1, tint(cols[k], -0.25)]]), lw: 4, seed: 1920 + k });
      ao(ctx, x, 620, w, 40, 0.45);
      G.rrect(ctx, x + 40, 680, w - 80, 110, 40, { fill: lin(ctx, x, 680, x + w, 790, [[0, '#FFD9A0'], [1, '#3E5C6A']]), lw: 4, seed: 1930 + k });
      const open = clamp((t - S.reopen[k]) / 0.35);
      shopFront(ctx, x + 22, 960, w - 44, 270, 1 - ease.outCubic(open), 1940 + k * 10, { sign: ['चहा', 'किराणा', 'मोबाईल', 'मिठाई', 'पुस्तकं'][k], signCol: ['#2F7D74', '#B5452F', '#6B4E8A', '#2F7D74', '#B5452F'][k], band: false });
      if (open > 0 && open < 1) { ctx.save(); ctx.globalAlpha = 1 - open; G.star(ctx, x + w / 2, 940, 30, { fill: '#FFF3C4', seed: 1990 + k }); ctx.restore(); }
    }
    // the wall clock: 4:00
    G.ellipse(ctx, 540, 380, 64, 64, { fill: '#FFFBEA', lw: 5, seed: 1995 });
    G.line(ctx, [[540, 380], [540, 330]], { color: '#2A2320', lw: 6, seed: 1996 }); G.line(ctx, [[540, 380], [574, 400]], { color: '#2A2320', lw: 8, seed: 1997 });
    G.text(ctx, '४:००', 540, 490, { size: 46, align: 'center', color: '#2A2320', ...DEV });
    road(ctx, 1250);
    // golden light wash
    // god rays from the low sun
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 7; k++) { const a0 = 1.9 + k * 0.17 + Math.sin(t * 0.3 + k) * 0.02; ctx.fillStyle = lin(ctx, 880, 420, 880 + Math.cos(a0) * 1800, 420 + Math.sin(a0) * 1800, [[0, 'rgba(255,220,160,0.22)'], [1, 'rgba(255,220,160,0)']]); ctx.beginPath(); ctx.moveTo(880, 420); ctx.lineTo(880 + Math.cos(a0 - 0.035) * 2000, 420 + Math.sin(a0 - 0.035) * 2000); ctx.lineTo(880 + Math.cos(a0 + 0.035) * 2000, 420 + Math.sin(a0 + 0.035) * 2000); ctx.fill(); }
    ctx.restore();
    // Bablu drives slowly to the right, Arjun waving out of the back
    const dx = Math.max(0, t - T(26)) * 70;
    const bx = 330 + dx;
    bablu(ctx, { x: bx, y: 1330, s: 0.85, t, dist: bx, face: 'happy', look: 0.2,
      inside: (c) => Ch.person(c, { x: -110, y: -150, s: 0.42, pose: 'sit', style: CAST.arjun, gesture: 'wave', eyes: 'happy', mouth: 'grin', seed: 1250, shadow: false }) });
    pinya(ctx, bx - 60, 1330 - 0.85 * 454 - 16, t);
  }
  // 12. The end card: METER DOWN
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
    G.text(ctx, 'आजीच्या पुणेरी पाट्या', 540, 1340, { size: 56, align: 'center', color: '#2A2320', ...DEV });
    ctx.restore();
  }

  const film = Shots.film([
    { at: 0, draw: hook, cam: Shots.shake(34, ev.hook, 6) },
    { at: ev.lane, draw: laneShot, in: 'whip', cam: Shots.push(1, 1.06) },
    { at: ev.arjun, draw: arjunShot, in: 'cut', cam: Shots.handheld(8) },
    { at: ev.clock, draw: clockShot, in: 'cut', cam: (s) => ({ zoom: s.t < ev.uhoh ? 1 + 0.05 * s.u : 1.25 }) },
    { at: ev.shop1Go, draw: shopShot(0), in: 'whip', cam: Shots.shake(18, ev.slam1, 6) },
    { at: ev.shop2Go, draw: shopShot(1), in: 'cut', cam: Shots.combine(Shots.push(1.05, 1.08), Shots.shake(26, ev.slam2, 6)) },
    { at: ev.shop3Go, draw: shopShot(2), in: 'cut', cam: Shots.combine(Shots.push(1.12, 1.16), Shots.shake(42, ev.slam3, 5)) },
    { at: ev.empty, draw: emptyShot, in: 'cut', cam: Shots.push(1.0, 1.08) },
    { at: ev.rule, draw: ruleShot, in: 'flash', cam: Shots.shake(24, ev.rule, 6) },
    { at: ev.aaji, draw: aajiShot, in: 'cut', cam: Shots.push(1.0, 1.06) },
    { at: T(21), draw: dyingShot, in: 'cut' },
    { at: ev.basket, draw: basketShot, in: 'cut' },
    { at: ev.golden, draw: goldenShot, in: 'cut', cam: Shots.push(1.04, 1.0) },
    { at: ev.meter, draw: endShot, in: 'flash' },
  ]);

  // ---------- the cinematic grade: key light from the sun, cool shadows, a colour grade, floating dust ----------
  function grade(ctx, t) {
    const look = t < ev.lane ? 'warm' : t < ev.arjun ? 'day' : t < ev.clock ? 'interior' : t < ev.shop1Go ? 'night' : t < ev.empty ? 'day' : t < ev.rule ? 'noon' : t < ev.aaji ? 'warm' : t < ev.golden ? 'day' : t < ev.meter ? 'golden' : 'night';
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
      ctx.save(); ctx.globalAlpha = 1 - clamp((a - 0.5) / 0.2); ctx.translate(540, SAFE.y + 230); ctx.rotate(-0.08 + 0.04 * Math.sin(p.t * 7)); ctx.scale(k * p.big, k * p.big);
      G.text(ctx, p.text, 0, 0, { size: 160, align: 'center', color: '#FF5A3C', stroke: '#2A2320', strokeW: 14, ...DEV });
      ctx.restore();
    }
  }

  Studio.film({
    post: { vignette: 0.32, grain: 0.035, paper: 0, bloom: 0.28 },
    fadeOut: 0.4,
    async init() {
      VO = await Studio.loadJSON('out/voice.json');
      SUBS = Subs.fromVoice(VO, { maxWords: 5 }).map((x) => { const y = { ...x }; delete y.alt; return y; });
    },
    draw(ctx, t) {
      film(ctx, t);
      grade(ctx, t);
      pops(ctx, t);
      if (t < ev.meter) { Subs.draw(ctx, t, SUBS, { style: 'pop', y: SAFE.y + SAFE.h - 104 }); altLine(ctx, t); }
    },
  });
})();
