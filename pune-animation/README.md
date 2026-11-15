# "Pune Diaries": AI animation series plan

An animated short-video series about everyday life in Pune. It is told through one recurring cast, with a story hook in every episode.

| File | What's inside |
|---|---|
| `README.md` (this file) | Strategy, production pipeline, tools, timeline, KPIs |
| `research.md` | Research notes on Pune daily life (with sources and fact-check flags) |
| `series-bible.md` | Characters, world, visual style, tone, recurring gags, hook formulas |
| `prompt-library.md` | Reusable image, video, voice and music prompts plus the character reference sheets |
| `episodes/EP01–EP06` | Full scripts: hook, beats, voiceover, shot list, image prompt and video prompt for every shot |
| `episodes/backlog.md` | 12 more episode ideas for Season 1 and 2 |

---

## 1. Concept

**Logline:** *Bablu, a talkative 20-year-old Pune auto-rickshaw, shows you the city's unwritten rules, one ride at a time.*

Every episode is a **ride**. Bablu picks up one of the recurring passengers (Aaji, Rohan, Meera, or a confused newcomer), and the ride shows one slice of Pune life: the 1–4 pm "Pune siesta", Puneri Patya signboards, the Hinjewadi commute, misal, monsoon treks, dhol-tasha practice.

Why an auto-rickshaw narrator?
- It **goes everywhere**, so it naturally connects old Pune (the Peths) and new Pune (Baner, Hinjewadi, Kharadi).
- A non-human narrator is **easy to keep consistent** with AI tools, because a vehicle drifts far less than a human face.
- It gives the series a **recognisable thumbnail icon**: a yellow-and-black auto with eyes on the headlights.

**Tone:** affectionate local humour. We laugh *with* Punekars, never *at* them. Each episode ends warm.

## 2. Audience and platforms

| Audience | What hooks them |
|---|---|
| Punekars (18–40) | "This is SO us": recognition humour, sharing with friends |
| People moving to Pune (students, IT workers) | Survival tips disguised as story |
| The diaspora and other Indian cities | Nostalgia and a Pune vs. Mumbai/Bangalore rivalry |

| Format | Where | Length | Cadence |
|---|---|---|---|
| **9:16 vertical** (primary) | YouTube Shorts, Instagram Reels, Facebook | 45–60 s | 3 per week |
| **16:9 compilation** | YouTube long-form | 6–10 min (5–8 shorts and new bridging scenes) | 1 per month |
| Stills and carousels | Instagram | Comic strip of 5–7 panels | 1 per week (reuse keyframes) |

**Language:** Hinglish voiceover with Marathi flavour words (*kay re, ekdum, bhari, chal na, ho na*), burned-in English captions, and a Marathi-only version as a second track or channel later.

## 3. Storytelling and hook system (used in every episode)

Every script follows the same **6-beat "Ride" structure**:

| Time | Beat | Purpose |
|---|---|---|
| 0–2 s | **HOOK**: a visual pattern break and a provocative line | Stop the scroll. Never start with a logo or an intro. |
| 2–8 s | **OPEN LOOP**: a question, or "Pune Rule #N" | Give viewers a reason to stay |
| 8–35 s | **ESCALATION**: the same situation 3 times, each bigger | Comedy rhythm (rule of three) |
| 35–45 s | **TWIST**: the unexpected payoff | Reward the viewer |
| 45–52 s | **HEART**: one warm or true line | Gives people a reason to share it |
| 52–60 s | **CLIFFHANGER/CTA**: tease the next ride | Drives follows and binge-watching |

Hook formulas (rotate them; see `series-bible.md` §6 for 20 ready-made lines):
1. **Rule hook:** "Pune Rule #7: never knock on a shop at 2 pm."
2. **Challenge hook:** "18 kilometres. Four vehicles. Who reaches Hinjewadi first?"
3. **Myth-buster hook:** "Everyone says Punekars are rude. Here's the truth."
4. **POV hook:** "POV: your first rain in Pune."
5. **Mid-action cold open:** start at the climax, then "…3 hours earlier."

Retention tricks:
- Burned-in captions with **keyword pops** (yellow highlight on Marathi words, with the translation shown below).
- A **visual change every 1.5–3 s** (cut, zoom, character pose, or a text pop).
- A **loop ending**: the last line flows back into the first frame so replays feel seamless.
- A **series counter** in the corner ("Pune Rule #7"), which makes people want to collect them all.

## 4. Production pipeline

Two tracks. Start with **Track A** to test ideas cheaply, and promote the best-performing episodes to **Track B**.

### Track A: code-drawn 2D animation (inside this Claude Code environment, ₹0)
- **Tool:** the **Animation Studio** skill (already available). It draws every frame in code and synthesises the music, then renders a 1080p MP4 in 9:16.
- **Voice:** `espeak-ng` is installed here for animatic or scratch voiceovers. Replace it with ElevenLabs (the connector is available in this workspace) or your own recorded voice for final versions.
- **Good for:** pilots, explainers, maps ("Pune in 60 seconds"), infographic shorts, fast iteration.
- **Benefit:** **perfectly consistent characters**, no credits, edits are just code changes.

