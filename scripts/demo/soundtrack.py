"""Soundtrack for the Decklume presenting demo: original music + in-key UI sounds.

96 BPM, A minor (Am-F-C-G), 48 kHz stereo. Every UI sound sits on a cue
read from the recorder's timing.json, so it lands on the frame it belongs to.

usage: python soundtrack.py timing.json duration_s offset_s out.wav
"""
import json
import sys
import wave
import numpy as np

timing_path, DUR, OFFSET, out = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
SR = 48000
BEAT = 60 / 96
BAR = BEAT * 4
N = int(SR * DUR)
rng = np.random.default_rng(7)

music = np.zeros((N, 2))
sfx = np.zeros((N, 2))
send = np.zeros((N, 2))


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def place(buf, t, sig, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= len(buf) or i < 0:
        return
    sig = sig[: len(buf) - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i : i + len(sig), 0] += sig * gain * l * 1.414
    buf[i : i + len(sig), 1] += sig * gain * r * 1.414


def smooth(x, cutoff):
    k = max(1, int(SR / (cutoff * 2.2)))
    ker = np.ones(k) / k
    return np.convolve(np.convolve(x, ker, mode="same"), ker, mode="same")


def env(n, a=0.01, d=0.2, s=0.6, r=0.2):
    e = np.full(n, s)
    na, nd, nr = min(int(a * SR), n), int(d * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na)
    nd = min(nd, n - na)
    e[na : na + nd] = np.linspace(1, s, nd)
    if nr < n:
        e[n - nr :] *= np.linspace(1, 0, nr)
    return e


def tone(f, dur, kind="sine", detune=0.0):
    t = np.arange(int(dur * SR)) / SR
    if kind == "sine":
        return np.sin(2 * np.pi * f * t)
    if kind == "warm":
        out = np.zeros_like(t)
        for d in (-detune, detune):
            for h in range(1, 7):
                out += np.sin(2 * np.pi * f * (1 + d) * h * t + h) / h ** 1.6
        return out / 2.2
    if kind == "bell":
        return (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 6)
                + 0.18 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 10))


def decay(sig, rate):
    return sig * np.exp(-np.arange(len(sig)) / SR * rate)


# --- Cues from the recording -------------------------------------------------
timing = json.load(open(timing_path))
raw = [(e["kind"], (e["ms"] - timing["trimStartMs"]) / 1000 - OFFSET) for e in timing["events"]]
cues = []
for i, (kind, t) in enumerate(raw):
    # The Enter that follows typed digits is a jump, not a plain step.
    if kind == "key" and i > 0 and raw[i - 1][0] == "digit" and t - raw[i - 1][1] < 0.5:
        kind = "jump"
    cues.append((kind, t))
first_key = next(t for k, t in cues if k == "key")
first_jump = next(t for k, t in cues if k == "jump")
groove_in = cues[4][1]          # the donut: the deck starts to move
end_at = next(t for k, t in cues if k == "end")
overview_at = next(t for k, t in cues if k == "overview")
click_at = next(t for k, t in cues if k == "click")
last_jump = [t for k, t in cues if k == "jump"][-1]
morph_at = next(t for k, t in cues if k == "key" and t > last_jump)

# --- Music ---------------------------------------------------------------------
CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
ROOTS = [33, 29, 36, 31]
RESOLVE = [57, 60, 64, 69]

# Pad: whole piece; it resolves to Am the moment the closing slide lands.
b = 0
while b * BAR < end_at:
    t0 = b * BAR
    dur = min(BAR + 0.5, end_at - t0 + 0.4)
    for m in CHORDS[b % 4]:
        sig = smooth(tone(hz(m), dur, "warm", 0.0035), 1300 if t0 < groove_in else 2100)
        sig *= env(len(sig), a=0.6 if b == 0 else 0.3, d=0.4, s=0.75, r=0.5)
        place(music, t0, sig, 0.045, pan=(m % 3 - 1) * 0.35)
        place(send, t0, sig, 0.03)
    b += 1
for m in RESOLVE:
    sig = smooth(tone(hz(m), DUR - end_at, "warm", 0.0035), 2100)
    place(music, end_at, sig * env(len(sig), 0.15, 0.5, 0.8, 2.0), 0.05, pan=(m % 3 - 1) * 0.35)
    place(send, end_at, sig, 0.035)

