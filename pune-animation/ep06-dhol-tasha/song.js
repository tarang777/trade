// THE SONG for EP06: a dhol-tasha pathak, synthesised from score.js.   node song.js   (STEMS=1 writes stems)
// Distant dhol thumps under the hook, then the practice groove (dagga bass strokes, tilli treble strokes,
// tasha snare/rim rolls), the full pathak with a tutari-like brass call, accelerating 120 -> 150 BPM with
// the tempo map, ending on one huge unison hit. Then a lighter groove, and "Morya!" from the crowd.
const path = require('path');
const { SR, Bus, reverb } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');
const Genre = require('./engine/audio/genres');
const Voice = require('./engine/audio/voice');
const U = require('./engine/util');
const sc = require('./score');
const { T, BEAT, DURATION, m, ev, clock, chordAt } = sc;

const N = Math.ceil(DURATION * SR);
const bus = () => new Bus(N);
const drums = bus(), tasha = bus(), bass = bus(), pad = bus(), keys = bus(), brass = bus(), fx = bus(), amb = bus(), heart = bus(), verb = bus();
const rng = U.mulberry32(66);
const D = (stroke, t, g, pan = 0, pitch = 1) => drums.addMono(I.dhol(stroke, { seed: Math.round(t * 100) % 97, pitch }), t, g, pan);
const tash = (t, g, acc = false) => { tasha.addMono(I.snare({ tone: 1.6, snap: 1.4, decay: 0.05, seed: Math.round(t * 1000) % 89 }), t, g * (acc ? 1.4 : 1), (rng() - 0.5) * 0.5); if (acc) tasha.addMono(I.rim(1.3), t, g * 0.8); };

// ---------- the drumming, bar by bar ----------
for (const [b0, b1, lvl] of sc.DRUMS) for (let b = b0; b < b1; b++) {
  const at = (x) => T(b, x);
  if (lvl === 0) { D('dagga', at(0), 0.35); D('dagga', at(2), 0.3); continue; } // far away, through walls
  const g = lvl === 2 ? 1 : 0.7;
  for (const x of [0, 1.5, 2]) D('dagga', at(x), 0.75 * g, -0.15);
  for (const x of [1, 3]) D('tilli', at(x), 0.6 * g, 0.2);
  D('both', at(3.5), 0.7 * g);
  for (let k = 0; k < 16; k++) tash(at(k / 4), (lvl === 2 ? 0.16 : 0.09), k % 4 === 0);
  if (lvl === 2) { drums.addMono(I.crash(2), at(0), 0.18); if (b % 2) for (const x of [0.5, 2.5]) D('both', at(x), 0.5, 0.3); }
}
// ---------- the hits ----------
for (const [t, big] of [[ev.ground, 1], [ev.rohan, 1.1], [ev.aaji, 1], [ev.unison, 1.5]]) { D('both', t, 1 * big); D('both', t, 0.8 * big, 0.4, 0.97); D('both', t, 0.8 * big, -0.4, 1.03); drums.addMono(I.crash(3), t, 0.3 * big); fx.addMono(I.subBoom(0.8 * big, 70, 32), t, 0.35 * big); }
// Aaji's tasha roll INTO her hit (ends an 8th early, then the hit)
for (let k = 0; k < 14; k++) tash(ev.aaji - BEAT * 0.5 - (14 - k) * 0.045, 0.06 + k * 0.012, false);
// the tutari-like brass call when the ground is revealed, and at the climax
const call = (t, g) => { for (const [x, n, d] of [[0, 'D4', 0.5], [0.5, 'A4', 0.5], [1, 'D5', 1.5]]) { const { L, R } = I.brassNote(m(n), BEAT * d, { bright: 1.5, seed: m(n) + x }); brass.addStereo(L, R, t + x * BEAT, g); } };
call(ev.ground + BEAT * 0.5, 0.07); call(ev.climax, 0.09); call(T(19), 0.09);
// the unison hit: everything stops for half a bar after it (the stamp rings out), crowd cheer
for (const b of [drums, tasha]) MIX.gate(b, ev.unison + 0.25, T(22), 0.02);
for (let i = 0; i < 22; i++) amb.addMono(I.voice(m('A4') + Math.floor(rng() * 7), 0.3 + rng() * 0.3, { syl: 'e', type: 'alto', seed: 70 + i, glide: 3, breath: 0.2, shout: 1.3 }), ev.unison + 0.3 + rng() * 1.6, 0.05, (rng() - 0.5) * 1.4);
for (const n of ['D3', 'A3', 'D4', 'F#4']) { const { L, R } = I.brassNote(m(n), BEAT * 2, { stab: false, bright: 1.2, seed: m(n) }); brass.addStereo(L, R, ev.unison, 0.08); }
// Arjun's first (wrong) hit: a dull thunk + a laugh-boing
fx.addMono(I.thud(140, 0.06), ev.jam + 0.9, 0.5); fx.addMono(I.boing(), ev.jam + 1.1, 0.15);
// "Morya!" from the crowd, after Bablu's call
for (let i = 0; i < 16; i++) amb.addMono(I.voice(m('D4') + (i % 3) * 2, 0.55, { syl: 'o', type: i % 2 ? 'tenor' : 'alto', seed: 90 + i, glide: -3, breath: 0.15, shout: 1.4 }), ev.morya + 1.45 + rng() * 0.08, 0.05, (rng() - 0.5) * 1.2);
// ---------- a warm drone under it all (harmonium) ----------
for (let b = 6; b < 26; b += 2) { const c = sc.chords.find((q) => q.bar === b); const { L, R } = I.harmonium(c.notes[0] - 12, T(b + 2) - T(b), { attack: 0.5, release: 0.6, bright: 0.6, seed: b }); keys.addStereo(L, R, T(b), 0.025); }
// ---------- METER DOWN ----------
fx.addMono(I.tvClick(), ev.meter, 0.6); fx.addMono(I.woodTick(1.8), ev.meter, 0.4);
D('both', ev.meter, 0.9); drums.addMono(I.clap({ spread: 1.2 }), ev.meter, 0.5);
for (const n of ['D4', 'F#4', 'A4']) { const { L, R } = I.harmonium(m(n), 1.4, { attack: 0.01, release: 0.8, bright: 1.1, seed: m(n) }); keys.addStereo(L, R, ev.meter, 0.08); }

