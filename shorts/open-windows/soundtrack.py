# Original synth soundtrack + sound effects for "He Opened Every Window in January". No samples: everything is generated here.
#   python3 soundtrack.py [sfx.json]     (sfx.json: [[name, seconds], ...] from render.cjs SFX_OUT; music markers come from timing.json)
# out: music.wav (bed), sfx.wav (effects), both 44.1 kHz mono
import json, sys, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt

SR = 44100
T = json.load(open('timing.json')); L = {l['id']: l for l in T['lines']}
DUR = round(L['end']['end'] + 2.3, 2)
STOP = L['blank']['start'] - 0.15; SCI = L['why']['start'] - 0.1; MORN = L['end']['start'] - 0.5; STING = L['end']['end'] + 0.55
rng = np.random.default_rng(7)
N = int(DUR * SR) + SR
t_ = lambda d: np.arange(int(d * SR)) / SR
def filt(x, kind, f): return sosfilt(butter(2, f, kind, fs=SR, output='sos'), x)
def env(d, a=0.005, k=6.0): t = t_(d); return np.minimum(1, t / a) * np.exp(-t * k)
def put(buf, x, at, g=1.0):
    i = int(at * SR); j = min(len(buf), i + len(x));
    if i < len(buf) and j > i: buf[i:j] += g * x[:j - i]
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)

# ---------- instruments ----------
def marimba(m, d=0.6, v=0.25): t = t_(d); f = mtof(m); return v * (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t * 20)) * env(d, 0.002, 7)
def pluck(m, d=0.5, v=0.2): t = t_(d); f = mtof(m); x = sum(np.sin(2 * np.pi * f * k * t) / k ** 1.6 for k in range(1, 6)); return v * x * env(d, 0.002, 9)
def bass(m, d=0.42, v=0.32): t = t_(d); f = mtof(m); return v * (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * env(d, 0.004, 4)
def pad(ms, d, v=0.05): t = t_(d); x = sum(np.sin(2 * np.pi * mtof(m) * t * (1 + dt)) for m in ms for dt in (-0.003, 0.003)); return v * x * np.minimum(1, t / 0.4) * np.minimum(1, (d - t) / 0.4)
def hat(v=0.05): return v * filt(rng.standard_normal(int(0.04 * SR)), 'highpass', 7000) * env(0.04, 0.001, 70)
def kick(v=0.4): t = t_(0.18); return v * np.sin(2 * np.pi * (50 * t + 70 * (1 - np.exp(-t * 30)) / 30)) * env(0.18, 0.001, 18)
def snap(v=0.12): return v * filt(rng.standard_normal(int(0.09 * SR)), 'bandpass', [1500, 5000]) * env(0.09, 0.001, 40)

def music():
    m = np.zeros(N); bpm = 112; b = 60 / bpm
    A = [(48, [60, 64, 67]), (45, [57, 60, 64]), (41, [53, 57, 60]), (43, [55, 59, 62])]          # C Am F G
    Bm = [(45, [57, 60, 64]), (41, [53, 57, 60]), (48, [55, 60, 64]), (40, [56, 59, 64])]         # Am F C E  (curious)
    def section(t0, t1, prog, playful=True, g=1.0):
        bar = 0; t = t0
        while t < t1 - 0.01:
            root, ch = prog[bar % 4]
            for beat in range(4):
                tb = t + beat * b
                if tb >= t1: break
                if playful:
                    if beat in (0, 2): put(m, bass(root), tb, g); put(m, kick(0.22), tb, g)
                    if beat in (1, 3): put(m, snap(0.08), tb, g)
                    for e in range(2):
                        te = tb + e * b / 2
                        if te < t1: put(m, marimba(ch[(beat * 2 + e) % 3] + (12 if (beat * 2 + e) % 5 == 4 else 0), 0.5, 0.11), te, g); put(m, hat(0.025), te + b / 4, g)
                else:
                    if beat == 0: put(m, bass(root - 12, 1.6, 0.25), tb, g); put(m, pad([n - 12 for n in ch], 4 * b, 0.03), tb, g)
                    put(m, pluck(ch[beat % 3] + 12, 0.7, 0.07), tb + (b / 2 if beat % 2 else 0), g); put(m, hat(0.015), tb + b / 2, g)
            t += 4 * b; bar += 1
    section(0.0, STOP, A, True)
    section(SCI + 0.3, MORN, Bm, False, 0.9)
    section(MORN + 0.2, STING, A, True)
    for n in (48, 60, 64, 67, 72): put(m, marimba(n, 2.2, 0.16), STING)   # final sting chord
    put(m, bass(36, 1.5, 0.35), STING); put(m, kick(0.35), STING)
    return m

# ---------- sound effects ----------
def noise(d): return rng.standard_normal(int(d * SR))
def add(*xs):   # sum sounds of different lengths
    n = max(len(x) for x in xs); o = np.zeros(n)
    for x in xs: o[:len(x)] += x
    return o
def sweep(d, f0, f1, q=6, v=0.4):   # band-passed noise whose centre glides f0 → f1
    x = noise(d); out = np.zeros_like(x); n = len(x); seg = 512
    for i in range(0, n, seg):
        f = f0 + (f1 - f0) * (i / n); lo, hi = f / (1 + 1 / q), f * (1 + 1 / q); out[i:i + seg] = filt(x[i:i + seg + 2048], 'bandpass', [max(30, lo), min(SR / 2 - 100, hi)])[:len(out[i:i + seg])]
    return v * out * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
def tone(f, d, k=8, v=0.3, vib=0): t = t_(d); ph = 2 * np.pi * np.cumsum(f * (1 + vib * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 3))) / SR if np.ndim(f) else 2 * np.pi * f * t + (vib and 0); return v * np.sin(ph) * env(d, 0.003, k)
def glide(f0, f1, d, k=8, v=0.3): t = t_(d); f = f0 * (f1 / f0) ** (t / d); return v * np.sin(2 * np.pi * np.cumsum(f) / SR) * env(d, 0.003, k)
def thump(v=0.6, f0=110, f1=40, d=0.3): return add(glide(f0, f1, d, 12, v), 0.25 * v * filt(noise(d), 'lowpass', 900) * env(d, 0.001, 25))
def clicks(times, v=0.25, f=2500):
    d = max(times) + 0.05; x = np.zeros(int(d * SR))
    for tt in times: c = filt(noise(0.012), 'bandpass', [f * 0.7, f * 1.4]) * env(0.012, 0.0005, 300); i = int(tt * SR); x[i:i + len(c)] += v * c[:len(x) - i]
    return x
