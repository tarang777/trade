// PUNE DIARIES EP06 "WHY IS PUNE DRUMMING AT 9 PM?" (9:16 YouTube Short, ~54s, Marathi + Hindi).
// Arjun hears thunderous drumming every night. Bablu takes him to the practice ground of a dhol-tasha
// pathak: students, doctors, engineers... and tired IT-guy Rohan is the lead dhol, and Aaji plays the tasha.
// The performance speeds up (a tempo map: 120 -> 150 BPM) to one huge unison hit: Pune Rule #6.
// The festival is shown with respect: the comedy is Rohan's double life, never the festival or the deity.
// Every beat, hit and line is timed here; song.js and film.js both read it. All characters are fictional.
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
  const clock = makeClock({ bpm: 120, offset: 0.3, tempo: [[0, 120], [17, 120], [21, 150], [22, 116], [40, 116]] });
  const { T, BEAT } = clock;
  const DURATION = T(27) + 0.3;

  const ev = {
    hook: T(0),            // the first distant BOOM; the chai ripples
    window: T(2, 2),       // Arjun at his window, Bablu below
    ground: T(6),          // the practice ground: the whole pathak hits
    rohan: T(11, 1),       // snap zoom: Rohan on the lead dhol
    aaji: T(14),           // Aaji's tasha roll lands
    climax: T(17),         // the performance: faster and faster
    unison: T(21),         // one huge unison hit = PUNE RULE #6
    jam: T(23),            // Arjun gets the sticks
    morya: T(25, 2),       // Ganpati Bappa Morya
    meter: T(26, 1), end: T(26, 1),
  };
  const S = {
    hook: [0, ev.window], window: [ev.window, ev.ground], ground: [ev.ground, ev.rohan], rohan: [ev.rohan, ev.aaji], aaji: [ev.aaji, ev.climax],
    climax: [ev.climax, ev.unison], rule: [ev.unison, ev.jam], jam: [ev.jam, ev.meter], end: [ev.meter, DURATION],
  };
  // the drumming: which bars play, and how full. 0 = distant thumps, 1 = practice groove, 2 = full pathak
  const DRUMS = [[0, 2, 0], [2, 6, 0], [6, 11, 1], [11, 17, 1], [17, 21, 2], [22, 26, 1]];

  const { chords, chordAt } = makeChords(clock, {
    D: { notes: ['D4', 'F#4', 'A4'], bass: 'D2' }, G: { notes: ['D4', 'G4', 'B4'], bass: 'G1' }, A: { notes: ['C#4', 'E4', 'A4'], bass: 'A1' },
    Bm: { notes: ['D4', 'F#4', 'B4'], bass: 'B1' },
  }, (() => { const p = []; const loop = ['D', 'G', 'A', 'D']; for (let b = 0; b < 28; b++) p.push([b, 0, 4, loop[b % 4]]); return p; })());

  // the voiceover (Sarvam Bulbul v3 takes in vo/<id>.wav): Bablu = shubh, Arjun = advait (Hindi),
  // Rohan = varun, Aaji = neha. display = caption, alt = English subtitle.
  const L = (id, at, who, text, alt) => ({ id, at, who, text, display: text, alt });
  const vo = [
    L('v01', T(0, 2), 'bablu', "रात्री नऊ वाजता… दोनशे लोक ढोल का वाजवतायत? चला, बघूया!", "Why are two hundred people drumming at 9 pm? Let's go see!"),
    L('v02', T(2, 3), 'arjun', "बबलू, रोज रात को धम धम धम! भूकंप है क्या?", "Bablu, every night: boom, boom, boom! Is it an earthquake?"),
    L('v03', T(4, 2), 'bablu', "भूकंप नाही रे! आवाजाच्या दिशेने चल.", "Not an earthquake! Follow the sound."),
    L('v04', T(6, 1), 'bablu', "गणेशोत्सवाच्या आधी, महिनोन्महिने, पुण्याची ढोल-ताशा पथकं सराव करतात.", "For months before Ganeshotsav, Pune's dhol-tasha troupes practise."),
    L('v05', T(8, 3), 'bablu', "विद्यार्थी, डॉक्टर, इंजिनिअर… सगळे एकत्र!", "Students, doctors, engineers… all together!"),
    L('v06', T(10, 1), 'arjun', "रुको… वो रोहन है?!", "Wait… is that ROHAN?!"),
    L('v07', T(11, 2), 'rohan', "नऊ ते सहा मी बग्स फिक्स करतो. सात ते दहा? हेच माझं खरं काम!", "Nine to six, I fix bugs. Seven to ten? THIS is my real job!"),
    L('v08', T(14, 1), 'aaji', "आणि मी? तुझ्या लॅपटॉपच्या आधीपासून ताशा वाजवतेय!", "And me? I've been playing the tasha since before your laptop existed!"),
    L('v09', T(21, 1), 'bablu', "पुण्याचा नियम नंबर सहा. गणपतीच्या आधी, पुणं आपला ठेका शोधतं!", "Pune Rule #6: before Ganpati, Pune finds its rhythm!"),
    L('v10', T(23, 1.5), 'arjun', "क्या… मैं भी बजा सकता हूँ?", "Can… I play too?"),
    L('v11', T(24, 0), 'rohan', "सराव. रोज सात वाजता. उशीर नको!", "Practice. Every day at seven. Don't be late!"),
    L('v12', T(25, 2), 'bablu', "गणपती बाप्पा मोरया!", "Ganpati Bappa Morya!"),
  ];
  const pops = [];
  const markers = {
    hook: { t: ev.hook, sync: 'av' },
    ground: { t: ev.ground, sync: 'av' },
    rohan: { t: ev.rohan, sync: 'av' },
    aaji: { t: ev.aaji, sync: 'av' },
    unison: { t: ev.unison, sync: 'av' },
    meter: { t: ev.meter, sync: 'av' },
    climax: ev.climax, jam: ev.jam, morya: ev.morya,
  };

  const SCORE = { STYLE, FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, S, m, chords, chordAt, ev, vo, DRUMS, pops, markers };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
