"""11/2 받은 실사 사진·영상 → 상세페이지 v3용 이미지·짤 (public/photo/r_*)

- TV 화면은 꺼진 화면처럼 검게 (blackout.py)
- 짤은 v3 공통 박자(3초·6초) 길이, 끝 0.6초를 처음과 겹쳐 녹여 끊김 없이 반복
- 원본: wadiz/2point TV받침대 영상 (카톡으로 받은 사진 20장, 영상 7개)

실행: python tools/real_assets.py [이름 ...]
"""
import glob, pathlib, shutil, subprocess, sys, tempfile
import cv2
import numpy as np
from PIL import Image, ImageFilter, ImageOps
import imageio_ffmpeg
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from blackout import blackout, quad_mask, screen_quad

sys.stdout.reconfigure(encoding='utf-8')
ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT.parent / '2point TV받침대 영상'
OUT = ROOT / 'public' / 'photo'
FF = imageio_ffmpeg.get_ffmpeg_exe()
PHOTOS = sorted(SRC.glob('*.jpg'))
VIDEOS = sorted(SRC.glob('KakaoTalk_*.mp4'))  # 카톡 원본만 번호로 (직접 자른 영상이 섞이면 번호가 밀림)
ONLY = sys.argv[1:]


def photo(i):
    im = ImageOps.exif_transpose(Image.open(PHOTOS[i])).convert('RGB')
    return cv2.cvtColor(np.asarray(im), cv2.COLOR_RGB2BGR)


def crop(bgr, ratio, cx=0.5, cy=0.5, zoom=1.0):
    h, w = bgr.shape[:2]
    cw = min(w, h * ratio) / zoom; ch = cw / ratio
    x = int(min(max(0, cx * w - cw / 2), w - cw)); y = int(min(max(0, cy * h - ch / 2), h - ch))
    return bgr[y:y + int(ch), x:x + int(cw)]


def save_jpg(bgr, name, width):
    h, w = bgr.shape[:2]
    im = Image.fromarray(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)).resize((width, round(width * h / w)), Image.LANCZOS)
    im.save(OUT / name, quality=90, subsampling=0)
    print(f'{name}: {im.size[0]}×{im.size[1]}')


def align(src, ref):
    """src를 ref와 같은 카메라 위치로 — 돌아간 TV는 빼고 거실장·벽 특징점만 써서 (회전·이동·확대만 허용)"""
    from blackout import screen_mask
    def feats(img):
        g = cv2.cvtColor(cv2.resize(img, None, fx=0.25, fy=0.25), cv2.COLOR_BGR2GRAY)
        m = screen_mask(cv2.resize(img, None, fx=0.25, fy=0.25))
        keep = np.full(g.shape, 255, np.uint8)
        if m is not None: keep[cv2.dilate(m, np.ones((61, 61), np.uint8)) > 0] = 0  # TV와 그 둘레는 기준에서 뺌
        return cv2.ORB_create(6000).detectAndCompute(g, keep)
    k1, d1 = feats(src); k2, d2 = feats(ref)
    m = sorted(cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True).match(d1, d2), key=lambda x: x.distance)[:800]
    p1 = np.float32([k1[x.queryIdx].pt for x in m]) * 4; p2 = np.float32([k2[x.trainIdx].pt for x in m]) * 4
    A, inl = cv2.estimateAffinePartial2D(p1, p2, method=cv2.RANSAC, ransacReprojThreshold=6.0)
    print(f'  맞춤: 특징점 {int(inl.sum())}개, 이동 {A[0, 2]:.0f},{A[1, 2]:.0f}px')
    return cv2.warpAffine(src, A, (ref.shape[1], ref.shape[0]), borderMode=cv2.BORDER_REPLICATE)


def set_delays(path, cs):
    b = bytearray(path.read_bytes())
    flags = b[10]; i = 13 + (3 * 2 ** ((flags & 7) + 1) if flags & 0x80 else 0); k = 0
    while i < len(b):
        c = b[i]
        if c == 0x21:
            if b[i + 1] == 0xF9 and k < len(cs): b[i + 4] = cs[k] & 0xFF; b[i + 5] = cs[k] >> 8; k += 1
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


