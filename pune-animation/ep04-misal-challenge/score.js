// PUNE DIARIES EP04 "MEERA'S MISAL CHALLENGE" (9:16 YouTube Short, ~56s, Marathi + Hindi).
// Food-vlogger Meera challenges Arjun (from Kerala: "spice is nothing to me") to three levels of misal:
// medium, spicy, PUNERI with extra tarri. One bite of level three and he blasts off like a rocket.
// Pune Rule #4. Chai-stall Kaka cools him with buttermilk; Arjun rates it eleven out of ten.
// Every line, bowl, blast, stamp and sticker is timed here; song.js and film.js both read it.
// All characters and eateries are fictional; the Kerala-vs-Pune spice rivalry stays friendly.
(function () {
  const node = typeof require !== 'undefined';
  const U = node ? require('./engine/util') : globalThis.U;
  const MU = node ? require('./engine/music') : globalThis.MUSIC;
  const { m, makeClock, makeChords } = MU;

  const STYLE = 'flat';
  const FPS = 30;
  const FORMAT = '9:16';
  const [W, H] = U.formatSize(FORMAT);
  const SAFE = U.safeArea(W, H);
  const clock = makeClock({ bpm: 128, offset: 0.3 });
  const { T, BEAT } = clock;
  const DURATION = T(30) + 0.3;

  const ev = {
    hook: T(0),            // steam blasts out of Arjun's ears
    eatery: T(2),          // Meera's vlog, Arjun's boast
    peek: T(7),            // Bablu peeks in, worried
    l1: T(8),              // level 1 bowl lands
    l2: T(10, 2),          // level 2
    l3: T(13, 2),          // level 3: thunder
    bite: T(15, 2),        // the bite... silence
    blast: T(16),          // BLAST OFF
    rule: T(18, 2),        // PUNE RULE #4
    kaka: T(20, 3),        // buttermilk
    rating: T(23, 3),      // the vlog outro
    sticker: T(25),         // the 11/10 sticker
    meter: T(29), end: T(29),
  };
  const S = {
    hook: [0, ev.eatery], eatery: [ev.eatery, ev.peek], peek: [ev.peek, ev.l1], l1: [ev.l1, ev.l2], l2: [ev.l2, ev.l3], l3: [ev.l3, ev.bite],
    bite: [ev.bite, ev.blast], blast: [ev.blast, ev.rule], rule: [ev.rule, ev.kaka], kaka: [ev.kaka, ev.rating], rating: [ev.rating, ev.meter], end: [ev.meter, DURATION],
  };

  const { chords, chordAt } = makeChords(clock, {
    Dm: { notes: ['D4', 'F4', 'A4'], bass: 'D2' }, Gm: { notes: ['D4', 'G4', 'Bb4'], bass: 'G2' }, A: { notes: ['C#4', 'E4', 'A4'], bass: 'A1' },
    Bb: { notes: ['D4', 'F4', 'Bb4'], bass: 'Bb1' }, F: { notes: ['F4', 'A4', 'C5'], bass: 'F2' }, C: { notes: ['E4', 'G4', 'C5'], bass: 'C2' },
  }, (() => {
    const prog = [];
    const fun = ['Dm', 'Gm', 'A', 'Dm'];
    for (let b = 2; b < 16; b++) prog.push([b, 0, 4, fun[(b - 2) % 4]]);
    prog.push([16, 0, 4, 'A'], [17, 0, 4, 'A'], [18, 0, 4, 'F'], [19, 0, 4, 'C'], [20, 0, 4, 'F']);
    const warm = ['Bb', 'F', 'C', 'F', 'Bb', 'F', 'C', 'F'];
    for (let b = 21; b < 29; b++) prog.push([b, 0, 4, warm[b - 21]]);
    prog.push([29, 0, 4, 'F']);
    return prog;
  })());

  // the voiceover (Sarvam Bulbul v3 takes in vo/<id>.wav): Bablu = shubh, Meera = suhani, Arjun = advait
  // (Hindi), Kaka = ratan (slow, wise). display = caption, alt = English subtitle.
  const L = (id, at, who, text, alt) => ({ id, at, who, text, display: text, alt });
  const vo = [
    L('v01', T(0, 1.5), 'bablu', "ही मिसळ खाऊन एक माणूस रडला… दोनदा!", "This misal made a grown man cry… twice!"),
    L('v02', T(2, 0.5), 'meera', "हाय मित्रांनो! मी मीरा. आज अर्जुन म्हणतोय, पुण्याची मिसळ क्यूट आहे!", "Hi friends! I'm Meera. Today Arjun says Pune's misal is 'cute'!"),
    L('v03', T(5, 0), 'arjun', "मैं केरला से हूँ. तीखा मेरे लिए कुछ नहीं. लाओ!", "I'm from Kerala. Spice is nothing to me. Bring it!"),
    L('v04', T(7, 0.5), 'bablu', "अरे बाळा… नको रे.", "Oh child… please don't."),
    L('v05', T(8, 1), 'meera', "लेव्हल एक: मीडियम!", "Level one: medium!"),
    L('v06', T(9, 1), 'arjun', "हम्म… अच्छा है. बढ़िया फ्लेवर.", "Hmm… nice. Great flavour."),
    L('v07', T(10, 3), 'meera', "लेव्हल दोन: तिखट!", "Level two: spicy!"),
    L('v08', T(11, 3), 'arjun', "बिलकुल… ठीक… है. यहाँ गर्मी है क्या?", "Totally… fine. Is it hot in here?"),
    L('v09', T(13, 3), 'meera', "आणि लेव्हल तीन… पुणेरी! एक्स्ट्रा तर्री!", "And level three… PUNERI! Extra tarri!"),
    L('v10', T(18, 3), 'bablu', "पुण्याचा नियम नंबर चार. मिसळला कधीच क्यूट म्हणायचं नाही!", "Pune Rule #4: never call a misal 'cute'!"),
    L('v11', T(21, 0), 'kaka', "घे बाळा, ताक. तिखटाने जीभ जळते… ताकाने अभिमान शांत होतो.", "Here, child, buttermilk. Spice burns the tongue… buttermilk cools the pride."),
    L('v12', T(24, 0), 'arjun', "रेटिंग… दस में से ग्यारह!", "Rating… eleven out of ten!"),
    L('v13', T(25, 1), 'meera', "एकदम भारी! तुमचा फेवरेट मिसळ स्पॉट कमेंट करा!", "Awesome! Comment your favourite misal spot!"),
    L('v14', T(27, 1), 'bablu', "पुढची राइड: पुण्यातला पहिला पाऊस! मीटर डाऊन!", "Next ride: Pune's first rain! Meter down!"),
  ];
  const LEVELS = [
    { t: ev.l1, name: 'लेव्हल १ · मीडियम', gravy: '#E07A2E', heat: 0.2 },
    { t: ev.l2, name: 'लेव्हल २ · तिखट', gravy: '#C8401E', heat: 0.6 },
    { t: ev.l3, name: 'लेव्हल ३ · पुणेरी!', gravy: '#7E140E', heat: 1 },
  ];
  const pops = [
    { t: ev.blast, text: 'धडाम!!!', big: 1.3 },
  ];
  const markers = {
    hook: { t: ev.hook, sync: 'av' },
    l1: { t: ev.l1, sync: 'av' }, l2: { t: ev.l2, sync: 'av' }, l3: { t: ev.l3, sync: 'av' },
    blast: { t: ev.blast, sync: 'av' },
    rule: { t: ev.rule, sync: 'av' },
    sticker: { t: ev.sticker, sync: 'av' },
    meter: { t: ev.meter, sync: 'av' },
    kaka: ev.kaka, bite: ev.bite,
  };

  const SCORE = { STYLE, FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, S, m, chords, chordAt, ev, vo, LEVELS, pops, markers };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
