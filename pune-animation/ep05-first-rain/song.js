// THE SONG for EP05: every sound comes from an event in score.js.   node song.js   (STEMS=1 writes stems)
// One raindrop "plink", then thunder; real rain (a bed of filtered noise + droplets) from then on. Santoor-like
// plucked arpeggios and a soft lofi groove for the montage of Pune dropping everything, a laptop snap, papers,
// sizzling bhaji, a puddle splash, a string swell up the ghat, the stamp, then harmonium + music box on the fort.
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
const drums = bus(), bass = bus(), pad = bus(), keys = bus(), brass = bus(), fx = bus(), amb = bus(), heart = bus(), verb = bus();
const rng = U.mulberry32(55);

// ---------- the drop + thunder ----------
fx.addMono(I.ting(96, { gap: 0.05 }), ev.hook, 0.22); fx.addMono(I.pop(2600), ev.hook, 0.3); verb.addMono(I.ting(96), ev.hook, 0.15);
fx.addMono(I.thud(45, 0.3), ev.thunder, 1); fx.addMono(I.subBoom(3.2, 55, 24), ev.thunder, 0.8);
fx.addMono(I.noiseSweep(3.4, 900, 120, { pink: true, shape: (x) => Math.exp(-2.2 * x) * (0.6 + 0.4 * Math.sin(x * 40)) }), ev.thunder, 0.5);
// ---------- the rain: from the thunder to the end (it eases off when the sun comes out) ----------
const rainEnd = DURATION, seg = 1.0;
for (let t = ev.thunder + 0.05; t < rainEnd; t += seg * 0.5) {
  const k = t < ev.sun ? 1 : Math.max(0.25, 1 - (t - ev.sun) / 5);
  amb.addMono(I.noiseSweep(seg, 2500, 2600, { pink: true, shape: (x) => Math.sin(Math.PI * x) }), t, 0.07 * k, (rng() - 0.5) * 0.6);
}
for (let i = 0; i < 260; i++) { const t = ev.thunder + rng() * (rainEnd - ev.thunder - 0.5); const k = t < ev.sun ? 1 : 0.4; amb.addMono(I.woodTick(2 + rng() * 1.5), t, 0.025 * k, (rng() - 0.5) * 1.6); }
// indoor scenes hear the rain softer: duck the rain bed under the office/hostel/kitchen
MIX.gate(amb, ev.rohan + 0.05, ev.arjun - 0.05, 0.35);

