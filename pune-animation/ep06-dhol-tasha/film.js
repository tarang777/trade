// THE FILM for EP06 "Why Is Pune Drumming at 9 PM?" (dhol-tasha). A list of shots (Shots.film); every frame is a pure function of t.
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

  // ---------- EP06: dhol-tasha ----------
  CAST.rohan = { outfit: 'hoodie', shirt: '#7E8590', skin: '#B97D55', hairStyle: 'short', hair: '#1E1A1A', facialHair: 'none', bottoms: 'pants', pants: '#2F3A5A', shoes: '#EDEDED' };
  CAST.rohanP = { outfit: 'kameez', shirt: '#F6F0E2', skin: '#B97D55', hairStyle: 'short', hair: '#1E1A1A', bottoms: 'pants', pants: '#F6F0E2', shoes: '#5A3A2A' };
  CAST.aajiP = { ...CAST.aaji, robe: '#E07A2E', trim: '#8A2233' };
  const TROUPE = [
    { outfit: 'kameez', shirt: '#F6F0E2', skin: '#8D5A3B', hairStyle: 'curly', hair: '#1E1A1A', bottoms: 'pants', pants: '#F6F0E2' },
    { outfit: 'kameez', shirt: '#3FA89B', skin: '#C98A62', hairStyle: 'ponytail', hair: '#1E1A1A', bottoms: 'pants', pants: '#2F3A5A' }, // a doctor in scrubs
    { outfit: 'kameez', shirt: '#F6F0E2', skin: '#A86E4B', hairStyle: 'bald', hair: '#9A9A9A', facialHair: 'mustache', glasses: 'square', bottoms: 'pants', pants: '#F6F0E2' },
    { outfit: 'kameez', shirt: '#F6F0E2', skin: '#D59B72', hairStyle: 'bun', hair: '#1E1A1A', bottoms: 'pants', pants: '#F6F0E2' },
    { outfit: 'tee', shirt: '#E0703E', skin: '#8D5A3B', hairStyle: 'short', hair: '#1E1A1A', bottoms: 'pants', pants: '#3A3A44' },
  ];
  // the beat clock: how far into the current beat we are (0..1), for drummers hitting on the beat
  const beatPhase = (t) => { const c = S.clock; const b = c.beatPos ? c.beatPos(t) : (t - 0.3) / BEAT; return b - Math.floor(b); };
  const hitAmt = (t) => Math.exp(-beatPhase(t) * 7);
  function band(ctx, x, y, s) { G.rrect(ctx, x - 70 * s, y, 140 * s, 18 * s, 6 * s, { fill: '#F28C28', lw: 0, seed: 5000 }); G.poly(ctx, [[x + 60 * s, y + 4 * s], [x + 110 * s, y + 30 * s], [x + 70 * s, y + 18 * s]], { fill: '#F28C28', lw: 0, seed: 5001, step: 10 }); }
  function drummer(ctx, x, y, s, st, t, seed, o = {}) {
    const h = hitAmt(t + (seed % 3) * 0.01), bob = h * 10 * s;
    Ch.person(ctx, { x, y: y + bob, s, pose: 'stand', style: st, gesture: 'dhol', eyes: 'happy', mouth: 'grin', seed, ...o });
    band(ctx, x - 6 * s, y + bob - 468 * s, s);
  }
  function lightsNight(ctx, t, { y0 = 260 } = {}) {
    ctx.fillStyle = lin(ctx, 0, 0, 0, H, [[0, '#0E1028'], [0.6, '#2A1E3A'], [1, '#4A2A2A']]); ctx.fillRect(-100, -100, W + 200, H + 200);
    for (let k = 0; k < 50; k++) { ctx.fillStyle = `rgba(255,255,255,${0.2 + G.rnd(k, 1) * 0.5})`; ctx.fillRect(G.rnd(k, 2) * W, G.rnd(k, 3) * 400, 2, 2); }
    // strings of festive bulbs, pulsing on the beat
    const p = 0.6 + 0.4 * hitAmt(t);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 22; i++) { const u = i / 21, x = u * W, y = y0 + r * 90 + Math.sin(u * Math.PI) * 70; const col = ['#F2C230', '#E0503E', '#3FD07A', '#F28C28'][(i + r) % 4]; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rad(ctx, x, y, 1, 26, [[0, col], [1, col + '00']]); ctx.globalAlpha = p; ctx.fillRect(x - 26, y - 26, 52, 52); ctx.restore(); G.ellipse(ctx, x, y, 6, 6, { fill: col, lw: 0, seed: 5010 }); }
  }
  function ground(ctx, y = 1250) { ctx.fillStyle = lin(ctx, 0, y, 0, H, [[0, '#6E5A48'], [1, '#2E2218']]); ctx.fillRect(-100, y, W + 200, H); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = rad(ctx, 540, y + 60, 20, 700, [[0, 'rgba(255,170,90,0.25)'], [1, 'rgba(255,170,90,0)']]); ctx.fillRect(-100, y - 200, W + 200, 900); ctx.restore(); }
  function flagPole(ctx, x, y, t, s = 1) { const a = t * 3.2; ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(a) * 0.35); G.rrect(ctx, -6 * s, -900 * s, 12 * s, 900 * s, 4, { fill: '#C9A227', lw: 0, seed: 5020 }); const w = Math.sin(t * 6) * 30 * s; G.poly(ctx, [[0, -900 * s], [260 * s, -840 * s + w], [0, -760 * s]], { fill: lin(ctx, 0, -900 * s, 260 * s, -800 * s, [[0, '#F28C28'], [1, '#E0603A']]), lw: 0, seed: 5021, step: 20 }); ctx.restore(); }

  // 1. HOOK: the chai ripples with each distant boom
  function hook(ctx, t) {
    ctx.fillStyle = lin(ctx, 0, 0, 0, H, [[0, '#14182E'], [1, '#2A2440']]); ctx.fillRect(-100, -100, W + 200, H + 200);
    // the window: night city outside, rattling on each beat
    const rattle = t >= ev.hook ? hitAmt(t) * 6 : 0;
    ctx.save(); ctx.translate(Math.sin(t * 80) * rattle, 0);
    G.rrect(ctx, 90, 260, 900, 820, 12, { fill: lin(ctx, 0, 260, 0, 1080, [[0, '#1E2650'], [1, '#3A2E5A']]), lw: 0, seed: 5030 });
    for (let k = 0; k < 9; k++) { const bx = 110 + k * 100, bh = 200 + G.rnd(k, 5) * 300; ctx.fillStyle = '#141A3A'; ctx.fillRect(bx, 1080 - bh, 90, bh); for (let r = 0; r < 6; r++) if (G.rnd(k, r) > 0.4) { ctx.fillStyle = 'rgba(255,210,120,0.8)'; ctx.fillRect(bx + 12 + (r % 2) * 40, 1080 - bh + 20 + r * 30, 20, 14); } }
    ctx.strokeStyle = '#5A3A22'; ctx.lineWidth = 18; ctx.strokeRect(90, 260, 900, 820); ctx.beginPath(); ctx.moveTo(540, 260); ctx.lineTo(540, 1080); ctx.stroke();
    ctx.restore();
    G.rrect(ctx, 40, 1080, 1000, 60, 8, { fill: lin(ctx, 0, 1080, 0, 1140, [[0, '#8E6444'], [1, '#4A2A14']]), lw: 0, seed: 5031 });
    // the glass of chai, its surface rippling
    const gx = 540, gy = 1000;
    G.poly(ctx, [[gx - 60, gy - 120], [gx + 60, gy - 120], [gx + 46, gy + 80], [gx - 46, gy + 80]], { fill: 'rgba(210,230,240,0.35)', lw: 0, seed: 5032, step: 20 });
    G.poly(ctx, [[gx - 56, gy - 70], [gx + 56, gy - 70], [gx + 46, gy + 76], [gx - 46, gy + 76]], { fill: lin(ctx, 0, gy - 70, 0, gy + 76, [[0, '#C98A4A'], [1, '#7A4A20']]), lw: 0, seed: 5033, step: 20 });
    const r = t >= ev.hook ? hitAmt(t) : 0;
    for (let k = 0; k < 3; k++) { ctx.strokeStyle = `rgba(255,230,190,${0.6 * r})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(gx, gy - 70, 14 + k * 16 + (1 - r) * 10, 4 + k * 3, 0, 0, Math.PI * 2); ctx.stroke(); }
    if (t >= ev.hook && t < ev.hook + 0.1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,220,180,${0.45 * (1 - (t - ev.hook) / 0.1)})`; ctx.fillRect(-100, -100, W + 200, H + 200); ctx.restore(); }
    G.decor(() => { G.rrect(ctx, SAFE.x + 10, SAFE.y + 10, 520, 140, 18, { fill: 'rgba(20,20,24,0.82)', lw: 0, seed: 1100 }); G.text(ctx, 'पुणे डायरीज', SAFE.x + 40, SAFE.y + 78, { size: 58, color: C.yellow, ...DEV }); G.text(ctx, 'भाग ६ · ढोल-ताशा', SAFE.x + 40, SAFE.y + 128, { size: 34, color: '#F6F0E2', ...DEV }); });
  }
  // 2. Arjun at his window, ears covered; Bablu below
  function windowShot(ctx, t) {
    ctx.fillStyle = lin(ctx, 0, 0, 0, H, [[0, '#14182E'], [1, '#3A2E4A']]); ctx.fillRect(-100, -100, W + 200, H + 200);
    G.rrect(ctx, 80, 200, 920, 1000, 6, { fill: lin(ctx, 0, 200, 0, 1200, [[0, '#B8A486'], [1, '#6E6050']]), lw: 0, seed: 5040 });
    for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) { const lit = !(r === 1 && k === 1); G.rrect(ctx, 140 + k * 300, 260 + r * 300, 200, 200, 6, { fill: lit ? 'rgba(255,210,120,0.85)' : '#2A2A3A', lw: 0, seed: 5041 + r * 3 + k }); }
    G.rrect(ctx, 420, 540, 240, 240, 6, { fill: lin(ctx, 0, 540, 0, 780, [[0, '#FFE0A0'], [1, '#E0A050']]), lw: 0, seed: 5050 });
    ctx.save(); ctx.beginPath(); ctx.rect(420, 540, 240, 240); ctx.clip();
    Ch.person(ctx, { x: 540, y: 1100, s: 0.85, pose: 'stand', style: CAST.arjun, handR: [70, -470], handL: [-70, -470], eyes: 'closed', brows: 'worried', mouth: talkMouth('arjun', t, 'o'), seed: 1250 });
    ctx.restore();
    ctx.strokeStyle = '#5A3A22'; ctx.lineWidth = 10; ctx.strokeRect(420, 540, 240, 240);
    road(ctx, 1200);
    bablu(ctx, { x: 520, y: 1380, s: 0.85, t, face: 'normal', look: 0.3 });
    // sound waves rolling in from the right, on the beat
    for (let k = 0; k < 3; k++) { const p = (beatPhase(t) + k / 3) % 1; ctx.strokeStyle = `rgba(255,200,120,${0.5 * (1 - p)})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(1200, 700, 100 + p * 500, Math.PI * 0.75, Math.PI * 1.25); ctx.stroke(); }
  }
  // 3. The practice ground: the pathak
  function groundShot(ctx, t) {
    lightsNight(ctx, t);
    ground(ctx, 1000);
    const a = t - ev.ground, crane = ease.outCubic(clamp(a / 2.5));
    ctx.save(); ctx.translate(0, lerp(-200, 0, crane));
    flagPole(ctx, 880, 1080, t, 0.8);
    for (let r = 0; r < 2; r++) for (let k = 0; k < 5; k++) drummer(ctx, 120 + k * 210 + r * 100, 1150 + r * 230, 0.5 + r * 0.12, TROUPE[(k + r * 2) % 5], t, 5100 + r * 50 + k * 10);
    ctx.restore();
    if (false) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,200,140,${0.5 * (1 - a / 0.1)})`; ctx.fillRect(-100, -100, W + 200, H + 200); ctx.restore(); }
    // labels during "students, doctors, engineers"
    if (t > T(8, 3)) G.decor(() => [['विद्यार्थी', 230, 980], ['डॉक्टर', 540, 990], ['इंजिनिअर', 860, 980]].forEach(([s2, x, y], i) => { const c = ease.outBack(clamp((t - T(8, 3) - i * 0.6) / 0.3), 2); if (c > 0) { ctx.save(); ctx.translate(x, y - 260); ctx.scale(c, c); G.rrect(ctx, -110, -40, 220, 64, 14, { fill: 'rgba(20,20,24,0.85)', lw: 0, seed: 5150 + i }); G.text(ctx, s2, 0, 10, { size: 36, align: 'center', color: C.yellow, ...DEV }); ctx.restore(); } }));
  }
  // 4. Rohan: the lead dhol — and his other life (split)
  function rohanShot(ctx, t) {
    const split = t > T(11, 2) + 0.2;
    lightsNight(ctx, t);
    ground(ctx, 1250);
    G.rays(ctx, 540, 900, { n: 24, r0: 200, r1: 1300, color: 'rgba(255,190,110,0.18)', lw: 16, seed: 5200, spin: t * 0.2 });
    drummer(ctx, split ? 760 : 540, 1700, split ? 1.15 : 1.5, CAST.rohanP, t, 1300, { brows: 'determined', mouth: talkMouth('rohan', t, 'grin') });
    if (split) {
      // left half: office Rohan, grey and tired
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 440, H); ctx.clip();
      ctx.fillStyle = lin(ctx, 0, 0, 0, H, [[0, '#9AA0A6'], [1, '#5E646A']]); ctx.fillRect(0, 0, 440, H);
      G.rrect(ctx, 0, 1290, 440, 40, 0, { fill: '#BFC4C8', lw: 0, seed: 5210 });
      Ch.person(ctx, { x: 220, y: 1560, s: 1.0, pose: 'stand', style: CAST.rohan, handR: [100, -360], handL: [-100, -360], eyes: 'closed', brows: 'worried', mouth: 'flat', seed: 1300 });
      G.rrect(ctx, 280, 1215, 150, 80, 6, { fill: '#2A2A30', lw: 0, seed: 5211 });
      G.decor(() => G.text(ctx, '९ – ६', 220, SAFE.y + 90, { size: 70, align: 'center', color: '#8FD3F2', stroke: '#1E1E22', strokeW: 8, ...DEV }));
      ctx.restore();
      G.rrect(ctx, 434, 0, 12, H, 0, { fill: '#F2C230', lw: 0, seed: 5212 });
      G.decor(() => { G.text(ctx, '७ – १०', 760, SAFE.y + 90, { size: 70, align: 'center', color: C.yellow, stroke: '#1E1E22', strokeW: 8, ...DEV }); });
    }
    const a = t - ev.rohan; if (a >= 0 && a < 0.1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,220,160,${0.55 * (1 - a / 0.1)})`; ctx.fillRect(-100, -100, W + 200, H + 200); ctx.restore(); }
  }
  // 5. Aaji on the tasha
  function aajiShot(ctx, t) {
    lightsNight(ctx, t);
    ground(ctx, 1250);
    const a = t - ev.aaji;
    const roll = Math.sin(t * 60) * 30;
    Ch.person(ctx, { x: 540, y: 1700, s: 1.35, pose: 'stand', style: CAST.aajiP, handR: [120, -330 + roll], handL: [-120, -330 - roll], eyes: 'normal', brows: 'determined', mouth: talkMouth('aaji', t, 'grin'), seed: 1760 });
    // the tasha: a shallow round drum at her waist
    const tx = 540, ty = 1700 - 1.35 * 290;
    G.ellipse(ctx, tx, ty + 30, 190, 50, { fill: lin(ctx, 0, ty, 0, ty + 80, [[0, '#C9A227'], [1, '#6E5410']]), lw: 0, seed: 5300 });
    G.ellipse(ctx, tx, ty, 190, 46, { fill: rad(ctx, tx - 40, ty - 10, 10, 200, [[0, '#FFF6E0'], [1, '#D8C8A0']]), lw: 0, seed: 5301 });
    for (const sx of [1, -1]) G.line(ctx, [[tx + sx * 1.35 * 120, 1700 - 1.35 * (330 - sx * roll)], [tx + sx * 60, ty - 10]], { color: '#5A3A22', lw: 6, seed: 5302 + sx });
    const g = a - 0.3; if (g > 0 && g < 0.4) G.star(ctx, 600, 1700 - 1.35 * 500, 40 * Math.sin(g / 0.4 * Math.PI), { fill: '#FFFFFF', seed: 1770 });
    G.decor(() => G.text(ctx, 'आजी · ताशा', SAFE.x + 20, SAFE.y + 90, { size: 70, color: '#F6F0E2', stroke: '#2A2320', strokeW: 9, ...DEV }));
  }
  // 6. The climax: the full pathak, faster and faster, the flag spinning
  function climaxShot(ctx, t) {
    lightsNight(ctx, t, { y0: 220 });
    ground(ctx, 950);
    const u = clamp((t - ev.climax) / (ev.unison - ev.climax));
    ctx.save(); ctx.translate(540, 1100); ctx.scale(1 + u * 0.15, 1 + u * 0.15); ctx.translate(-540, -1100);
    flagPole(ctx, 540, 1150, t * (1 + u), 1.0);
    for (let r = 0; r < 3; r++) for (let k = 0; k < 6; k++) { const x = 60 + k * 190 + (r % 2) * 95; const st = r === 2 && k === 2 ? CAST.rohanP : r === 2 && k === 3 ? null : TROUPE[(k + r) % 5]; if (st) drummer(ctx, x, 1080 + r * 220, 0.45 + r * 0.13, st, t, 5400 + r * 60 + k * 10); }
    // Aaji front and centre on the tasha
    const roll = Math.sin(t * 70) * 20;
    Ch.person(ctx, { x: 640, y: 1520, s: 0.71, pose: 'stand', style: CAST.aajiP, handR: [120, -330 + roll], handL: [-120, -330 - roll], eyes: 'happy', mouth: 'grin', seed: 1760 });
    G.ellipse(ctx, 640, 1520 - 0.71 * 290, 100, 26, { fill: '#E8D8B0', lw: 0, seed: 5450 });
    ctx.restore();
    // gulal-coloured dust in the light, pulsing on the beat
    for (let k = 0; k < 40; k++) { const x = (G.rnd(k, 1) * W + t * 30) % W, y = 400 + G.rnd(k, 2) * 900 - (t * 40 % 900); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.5 * hitAmt(t); ctx.fillStyle = ['#F28C28', '#E0503E', '#F2C230'][k % 3]; ctx.fillRect(x, y, 4, 4); ctx.restore(); }
  }
  // 7. PUNE RULE #6 at the unison hit
  function ruleShot(ctx, t) {
    lightsNight(ctx, t);
    ground(ctx, 1250);
    const a = clamp((t - ev.unison) / 0.25);
    const sc = t < ev.unison ? 0 : lerp(1.7, 1, ease.outBack(a, 1.8));
    if (sc > 0) {
      ctx.save(); ctx.translate(540, 760); ctx.scale(sc, sc); ctx.rotate(-0.025);
      softShadow(ctx, 30, 40, 520, 400, 0.6);
      G.rrect(ctx, -440, -330, 880, 660, 20, { fill: lin(ctx, -440, -330, 440, 330, [[0, '#2A7A60'], [1, '#123A2E']]), lw: 8, seed: 1610 });
      ctx.strokeStyle = C.yellow; ctx.lineWidth = 6; ctx.strokeRect(-410, -300, 820, 600);
      G.text(ctx, 'पुण्याचा नियम #६', 0, -160, { size: 96, align: 'center', color: C.yellow, ...DEV });
      G.text(ctx, 'गणपतीच्या आधी,', 0, -10, { size: 86, align: 'center', color: '#F6F0E2', ...DEV });
      G.text(ctx, 'पुणं ठेका धरतं!', 0, 130, { size: 100, align: 'center', color: '#F6F0E2', ...DEV });
      ctx.restore();
    }
    const d = t - ev.unison; if (false) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,220,170,${0.7 * (1 - d / 0.12)})`; ctx.fillRect(-100, -100, W + 200, H + 200); ctx.restore(); }
  }
  // 8. Arjun gets the sticks; Ganpati Bappa Morya
  function jamShot(ctx, t) {
    lightsNight(ctx, t);
    ground(ctx, 1250);
    flagPole(ctx, 960, 1260, t, 0.7);
    bablu(ctx, { x: 160, y: 1240, s: 0.55, t, face: 'happy', look: 0.6 });
    const morya = t > ev.morya;
    drummer(ctx, 560, 1560, 0.95, CAST.rohanP, t, 1300, { gesture: morya ? 'cheer' : 'dhol', mouth: talkMouth('rohan', t, 'grin') });
    Ch.person(ctx, { x: 830, y: 1560, s: 0.95, pose: 'stand', style: CAST.aajiP, gesture: morya ? 'cheer' : 'akimbo', eyes: 'happy', mouth: 'grin', seed: 1760 });
    const miss = t > ev.jam + 0.9 && t < ev.jam + 1.6;
    Ch.person(ctx, { x: 290, y: 1560, s: 0.95, pose: 'stand', style: CAST.arjun, gesture: morya ? 'cheer' : null, handR: morya ? undefined : [90, miss ? -200 : -420], handL: morya ? undefined : [-60, -400], eyes: miss ? 'wide' : 'happy', brows: 'up', mouth: talkMouth('arjun', t, miss ? 'o' : 'grin'), seed: 1250 });
    if (!morya) { G.line(ctx, [[290 + 0.95 * 90, 1560 - 0.95 * (miss ? 200 : 420)], [290 + 0.95 * 90 + 60, 1560 - 0.95 * (miss ? 200 : 420) - 90]], { color: '#5A3A22', lw: 6, seed: 5500 }); }
    if (morya) for (let k = 0; k < 6; k++) { const ha = t - ev.morya - 1.4 - k * 0.12; if (ha > 0) { ctx.save(); ctx.globalAlpha = Math.max(0, 1 - ha * 0.4); G.star(ctx, 200 + k * 140, 900 - ha * 160, 22, { fill: '#F2C230', seed: 5510 + k }); ctx.restore(); } }
  }
  // 9. End card
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
    G.text(ctx, 'पंधरा रुपयांचा लाइफ कोच', 540, 1340, { size: 52, align: 'center', color: '#2A2320', ...DEV });
    ctx.restore();
  }

  const film = Shots.film([
    { at: 0, draw: hook, cam: Shots.push(1.0, 1.06) },
    { at: ev.window, draw: windowShot, in: 'cut', cam: Shots.push(1.0, 1.05) },
    { at: ev.ground, draw: groundShot, in: 'cut', cam: Shots.shake(16, ev.ground, 6) },
    { at: ev.rohan, draw: rohanShot, in: 'cut', cam: Shots.shake(20, ev.rohan, 6) },
    { at: ev.aaji, draw: aajiShot, in: 'cut', cam: Shots.combine(Shots.push(1.0, 1.06), Shots.shake(16, ev.aaji, 6)) },
    { at: ev.climax, draw: climaxShot, in: 'cut', cam: (s) => ({ x: Math.sin(s.t * 0.8) * 30, y: Math.sin(s.t * 47) * 3 * hitAmt(s.t) }) },
    { at: ev.unison, draw: ruleShot, in: 'cut', cam: Shots.shake(30, ev.unison, 5) },
    { at: ev.jam, draw: jamShot, in: 'cut', cam: Shots.push(1.0, 1.05) },
    { at: ev.meter, draw: endShot, in: 'flash' },
  ]);

  // ---------- the cinematic grade: key light from the sun, cool shadows, a colour grade, floating dust ----------
  function grade(ctx, t) {
    const look = t < ev.ground ? 'night' : t < ev.meter ? 'festive' : 'night';
    const L = {
      day: { key: 'rgba(255,236,200,0.22)', shade: 'rgba(40,60,110,0.22)', soft: 'rgba(255,200,150,0.12)', dust: 0.5 },
      warm: { key: 'rgba(255,220,170,0.25)', shade: 'rgba(60,40,30,0.25)', soft: 'rgba(255,180,120,0.14)', dust: 0.3 },
      noon: { key: 'rgba(255,250,230,0.32)', shade: 'rgba(40,60,110,0.16)', soft: 'rgba(255,230,180,0.12)', dust: 0.8 },
      interior: { key: 'rgba(255,200,150,0.15)', shade: 'rgba(20,10,30,0.35)', soft: 'rgba(255,150,90,0.12)', dust: 0.4 },
      golden: { key: 'rgba(255,190,120,0.30)', shade: 'rgba(70,30,60,0.25)', soft: 'rgba(255,140,60,0.18)', dust: 1 },
      monsoon: { key: 'rgba(200,220,240,0.10)', shade: 'rgba(30,50,80,0.30)', soft: 'rgba(110,150,200,0.14)', dust: 0 },
      festive: { key: 'rgba(255,190,120,0.18)', shade: 'rgba(60,20,70,0.30)', soft: 'rgba(255,140,60,0.14)', dust: 0.7 },
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
