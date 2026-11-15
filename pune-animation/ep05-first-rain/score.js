// PUNE DIARIES EP05 "FIRST RAIN" (9:16 YouTube Short, ~55s, Marathi + Hindi). The tender one.
// A single raindrop hits Bablu's eye; thunder. Pune drops everything: Rohan quits his meeting, Meera throws
// her notes, Aaji is already frying bhaji, and Arjun can't understand why everyone runs TOWARDS the rain.
// Everyone squeezes into Bablu: up the ghat to Sinhagad in the mist. Pune Rule #5. Bhaji and chai on the
// fort wall as the clouds part. Every line, drop, thunderclap and stamp is timed here.
// All characters are fictional.
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
  const clock = makeClock({ bpm: 100, offset: 0.3 });
  const { T, BEAT } = clock;
  const DURATION = T(23) + 0.3;

  const ev = {
    hook: T(0),            // the drop hits Bablu's eye
    thunder: T(0, 2),      // lightning + thunder; the rain begins
    rohan: T(2, 1),        // the office: laptop shut
    shut: T(4, 1),         // the laptop snaps shut
    meera: T(4, 2),        // the hostel: notes in the air
    toss: T(5, 3),         // the notes fly
    aaji: T(6, 0.5),            // the kitchen: bhaji
    arjun: T(9, 2),        // the street: everyone runs into the rain
    squeeze: T(10, 3),     // everyone into Bablu
    splash: T(12),      // through the puddle
    ghat: T(12, 2),           // the ghat road montage
    rule: T(14),           // PUNE RULE #5 on the fort wall
    fort: T(16, 1),        // bhaji + chai in the mist
    sun: T(19),            // the clouds part
    meter: T(21, 1), end: T(21, 1),
  };
  const S = {
    hook: [0, ev.rohan], rohan: [ev.rohan, ev.meera], meera: [ev.meera, ev.aaji], aaji: [ev.aaji, ev.arjun], arjun: [ev.arjun, ev.squeeze],
    squeeze: [ev.squeeze, ev.ghat], ghat: [ev.ghat, ev.rule], rule: [ev.rule, ev.fort], fort: [ev.fort, ev.meter], end: [ev.meter, DURATION],
  };

  const { chords, chordAt } = makeChords(clock, {
    Am: { notes: ['A3', 'C4', 'E4'], bass: 'A1' }, F: { notes: ['F3', 'A3', 'C4'], bass: 'F1' }, C: { notes: ['E4', 'G4', 'C5'], bass: 'C2' },
    G: { notes: ['D4', 'G4', 'B4'], bass: 'G1' }, Em: { notes: ['E4', 'G4', 'B4'], bass: 'E2' }, Dm: { notes: ['D4', 'F4', 'A4'], bass: 'D2' },
  }, (() => {
    const prog = [];
    const play = ['C', 'G', 'Am', 'F'];
    for (let b = 1; b < 12; b++) prog.push([b, 0, 4, play[(b - 1) % 4]]);
    const swell = ['F', 'G', 'Em', 'Am', 'F', 'G', 'C', 'C'];
    for (let b = 12; b < 20; b++) prog.push([b, 0, 4, swell[b - 12]]);
    prog.push([20, 0, 4, 'F'], [21, 0, 4, 'C'], [22, 0, 4, 'C']);
    return prog;
  })());

  // the voiceover (Sarvam Bulbul v3 takes in vo/<id>.wav): Bablu = shubh, Rohan = varun, Meera = suhani,
  // Aaji = neha, Arjun = advait (Hindi). display = caption, alt = English subtitle.
  const L = (id, at, who, text, alt) => ({ id, at, who, text, display: text, alt });
  const vo = [
    L('v01', T(1, 0), 'bablu', "पुण्यात पहिला पाऊस पडला… की सगळे वेडे होतात!", "When Pune gets its first rain… everyone goes crazy!"),
    L('v02', T(2, 1.5), 'bablu', "रोहन. ऑफिस मीटिंगमध्ये.", "Rohan. In an office meeting."),
    L('v03', T(3, 0.6), 'rohan', "सॉरी… नेटवर्क इश्यू आहे. बाय!", "Sorry… network issue. Bye!"),
    L('v04', T(4, 2.5), 'bablu', "मीरा. उद्या परीक्षा.", "Meera. Exam tomorrow."),
    L('v05', T(5, 1.5), 'meera', "पाऊस पण एक अभ्यासच आहे!", "Rain is also a kind of studying!"),
    L('v06', T(6, 1), 'bablu', "आणि आजी? दोन दिवस आधीच पावसाचा वास आला… भजी तयार!", "And Aaji? She smelled the rain two days ago… bhaji ready!"),
    L('v07', T(7, 3), 'aaji', "पहिल्या पावसाला भजी नाही? मग कसला पुणेकर!", "No bhaji on the first rain? What kind of Punekar is that!"),
    L('v08', T(9, 2.5), 'arjun', "सब लोग बारिश की तरफ़ क्यों भाग रहे हैं?", "Why is everyone running TOWARDS the rain?"),
    L('v09', T(11, 0), 'bablu', "चला! सिंहगड! सगळे बसा!", "Let's go! Sinhagad! Everyone in!"),
    L('v10', T(14, 1), 'bablu', "पुण्याचा नियम नंबर पाच. पहिला पाऊस म्हणजे सगळे प्लॅन कॅन्सल… आणि भजी कंपल्सरी!", "Pune Rule #5: first rain means every plan is cancelled… and bhaji is compulsory!"),
    L('v11', T(16, 2), 'aaji', "दरवर्षी पाऊस येतो… पण दरवर्षी तो पहिल्यासारखाच वाटतो.", "Every year the rain comes… and every year it feels like the first time."),
    L('v12', T(18, 3), 'arjun', "अब समझा… ये शहर बारिश से प्यार करता है.", "Now I get it… this city is in love with the rain."),
    L('v13', T(20, 0), 'bablu', "हेच पुणं. मीटर डाऊन… पण आज थोडं थांबूया.", "That's Pune. Meter down… but let's stay a little longer today."),
  ];
  const pops = [];
  const markers = {
    hook: { t: ev.hook, sync: 'av' },
    thunder: { t: ev.thunder, sync: 'av' },
    shut: { t: ev.shut, sync: 'av' },
    splash: { t: ev.splash, sync: 'av' },
    rule: { t: ev.rule, sync: 'av' },
    meter: { t: ev.meter, sync: 'av' },
    ghat: ev.ghat, fort: ev.fort, sun: ev.sun,
  };

  const SCORE = { STYLE, FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, S, m, chords, chordAt, ev, vo, pops, markers };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
