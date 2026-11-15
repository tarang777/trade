// THE SONG for EP01: every sound comes from an event in score.js.   node song.js   (STEMS=1 writes stems)
// A bouncy desi dholak groove for the ride, a ticking clock at 1:05, three shutter SLAMS (each bigger),
// crickets in the empty noon lane, a brass stamp on Pune Rule #1, a record scratch, then a soft
// harmonium for Aaji and a music-box heart theme. The reopening shutters play a rising arpeggio.
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
const rng = U.mulberry32(11);

// ---------- a metal shutter: a rattle on the way down (ends an 8th early), then the CLANG ----------
function shutter(t, size) {
  const roll = 0.32 + 0.1 * size;
  for (let i = 0; i < 9; i++) fx.addMono(I.woodTick(1.6 + rng() * 0.6), t - roll + i * (roll - BEAT / 2) / 9, 0.06 * size, (rng() - 0.5) * 0.6);
  fx.addMono(I.thud(70, 0.16), t, 0.9 * size);
  fx.addMono(I.tom(95, 0.3), t, 0.55 * size);
  fx.addMono(I.crash(2 + size), t, 0.28 * size);
  fx.addMono(I.bell(180 + 30 * size, 0.5, 4.5, 2.76), t, 0.22 * size, 0.2); // the metallic ring
  fx.addMono(I.subBoom(0.6 + 0.4 * size, 80, 36), t, 0.3 * size);
  verb.addMono(I.bell(180, 0.5, 4.5, 2.76), t, 0.12 * size);
}

// ---------- HOOK: the first slam out of silence ----------
shutter(ev.hook, 1.1);

// ---------- the ride: a light groove, then full ----------
Genre.play('desi', { clock, from: 2, to: 4, chordAt, buses: { drums, bass, pad, keys }, gain: 0.6, chords: false });
Genre.play('desi', { clock, from: 4, to: 7, chordAt, buses: { drums, bass, pad, keys }, gain: 0.85, fill: [6] });
// an auto horn: two quick toots as Bablu's intro
for (const k of [0, 0.5]) { const { L, R } = I.brassNote(m('A4'), BEAT * 0.35, { stab: true, bright: 1.6, seed: 3 + k }); brass.addStereo(L, R, T(2, k), 0.12); }
// low battery beeps on Arjun's phone
for (const k of [0, 0.5]) fx.addMono(I.bell(1760, 0.08, 0.6, 1), T(4, 2 + k), 0.12);

// ---------- 1:05 PM: the clock ticks, then dun-dun ----------
for (let b = 0; b < 6; b++) fx.addMono(I.woodTick(b % 2 ? 1.25 : 1), T(7, b), 0.22, b % 2 ? 0.3 : -0.3);
fx.addMono(I.timpani(m('D2')), ev.uhoh, 0.7);
fx.addMono(I.timpani(m('C#2')), ev.uhoh + BEAT, 0.8);

// ---------- the three shops: faster groove, slams on the downbeats ----------
Genre.play('desi', { clock, from: 9, to: 13, chordAt, buses: { drums, bass, pad, keys }, gain: 1, fill: [12] });
fx.addMono(I.noiseSweep(0.5, 400, 3000, { pink: true }), ev.shop1Go, 0.08); // engine revving off
shutter(ev.slam1, 0.8);
shutter(ev.slam2, 1.05);
shutter(ev.slam3, 1.4);
fx.addMono(I.boing(), ev.slam3 + BEAT, 0.3); // Pinya bounces off the canopy
fx.addMono(I.paperFwip(1.4), ev.slam3 + BEAT * 1.5, 0.25);
// the groove cuts right at each slam for a beat (silence is the joke)
for (const s of [ev.slam1, ev.slam2]) for (const b of [drums, bass, pad, keys]) MIX.gate(b, s + 0.03, s + BEAT * 0.9, 0.01);

// ---------- the empty lane: crickets, a snoring dog, a lazy pizz bass ----------
for (let i = 0; i < 40; i++) amb.addMono(I.ting(98 + Math.floor(rng() * 3), { gap: 0.05, seed: i }), ev.empty + 0.2 + i * 0.22 + rng() * 0.06, 0.05, (rng() - 0.5) * 1.2);
for (let k = 0; k < 3; k++) amb.addMono(I.noiseSweep(0.9, 120, 380, { pink: true }), ev.empty + 1.5 + k * 2.4, 0.18); // the snore
for (let b = 14; b < 17; b++) for (const [beat, n] of [[0, 'F2'], [2, 'C3'], [3, 'A2']]) bass.addMono(I.pizz(m(n)), T(b, beat), 0.35);

// ---------- PUNE RULE #1: the stamp ----------
fx.addMono(I.thud(60, 0.2), ev.rule, 1);
fx.addMono(I.subBoom(1.2, 70, 32), ev.rule, 0.5);
drums.addMono(I.crash(3), ev.rule, 0.4);
for (const n of ['F3', 'A3', 'C4', 'F4']) { const { L, R } = I.brassNote(m(n), BEAT * 0.9, { stab: true, bright: 1.3, seed: m(n) }); brass.addStereo(L, R, ev.rule, 0.1); }
Genre.play('desi', { clock, from: 17, to: 19, chordAt, buses: { drums, bass, pad, keys }, gain: 0.9, fill: [18] });
// a quick groove tail through the first beats of bar 19, ended an 8th before the scratch
Genre.play('desi', { clock, from: 19, to: 20, chordAt, buses: { drums, bass, pad, keys }, gain: 0.8 });
for (const b of [drums, bass, pad, keys]) MIX.gate(b, ev.scratch - BEAT / 2, T(31), 0.01);

