"""v3 상세페이지를 '섹션 하나 = 이미지 한 장'으로 캡처 (10/30)

와디즈 에디터는 이미지 사이에 흰 간격을 넣고, 세로 길이 제한은 없고, 용량만 10MB까지
- 움직이는 것이 없는 섹션 → JPG 한 장
- 섹션 안에 자르는 띠(data-cut, 바탕이 흰색으로 풀리는 곳)가 있으면 그 가운데 흰 줄에서 나눔 → _1, _2 …
- 움직이는 것이 있는 섹션(조각) → 통째로 GIF 한 장
  v3는 모든 반복 효과가 공통 박자(3초)의 배수라, 섹션의 한 바퀴 = 3초 또는 6초
  한 바퀴 길이는 추측하지 않음: 페이지가 적어 둔 값(data-loop)과 페이지 속 짤 길이 중 가장 긴 것
- 페이지 시계를 멈추고 1/20초씩 직접 넘기며 찍음 → 웹과 같은 속도, 끝과 처음이 정확히 이어짐
- 페이지 속 짤은 원본 프레임을 실제 시간에 맞춰 끼워 넣음 (두 색 바탕으로 가장자리 섞임까지 계산 → 마젠타 없음)
- 프레임 시간은 저장 뒤 GIF 안에 정확한 값으로 고쳐 씀 (ffmpeg는 1/25초로 반올림함)

실행: (미리보기 서버가 켜진 상태에서)
  python tools/capture_v3.py <출력 폴더> [섹션 cap ...]
파일 이름: <순서 2자리>_<섹션 이름>.jpg|gif → 이름 순서대로 올리면 됨
"""
import io, sys, math, pathlib, subprocess, shutil, tempfile
import numpy as np
from PIL import Image
import imageio_ffmpeg
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')
OUT = pathlib.Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
ONLY = sys.argv[2:]
URL = 'http://localhost:5179/v3.html?cap'
W = 860                      # 화면 폭 = 저장 폭 (페이지가 2.15배로 그려짐)
STEP = 50                    # 1초 20장
BEAT = 3000                  # v3 공통 박자
LIMIT = 9_500_000            # 와디즈 10MB 이하 (여유)
PUBLIC = pathlib.Path(__file__).resolve().parent.parent / 'public'
FF = imageio_ffmpeg.get_ffmpeg_exe()

# ───────── 시계 ─────────
STEP_JS = """(t) => {
  window.__capT = window.__capT || new Map();
  for (const a of document.getAnimations()) {
    if (a.playState === 'finished') continue;
    // 새로 생긴 효과: 시작 시각이 엉뚱하면(페이지 시계와 어긋남) 지금 막 시작한 것으로
    if (!window.__capT.has(a)) { const c = a.currentTime; window.__capT.set(a, (c == null || Math.abs(c) > 1e7 ? 0 : c) - t); a.pause(); }
    const want = window.__capT.get(a) + t;
    const end = a.effect ? a.effect.getComputedTiming().endTime : Infinity;
    if (Number.isFinite(end) && want >= end) { a.finish(); window.__capT.delete(a); continue; }
    a.currentTime = want;
  } }"""
CLOCK = {'t': 0}


def tick(pg, ms):
    CLOCK['t'] += ms
    pg.clock.run_for(int(round(ms)))
    pg.evaluate(STEP_JS, CLOCK['t'])


