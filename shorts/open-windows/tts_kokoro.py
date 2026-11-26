# Local voice with Kokoro (no API key). Per-line synthesis, word times spread by syllable-ish weight inside each line.
# in: script.json  out: voice_raw.wav + timing_raw.json (same shape as tools/tts.mjs)
import json, re, sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
M = sys.argv[1]; VOICE = sys.argv[2] if len(sys.argv) > 2 else 'am_michael'; SPEED = float(sys.argv[3]) if len(sys.argv) > 3 else 1.1
k = Kokoro(f'{M}/kokoro-v1.0.onnx', f'{M}/voices-v1.0.bin')
S = json.load(open('script.json'))['lines']; LEAD = 0.3; PAUSE = 0.22
out = [np.zeros(int(24000 * LEAD), np.float32)]; t = LEAD; lines = []
def trim(a, thr=0.01):
    idx = np.where(np.abs(a) > thr)[0]; return a[max(0, idx[0] - 240): idx[-1] + 960] if len(idx) else a
for l in S:
    parts = re.split(r'\.\.\.', l['vo']); segs = []
    for j, p in enumerate(parts):
        if not p.strip(): continue
        a, sr = k.create(p.strip(), voice=VOICE, speed=SPEED, lang='en-us'); a = trim(a.astype(np.float32)); segs.append(a)
        if j < len(parts) - 1: segs.append(np.zeros(int(sr * 0.35), np.float32))
    a = np.concatenate(segs); d = len(a) / 24000
    ws = l['vo'].split(); wt = [max(1, len(re.findall(r'[aeiouy]+', w.lower()))) + 0.3 for w in ws]; tot = sum(wt); acc = 0; words = []
    for w, x in zip(ws, wt): words.append({'w': w, 't': round(t + d * acc / tot, 3)}); acc += x
    lines.append({'id': l['id'], 'text': l['vo'], 'start': round(t, 3), 'end': round(t + d, 3), 'words': words})
    out += [a, np.zeros(int(24000 * PAUSE), np.float32)]; t += d + PAUSE
sf.write('voice_raw.wav', np.concatenate(out), 24000)
json.dump({'duration': round(t + 0.6, 3), 'lines': lines}, open('timing_raw.json', 'w'), indent=1)
for l in lines: print(f"{l['id']}: {l['start']:.2f}-{l['end']:.2f} {l['text']}")
print('total', round(t, 2))