def clip(vi, start, length, name, ratio, width, fps=10, cx=0.5, cy=0.5, zoom=1.0, fade=0.6, limit=3_000_000, rot=None, ext_top=0.0, smooth=1.0, speed=1.0, stab=True):
    """영상 vi의 start초부터 length초 → 끊김 없이 반복하는 짤"""
    cap = cv2.VideoCapture(str(VIDEOS[vi] if isinstance(vi, int) else vi)); src_fps = cap.get(cv2.CAP_PROP_FPS) or 24
    n = round(length * fps); x = round(fade * fps)
    frs = []
    for k in range(n + x):
        cap.set(cv2.CAP_PROP_POS_FRAMES, round((start + k / fps * speed) * src_fps)); ok, fr = cap.read()  # speed<1 = 살짝 느리게(짧은 영상을 6초로)
        if not ok: raise SystemExit(f'{name}: 영상이 {start + k / fps * speed:.2f}초에서 끝남')
        frs.append(fr if rot is None else cv2.rotate(fr, rot))  # 옆으로 누워 저장된 영상은 세워서
    # 손떨림 보정: 움직이지 않는 벽·거실장 전체(돌아가는 TV와 그 둘레는 뺌)로 원근까지 맞춰 첫 프레임 위치에 고정
    #  (아래쪽만 기준으로 하면 카메라 각도가 바뀔 때 위쪽 벽이 일렁여 왜곡처럼 보임)
    orb = cv2.ORB_create(6000); bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
    def feats(f):
        sm = cv2.resize(f, None, fx=0.5, fy=0.5); g = cv2.cvtColor(sm, cv2.COLOR_BGR2GRAY)
        keep = np.full(g.shape, 255, np.uint8); q = screen_quad(sm)
        if q is not None:
            cv2.fillConvexPoly(keep, np.round(q).astype(np.int32), 0)
            keep = cv2.erode(keep, np.ones((61, 61), np.uint8))  # TV 둘레(손·다리 포함)도 뺌
        return orb.detectAndCompute(g, keep)
    k0, d0 = feats(frs[0]); H, W = frs[0].shape[:2]
    Hs = [np.eye(3)]
    for i in range(1, len(frs)):
        k1, d1 = feats(frs[i]); mt = bf.match(d1, d0)
        M, _ = cv2.findHomography(np.float32([k1[x.queryIdx].pt for x in mt]) * 2, np.float32([k0[x.trainIdx].pt for x in mt]) * 2, cv2.RANSAC, 3.0)
        Hs.append(Hs[-1] if M is None else M / M[2, 2])
    # 프레임마다 따로 잰 값의 잔떨림을 없앰 (카메라 흔들림은 느리게 변함)
    P = np.array(Hs).reshape(len(Hs), 9); g = np.exp(-0.5 * (np.arange(-6, 7) / 2.5) ** 2); g /= g.sum()
    Pp = np.pad(P, ((6, 6), (0, 0)), mode='edge'); P = sum(g[j] * Pp[j:j + len(P)] for j in range(13))
    for i in range(1, len(frs) if stab else 0):  # stab=False: 직접 자른 영상은 보정 안 함(보정이 왜곡을 만듦)
        frs[i] = cv2.warpPerspective(frs[i], P[i].reshape(3, 3), (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
    # 화면 모서리를 프레임마다 찾되, 시간 축으로 부드럽게 이어서 검은 면이 커졌다 작아졌다 하지 않게
    qs = [screen_quad(f) for f in frs]
    ok_i = [i for i, q in enumerate(qs) if q is not None]
    Q = np.array([qs[i] if qs[i] is not None else qs[min(ok_i, key=lambda j: abs(j - i))] for i in range(len(qs))])
    mw = int(4 * smooth); gw = int(7 * smooth)
    P = np.pad(Q, ((mw, mw), (0, 0), (0, 0)), mode='edge')
    Q = np.median(np.stack([P[i:i + len(Q)] for i in range(2 * mw + 1)]), axis=0)  # 튀는 값 빼기 (손이 테두리를 가릴 때)
    g = np.exp(-0.5 * (np.arange(-gw, gw + 1) / (2.8 * smooth)) ** 2); g /= g.sum()
    P = np.pad(Q, ((gw, gw), (0, 0), (0, 0)), mode='edge')
    Q = sum(g[i] * P[i:i + len(Q)] for i in range(2 * gw + 1))  # 부드럽게 (TV는 천천히 도니 늦어 보이지 않음)
    def mask_of(f, q):
        # 부드럽게 만든 면 + 그 장면에서 실제로 파란 곳 (빨리 돌 때 면이 반 박자 늦어 파란 끝이 새는 것 막기)
        blue = cv2.inRange(cv2.cvtColor(f, cv2.COLOR_BGR2HSV), (95, 90, 70), (130, 255, 255))
        blue = cv2.morphologyEx(blue, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
        return quad_mask(f.shape, q, f) | cv2.dilate(blue, np.ones((7, 7), np.uint8))
    raw = [crop(blackout(f, mask_of(f, q)), ratio, cx, cy, zoom).astype(np.float32) for f, q in zip(frs, Q)]
    out = []
    for i in range(n):  # 처음 fade초 = 끝부분이 처음으로 녹아드는 구간
        f = raw[i] if i >= x else raw[n + i] * (1 - i / x) + raw[i] * (i / x)
        out.append(np.clip(f, 0, 255).astype(np.uint8))
    # 찌직거림 없애기: 움직이지 않는 곳(벽·거실장)은 모든 장에서 같은 한 장(시간 중앙값)으로 고정
    # (TV·손이 한 번이라도 지나간 자리는 고정하지 않음 → 테두리가 깨지지 않음)
    stack = np.stack(out); bg = np.median(stack, axis=0).astype(np.float32)
    rng = (stack.max(axis=0).astype(np.int16) - stack.min(axis=0)).max(axis=2)
    still = cv2.erode((rng < 40).astype(np.uint8) * 255, np.ones((15, 15), np.uint8))
    s_ = cv2.GaussianBlur(still.astype(np.float32) / 255, (0, 0), 3)[..., None]
    out = [np.clip(f * (1 - s_) + bg * s_, 0, 255).astype(np.uint8) for f in out]
    if ext_top > 0:
        # 위쪽 벽 늘리기: 움직이지 않는 벽(시간 중앙값)의 맨 위 띠를 위로 거울처럼 이어 붙이고, 위로 갈수록 흐리게 (모든 장에 같은 그림)
        H0, W0 = out[0].shape[:2]; E = int(H0 * ext_top); K = max(8, H0 // 12)
        # 벽만의 배경: TV·손이 지나간 순간(어두운 점)은 빼고 시간 중앙값, 끝까지 비는 곳은 주변으로 메움
        top = np.stack([f[:K] for f in out]).astype(np.float32)
        wall = (top.max(axis=3) > 70)
        top[~wall] = np.nan
        plate = np.nanmedian(top, axis=0)
        hole = np.isnan(plate).any(axis=2)
        plate = np.nan_to_num(plate, nan=0).astype(np.uint8)
        hole |= plate.max(axis=2) > 205  # 시계 숫자처럼 아주 밝은 것도 빼고 벽 색으로 (위로 늘리면 흰 줄이 됨)
        hole = cv2.dilate(hole.astype(np.uint8), np.ones((7, 7), np.uint8)) > 0
        plate = cv2.inpaint(plate, hole.astype(np.uint8) * 255, 9, cv2.INPAINT_TELEA)
        # 맨 윗줄 벽 색을 위로 늘림: 이음매는 실제 벽과 이어지고, 위로 갈수록 가로로 크게 흐려짐(시계 같은 작은 것은 사라짐)
        row = plate[:1].astype(np.float32)
        ext = np.repeat(row, E, axis=0)
        far = cv2.GaussianBlur(ext, (0, 0), sigmaX=W0 / 12, sigmaY=1)
        t = (np.linspace(1, 0, E) ** 0.7)[:, None, None]
        ext = np.clip(ext * (1 - t) + far * t, 0, 255).astype(np.uint8)
        out = [np.vstack([ext, f]) for f in out]
    h0, w0 = out[0].shape[:2]; size = (width, round(width * h0 / w0) // 2 * 2)
    tmp = pathlib.Path(tempfile.mkdtemp())
    for k, f in enumerate(out):
        # 카톡으로 받은 720p 영상이라 부드러움 → 페이지 폭으로 키운 뒤 살짝 선명하게
        im = Image.fromarray(cv2.cvtColor(f, cv2.COLOR_BGR2RGB)).resize(size, Image.LANCZOS)
        im.filter(ImageFilter.UnsharpMask(radius=1.4, percent=70, threshold=2)).save(tmp / f'f_{k:04d}.png')
    path = OUT / name
    cs, acc = [], 0.0
    for _ in range(n):
        nxt = acc + 100 / fps; cs.append(round(nxt) - round(acc)); acc = nxt
    # 팔레트는 전체에서 한 번만 (장마다 색이 바뀌어 반짝이는 것 방지)
    for colors, dither in ((256, 'bayer:bayer_scale=5'), (256, 'bayer:bayer_scale=4'), (224, 'bayer:bayer_scale=4'), (192, 'bayer:bayer_scale=3'), (160, 'bayer:bayer_scale=3')):
        vf = f'split[a][b];[a]palettegen=max_colors={colors}:stats_mode=full[p];[b][p]paletteuse=dither={dither}:diff_mode=rectangle'
        subprocess.run([FF, '-y', '-loglevel', 'error', '-framerate', str(fps), '-i', str(tmp / 'f_%04d.png'), '-vf', vf, '-loop', '0', str(path)], check=True)
        set_delays(path, cs)
        if path.stat().st_size <= limit: break
    shutil.rmtree(tmp)
    print(f'{name}: {size[0]}×{size[1]} · {length:g}초 · {fps}fps · {colors}색 · {path.stat().st_size / 1e6:.1f}MB')


def rot_pair():
    """이미지 폴더의 '회전 전/후'(세로 3000×4000, 뉴스 방송이 켜진 화면) → 화면을 검게, 같은 카메라 위치로 맞춰 4:5"""
    from blackout import quad_mask
    IMG = ROOT.parent / '이미지'
    def load(f): return cv2.cvtColor(np.asarray(ImageOps.exif_transpose(Image.open(IMG / f)).convert('RGB')), cv2.COLOR_RGB2BGR)
    # TV 테두리 네 모서리 (파란 화면이 아니라 자동 검출이 안 돼 GrabCut으로 한 번 잡은 값, 원본 좌표)
    qa = np.float32([[1036, 348], [1920, 876], [1864, 2220], [988, 2524]])
    qb = np.float32([[584, 464], [2140, 784], [2096, 2136], [556, 2416]])
    a, b = load('회전 전.jpg'), load('회전 후.jpg')
    a = blackout(a, quad_mask(a.shape, qa)); b = blackout(b, quad_mask(b.shape, qb))
    # 회전 후를 회전 전 카메라 위치로 (두 TV 자리는 기준에서 뺌)
    keep = np.full(a.shape[:2], 255, np.uint8)
    for q in (qa, qb): cv2.fillConvexPoly(keep, np.round(q).astype(np.int32), 0)
    keep = cv2.erode(keep, np.ones((121, 121), np.uint8))
    sm = lambda x: cv2.resize(x, None, fx=0.25, fy=0.25)
    orb = cv2.ORB_create(6000)
    k1, d1 = orb.detectAndCompute(cv2.cvtColor(sm(b), cv2.COLOR_BGR2GRAY), sm(keep))
    k2, d2 = orb.detectAndCompute(cv2.cvtColor(sm(a), cv2.COLOR_BGR2GRAY), sm(keep))
    m = sorted(cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True).match(d1, d2), key=lambda x: x.distance)[:800]
    A, inl = cv2.estimateAffinePartial2D(np.float32([k1[x.queryIdx].pt for x in m]) * 4, np.float32([k2[x.trainIdx].pt for x in m]) * 4, method=cv2.RANSAC, ransacReprojThreshold=8)
    print(f'  맞춤: 특징점 {int(inl.sum())}개, 이동 {A[0, 2]:.0f},{A[1, 2]:.0f}px')
    b = cv2.warpAffine(b, A, (a.shape[1], a.shape[0]), borderMode=cv2.BORDER_REPLICATE)
    # 맞추면서 비는 왼쪽·위 가장자리(번진 띠)가 안 들어오게 조금 확대해 자름
    save_jpg(crop(a, 4 / 5, 0.53, 0.5, 1.12), 'r_rot_before.jpg', 1200)
    save_jpg(crop(b, 4 / 5, 0.53, 0.5, 1.12), 'r_rot_after.jpg', 1200)


JOBS = {
    # 그래서 다큐는: 이미지 폴더의 회전 전 → 회전 후 (세로)
    'r_rot': rot_pair,
    # 그래서 다큐는: 수납 거실장 위 TV 정면
    'r_living_front': lambda: save_jpg(crop(blackout(photo(0)), 4 / 3, 0.5, 0.55), 'r_living_front.jpg', 1600),
    # 각도: 돌리기 전(6) → 돌린 후(15), 같은 카메라 위치로 맞춤
    'r_room': lambda: (lambda a, b: (save_jpg(crop(a, 4 / 3, 0.5, 0.55), 'r_room_before.jpg', 1600),
                                     save_jpg(crop(b, 4 / 3, 0.5, 0.55), 'r_room_after.jpg', 1600)))(
        blackout(photo(6)), blackout(align(photo(15), photo(6)))),
    # 마무리: 앉은 자리 쪽으로 돌린 거실 (세로 4:5)
    'r_closing': lambda: save_jpg(crop(blackout(photo(14)), 4 / 3, 0.54, 0.5, 1.12), 'r_closing.jpg', 1600),  # 거실장 전체가 들어오는 가로 사진, TV는 한쪽으로 돌아간 상태
    # 설치 ②: 두 다리 아래에 하나씩 놓인 두 패드 (거실장 위를 가까이)
    'r_two_pads': lambda: save_jpg(crop(blackout(photo(5)), 4 / 3, 0.5, 0.68, 1.4), 'r_two_pads.jpg', 1200),
    # 설치②: TV 다리 아래 놓인 패드
    'r_pad_place': lambda: save_jpg(crop(photo(8), 1, 0.5, 0.62, 1.15), 'r_pad_place.jpg', 900),
    # 히어로: 손끝으로 밀면 제자리에서 돌아가는 TV (6초)
    # 히어로(세로): 위에서 내려다본 TV 다리와 패드 — 손끝으로 밀면 윗판이 크게 돌아감 (4:5, 바닥은 잘라 냄)
    'r_hero_v': lambda: clip(4, 11.04, 6.0, 'r_hero_v.gif', 4 / 5, 720, cy=0.0, rot=cv2.ROTATE_90_COUNTERCLOCKWISE, limit=4_000_000),
    'r_hero_v2': lambda: clip(4, 1.0, 6.0, 'r_hero_v2.gif', 4 / 5, 860, cy=0.42, rot=cv2.ROTATE_90_COUNTERCLOCKWISE, limit=7_000_000),  # 히어로: 화질 우선(페이지 폭, 256색)
    # 설치 ③ 후보: 다른 정면 영상 두 개
    'r_push_a': lambda: clip(2, 14.1, 6.0, 'r_push_a.gif', 16 / 9, 860, cx=0.56, cy=0.12, zoom=1.15, limit=7_000_000),  # 왼쪽 잡동사니(문·협탁·가방)는 잘라 냄
    'r_push_b': lambda: clip(6, 0.33, 6.0, 'r_push_b.gif', 16 / 9, 860, zoom=1.03, limit=7_000_000),
    # 히어로: TV 전체가 도는 정면 + 위쪽 벽을 늘려 아이보리로 풀 자리
    'r_hero_w': lambda: clip(2, 14.1, 6.0, 'r_hero_w.gif', 16 / 9, 860, cx=0.57, cy=0.0, zoom=1.22, limit=8_000_000, ext_top=0.45),
    'r_hero3': lambda: clip(SRC / '1102.mp4', 0.0, 3.0, 'r_hero3.gif', 16 / 9, 860, fps=15, limit=8_000_000, stab=False),  # 대표님이 직접 자른 3.6초 영상 → 3초 반복
    'r_v1': lambda: clip(1, 0.0, 6.0, 'r_v1.gif', 16 / 9, 860, cx=0.5, cy=0.12, zoom=1.12, limit=7_000_000, smooth=1.6, speed=0.86),
    'r_v5': lambda: clip(5, 0.0, 6.0, 'r_v5.gif', 16 / 9, 860, cx=0.56, cy=0.12, zoom=1.15, limit=7_000_000, smooth=1.6, speed=0.93),
    'r_v0': lambda: clip(0, 0.0, 6.0, 'r_v0.gif', 16 / 9, 860, cx=0.5, cy=0.12, zoom=1.08, limit=7_000_000, smooth=1.8),
    'r_hero': lambda: clip(0, 0.0, 6.0, 'r_hero.gif', 16 / 9, 860, zoom=1.03, limit=7_000_000),  # 양쪽에서 미는 손이 다 보이게 원본 비율 그대로
    # 안정감: 다른 장면으로 한 번 더 (6초, 16:9)
    'r_stable': lambda: clip(2, 7.8, 6.0, 'r_stable.gif', 16 / 9, 860, cx=0.56, cy=0.12, zoom=1.15, limit=7_000_000, smooth=1.8),  # 히어로 후보: TV 전체가 도는 정면(왼쪽 잡동사니 잘라 냄)
    # 미끄럼 방지: 하판은 그대로, 윗판만 도는 클로즈업 (3초, 4:3)
    'r_grip': lambda: clip(3, 5.08, 3.0, 'r_grip.gif', 4 / 3, 720, cy=0.47),
}
for k, job in JOBS.items():
    if ONLY and k not in ONLY: continue
    job()
