// PUNE DIARIES EP03 "THE GREAT HINJEWADI RACE" (9:16 YouTube Short, ~59s, Marathi).
// Rohan has a 10 am meeting in Hinjewadi; it's 8:30. Four Rohans race 18 km: in Bablu, on a bike, on a bus,
// on a cycle. The bike drowns in traffic, the bus swallows him, Bablu's shortcut hits a wedding procession,
// and the cycle glides through to win at 9:58. Pune Rule #3: distance is measured in hours.
// Every voice line, slam, horn, brake and ribbon is timed here; song.js and film.js both read it.
// All characters are fictional; no real metro/route claims are made.
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
  const DURATION = T(31, 1) + 0.3;

  const ev = {
    hook: T(0),            // four panels slam in
    intro: T(2, 1),        // Rohan, coffee, 8:30
    lineup: T(6, 3),       // the four racers
    go: T(9, 2),           // the flag drops: GO
    bike: T(10),           // the bike into the jam
    bus: T(12),            // squeezed in the bus
    shortcut: T(14, 2),    // Bablu's shortcut...
    brake: T(16, 1),       // ...a wedding procession: brakes!
    cycle: T(17),          // the cycle glides through
    finish: T(19),         // the IT park gate
    ribbon: T(19, 2),      // the ribbon snaps: 9:58
    collapse: T(21),       // Rohan flat on the lawn
    rule: T(23, 2),        // PUNE RULE #3
    city: T(26, 2),        // "city of cycles"
    meter: T(30), end: T(30),
  };
  const S = {
    hook: [0, ev.intro], intro: [ev.intro, ev.lineup], lineup: [ev.lineup, ev.bike], bike: [ev.bike, ev.bus], bus: [ev.bus, ev.shortcut],
    shortcut: [ev.shortcut, ev.cycle], cycle: [ev.cycle, ev.finish], finish: [ev.finish, ev.collapse], collapse: [ev.collapse, ev.rule],
    rule: [ev.rule, ev.city], city: [ev.city, ev.meter], end: [ev.meter, DURATION],
  };

  const { chords, chordAt } = makeChords(clock, {
    Am: { notes: ['A3', 'C4', 'E4'], bass: 'A1' }, F: { notes: ['F3', 'A3', 'C4'], bass: 'F1' }, G: { notes: ['G3', 'B3', 'D4'], bass: 'G1' },
    E: { notes: ['G#3', 'B3', 'E4'], bass: 'E1' }, C: { notes: ['E4', 'G4', 'C5'], bass: 'C2' }, Dm: { notes: ['D4', 'F4', 'A4'], bass: 'D2' },
    Bb: { notes: ['D4', 'F4', 'Bb4'], bass: 'Bb1' },
  }, (() => {
    const prog = [];
    const tense = ['Am', 'F', 'G', 'E'];
    for (let b = 2; b < 17; b++) prog.push([b, 0, 4, tense[(b - 2) % 4]]);
    const calm = ['C', 'G', 'Am', 'F', 'C', 'G'];
    for (let b = 17; b < 23; b++) prog.push([b, 0, 4, calm[b - 17]]);
    prog.push([23, 0, 4, 'F'], [24, 0, 4, 'C'], [25, 0, 4, 'G'], [26, 0, 4, 'C']);
    const heart = ['F', 'C', 'Dm', 'Bb', 'C'];
    for (let b = 27; b < 32; b++) prog.push([b, 0, 4, heart[b - 27]]);
    return prog;
  })());

  // the voiceover (Sarvam Bulbul v3 takes in vo/<id>.wav): Bablu = shubh, Rohan = varun (tired, deeper).
  const L = (id, at, who, text, alt) => ({ id, at, who, text, display: text, alt });
  const vo = [
    L('v01', T(0, 1), 'bablu', "अठरा किलोमीटर. चार गाड्या. हिंजवडी आधी कोण गाठणार?", "18 km. Four vehicles. Who reaches Hinjewadi first?"),
    L('v02', T(2, 2), 'bablu', "हा रोहन. दहा वाजता मीटिंग. आत्ता वाजलेत साडेआठ.", "This is Rohan. Meeting at ten. It's 8:30 now."),
    L('v03', T(4, 2), 'rohan', "आरामात पोहोचेन रे. फक्त अठरा किलोमीटर तर आहे!", "I'll make it easily. It's only 18 km!"),
    L('v04', T(7, 0), 'bablu', "रेसर एक: मी! दोन: बाईक. तीन: बस. आणि चार… सायकल!", "Racer one: me! Two: bike. Three: bus. And four… a cycle!"),
    L('v05', T(9, 0), 'bablu', "रेडी… चला!", "Ready… GO!"),
    L('v06', T(10, 1), 'bablu', "बाईक सुसाट निघाली… आणि थेट ट्रॅफिकच्या समुद्रात!", "The bike zooms off… straight into a sea of traffic!"),
    L('v07', T(12, 0.5), 'bablu', "बसमध्ये एवढी गर्दी… रोहन दरवाजाचाच भाग झालाय.", "The bus is so packed… Rohan is now part of the door."),
    L('v08', T(13, 2), 'rohan', "कोणीतरी… मला श्वास घेऊ द्या!", "Someone… let me breathe!"),
    L('v09', T(14, 3), 'bablu', "आणि मी? माझा खास शॉर्टकट… अरे! वरात!", "And me? My special shortcut… oh no! A wedding procession!"),
    L('v10', T(17, 1), 'bablu', "आणि इकडे… सायकल. शांतपणे. सगळ्यांच्या मधून.", "And meanwhile… the cycle. Calmly. Through everyone."),
    L('v11', T(19, 3), 'bablu', "नऊ अठ्ठावन्न! सायकल जिंकली!", "9:58! The cycle wins!"),
    L('v12', T(21, 0.5), 'rohan', "पोहोचलो… पण आता मला अंघोळ हवी. आणि नवीन आयुष्य.", "Made it… but now I need a bath. And a new life."),
    L('v13', T(23, 3), 'bablu', "पुण्याचा नियम नंबर तीन. इथे अंतर किलोमीटरमध्ये नाही, तासांमध्ये मोजतात!", "Pune Rule #3: here, distance is measured in hours, not kilometres!"),
    L('v14', T(26, 3), 'bablu', "पुणं एके काळी सायकलींचं शहर होतं… पुन्हा होईल?", "Pune was once the city of cycles… will it be again?"),
    L('v15', T(28, 1), 'bablu', "पुढची राइड: मीराचं मिसळ चॅलेंज! मीटर डाऊन!", "Next ride: Meera's misal challenge! Meter down!"),
  ];

  const pops = [
    { t: ev.go, text: 'चला!!', big: 1.1 },
    { t: ev.brake, text: 'कच्चकन!', big: 1.0 },
  ];
  const markers = {
    hook: { t: ev.hook, sync: 'av' },
    go: { t: ev.go, sync: 'av' },
    brake: { t: ev.brake, sync: 'av' },
    ribbon: { t: ev.ribbon, sync: 'av' },
    rule: { t: ev.rule, sync: 'av' },
    meter: { t: ev.meter, sync: 'av' },
    bike: ev.bike, bus: ev.bus, cycle: ev.cycle, city: ev.city,
  };

  const SCORE = { STYLE, FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, S, m, chords, chordAt, ev, vo, pops, markers };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