# Arp: soft plucks on eighths once the presenter starts moving.
b = 0
while b * BAR < end_at:
    ch = CHORDS[b % 4]
    notes = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 12]
    for k in range(8):
        t = b * BAR + k * BEAT / 2
        if t < first_key or t >= end_at:
            continue
        sig = smooth(decay(tone(hz(notes[k % 4]), 0.4, "warm", 0.002), 9), 2400)
        place(music, t, sig, 0.018 if t < groove_in else 0.024, pan=0.4 if k % 2 else -0.4)
        place(send, t, sig, 0.018)
    b += 1


def kick():
    n = int(0.4 * SR)
    t = np.arange(n) / SR
    f = 46 + 66 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


def hat():
    x = rng.standard_normal(int(0.06 * SR))
    return decay(x - smooth(x, 5000), 75)


K, H = kick(), hat()
# Half-time groove from the donut to the closing slide; it thins out in the overview.
t = np.ceil(groove_in / BEAT) * BEAT
while t < end_at - 0.05:
    beat = round(t / BEAT)
    calm = overview_at <= t < click_at
    if beat % 2 == 0:
        place(music, t, K, 0.16 if calm else 0.24)
    if not calm:
        place(music, t + BEAT / 2, H, 0.03, pan=0.3)
    t += BEAT

# Bass: roots on quarters from the first jump.
b = 0
while b * BAR < end_at:
    for k in range(4):
        t = b * BAR + k * BEAT
        if first_jump <= t < end_at:
            sig = smooth(tone(hz(ROOTS[b % 4] + 12), 0.5, "warm"), 450) * env(int(0.5 * SR), 0.01, 0.15, 0.55, 0.1)
            place(music, t, sig, 0.08)
    b += 1

# --- UI sounds, in key and under the music ----------------------------------------
PENT = [69, 72, 74, 76, 79, 81, 84, 86]
step = 0
for kind, t in cues:
    if kind == "key":
        m = PENT[step % len(PENT)] + 12
        step += 1
        sig = decay(tone(hz(m), 0.18, "sine"), 30)
        place(sfx, t, sig, 0.03, pan=0.15)
        place(send, t, sig, 0.02)
    elif kind == "digit":
        x = smooth(rng.standard_normal(int(0.03 * SR)), 3500)
        place(sfx, t, decay(x, 120), 0.05)
    elif kind == "jump":
        for j, m in enumerate((76, 81)):
            sig = decay(tone(hz(m + 12), 0.3, "bell"), 12)
            place(sfx, t + j * 0.07, sig, 0.03)
            place(send, t + j * 0.07, sig, 0.025)
    elif kind == "overview":
        for j, m in enumerate((69, 72, 76, 81, 84)):
            sig = decay(tone(hz(m + 12), 0.5, "bell"), 8)
            place(sfx, t + j * 0.05, sig, 0.022, pan=-0.5 + j * 0.25)
            place(send, t + j * 0.05, sig, 0.02)
    elif kind == "click":
        place(sfx, t, decay(tone(hz(88), 0.2, "sine"), 22), 0.04)
    elif kind == "end":
        sig = decay(tone(hz(81), 2.2, "bell"), 2.2)
        place(sfx, t, sig, 0.045)
        place(send, t, sig, 0.03)

# Magic Move: an airy lift into the morph.
n = int(0.7 * SR)
air = smooth(rng.standard_normal(n), 2400) - smooth(rng.standard_normal(n), 500)
place(sfx, morph_at - 0.15, air * np.sin(np.linspace(0, np.pi, n)) ** 2, 0.045, pan=-0.2)

# --- Reverb, then the master ---------------------------------------------------
ir_n = int(1.6 * SR)
rev = np.zeros((N, 2))
for c in range(2):
    ir = smooth(rng.standard_normal(ir_n), 4000) * np.exp(-np.arange(ir_n) / SR * 3.2)
    ir /= np.sqrt(np.sum(ir ** 2))
    nfft = 1 << (N + ir_n - 1).bit_length()
    rev[:, c] = np.fft.irfft(np.fft.rfft(send[:, c], nfft) * np.fft.rfft(ir, nfft), nfft)[:N]

mix = music + sfx * 0.9 + rev * 0.5
mix[: int(0.5 * SR)] *= np.linspace(0, 1, int(0.5 * SR))[:, None]
mix[-int(1.5 * SR) :] *= np.linspace(1, 0, int(1.5 * SR))[:, None] ** 1.5
mix = np.tanh(mix * 1.5) / 1.5
mix *= 10 ** (-1 / 20) / np.max(np.abs(mix))

with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print(f"wrote {out}: {DUR:.2f}s, {len(cues)} cues, morph at {morph_at:.2f}s")
for kind, t in cues:
    print(f"  {kind:8s} {t:6.2f}")
