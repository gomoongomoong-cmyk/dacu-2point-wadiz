"""3D 오프닝 영상(A1_unveil.mp4, 9초·5컷)을 컷마다 따로 잘라 천천히 보이는 짤로 (public/3d/open_c1~5.gif)

- 원본은 컷 하나가 1.7~2.2초라 빠름 → 움직임을 2.6초로 늘리고 마지막 장면에서 0.4초 머묾 = 한 바퀴 3초(v3 공통 박자)
- 컷 경계는 장면이 확 바뀌는 프레임(밝기 차이)으로 찾은 값

실행: python tools/cut_clips.py
"""
import pathlib, shutil, subprocess, sys, tempfile
import imageio_ffmpeg
sys.stdout.reconfigure(encoding='utf-8')
ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT.parent / '3D' / 'videos' / 'A1_unveil.mp4'
OUT = ROOT / 'public' / '3d'
FF = imageio_ffmpeg.get_ffmpeg_exe()
SRC_FPS = 30
FPS = 15             # 짤 1초 장수
MOVE, HOLD = 2.6, 0.4  # 움직임 길이, 마지막 장면에서 머무는 시간(초)
CUTS = [  # (이름, 시작 프레임, 끝 프레임, 설명)
    ('open_c1', 0, 50, '하판 곡선 홈을 따라 빛이 지나감'),
    ('open_c2', 50, 100, '핀이 상판 구멍에 들어감'),
    ('open_c3', 100, 165, '상판과 하판이 맞물려 내려앉음'),
    ('open_c4', 165, 215, '위에서 본 패드: 상판이 돌았다 돌아옴'),
    ('open_c5', 215, 270, '낮은 각도로 패드 위를 지나감'),
]


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
    return k


for name, a, b, what in CUTS:
    n = round(MOVE * FPS)
    tmp = pathlib.Path(tempfile.mkdtemp())
    # a~b 프레임을 MOVE초에 걸쳐 n장으로 (느리게)
    sel = f"select='between(n\\,{a}\\,{b - 1})',setpts=N/{SRC_FPS}/TB*{MOVE / ((b - a) / SRC_FPS):.4f},fps={FPS},scale=860:-2:flags=lanczos"
    subprocess.run([FF, '-y', '-loglevel', 'error', '-i', str(SRC), '-vf', sel, '-frames:v', str(n), str(tmp / 'f_%03d.png')], check=True)
    frames = sorted(tmp.glob('f_*.png')); n = len(frames)
    path = OUT / f'{name}.gif'
    vf = 'split[a][b];[a]palettegen=max_colors=256:stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle'
    subprocess.run([FF, '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', str(tmp / 'f_%03d.png'), '-vf', vf, '-loop', '0', str(path)], check=True)
    cs, acc = [], 0.0
    for _ in range(n):
        nxt = acc + 100 / FPS; cs.append(round(nxt) - round(acc)); acc = nxt
    cs[-1] += round((3.0 - n / FPS) * 100)  # 한 바퀴 3초가 되게 마지막 장면에서 머묾
    set_delays(path, cs)
    shutil.rmtree(tmp)
    print(f'{path.name}: {n}장 · {sum(cs) / 100:.2f}초 · {path.stat().st_size / 1e6:.1f}MB · {what}')
