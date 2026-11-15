// THE SONG for EP03: every sound comes from an event in score.js.   node song.js   (STEMS=1 writes stems)
// A tense ticking build to the start, an auto-horn GO, a driving race groove (minor, dholak + 808), honks in
// the jam, a hydraulic bus hiss, a tyre screech into a wedding baraat (dhol + shehnai), a calm lofi glide for
// the cycle, a brass fanfare at the ribbon, a sad trombone "bwomp", the stamp, then a nostalgic music box.
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
const rng = U.mulberry32(33);
const horn = (t, n = 'A4', g = 0.12, len = 0.35) => { const { L, R } = I.brassNote(m(n), BEAT * len, { stab: true, bright: 1.7, seed: Math.round(t * 10) }); brass.addStereo(L, R, t, g); };

// ---------- HOOK: four panels slam ----------
fx.addMono(I.thud(70, 0.16), ev.hook, 1); fx.addMono(I.crash(2), ev.hook, 0.3); fx.addMono(I.subBoom(0.8, 80, 36), ev.hook, 0.35);
for (let k = 0; k < 7; k++) fx.addMono(I.woodTick(k % 2 ? 1.25 : 1), T(0, 2 + k * 0.5), 0.16); // a stopwatch ticking

// ---------- intro + lineup: a light groove, the stopwatch ----------
Genre.play('desi', { clock, from: 2, to: 6, chordAt, buses: { drums, bass, pad, keys }, gain: 0.6, chords: false });
fx.addMono(I.pop(1800), ev.intro + 0.6, 0.2); // coffee slurp-pop
for (let k = 0; k < 4; k++) fx.addMono(I.boing(), ev.lineup + 0.4 + k * 0.78, 0.12); // each racer's "boing" intro
for (let b = 7; b < 9; b++) for (let k = 0; k < 4; k++) fx.addMono(I.woodTick(k % 2 ? 1.3 : 1), T(b, k), 0.2); // tension ticks
fx.addMono(I.noiseSweep(T(9, 2) - T(8), 300, 5000, { pink: true, shape: (x) => x * x }), T(8), 0.08);
for (const b of [drums, bass, pad, keys]) MIX.gate(b, T(8, 3), ev.go, 0.01);

// ---------- GO! ----------
horn(ev.go, 'A4', 0.16, 0.5); horn(ev.go + BEAT * 0.6, 'C#5', 0.16, 0.8);
fx.addMono(I.thud(60, 0.2), ev.go, 1); fx.addMono(I.crash(3), ev.go, 0.45); fx.addMono(I.subBoom(1, 70, 30), ev.go, 0.4);
Genre.play('edm', { clock, from: 10, to: 16, chordAt, buses: { drums, bass, pad, keys }, gain: 0.55 });
Genre.play('desi', { clock, from: 10, to: 16, chordAt, buses: { drums, bass, pad, keys }, gain: 0.5, chords: false, fill: [11, 13, 15] });
// the jam: a chorus of honks
for (let k = 0; k < 14; k++) horn(ev.bike + 0.4 + rng() * 3.2, ['C5', 'D5', 'F4', 'G4', 'A4'][k % 5], 0.05 + rng() * 0.04, 0.25 + rng() * 0.3);
// the bus: brakes hiss, a conductor's whistle
fx.addMono(I.noiseSweep(0.8, 6000, 2000, { pink: false }), ev.bus + 0.1, 0.08);
fx.addMono(I.whistle(0.4), ev.bus + 1.6, 0.18);
// the shortcut: a whoosh, then the SCREECH + the music stops on the brake
fx.addMono(I.noiseSweep(0.6, 500, 3000, { pink: true }), ev.shortcut + 0.2, 0.08);
for (const b of [drums, bass, pad, keys]) MIX.gate(b, ev.brake - 0.02, ev.cycle, 0.01);
fx.addMono(I.scratch(0.45), ev.brake, 0.55); fx.addMono(I.thud(80, 0.12), ev.brake, 0.8);
fx.addMono(I.noiseSweep(0.5, 3500, 2500, { q: 8 }), ev.brake, 0.12); // tyre squeal
// the baraat: dhol + shehnai for a bar
for (let k = 0; k < 8; k++) drums.addMono(I.dhol(k % 2 ? 'tilli' : 'dagga'), ev.brake + BEAT * (0.5 + k * 0.5), 0.5);
fx.addMono(I.shehnaiLine([{ t: 0, dur: BEAT, midi: m('A4') }, { t: BEAT, dur: BEAT * 0.5, midi: m('C5') }, { t: BEAT * 1.5, dur: BEAT, midi: m('B4') }, { t: BEAT * 2.5, dur: BEAT, midi: m('A4') }]), ev.brake + BEAT * 0.5, 0.12);

