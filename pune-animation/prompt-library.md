# Prompt library

Copy-paste building blocks. Every shot prompt in `episodes/` = **STYLE PREFIX + CHARACTER BLOCK(s) + SHOT DESCRIPTION + CAMERA + NEGATIVE**.

---

## 1. Style prefix (paste at the start of every image prompt)

```
Stylized 3D animated feature-film still, warm hand-painted textures, soft global illumination,
expressive cartoon proportions, Indian city setting in Pune, Maharashtra, color palette of
marigold yellow, auto-rickshaw black, laterite red stone, monsoon green and dusk saffron,
cinematic depth of field, vertical 9:16 composition, subject in center 60% of frame,
```

**Track A / 2D alternative prefix:**
```
Flat 2D paper-cut illustration, bold clean outlines, limited warm palette (marigold yellow, black,
laterite red, monsoon green, saffron), subtle paper grain, Indian street-poster charm, vertical 9:16,
```

## 2. Negative prompt (where the tool supports it)
```
photorealistic, live action, real brand logos, readable real shop names, extra limbs, distorted
faces, blurry, watermark, text artifacts, gore, religious mockery, deformed vehicle wheels,
multiple headlights on the auto rickshaw
```

## 3. Character blocks (paste the same text every time, word for word)

**BABLU**
```
BABLU, an anthropomorphic Indian auto-rickshaw, black lower body and bright yellow canopy,
ONE large round headlight in front acting as his single expressive cartoon eye with a small visor
as eyelid, front grille shaped like a smiling mouth, orange marigold garland hanging from the
side mirror, small dent on the left front mudguard, hand-painted back panel text "Horn OK Please",
friendly cheeky expression
```

**AAJI**
```
AAJI, a 72-year-old Maharashtrian grandmother, petite, maroon nine-yard nauvari saree with green
border, round thin gold spectacles, silver hair in a neat bun, small green bindi, cloth shopping
bag on one arm, tiny folded umbrella, sharp confident expression
```

**ROHAN**
```
ROHAN, a 27-year-old Indian software engineer, slim, short black hair slightly messy, light stubble,
grey hoodie over a light blue formal shirt, blue office ID lanyard, black laptop backpack, white
wireless earbuds, mild dark circles under eyes, tired-but-hopeful expression
```

**MEERA**
```
MEERA, a 20-year-old Indian college student, curly shoulder-length black hair in a yellow scrunchie,
mustard yellow short kurta over blue jeans, canvas tote bag with colorful enamel pins, white scooter
helmet with stickers, big bright smile, energetic expression
```

**ARJUN**
```
ARJUN, a 24-year-old South Indian young man new to the city, wavy hair, neat mustache, white
half-sleeve shirt and khaki chinos, holding a smartphone with a map open, confused curious expression
```

**PINYA**
```
PINYA, a chubby grey city pigeon with an iridescent green neck and very expressive round eyes
```

## 4. Character reference sheet prompts (generate ONCE, then reuse)

```
[STYLE PREFIX] character turnaround reference sheet of [CHARACTER BLOCK], five views: front,
three-quarter, side, back, and close-up face showing three expressions (happy, shocked, annoyed),
plain light grey background, even studio lighting, consistent proportions, model sheet, labeled views
```
Make one sheet per character. Save the best one as `ref_<name>.png`. Attach it to **every** later prompt (Midjourney `--cref` / `--oref`, Flux Kontext input image, Runway/Kling "reference/elements").

## 5. Video (image-to-video) prompt template
Upload the keyframe, then use:
```
[ACTION in one sentence]. Camera: [move]. Mood: [mood]. Keep character design exactly as in the
reference image, consistent colors, smooth natural animation, no morphing, no text appearing.
Duration [4-8]s, 9:16.
```
Camera vocabulary: *slow push-in, quick snap zoom, whip pan left, top-down drone, low-angle tracking, handheld shake, static locked-off, orbit 90°*.

## 6. Voice prompts (ElevenLabs Voice Design or casting)
| Character | Voice-design description |
|---|---|
| Bablu | "Warm, playful Indian male voice, late 30s, fast-talking street-smart Pune auto driver energy, Hinglish with a Marathi accent, smiling while speaking." |
| Aaji | "Crisp elderly Maharashtrian woman, 70s, precise and witty, slightly stern but affectionate, clear Puneri Marathi accent." |
| Rohan | "Tired young Indian male software engineer, late 20s, soft-spoken, dry humour, urban English-Hindi mix." |
| Meera | "Bubbly Indian college girl, 20, fast, excited food-vlogger energy, Hinglish." |
| Arjun | "Polite young Malayali man, 24, gentle South Indian English accent, curious and confused." |

Delivery tips: write voiceover with **commas for breaths** and **CAPS for emphasis**, and keep each line under 12 words.

## 7. Music prompts (Suno/Udio or similar)
- **Series theme (5 s sting):** `Upbeat Indian street-funk sting, dhol and tasha hit, auto-rickshaw horn melody, harmonium riff, playful, 5 seconds, instrumental`
- **Comedy bed:** `Quirky Marathi folk-pop instrumental, tutari and dholki groove, pizzicato strings, 120 bpm, comedic, loopable`
- **Heart/ending bed:** `Gentle nostalgic Indian acoustic instrumental, bansuri flute and soft sitar, warm, rainy-evening mood, 80 bpm`
- **Commute race:** `Fast tense Indian action-comedy instrumental, tabla rolls, electronic bass, ticking clock, 140 bpm`
- **Monsoon:** `Romantic monsoon Indian instrumental, rain ambience, santoor and soft strings, 90 bpm`

## 8. SFX checklist
Auto-rickshaw engine putt-putt, meter click, a chorus of horns, pressure-cooker whistle, temple bell, rain on a tin roof, dhol-tasha roll, chai pouring, shop-shutter slam (the signature gag sound), pigeon coo.

## 9. Thumbnail prompt
```
[STYLE PREFIX] extreme close-up of BABLU the auto-rickshaw with a shocked wide eye, [episode prop],
bold empty space at top for 3-word title, high contrast, saturated, clean background, YouTube Shorts thumbnail
```
