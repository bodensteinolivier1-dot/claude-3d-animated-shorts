# He Opened Every Window in January

41 s vertical short in the RicksClips story formula, built with this repo's 3D engine.

odd act (windows open in winter) → mockery ("We're not penguins") → reply ("You'll thank me at three") →
disaster (Dave blanks at his 3 pm pitch) → science (CO₂ passes 1,400 ppm in a sealed room; Harvard COGfx study, Allen et al. 2016:
cognitive scores ~50% lower at ~1,400 ppm) → analogy (head in a sleeping bag doing math) → loop line.

## Rebuild
```bash
cd shorts/open-windows
python3 tts_kokoro.py <dir with kokoro-v1.0.onnx + voices-v1.0.bin> am_michael 1.1   # local voice, no API key
ffmpeg -y -i voice_raw.wav voice_raw.mp3 && python3 ../../tools/fit.py --target 41 --gap 0.5
cp timing.json ../../engine/film/story_windows.json
CAP_Y=0.74 python3 ../../tools/captions.py                                           # cap/overlay.mov
cd ../../engine && XQ="&viewer=1&story=windows" node render.cjs out/windows_raw.mp4 720 1280 30   # software GL: 720p, mix.sh upscales
```
Then mix (see `mix.sh`). Scene code: `engine/story_windows.js`.
Kokoro model files: github.com/thewh1teagle/kokoro-onnx releases (model-files-v1.0).