// ---------- the cycle: a calm lofi glide + a bicycle bell ----------
Genre.play('lofi', { clock, from: 17, to: 19, chordAt, buses: { drums, bass, pad, keys }, gain: 0.7 });
for (const k of [0, 0.25]) fx.addMono(I.bell(2400, 0.25, 1.4, 1.0), ev.cycle + 0.3 + k, 0.12);
for (const b of [drums, bass, pad, keys]) MIX.gate(b, ev.ribbon - BEAT * 0.5, ev.ribbon, 0.01);
// ---------- the RIBBON: fanfare ----------
fx.addMono(I.thud(70, 0.16), ev.ribbon, 1); drums.addMono(I.crash(3), ev.ribbon, 0.45);
for (const [k, n] of [[0, 'C4'], [0, 'E4'], [0, 'G4'], [1, 'C5'], [1.5, 'E5'], [2, 'G5']]) { const { L, R } = I.brassNote(m(n), BEAT * (k < 2 ? 0.8 : 1.6), { stab: k < 2, bright: 1.3, seed: m(n) + k }); brass.addStereo(L, R, ev.ribbon + k * BEAT, 0.1); }
for (let i = 0; i < 18; i++) amb.addMono(I.voice(m('A4') + Math.floor(rng() * 7), 0.25 + rng() * 0.25, { syl: 'e', type: 'alto', seed: 70 + i, glide: 3, breath: 0.2, shout: 1.2 }), ev.ribbon + 0.1 + rng() * 1.6, 0.05, (rng() - 0.5) * 1.4);
// collapse: the sad trombone
fx.addMono(I.bwomp(), ev.collapse + 0.2, 0.3);
Genre.play('lofi', { clock, from: 21, to: 23, chordAt, buses: { drums, bass, pad, keys }, gain: 0.45 });
for (const b of [drums, bass, pad, keys]) MIX.gate(b, ev.rule - BEAT * 0.5, T(31), 0.01);

// ---------- PUNE RULE #3: the stamp ----------
fx.addMono(I.thud(60, 0.2), ev.rule, 1); fx.addMono(I.subBoom(1.2, 70, 32), ev.rule, 0.5); drums.addMono(I.crash(3), ev.rule, 0.4);
for (const n of ['F3', 'A3', 'C4', 'F4']) { const { L, R } = I.brassNote(m(n), BEAT * 0.9, { stab: true, bright: 1.3, seed: m(n) }); brass.addStereo(L, R, ev.rule, 0.1); }
Genre.play('desi', { clock, from: 24, to: 26, chordAt, buses: { drums, bass, pad, keys }, gain: 0.6 });

// ---------- city of cycles: nostalgic heart theme + bicycle bells ----------
for (const c of sc.chords.filter((q) => q.bar >= 27 && q.bar < 31)) {
  for (const n of c.notes) { const { L, R } = I.padNote(n - 12, BEAT * 4 * 1.05, { attack: 0.5, release: 1.2, cutoff: 1300, seed: n }); heart.addStereo(L, R, T(c.bar), 0.05); }
  heart.addMono(I.epiano(c.notes[0], BEAT * 3), T(c.bar), 0.07);
  bass.addMono(I.bass(typeof c.bass === 'number' ? c.bass : m(c.bass), BEAT * 3.6, { bright: 0.15, sub: 1 }), T(c.bar), 0.22);
}
const melody = [[27, 0, 'A4'], [27, 1.5, 'C5'], [27, 2, 'F5'], [28, 0, 'E5'], [28, 2, 'C5'], [29, 0, 'D5'], [29, 1.5, 'C5'], [29, 2, 'A4'], [30, 0, 'G4']];
for (const [bar, beat, n] of melody) { heart.addMono(I.musicBox(m(n)), T(bar, beat), 0.13); verb.addMono(I.musicBox(m(n)), T(bar, beat), 0.05); }
for (let k = 0; k < 6; k++) fx.addMono(I.bell(2200 + (k % 3) * 200, 0.2, 1.4, 1.0), ev.city + 0.5 + k * 0.55 + rng() * 0.1, 0.05, (rng() - 0.5));

// ---------- METER DOWN ----------
fx.addMono(I.tvClick(), ev.meter, 0.6); fx.addMono(I.woodTick(1.8), ev.meter, 0.4);
drums.addMono(I.dholak('ghe'), ev.meter, 1); drums.addMono(I.clap({ spread: 1.2 }), ev.meter, 0.5);
for (const n of ['F4', 'A4', 'C5']) { const { L, R } = I.harmonium(m(n), 1.4, { attack: 0.01, release: 0.8, bright: 1.1, seed: m(n) }); keys.addStereo(L, R, ev.meter, 0.08); }
horn(ev.meter + BEAT, 'C5', 0.1); horn(ev.meter + BEAT * 1.5, 'C5', 0.1);

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