// ---------- the voiceover ----------
// Each line: the ElevenLabs take vo/<id>.mp3 if it exists, else an espeak-ng Marathi/Hindi placeholder.
// Trimmed of silence, levelled, placed at its score time; words share the line by length (for captions);
// the mouth track comes from the voice bus (lip-sync).
const fs = require('fs');
const { execFileSync } = require('child_process');
function placeVoices(lines) {
  const dir = path.join(__dirname, 'vo'), out = path.join(__dirname, 'out');
  fs.mkdirSync(path.join(out, '.vo-ph'), { recursive: true });
  const vbus = new Bus(N), placed = [];
  let engine = 'sarvam-bulbul-v3';
  for (const l of lines) {
    let f = ['.wav', '.mp3'].map((e) => path.join(dir, l.id + e)).find((q) => fs.existsSync(q)) || path.join(dir, l.id + '.mp3');
    if (!fs.existsSync(f)) {
      engine = 'mixed';
      f = path.join(out, '.vo-ph', l.id + '.wav');
      if (!fs.existsSync(f)) execFileSync('espeak-ng', ['-v', (l.who === 'arjun' ? 'hi' : 'mr') + (l.who === 'aaji' ? '+f3' : '+m3'), '-s', '150', '-w', f, l.text]);
    }
    let a = Voice.decode(f);
    let i0 = 0, i1 = a.length - 1;
    while (i0 < a.length && Math.abs(a[i0]) < 0.012) i0++;
    while (i1 > i0 && Math.abs(a[i1]) < 0.012) i1--;
    a = a.slice(Math.max(0, i0 - 0.02 * SR), Math.min(a.length, i1 + 0.06 * SR));
    let s2 = 0, c = 0; for (const x of a) if (Math.abs(x) > 0.01) { s2 += x * x; c++; }
    const g = c ? Math.min(6, 0.12 / Math.sqrt(s2 / c)) : 0;
    const dur = a.length / SR;
    vbus.addMono(a.map((x) => x * g), l.at, 1);
    const ws = l.display.split(/\s+/).filter(Boolean), tot = ws.reduce((q, w) => q + w.length, 0);
    let acc = 0; const words = ws.map((w) => { const t0 = l.at + (acc / tot) * dur; acc += w.length; return { w, t: +t0.toFixed(3), end: +(l.at + (acc / tot) * dur).toFixed(3) }; });
    placed.push({ t: +l.at.toFixed(3), end: +(l.at + dur).toFixed(3), text: l.text, display: l.display, alt: l.alt, who: l.who, id: l.id, words });
  }
  const json = { engine, lines: placed, mouth: Voice.mouthTrack(vbus, 30) };
  fs.writeFileSync(path.join(out, 'voice.json'), JSON.stringify(json));
  return { bus: vbus, engine, lines: placed };
}
const vo = placeVoices(sc.vo);

// ---------- mix ----------
const room = reverb(verb, { room: 0.7, damp: 0.4 });
const music = [drums, tasha, bass, pad, keys, brass, heart, amb];
MIX.duck(music, vo.bus, { depth: 0.5 });
const stems = { drums, tasha, bass, pad, keys, brass, heart, amb, fx, voice: vo.bus, verb: room };
const GAIN = { drums: 1.0, tasha: 2.6, bass: 0.75, pad: 0.9, keys: 1, brass: 2.2, heart: 2.2, amb: 1.4, fx: 1, voice: 2.2, verb: 0.5 };
const mix = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? path.join(__dirname, 'out') : null });
MIX.highpass(mix, 28);
MIX.fadeOut(mix, DURATION - 0.6, DURATION);
const res = MIX.master(mix, 0.8, undefined, { lufs: process.env.LUFS ? +process.env.LUFS : -14 });
MIX.writeWav(path.join(__dirname, 'out', 'music.wav'), mix);
console.log(`out/music.wav  ${DURATION.toFixed(1)}s  ${res.lufs.toFixed(1)} LUFS  voice: ${vo.engine} (${vo.lines.length} lines)`);
