#!/usr/bin/env bash
# picture (720p, upscaled; captions are drawn in-engine) + voice + music (ducked under the voice) + sfx + wind → out/he-opened-every-window.mp4
set -euo pipefail; cd "$(dirname "$0")"; mkdir -p out
ffmpeg -v error -y -i ../../engine/out/windows_raw.mp4 -i voice.wav -i music.wav -i sfx.wav -i wind.wav -filter_complex \
 "[0:v]scale=1080:1920:flags=lanczos,format=yuv420p[v];
  [1:a]aresample=44100,apad=whole_dur=43.7,asplit=2[vo][key];[2:a]volume=0.55[mu];[mu][key]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[duck];
  [3:a]volume=0.5[fx];[4:a]volume=0.8[wd];
  [vo][duck][fx][wd]amix=inputs=4:duration=longest:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]" \
 -map "[v]" -map "[a]" -c:v libx264 -crf 19 -preset medium -c:a aac -b:a 192k -ar 44100 -shortest -movflags +faststart out/he-opened-every-window.mp4
echo out/he-opened-every-window.mp4
