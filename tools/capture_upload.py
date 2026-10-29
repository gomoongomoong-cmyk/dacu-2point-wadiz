"""상세페이지를 와디즈 업로드용 이미지로 캡처 (최종 수정 후에도 이걸로 다시 뽑음)

- 가로 860px(와디즈 상세 폭). 긴 섹션은 글자·그림이 없는 빈 여백 줄에서만 잘라 1,100px 안팎 조각으로
- 움직이는 조각 → GIF (스크린캐스트로 받아 초당 15장 고르게, 4MB 미만)
- 움직임이 없는 조각 → JPG (품질 95)
- 같은 섹션 안에서 연달아 붙은 JPG 조각은 끝에 한 장으로 합침(최대 3,000px, merge_static.py)
- 파일 이름: <섹션 cap>[_조각 번호].gif|jpg  → 이름 순서대로 올리면 이어짐

실행: (상세페이지 미리보기 서버가 켜진 상태에서)
  python tools/capture_upload.py <출력 폴더> [섹션 cap ...]   (cap을 주면 그 섹션만)
"""
import io, sys, time, pathlib, subprocess, shutil, tempfile, base64
import numpy as np
from PIL import Image
import imageio_ffmpeg
from playwright.sync_api import sync_playwright

OUT = pathlib.Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
ONLY = sys.argv[2:]
W, MAXH, MINH, SECS, FPS, LIMIT = 860, 1100, 520, 3.0, 15, 3_900_000
FF = imageio_ffmpeg.get_ffmpeg_exe()


def cuts_for(img):
    """가로로 한 색인 빈 줄이 6px 이상 이어지는 띠에서만 자름 → 그림·글자가 잘리지 않음
    1100px 안에서 가장 아래 띠, 없으면 1600px까지 넓혀 찾고, 그래도 없으면 그때만 1100에서 자름"""
    a = np.asarray(img.convert('RGB')).astype(int)
    flat = (a.max(axis=1) - a.min(axis=1)).max(axis=1) < 7
    H = len(flat); bands, y = [], 0
    while y < H:
        if flat[y]:
            s = y
            while y < H and flat[y]: y += 1
            if y - s >= 6: bands.append(((s + y) // 2, y - s))
        y += 1
    out, start = [], 0
    while H - start > MAXH:
        cand = [c for c, w in bands if start + MINH <= c <= start + MAXH]
        if not cand:
            cand = [c for c, w in bands if start + MAXH < c <= start + 1600]
            cand = cand[:1]
        cut = cand[-1] if cand else start + MAXH
        if H - cut < 200:  # 끝에 너무 작은 조각이 남으면 그냥 붙임
            break
        out.append((start, cut)); start = cut
    out.append((start, H))
    return out


def is_static(frames):
    """처음과 다른 프레임이 하나도 없으면 정지 화면"""
    base = np.asarray(frames[0]).astype(int)
    return all(np.abs(np.asarray(f).astype(int) - base).max() < 12 for f in frames[1:])


def encode(frames, stamps, path):
    if is_static(frames):  # 움직임 없음 → JPG
        path = path.with_suffix('.jpg')
        frames[0].save(path, quality=95, subsampling=0)
        return path, 1, 0
    tmp = pathlib.Path(tempfile.mkdtemp())
    t0 = stamps[0]
    n = int(SECS * FPS)
    for k in range(n):  # 일정한 간격으로 다시 고름 (그 시점에 화면에 떠 있던 프레임) → 고른 재생
        t = t0 + k / FPS
        i = max([j for j in range(len(stamps)) if stamps[j] <= t] or [0])
        frames[i].save(tmp / f'f_{k:04d}.png')
    for colors in (256, 192, 128, 96):
        vf = (f'split[a][b];[a]palettegen=max_colors={colors}:stats_mode=diff[p];'
              f'[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle')
        subprocess.run([FF, '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', str(tmp / 'f_%04d.png'),
                        '-vf', vf, '-loop', '0', str(path)], check=True)
        if path.stat().st_size < LIMIT: break
    shutil.rmtree(tmp)
    return path, n, colors


with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': W, 'height': 1200})
    pg.goto('http://localhost:5179/', wait_until='networkidle'); pg.wait_for_timeout(1500)
    caps = pg.evaluate("[...document.querySelectorAll('main [data-cap]')].map(e => e.dataset.cap)")
    sel = lambda c: f"document.querySelector('[data-cap=\"{c}\"]')"
    for cap in caps:
        if ONLY and cap not in ONLY: continue
        h = int(pg.evaluate(f"{sel(cap)}.getBoundingClientRect().height"))
        pg.set_viewport_size({'width': W, 'height': min(h, 8000)})
        pg.evaluate(f"window.scrollTo(0, {sel(cap)}.getBoundingClientRect().top + scrollY)"); pg.wait_for_timeout(900)
        still = Image.open(io.BytesIO(pg.screenshot(clip={'x': 0, 'y': 0, 'width': W, 'height': min(h, 8000)})))
        parts = cuts_for(still)
        for k, (y0, y1) in enumerate(parts):
            ch = y1 - y0
            pg.set_viewport_size({'width': W, 'height': ch})
            pg.evaluate(f"window.scrollTo(0, {sel(cap)}.getBoundingClientRect().top + scrollY + {y0})"); pg.wait_for_timeout(600)
            # 스크린캐스트: 브라우저가 그린 화면을 그때그때 받아 옴 (스크린샷보다 훨씬 촘촘)
            frames, stamps = [], []
            cdp = pg.context.new_cdp_session(pg)
            def on_frame(ev):
                frames.append(Image.open(io.BytesIO(base64.b64decode(ev['data']))).convert('RGB'))
                stamps.append(ev['metadata']['timestamp'])
                try: cdp.send('Page.screencastFrameAck', {'sessionId': ev['sessionId']})
                except Exception: pass  # 녹화를 멈춘 뒤 늦게 온 프레임
            cdp.on('Page.screencastFrame', on_frame)
            cdp.send('Page.startScreencast', {'format': 'png', 'everyNthFrame': 1, 'maxWidth': W, 'maxHeight': ch})
            t0 = time.time()
            while time.time() - t0 < SECS + 0.3:
                pg.wait_for_timeout(50)
            cdp.send('Page.stopScreencast'); cdp.detach()
            if not frames: frames.append(Image.open(io.BytesIO(pg.screenshot())).convert('RGB')); stamps.append(time.time())
            suffix = f'_{k + 1}' if len(parts) > 1 else ''
            path = OUT / f'{cap}{suffix}.gif'
            path, n, colors = encode(frames, stamps, path)
            kind = 'JPG' if path.suffix == '.jpg' else f'GIF {FPS}fps {n}장 · {colors}색'
            print(f'{path.name}: {ch}px · {kind} · {path.stat().st_size / 1024 / 1024:.1f}MB', flush=True)
    b.close()

# 연달아 붙은 JPG 조각은 한 장으로 합쳐 파일 수를 줄임
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from merge_static import merge
merge(OUT)
