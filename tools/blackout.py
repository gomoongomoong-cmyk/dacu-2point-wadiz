"""TV 화면을 꺼진 화면처럼 검게 칠함 (켜진 홈 화면·광고·앱 아이콘이 상세페이지에 나오지 않게)

화면은 채도 높은 파란색이 넓게 퍼진 곳 → 가장 큰 파란 덩어리의 볼록 외곽선을 화면으로 보고,
짙은 회색(살짝 비스듬한 반사광 포함)으로 채움. 사진·영상 프레임 모두에 씀.
"""
import cv2
import numpy as np


def screen_quad(bgr):
    """화면 네 모서리 [왼위, 오위, 오아래, 왼아래] (못 찾으면 None)"""
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    blue = cv2.inRange(hsv, (95, 110, 90), (130, 255, 255))
    h, w = blue.shape
    k = max(3, (min(h, w) // 200) | 1)
    blue = cv2.morphologyEx(blue, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_RECT, (k * 9, k * 9)))
    cnts, _ = cv2.findContours(blue, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not cnts: return None
    c = max(cnts, key=cv2.contourArea)
    if cv2.contourArea(c) < 0.02 * h * w: return None
    q = cv2.approxPolyN(cv2.convexHull(c), 4, ensure_convex=True).reshape(-1, 2).astype(np.float32)
    s, d = q.sum(1), q[:, 0] - q[:, 1]
    return np.array([q[s.argmin()], q[d.argmax()], q[s.argmax()], q[d.argmin()]], np.float32)


def quad_mask(shape, quad, bgr=None):
    """네 모서리 → 칠할 자리. bgr를 주면 화면 밖에서 들어온 손(살색 덩어리)은 칠하지 않음"""
    h, w = shape[:2]
    k = max(3, (min(h, w) // 200) | 1)
    m = np.zeros((h, w), np.uint8)
    cv2.fillConvexPoly(m, np.round(quad).astype(np.int32), 255)
    m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k * 2 + 1, k * 2 + 1)))
    if bgr is not None:
        hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
        skin = (cv2.inRange(hsv, (0, 35, 70), (22, 210, 255)) | cv2.inRange(hsv, (160, 35, 70), (180, 210, 255)))
        n, lab = cv2.connectedComponents(cv2.morphologyEx(skin, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)))
        outside = lab[(m == 0) & (lab > 0)]
        inner = cv2.erode(m, np.ones((k * 10, k * 10), np.uint8))  # 테두리 근처(벽 색이 살색으로 잡히는 곳)는 늘 칠함
        for i in np.unique(outside):
            hand = (lab == i) & (inner > 0)
            if hand.sum() > 0.0005 * h * w: m[hand] = 0  # 화면 밖에서 화면 안쪽 깊이 들어온 살색 = 손
    return m


def screen_mask(bgr):
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    blue = cv2.inRange(hsv, (95, 110, 90), (130, 255, 255))
    h, w = blue.shape
    k = max(3, (min(h, w) // 200) | 1)
    blue = cv2.morphologyEx(blue, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_RECT, (k * 9, k * 9)))
    cnts, _ = cv2.findContours(blue, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not cnts: return None
    c = max(cnts, key=cv2.contourArea)
    if cv2.contourArea(c) < 0.02 * h * w: return None
    hull = cv2.convexHull(c)
    # 화면은 원근이 걸린 네모 → 덩어리를 감싸는 사각형으로 (화면 속 흰 글씨 때문에 모서리가 깎이는 것 방지)
    quad = cv2.approxPolyN(hull, 4, ensure_convex=True)
    m = np.zeros((h, w), np.uint8)
    cv2.fillConvexPoly(m, np.round(quad).astype(np.int32).reshape(-1, 2), 255)
    return cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k * 2 + 1, k * 2 + 1)))


def blackout(bgr, mask=None):
    m = screen_mask(bgr) if mask is None else mask
    if m is None: return bgr
    h, w = m.shape
    ys, xs = np.nonzero(m)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    # 꺼진 화면: 짙은 회색 + 왼쪽 위에서 비스듬히 들어오는 아주 옅은 반사
    gx = (np.arange(w)[None, :] - x0) / max(1, x1 - x0)
    gy = (np.arange(h)[:, None] - y0) / max(1, y1 - y0)
    t = np.clip(1 - (gx * 0.7 + gy * 0.5), 0, 1)
    fill = np.zeros((h, w, 3), np.float32)
    fill[..., 0] = 16 + 10 * t; fill[..., 1] = 16 + 9 * t; fill[..., 2] = 17 + 8 * t
    a = cv2.GaussianBlur(m.astype(np.float32) / 255, (0, 0), 1.2)[..., None]
    return np.clip(bgr * (1 - a) + fill * a, 0, 255).astype(np.uint8)