def wind(d, v=0.35): x = filt(np.cumsum(noise(d)) * 0.02, 'bandpass', [120, 900]); x /= np.max(np.abs(x)) + 1e-9; return v * x * np.sin(np.pi * np.linspace(0, 1, len(x)))

def make(name):
    if name == 'whoosh': return sweep(0.45, 300, 3500, 3, 0.35)
    if name == 'whip': return sweep(0.25, 600, 5000, 3, 0.4)
    if name == 'wind_gust': return wind(1.8, 0.4)
    if name == 'paper': return 0.18 * filt(noise(1.2), 'highpass', 2500) * (np.abs(np.sin(t_(1.2) * 37)) ** 4) * np.exp(-t_(1.2) * 2)
    if name == 'pop': return glide(500, 1300, 0.09, 30, 0.35)
    if name == 'stomp': return thump(0.5, 90, 45, 0.22)
    if name == 'sip': return 0.2 * filt(noise(0.5), 'bandpass', [900, 2600]) * (0.5 + 0.5 * np.sin(t_(0.5) * 60)) * np.sin(np.pi * np.linspace(0, 1, int(0.5 * SR)))
    if name == 'boing': t = t_(0.7); return 0.3 * np.sin(2 * np.pi * np.cumsum(220 * (1 + 0.35 * np.sin(2 * np.pi * 11 * t) * np.exp(-t * 4))) / SR) * env(0.7, 0.003, 4)
    if name == 'slam': return add(thump(0.9, 140, 40, 0.4), 0.35 * filt(noise(0.25), 'bandpass', [700, 4000]) * env(0.25, 0.001, 22))
    if name == 'tick_fast': ts = np.cumsum(np.geomspace(0.16, 0.025, 46)); return clicks(list(ts[ts < 1.9]), 0.3, 3000)
    if name == 'ding': t = t_(1.6); return 0.22 * (np.sin(2 * np.pi * 1320 * t) + 0.5 * np.sin(2 * np.pi * 1320 * 2.76 * t)) * env(1.6, 0.002, 3)
    if name == 'tap': return add(clicks([0.0], 0.45, 1800), glide(1500, 1300, 0.06, 60, 0.12))
    if name == 'scratch': t = t_(0.55); f = 900 + 700 * np.sign(np.sin(2 * np.pi * 6 * t)) * np.abs(np.sin(2 * np.pi * 6 * t)) ** 0.5; x = filt(noise(0.55), 'bandpass', [400, 3000]) * (0.6 + 0.4 * np.sin(2 * np.pi * np.cumsum(f) / SR)); return 0.4 * x * np.sin(np.pi * np.linspace(0, 1, len(x))) ** 0.5
    if name == 'clatter': return clicks([0, 0.09, 0.15, 0.27, 0.33], 0.4, 1400)
    if name == 'crickets':
        x = np.zeros(int(1.4 * SR))
        for k in range(4): put(x, 0.06 * np.sin(2 * np.pi * 4600 * t_(0.25)) * (np.sin(2 * np.pi * 30 * t_(0.25)) > 0) * np.sin(np.pi * np.linspace(0, 1, int(0.25 * SR))), 0.05 + k * 0.33)
        return x
    if name == 'puff': return 0.18 * filt(noise(0.35), 'lowpass', 1200) * np.sin(np.pi * np.linspace(0, 1, int(0.35 * SR)))
    if name == 'yawn': t = t_(1.2); f = 260 * np.exp(-t * 0.5); s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)); return 0.1 * filt(s, 'bandpass', [500, 1400]) * np.sin(np.pi * np.linspace(0, 1, len(t)))
    if name == 'tick_up':
        x = np.zeros(int(3.8 * SR))
        for k in range(18): put(x, tone(700 + k * 45, 0.06, 40, 0.12), k * 0.2)
        return x
    if name == 'alarm': x = np.zeros(int(0.8 * SR)); [put(x, tone(f, 0.18, 2, 0.15), i * 0.2) for i, f in enumerate([1250, 950, 1250, 950])]; return x
    if name == 'thud': return thump(0.8, 120, 38, 0.35)
    if name == 'zip': ts = np.cumsum(np.geomspace(0.03, 0.006, 60)); return clicks(list(ts[ts < 0.45]), 0.22, 3500)
    if name == 'bonk': return add(glide(420, 300, 0.35, 10, 0.4), clicks([0], 0.35, 900))
    if name == 'rooster':   # morning birds
        x = np.zeros(int(1.2 * SR))
        for k, (a, b) in enumerate([(2600, 3800), (3000, 4200), (2400, 3600), (2900, 4100)]): put(x, glide(a, b, 0.12, 6, 0.08), 0.1 + k * 0.22)
        return x
    if name == 'sting': return np.zeros(10)   # the music carries the final sting
    raise KeyError(name)

def sfx(cues):
    x = np.zeros(N); gain = {'wind_gust': 0.9, 'slam': 0.9, 'thud': 0.8, 'tick_up': 0.7, 'crickets': 1.0}
    for name, at in cues: put(x, make(name), at, gain.get(name, 0.8))
    # room tone: wind while windows are open
    return x

if __name__ == '__main__':
    cues = json.load(open(sys.argv[1] if len(sys.argv) > 1 else 'sfx.json'))
    m = music(); m /= np.max(np.abs(m)) + 1e-9; sf.write('music.wav', (0.5 * m[:int(DUR * SR)]).astype(np.float32), SR)
    s = sfx(cues); s /= max(1.0, np.max(np.abs(s))); sf.write('sfx.wav', s[:int(DUR * SR)].astype(np.float32), SR)
    print('music.wav + sfx.wav', DUR, 's,', len(cues), 'cues')