// ---------- the montage: santoor plucks + a gentle lofi groove ----------
Genre.play('lofi', { clock, from: 2, to: 12, chordAt, buses: { drums, bass, pad, keys }, gain: 0.55 });
for (const c of sc.chords.filter((q) => q.bar >= 2 && q.bar < 12)) for (let k = 0; k < 8; k++) { const n = c.notes[k % 3] + (k >= 4 ? 12 : 0); heart.addMono(I.pluck(n, { decay: 0.35, cutoff: 4200 }), T(c.bar, k * 0.5), 0.06, (k % 2 ? 0.3 : -0.3)); }
fx.addMono(I.thud(90, 0.08), ev.shut, 0.8); fx.addMono(I.tvClick(), ev.shut, 0.5);           // the laptop snaps shut
for (let k = 0; k < 6; k++) fx.addMono(I.paperFwip(0.8 + rng() * 0.6, 60 + k), ev.toss + k * 0.09, 0.1); // notes fly
for (let i = 0; i < 40; i++) fx.addMono(I.noiseSweep(0.12, 3000 + rng() * 3000, 5000, { pink: false }), ev.aaji + 0.3 + rng() * 7.5, 0.025); // the sizzle
fx.addMono(I.whistle(0.3), ev.arjun + 0.5, 0.08);
// the splash: drums stop for a breath, then the splash
for (const b of [drums, bass, pad, keys]) MIX.gate(b, ev.splash - BEAT * 0.5, ev.ghat, 0.01);
fx.addMono(I.thud(70, 0.12), ev.splash, 0.8); fx.addMono(I.noiseSweep(0.7, 5000, 900, { pink: true, shape: (x) => Math.exp(-4 * x) }), ev.splash, 0.4);
// ---------- up the ghat: a string swell ----------
for (const c of sc.chords.filter((q) => q.bar >= 12 && q.bar < 20)) {
  for (const n of c.notes) { const { L, R } = I.strings(n, BEAT * 4 * 1.02, { attack: 0.5, release: 0.8, bright: 0.9, seed: n }); heart.addStereo(L, R, T(c.bar), 0.04); }
  bass.addMono(I.bass(typeof c.bass === 'number' ? c.bass : m(c.bass), BEAT * 3.6, { bright: 0.15, sub: 1 }), T(c.bar), 0.22);
}
for (let b = 12; b < 14; b++) for (let k = 0; k < 8; k++) heart.addMono(I.marimba(sc.chords.find((q) => q.bar === b).notes[k % 3] + 12), T(b, k * 0.5), 0.07);
// ---------- PUNE RULE #5: a softer stamp (thunder-ish) ----------
fx.addMono(I.thud(55, 0.22), ev.rule, 1); fx.addMono(I.subBoom(1.6, 60, 28), ev.rule, 0.5); drums.addMono(I.crash(2), ev.rule, 0.25);
for (const n of ['C3', 'G3', 'C4', 'E4']) { const { L, R } = I.brassNote(m(n), BEAT * 1.5, { stab: false, bright: 0.9, seed: m(n) }); brass.addStereo(L, R, ev.rule, 0.06); }
// ---------- the fort: harmonium + music box, no drums ----------
for (const c of sc.chords.filter((q) => q.bar >= 16)) { const { L, R } = I.harmonium(c.notes[0], BEAT * 3.8, { attack: 0.4, release: 0.8, bright: 0.7, seed: c.bar }); keys.addStereo(L, R, T(c.bar), 0.04); for (const n of c.notes) { const p = I.padNote(n - 12, BEAT * 4.1, { attack: 0.6, release: 1.4, cutoff: 1100, seed: n }); pad.addStereo(p.L, p.R, T(c.bar), 0.04); } }
const melody = [[16, 2, 'E5'], [17, 0, 'D5'], [17, 2, 'C5'], [18, 0, 'E5'], [18, 2, 'G5'], [19, 0, 'A5'], [19, 2, 'G5'], [20, 0, 'E5'], [20, 2, 'D5'], [21, 0, 'C5']];
for (const [bar, beat, n] of melody) { heart.addMono(I.musicBox(m(n)), T(bar, beat), 0.12); verb.addMono(I.musicBox(m(n)), T(bar, beat), 0.05); }
fx.addMono(I.bell(660, 2.2, 2.2, 1.414), ev.sun + 0.2, 0.05); // a far temple bell as the clouds part
// ---------- METER DOWN (soft) + a held chord ----------
fx.addMono(I.tvClick(), ev.meter, 0.5); fx.addMono(I.woodTick(1.8), ev.meter, 0.35);
for (const n of ['C4', 'E4', 'G4', 'C5']) { const { L, R } = I.harmonium(m(n), 3.6, { attack: 0.05, release: 1.2, bright: 0.9, seed: m(n) }); keys.addStereo(L, R, ev.meter, 0.06); }
heart.addMono(I.musicBox(m('C6')), ev.meter, 0.1);

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
const music = [drums, bass, pad, keys, brass, heart, amb];
MIX.duck(music, vo.bus, { depth: 0.5 });
const stems = { drums, bass, pad, keys, brass, heart, amb, fx, voice: vo.bus, verb: room };
const GAIN = { drums: 0.8, bass: 0.75, pad: 0.9, keys: 1, brass: 2.2, heart: 2.2, amb: 1.4, fx: 1, voice: 2.0, verb: 0.5 };
const mix = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? path.join(__dirname, 'out') : null });
MIX.highpass(mix, 28);
MIX.fadeOut(mix, DURATION - 0.6, DURATION);
const res = MIX.master(mix, 0.8, undefined, { lufs: process.env.LUFS ? +process.env.LUFS : -14 });
MIX.writeWav(path.join(__dirname, 'out', 'music.wav'), mix);
console.log(`out/music.wav  ${DURATION.toFixed(1)}s  ${res.lufs.toFixed(1)} LUFS  voice: ${vo.engine} (${vo.lines.length} lines)`);
