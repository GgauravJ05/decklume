#!/usr/bin/env bash
# Record the presenting demo and give it its soundtrack.
#
#   scripts/demo/render.sh            rehearse, record, encode, score, mux
#   PYTHON=python3 scripts/demo/render.sh
#
# Writes launch/demo/ (git-ignored):
#   decklume-presenting.mp4         H.264 + AAC, ready for LinkedIn / X
#   decklume-presenting-silent.mp4  the same video without audio
#   decklume-presenting.jpg         poster frame
# Needs Node 18+, ffmpeg, and Python 3 with numpy.
set -euo pipefail

cd "$(dirname "$0")/../.."
PYTHON="${PYTHON:-/opt/anaconda3/bin/python}"
OUT=launch/demo
REC="$OUT/rec"
# Seconds between the recorder's key events and the frame that shows them.
# Measured once by matching cues to visual onsets; re-measure if the recorder changes.
OFFSET="${OFFSET:-0.72}"

mkdir -p "$REC"

echo "1/5 rehearsal"
node scripts/demo/present-demo.mjs --rehearse | tail -1

echo "2/5 recording"
node scripts/demo/present-demo.mjs "$REC" | tail -1

echo "3/5 trimming the page load and encoding"
TRIM=$(node -e 'console.log((require(process.argv[1]).trimStartMs/1000).toFixed(3))' "$PWD/$REC/timing.json")
ffmpeg -loglevel error -y -ss "$TRIM" -i "$REC/raw.webm" \
  -vf "fps=30,format=yuv420p" -c:v libx264 -preset slow -crf 18 -movflags +faststart -an \
  "$OUT/decklume-presenting-silent.mp4"
DUR=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$OUT/decklume-presenting-silent.mp4")

echo "4/5 soundtrack (${DUR}s)"
"$PYTHON" scripts/demo/soundtrack.py "$REC/timing.json" "$DUR" "$OFFSET" "$REC/soundtrack.wav" | head -1

echo "5/5 muxing"
ffmpeg -loglevel error -y -i "$OUT/decklume-presenting-silent.mp4" -i "$REC/soundtrack.wav" \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart \
  "$OUT/decklume-presenting.mp4"
ffmpeg -loglevel error -y -ss 2.5 -i "$OUT/decklume-presenting.mp4" -frames:v 1 -q:v 2 "$OUT/decklume-presenting.jpg"

ls -la "$OUT" | awk 'NR>1 && $9 ~ /decklume/ {print $5, $9}'
