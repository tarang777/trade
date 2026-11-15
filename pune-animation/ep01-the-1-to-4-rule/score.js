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

  // the voiceover: Marathi (Bablu, Aaji) and Hindi (Arjun, the outsider). Each line has an id; song.js uses
  // the ElevenLabs take in vo/<id>.mp3 when it exists (espeak-ng placeholder otherwise). `say` is what the
  // TTS model reads (with eleven_v4 audio tags), `display` the Devanagari caption, `alt` the English subtitle.
  // voices (ElevenLabs library): Bablu = Samay (Marathi creator), Aaji = Damini (mature Marathi, elderly
  // direction), Arjun = Yatin (playful Hindi).
  const VOICES = { bablu: '0tQTGVmSXHGJRH75pubS', aaji: 'hDVWw6CgSn8NdOAeyAnt', arjun: '7M0JpWdLkoBBL8M1moPi' };
  const L = (id, at, who, say, alt) => ({ id, at, who, say, text: say.replace(/\[[^\]]*\]\s*/g, ''), display: say.replace(/\[[^\]]*\]\s*/g, ''), alt });
  const vo = [
    L('v01', T(0, 1.5), 'bablu', '[mischievously] पुण्यात ना… दुकानांची शटरं सुद्धा झोप काढतात!', 'In Pune, even shop shutters take a nap!'),
    L('v02', T(2, 0.5), 'bablu', '[excited] काय रे! मी बबलू — पुण्याची रिक्षा!', "Hey! I'm Bablu, Pune's own auto!"),
    L('v03', T(3, 0.5), 'bablu', 'हा अर्जुन. पुण्यात पहिलाच दिवस.', 'This is Arjun. First day in Pune.'),
    L('v04', T(4, 1.5), 'bablu', '[dramatically] आणि फोन… दोन टक्के!', 'And his phone… 2%!'),
    L('v05', T(5, 1), 'arjun', '[nervous] भैया, कोई भी मोबाइल की दुकान… जल्दी चलो!', 'Bhaiya, any mobile shop… hurry!'),
    L('v06', T(7, 0), 'bablu', 'वेळ? दुपारचा एक वाजून पाच मिनिटं…', 'Time? Five past one, afternoon…'),
    L('v07', T(8, 0.5), 'bablu', '[worried] अरे देवा.', 'Oh no.'),
    L('v08', T(9, 0.5), 'bablu', 'पहिलं दुकान…', 'Shop one…'),
    L('v09', T(10, 2.5), 'bablu', 'दुसरं…', 'Two…'),
    L('v10', T(12, 0.5), 'bablu', '[shouting] तिसरं!', 'THREE!'),
    L('v11', T(13, 2.5), 'arjun', '[surprised] ये क्या है? कर्फ्यू लगा है क्या?!', 'What is this? A curfew?!'),
    L('v12', T(14, 0.5), 'bablu', '[laughs] कर्फ्यू नाही रे! आधी जेवण… आणि मग वामकुक्षी. पवित्र झोप!', 'No curfew! First lunch… then vamkukshi. The sacred nap!'),
    L('v13', T(17, 1), 'bablu', '[dramatically] पुण्याचा नियम नंबर एक — एक ते चार, पुणं झोपतं!', 'Pune Rule #1: from 1 to 4, Pune sleeps!'),
    L('v14', T(20, 0.5), 'aaji', '[elderly voice] बाळा, काय झालं रे?', 'Child, what happened?'),
    L('v15', T(21, 1), 'arjun', '[tired] आजी… फोन… मर रहा है…', 'Aaji… my phone… is dying…'),
    L('v16', T(22, 1), 'aaji', '[elderly voice] [warmly] हा घे चार्जर. चार वाजता परत कर… आणि येताना पोहे घेऊन ये!', "Here's a charger. Return it by four… and bring poha!"),
    L('v17', T(25, 0.5), 'bablu', '[warmly] पुण्यातली दुकानं तीन तास बंद असतात… पण पुणेकरांची मनं? कधीच नाही.', "Pune's shops close for three hours… but Pune's hearts? Never."),
    L('v18', T(27, 3), 'bablu', '[excited] पुढची राइड — आजीच्या पुणेरी पाट्या! मीटर डाऊन!', "Next ride: Aaji's Puneri signboards! Meter down!"),
  ];

  // on-screen word pops (not captions): big comic text
  const pops = [
    { t: ev.hook, text: 'खडाड!', big: 1 },
    { t: ev.slam1, text: 'धाड!', big: 0.8 },
    { t: ev.slam2, text: 'धाड!!', big: 1.05 },
    { t: ev.slam3, text: 'धडाम!!!', big: 1.3 },
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

  const STYLE = 'flat';
  const SCORE = { STYLE, VOICES, FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, S, m, chords, chordAt, ev, vo, pops, slams, reopen, markers };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
