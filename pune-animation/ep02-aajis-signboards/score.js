// PUNE DIARIES EP02 "AAJI'S SIGNBOARDS" (Puneri Patya) (9:16 YouTube Short, ~59s, Marathi/Hindi).
// Arjun returns Aaji's charger and is "insulted" by three ever-ruder signboards on the way to her door.
// He rings the bell TWICE. The door flies open: "दोनदा?!". Pune Rule #2 is stamped. Then Aaji melts:
// poha in the courtyard, and the reveal that she has written every sign in the lane. She paints him one.
// Every voice line, sign, ring, door and stamp is timed here; song.js and film.js both read it.
// All characters are fictional; every sign is original.
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
  const DURATION = T(31, 2) + 0.3;

  const ev = {
    hook: T(0),            // the first sign swings into frame
    lane: T(2),            // Bablu + Arjun in the lane of signs
    sign1: T(5, 2),        // "park here and..."
    sign2: T(9),           // "don't ask for directions..."
    door: T(12, 2),        // the door + "ring ONCE"
    ring1: T(15, 2), ring2: T(15, 3),
    open: T(16, 2),        // the door flies open: Aaji
    rule: T(17, 2),        // PUNE RULE #2 stamp
    court: T(20),          // the courtyard, poha
    paint: T(22),          // Aaji paints; the wall of old signs
    gift: T(24),           // the new sign for Arjun
    golden: T(27),         // golden hour: the new sign on the gate
    meter: T(30, 2), end: T(30, 2),
  };
  const S = {
    hook: [0, ev.lane], lane: [ev.lane, ev.sign1], sign1: [ev.sign1, ev.sign2], sign2: [ev.sign2, ev.door], door: [ev.door, ev.open],
    open: [ev.open, ev.rule], rule: [ev.rule, ev.court], court: [ev.court, ev.paint], paint: [ev.paint, ev.gift], gift: [ev.gift, ev.golden],
    golden: [ev.golden, ev.meter], end: [ev.meter, DURATION],
  };

  const { chords, chordAt } = makeChords(clock, {
    F: { notes: ['F4', 'A4', 'C5'], bass: 'F2' }, C: { notes: ['E4', 'G4', 'C5'], bass: 'C2' },
    Dm: { notes: ['D4', 'F4', 'A4'], bass: 'D2' }, Bb: { notes: ['D4', 'F4', 'Bb4'], bass: 'Bb1' },
    Gm: { notes: ['D4', 'G4', 'Bb4'], bass: 'G2' }, A: { notes: ['C#4', 'E4', 'A4'], bass: 'A1' },
  }, (() => {
    const prog = [];
    const loop = ['Dm', 'Bb', 'C', 'A'];
    for (let b = 2; b < 17; b++) prog.push([b, 0, 4, loop[(b - 2) % 4]]);
    prog.push([17, 0, 4, 'F'], [18, 0, 4, 'C'], [19, 0, 4, 'F']);
    const heart = ['Bb', 'F', 'Gm', 'C', 'Bb', 'F', 'Gm', 'C', 'Bb', 'F', 'C'];
    for (let b = 20; b < 31; b++) prog.push([b, 0, 4, heart[b - 20]]);
    prog.push([31, 0, 4, 'F']);
    return prog;
  })());

  // the voiceover (Sarvam Bulbul v3 takes in vo/<id>.wav): Bablu = shubh, Aaji = neha (the signs are read in
  // her voice — the reveal is that she wrote them), Arjun = advait (Hindi). display = caption, alt = English.
  const L = (id, at, who, text, alt) => ({ id, at, who, text, display: text, alt });
  const vo = [
    L('v01', T(0, 1), 'bablu', "ही पाटी वाचलीत? अभिनंदन… तुमचा अपमान झालाय!", "Read this sign? Congrats… you've been insulted!"),
    L('v02', T(2, 0.5), 'bablu', "पुणेरी पाट्या! पुण्याचे फेमस टोमणे.", "Puneri Patya! Pune's famous taunts."),
    L('v03', T(3, 2), 'bablu', "अर्जुन आजीचा चार्जर परत करायला चाललाय. शूर मुलगा!", "Arjun is returning Aaji's charger. Brave boy!"),
    L('v04', T(5, 3), 'aaji', "इथे गाडी लावाल, तर टायर पोलीस स्टेशनात भेटतील.", "Park here, and you'll meet your tyres at the police station."),
    L('v05', T(8, 0), 'arjun', "बाप रे… बड़ी बदतमीज़ी है!", "Oh god… that's so rude!"),
    L('v06', T(9, 1), 'aaji', "पत्ता विचारू नये. आयुष्यात आम्हीही हरवलोय.", "Don't ask for directions. We're lost in life too."),
    L('v07', T(11, 2), 'arjun', "ये तो… फिलॉसफी है?", "That's… philosophy?"),
    L('v08', T(12, 3), 'aaji', "बेल एकदाच वाजवा. आम्ही म्हातारे आहोत, बहिरे नाही.", "Ring the bell ONCE. We are old, not deaf."),
    L('v09', T(16, 3), 'aaji', "दोनदा?!", "TWICE?!"),
    L('v10', T(17, 3), 'bablu', "पुण्याचा नियम नंबर दोन. पाटी, मालकापेक्षा जास्त कडक असते!", "Pune Rule #2: the sign is stricter than the owner!"),
    L('v11', T(20, 0.5), 'aaji', "ये बाळा, आत ये. पोहे तयार आहेत.", "Come in, child. Poha is ready."),
    L('v12', T(22, 0.5), 'bablu', "आणि गल्लीतल्या सगळ्या पाट्या? आजीनेच लिहिल्यात!", "And every sign in this lane? Aaji wrote them all!"),
    L('v13', T(24, 0.5), 'aaji', "हा घे. खास तुझ्यासाठी.", "Here. Specially for you."),
    L('v14', T(25, 2), 'arjun', "आजी… ये तो सबसे प्यारी पाटी है!", "Aaji… this is the sweetest sign of all!"),
    L('v15', T(27, 0.5), 'bablu', "बाहेरून टोमणे, आतून गोडवा. हेच तर पुणं!", "Sarcasm outside, sweetness inside. That's Pune!"),
    L('v16', T(28, 3), 'bablu', "पुढची राइड: रोहन विरुद्ध हिंजवडी ट्रॅफिक! मीटर डाऊन!", "Next ride: Rohan vs Hinjewadi traffic! Meter down!"),
  ];

  // the three signs on the walk (and the hook sign, and the gift)
  const SIGNS = {
    hook: ['बेल फक्त इमर्जन्सीसाठी.', 'तुमचं येणं', 'इमर्जन्सी नाही!'],
    sign1: ['इथे गाडी लावाल,', 'तर टायर पोलीस', 'स्टेशनात भेटतील.'],
    sign2: ['पत्ता विचारू नये.', 'आयुष्यात आम्हीही', 'हरवलोय.'],
    door: ['बेल एकदाच वाजवा.', 'आम्ही म्हातारे आहोत,', 'बहिरे नाही!'],
    gift: ['नवीन लोकांचं स्वागत!', 'चार्जर मात्र', 'वेळेवर परत करा.'],
  };
  const pops = [
    { t: ev.ring1, text: 'ट्रिंग!', big: 0.8 },
    { t: ev.ring2, text: 'ट्रिंग!!', big: 1.05 },
  ];

  const markers = {
    hook: { t: ev.hook, sync: 'av' },
    ring1: { t: ev.ring1, sync: 'av' },
    ring2: { t: ev.ring2, sync: 'av' },
    open: { t: ev.open, sync: 'av' },
    rule: { t: ev.rule, sync: 'av' },
    court: ev.court, paint: ev.paint, gift: ev.gift, golden: ev.golden,
    meter: { t: ev.meter, sync: 'av' },
  };

  const SCORE = { STYLE, FPS, FORMAT, W, H, SAFE, DURATION, clock, T, BEAT, S, m, chords, chordAt, ev, vo, SIGNS, pops, markers };
  if (node) module.exports = SCORE; else globalThis.SCORE = SCORE;
})();
