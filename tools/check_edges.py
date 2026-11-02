"""와디즈 에디터는 이미지 사이에 흰 간격을 넣음 → 섹션(=이미지 한 장) 위아래 끝 줄이 흰색인지 점검

실행: (미리보기 서버가 켜진 상태에서) python tools/check_edges.py [페이지 주소, 기본 v3.html]
판정: 흰색 = 끝 줄이 거의 #FFFFFF / 진한색 = 어두운 섹션(카드처럼 끊겨 보여도 됨) / 그 외 = 흰 간격과 만나는 선이 보임 → 고칠 곳
"""
import io, sys
import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')
URL = 'http://localhost:5179/' + (sys.argv[1] if len(sys.argv) > 1 else 'v3.html')


def judge(row):
    mean = row.mean(axis=0)
    if (row >= 250).all(axis=1).mean() > 0.97: return '흰색'
    if mean.mean() < 140: return '진한색'
    return f'밝은 색 #{int(mean[0]):02X}{int(mean[1]):02X}{int(mean[2]):02X} ← 선이 보임'


with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 860, 'height': 1200})
    pg.goto(URL + '?cap', wait_until='networkidle'); pg.wait_for_timeout(1200)
    for _ in range(60): pg.mouse.wheel(0, 1500); pg.wait_for_timeout(30)
    caps = pg.evaluate("[...document.querySelectorAll('main [data-cap]')].filter(e => !e.querySelector('[data-cap]')).map(e => e.dataset.cap)")
    bad = 0
    for cap in caps:
        el = pg.locator(f'[data-cap="{cap}"]').first
        a = np.asarray(Image.open(io.BytesIO(el.screenshot(animations='disabled'))).convert('RGB')).astype(int)
        top, bot = judge(a[1]), judge(a[-2])
        flag = '선이 보임' in top or '선이 보임' in bot
        bad += flag
        print(f"{'✗' if flag else '·'} {cap:<16} {a.shape[0]:>5}px  위: {top:<28} 아래: {bot}")
    print(f'\n고칠 곳 {bad}개 / 섹션 {len(caps)}개')
    b.close()
