"""캡처 결과 정리: 같은 섹션 안에서 연달아 붙은 JPG 조각을 한 장으로 합침 (최대 3,000px) → 파일 수 줄이기
GIF 조각은 그대로 둠 (길게 합치면 움직임이 끊김). 합친 뒤 섹션마다 _1, _2 … 번호를 다시 매김.

실행: python tools/merge_static.py <캡처 폴더>   (capture_upload.py 가 끝나면 자동으로도 실행됨)
"""
import re
import sys
import pathlib
from collections import defaultdict

from PIL import Image

MAXH = 3000


def merge(folder):
    folder = pathlib.Path(folder)
    groups = defaultdict(list)
    for f in folder.iterdir():
        if f.suffix not in ('.gif', '.jpg'):
            continue
        m = re.match(r'(.+?)(?:_(\d+))?$', f.stem)
        groups[m.group(1)].append((int(m.group(2) or 0), f))
    for sec, items in groups.items():
        items.sort()
        runs, cur = [], []
        for _, f in items:  # 연달아 붙은 JPG끼리 묶음 (GIF가 끼면 끊음)
            if f.suffix == '.jpg' and cur and cur[-1].suffix == '.jpg' and sum(Image.open(x).height for x in cur) + Image.open(f).height <= MAXH:
                cur.append(f)
            else:
                if cur: runs.append(cur)
                cur = [f]
        if cur: runs.append(cur)
        tmp = []
        for k, run in enumerate(runs, 1):
            name = folder / f'{sec}_{k}{run[0].suffix}' if len(runs) > 1 else folder / f'{sec}{run[0].suffix}'
            out = folder / f'__tmp_{sec}_{k}{run[0].suffix}'
            if len(run) == 1:
                run[0].rename(out)
            else:
                ims = [Image.open(x).convert('RGB') for x in run]
                canvas = Image.new('RGB', (ims[0].width, sum(i.height for i in ims)))
                y = 0
                for i in ims:
                    canvas.paste(i, (0, y)); y += i.height
                canvas.save(out, quality=95, subsampling=0)
                for x in run: x.unlink()
            tmp.append((out, name))
        for out, name in tmp:
            out.rename(name)
        print(f'{sec}: {len(items)}개 → {len(runs)}개')


if __name__ == '__main__':
    merge(sys.argv[1])
