"""상세페이지를 와디즈 심사·업로드용 조각 이미지로 캡처 (10/30, capture_upload.py 를 고쳐 만듦)

자르는 규칙
1) 섹션마다 따로 자름
2) 섹션 안에서도 배경색이 가로 전체로 바뀌는 줄이 있으면 거기서 자름
3) 그래도 2,500px(완성 이미지 기준)보다 길면 글자·그림이 없는 빈 줄에서 더 자름
4) 움직이는 곳(GIF·반복 효과)은 미리 찾아서 그 줄은 절대 자르지 않음

화질
- 움직임 없는 조각 → JPG, 가로 1,200px (휴대폰 화면 3배율에 맞춰 선명하게)
- 움직이는 조각 → GIF, 가로 860px, 4MB 미만 (와디즈 GIF 한도)

실행: (미리보기 서버가 켜진 상태에서)
  python tools/capture_review.py <출력 폴더> [섹션 cap ...]
파일 이름: <순서 2자리>_<섹션 cap>[_조각].jpg|gif → 이름 순서대로 올리면 이어짐
"""
import io, sys, time, pathlib, subprocess, shutil, tempfile, base64
import numpy as np
from PIL import Image
import imageio_ffmpeg
from playwright.sync_api import sync_playwright

OUT = pathlib.Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
ONLY = sys.argv[2:]
W = 860                      # 미리보기 화면 폭 (페이지가 2.15배로 그려짐)
JPG_W = 1200                 # 정지 조각 저장 폭
DPR = JPG_W / W
MAX_OUT = 2500               # 완성 이미지 최대 높이(px)
MAXH = int(MAX_OUT / DPR)    # 화면 기준 최대 높이 (≈1,790)
MINH = 260                   # 너무 얇은 조각은 만들지 않음
SECS, FPS, LIMIT = 3.0, 15, 3_900_000
FF = imageio_ffmpeg.get_ffmpeg_exe()


def rows_info(img):
    a = np.asarray(img.convert('RGB')).astype(int)
    flat = (a.max(axis=1) - a.min(axis=1)).max(axis=1) < 7   # 가로 한 줄이 한 색
    color = a.mean(axis=1)                                     # 줄 평균색
    return flat, color


def motion_rows(shots, pad=24):
    """몇 장을 시간차로 찍어 달라지는 줄 = 움직이는 곳 (위아래 여유 pad)"""
    base = np.asarray(shots[0]).astype(int)
    m = np.zeros(base.shape[0], bool)
    for s in shots[1:]:
        d = np.abs(np.asarray(s).astype(int) - base).max(axis=(1, 2)) > 14
        m |= d
    idx = np.where(m)[0]
    out = np.zeros_like(m)
    for y in idx:
        out[max(0, y - pad):y + pad + 1] = True
    return out


