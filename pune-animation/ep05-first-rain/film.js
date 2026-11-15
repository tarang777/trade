// THE FILM for EP05 "First Rain". A list of shots (Shots.film); every frame is a pure function of t.
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

  // ---------- EP05: first rain ----------
  CAST.rohan = { outfit: 'hoodie', shirt: '#7E8590', skin: '#B97D55', hairStyle: 'short', hair: '#1E1A1A', facialHair: 'none', bottoms: 'pants', pants: '#2F3A5A', shoes: '#EDEDED' };
  CAST.meera = { outfit: 'kameez', shirt: '#E3A62B', bottoms: 'pants', pants: '#3E5C8A', skin: '#C98A62', hairStyle: 'curly', hair: '#1E1A1A', shoes: '#F6F0E2' };
  const RUN = [
    { outfit: 'tee', shirt: '#E0703E', bottoms: 'pants', pants: '#2F3A5A', skin: '#8D5A3B', hairStyle: 'curly', hair: '#1E1A1A' },
    { outfit: 'kameez', shirt: '#B79CFF', skin: '#D59B72', hairStyle: 'ponytail', hair: '#1E1A1A' },
    { outfit: 'shirt', shirt: '#3FA89B', bottoms: 'pants', pants: '#3A3A44', skin: '#A86E4B', hairStyle: 'short', hair: '#2A2A2A' },
    { outfit: 'sari', robe: '#E8718D', shirt: '#3FA89B', skin: '#C98A62', hairStyle: 'bun', hair: '#1E1A1A' },
  ];
  // the rain: deterministic streaks, density k; splashes on the ground line gy
  function rain(ctx, t, k = 1, gy = 1250) {
    if (k <= 0) return;
    ctx.save(); ctx.strokeStyle = 'rgba(220,235,255,0.55)'; ctx.lineWidth = 2.5; ctx.beginPath();
    const n = Math.round(140 * k);
    for (let i = 0; i < n; i++) { const x0 = G.rnd(i, 1) * (W + 300) - 150, sp = 1700 + G.rnd(i, 2) * 700, y = ((G.rnd(i, 3) * 2400 + t * sp) % 2400) - 300; const x = x0 - (y + 300) * 0.12; ctx.moveTo(x, y); ctx.lineTo(x - 9, y + 60); }
    ctx.stroke();
    for (let i = 0; i < Math.round(30 * k); i++) { const p = (t * 2.2 + G.rnd(i, 4)) % 1; const x = G.rnd(i, 5) * W, y = gy + 20 + G.rnd(i, 6) * (H - gy - 40); ctx.strokeStyle = `rgba(230,240,255,${0.5 * (1 - p)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y, 6 + p * 34, 2 + p * 10, 0, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
  }
  function stormSky(ctx, t, { flash = 0, clear = 0 } = {}) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, mixCol('#3E4A5A', '#F2B26A', clear)); g.addColorStop(0.6, mixCol('#8A97A6', '#FBD9A0', clear)); g.addColorStop(1, mixCol('#A9B4BE', '#FBE8C8', clear)); ctx.fillStyle = g; ctx.fillRect(-100, -100, W + 200, H + 200);
    for (let k = 0; k < 6; k++) { const cx = ((G.rnd(k, 3) * 1400 + t * (14 + k * 4)) % 1600) - 260, cy = 140 + k * 60; ctx.save(); ctx.globalAlpha = 0.75 * (1 - clear * 0.7); for (let j = 0; j < 5; j++) { ctx.fillStyle = rad(ctx, cx + j * 70, cy - (j % 2) * 24, 5, 120, [[0, mixCol('#5A6676', '#FFF4E0', clear) + 'EE'], [1, '#5A667600']]); ctx.beginPath(); ctx.ellipse(cx + j * 70, cy - (j % 2) * 24, 130, 60, 0, 0, Math.PI * 2); ctx.fill(); } ctx.restore(); }
    if (flash > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(230,235,255,${0.7 * flash})`; ctx.fillRect(-100, -100, W + 200, H + 200); ctx.restore(); }
  }
  const mixCol = (a, b, k) => { const p = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)); const x = p(a), y = p(b); return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * clamp(k)).toString(16).padStart(2, '0')).join(''); };
  function windowRain(ctx, x, y, w, h, t, seed) {
    G.rrect(ctx, x, y, w, h, 8, { fill: lin(ctx, 0, y, 0, y + h, [[0, '#6E8296'], [1, '#A9B8C6']]), lw: 0, seed });
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); rain(ctx, t, 0.5, y + h + 100);
    for (let i = 0; i < 14; i++) { const p = (t * (0.15 + G.rnd(seed, i) * 0.2) + G.rnd(seed, i, 2)) % 1; const dx = x + G.rnd(seed, i, 3) * w, dy = y + p * h; G.line(ctx, [[dx, y], [dx + 2, dy]], { color: 'rgba(255,255,255,0.25)', lw: 3, seed: seed + i }); G.ellipse(ctx, dx + 2, dy, 5, 7, { fill: 'rgba(255,255,255,0.55)', lw: 0, seed: seed + 20 + i }); }
    ctx.restore();
    ctx.strokeStyle = '#7A4A2A'; ctx.lineWidth = 14; ctx.strokeRect(x, y, w, h); ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h); ctx.stroke();
  }
  const flashAt = (t, t0, d = 0.12) => { const a = t - t0; return a >= 0 && a < d ? 1 - a / d : 0; };

  // 1. HOOK: one raindrop falls onto Bablu's eye; thunder
  function hook(ctx, t) {
    const fl = flashAt(t, ev.thunder, 0.15) + (t > ev.thunder + 0.3 && t < ev.thunder + 0.38 ? 0.5 : 0);
    stormSky(ctx, t, { flash: fl });
    if (fl > 0.2) G.line(ctx, [[760, 0], [700, 160], [760, 220], [660, 420], [720, 470], [640, 640]], { color: '#FFFFFF', lw: 8, seed: 4000 });
    road(ctx, 1500);
    bablu(ctx, { x: 120, y: 1720, s: 2.6, t, face: t < ev.hook ? 'normal' : t < ev.hook + 0.25 ? 'wink' : 'wide', look: 0.4, idle: false });
    // the drop
    const ex = 120 + 2.6 * 238, ey = 1720 - 2.6 * 178;
    if (t < ev.hook) { const y = lerp(-80, ey - 60, ease.inQuad(clamp(t / ev.hook))); ctx.save(); ctx.translate(ex + 10, y); G.poly(ctx, [[0, -46], [22, 6], [0, 26], [-22, 6]], { fill: rad(ctx, -6, 0, 2, 30, [[0, '#FFFFFF'], [1, '#9FD3E8']]), lw: 0, seed: 4001, step: 8 }); ctx.restore(); }
    else { const a = t - ev.hook; for (let k = 0; k < 8; k++) { const ang = -Math.PI * (0.1 + 0.8 * k / 7); ctx.save(); ctx.globalAlpha = Math.max(0, 1 - a * 2); G.ellipse(ctx, ex + 10 + Math.cos(ang) * a * 420, ey - 60 + Math.sin(ang) * a * 420 + a * a * 700, 9, 9, { fill: '#BFE3F2', lw: 0, seed: 4010 + k }); ctx.restore(); } }
    if (t > ev.thunder) rain(ctx, t, clamp((t - ev.thunder) / 1.2), 1500);
    if (t >= ev.hook && t < ev.hook + 0.1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(220,240,255,${0.6 * flashAt(t, ev.hook, 0.1)})`; ctx.fillRect(-100, -100, W + 200, H + 200); ctx.restore(); }
    G.decor(() => { G.rrect(ctx, SAFE.x + 10, SAFE.y + 10, 520, 140, 18, { fill: 'rgba(20,20,24,0.82)', lw: 0, seed: 1100 }); G.text(ctx, 'पुणे डायरीज', SAFE.x + 40, SAFE.y + 78, { size: 58, color: C.yellow, ...DEV }); G.text(ctx, 'भाग ५ · पहिला पाऊस', SAFE.x + 40, SAFE.y + 128, { size: 34, color: '#F6F0E2', ...DEV }); });
  }
  // 2. Rohan's meeting: "network issue". The laptop snaps shut.
  function rohanShot(ctx, t) {
    ctx.fillStyle = lin(ctx, 0, 0, 0, H, [[0, '#DDE3E8'], [1, '#9AA4AC']]); ctx.fillRect(-100, -100, W + 200, H + 200);
    windowRain(ctx, 60, 260, 960, 620, t, 4100);
    G.rrect(ctx, -40, 1180, W + 80, 50, 6, { fill: lin(ctx, 0, 1180, 0, 1230, [[0, '#F4F6F8'], [1, '#A9AFB5']]), lw: 0, seed: 4110 });
    G.rrect(ctx, -40, 1230, W + 80, H, 0, { fill: lin(ctx, 0, 1230, 0, H, [[0, '#6E747A'], [1, '#3A3F44']]), lw: 0, seed: 4111 });
    const shut = t >= ev.shut;
    Ch.person(ctx, { x: 330, y: 1560, s: 1.15, pose: 'stand', style: CAST.rohan, gesture: shut ? 'thumbsUp' : null, handR: shut ? undefined : [250, -340], handL: shut ? undefined : [-60, -300], eyes: shut ? 'happy' : 'normal', mouth: talkMouth('rohan', t, shut ? 'grin' : 'flat'), look: -0.2, lookY: 0.4, seed: 1300 });
    // the laptop: a video call, then the lid slams shut
    const lid = shut ? 0 : 1;
    G.rrect(ctx, 580, 1150, 420, 34, 6, { fill: '#BFC4C8', lw: 0, seed: 4120 });
    if (lid > 0) { G.rrect(ctx, 600, 880, 380, 270, 10, { fill: '#2A2A30', lw: 0, seed: 4121 }); for (let k = 0; k < 4; k++) { G.rrect(ctx, 614 + (k % 2) * 180, 894 + Math.floor(k / 2) * 124, 170, 114, 6, { fill: ['#5A7C8C', '#8A6E5A', '#6E5A8A', '#5A8A6E'][k], lw: 0, seed: 4122 + k }); G.ellipse(ctx, 699 + (k % 2) * 180, 946 + Math.floor(k / 2) * 124, 24, 26, { fill: '#C98A62', lw: 0, seed: 4126 + k }); } }
    else G.rrect(ctx, 600, 1124, 380, 30, 6, { fill: '#2A2A30', lw: 0, seed: 4130 });
    if (flashAt(t, ev.shut, 0.1) > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,250,230,${0.5 * flashAt(t, ev.shut, 0.1)})`; ctx.fillRect(-100, -100, W + 200, H + 200); ctx.restore(); }
  }
  // 3. Meera's hostel room: the notes fly
  function meeraShot(ctx, t) {
    ctx.fillStyle = lin(ctx, 0, 0, 0, H, [[0, '#F2E2C8'], [1, '#B8A486']]); ctx.fillRect(-100, -100, W + 200, H + 200);
    windowRain(ctx, 120, 260, 840, 600, t, 4200);
    G.rrect(ctx, -40, 1240, W + 80, H, 0, { fill: lin(ctx, 0, 1240, 0, H, [[0, '#A8683A'], [1, '#5A3018']]), lw: 0, seed: 4210 });
    const toss = t >= ev.toss;
    Ch.person(ctx, { x: 540, y: 1600, s: 1.2, pose: 'stand', style: CAST.meera, gesture: toss ? 'cheer' : null, handR: toss ? undefined : [90, -320], handL: toss ? undefined : [-90, -320], eyes: toss ? 'happy' : 'normal', mouth: talkMouth('meera', t, toss ? 'grin' : 'flat'), seed: 3130 });
    if (!toss) G.rrect(ctx, 540 - 110, 1600 - 1.2 * 340, 220, 70, 6, { fill: '#F6F0E2', lw: 0, seed: 4220 });
    else for (let k = 0; k < 12; k++) { const a = t - ev.toss, ang = -Math.PI / 2 + (G.rnd(k, 1) - 0.5) * 2.4, sp = 500 + G.rnd(k, 2) * 500; const x = 540 + Math.cos(ang) * sp * a, y = 1100 + Math.sin(ang) * sp * a + 260 * a * a; ctx.save(); ctx.translate(x, y); ctx.rotate(a * (3 + k)); G.rrect(ctx, -40, -52, 80, 104, 4, { fill: '#FFFFFF', lw: 0, seed: 4230 + k }); for (let r = 0; r < 5; r++) { ctx.fillStyle = 'rgba(60,90,160,0.4)'; ctx.fillRect(-30, -38 + r * 18, 60, 3); } ctx.restore(); }
  }
  // 4. Aaji's kitchen: onion bhaji in the kadhai
  function aajiShot(ctx, t) {
    ctx.fillStyle = lin(ctx, 0, 0, 0, H, [[0, '#E9D3A0'], [1, '#9A7A50']]); ctx.fillRect(-100, -100, W + 200, H + 200);
    windowRain(ctx, 560, 280, 440, 520, t, 4300);
    for (let k = 0; k < 5; k++) G.rrect(ctx, 60 + k * 90, 380, 70, 110, 8, { fill: lin(ctx, 0, 380, 0, 490, [[0, '#E8E8E8'], [1, '#9A9A9A']]), lw: 0, seed: 4310 + k }); // steel dabbas
    G.rrect(ctx, -40, 1140, W + 80, 60, 6, { fill: lin(ctx, 0, 1140, 0, 1200, [[0, '#C9C0B0'], [1, '#7E7462']]), lw: 0, seed: 4320 });
    G.rrect(ctx, -40, 1200, W + 80, H, 0, { fill: lin(ctx, 0, 1200, 0, H, [[0, '#7A5A3A'], [1, '#3E2A1A']]), lw: 0, seed: 4321 });
    Ch.person(ctx, { x: 300, y: 1520, s: 1.15, pose: 'stand', style: CAST.aaji, handR: [230, -330], eyes: 'happy', brows: 'neutral', mouth: talkMouth('aaji', t, 'smile'), look: 0.6, lookY: 0.4, seed: 1760 });
    // the kadhai, the oil, the bhaji
    const kx = 660, ky = 1120;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rad(ctx, kx, ky + 60, 10, 140, [[0, 'rgba(255,120,40,0.5)'], [1, 'rgba(255,120,40,0)']]); ctx.fillRect(kx - 200, ky - 80, 400, 300); ctx.restore();
    G.ellipse(ctx, kx, ky, 210, 70, { fill: rad(ctx, kx - 60, ky - 20, 10, 220, [[0, '#5A5A60'], [1, '#141416']]), lw: 0, seed: 4330 });
    G.ellipse(ctx, kx, ky - 8, 180, 50, { fill: rad(ctx, kx - 40, ky - 20, 4, 180, [[0, '#F2C230'], [1, '#B8860B']]), lw: 0, seed: 4331 });
    for (let k = 0; k < 9; k++) { const bx = kx - 130 + (k % 5) * 62 + (k > 4 ? 30 : 0), by = ky - 18 + (k > 4 ? 22 : 0) + Math.sin(t * 6 + k) * 3; G.ellipse(ctx, bx, by, 30, 18, { fill: rad(ctx, bx - 8, by - 6, 2, 32, [[0, '#F7C35A'], [1, '#A8601E']]), lw: 0, seed: 4340 + k }); for (let j = 0; j < 3; j++) G.line(ctx, [[bx - 20 + j * 14, by - 6], [bx - 26 + j * 14, by - 22]], { color: '#C9781E', lw: 4, seed: 4350 + k * 3 + j }); }
    for (let k = 0; k < 14; k++) { const p = ((t * 3 + G.rnd(k, 1)) % 1); ctx.save(); ctx.globalAlpha = Math.sin(p * Math.PI) * 0.8; G.ellipse(ctx, kx - 160 + G.rnd(k, 2) * 320, ky - 10 + (G.rnd(k, 3) - 0.5) * 50, 4 + p * 4, 3 + p * 3, { fill: '#FFF0B0', lw: 0, seed: 4360 + k }); ctx.restore(); }
    G.line(ctx, [[300 + 1.15 * 230, 1520 - 1.15 * 330], [kx - 40, ky - 30]], { color: '#BFC4C8', lw: 9, seed: 4370 }); G.ellipse(ctx, kx - 40, ky - 30, 36, 14, { fill: '#BFC4C8', lw: 0, seed: 4371 });
    for (let k = 0; k < 3; k++) { const p = ((t * 0.5 + k / 3) % 1); ctx.save(); ctx.globalAlpha = 0.5 * Math.sin(p * Math.PI); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 7; ctx.beginPath(); for (let i = 0; i < 10; i++) { const yy = ky - 60 - p * 260 - i * 14; i ? ctx.lineTo(kx - 60 + k * 60 + Math.sin(i * 0.8 + t * 3 + k) * 14, yy) : ctx.moveTo(kx - 60 + k * 60, yy); } ctx.stroke(); ctx.restore(); }
  }
  // 5. The street: everyone runs INTO the rain; Arjun under the bus shelter
  function arjunShot(ctx, t) {
    stormSky(ctx, t);
    backdrop(ctx, t, 640);
    wada(ctx, -120, 470, 520, 780, C.ochre, 4400, { close: 0, t, sign: 'चहा' });
    wada(ctx, 560, 440, 640, 810, C.teal, 4410, { close: 0, t, sign: 'किराणा', signCol: '#B5452F' });
    road(ctx, 1250);
    RUN.forEach((st, i) => { const x = ((t - ev.arjun) * (260 + i * 40) + i * 260) % 1300 - 150; Ch.person(ctx, { x, y: 1360 + (i % 2) * 70, s: 0.7, pose: 'walk', walk: (t - ev.arjun) * 3 + i, style: st, gesture: 'cheer', eyes: 'happy', mouth: 'open', seed: 4420 + i * 10 }); });
    // the bus shelter
    G.rrect(ctx, 640, 900, 420, 26, 6, { fill: lin(ctx, 0, 900, 0, 926, [[0, '#3FA89B'], [1, '#1E5E54']]), lw: 0, seed: 4450 });
    for (const px of [660, 1030]) G.rrect(ctx, px, 926, 16, 360, 4, { fill: '#6E747A', lw: 0, seed: 4451 + px });
    Ch.person(ctx, { x: 850, y: 1300, s: 0.95, pose: 'stand', style: CAST.arjun, gesture: 'shrug', eyes: 'wide', brows: 'up', mouth: talkMouth('arjun', t, 'o'), look: -0.6, seed: 1250 });
    rain(ctx, t, 1);
  }
  // 6. Everyone squeezes into Bablu; through the puddle
  function squeezeShot(ctx, t) {
    stormSky(ctx, t);
    backdrop(ctx, t, 640);
    wada(ctx, -60, 480, 1200, 770, C.terra, 4500, { shop: false });
    road(ctx, 1250);
    const go = t > ev.splash - 0.5, bx = go ? 420 + (t - ev.splash + 0.5) * 520 : 420;
    G.ellipse(ctx, 760, 1330, 220, 40, { fill: 'rgba(150,170,190,0.75)', lw: 0, seed: 4510 }); // the puddle
    bablu(ctx, { x: bx, y: 1320, s: 0.95, t, dist: bx, face: 'happy', look: 0.6,
      inside: (c) => { [['rohan', -190], ['meera', -110], ['aaji', -30], ['arjun', 60]].forEach(([w, x], i) => Ch.person(c, { x, y: -150 - (i % 2) * 8, s: 0.36, pose: 'sit', style: CAST[w], gesture: i % 2 ? 'wave' : null, eyes: 'happy', mouth: 'grin', seed: 4520 + i * 10, shadow: false })); } });
    const a = t - ev.splash;
    if (a >= 0 && a < 1.2) for (let k = 0; k < 18; k++) { const ang = -Math.PI * (0.05 + 0.9 * G.rnd(k, 1)); const sp = 400 + G.rnd(k, 2) * 700; ctx.save(); ctx.globalAlpha = Math.max(0, 1 - a); G.ellipse(ctx, 760 + Math.cos(ang) * sp * a, 1320 + Math.sin(ang) * sp * a + 900 * a * a, 10, 14, { fill: '#BFE3F2', lw: 0, seed: 4540 + k }); ctx.restore(); }
    if (a >= 0 && a < 0.1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(220,240,255,${0.55 * (1 - a / 0.1)})`; ctx.fillRect(-100, -100, W + 200, H + 200); ctx.restore(); }
    rain(ctx, t, 1);
  }
  // 7. Up the ghat: green hills, waterfalls, mist; tiny Bablu climbs the road
  function ghatShot(ctx, t) {
    stormSky(ctx, t, { clear: 0.15 });
    const hill = (y0, amp, col, seed) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-100, H); for (let x = -100; x <= W + 100; x += 40) ctx.lineTo(x, y0 - amp * (0.5 + 0.5 * Math.sin(x * 0.006 + seed)) - amp * 0.3 * Math.sin(x * 0.017 + seed * 2)); ctx.lineTo(W + 100, H); ctx.fill(); };
    hill(560, 260, '#7FA48A', 1); hill(820, 300, '#5E8C66', 2);
    for (let k = 0; k < 3; k++) { const wx = 200 + k * 320; ctx.save(); ctx.globalAlpha = 0.8; for (let i = 0; i < 12; i++) { const p = ((t * 1.4 + i / 12) % 1); G.line(ctx, [[wx + Math.sin(i) * 6, 520 + k * 60 + p * 260], [wx + Math.sin(i) * 6, 560 + k * 60 + p * 260]], { color: '#FFFFFF', lw: 6, seed: 4600 + k * 12 + i }); } ctx.restore(); }
    hill(1100, 280, '#4A7A52', 3);
    // the winding road + Bablu climbing it
    const path = (u) => [lerp(1000, 120, u) + Math.sin(u * 9) * 220, lerp(1650, 900, u)];
    ctx.strokeStyle = '#6E6456'; ctx.lineWidth = 46; ctx.lineCap = 'round'; ctx.beginPath(); for (let i = 0; i <= 60; i++) { const [x, y] = path(i / 60); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 3; ctx.setLineDash([16, 18]); ctx.stroke(); ctx.setLineDash([]);
    const u = clamp((t - ev.ghat) / (ev.rule - ev.ghat)), [bx, by] = path(u);
    bablu(ctx, { x: bx, y: by + 10, s: 0.22 + 0.1 * (1 - u), t, dist: u * 3000, face: 'happy', sx: Math.cos(u * 9) * -1 > 0 ? 1 : -1 });
    hill(1500, 160, '#3E6A44', 4);
    for (let k = 0; k < 4; k++) { const cx = ((t * 40 + k * 400) % 1600) - 300; ctx.save(); ctx.globalAlpha = 0.55; ctx.fillStyle = rad(ctx, cx, 700 + k * 200, 10, 320, [[0, 'rgba(255,255,255,0.9)'], [1, 'rgba(255,255,255,0)']]); ctx.beginPath(); ctx.ellipse(cx, 700 + k * 200, 360, 110, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    rain(ctx, t, 0.6);
    G.decor(() => { const a = ease.outBack(clamp((t - ev.ghat - 0.3) / 0.3), 2); ctx.save(); ctx.translate(540, SAFE.y + 70); ctx.scale(a, a); G.rrect(ctx, -230, -55, 460, 100, 20, { fill: 'rgba(20,20,24,0.8)', lw: 0, seed: 4690 }); G.text(ctx, 'सिंहगड →', 0, 18, { size: 60, align: 'center', color: C.yellow, ...DEV }); ctx.restore(); });
  }
  // 8. PUNE RULE #5 on the fort wall, in the mist
  function fortWall(ctx, t, clear = 0) {
    stormSky(ctx, t, { clear });
    for (let r = 0; r < 9; r++) for (let k = 0; k < 6; k++) { const bx = -60 + k * 210 + (r % 2) * 105, by = 900 + r * 110; ctx.fillStyle = `rgba(${90 + Math.round(G.rnd(r, k) * 40)},${80 + Math.round(G.rnd(r, k, 1) * 30)},${70 + Math.round(G.rnd(r, k, 2) * 20)},1)`; ctx.fillRect(bx + 4, by + 4, 200, 100); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(bx + 4, by + 4, 200, 6); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(bx + 4, by + 98, 200, 6); }
    for (let k = 0; k < 6; k++) ctx.fillRect(-60 + k * 220, 830, 150, 74); // battlements
    ctx.fillStyle = 'rgba(80,72,64,1)'; for (let k = 0; k < 6; k++) ctx.fillRect(-60 + k * 220, 830, 150, 74);
    for (let k = 0; k < 3; k++) { const cx = ((t * 30 + k * 500) % 1700) - 300; ctx.save(); ctx.globalAlpha = 0.5 * (1 - clear * 0.6); ctx.fillStyle = rad(ctx, cx, 1000 + k * 260, 10, 380, [[0, 'rgba(255,255,255,0.9)'], [1, 'rgba(255,255,255,0)']]); ctx.beginPath(); ctx.ellipse(cx, 1000 + k * 260, 440, 130, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
  }
  function ruleShot(ctx, t) {
    fortWall(ctx, t);
    const a = clamp((t - ev.rule) / 0.25);
    const sc = t < ev.rule ? 0 : lerp(1.7, 1, ease.outBack(a, 1.8));
    if (sc > 0) {
      ctx.save(); ctx.translate(540, 700); ctx.scale(sc, sc); ctx.rotate(-0.02);
      softShadow(ctx, 30, 40, 520, 400, 0.6);
      G.rrect(ctx, -440, -330, 880, 660, 20, { fill: lin(ctx, -440, -330, 440, 330, [[0, '#2A7A60'], [1, '#123A2E']]), lw: 8, seed: 1610 });
      ctx.strokeStyle = C.yellow; ctx.lineWidth = 6; ctx.strokeRect(-410, -300, 820, 600);
      G.text(ctx, 'पुण्याचा नियम #५', 0, -170, { size: 92, align: 'center', color: C.yellow, ...DEV });
      G.text(ctx, 'पहिला पाऊस =', 0, -40, { size: 76, align: 'center', color: '#F6F0E2', ...DEV });
      G.text(ctx, 'प्लॅन कॅन्सल,', 0, 60, { size: 76, align: 'center', color: '#F6F0E2', ...DEV });
      G.text(ctx, 'भजी कंपल्सरी!', 0, 170, { size: 90, align: 'center', color: '#F2C230', ...DEV });
      ctx.restore();
      const d = t - ev.rule; if (d < 0.8) for (let k = 0; k < 8; k++) { const ang = k * Math.PI / 4; ctx.save(); ctx.globalAlpha = 0.6 * (1 - d / 0.8); G.ellipse(ctx, 540 + Math.cos(ang) * (480 + d * 300), 700 + Math.sin(ang) * (360 + d * 200), 40 + d * 40, 26 + d * 20, { fill: '#E8E8EE', lw: 0, seed: 1620 + k }); ctx.restore(); }
    }
    rain(ctx, t, 0.5);
  }
  // 9. The fort: everyone on the wall with bhaji and chai; the clouds part
  function fortShot(ctx, t) {
    const clear = ease.inOutQuad(clamp((t - ev.sun) / 2.5));
    fortWall(ctx, t, clear);
    if (clear > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let k = 0; k < 6; k++) { const a0 = 1.75 + k * 0.12; ctx.fillStyle = lin(ctx, 860, 200, 860 + Math.cos(a0) * 1600, 200 + Math.sin(a0) * 1600, [[0, `rgba(255,220,160,${0.25 * clear})`], [1, 'rgba(255,220,160,0)']]); ctx.beginPath(); ctx.moveTo(860, 200); ctx.lineTo(860 + Math.cos(a0 - 0.03) * 2000, 200 + Math.sin(a0 - 0.03) * 2000); ctx.lineTo(860 + Math.cos(a0 + 0.03) * 2000, 200 + Math.sin(a0 + 0.03) * 2000); ctx.fill(); } ctx.restore(); }
    bablu(ctx, { x: 860, y: 830, s: 0.55, t, face: 'happy', look: -0.4 });
    const seats = [['aaji', 180], ['arjun', 400], ['meera', 620], ['rohan', 840]];
    seats.forEach(([w, x], i) => Ch.person(ctx, { x, y: 1060, s: 0.72, pose: 'sit', style: CAST[w], gesture: i === 1 && t > T(18, 3) ? 'wave' : null, handR: i === 0 ? [140, -260] : undefined, eyes: 'happy', mouth: mouthOf(w, t) ? talkMouth(w, t) : 'smile', look: i < 2 ? 0.4 : -0.4, seed: 4700 + i * 10 }));
    // the bhaji plate + cutting chai
    G.ellipse(ctx, 290, 1050, 70, 20, { fill: '#D8DDE2', lw: 0, seed: 4750 }); for (let k = 0; k < 5; k++) G.ellipse(ctx, 255 + k * 18, 1040, 16, 10, { fill: '#C98A3A', lw: 0, seed: 4751 + k });
    for (const gx of [480, 700]) { G.rrect(ctx, gx, 1010, 26, 36, 4, { fill: 'rgba(200,150,90,0.9)', lw: 0, seed: 4760 + gx }); const p = (t * 0.6) % 1; ctx.save(); ctx.globalAlpha = 0.4 * Math.sin(p * Math.PI); G.line(ctx, [[gx + 13, 1000 - p * 60], [gx + 18, 970 - p * 60]], { color: '#FFFFFF', lw: 4, seed: 4770 + gx }); ctx.restore(); }
    rain(ctx, t, 0.5 * (1 - clear));
  }
  // 10. End card
  function endShot(ctx, t) {
    ctx.fillStyle = rad(ctx, 540, 900, 50, 1400, [[0, '#4A3A2A'], [1, '#120E0A']]); ctx.fillRect(-100, -100, W + 200, H + 200);
    G.rays(ctx, 540, 1000, { n: 30, r0: 200, r1: 1500, color: 'rgba(242,194,48,0.18)', lw: 16, seed: 2000, spin: (t - ev.meter) * 0.2 });
    const a = ease.outBack(clamp((t - ev.meter) / 0.35), 2);
    ctx.save(); ctx.translate(540, SAFE.y + 110); ctx.scale(a, a);
    G.text(ctx, 'पुणे डायरीज', 0, 10, { size: 120, align: 'center', color: C.yellow, stroke: '#1E1E22', strokeW: 10, ...DEV });
    G.text(ctx, 'बबलूसोबत राइड', 0, 100, { size: 56, align: 'center', color: '#F6F0E2', ...DEV });
    ctx.restore();
    const flag = ease.outBack(clamp((t - ev.meter) / 0.25), 1.5);
    bablu(ctx, { x: 520, y: 1110, s: 1.0, t, face: 'happy', flag, look: 0.4 });
    const b = ease.outCubic(clamp((t - ev.meter - 0.6) / 0.4));
    ctx.save(); ctx.globalAlpha = b;
    G.rrect(ctx, 140, 1170, 800, 210, 24, { fill: lin(ctx, 0, 1170, 0, 1380, [[0, '#FFFBEE'], [1, '#E8DCC0']]), lw: 5, seed: 2010 });
    G.text(ctx, 'पुढची राइड  →', 540, 1250, { size: 58, align: 'center', color: '#B5452F', ...DEV });
    G.text(ctx, 'रात्री नऊला ढोल का वाजतात?', 540, 1340, { size: 50, align: 'center', color: '#2A2320', ...DEV });
    ctx.restore();
    rain(ctx, t, 0.15);
  }

  const film = Shots.film([
    { at: 0, draw: hook, cam: Shots.combine(Shots.push(1.0, 1.04), Shots.shake(20, ev.thunder, 4)) },
    { at: ev.rohan, draw: rohanShot, in: 'cut', cam: Shots.combine(Shots.push(1.0, 1.05), Shots.shake(12, ev.shut, 6)) },
    { at: ev.meera, draw: meeraShot, in: 'whip', cam: Shots.push(1.0, 1.05) },
    { at: ev.aaji, draw: aajiShot, in: 'whip', cam: Shots.push(1.0, 1.06) },
    { at: ev.arjun, draw: arjunShot, in: 'cut', cam: Shots.push(1.0, 1.04) },
    { at: ev.squeeze, draw: squeezeShot, in: 'cut', cam: Shots.shake(16, ev.splash, 5) },
    { at: ev.ghat, draw: ghatShot, in: 'cut', cam: Shots.push(1.12, 1.0) },
    { at: ev.rule, draw: ruleShot, in: 'flash', cam: Shots.shake(20, ev.rule, 6) },
    { at: ev.fort, draw: fortShot, in: 'cut', cam: Shots.push(1.0, 1.08) },
    { at: ev.meter, draw: endShot, in: 'flash' },
  ]);

  // ---------- the cinematic grade: key light from the sun, cool shadows, a colour grade, floating dust ----------
  function grade(ctx, t) {
    const look = t < ev.rohan ? 'monsoon' : t < ev.arjun ? 'interior' : t < ev.rule ? 'monsoon' : t < ev.sun ? 'monsoon' : t < ev.meter ? 'golden' : 'night';
    const L = {
      day: { key: 'rgba(255,236,200,0.22)', shade: 'rgba(40,60,110,0.22)', soft: 'rgba(255,200,150,0.12)', dust: 0.5 },
      warm: { key: 'rgba(255,220,170,0.25)', shade: 'rgba(60,40,30,0.25)', soft: 'rgba(255,180,120,0.14)', dust: 0.3 },
      noon: { key: 'rgba(255,250,230,0.32)', shade: 'rgba(40,60,110,0.16)', soft: 'rgba(255,230,180,0.12)', dust: 0.8 },
      interior: { key: 'rgba(255,200,150,0.15)', shade: 'rgba(20,10,30,0.35)', soft: 'rgba(255,150,90,0.12)', dust: 0.4 },
      golden: { key: 'rgba(255,190,120,0.30)', shade: 'rgba(70,30,60,0.25)', soft: 'rgba(255,140,60,0.18)', dust: 1 },
      monsoon: { key: 'rgba(200,220,240,0.10)', shade: 'rgba(30,50,80,0.30)', soft: 'rgba(110,150,200,0.14)', dust: 0 },
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
