"""상세페이지를 와디즈 심사·업로드용 조각 이미지로 캡처 (10/30)

나누는 규칙 (섹션마다)
- 움직이는 것이 없음  → JPG. 2,500px보다 길 때만 빈 줄에서 나눔
- 움직이는 것이 하나 → 섹션 통째로 GIF 한 장 (2,500px·4MB가 넘을 때만 위아래 정지 부분을 JPG로 떼어 냄)
- 움직이는 것이 둘 이상 → 둘 사이 빈 줄에서 나눠, 조각 하나에 움직이는 것 하나씩
  (페이지에 들어간 짤 하나 = 움직이는 것 하나, 가까이 붙은 작은 효과들은 한 묶음)

움직임·속도
- 페이지 시계를 멈추고 직접 넘기며 찍음 → 웹과 같은 속도 (JS는 가짜 시계, CSS·WAAPI는 애니메이션 시간을 직접 맞춤)
- 페이지에 들어간 짤은 원본 프레임을 원본 시간 그대로 끼워 넣음 (둥근 모서리·글자 가장자리는 두 색 바탕으로 섞임까지 계산)
- 한 바퀴만 찍어서 끝과 처음이 이어지게 반복: 짤은 짤 길이, 나머지 효과는 8초를 찍어 반복 주기를 찾아냄
- 프레임 시간은 ffmpeg가 1/25초로 반올림하므로, 저장 뒤 GIF 안의 시간을 정확한 값으로 고쳐 씀 (덜컹거림 없음)

실행: (미리보기 서버가 켜진 상태에서)
  python tools/capture_review.py <출력 폴더> [섹션 cap ...]
파일 이름: <순서 2자리>_<섹션 이름>[_조각].jpg|gif → 이름 순서대로 올리면 이어짐
"""
import io, sys, math, pathlib, subprocess, shutil, tempfile
import numpy as np
from PIL import Image
import imageio_ffmpeg
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')
OUT = pathlib.Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
ONLY = sys.argv[2:]
W = 860                      # 화면 폭 = 저장 폭 (페이지가 2.15배로 그려짐)
MAXH = 2500                  # 조각 최대 높이(px)
STEP = 50                    # 짤이 없는 효과를 찍는 간격(ms) = 1초 20장
PROBE = 9000                 # 반복 주기를 찾으려고 찍는 길이(ms) — 7초 주기까지 찾음
LIMIT = 3_900_000            # 와디즈 GIF 4MB 미만
PUBLIC = pathlib.Path(__file__).resolve().parent.parent / 'public'
FF = imageio_ffmpeg.get_ffmpeg_exe()


# ───────── 화면 분석 ─────────
def rows_info(img):
    a = np.asarray(img.convert('RGB')).astype(int)
    flat = (a.max(axis=1) - a.min(axis=1)).max(axis=1) < 7   # 가로 한 줄이 한 색
    return flat, a.mean(axis=1)


def motion_rows(shots, pad=16):
    base = np.asarray(shots[0]).astype(int)
    m = np.zeros(base.shape[0], bool)
    for s in shots[1:]:
        m |= np.abs(np.asarray(s).astype(int) - base).max(axis=(1, 2)) > 14
    out = np.zeros_like(m)
    for y in np.where(m)[0]:
        out[max(0, y - pad):y + pad + 1] = True
    return out


def runs(mask, gap=0):
    out, y, H = [], 0, len(mask)
    while y < H:
        if mask[y]:
            s = y
            while y < H and mask[y]: y += 1
            if out and s - out[-1][1] <= gap: out[-1] = (out[-1][0], y)
            else: out.append((s, y))
        y += 1
    return out


def units_of(moving, boxes, H):
    """움직이는 것 단위: 짤 칸 하나 = 하나, 나머지 효과는 160px 안으로 붙어 있으면 한 묶음"""
    units = [(max(0, int(t)), min(H, int(b) + 1)) for t, b in boxes]
    rest = moving.copy()
    for t, b in units: rest[t:b] = False
    for s, e in runs(rest, gap=160):
        if e - s >= 8: units.append((s, e))
    units.sort()
    merged = []
    for u in units:  # 겹치면 하나로
        if merged and u[0] < merged[-1][1]: merged[-1] = (merged[-1][0], max(merged[-1][1], u[1]))
        else: merged.append(u)
    return merged


def best_cut(ok, lo, hi, target):
    cand = [r for r in range(max(0, lo), min(len(ok), hi)) if ok[r]]
    return min(cand, key=lambda r: abs(r - target)) if cand else int(target)


