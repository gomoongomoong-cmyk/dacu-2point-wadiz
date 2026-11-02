"""v3 공통 박자(3초·6초)에 맞춰 페이지 짤 길이를 고친 새 파일(_b.gif)을 만듦 — 원본은 그대로 둠

- scale: 모든 장의 시간을 같은 비율로 (계속 도는 영상)
- hold : 마지막 장을 더 오래 보여 줌 (조립처럼 한 번 끝나는 영상 → 완성된 모습에서 잠깐 머묾)
"""
import pathlib, shutil
from PIL import Image

PUB = pathlib.Path(__file__).resolve().parent.parent / 'public'
JOBS = [  # (파일, 목표 ms, 방식)
    ('3d/A1_unveil_opening.gif', 3000, 'scale'),
    ('3d/A3_kit_assemble_c3_zoom.gif', 6000, 'hold'),
    ('3d/M1_mat_corner.gif', 3000, 'scale'),
    ('3d/V1_assembly.gif', 6000, 'hold'),
    ('photo/ai_pad_place.gif', 3000, 'hold'),
    ('photo/pad_turn_real_169.gif', 3000, 'scale'),
]


def delays_of(b):
    """GIF 안 각 장의 시간(1/100초)과 그 자리"""
    flags = b[10]; i = 13 + (3 * 2 ** ((flags & 7) + 1) if flags & 0x80 else 0)
    out = []
    while i < len(b):
        c = b[i]
        if c == 0x21:
            if b[i + 1] == 0xF9: out.append((i + 4, b[i + 4] | b[i + 5] << 8))
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
    return out


for rel, target, how in JOBS:
    src = PUB / rel; dst = src.with_name(src.stem + '_b.gif')
    b = bytearray(src.read_bytes()); ds = delays_of(b)
    cs = [d for _, d in ds]; total = sum(cs); goal = target // 10
    if how == 'hold':
        new = cs[:-1] + [cs[-1] + goal - total]
    else:
        new, acc = [], 0.0
        for d in cs:
            nxt = acc + d * goal / total; new.append(max(2, round(nxt) - round(acc))); acc = nxt
    for (pos, _), d in zip(ds, new):
        b[pos] = d & 0xFF; b[pos + 1] = d >> 8
    dst.write_bytes(bytes(b))
    g = Image.open(dst); t = 0
    for k in range(g.n_frames): g.seek(k); t += g.info['duration']
    print(f'{dst.name}: {total * 10}ms → {t}ms ({how})')