// ---------- the scratch, then Aaji ----------
fx.addMono(I.scratch(0.34), ev.scratch, 0.5);
for (let k = 0; k < 5; k++) amb.addMono(I.ting(91 + k * 2, { gap: 0.09, seed: 40 + k }), ev.aaji + 0.1 + k * 0.13, 0.07, (k - 2) * 0.3); // wind chime
for (const [n, dur] of [['F3', 4], ['C4', 4]]) { const { L, R } = I.harmonium(m(n), T(24) - T(20, 2), { attack: 0.6, release: 0.8, bright: 0.8, seed: m(n) }); keys.addStereo(L, R, T(20, 2), 0.05); }
fx.addMono(I.bwomp(), T(21, 1), 0.18); // Arjun's dying "charger…"
// the basket on its rope: little creaks
for (let k = 0; k < 6; k++) fx.addMono(I.woodTick(0.7 + (k % 2) * 0.15), ev.basket + k * BEAT * 0.66, 0.08, 0.2);
fx.addMono(I.pop(1400), ev.catch, 0.3);

// ---------- the heart: pad, e-piano, a music-box melody; the shutters play the arpeggio ----------
for (const c of sc.chords.filter((q) => q.bar >= 24)) {
  for (const n of c.notes) { const { L, R } = I.padNote(n - 12, BEAT * 4 * 1.05, { attack: 0.5, release: 1.2, cutoff: 1300, seed: n }); heart.addStereo(L, R, T(c.bar), 0.05); }
  heart.addMono(I.epiano(c.notes[0], BEAT * 3), T(c.bar), 0.08);
  bass.addMono(I.bass(typeof c.bass === 'number' ? c.bass : m(c.bass || 'F2'), BEAT * 3.6, { bright: 0.15, sub: 1 }), T(c.bar), 0.25);
}
const melody = [[24, 0, 'D5'], [24, 1.5, 'C5'], [24, 2, 'Bb4'], [25, 0, 'C5'], [25, 2, 'A4'], [27, 0, 'G4'], [27, 1.5, 'A4'], [27, 2, 'C5'], [28, 0, 'D5'], [28, 2, 'C5'], [29, 0, 'A4']];
for (const [bar, beat, n] of melody) { heart.addMono(I.musicBox(m(n)), T(bar, beat), 0.14); verb.addMono(I.musicBox(m(n)), T(bar, beat), 0.05); }
// the five reopening shutters: a rising marimba arpeggio, one per beat (F A C F A)
['F4', 'A4', 'C5', 'F5', 'A5'].forEach((n, k) => { fx.addMono(I.marimba(m(n)), sc.reopen[k], 0.22, (k - 2) * 0.25); fx.addMono(I.woodTick(1.5), sc.reopen[k], 0.05); });

// ---------- METER DOWN: click + the series sting ----------
fx.addMono(I.tvClick(), ev.meter, 0.6);
fx.addMono(I.woodTick(1.8), ev.meter, 0.4);
drums.addMono(I.dholak('ghe'), ev.meter, 1);
drums.addMono(I.clap({ spread: 1.2 }), ev.meter, 0.5);
for (const n of ['F4', 'A4', 'C5']) { const { L, R } = I.harmonium(m(n), 1.6, { attack: 0.01, release: 0.9, bright: 1.1, seed: m(n) }); keys.addStereo(L, R, ev.meter, 0.08); }
for (const k of [0, 0.5]) { const { L, R } = I.brassNote(m('C5'), BEAT * 0.35, { stab: true, bright: 1.6, seed: 9 + k }); brass.addStereo(L, R, ev.meter + BEAT * (1 + k), 0.1); } // toot-toot

// ---------- the voiceover ----------
const vo = Voice.speak(sc.vo, { out: path.join(__dirname, 'out'), length: DURATION });

// ---------- mix ----------
const room = reverb(verb, { room: 0.7, damp: 0.4 });
const music = [drums, bass, pad, keys, brass, heart, amb];
MIX.duck(music, vo.bus, { depth: 0.5 });
const stems = { drums, bass, pad, keys, brass, heart, amb, fx, voice: vo.bus, verb: room };
const GAIN = { drums: 0.85, bass: 0.75, pad: 0.9, keys: 1, brass: 2.2, heart: 2.2, amb: 1.4, fx: 1, voice: 2.0, verb: 0.5 };
const mix = MIX.mixdown(stems, GAIN, { stemDir: process.env.STEMS ? path.join(__dirname, 'out') : null });
MIX.highpass(mix, 28);
MIX.fadeOut(mix, DURATION - 0.6, DURATION);
const res = MIX.master(mix, 0.8, undefined, { lufs: process.env.LUFS ? +process.env.LUFS : -14 });
MIX.writeWav(path.join(__dirname, 'out', 'music.wav'), mix);
console.log(`out/music.wav  ${DURATION.toFixed(1)}s  ${res.lufs.toFixed(1)} LUFS  voice: ${vo.engine} (${vo.lines.length} lines)`);