def plan_cuts(still, moving):
    flat, color = rows_info(still)
    H = len(flat)
    ok = flat & ~moving
    # 2) 배경색이 바뀌는 경계: 위·아래 줄이 모두 한 색인데 색이 다름
    hard = [y + 1 for y in range(H - 1)
            if ok[y] and ok[y + 1] and np.abs(color[y] - color[y + 1]).max() > 10]
    # 3) 빈 띠(6px 이상) 가운데
    bands, y = [], 0
    while y < H:
        if ok[y]:
            s = y
            while y < H and ok[y]: y += 1
            if y - s >= 6: bands.append((s + y) // 2)
        y += 1
    cuts, start = [], 0
    for c in hard:  # 배경 경계는 먼저 자름 (너무 얇은 조각이 생기면 건너뜀)
        if c - start >= MINH and H - c >= MINH:
            cuts.append(c); start = c
    # 긴 조각은 빈 띠에서 더 자름
    final, start = [], 0
    for end in cuts + [H]:
        while end - start > MAXH:
            cand = [b for b in bands if start + MINH <= b <= start + MAXH and end - b >= MINH]
            if cand:
                cut = cand[-1]
            else:  # 빈 띠가 없으면 움직이지 않는 줄 아무 곳이나
                rows = [r for r in range(start + MINH, min(start + MAXH, end - MINH)) if not moving[r]]
                cut = rows[-1] if rows else start + MAXH
            final.append((start, cut)); start = cut
        final.append((start, end)); start = end
    return final


def save_gif(frames, stamps, path):
    tmp = pathlib.Path(tempfile.mkdtemp())
    t0 = stamps[0]
    for fps in (FPS, 12, 10):
        for f in tmp.glob('*.png'): f.unlink()
        n = int(SECS * fps)
        for k in range(n):
            t = t0 + k / fps
            i = max([j for j in range(len(stamps)) if stamps[j] <= t] or [0])
            frames[i].save(tmp / f'f_{k:04d}.png')
        for colors in (256, 192, 128, 96):
            vf = (f'split[a][b];[a]palettegen=max_colors={colors}:stats_mode=diff[p];'
                  f'[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle')
            subprocess.run([FF, '-y', '-loglevel', 'error', '-framerate', str(fps), '-i', str(tmp / 'f_%04d.png'),
                            '-vf', vf, '-loop', '0', str(path)], check=True)
            if path.stat().st_size < LIMIT:
                shutil.rmtree(tmp)
                return f'GIF {fps}fps {colors}색'
    shutil.rmtree(tmp)
    return f'GIF {fps}fps {colors}색 (4MB 넘음 — 더 잘라야 함)'


def scroll_to(pg, cap, y0):
    pg.evaluate(f"window.scrollTo(0, document.querySelector('[data-cap=\"{cap}\"]').getBoundingClientRect().top + scrollY + {y0})")


with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': W, 'height': 1200})                           # 분석·GIF용 (860폭)
    hi = b.new_page(viewport={'width': W, 'height': 1200}, device_scale_factor=DPR)  # JPG용 (1,200폭)
    for page in (pg, hi):
        page.goto('http://localhost:5179/', wait_until='networkidle'); page.wait_for_timeout(1500)
        for _ in range(60): page.mouse.wheel(0, 1500); page.wait_for_timeout(30)  # 화면에 들어와야 켜지는 효과 미리 켜기
    caps = pg.evaluate("[...document.querySelectorAll('main [data-cap]')].filter(e => e.parentElement.tagName === 'MAIN').map(e => e.dataset.cap)")
    no = 0
    for cap in caps:
        no += 1
        if ONLY and cap not in ONLY: continue
        h = int(pg.evaluate(f"document.querySelector('[data-cap=\"{cap}\"]').getBoundingClientRect().height"))
        hh = min(h, 9000)
        pg.set_viewport_size({'width': W, 'height': hh}); scroll_to(pg, cap, 0); pg.wait_for_timeout(1500)
        shots = []
        for _ in range(6):  # 3초 동안 6장 → 움직이는 줄 찾기
            shots.append(Image.open(io.BytesIO(pg.screenshot(clip={'x': 0, 'y': 0, 'width': W, 'height': hh}))).convert('RGB'))
            pg.wait_for_timeout(520)
        moving = motion_rows(shots)
        parts = plan_cuts(shots[0], moving)
        for k, (y0, y1) in enumerate(parts):
            ch = y1 - y0
            name = f'{no:02d}_{cap.split("_", 1)[1]}' + (f'_{k + 1}' if len(parts) > 1 else '')
            if moving[y0:y1].any():  # 움직이는 조각 → GIF
                pg.set_viewport_size({'width': W, 'height': ch}); scroll_to(pg, cap, y0); pg.wait_for_timeout(600)
                frames, stamps = [], []
                cdp = pg.context.new_cdp_session(pg)
                def on_frame(ev):
                    frames.append(Image.open(io.BytesIO(base64.b64decode(ev['data']))).convert('RGB'))
                    stamps.append(ev['metadata']['timestamp'])
                    try: cdp.send('Page.screencastFrameAck', {'sessionId': ev['sessionId']})
                    except Exception: pass
                cdp.on('Page.screencastFrame', on_frame)
                cdp.send('Page.startScreencast', {'format': 'png', 'everyNthFrame': 1, 'maxWidth': W, 'maxHeight': ch})
                t0 = time.time()
                while time.time() - t0 < SECS + 0.3: pg.wait_for_timeout(50)
                cdp.send('Page.stopScreencast'); cdp.detach()
                if not frames:
                    frames.append(Image.open(io.BytesIO(pg.screenshot())).convert('RGB')); stamps.append(time.time())
                base = np.asarray(frames[0]).astype(int)
                if all(np.abs(np.asarray(f).astype(int) - base).max() < 12 for f in frames[1:]):
                    moving[y0:y1] = False  # 실제로는 안 움직임 → 아래에서 JPG로
                else:
                    path = OUT / f'{name}.gif'
                    kind = save_gif(frames, stamps, path)
                    px = ch
            if not moving[y0:y1].any():
                # 정지 조각 → 1,200폭 JPG
                hi.set_viewport_size({'width': W, 'height': ch}); scroll_to(hi, cap, y0); hi.wait_for_timeout(700)
                img = Image.open(io.BytesIO(hi.screenshot())).convert('RGB')
                path = OUT / f'{name}.jpg'
                img.save(path, quality=92, subsampling=0)
                kind, px = 'JPG', img.height
            print(f'{path.name}: {px}px · {kind} · {path.stat().st_size / 1024 / 1024:.1f}MB', flush=True)
    b.close()
