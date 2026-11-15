// THE FILM for EP04 "Meera's Misal Challenge". A list of shots (Shots.film); every frame is a pure function of t.
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

  // ---------- EP04: the misal challenge ----------
  CAST.meera = { outfit: 'kameez', shirt: '#E3A62B', bottoms: 'pants', pants: '#3E5C8A', skin: '#C98A62', hairStyle: 'curly', hair: '#1E1A1A', shoes: '#F6F0E2' };
  CAST.kaka = { outfit: 'kameez', shirt: '#F3F1EA', bottoms: 'pants', pants: '#F3F1EA', skin: '#8D5A3B', hairStyle: 'bald', hair: '#BDBDBD', facialHair: 'mustache', glasses: 'round', build: 'broad' };
  const mixCol = (a, b, k) => { const p = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)); const x = p(a), y = p(b); return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * clamp(k)).toString(16).padStart(2, '0')).join(''); };
  const hot = (k) => ({ ...CAST.arjun, skin: mixCol('#8D5A3B', '#D2452E', k) });
  function steamPuffs(ctx, x, y, t, t0, n = 6, dir = -1, scale = 1) {
    for (let k = 0; k < n; k++) { const a = ((t - t0) * 1.4 + k / n) % 1; ctx.save(); ctx.globalAlpha = 0.75 * (1 - a); G.ellipse(ctx, x + dir * a * 160 * scale + Math.sin(k * 3 + t * 4) * 10, y - a * 120 * scale, (24 + a * 50) * scale, (18 + a * 36) * scale, { fill: '#FFFFFF', lw: 0, seed: 3000 + k }); ctx.restore(); }
  }
  function misalBowl(ctx, x, y, r, gravy, t, heat = 0) {
    if (heat > 0.9) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rad(ctx, x, y, 10, r * 2.2, [[0, 'rgba(255,60,20,0.55)'], [1, 'rgba(255,60,20,0)']]); ctx.fillRect(x - r * 2.5, y - r * 2.5, r * 5, r * 5); ctx.restore(); }
    softShadow(ctx, x + 20, y + 30, r * 1.6, r * 0.7, 0.5);
    G.ellipse(ctx, x, y, r * 1.55, r * 0.75, { fill: rad(ctx, x - r * 0.5, y - r * 0.3, 10, r * 1.6, [[0, '#F4F6F8'], [1, '#8E959C']]), lw: 0, seed: 3010 });
    // pav on the plate
    for (const [px, py] of [[x + r * 0.95, y + r * 0.15], [x + r * 1.1, y - r * 0.18]]) G.ellipse(ctx, px, py, r * 0.32, r * 0.2, { fill: rad(ctx, px - 10, py - 10, 2, r * 0.34, [[0, '#F7D9A0'], [1, '#B8742E']]), lw: 0, seed: 3011 });
    // the katori + gravy
    G.ellipse(ctx, x - r * 0.2, y, r * 0.95, r * 0.52, { fill: rad(ctx, x - r * 0.4, y - r * 0.2, 6, r, [[0, '#FFFFFF'], [1, '#9AA1A8']]), lw: 0, seed: 3012 });
    G.ellipse(ctx, x - r * 0.2, y + 4, r * 0.82, r * 0.42, { fill: rad(ctx, x - r * 0.3, y - 6, 4, r * 0.85, [[0, tint(gravy, 0.25)], [1, tint(gravy, -0.25)]]), lw: 0, seed: 3013 });
    // oil sheen + bubbles
    ctx.save(); ctx.globalAlpha = 0.35; G.ellipse(ctx, x - r * 0.45, y - r * 0.1, r * 0.22, r * 0.08, { fill: '#FFD27A', lw: 0, seed: 3014 }); ctx.restore();
    for (let k = 0; k < 4 + heat * 10; k++) { const p = ((t * (0.8 + heat) + G.rnd(k, 1)) % 1); const bx = x - r * 0.2 + (G.rnd(k, 2) - 0.5) * r * 1.3, by = y + (G.rnd(k, 3) - 0.5) * r * 0.6; ctx.save(); ctx.globalAlpha = Math.sin(p * Math.PI) * 0.7; G.ellipse(ctx, bx, by, 6 + p * 8, 4 + p * 5, { fill: tint(gravy, 0.35), lw: 0, seed: 3020 + k }); ctx.restore(); }
    // farsan, onion, coriander, lemon
    for (let k = 0; k < 26; k++) { const a = G.rnd(k, 4) * Math.PI * 2, d = Math.sqrt(G.rnd(k, 5)) * r * 0.45; G.ellipse(ctx, x - r * 0.15 + Math.cos(a) * d, y - r * 0.05 + Math.sin(a) * d * 0.5, 7, 3, { fill: k % 2 ? '#F2B84B' : '#D9862A', lw: 0, seed: 3040 + k }); }
    for (let k = 0; k < 8; k++) G.ellipse(ctx, x - r * 0.35 + G.rnd(k, 6) * r * 0.5, y - r * 0.12 + G.rnd(k, 7) * r * 0.2, 8, 5, { fill: '#F4D8E4', lw: 0, seed: 3070 + k });
    for (let k = 0; k < 10; k++) G.ellipse(ctx, x - r * 0.4 + G.rnd(k, 8) * r * 0.6, y - r * 0.15 + G.rnd(k, 9) * r * 0.25, 5, 4, { fill: '#3C8A4A', lw: 0, seed: 3080 + k });
    G.poly(ctx, [[x - r * 1.2, y + r * 0.2], [x - r * 1.0, y + r * 0.05], [x - r * 0.95, y + r * 0.32]], { fill: '#E9E36A', lw: 0, seed: 3090, step: 10 });
    steamPuffs(ctx, x - r * 0.2, y - r * 0.3, t, 0, 3 + Math.round(heat * 3), 0, 0.8 + heat * 0.6);
  }
  function eateryBg(ctx, t, dark = 0) {
    ctx.fillStyle = lin(ctx, 0, 0, 0, 1100, [[0, '#E8F0EC'], [1, '#B8C8C0']]); ctx.fillRect(-100, -100, W + 200, 1300);
    for (let r = 0; r < 12; r++) for (let k = 0; k < 10; k++) { ctx.fillStyle = (r + k) % 2 ? 'rgba(60,120,100,0.10)' : 'rgba(255,255,255,0.25)'; ctx.fillRect(k * 120, 300 + r * 70, 118, 68); }
    G.rrect(ctx, 240, 380, 600, 150, 16, { fill: lin(ctx, 0, 380, 0, 530, [[0, '#2A7A60'], [1, '#123A2E']]), lw: 0, seed: 3100 });
    G.text(ctx, 'मिसळ पाव', 540, 452, { size: 62, align: 'center', color: C.yellow, ...DEV });
    G.text(ctx, 'तर्री · फरसाण · पाव · ताक', 540, 508, { size: 34, align: 'center', color: '#F6F0E2', ...DEV });
    ctx.fillStyle = lin(ctx, 0, 1100, 0, H, [[0, '#9A8E7C'], [1, '#5E5446']]); ctx.fillRect(-100, 1100, W + 200, H);
    ao(ctx, -100, 1100, W + 200, 50, 0.35);
    if (dark) { ctx.fillStyle = `rgba(20,10,20,${dark})`; ctx.fillRect(-100, -100, W + 200, H + 200); }
  }
  function table(ctx, y) { G.rrect(ctx, -40, y, W + 80, 40, 6, { fill: lin(ctx, 0, y, 0, y + 40, [[0, '#E4E8EC'], [1, '#8E959C']]), lw: 0, seed: 3110 }); G.rrect(ctx, -40, y + 40, W + 80, H, 0, { fill: lin(ctx, 0, y + 40, 0, H, [[0, '#7E858C'], [1, '#4A4F55']]), lw: 0, seed: 3111 }); }

  // 1. HOOK: Arjun's red face, steam from his ears
  function hook(ctx, t) {
    ctx.fillStyle = rad(ctx, 540, 800, 40, 1300, [[0, '#F2B84B'], [1, '#B5452F']]); ctx.fillRect(-100, -100, W + 200, H + 200);
    const k = t < ev.hook ? 0.6 : 1;
    const shake = t > ev.hook ? Math.sin(t * 60) * 8 : 0;
    Ch.person(ctx, { x: 540 + shake, y: 2350, s: 3.0, pose: 'stand', style: hot(k), eyes: 'wide', brows: 'worried', mouth: 'open', sweat: 1, seed: 1250 });
    if (t >= ev.hook) { steamPuffs(ctx, 360, 780, t, ev.hook, 7, -1, 1.4); steamPuffs(ctx, 720, 780, t, ev.hook, 7, 1, 1.4); }
    { const a = t - ev.hook; if (a >= 0 && a < 0.12) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,255,240,${0.8 * (1 - a / 0.12)})`; ctx.fillRect(-100, -100, W + 200, H + 200); ctx.restore(); } }
    // tears
    for (const ex of [470, 610]) { const p = ((t * 1.5) % 1); ctx.save(); ctx.globalAlpha = 0.85; G.ellipse(ctx, ex, 760 + p * 160, 10, 16, { fill: '#8FD3F2', lw: 0, seed: 3120 }); ctx.restore(); }
  }
  // 2. The vlog: Meera films, Arjun boasts
  function eateryShot(ctx, t) {
    eateryBg(ctx, t);
    table(ctx, 1250);
    misalBowl(ctx, 300, 1255, 70, '#E07A2E', t, 0.2);
    const boast = t > T(5);
    Ch.person(ctx, { x: 330, y: 1500, s: 1.1, pose: 'stand', style: CAST.meera, gesture: 'phone', eyes: 'happy', mouth: talkMouth('meera', t, 'grin'), look: 0.5, seed: 3130 });
    Ch.person(ctx, { x: 780, y: 1500, s: 1.1, pose: 'stand', style: CAST.arjun, gesture: boast ? 'akimbo' : 'thumbsUp', brows: 'determined', eyes: 'normal', mouth: talkMouth('arjun', t, 'smirk'), look: -0.5, seed: 1250 });
    G.decor(() => { G.rrect(ctx, SAFE.x + 10, SAFE.y + 10, 520, 140, 18, { fill: 'rgba(20,20,24,0.82)', lw: 0, seed: 1100 }); G.text(ctx, 'पुणे डायरीज', SAFE.x + 40, SAFE.y + 78, { size: 58, color: C.yellow, ...DEV }); G.text(ctx, 'भाग ४ · मिसळ चॅलेंज', SAFE.x + 40, SAFE.y + 128, { size: 34, color: '#F6F0E2', ...DEV });
      if (Math.floor(t * 2) % 2) G.ellipse(ctx, 780, SAFE.y + 330, 14, 14, { fill: '#E0503E', lw: 0, seed: 3131 }); G.text(ctx, 'लाईव्ह', 870, SAFE.y + 344, { size: 40, align: 'center', color: '#FFFFFF', stroke: '#2A2320', strokeW: 6, ...DEV }); });
  }
  // 3. Bablu peeks in at the door, worried
  function peekShot(ctx, t) {
    eateryBg(ctx, t);
    G.rrect(ctx, -40, 560, 620, 700, 10, { fill: lin(ctx, 0, 560, 0, 1260, [[0, '#9FD3E8'], [1, '#E8F2EC']]), lw: 0, seed: 3140 });
    const slide = ease.outBack(clamp((t - ev.peek) / 0.5), 1.5);
    ctx.save(); ctx.beginPath(); ctx.rect(-40, 560, 620, 700); ctx.clip();
    road(ctx, 1180);
    bablu(ctx, { x: lerp(-700, 150, slide), y: 1250, s: 1.3, t, face: 'worried', look: 0.8 });
    ctx.restore();
    G.rrect(ctx, 560, 540, 40, 740, 6, { fill: '#7A4A2A', lw: 0, seed: 3141 });
  }
  // 4–6. The three levels: the bowl slides in; Arjun reacts below
  function levelShot(i) {
    return (ctx, t) => {
      const L = S.LEVELS[i], a = t - L.t;
      eateryBg(ctx, t, i === 2 ? 0.45 : 0);
      table(ctx, 1080);
      const slide = i === 2 ? 1 : ease.outBack(clamp(a / 0.3), 1.6);
      if (i === 2) { ctx.save(); const p = lerp(1.35, 1, ease.outBack(clamp(a / 0.15), 2)); ctx.translate(540, 760); ctx.scale(p, p); ctx.translate(-540, -760); }
      misalBowl(ctx, lerp(-400, 540, slide), 760, 230, L.gravy, t, L.heat);
      if (i === 2) ctx.restore();
      if (false) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(220,230,255,${0.85 * (1 - a / 0.12)})`; ctx.fillRect(-100, -100, W + 200, H + 200); ctx.restore(); }
      if (i === 2) for (let k = 0; k < 2; k++) { const fl = a > 1.2 && Math.sin(t * 13 + k * 3) > 0.95; if (fl) G.line(ctx, [[120 + k * 800, 300], [180 + k * 800, 420], [130 + k * 800, 470], [200 + k * 800, 600]], { color: '#FFF6D0', lw: 6, seed: 3150 + k }); }
      const heat = i === 0 ? 0.15 : i === 1 ? 0.5 + 0.2 * clamp((t - T(11, 3)) / 2) : 0.6;
      const o = i === 0 ? { gesture: 'thumbsUp', eyes: 'happy', brows: 'neutral', mouth: talkMouth('arjun', t, 'grin'), sweat: 0 }
        : i === 1 ? { handL: [-150, -470 + Math.sin(t * 18) * 40], eyes: 'normal', brows: 'worried', mouth: talkMouth('arjun', t, 'flat'), sweat: 0.9 }
          : { eyes: 'wide', brows: 'worried', mouth: 'o', sweat: 1, gesture: 'facepalm' };
      Ch.person(ctx, { x: 540, y: 1700, s: 1.15, pose: 'stand', style: hot(heat), look: 0, lookY: -0.4, seed: 1250, ...o });
      if (i === 1) { const fx = 540 - 1.15 * 150, fy = 1700 - 1.15 * (470 - Math.sin(t * 18) * 40); G.rrect(ctx, fx - 50, fy - 90, 100, 130, 8, { fill: '#F6F0E2', lw: 0, seed: 3160 }); } // fanning with the menu
      if (i >= 1) for (let k = 0; k < 5; k++) { const p = ((t * 0.8 + k / 5) % 1); ctx.save(); ctx.globalAlpha = 0.4 * Math.sin(p * Math.PI); G.line(ctx, [[380 + k * 80, 1100 - p * 200], [395 + k * 80, 1060 - p * 200], [380 + k * 80, 1020 - p * 200]], { color: '#FFFFFF', lw: 4, seed: 3170 + k }); ctx.restore(); }
      // Meera's level card
      G.decor(() => { const c = ease.outBack(clamp(a / 0.3), 2); ctx.save(); ctx.translate(540, SAFE.y + 70); ctx.scale(c, c); G.rrect(ctx, -330, -60, 660, 110, 22, { fill: i === 2 ? '#7E140E' : 'rgba(20,20,24,0.85)', lw: 0, seed: 3180 + i }); G.text(ctx, L.name, 0, 18, { size: 56, align: 'center', color: C.yellow, ...DEV }); ctx.restore(); });
    };
  }
  // 7. The bite: silence, the face goes red
  function biteShot(ctx, t) {
    eateryBg(ctx, t, 0.35);
    const k = clamp((t - ev.bite) / (ev.blast - ev.bite));
    Ch.person(ctx, { x: 540, y: 2200, s: 2.6, pose: 'stand', style: hot(0.6 + 0.4 * k), handR: [40, -560], eyes: k > 0.5 ? 'wide' : 'closed', brows: 'worried', mouth: 'flat', sweat: k, seed: 1250 });
    G.line(ctx, [[540 + 2.6 * 40, 2200 - 2.6 * 560], [540 + 2.6 * 40 - 30, 2200 - 2.6 * 560 - 180]], { color: '#BFC4C8', lw: 14, seed: 3190 }); // the spoon
    if (k > 0.6) steamPuffs(ctx, 540, 900, t, ev.bite, 3, 0, 0.6 + k);
  }
  // 8. BLAST OFF: fire, up through the clouds over Pune, and back down
  function blastShot(ctx, t) {
    const a = t - ev.blast, up = Math.min(a, 2.6), alt = up < 2.6 ? ease.inQuad(up / 2.6) * 2600 : 2600 - ease.inQuad(clamp((a - 2.6) / 1.4)) * 2600;
    const g = ctx.createLinearGradient(0, 0, 0, H); const sp = clamp(alt / 2600);
    g.addColorStop(0, mixCol('#5FA8D8', '#0B1030', sp)); g.addColorStop(1, mixCol('#E8F2EC', '#3A4A8A', sp)); ctx.fillStyle = g; ctx.fillRect(-100, -100, W + 200, H + 200);
    if (sp > 0.5) for (let k = 0; k < 60; k++) { ctx.fillStyle = `rgba(255,255,255,${(sp - 0.5) * 2 * (0.4 + G.rnd(k, 1) * 0.6)})`; ctx.fillRect(G.rnd(k, 2) * W, G.rnd(k, 3) * H, 3, 3); }
    ctx.save(); ctx.translate(0, alt * 0.6);
    backdrop(ctx, t, 1500); road(ctx, 1700);
    for (let k = 0; k < 6; k++) { const cy = 600 - k * 520, cx = (k % 2 ? 300 : 760); ctx.save(); ctx.globalAlpha = 0.85; for (let j = 0; j < 4; j++) { ctx.fillStyle = rad(ctx, cx + j * 80 - 120, cy, 5, 120, [[0, 'rgba(255,255,255,0.95)'], [1, 'rgba(255,255,255,0)']]); ctx.beginPath(); ctx.ellipse(cx + j * 80 - 120, cy - (j % 2) * 30, 140, 70, 0, 0, Math.PI * 2); ctx.fill(); } ctx.restore(); }
    ctx.restore();
    const falling = a > 2.6, py = falling ? 1100 + Math.sin(a * 6) * 20 : 1250 - Math.sin(Math.min(a, 0.4) / 0.4 * Math.PI / 2) * 250;
    const rot = falling ? (a - 2.6) * 6 : Math.sin(a * 20) * 0.05;
    ctx.save(); ctx.translate(540, py); ctx.rotate(rot); ctx.translate(-540, -py);
    if (!falling) { for (let k = 0; k < 9; k++) { const fl = 0.6 + 0.4 * Math.sin(t * 40 + k); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rad(ctx, 540 + (k - 4) * 14, py + 60 + k * 30 * fl, 2, 90, [[0, 'rgba(255,240,150,0.9)'], [0.5, 'rgba(255,120,30,0.6)'], [1, 'rgba(255,60,20,0)']]); ctx.fillRect(400, py, 280, 520); ctx.restore(); } }
    Ch.person(ctx, { x: 540, y: py, s: 0.95, pose: 'stand', style: hot(1), gesture: 'cheer', eyes: 'wide', brows: 'worried', mouth: 'open', sweat: 1, seed: 1250 });
    const mx = 540, my = py - 0.95 * 470;
    if (!falling) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let k = 0; k < 5; k++) { ctx.fillStyle = rad(ctx, mx, my - 30 - k * 45, 2, 70 - k * 8, [[0, 'rgba(255,230,120,0.9)'], [1, 'rgba(255,80,20,0)']]); ctx.fillRect(mx - 90, my - 140 - k * 45, 180, 180); } ctx.restore(); }
    if (a >= 0 && a < 0.12) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,220,160,${0.7 * (1 - a / 0.12)})`; ctx.fillRect(-100, -100, W + 200, H + 200); ctx.restore(); }
  }
  // 9. PUNE RULE #4
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
      G.text(ctx, 'पुण्याचा नियम #४', 0, -160, { size: 96, align: 'center', color: C.yellow, ...DEV });
      G.text(ctx, 'मिसळला कधीच', 0, -10, { size: 86, align: 'center', color: '#F6F0E2', ...DEV });
      G.text(ctx, '"क्यूट" म्हणू नका!', 0, 130, { size: 96, align: 'center', color: '#F6F0E2', ...DEV });
      ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.moveTo(-440, -330); ctx.lineTo(-100, -330); ctx.lineTo(-440, 60); ctx.fill(); ctx.restore();
      ctx.restore();
      const d = t - ev.rule; if (d < 0.8) for (let k = 0; k < 8; k++) { const ang = k * Math.PI / 4; ctx.save(); ctx.globalAlpha = 0.6 * (1 - d / 0.8); G.ellipse(ctx, 540 + Math.cos(ang) * (480 + d * 300), 760 + Math.sin(ang) * (360 + d * 200), 40 + d * 40, 26 + d * 20, { fill: '#E8DCC8', lw: 0, seed: 1620 + k }); ctx.restore(); }
    }
  }
  // 10. Chai-stall Kaka: buttermilk
  function kakaShot(ctx, t) {
    sky(ctx, undefined, undefined, { t });
    backdrop(ctx, t, 600);
    wada(ctx, -100, 480, 1280, 780, C.cream, 3200, { shop: false, balcony: false });
    // the stall: a striped tarp canopy, a counter, a brass kettle, glasses
    G.poly(ctx, [[60, 640], [1020, 640], [1080, 760], [0, 760]], { fill: '#2F7D74', lw: 0, seed: 3210, step: 30 });
    for (let k = 0; k < 9; k++) G.poly(ctx, [[60 + k * 107, 640], [113 + k * 107, 640], [120 + k * 120 - 0, 760], [k * 120, 760]], { fill: k % 2 ? '#F6F0E2' : '#2F7D74', lw: 0, seed: 3211 + k, step: 30 });
    G.rrect(ctx, 0, 760, W, 30, 0, { fill: '#1E4E48', lw: 0, seed: 3220 });
    G.text(ctx, 'अमृततुल्य', 540, 735, { size: 52, align: 'center', color: '#B3261E', ...DEV });
    Ch.person(ctx, { x: 360, y: 1330, s: 1.05, pose: 'stand', style: CAST.kaka, handR: [200, -280], eyes: 'happy', brows: 'neutral', mouth: talkMouth('kaka', t, 'smile'), look: 0.6, seed: 3230 });
    G.rrect(ctx, -20, 1060, 700, 80, 6, { fill: lin(ctx, 0, 1060, 0, 1140, [[0, '#D9C6A0'], [1, '#8E7A5A']]), lw: 0, seed: 3231 });
    G.rrect(ctx, -20, 1140, 700, 200, 0, { fill: lin(ctx, 0, 1140, 0, 1340, [[0, '#A8683A'], [1, '#5A3018']]), lw: 0, seed: 3232 });
    G.ellipse(ctx, 120, 1010, 70, 55, { fill: rad(ctx, 100, 990, 4, 80, [[0, '#FFE8A0'], [1, '#A87A18']]), lw: 0, seed: 3233 }); G.line(ctx, [[180, 1000], [240, 960]], { color: '#C9A227', lw: 10, seed: 3234 });
    for (let k = 0; k < 4; k++) G.rrect(ctx, 260 + k * 50, 1020, 34, 44, 6, { fill: 'rgba(240,220,180,0.85)', lw: 0, seed: 3235 + k });
    road(ctx, 1250);
    const drink = t > ev.kaka + 3.2;
    const relief = clamp((t - ev.kaka - 3.6) / 1.5);
    Ch.person(ctx, { x: 820, y: 1500, s: 1.1, pose: 'stand', style: hot(0.8 * (1 - relief)), handL: drink ? [30, -470] : [-160, -400], eyes: drink ? 'closed' : 'normal', brows: 'worried', mouth: drink ? 'smile' : 'o', sweat: 1 - relief, look: -0.6, seed: 1250 });
    const gx = drink ? 820 + 1.1 * 30 : 360 + 1.05 * 200 + 20, gy = drink ? 1500 - 1.1 * 470 - 20 : 1330 - 1.05 * 280 - 10;
    G.rrect(ctx, gx - 22, gy - 34, 44, 64, 6, { fill: lin(ctx, gx - 22, 0, gx + 22, 0, [[0, '#FFFFFF'], [1, '#D8DDE2']]), lw: 0, seed: 3240 });
    if (!drink) steamPuffs(ctx, 820, 1500 - 1.1 * 520, t, ev.kaka, 4, 0, 0.8);
  }
  // 11. The vlog outro: 11/10
  function ratingShot(ctx, t) {
    eateryBg(ctx, t);
    Ch.person(ctx, { x: 330, y: 1560, s: 1.15, pose: 'stand', style: CAST.meera, gesture: 'phone', eyes: 'happy', mouth: talkMouth('meera', t, 'grin'), look: 0.3, seed: 3130 });
    Ch.person(ctx, { x: 760, y: 1560, s: 1.15, pose: 'stand', style: hot(0.1), gesture: 'thumbsUp', eyes: 'happy', mouth: talkMouth('arjun', t, 'grin'), look: -0.3, seed: 1250 });
    for (const ex of [730, 790]) { ctx.save(); ctx.globalAlpha = 0.7; G.ellipse(ctx, ex, 1560 - 1.15 * 470 + ((t * 2) % 1) * 60, 7, 11, { fill: '#8FD3F2', lw: 0, seed: 3250 }); ctx.restore(); }
    const a = t - ev.sticker;
    if (a >= 0) { const sc = lerp(2, 1, ease.outBack(clamp(a / 0.2), 2)); ctx.save(); ctx.translate(560, 560); ctx.rotate(-0.12); ctx.scale(sc, sc); G.ellipse(ctx, 0, 0, 200, 200, { fill: rad(ctx, -40, -40, 10, 210, [[0, '#FFE38A'], [1, '#E0A010']]), lw: 0, seed: 3260 }); ctx.strokeStyle = '#B3261E'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(0, 0, 180, 0, Math.PI * 2); ctx.stroke(); G.text(ctx, '११/१०', 0, 40, { size: 110, align: 'center', color: '#B3261E', ...DEV }); ctx.restore();
      for (let k = 0; k < 6; k++) { const ha = a - k * 0.15; if (ha > 0) { ctx.save(); ctx.globalAlpha = Math.max(0, 1 - ha * 0.4); G.heart(ctx, 260 + k * 110, 900 - ha * 180, 1.1, { seed: 3270 + k }); ctx.restore(); } }
      if (a < 0.1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,240,200,${0.45 * (1 - a / 0.1)})`; ctx.fillRect(-100, -100, W + 200, H + 200); ctx.restore(); } }
  }
  // 12. End card
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
    G.text(ctx, 'पुण्यातला पहिला पाऊस', 540, 1340, { size: 54, align: 'center', color: '#2A2320', ...DEV });
    ctx.restore();
  }

  const film = Shots.film([
    { at: 0, draw: hook, cam: Shots.combine(Shots.push(1.0, 1.06), Shots.shake(24, ev.hook, 6)) },
    { at: ev.eatery, draw: eateryShot, in: 'whip', cam: Shots.push(1, 1.05) },
    { at: ev.peek, draw: peekShot, in: 'cut' },
    { at: ev.l1, draw: levelShot(0), in: 'cut', cam: Shots.shake(10, ev.l1, 6) },
    { at: ev.l2, draw: levelShot(1), in: 'cut', cam: Shots.shake(16, ev.l2, 6) },
    { at: ev.l3, draw: levelShot(2), in: 'cut', cam: Shots.combine(Shots.push(1.0, 1.12), Shots.shake(26, ev.l3, 5)) },
    { at: ev.bite, draw: biteShot, in: 'cut', cam: Shots.push(1.0, 1.1) },
    { at: ev.blast, draw: blastShot, in: 'flash', cam: Shots.shake(34, ev.blast, 4) },
    { at: ev.rule, draw: ruleShot, in: 'flash', cam: Shots.shake(24, ev.rule, 6) },
    { at: ev.kaka, draw: kakaShot, in: 'cut', cam: Shots.push(1.0, 1.05) },
    { at: ev.rating, draw: ratingShot, in: 'cut', cam: Shots.shake(14, ev.sticker, 6) },
    { at: ev.meter, draw: endShot, in: 'flash' },
  ]);

  // ---------- the cinematic grade: key light from the sun, cool shadows, a colour grade, floating dust ----------
  function grade(ctx, t) {
    const look = t < ev.eatery ? 'warm' : t < ev.l3 ? 'interior' : t < ev.blast ? 'night' : t < ev.rule ? 'day' : t < ev.kaka ? 'warm' : t < ev.rating ? 'day' : t < ev.meter ? 'interior' : 'night';
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
      ctx.save(); ctx.globalAlpha = 1 - clamp((a - 0.5) / 0.2); ctx.translate(540, SAFE.y + 260); ctx.rotate(-0.08 + 0.04 * Math.sin(p.t * 7)); ctx.scale(k * p.big, k * p.big);
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
