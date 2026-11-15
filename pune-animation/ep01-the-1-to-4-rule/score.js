// PUNE DIARIES EP01 "THE 1-TO-4 RULE" (9:16 YouTube Short, ~58s).
// Bablu the auto-rickshaw drives new-in-town Arjun (phone at 2%) to three shops at 1:05 pm.
// Every shutter slams as they arrive (comic escalation, each slam bigger). Pune Rule #1 is stamped.
// A record scratch, then Aaji lowers a charger in a basket from her wada balcony. Shutters reopen at 4.
// Every voice line, slam, stamp and shutter is timed here; song.js and film.js both read it.
// All characters are fictional.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const { m, makeClock, makeChords } = MU;

  const FPS = 30;
  const FORMAT = '9:16';
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const clock = makeClock({ bpm: 128, offset: 0.3 });
  const { T, BEAT } = clock;
  const DURATION = T(31) + 0.4;

  const ev = {
    hook: T(0),            // the first shutter slams on camera
    lane: T(2),            // Bablu in the Peth lane
    arjun: T(4),           // Arjun, phone at 2%
    clock: T(7),           // 1:05 pm
    uhoh: T(8, 2.5),         // dun-dun
    shop1Go: T(9), slam1: T(10),
    shop2Go: T(10, 2), slam2: T(11, 2),
    shop3Go: T(12), slam3: T(13),   // the biggest: Pinya falls off the canopy
    empty: T(13, 2),       // the empty lane at noon
    rule: T(17),           // PUNE RULE #1 stamp
    scratch: T(19, 3),     // record scratch: who's that?
    aaji: T(20),           // Aaji at her balcony
    basket: T(22),         // the basket starts down
    catch: T(24),          // Arjun catches it: the heart begins
    golden: T(25),         // golden wide, shutters reopen
    meter: T(29, 2),       // METER DOWN: the click + sting
    end: T(29, 2),
  };
  // the shutters that roll up at 4 pm, one per beat
  const reopen = [0, 1, 2, 3, 4].map((k) => T(26, k));
  const slams = [ev.hook, ev.slam1, ev.slam2, ev.slam3];

  const S = {
    hook: [0, ev.lane], lane: [ev.lane, ev.arjun], arjun: [ev.arjun, ev.clock], clock: [ev.clock, ev.shop1Go],
    shops: [ev.shop1Go, ev.empty], empty: [ev.empty, ev.rule], rule: [ev.rule, ev.aaji], aaji: [ev.aaji, ev.golden],
    golden: [ev.golden, ev.meter], end: [ev.meter, DURATION],
  };

  const { chords, chordAt } = makeChords(clock, {
    F: { notes: ['F4', 'A4', 'C5'], bass: 'F2' }, C: { notes: ['E4', 'G4', 'C5'], bass: 'C2' },
    Dm: { notes: ['D4', 'F4', 'A4'], bass: 'D2' }, Bb: { notes: ['D4', 'F4', 'Bb4'], bass: 'Bb1' },
    Gm: { notes: ['D4', 'G4', 'Bb4'], bass: 'G2' }, A: { notes: ['C#4', 'E4', 'A4'], bass: 'A1' },
  }, (() => {
    const prog = [];
    const loop = ['F', 'C', 'Dm', 'Bb'];
    for (let b = 2; b < 19; b++) prog.push([b, 0, 4, loop[(b - 2) % 4]]);
    // the heart: slower-feeling, held chords
    const heart = ['Bb', 'F', 'Gm', 'C', 'Bb', 'F'];
    for (let b = 24; b < 30; b++) prog.push([b, 0, 4, heart[b - 24]]);
    prog.push([30, 0, 4, 'F']);
    return prog;
  })());

  // the voiceover. espeak-ng voices: Bablu en-us (male), Arjun en-gb, Aaji Marathi (mr) + English (female variant).
  const B = { who: 'bablu', voice: 'en-us+m3', rate: 168 };
  const A = { who: 'arjun', voice: 'en-gb+m1', rate: 170 };
  const AJ = { who: 'aaji', voice: 'en-us+f3', rate: 150 };
  const vo = [
    { at: T(0, 1.5), text: 'In Pune, even the shutters take a nap.', ...B },
    { at: T(2, 0.5), text: 'Kay re! Bablu here.', display: 'Kay re! Bablu here.', ...B },
    { at: T(3, 0.5), text: 'Meet Arjun. First day in Pune.', ...B },
    { at: T(4, 1.5), text: 'Phone at two percent.', display: 'Phone at 2%.', ...B },
    { at: T(5, 1), text: 'Bhaiya, any electronics shop. Fast, please!', ...A },
    { at: T(7, 0), text: 'Time? One oh five P M.', display: 'Time? 1:05 PM.', ...B },
    { at: T(8, 0.5), text: 'Oh no.', ...B, rate: 120 },
    { at: T(9, 0.5), text: 'Shop one.', ...B },
    { at: T(10, 2.5), text: 'Shop two.', ...B },
    { at: T(12, 0.5), text: 'Shop three!', ...B },
    { at: T(13, 2.5), text: 'Is there a curfew?!', ...A },
    { at: T(14, 0.5), text: "Worse. It's lunch. Then vaam kukshi. The post-lunch nap. Sacred.", display: "Worse. It's lunch. Then vamkukshi: the post-lunch nap. Sacred.", ...B },
    { at: T(17, 1), text: "That's Pune Rule number one. Between one and four, Pune sleeps.", display: "That's Pune Rule #1: between 1 and 4, Pune sleeps.", ...B },
    { at: T(20, 0.5), text: 'बाळा, काय झालं?', display: 'Bala, kay jhala? (Child, what happened?)', who: 'aaji', voice: 'mr+f3', rate: 140 },
    { at: T(21, 1), text: 'Charger. Dying.', display: 'Charger… dying…', ...A, rate: 130 },
    { at: T(22, 1), text: 'Return it by four. And bring poha.', ...AJ },
    { at: T(25, 0.5), text: 'Pune shops close for three hours. But Pune hearts? Never.', ...B, rate: 150 },
    { at: T(27, 3), text: "Next ride, Aaji's signboards. Meter down!", display: "Next ride: Aaji's signboards. Meter down!", ...B },
  ];

  // on-screen word pops (not captions): big comic text
  const pops = [
    { t: ev.hook, text: 'CLANG!', big: 1 },
    { t: ev.slam1, text: 'SLAM!', big: 0.8 },
    { t: ev.slam2, text: 'SLAM!!', big: 1.05 },
    { t: ev.slam3, text: 'SLAM!!!', big: 1.35 },
  ];

  const markers = {
    hook: { t: ev.hook, sync: 'av' },
    slam1: { t: ev.slam1, sync: 'av' },
    slam2: { t: ev.slam2, sync: 'av' },
    slam3: { t: ev.slam3, sync: 'av' },
    rule: { t: ev.rule, sync: 'av' },
    scratch: { t: ev.scratch, sync: 'a' },
    aaji: ev.aaji,
    catch: ev.catch,
    golden: ev.golden,
    meter: { t: ev.meter, sync: 'av' },
  };

  const SCORE = { FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, S, m, chords, chordAt, ev, vo, pops, slams, reopen, markers };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
