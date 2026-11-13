# Demo video pipeline

## Goal

A short screen recording of someone presenting a Decklume deck, scored with
original music whose UI sounds land on the exact frame of each key press. The
output is for LinkedIn, X and the README. Next step: an optional voice-over with
word-timed captions.

## What exists

| File | Role |
| --- | --- |
| `scripts/demo/present-demo.mjs` | Playwright script. Serves `site/demos/folio.html` at 1280×720, adds a visible cursor and a caption pill, hides the deck's control bar, walks through 12 beats (arrows, jump to slide, donut, hypnogram callouts, chart story, Magic Move, overview, click to jump, End). Logs each key event to `timing.json`. |
| `scripts/demo/soundtrack.py` | numpy synth. 96 BPM, A minor (Am–F–C–G): pad, arpeggio, half-time drums, bass, and in-key UI sounds placed on the cues from `timing.json`. Writes a 48 kHz stereo WAV. |
| `scripts/demo/render.sh` | Runs the whole thing: rehearse, record, trim, encode, score, mux, poster frame. |

```bash
scripts/demo/render.sh
```

Outputs go to `launch/demo/` (git-ignored). Last render: 53 s, 4.9 MB.

## How it stays in sync

- `--rehearse` runs every beat at speed and checks `window.decklume.index` /
  `stepIndex` after each one (`expectAt`). It throws on the first wrong slide,
  so a deck change that breaks the script fails before anything records.
- The recording starts before the page is ready. `trimStartMs` in
  `timing.json` is cut off with `ffmpeg -ss`.
- Cue times are shifted by `OFFSET` (0.72 s), the measured lag between the key
  event and the frame that shows it. Checked: cues land within 0.05 s of the
  visual change.
- `soundtrack.py` reads the beats by kind (`key`, `digit`, `jump`, `overview`,
  `click`, `end`) and position, so the groove comes in at the donut, thins out
  in the overview, and resolves on the closing slide. If you add or reorder
  beats in the recorder, check the indexed lookups near the top of the script
  (`groove_in = cues[4][1]`, `morph_at`).

## Changing the demo

- **Different deck or theme:** change `server.url("folio.html")` and the
  `expectAt` slide numbers. Run `--rehearse` until it passes.
- **Different captions:** edit the `showSubtitle` text. Keep each under ~50
  characters so the pill fits at 1280 px.
- **Different length:** pacing comes from the `pace(ms)` waits; the music
  follows the cues automatically.

## Next: voice-over with word-timed captions

Whisper turns speech into text with word timings. Plan:

1. Install `mlx-whisper` (Apple Silicon) into one Python and confirm the
   `mlx-community/whisper-large-v3-turbo` weights downloaded. As of 2026-11-13
   the package wasn't importable and the cached model had only its config;
   `faster-whisper` models (`tiny.en` … `medium.en`) are cached and work as a
   fallback.
2. The user records narration over the silent video (`decklume-presenting-silent.mp4`)
   as `launch/demo/voice.wav`.
3. `scripts/demo/captions.py`: transcribe with word timestamps, write
   `voice.srt` (for platforms that take sidecar captions) and an ASS file with
   2–4 word groups for burn-in.
4. Mix: duck the music by about 10 dB under speech (`sidechaincompress` in
   ffmpeg, or envelope the music in `soundtrack.py` from the word timings).
   Replace the on-screen caption pill with the spoken captions, or keep the pill
   and skip burn-in.
5. Add a `VOICE=1` branch to `render.sh`.

Acceptance: captions within 0.1 s of speech, no word cut off at a group
boundary, music audible but never over the voice, loudness about −14 LUFS.

## Prompt

> Read `CLAUDE.md` and `docs/roadmap/demo-video.md`. I've recorded
> `launch/demo/voice.wav`. Add word-timed captions with whisper and mix my voice
> over the music, as described in "Next". Show me a 10-second excerpt before the
> full render.