def split_static(ok, a, b):
    """정지 부분: 2,500px 넘으면 빈 줄에서 나눔"""
    out = []
    while b - a > MAXH:  # 남은 길이를 고르게 나누는 자리에 가장 가까운 빈 줄에서
        target = a + (b - a) / math.ceil((b - a) / MAXH)
        cand = [r for r in range(a + 400, min(a + MAXH, b - 200)) if ok[r]]
        c = min(cand, key=lambda r: abs(r - target)) if cand else a + MAXH
        out.append((a, c)); a = c
    out.append((a, b))
    return out


def plan(still, moving, boxes):
    """[(y0, y1, unit)] — unit: 그 조각 안의 움직이는 것 (없으면 None)"""
    flat, _ = rows_info(still)
    H = len(flat)
    ok = flat & ~moving
    units = units_of(moving, boxes, H)
    if not units:
        return [(a, b, None) for a, b in split_static(ok, 0, H)]
    cuts = [0]
    for (s0, e0), (s1, e1) in zip(units, units[1:]):  # 두 움직임 사이 빈 줄 가운데에서
        cuts.append(best_cut(ok, e0, s1 + 1, (e0 + s1) / 2))
    cuts.append(H)
    return [(cuts[i], cuts[i + 1], units[i]) for i in range(len(units))]


# ───────── 시계 ─────────
STEP_JS = """(t) => {
  window.__capT = window.__capT || new Map();
  for (const a of document.getAnimations()) {
    if (a.playState === 'finished') continue;
    // 새로 생긴 효과: 페이지 쪽 시계 기준 시작 시각이 엉뚱하면(수천 년 앞뒤) 지금 막 시작한 것으로
    if (!window.__capT.has(a)) { const c = a.currentTime; window.__capT.set(a, (c == null || Math.abs(c) > 1e7 ? 0 : c) - t); a.pause(); }
    const want = window.__capT.get(a) + t;
    const end = a.effect ? a.effect.getComputedTiming().endTime : Infinity;
    if (Number.isFinite(end) && want >= end) { a.finish(); window.__capT.delete(a); continue; }
    a.currentTime = want;
  } }"""
CLOCK = {'t': 0}


def tick(pg, ms):
    if ms <= 0: return
    CLOCK['t'] += ms
    pg.clock.run_for(int(round(ms)))
    pg.evaluate(STEP_JS, CLOCK['t'])