### Track B: AI-generated cinematic animation (external tools)
```
Script → Character sheets → Keyframe images → Image-to-video clips → Voice → Music/SFX → Edit + captions → Thumbnails → Publish
```
| Step | Recommended tool (pick one) | Notes |
|---|---|---|
| 1. Script and shot list | Claude (these files) | Done for EP01–EP06 |
| 2. Character reference sheets | Midjourney v7 (`--cref`/omni-ref), Flux Kontext, Google Nano Banana, Ideogram | Generate turnarounds once and reuse them in every shot |
| 3. Keyframes (one per shot) | Same image tool, with the character refs attached | Use the style prefix in `prompt-library.md` |
| 4. Image → video (4–10 s clips) | **Kling** (best value, multi-reference), **Google Veo** in Flow (best prompt adherence, native audio), **Runway Gen-4** (reference consistency), Hailuo or Seedance | Always use **image-to-video**, not text-to-video, so characters stay consistent |
| 5. Voiceover | **ElevenLabs** (Hindi/Hinglish voices, voice design), or record yourself | One fixed voice per character |
| 6. Music and SFX | Suno or Udio (custom tracks), ElevenLabs SFX, YouTube Audio Library | Use the music prompts in `prompt-library.md` |
| 7. Lip-sync (optional) | Kling lip-sync, HeyGen, Hedra | Only for close-up dialogue shots |
| 8. Edit and captions | CapCut, DaVinci Resolve, or the **HyperFrames** skill (installed) for kinetic captions and lower-thirds | Burned-in captions are mandatory |
| 9. Thumbnails | The image tool, with Bablu's face, 3 words max, high contrast | |

> Model names and limits change month to month (e.g. Kling 3 vs 4, Veo 3.x clip lengths). Check each tool's current plan before buying.

**Character consistency rules (Track B):**
1. Build a **reference pack** for each character: front, ¾, side, back, and 3 expressions, on a plain background.
2. Always attach **the same 1–3 reference images** and paste the **same character description block** (it's in `prompt-library.md`).
3. Generate the **keyframe image first**, then animate it. Never generate characters from text alone in the video model.
4. Keep clips **short (4–8 s)** with **one action per clip**.
5. Use a **fixed seed and style prefix** in the image tool where supported.
6. Expect to make 3–5 takes per shot. Budget for it.

### Optional Track C: HyperFrames (installed skills)
The `hyperframes` skills are installed in `.claude/skills`. Use them for HTML/GSAP motion-graphics pieces such as animated captions, the "Pune Rule #N" title cards, maps of commute routes, and end screens. They render locally to MP4 and overlay on the AI clips.

## 5. Per-episode production checklist
1. [ ] Script locked (hook tested by reading the first 2 seconds aloud)
2. [ ] Shot list frozen (8–14 shots)
3. [ ] Keyframes generated and approved (consistency check against the reference pack)
4. [ ] Clips animated (pick the best take per shot)
5. [ ] Voiceover recorded (target 140–160 words per minute)
6. [ ] Music and SFX laid in (music ducked to −18 dB under the voiceover)
7. [ ] Rough cut ≤ 60 s, first frame = the hook
8. [ ] Captions and keyword pops, safe zones checked (no text in the bottom 20% or the right 10% on Shorts and Reels)
9. [ ] Fact check (see the flags in `research.md`), sensitivity check (religion, communities, real businesses)
10. [ ] Thumbnail, title, description, hashtags
11. [ ] Publish at a test time and log the KPIs

## 6. Timeline (first 6 weeks)

| Week | Goal |
|---|---|
| 1 | Finalise the bible, generate the **character reference packs**, choose a voice for each character |
| 2 | **Pilot:** produce EP01 in **both** tracks (A: code-drawn, B: AI cinematic) and compare quality, cost and time |
| 3 | Produce EP02–EP03 in the winning track and post EP01–EP03 |
| 4 | EP04–EP06, A/B test hooks (2 thumbnail/hook variants per episode) |
| 5 | Review analytics, double down on the best format, write EP07–EP12 from `backlog.md` |
| 6 | First 16:9 compilation and the Marathi-language pilot |

**Rough per-episode effort (Track B):** 4–8 hours once the pipeline is set up. **Monthly tool budget:** about ₹3,000–8,000 (one image plan, one video plan, ElevenLabs Starter, plus music). Check current pricing.

## 7. KPIs

| Metric | Target for the first 30 days |
|---|---|
| 3-second hold (viewed vs. swiped) | > 70 % |
| Average percentage viewed | > 80 % (Shorts) |
| Shares per 1,000 views | > 10 (the "tag a Punekar" effect) |
| Comments asking for a topic | Use these to drive the backlog |
| Follower conversion | > 1 % of views |

## 8. Guardrails
- **Religion and festivals:** show Ganeshotsav and its traditions with respect. Never make a deity the butt of a joke.
- **Real businesses and landmarks:** landmarks (Shaniwar Wada, Sinhagad, FC Road) are fine. **Don't show real shop logos or brand names** in AI images. Use generic signs.
- **Stereotypes:** Puneri humour stays affectionate. Avoid community, caste or language-war jokes.
- **AI disclosure:** turn on YouTube's "altered or synthetic content" label where required, and follow each platform's current AI-content and monetisation policy.
- **Facts:** anything numeric (metro lines, distances, populations) must be re-verified at publish time.