def settle(pg, ms):
    for _ in range(int(ms // 100)): tick(pg, 100)
    pg.wait_for_timeout(120)


def shot(pg, h):
    return np.asarray(Image.open(io.BytesIO(pg.screenshot(clip={'x': 0, 'y': 0, 'width': W, 'height': h}))).convert('RGB'))


# ───────── 페이지 속 짤 ─────────
GIF_CACHE, FIT_CACHE = {}, {}


def gif_frames(src):
    if src not in GIF_CACHE:
        g = Image.open(PUBLIC / src.lstrip('./'))
        fr, du = [], []
        for k in range(g.n_frames):
            g.seek(k); fr.append(g.convert('RGB')); du.append(g.info.get('duration', 100))
        GIF_CACHE[src] = (fr, du)
    return GIF_CACHE[src]


def gif_index(src, t_ms):
    du = gif_frames(src)[1]
    t = t_ms % sum(du)
    for k, d in enumerate(du):
        if t < d: return k
        t -= d
    return len(du) - 1


def fitted(src, k, w, h, mode):
    """짤의 k번째 장을 칸 크기에 맞춘 것 (같은 장은 한 번만 계산)"""
    key = (src, k, w, h, mode)
    if key not in FIT_CACHE:
        img = gif_frames(src)[0][k]; iw, ih = img.size
        sc = (max if mode == 'cover' else min)(w / iw, h / ih)
        nw, nh = max(1, round(iw * sc)), max(1, round(ih * sc))
        out = Image.new('RGB', (w, h)); ox, oy = (w - nw) // 2, (h - nh) // 2
        out.paste(img.resize((nw, nh), Image.LANCZOS), (ox, oy))
        cover = np.zeros((h, w), bool); cover[max(0, oy):oy + nh, max(0, ox):ox + nw] = True
        FIT_CACHE[key] = (np.asarray(out).astype(np.float32), cover)
    return FIT_CACHE[key]


HIDE_JS = """([cap, y0, y1]) => {
  const sec = document.querySelector(`[data-cap="${cap}"]`); const top = sec.getBoundingClientRect().top + y0;
  const out = [];
  for (const i of sec.querySelectorAll('img')) {
    const src = i.getAttribute('src') || ''; if (!src.toLowerCase().endsWith('.gif')) continue;
    const r = i.getBoundingClientRect(); if (r.width < 2 || r.bottom - top <= 0 || r.top - top >= y1 - y0) continue;
    out.push({src, x: r.left, y: r.top - top, w: r.width, h: r.height, fit: getComputedStyle(i).objectFit});
    i.dataset.capHide = '1'; i.style.opacity = '0';
    const p = i.parentElement; p.dataset.capBg = p.style.background; p.style.background = '#FF00FF';
  }
  return out; }"""
PAINT_JS = """(c) => { for (const i of document.querySelectorAll('main img[data-cap-hide]')) i.parentElement.style.background = c; }"""
SHOW_JS = """() => { for (const i of document.querySelectorAll('main img[data-cap-hide]')) {
  i.style.opacity = ''; delete i.dataset.capHide; const p = i.parentElement; p.style.background = p.dataset.capBg || ''; delete p.dataset.capBg; } }"""
LOOP_JS = """([cap, y0, y1]) => { const sec = document.querySelector(`[data-cap="${cap}"]`); const top = sec.getBoundingClientRect().top;
  return Math.max(0, ...[...sec.querySelectorAll('[data-loop]')].filter(e => { const r = e.getBoundingClientRect(); return r.bottom - top > y0 && r.top - top < y1; }).map(e => +e.dataset.loop)); }"""
LOOPS_JS = """([cap, y0, y1]) => { const sec = document.querySelector(`[data-cap="${cap}"]`); const top = sec.getBoundingClientRect().top;
  return [...sec.querySelectorAll('[data-loop]')].filter(e => { const r = e.getBoundingClientRect(); return r.bottom - top > y0 && r.top - top < y1; }).map(e => +e.dataset.loop); }"""
CUTS_JS = """(cap) => { const sec = document.querySelector(`[data-cap="${cap}"]`); const top = sec.getBoundingClientRect().top;
  return [...sec.querySelectorAll('[data-cut]')].map(e => { const r = e.getBoundingClientRect(); return Math.round((r.top + r.bottom) / 2 - top); }); }"""


# ───────── 저장 ─────────
def set_gif_delays(path, delays_cs):
    """GIF 안 각 장의 표시 시간(1/100초)을 직접 고쳐 씀"""
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


def to_cs(durs):
    cs, acc = [], 0.0  # 누적 반올림으로 전체 길이 보존
    for d in durs:
        nxt = acc + d / 10; cs.append(round(nxt) - round(acc)); acc = nxt
    return cs


def encode(tmp, keep, durs, path):
    """화질 좋은 설정부터 차례로, 10MB 안에 들어가는 첫 설정으로 저장"""
    ladder = [(256, 'full', 'sierra2_4a'), (256, 'full', 'bayer:bayer_scale=5'), (256, 'diff', 'bayer:bayer_scale=5'),
              (224, 'diff', 'bayer:bayer_scale=4'), (192, 'diff', 'bayer:bayer_scale=4'), (160, 'diff', 'bayer:bayer_scale=3')]
    for step in (1, 2):  # 그래도 크면 장수만 반으로 (시간은 그대로)
        idx = list(range(0, len(keep), step))
        dd = [sum(durs[i:i + step]) for i in idx]
        lst = tmp / 'list.txt'
        lst.write_text(''.join(f"file '{keep[i].as_posix()}'\n" for i in idx), encoding='utf-8')
        for colors, stats, dither in ladder:
            vf = (f'split[a][b];[a]palettegen=max_colors={colors}:stats_mode={stats}[p];'
                  f'[b][p]paletteuse=dither={dither}:diff_mode=rectangle')
            subprocess.run([FF, '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-r', '20', '-i', str(lst),
                            '-vf', vf, '-loop', '0', str(path)], check=True)
            set_gif_delays(path, to_cs(dd))
            if path.stat().st_size < LIMIT:
                return f'GIF {colors}색 {sum(dd) / 1000:.2f}초 한 바퀴 ({len(idx)}장)'
    return f'GIF {colors}색 (10MB 넘음!)'


def capture_piece(cap, y0, y1, name):
    h = y1 - y0
    pg.set_viewport_size({'width': W, 'height': h})
    pg.evaluate(f"window.scrollTo(0, document.querySelector('[data-cap=\"{cap}\"]').getBoundingClientRect().top + scrollY + {y0})")
    settle(pg, 2500)
    gifs = pg.evaluate(HIDE_JS, [cap, y0, y1]); pg.evaluate(SHOW_JS)
    # 움직이는 것이 있는지: 1.5초 동안 0.25초마다 비교
    base = shot(pg, h); moving = bool(gifs)
    for _ in range(6):
        if moving: break
        tick(pg, 250); pg.wait_for_timeout(15)
        moving = np.abs(shot(pg, h).astype(np.int16) - base).max() > 14
    if not moving:
        Image.fromarray(shot(pg, h)).save(OUT / f'{name}.jpg', quality=93, subsampling=0)
        print(f'{name}.jpg: {h}px · JPG · {(OUT / f"{name}.jpg").stat().st_size / 1e6:.1f}MB', flush=True)
        return

    gifs = pg.evaluate(HIDE_JS, [cap, y0, y1])
    loops = [BEAT] + [int(x) for x in pg.evaluate(LOOPS_JS, [cap, y0, y1])] + [sum(gif_frames(g['src'])[1]) for g in gifs]
    loop = math.lcm(*[round(x / 50) * 50 for x in loops if x > 0])  # 효과마다 한 바퀴 길이의 최소공배수 → 모두 처음으로 돌아오는 때
    if loop > 12000: loop = math.ceil(max(loops) / BEAT) * BEAT; print(f'  ! {cap}: 반복 길이가 맞지 않아 {loop}ms로 찍음 {loops}', flush=True)
    # 박자의 시작점에서 찍기 시작 → 첫 장이 효과의 처음 모습 (시계 기준 효과는 페이지 시각 % 박자로 움직임)
    now = pg.evaluate('performance.now()')
    if now % loop > 1: tick(pg, loop - now % loop); pg.wait_for_timeout(30)
    MAG = np.array([255, 0, 255], np.float32)
    if gifs:
        pg.wait_for_timeout(80); mag = shot(pg, h).astype(np.float32)
        pg.evaluate(PAINT_JS, '#00FF00'); pg.wait_for_timeout(80); grn = shot(pg, h).astype(np.float32)
        pg.evaluate(PAINT_JS, '#FF00FF'); pg.wait_for_timeout(80)
        alpha = np.clip((grn[..., 1] - mag[..., 1]) / 255.0, 0, 1); del mag, grn
        boxes = []
        for g in gifs:  # 짤 칸 경계가 소수점에 걸려도 덮이게 바깥쪽으로 반올림
            x, y = math.floor(g['x']), math.floor(g['y'])
            boxes.append((g, x, y, math.ceil(g['x'] + g['w']) - x, math.ceil(g['y'] + g['h']) - y))

    tmp = pathlib.Path(tempfile.mkdtemp()); keep, durs, prev = [], [], None
    first = None
    for k in range(loop // STEP):
        if k: tick(pg, STEP); pg.wait_for_timeout(15)
        img = shot(pg, h)
        if gifs:
            layer = np.zeros((h, W, 3), np.float32); have = np.zeros((h, W), bool)
            for g, x, y, w, gh in boxes:
                fr, cov = fitted(g['src'], gif_index(g['src'], k * STEP), w, gh, 'contain' if g['fit'] == 'contain' else 'cover')
                ya, yb, xa, xb = max(0, y), min(h, y + gh), max(0, x), min(W, x + w)
                layer[ya:yb, xa:xb] = fr[ya - y:yb - y, xa - x:xb - x]
                have[ya:yb, xa:xb] = cov[ya - y:yb - y, xa - x:xb - x]
            a = (alpha * have)[..., None]
            img = np.clip(np.rint(img.astype(np.float32) - a * MAG + a * layer), 0, 255).astype(np.uint8)
        if first is None: first = img
        if prev is not None and np.abs(img.astype(np.int16) - prev).max() <= 3:
            durs[-1] += STEP; continue
        f = tmp / f'f_{len(keep):04d}.png'; Image.fromarray(img).save(f, compress_level=1)
        keep.append(f); durs.append(STEP); prev = img
    pg.evaluate(SHOW_JS)
    # 이음새 점검: 마지막 장 → 첫 장 차이가 보통 한 장 차이와 비슷해야 함
    seam = float(np.abs(prev.astype(np.int16) - first).mean())
    path = OUT / f'{name}.gif'
    kind = encode(tmp, keep, durs, path) if len(keep) > 1 else 'GIF 1장(움직임 없음?)'
    shutil.rmtree(tmp, ignore_errors=True)
    print(f'{name}.gif: {h}px · {kind} · {path.stat().st_size / 1e6:.1f}MB · 이음새 {seam:.2f}', flush=True)


# ───────── 실행 ─────────
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': W, 'height': 1200})
    pg.clock.install()
    pg.goto(URL, wait_until='networkidle'); pg.wait_for_timeout(1500)
    for _ in range(60): pg.mouse.wheel(0, 1500); pg.wait_for_timeout(30)  # 화면에 들어와야 켜지는 효과 미리 켜기
    pg.clock.pause_at(pg.evaluate('Date.now()') + 50)
    caps = pg.evaluate("[...document.querySelectorAll('main [data-cap]')].filter(e => !e.querySelector('[data-cap]')).map(e => e.dataset.cap)")
    for no, cap in enumerate(caps, 1):
        if ONLY and cap not in ONLY: continue
        H = int(round(pg.evaluate(f"document.querySelector('[data-cap=\"{cap}\"]').getBoundingClientRect().height")))
        cuts = [0] + sorted(pg.evaluate(CUTS_JS, cap)) + [H]
        for part, (y0, y1) in enumerate(zip(cuts, cuts[1:]), 1):
            name = f'{no:02d}_{cap.split("_", 1)[1]}' + (f'_{part}' if len(cuts) > 2 else '')
            capture_piece(cap, y0, y1, name)
    b.close()