def settle(pg, ms=1500):
    for _ in range(int(ms // 100)): tick(pg, 100)
    pg.wait_for_timeout(120)


def scroll_to(pg, cap, y0):
    pg.evaluate(f"window.scrollTo(0, document.querySelector('[data-cap=\"{cap}\"]').getBoundingClientRect().top + scrollY + {y0})")


def shot(pg, ch):
    return np.asarray(Image.open(io.BytesIO(pg.screenshot(clip={'x': 0, 'y': 0, 'width': W, 'height': ch}))).convert('RGB')).astype(float)


# ───────── 페이지 속 짤 ─────────
GIF_CACHE = {}


def gif_frames(src):
    if src not in GIF_CACHE:
        g = Image.open(PUBLIC / src.lstrip('./'))
        fr, du = [], []
        for k in range(g.n_frames):
            g.seek(k); fr.append(g.convert('RGB')); du.append(g.info.get('duration', 100))
        GIF_CACHE[src] = (fr, du)
    return GIF_CACHE[src]


def gif_at(src, t_ms):
    fr, du = gif_frames(src)
    t = t_ms % sum(du)
    for f, d in zip(fr, du):
        if t < d: return f
        t -= d
    return fr[-1]


def fit_into(img, w, h, mode):
    iw, ih = img.size
    sc = (max if mode == 'cover' else min)(w / iw, h / ih)
    nw, nh = max(1, round(iw * sc)), max(1, round(ih * sc))
    im = img.resize((nw, nh), Image.LANCZOS)
    out = Image.new('RGB', (w, h)); ox, oy = (w - nw) // 2, (h - nh) // 2
    out.paste(im, (ox, oy))
    cover = np.zeros((h, w), bool); cover[max(0, oy):oy + nh, max(0, ox):ox + nw] = True
    return np.asarray(out).astype(float), cover


GIF_RECTS_JS = """(cap) => {
  const sec = document.querySelector(`[data-cap="${cap}"]`); const top = sec.getBoundingClientRect().top;
  return [...sec.querySelectorAll('img')].filter(i => (i.getAttribute('src') || '').toLowerCase().endsWith('.gif'))
    .map(i => { const b = i.parentElement.getBoundingClientRect(); return [b.top - top, b.bottom - top]; }); }"""
HIDE_JS = """(ch) => {
  const out = [];
  for (const i of document.querySelectorAll('main img')) {
    const src = i.getAttribute('src') || ''; if (!src.toLowerCase().endsWith('.gif')) continue;
    const r = i.getBoundingClientRect(); if (r.bottom <= 6 || r.top >= ch - 6 || r.width < 2) continue;
    const box = i.parentElement.getBoundingClientRect();
    out.push({src, x: r.left, y: r.top, w: r.width, h: r.height, fit: getComputedStyle(i).objectFit, by: box.top, bh: box.height});
    i.dataset.capHide = '1'; i.style.opacity = '0';
    const p = i.parentElement; p.dataset.capBg = p.style.background; p.style.background = '#FF00FF';
  }
  return out; }"""
PAINT_JS = """(c) => { for (const i of document.querySelectorAll('main img[data-cap-hide]')) i.parentElement.style.background = c; }"""
SHOW_JS = """() => { for (const i of document.querySelectorAll('main img[data-cap-hide]')) {
  i.style.opacity = ''; delete i.dataset.capHide; const p = i.parentElement; p.style.background = p.dataset.capBg || ''; delete p.dataset.capBg; } }"""


LOOP_JS = """(ch) => Math.max(0, ...[...document.querySelectorAll('main [data-loop]')]
  .filter(e => { const r = e.getBoundingClientRect(); return r.bottom > 0 && r.top < ch; }).map(e => +e.dataset.loop))"""


def times_for(gifs):
    """짤이 있으면 그 짤들의 프레임이 바뀌는 순간들(가장 긴 짤 한 바퀴), 없으면 None"""
    if not gifs: return None
    total = max(sum(gif_frames(g['src'])[1]) for g in gifs)
    marks = set()
    for g in gifs:
        du = gif_frames(g['src'])[1]
        t = 0
        while t < total:
            for d in du:
                if t >= total: break
                marks.add(t); t += d
    return sorted(marks), total


def period(frames):
    """첫 장부터 다시 똑같이 반복되기 시작하는 장 수 (0.6초~7초 사이에서 가장 잘 맞는 것 중 가장 짧은 주기)"""
    a = np.stack([f[::2, ::2].astype(np.int16) for f in frames])
    N = len(a)
    live = (a.max(axis=0) - a.min(axis=0)).max(axis=-1) > 12   # 실제로 움직이는 점만 비교 (작은 효과도 정확히)
    if not live.any(): return N
    a = a[:, live]
    errs = {}
    for k in range(int(600 / STEP), N - int(1000 / STEP)):
        m = N - k
        errs[k] = float(np.abs(a[:m] - a[k:k + m]).mean())
    if not errs: return N
    lo = min(errs.values())
    for k in sorted(errs):
        if errs[k] <= lo + 0.6:  # 바로 옆 몇 장 중 가장 잘 맞는 장으로 (6.95초 → 7.00초 같은 한 장 어긋남 방지)
            return min((j for j in range(k, k + 4) if j in errs), key=lambda j: errs[j])
    return N


def effect_groups(frames):
    """움직이는 줄 묶음마다 (시작, 끝, 반복 장 수)"""
    mx, mn = frames[0].copy(), frames[0].copy()
    for f in frames[1:]: np.maximum(mx, f, out=mx); np.minimum(mn, f, out=mn)
    rows = (mx.astype(np.int16) - mn).max(axis=(1, 2)) > 12
    return [(s, e, period([f[s:e] for f in frames])) for s, e in runs(rows, gap=24) if e - s >= 4]


def capture(pg, ch, split_ok=True):
    """한 바퀴 프레임과 각 프레임 길이(ms)"""
    gifs = pg.evaluate(HIDE_JS, ch)
    MAG = np.array([255.0, 0.0, 255.0])
    st = {}
    if gifs:
        pg.wait_for_timeout(80); mag = shot(pg, ch)
        pg.evaluate(PAINT_JS, '#00FF00'); pg.wait_for_timeout(80); grn = shot(pg, ch)
        pg.evaluate(PAINT_JS, '#FF00FF'); pg.wait_for_timeout(80)
        st['alpha'] = np.clip((grn[..., 1] - mag[..., 1]) / 255.0, 0, 1)
        st['layer'] = np.zeros_like(mag); st['have'] = np.zeros(mag.shape[:2], bool)

    def frame_at(t):
        img = shot(pg, ch)
        if gifs:
            layer, have = st['layer'], st['have']
            for g in gifs:
                x, y = math.floor(g['x']), math.floor(g['y'])
                w, h = math.ceil(g['x'] + g['w']) - x, math.ceil(g['y'] + g['h']) - y
                fr, cov = fit_into(gif_at(g['src'], t), w, h, 'contain' if g['fit'] == 'contain' else 'cover')
                y0, y1, x0, x1 = max(0, y), min(ch, y + h), max(0, x), min(W, x + w)
                layer[y0:y1, x0:x1] = fr[y0 - y:y1 - y, x0 - x:x1 - x]
                have[y0:y1, x0:x1] = cov[y0 - y:y1 - y, x0 - x:x1 - x]
            a = (st['alpha'] * have)[..., None]
            img = img - a * MAG + a * layer
        return np.clip(np.rint(img), 0, 255).astype(np.uint8)

    plan_t = times_for(gifs)
    frames, durs = [], []
    if plan_t:  # 짤 프레임이 바뀌는 순간마다 한 장 (원본 시간 그대로)
        marks, total = plan_t
        prev = 0
        for t in marks:
            tick(pg, t - prev); prev = t; pg.wait_for_timeout(15)
            frames.append(frame_at(t))
        durs = [b - a for a, b in zip(marks, marks[1:] + [total])]
    else:  # 짤 없는 효과: 8초를 1/20초씩 찍고 반복 주기를 찾아 한 바퀴만
        for k in range(PROBE // STEP):
            tick(pg, STEP); pg.wait_for_timeout(15)
            frames.append(frame_at(k * STEP))
        loop = pg.evaluate(LOOP_JS, ch)  # 페이지가 반복 길이를 알려 주면(data-loop) 그 값 그대로
        n = round(loop / STEP) if loop else period(frames)
        groups = [] if loop else effect_groups(frames)
        # 반복 주기가 서로 다른 효과가 한 조각에 있으면 한 바퀴로 이어지지 않음 → 나눌 자리 알려 줌
        bad = [k for k, (_, _, p) in enumerate(groups) if p < len(frames) and min(n % p, p - n % p) > 2]
        if split_ok and bad and len(groups) > 1:
            j = bad[0] if bad[0] > 0 else 1
            pg.evaluate(SHOW_JS)
            return None, (groups[:j], groups[j:]), gifs
        frames = frames[:n]
        durs = [STEP] * n
    pg.evaluate(SHOW_JS)
    return frames, durs, gifs


# ───────── 저장 ─────────
def set_gif_delays(path, delays_cs):
    """GIF 안 각 프레임의 표시 시간(1/100초)을 직접 고쳐 씀"""
    b = bytearray(path.read_bytes())
    flags = b[10]; i = 13 + (3 * 2 ** ((flags & 7) + 1) if flags & 0x80 else 0)
    k = 0
    while i < len(b):
        c = b[i]
        if c == 0x21:
            if b[i + 1] == 0xF9 and k < len(delays_cs):
                d = max(2, int(delays_cs[k])); b[i + 4] = d & 0xFF; b[i + 5] = d >> 8; k += 1
            i += 2
            while b[i]: i += b[i] + 1
            i += 1
        elif c == 0x2C:
            fl = b[i + 9]; i += 10
            if fl & 0x80: i += 3 * 2 ** ((fl & 7) + 1)
            i += 1
            while b[i]: i += b[i] + 1
            i += 1
        else:
            break
    path.write_bytes(bytes(b))
    return k


def save_gif(frames, durs, path, max_colors=256):
    """같은 장면이 이어지면 묶어 길게, 저장 뒤 프레임 시간을 정확히 고쳐 씀"""
    keep, dd = [], []
    for f, d in zip(frames, durs):
        if keep and np.abs(f.astype(int) - keep[-1].astype(int)).max() <= 3: dd[-1] += d
        else: keep.append(f); dd.append(d)
    cs, acc = [], 0.0  # 누적 반올림으로 전체 길이 보존
    for d in dd:
        nxt = acc + d / 10; cs.append(round(nxt) - round(acc)); acc = nxt
    tmp = pathlib.Path(tempfile.mkdtemp())
    for k, f in enumerate(keep): Image.fromarray(f).save(tmp / f'f_{k:04d}.png')
    ladder = [(256, 'full', 'sierra2_4a'), (256, 'full', 'bayer:bayer_scale=5'), (256, 'diff', 'bayer:bayer_scale=5'),
              (224, 'diff', 'bayer:bayer_scale=4'), (192, 'diff', 'bayer:bayer_scale=4')]
    if max_colors < 192:
        ladder += [(160, 'diff', 'bayer:bayer_scale=3'), (128, 'diff', 'bayer:bayer_scale=3')]
    for colors, stats, dither in ladder:
        vf = (f'split[a][b];[a]palettegen=max_colors={colors}:stats_mode={stats}[p];'
              f'[b][p]paletteuse=dither={dither}:diff_mode=rectangle')
        subprocess.run([FF, '-y', '-loglevel', 'error', '-framerate', '20', '-i', str(tmp / 'f_%04d.png'),
                        '-vf', vf, '-loop', '0', str(path)], check=True)
        set_gif_delays(path, cs)
        if path.stat().st_size < LIMIT:
            shutil.rmtree(tmp)
            return True, f'GIF {colors}색 {sum(dd) / 1000:.2f}초 한 바퀴 ({len(keep)}장)'
    shutil.rmtree(tmp)
    return False, f'GIF {colors}색 (4MB 넘음)'


def merge_thin(done):
    """200px 안 되는 정지 조각은 이웃 조각에 붙임 (정지 화면이라 짤의 모든 장 위/아래에 그대로 이어 붙이면 됨)"""
    k = 0
    while k < len(done):
        y0, ch, kind, path = done[k]
        nb = [j for j in (k - 1, k + 1) if 0 <= j < len(done) and done[j][1] + ch <= MAXH
              and Image.open(done[j][3]).size[0] == W] if kind == 'JPG' and ch < 200 else []
        if not nb:
            k += 1; continue
        j = min(nb, key=lambda j: done[j][2] != 'JPG')  # 정지 조각 이웃 먼저
        strip = np.asarray(Image.open(path).convert('RGB'))
        jy, jch, jkind, jpath = done[j]
        glue = (lambda f: np.vstack([f, strip])) if j < k else (lambda f: np.vstack([strip, f]))
        if jkind == 'JPG':
            Image.fromarray(glue(np.asarray(Image.open(jpath).convert('RGB')))).save(jpath, quality=93, subsampling=0)
        else:
            g = Image.open(jpath); fr, du = [], []
            for n in range(g.n_frames):
                g.seek(n); fr.append(glue(np.asarray(g.convert('RGB')))); du.append(g.info.get('duration', 50))
            g.close(); jkind = save_gif(fr, du, jpath)[1]
        path.unlink()
        done[j] = (min(y0, jy), ch + jch, jkind, jpath); del done[k]
        k = max(0, min(j, k) - 1)
    return done


def save_jpg(pg, ch, path):
    Image.fromarray(shot(pg, ch).astype(np.uint8)).save(path, quality=93, subsampling=0)


# ───────── 실행 ─────────
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': W, 'height': 1200})
    pg.clock.install()
    pg.goto('http://localhost:5179/?cap', wait_until='networkidle'); pg.wait_for_timeout(1500)
    for _ in range(60): pg.mouse.wheel(0, 1500); pg.wait_for_timeout(30)  # 화면에 들어와야 켜지는 효과 미리 켜기
    pg.clock.pause_at(pg.evaluate('Date.now()') + 50)
    caps = pg.evaluate("[...document.querySelectorAll('main [data-cap]')].filter(e => e.parentElement.tagName === 'MAIN').map(e => e.dataset.cap)")
    no = 0
    for cap in caps:
        no += 1
        if ONLY and cap not in ONLY: continue
        h = int(pg.evaluate(f"document.querySelector('[data-cap=\"{cap}\"]').getBoundingClientRect().height"))
        hh = min(h, 9000)
        pg.set_viewport_size({'width': W, 'height': hh}); scroll_to(pg, cap, 0); settle(pg, 2500)
        shots = []
        for _ in range(12):  # 6초 동안 12장 → 움직이는 줄 찾기
            shots.append(Image.fromarray(shot(pg, hh).astype(np.uint8)))
            tick(pg, 500); pg.wait_for_timeout(20)
        moving = motion_rows(shots[2:])  # 처음 1초는 빼고 (화면에 들어올 때 한 번만 나오는 효과는 반복 효과가 아님)
        boxes = pg.evaluate(GIF_RECTS_JS, cap)
        for t, bt in boxes: moving[max(0, int(t)):min(hh, int(bt) + 1)] = True
        flat, _ = rows_info(shots[0]); ok = flat & ~moving
        queue, done = plan(shots[0], moving, boxes), []
        while queue:
            y0, y1, unit = queue.pop(0)
            ch = y1 - y0
            if unit is None:
                pg.set_viewport_size({'width': W, 'height': ch}); scroll_to(pg, cap, y0); settle(pg, 400)
                path = OUT / f'_tmp_{y0}.jpg'; save_jpg(pg, ch, path); done.append((y0, ch, 'JPG', path)); continue
            us, ue = unit
            top = best_cut(ok, us - 120, us + 1, us) if us - y0 > 200 else y0
            bot = best_cut(ok, ue, ue + 120, ue) if y1 - ue > 200 else y1
            if top - y0 < 200: top = y0
            if y1 - bot < 200: bot = y1
            if ch > MAXH:  # 2,500px 넘으면 움직이는 부분 위아래 정지 부분을 JPG로 떼어 냄
                queue[:0] = ([(a, c, None) for a, c in split_static(ok, y0, top)] if top > y0 else []) + [(top, bot, unit)] + \
                            ([(a, c, None) for a, c in split_static(ok, bot, y1)] if y1 > bot else [])
                continue
            pg.set_viewport_size({'width': W, 'height': ch}); scroll_to(pg, cap, y0); settle(pg, 600)
            frames, durs, gifs = capture(pg, ch)
            if frames is None:  # 주기가 다른 효과 둘 → 그 사이 빈 줄에서 나눠 각각 다시
                ga, gb = durs
                cut = best_cut(ok, y0 + ga[-1][1], y0 + gb[0][0] + 1, y0 + (ga[-1][1] + gb[0][0]) / 2)
                if y0 < cut < y1:
                    queue[:0] = [(y0, cut, (y0 + ga[0][0], y0 + ga[-1][1])), (cut, y1, (y0 + gb[0][0], y0 + gb[-1][1]))]
                    continue
                print(f'  ! {cap} {y0}: 주기가 다른 효과 사이에 빈 줄이 없어 그대로 찍음', flush=True)
                settle(pg, 600); frames, durs, gifs = capture(pg, ch, split_ok=False)
            if all(np.abs(f.astype(int) - frames[0].astype(int)).max() < 12 for f in frames[1:]):
                path = OUT / f'_tmp_{y0}.jpg'; save_jpg(pg, ch, path); done.append((y0, ch, 'JPG', path)); continue
            path = OUT / f'_tmp_{y0}.gif'
            fine, kind = save_gif(frames, durs, path)
            if not fine and (top > y0 or bot < y1):  # 4MB 넘으면 정지 부분을 JPG로 떼고 움직이는 부분만 다시
                path.unlink()
                queue[:0] = ([(y0, top, None)] if top > y0 else []) + [(top, bot, unit)] + ([(bot, y1, None)] if y1 > bot else [])
                continue
            if not fine and len(gifs) == 1 and gifs[0]['by'] <= 40 and gifs[0]['bh'] >= ch - 40:
                shutil.copy(PUBLIC / gifs[0]['src'].lstrip('./'), path); kind = 'GIF 원본 그대로'  # 짤 칸뿐 → 원본 파일
            elif not fine:
                fine, kind = save_gif(frames, durs, path, max_colors=160)
                step = 2
                while not fine and step <= 4:  # 사진이 통째로 바뀌는 곳: 장수만 줄이고 시간은 그대로 (2장→1장, 4장→1장)
                    fr2 = frames[::step]; du2 = [sum(durs[i:i + step]) for i in range(0, len(durs), step)]
                    fine, kind = save_gif(fr2, du2, path, max_colors=160); step *= 2
            done.append((y0, ch, kind, path))
        done = merge_thin(sorted(done))
        for k, (y0, ch, kind, path) in enumerate(done):
            name = f'{no:02d}_{cap.split("_", 1)[1]}' + (f'_{k + 1}' if len(done) > 1 else '')
            final = OUT / f'{name}{path.suffix}'
            if final.exists(): final.unlink()
            path.rename(final)
            print(f'{final.name}: {ch}px · {kind} · {final.stat().st_size / 1024 / 1024:.1f}MB', flush=True)
    b.close()
