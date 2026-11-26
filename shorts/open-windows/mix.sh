#!/usr/bin/env bash
# picture + captions + voice + wind → out/he-opened-every-window.mp4
set -euo pipefail; cd "$(dirname "$0")"; mkdir -p out
ffmpeg -v error -y -i ../../engine/out/windows_raw.mp4 -i cap/overlay.mov -i voice.wav -i wind.wav -filter_complex \
 "[0:v]scale=1080:1920:flags=lanczos[s];[s][1:v]overlay=0:0:format=auto,format=yuv420p[v];[2:a]volume=1.0[a1];[3:a]volume=0.6[a2];[a1][a2]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]" \
 -map "[v]" -map "[a]" -c:v libx264 -crf 19 -preset medium -c:a aac -b:a 192k -ar 44100 -shortest -movflags +faststart out/he-opened-every-window.mp4
echo out/he-opened-every-window.mp4
