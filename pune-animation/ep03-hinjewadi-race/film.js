// THE FILM for EP03 "The Great Hinjewadi Race". A list of shots (Shots.film); every frame is a pure function of t.
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

  // ---------- EP03: the race ----------
  CAST.rohan = { outfit: 'hoodie', shirt: '#7E8590', skin: '#B97D55', hairStyle: 'short', hair: '#1E1A1A', facialHair: 'none', bottoms: 'pants', pants: '#2F3A5A', shoes: '#EDEDED' };
  CAST.guard = { outfit: 'shirt', shirt: '#3E5C8A', bottoms: 'pants', pants: '#2A2A34', skin: '#8D5A3B', hairStyle: 'short', hair: '#1E1A1A', facialHair: 'mustache', build: 'broad' };
  CAST.dancer1 = { outfit: 'kameez', shirt: '#E8718D', skin: '#C98A62', hairStyle: 'short', hair: '#1E1A1A' };
  CAST.dancer2 = { outfit: 'sari', robe: '#F2B84B', shirt: '#B5452F', trim: '#B5452F', skin: '#B97D55', hairStyle: 'bun', hair: '#1E1A1A' };
  CAST.dancer3 = { outfit: 'shirt', shirt: '#3FA89B', bottoms: 'pants', pants: '#F6F0E2', skin: '#8D5A3B', hairStyle: 'curly', hair: '#1E1A1A' };
  CAST.groom = { outfit: 'sherwani', robe: '#F6F0E2', trim: '#C9A227', skin: '#B97D55', headwear: 'pagri', headwearColor: '#E0503E', hairStyle: 'short' };
  const PASS = [
    { outfit: 'shirt', shirt: '#D9E4E8', bottoms: 'pants', pants: '#4A4A55', skin: '#A86E4B', hairStyle: 'short', hair: '#2A2A2A', facialHair: 'mustache' },
    { outfit: 'sari', robe: '#3FA89B', shirt: '#E0703E', skin: '#C98A62', hairStyle: 'bun', hair: '#1E1A1A' },
    { outfit: 'tee', shirt: '#E0703E', bottoms: 'pants', pants: '#2F3A5A', skin: '#8D5A3B', hairStyle: 'curly', hair: '#1E1A1A' },
    { outfit: 'kameez', shirt: '#B79CFF', skin: '#D59B72', hairStyle: 'ponytail', hair: '#1E1A1A' },
    { outfit: 'shirt', shirt: '#F2B84B', bottoms: 'pants', pants: '#3A3A44', skin: '#B97D55', hairStyle: 'bald', hair: '#9A9A9A', glasses: 'square' },
  ];
  const wheel = (ctx, x, y, r, dist, seed, spokes = 3) => {
    G.ellipse(ctx, x, y, r, r, { fill: rad(ctx, x - r * 0.3, y - r * 0.3, 2, r * 1.1, [[0, '#4A4A52'], [0.75, '#1C1C20'], [1, '#0A0A0C']]), lw: 3, seed });
    G.ellipse(ctx, x, y, r * 0.42, r * 0.42, { fill: rad(ctx, x - 4, y - 4, 1, r * 0.45, [[0, '#FFFFFF'], [1, '#6E747A']]), lw: 2, seed: seed + 1 });
    const a = dist / r; for (let k = 0; k < spokes; k++) { const q = a + k * Math.PI * 2 / spokes; G.line(ctx, [[x, y], [x + Math.cos(q) * r * 0.85, y + Math.sin(q) * r * 0.85]], { color: '#BFC4C8', lw: 2.5, seed: seed + 2 + k }); }
  };
  // a rider seated on a two-wheeler: origin = seat point
  function rider(ctx, x, y, s, o = {}, bar = [315, -167]) { Ch.person(ctx, { x: x - 6 * s, y: y + 40 * s, s, pose: 'sit', style: CAST.rohan, handR: bar, handL: [bar[0] - 20, bar[1] - 8], seed: 1300, shadow: false, ...o }); }
  function helmet(ctx, x, y, s, col = '#E0503E') { G.ellipse(ctx, x, y - 6 * s, 60 * s, 56 * s, { fill: rad(ctx, x - 20 * s, y - 20 * s, 2, 70 * s, [[0, tint(col, 0.4)], [1, tint(col, -0.3)]]), lw: 0, seed: 1310 }); G.rrect(ctx, x + 6 * s, y - 6 * s, 54 * s, 30 * s, 10 * s, { fill: 'rgba(40,60,80,0.75)', lw: 0, seed: 1311 }); }
  function motorbike(ctx, x, y, s, t, { dist = 0, ride = true, col = '#C0392B', o = {}, hel = true } = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    softShadow(ctx, 0, 4, 190, 18, 0.45);
    wheel(ctx, -120, -46, 46, dist, 1320); wheel(ctx, 125, -46, 46, dist, 1325);
    G.poly(ctx, [[-130, -60], [-60, -120], [60, -120], [110, -150], [150, -140], [130, -60], [40, -50], [-60, -50]], { fill: lin(ctx, 0, -150, 0, -50, [[0, tint(col, 0.3)], [1, tint(col, -0.35)]]), lw: 0, seed: 1330, step: 18 });
    G.rrect(ctx, -110, -150, 130, 30, 12, { fill: '#2A2320', lw: 0, seed: 1331 });
    G.line(ctx, [[110, -150], [140, -215], [120, -225]], { color: '#3A3A40', lw: 7, seed: 1332 });
    G.ellipse(ctx, 156, -150, 14, 14, { fill: '#FFF6D0', lw: 0, seed: 1333 });
    if (ride) { rider(ctx, -40, -150, 0.55, o); if (hel) helmet(ctx, -44, -150 - 233 * 0.55, 0.92); }
    ctx.restore();
  }
  function bicycle(ctx, x, y, s, t, { dist = 0, ride = true, o = {} } = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    softShadow(ctx, 0, 4, 180, 14, 0.35);
    for (const wx of [-110, 110]) { ctx.strokeStyle = '#1C1C20'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(wx, -58, 54, 0, Math.PI * 2); ctx.stroke(); const a = dist / 54; for (let k = 0; k < 8; k++) { const q = a + k * Math.PI / 4; G.line(ctx, [[wx, -58], [wx + Math.cos(q) * 50, -58 + Math.sin(q) * 50]], { color: '#BFC4C8', lw: 1.6, seed: 1340 + k }); } }
    const fr = '#2F7D74';
    for (const seg of [[[-110, -58], [-20, -150]], [[-20, -150], [80, -150]], [[80, -150], [110, -58]], [[-110, -58], [10, -58]], [[10, -58], [-20, -150]], [[10, -58], [80, -150]], [[80, -150], [90, -200]]]) G.line(ctx, seg, { color: fr, lw: 8, seed: 1350 });
    G.line(ctx, [[70, -205], [115, -205]], { color: '#2A2320', lw: 7, seed: 1351 });
    G.rrect(ctx, -50, -172, 60, 16, 7, { fill: '#2A2320', lw: 0, seed: 1352 });
    if (ride) rider(ctx, -26, -168, 0.55, o, [220, -107]);
    ctx.restore();
  }
  function car(ctx, x, y, s, col, seed) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    softShadow(ctx, 0, 4, 220, 18, 0.45);
    G.rrect(ctx, -210, -130, 420, 90, 26, { fill: lin(ctx, 0, -130, 0, -40, [[0, tint(col, 0.3)], [1, tint(col, -0.3)]]), lw: 0, seed });
    G.poly(ctx, [[-130, -130], [-80, -200], [90, -200], [140, -130]], { fill: lin(ctx, 0, -200, 0, -130, [[0, tint(col, 0.2)], [1, col]]), lw: 0, seed: seed + 1, step: 20 });
    G.poly(ctx, [[-112, -134], [-72, -188], [0, -188], [0, -134]], { fill: 'rgba(160,200,220,0.9)', lw: 0, seed: seed + 2, step: 20 });
    G.poly(ctx, [[12, -134], [12, -188], [82, -188], [122, -134]], { fill: 'rgba(160,200,220,0.9)', lw: 0, seed: seed + 3, step: 20 });
    wheel(ctx, -130, -40, 38, 0, seed + 4); wheel(ctx, 130, -40, 38, 0, seed + 8);
    ctx.restore();
  }
  function busSide(ctx, x, y, s, t, { sway = 0 } = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    softShadow(ctx, 0, 4, 470, 26, 0.5);
    G.rrect(ctx, -450, -360, 900, 300, 30, { fill: lin(ctx, 0, -360, 0, -60, [[0, '#F4E6C8'], [0.45, '#E8D8B4'], [0.46, '#C0392B'], [1, '#7E1E14']]), lw: 0, seed: 1360 });
    for (let k = 0; k < 7; k++) { const wx = -400 + k * 115; G.rrect(ctx, wx, -330, 96, 110, 10, { fill: 'rgba(120,160,180,0.85)', lw: 0, seed: 1361 + k }); for (let j = 0; j < 2; j++) G.ellipse(ctx, wx + 28 + j * 40, -258 + Math.sin(t * 4 + k + j) * 3, 16, 18, { fill: '#2A2320', lw: 0, seed: 1370 + k * 2 + j }); }
    wheel(ctx, -300, -60, 52, 0, 1380); wheel(ctx, 300, -60, 52, 0, 1384);
    ctx.restore();
  }
  function cityBg(ctx, t, { haze = 0 } = {}) {
    sky(ctx, undefined, undefined, { t });
    backdrop(ctx, t, 620);
    // a flyover and glassy offices far back
    for (let k = 0; k < 5; k++) { const bx = -40 + k * 230, bh = 380 + G.rnd(k, 11) * 220; G.rrect(ctx, bx, 900 - bh, 200, bh + 100, 4, { fill: lin(ctx, bx, 0, bx + 200, 0, [[0, '#7FA6C0'], [0.5, '#BCD6E6'], [1, '#6C8FA8']]), lw: 0, seed: 1400 + k }); for (let r = 0; r < Math.floor(bh / 50); r++) { ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(bx + 8, 920 - bh + r * 50, 184, 4); } }
    G.rrect(ctx, -60, 880, W + 120, 60, 0, { fill: lin(ctx, 0, 880, 0, 940, [[0, '#C9C0B0'], [1, '#8E8676']]), lw: 0, seed: 1410 });
    for (let k = 0; k < 6; k++) G.rrect(ctx, 40 + k * 200, 940, 40, 320, 4, { fill: '#A89C8A', lw: 0, seed: 1411 + k });
    if (haze) { ctx.fillStyle = `rgba(200,190,170,${haze})`; ctx.fillRect(-100, 300, W + 200, 1000); }
    road(ctx, 1150);
  }
  function jam(ctx, t, rows = [1180, 1330, 1500], skip = -1) {
    const cols = ['#3E6FA8', '#F2F2F2', '#A83232', '#3A3A44', '#E9C46A', '#5A8A6A'];
    rows.forEach((ry, r) => {
      for (let k = -1; k < 6; k++) {
        if (r === 1 && k === 2 && skip >= 0) continue;
        const jx = (k * 230 + r * 110) + Math.sin(t * 6 + k + r) * 2;
        const kind = (k + r * 2 + 6) % 3;
        const sc = 0.62 + r * 0.12;
        if (kind === 0) car(ctx, jx, ry, sc, cols[(k + r + 6) % 6], 1420 + r * 20 + k);
        else if (kind === 1) motorbike(ctx, jx, ry, sc, t, { col: cols[(k + 2 * r + 6) % 6], o: { style: PASS[(k + r + 10) % 5], mouth: 'flat', eyes: 'normal' }, hel: true });
        else bablu(ctx, { x: jx, y: ry, s: sc * 0.62, t, face: 'worried', look: 0.5 });
      }
    });
  }
  const honkMarks = (ctx, x, y, t, seed) => { if (Math.sin(t * 7 + seed) > 0.3) for (let k = 0; k < 3; k++) G.line(ctx, [[x + 20, y - 20 + k * 20], [x + 60, y - 40 + k * 40]], { color: '#FFF3C4', lw: 6, seed: seed + k }); };

  // 1. HOOK: four panels slam in
  function hook(ctx, t) {
    ctx.fillStyle = rad(ctx, 540, 800, 40, 1300, [[0, '#3A3A44'], [1, '#121216']]); ctx.fillRect(-100, -100, W + 200, H + 200);
    const a = t < ev.hook ? 0.35 * t / ev.hook : ease.outBack(clamp((t - ev.hook) / 0.22), 2);
    const panels = [['#E9C46A', 'रिक्षा'], ['#E07A5F', 'बाईक'], ['#8AB6A8', 'बस'], ['#B79CFF', 'सायकल']];
    panels.forEach(([col, name], i) => {
      const px = 70 + (i % 2) * 480, py = 330 + Math.floor(i / 2) * 500, pw = 460, ph = 480;
      ctx.save(); ctx.translate(px + pw / 2, py + ph / 2); ctx.scale(lerp(1.4, 1, a), lerp(1.4, 1, a)); ctx.globalAlpha = a; ctx.translate(-pw / 2, -ph / 2);
      G.rrect(ctx, 0, 0, pw, ph, 22, { fill: lin(ctx, 0, 0, pw, ph, [[0, tint(col, 0.25)], [1, tint(col, -0.25)]]), lw: 0, seed: 1500 + i });
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, pw, ph); ctx.clip();
      ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(0, ph - 110, pw, 110);
      const v = Math.sin(t * 30 + i) * 2;
      if (i === 0) bablu(ctx, { x: pw / 2, y: ph - 100 + v, s: 0.6, t, face: 'normal', look: 0.4 });
      if (i === 1) motorbike(ctx, pw / 2, ph - 100 + v, 0.85, t);
      if (i === 2) busSide(ctx, pw / 2 + 120, ph - 100 + v, 0.62, t);
      if (i === 3) bicycle(ctx, pw / 2, ph - 100 + v, 0.85, t);
      ctx.restore();
      G.text(ctx, name, 26, 66, { size: 50, color: '#FFFFFF', stroke: '#2A2320', strokeW: 7, ...DEV });
      ctx.restore();
    });
    G.decor(() => { ctx.save(); ctx.globalAlpha = a; G.text(ctx, '१८ किमी · ४ गाड्या · १ विजेता', 540, SAFE.y + 60, { size: 56, align: 'center', color: C.yellow, stroke: '#1E1E22', strokeW: 9, ...DEV }); ctx.restore(); });
  }
  // 2. Rohan: coffee, 8:30, confidence
  function introShot(ctx, t) {
    cityBg(ctx, t);
    const thumbs = t > T(4, 2);
    Ch.person(ctx, { x: 540, y: 1560, s: 1.5, pose: 'stand', style: CAST.rohan, gesture: thumbs ? 'thumbsUp' : null, handR: thumbs ? undefined : [110, -470], eyes: 'normal', brows: 'determined', mouth: talkMouth('rohan', t, 'grin'), look: 0.2, seed: 1300 });
    if (!thumbs) { const cx = 540 + 1.5 * 110, cy = 1560 - 1.5 * 470; G.rrect(ctx, cx - 26, cy - 40, 52, 70, 8, { fill: lin(ctx, cx - 26, 0, cx + 26, 0, [[0, '#FFFFFF'], [1, '#C9C0B0']]), lw: 0, seed: 1520 }); G.rrect(ctx, cx - 26, cy - 10, 52, 22, 2, { fill: '#8E5A30', lw: 0, seed: 1521 }); for (let k = 0; k < 2; k++) { const p = ((t * 0.6 + k / 2) % 1); ctx.save(); ctx.globalAlpha = 0.5 * Math.sin(p * Math.PI); ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 5; ctx.beginPath(); for (let i = 0; i < 8; i++) { const yy = cy - 50 - p * 100 - i * 10; i ? ctx.lineTo(cx - 8 + k * 16 + Math.sin(i + t * 3) * 6, yy) : ctx.moveTo(cx - 8 + k * 16, yy); } ctx.stroke(); ctx.restore(); } }
    // the smartwatch callout
    const a = ease.outBack(clamp((t - ev.intro - 0.4) / 0.3), 2);
    G.decor(() => { ctx.save(); ctx.translate(820, 560); ctx.scale(a, a); G.ellipse(ctx, 0, 0, 130, 130, { fill: rad(ctx, -30, -30, 10, 140, [[0, '#2A2A30'], [1, '#0A0A0C']]), lw: 0, seed: 1530 }); ctx.strokeStyle = '#3FA89B'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(0, 0, 112, -Math.PI / 2, -Math.PI / 2 + Math.PI * 1.1); ctx.stroke(); G.text(ctx, '८:३०', 0, 22, { size: 70, align: 'center', color: '#FFFFFF', ...DEV }); ctx.restore(); });
    G.decor(() => { G.rrect(ctx, SAFE.x + 10, SAFE.y + 10, 520, 140, 18, { fill: 'rgba(20,20,24,0.82)', lw: 0, seed: 1100 }); G.text(ctx, 'पुणे डायरीज', SAFE.x + 40, SAFE.y + 78, { size: 58, color: C.yellow, ...DEV }); G.text(ctx, 'भाग ३ · हिंजवडी रेस', SAFE.x + 40, SAFE.y + 128, { size: 34, color: '#F6F0E2', ...DEV }); });
  }
  // 3. The line-up: four lanes, a traffic signal goes green on GO
  const LANES = [560, 800, 1040, 1280];
  function lineupShot(ctx, t) {
    ctx.fillStyle = lin(ctx, 0, 0, 0, H, [[0, '#9AA4AC'], [1, '#5E574E']]); ctx.fillRect(-100, -100, W + 200, H + 200);
    for (let k = 0; k < 4; k++) { G.rrect(ctx, -60, LANES[k] - 200, W + 120, 230, 0, { fill: lin(ctx, 0, LANES[k] - 200, 0, LANES[k] + 30, [[0, '#8E8475'], [1, '#6E6456']]), lw: 0, seed: 1540 + k }); for (let d = 0; d < 7; d++) { ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(40 + d * 160, LANES[k] + 26, 90, 8); } }
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; for (let r = 0; r < 26; r++) ctx.fillRect(470 + (r % 2) * 18, 340 + r * 40, 18, 40); // the chalk start line
    const off = t > ev.go ? (t - ev.go) * 900 : 0;
    const racers = [(c) => bablu(c, { x: 300 + off * 0.9, y: LANES[0], s: 0.5, t, face: t > ev.go ? 'happy' : 'normal', look: 0.6, dist: off }),
      (c) => motorbike(c, 300 + off * 1.2, LANES[1], 0.7, t, { dist: off }),
      (c) => busSide(c, 210 + off * 0.6, LANES[2], 0.45, t),
      (c) => bicycle(c, 300 + off * 0.5, LANES[3], 0.7, t, { dist: off })];
    const names = ['रिक्षा', 'बाईक', 'बस', 'सायकल'];
    racers.forEach((f, i) => { f(ctx); const a = ease.outBack(clamp((t - ev.lineup - 0.4 - i * 0.78) / 0.25), 2.5); if (a > 0 && t < ev.go) { ctx.save(); ctx.translate(160, LANES[i] - 170); ctx.scale(a, a); G.rrect(ctx, -90, -40, 180, 64, 14, { fill: 'rgba(20,20,24,0.85)', lw: 0, seed: 1550 + i }); G.text(ctx, names[i], 0, 10, { size: 40, align: 'center', color: C.yellow, ...DEV }); ctx.restore(); } });
    // the signal: red, red, amber on "ready", GREEN on GO
    const sx = 900, sy = 260;
    G.rrect(ctx, sx - 60, sy, 120, 320, 20, { fill: '#1E1E22', lw: 0, seed: 1560 });
    G.rrect(ctx, sx - 8, sy + 320, 16, 260, 4, { fill: '#3A3A40', lw: 0, seed: 1561 });
    const state = t >= ev.go ? 2 : t >= T(9) ? 1 : 0;
    [['#E0503E', 0], ['#F2B84B', 1], ['#3FD07A', 2]].forEach(([c, k]) => { const on = state === k; G.ellipse(ctx, sx, sy + 60 + k * 100, 38, 38, { fill: on ? rad(ctx, sx - 8, sy + 52 + k * 100, 2, 40, [[0, '#FFFFFF'], [0.4, c], [1, tint(c, -0.3)]]) : tint(c, -0.65), lw: 0, seed: 1562 + k }); if (on) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rad(ctx, sx, sy + 60 + k * 100, 10, 200, [[0, c + '88'], [1, c + '00']]); ctx.fillRect(sx - 220, sy + k * 100 - 160, 440, 440); ctx.restore(); } });
    if (t >= ev.go && t < ev.go + 0.1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(200,255,220,${0.5 * (1 - (t - ev.go) / 0.1)})`; ctx.fillRect(-100, -100, W + 200, H + 200); ctx.restore(); }
  }
  // 4. The bike in the jam
  function bikeShot(ctx, t) {
    cityBg(ctx, t, { haze: 0.18 });
    jam(ctx, t, [1180, 1330, 1500], 1);
    const rx = 540, ry = 1330;
    motorbike(ctx, rx, ry, 0.86, t, { o: { eyes: 'wide', brows: 'worried', mouth: 'o', sweat: 0.8 } });
    honkMarks(ctx, rx + 140, ry - 150, t, 1600);
    G.decor(() => { const by = ry - 330 + Math.sin(t * 5) * 8; G.rrect(ctx, rx - 90, by - 60, 180, 70, 14, { fill: 'rgba(20,20,24,0.85)', lw: 0, seed: 1601 }); G.text(ctx, 'रोहन ↓', rx, by - 12, { size: 40, align: 'center', color: C.yellow, ...DEV }); });
    G.decor(() => { G.rrect(ctx, 760, SAFE.y + 20, 240, 100, 16, { fill: 'rgba(20,20,24,0.82)', lw: 0, seed: 1610 }); G.text(ctx, '८:५५', 880, SAFE.y + 92, { size: 64, align: 'center', color: '#E0503E', ...DEV }); });
  }
  // 5. The bus: Rohan becomes part of the door
  function busShot(ctx, t) {
    ctx.fillStyle = lin(ctx, 0, 0, 0, H, [[0, '#E8DCC0'], [1, '#8E8270']]); ctx.fillRect(-100, -100, W + 200, H + 200);
    for (let k = 0; k < 3; k++) G.rrect(ctx, -40 + k * 380, 200, 330, 300, 16, { fill: lin(ctx, 0, 200, 0, 500, [[0, '#BFE3F2'], [1, '#7FA6C0']]), lw: 0, seed: 1620 + k });
    const sw = Math.sin(t * 2.2) * 0.04;
    G.rrect(ctx, -40, 560, W + 80, 16, 8, { fill: '#BFC4C8', lw: 0, seed: 1625 }); // the grab rail
    PASS.forEach((st, i) => { const px = -20 + i * 230 + (i % 2) * 40; Ch.person(ctx, { x: px, y: 1700, s: 1.05, pose: 'stand', style: st, rot: sw, handR: [40, -760], eyes: i % 2 ? 'closed' : 'normal', mouth: 'flat', seed: 1630 + i * 10 }); });
    // the door + Rohan pressed against its glass
    G.rrect(ctx, 260, 620, 560, 1100, 12, { fill: '#C0392B', lw: 0, seed: 1680 });
    G.rrect(ctx, 300, 660, 480, 1000, 8, { fill: '#6E8EA0', lw: 0, seed: 1681 });
    ctx.save(); ctx.beginPath(); ctx.rect(300, 660, 480, 1000); ctx.clip();
    Ch.person(ctx, { x: 540, y: 2050, s: 2.0, sx: 1.12, sy: 0.96, pose: 'stand', style: CAST.rohan, handR: [150, -680], handL: [-150, -680], eyes: 'closed', brows: 'worried', mouth: talkMouth('rohan', t, 'o'), sweat: 1, seed: 1300 });
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = lin(ctx, 300, 660, 780, 1660, [[0, 'rgba(255,255,255,0.9)'], [0.3, 'rgba(255,255,255,0)'], [0.6, 'rgba(255,255,255,0.4)'], [1, 'rgba(255,255,255,0)']]); ctx.fillRect(300, 660, 480, 1000); ctx.restore();
    G.rrect(ctx, 530, 660, 20, 1000, 4, { fill: '#2A2320', lw: 0, seed: 1682 });
  }
  // 6. The shortcut: a wedding procession, brakes!
  function shortcutShot(ctx, t) {
    sky(ctx, undefined, undefined, { t });
    backdrop(ctx, t, 560);
    wada(ctx, -120, 420, 520, 830, C.terra, 1700, { shop: false });
    wada(ctx, 600, 400, 600, 850, C.teal, 1710, { shop: false });
    // marigold strings + lights across the lane
    for (let k = 0; k < 3; k++) { for (let i = 0; i < 24; i++) { const u = i / 23; G.ellipse(ctx, u * W, 360 + k * 70 + Math.sin(u * Math.PI) * 60, 10, 10, { fill: i % 2 ? C.marigold : '#F7B733', lw: 0, seed: 1720 + i }); } }
    road(ctx, 1250);
    const a = t - ev.shortcut;
    // the baraat dancing on the right
    const bh = (k) => Math.abs(Math.sin(t * 7 + k)) * 30;
    Ch.person(ctx, { x: 760, y: 1300 - bh(0), s: 0.75, pose: 'stand', style: CAST.dancer1, gesture: 'bhangra', mouth: 'open', eyes: 'happy', seed: 1730 });
    Ch.person(ctx, { x: 900, y: 1290 - bh(1), s: 0.72, pose: 'stand', style: CAST.dancer2, gesture: 'cheer', mouth: 'grin', eyes: 'happy', seed: 1740 });
    Ch.person(ctx, { x: 1010, y: 1300, s: 0.75, pose: 'stand', style: CAST.dancer3, gesture: 'dhol', mouth: 'grin', eyes: 'happy', seed: 1750 });
    Ch.person(ctx, { x: 650, y: 1300 - bh(2) * 0.5, s: 0.78, pose: 'stand', style: CAST.groom, gesture: 'wave', mouth: 'smile', eyes: 'happy', seed: 1760 });
    G.decor(() => { G.rrect(ctx, 640, 860, 400, 90, 14, { fill: lin(ctx, 0, 860, 0, 950, [[0, '#F2B84B'], [1, '#C98A1A']]), lw: 0, seed: 1770 }); G.text(ctx, 'शुभ विवाह', 840, 922, { size: 50, align: 'center', color: '#8E1E14', ...DEV }); });
    // Bablu races in, brakes on the screech, then backs away
    const arrive = ease.outCubic(clamp(a / (ev.brake - ev.shortcut)));
    const back = t > ev.brake + 0.8 ? (t - ev.brake - 0.8) * 120 : 0;
    const bx = lerp(-420, 360, arrive) - back;
    if (t < ev.brake) for (let k = 0; k < 4; k++) { ctx.save(); ctx.globalAlpha = 0.45 * (1 - arrive); G.ellipse(ctx, bx - 320 - k * 60, 1280 - k * 8, 50 + k * 16, 26 + k * 6, { fill: '#E8DCC8', lw: 0, seed: 1780 + k }); ctx.restore(); }
    if (t >= ev.brake && t < ev.brake + 0.5) for (let k = 0; k < 5; k++) G.line(ctx, [[bx - 200 - k * 30, 1300 + k * 3], [bx - 60, 1300 + k * 3]], { color: 'rgba(30,20,10,0.5)', lw: 5, seed: 1790 + k });
    bablu(ctx, { x: bx, y: 1300, s: 0.85, t, dist: bx, face: t > ev.brake ? 'wide' : 'normal', look: 0.7,
      inside: (c) => Ch.person(c, { x: -110, y: -150, s: 0.42, pose: 'sit', style: CAST.rohan, eyes: t > ev.brake ? 'wide' : 'normal', mouth: t > ev.brake ? 'o' : 'flat', seed: 1300, shadow: false }) });
  }
  // 7. Meanwhile the cycle glides through the jam
  function cycleShot(ctx, t) {
    cityBg(ctx, t, { haze: 0.1 });
    jam(ctx, t, [1080, 1200]);
    const u = clamp((t - ev.cycle) / (ev.finish - ev.cycle));
    const cx = lerp(80, 980, u);
    bicycle(ctx, cx, 1340, 0.95, t, { dist: cx, o: { eyes: 'happy', mouth: 'smile', brows: 'neutral', headRot: 0.05 * Math.sin(t * 2) } });
    G.decor(() => { G.rrect(ctx, 760, SAFE.y + 20, 240, 100, 16, { fill: 'rgba(20,20,24,0.82)', lw: 0, seed: 1610 }); G.text(ctx, '९:४०', 880, SAFE.y + 92, { size: 64, align: 'center', color: '#3FD07A', ...DEV }); });
  }
  // 8. The finish at the IT park
  function finishShot(ctx, t) {
    sky(ctx, undefined, undefined, { t, sun: [200, 140] });
    // the glass tower
    G.rrect(ctx, 200, 200, 680, 1080, 6, { fill: lin(ctx, 200, 200, 880, 1280, [[0, '#BCD6E6'], [0.45, '#5F8FB0'], [1, '#2E4E66']]), lw: 0, seed: 1800 });
    for (let r = 0; r < 20; r++) { ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(200, 240 + r * 52, 680, 3); } for (let c = 1; c < 8; c++) { ctx.fillStyle = 'rgba(20,40,60,0.25)'; ctx.fillRect(200 + c * 85, 200, 3, 1080); }
    ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.moveTo(200, 200); ctx.lineTo(500, 200); ctx.lineTo(200, 700); ctx.fill(); ctx.restore();
    G.rrect(ctx, 300, 1050, 480, 80, 12, { fill: 'rgba(20,20,24,0.85)', lw: 0, seed: 1801 }); G.text(ctx, 'आयटी पार्क · हिंजवडी', 540, 1105, { size: 44, align: 'center', color: '#FFFFFF', ...DEV });
    road(ctx, 1250);
    // the ribbon between two posts
    const snapped = t >= ev.ribbon;
    for (const px of [150, 930]) G.rrect(ctx, px - 12, 1060, 24, 260, 6, { fill: '#F6F0E2', lw: 0, seed: 1810 + px });
    if (!snapped) G.line(ctx, [[150, 1150], [540, 1165], [930, 1150]], { color: '#E0503E', lw: 12, seed: 1820 });
    else { const a = t - ev.ribbon; G.line(ctx, [[150, 1150], [420 - a * 60, 1200 + a * 200]], { color: '#E0503E', lw: 12, seed: 1821 }); G.line(ctx, [[930, 1150], [660 + a * 60, 1200 + a * 200]], { color: '#E0503E', lw: 12, seed: 1822 }); G.confetti(ctx, t, ev.ribbon, { n: 90, seed: 4 }); }
    // the clock: 9:58
    G.decor(() => { G.ellipse(ctx, 880, SAFE.y + 100, 90, 90, { fill: rad(ctx, 860, SAFE.y + 80, 5, 95, [[0, '#FFFFFF'], [1, '#D8D0C0']]), lw: 0, seed: 1830 }); G.text(ctx, '९:५८', 880, SAFE.y + 118, { size: 50, align: 'center', color: '#B5452F', ...DEV }); });
    const u = clamp((t - ev.finish) / (ev.ribbon - ev.finish));
    const cx = lerp(-200, 560, u) + (snapped ? (t - ev.ribbon) * 200 : 0);
    bicycle(ctx, cx, 1340, 0.95, t, { dist: cx, o: { gesture: snapped ? 'cheer' : null, eyes: snapped ? 'happy' : 'normal', mouth: snapped ? 'open' : 'smile' } });
    if (snapped && t < ev.ribbon + 0.1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,250,220,${0.5 * (1 - (t - ev.ribbon) / 0.1)})`; ctx.fillRect(-100, -100, W + 200, H + 200); ctx.restore(); }
  }
  // 9. Collapse on the lawn
  function collapseShot(ctx, t) {
    sky(ctx, undefined, undefined, { t });
    G.rrect(ctx, -60, 1000, W + 120, H, 0, { fill: lin(ctx, 0, 1000, 0, H, [[0, '#7FBF6A'], [1, '#3E7A3A']]), lw: 0, seed: 1840 });
    for (let k = 0; k < 120; k++) { ctx.fillStyle = `rgba(${G.rnd(k, 1) > 0.5 ? '200,240,160' : '40,90,40'},0.35)`; ctx.fillRect(G.rnd(k, 2) * W, 1000 + G.rnd(k, 3) * 900, 3, 10 + G.rnd(k, 4) * 10); }
    ctx.save(); ctx.globalAlpha = 0.6; G.rrect(ctx, 0, 300, W, 700, 0, { fill: lin(ctx, 0, 300, W, 1000, [[0, '#9FC0D4'], [1, '#5F8FB0']]), lw: 0, seed: 1841 }); ctx.restore();
    bicycle(ctx, 250, 1420, 0.8, t, { ride: false });
    Ch.person(ctx, { x: 560, y: 1520, s: 1.15, pose: 'floor', style: CAST.rohan, headRot: -0.25, eyes: 'closed', brows: 'worried', mouth: talkMouth('rohan', t, 'o'), sweat: 1, handR: [180, -60], handL: [-180, -60], seed: 1300 });
    Ch.person(ctx, { x: 870, y: 1500, s: 1.05, pose: 'stand', style: CAST.guard, handR: [-140, -380], eyes: 'normal', brows: 'up', mouth: 'smile', look: -0.6, seed: 1850 });
    G.rrect(ctx, 870 - 1.05 * 140 - 18, 1500 - 1.05 * 380 - 60, 36, 90, 8, { fill: 'rgba(170,220,255,0.85)', lw: 0, seed: 1851 });
  }
  // 10. PUNE RULE #3
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
      G.text(ctx, 'पुण्याचा नियम #३', 0, -160, { size: 96, align: 'center', color: C.yellow, ...DEV });
      G.text(ctx, 'अंतर किलोमीटरमध्ये नाही,', 0, -10, { size: 68, align: 'center', color: '#F6F0E2', ...DEV });
      G.text(ctx, 'तासांमध्ये!', 0, 130, { size: 116, align: 'center', color: '#F6F0E2', ...DEV });
      ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.moveTo(-440, -330); ctx.lineTo(-100, -330); ctx.lineTo(-440, 60); ctx.fill(); ctx.restore();
      ctx.restore();
      const d = t - ev.rule; if (d < 0.8) for (let k = 0; k < 8; k++) { const ang = k * Math.PI / 4; ctx.save(); ctx.globalAlpha = 0.6 * (1 - d / 0.8); G.ellipse(ctx, 540 + Math.cos(ang) * (480 + d * 300), 760 + Math.sin(ang) * (360 + d * 200), 40 + d * 40, 26 + d * 20, { fill: '#E8DCC8', lw: 0, seed: 1620 + k }); ctx.restore(); }
    }
  }
  // 11. City of cycles: an old sepia street of cyclists dissolves into today
  function cityShot(ctx, t) {
    sky(ctx, '#E9824A', '#FBD9A0', { t, sun: [880, 420] });
    backdrop(ctx, t, 620);
    wada(ctx, -120, 470, 520, 780, C.ochre, 1900, { shop: false });
    wada(ctx, 560, 440, 640, 810, C.terra, 1910, { shop: false });
    road(ctx, 1250);
    const flow = (t - ev.city) * 160;
    for (let r = 0; r < 3; r++) for (let k = 0; k < 5; k++) { const x = ((k * 280 + r * 130 + flow * (1 + r * 0.2)) % 1500) - 200; bicycle(ctx, x, 1330 + r * 150, 0.55 + r * 0.12, t, { dist: x, o: { style: k === 2 && r === 1 ? CAST.rohan : PASS[(k + r) % 5], eyes: 'happy', mouth: 'smile', seed: 1920 + r * 10 + k } }); }
    // sepia for the "then", fading to colour for the "now"
    const now = clamp((t - ev.city - 2.2) / 1.0);
    ctx.save(); ctx.globalAlpha = 1 - now;
    ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = '#808080'; ctx.fillRect(-100, -100, W + 200, H + 200);
    ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = '#E8C89A'; ctx.fillRect(-100, -100, W + 200, H + 200);
    ctx.restore();
    G.decor(() => { G.rrect(ctx, 380, SAFE.y + 20, 320, 100, 16, { fill: 'rgba(20,20,24,0.8)', lw: 0, seed: 1930 }); G.text(ctx, now < 0.5 ? '१९७०' : 'आज', 540, SAFE.y + 92, { size: 64, align: 'center', color: C.yellow, ...DEV }); });
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
    G.text(ctx, 'मीराचं मिसळ चॅलेंज', 540, 1340, { size: 54, align: 'center', color: '#2A2320', ...DEV });
    ctx.restore();
  }

  const film = Shots.film([
    { at: 0, draw: hook, cam: Shots.shake(26, ev.hook, 6) },
    { at: ev.intro, draw: introShot, in: 'whip', cam: Shots.push(1, 1.06) },
    { at: ev.lineup, draw: lineupShot, in: 'cut', cam: Shots.shake(14, ev.go, 5) },
    { at: ev.bike, draw: bikeShot, in: 'whip', cam: Shots.combine(Shots.push(1.15, 1.0), Shots.handheld(5)) },
    { at: ev.bus, draw: busShot, in: 'cut', cam: Shots.handheld(10) },
    { at: ev.shortcut, draw: shortcutShot, in: 'whip', cam: Shots.shake(24, ev.brake, 6) },
    { at: ev.cycle, draw: cycleShot, in: 'cut', cam: Shots.push(1.0, 1.04) },
    { at: ev.finish, draw: finishShot, in: 'cut', cam: Shots.shake(18, ev.ribbon, 5) },
    { at: ev.collapse, draw: collapseShot, in: 'cut', cam: Shots.push(1.0, 1.05) },
    { at: ev.rule, draw: ruleShot, in: 'flash', cam: Shots.shake(24, ev.rule, 6) },
    { at: ev.city, draw: cityShot, in: 'cut', cam: Shots.push(1.04, 1.0) },
    { at: ev.meter, draw: endShot, in: 'flash' },
  ]);

  // ---------- the cinematic grade: key light from the sun, cool shadows, a colour grade, floating dust ----------
  function grade(ctx, t) {
    const look = t < ev.intro ? 'night' : t < ev.bike ? 'day' : t < ev.bus ? 'noon' : t < ev.shortcut ? 'interior' : t < ev.collapse ? 'day' : t < ev.rule ? 'noon' : t < ev.city ? 'warm' : t < ev.meter ? 'golden' : 'night';
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
