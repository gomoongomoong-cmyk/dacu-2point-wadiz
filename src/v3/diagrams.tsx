import { motion } from 'motion/react'

const swing = { duration: 1.5, ease: 'easeInOut' as const, repeat: Infinity, repeatType: 'mirror' as const }

/** 정면도: TV 두 다리 아래 패드가 하나씩. 패드가 무게를 받듯 살짝 눌림 */
export function FrontView() {
  return (
    <svg viewBox="0 0 344 214" className="w-full" aria-label="정면에서 본 2-POINT. TV의 두 다리 아래에 패드가 하나씩 있다">
      <rect x="40" y="16" width="264" height="132" rx="6" fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="2" />
      <text x="172" y="88" textAnchor="middle" fontSize="13" fill="rgba(255,255,255,.4)">대형 TV</text>
      <path d="M96 148l-12 30M248 148l12 30" stroke="rgba(255,255,255,.9)" strokeWidth="3" strokeLinecap="round" />
      {[54, 230].map((x, i) => (
        <motion.rect key={x} x={x} y={178} width={60} height={9} rx={3} fill="#E2D5C6"
          animate={{ y: [178, 180.5, 178] }} transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity, delay: i * 0.15 }} />
      ))}
      <path d="M14 192h316" stroke="rgba(255,255,255,.22)" strokeWidth="1.2" />
      <text x="84" y="209" textAnchor="middle" fontSize="11.5" fill="#E2D5C6" fontWeight="600">POINT 1</text>
      <text x="260" y="209" textAnchor="middle" fontSize="11.5" fill="#E2D5C6" fontWeight="600">POINT 2</text>
    </svg>
  )
}

/** 평면도: TV를 밀면 두 점이 같은 원을 따라 움직임 */
export function TopView() {
  return (
    <svg viewBox="0 0 344 282" className="w-full" aria-label="위에서 본 2-POINT. TV를 밀면 두 점이 같은 원을 따라 움직인다">
      <motion.circle cx="172" cy="150" r="118" fill="none" stroke="#A88B78" strokeWidth="1.4" strokeDasharray="2 6"
        animate={{ strokeDashoffset: [0, -32] }} transition={{ duration: 3, ease: 'linear', repeat: Infinity }} />
      <rect x="40" y="86" width="33" height="128" rx="3" fill="#F7F2EA" stroke="#E3DACE" />
      <rect x="271" y="86" width="33" height="128" rx="3" fill="#F7F2EA" stroke="#E3DACE" />
      <path d="M61.4 109 A118 118 0 0 0 61.4 191" fill="none" stroke="#6B5245" strokeWidth="9.7" strokeLinecap="round" opacity=".14" />
      <path d="M282.6 109 A118 118 0 0 1 282.6 191" fill="none" stroke="#6B5245" strokeWidth="9.7" strokeLinecap="round" opacity=".14" />
      <motion.g style={{ transformOrigin: '172px 150px', transformBox: 'view-box' }} initial={{ rotate: -12 }} animate={{ rotate: 12 }} transition={swing}>
        <line x1="54" y1="150" x2="290" y2="150" stroke="#2F2620" strokeWidth="8" strokeLinecap="round" />
        <circle cx="54" cy="150" r="7.5" fill="#A88B78" stroke="#fff" strokeWidth="2.5" />
        <circle cx="290" cy="150" r="7.5" fill="#A88B78" stroke="#fff" strokeWidth="2.5" />
      </motion.g>
      <circle cx="172" cy="150" r="4" fill="#fff" stroke="#2F2620" strokeWidth="2" />
      <text x="172" y="22" textAnchor="middle" fontSize="11.5" fill="#6E625A">TV(검은 막대)를 밀면 두 점이 원을 따라 움직여요</text>
    </svg>
  )
}

/** 거실 평면도: TV가 소파 쪽에서 식탁 쪽으로 돌았다가 돌아옴 */
export function RoomView() {
  // 처음 배치 그대로(소파 정면 · 식탁 왼쪽 아래 · 창 오른쪽). 화면 방향 점선은 TV와 한 몸으로 돌아 늘 화면에 수직
  // 정면(0°)이면 점선이 소파로, 오른쪽 끝이 앞으로 나오게 돌리면(시계 방향) 점선이 식탁으로
  return (
    <svg viewBox="0 0 400 290" className="w-full" aria-label="위에서 본 거실. TV가 소파 정면에서 식탁 쪽으로 각도를 바꾼다">
      <rect x="20" y="16" width="360" height="262" rx="14" fill="none" stroke="#E2DBD1" strokeWidth="1.4" />
      <rect x="110" y="36" width="180" height="26" rx="5" fill="#EFE6DA" />
      <text x="112" y="78" fontSize="11" fill="#6E625A">거실장</text>
      {/* 회전 중심을 TV 가운데(200,53)에 못 박으려고 SVG 자체 회전 애니메이션 사용 */}
      <g>
        <animateTransform attributeName="transform" type="rotate" dur="3s" repeatCount="indefinite"
          values="0 200 53;0 200 53;32 200 53;32 200 53;0 200 53;0 200 53" keyTimes="0;0.2;0.4;0.7;0.9;1"
          calcMode="spline" keySplines="0 0 1 1;.42 0 .58 1;0 0 1 1;.42 0 .58 1;0 0 1 1" />
        <line x1="200" y1="59" x2="200" y2="229" stroke="#A88B78" strokeWidth="2" strokeDasharray="4 6" />
        <rect x="148" y="48" width="104" height="9" rx="2" fill="#2F2620" />
      </g>
      <rect x="140" y="208" width="120" height="46" rx="12" fill="#F7F2EA" stroke="#E3DACE" />
      <text x="200" y="236" textAnchor="middle" fontSize="13" fill="#2F2620" fontWeight="600">소파</text>
      <rect x="44" y="196" width="72" height="58" rx="9" fill="#F7F2EA" stroke="#E3DACE" />
      <text x="80" y="229" textAnchor="middle" fontSize="13" fill="#2F2620" fontWeight="600">식탁</text>
      <rect x="356" y="70" width="8" height="120" rx="2" fill="#E6DACB" />
      <text x="346" y="134" textAnchor="end" fontSize="11" fill="#6E625A">창</text>
    </svg>
  )
}

/** 위에서 본 패드 한 개 (REV07): 하판 500×130 위에 상판 350×100, 치수선 */
export function PadSize() {
  const k = 0.52 // mm → px
  const L = 500 * k, W = 130 * k, l = 350 * k, w = 100 * k
  const x0 = (344 - L) / 2, y0 = 70
  return (
    <svg viewBox="0 0 344 210" className="w-full" aria-label="패드 크기. 하판 500×130mm, 상판 350×100mm, 두께 15mm">
      <rect x={x0} y={y0} width={L} height={W} rx="4" fill="#FFFFFF" stroke="#D9CFC4" />
      <path d={`M${x0 + L / 2 - 80} ${y0 + 22} Q${x0 + L / 2} ${y0 + 44} ${x0 + L / 2 + 80} ${y0 + 22}`} fill="none" stroke="#6B5245" strokeWidth="9" strokeLinecap="round" opacity=".12" />
      <rect x={x0 + (L - l) / 2} y={y0 + (W - w) / 2} width={l} height={w} rx="4" fill="#F3ECE3" stroke="#C9AE98" />
      <g stroke="#A88B78" strokeWidth="1" fill="#6E625A" fontSize="11">
        <path d={`M${x0} ${y0 - 18} H${x0 + L} M${x0} ${y0 - 23} V${y0 - 13} M${x0 + L} ${y0 - 23} V${y0 - 13}`} />
        <text x="172" y={y0 - 26} textAnchor="middle" stroke="none">하판 500mm</text>
        <path d={`M${x0 + (L - l) / 2} ${y0 + W + 18} H${x0 + (L + l) / 2} M${x0 + (L - l) / 2} ${y0 + W + 13} V${y0 + W + 23} M${x0 + (L + l) / 2} ${y0 + W + 13} V${y0 + W + 23}`} />
        <text x="172" y={y0 + W + 36} textAnchor="middle" stroke="none">상판 350mm</text>
        <path d={`M${x0 + L + 12} ${y0} V${y0 + W} M${x0 + L + 7} ${y0} H${x0 + L + 17} M${x0 + L + 7} ${y0 + W} H${x0 + L + 17}`} />
      </g>
      <text x={x0 + L + 20} y={y0 + W / 2 - 2} fontSize="10.5" fill="#6E625A">130</text>
      <text x={x0 + L + 20} y={y0 + W / 2 + 11} fontSize="10.5" fill="#6E625A">mm</text>
      <text x="172" y={y0 + W / 2 + 4} textAnchor="middle" fontSize="11" fill="#6B5245">상판 폭 100mm</text>
    </svg>
  )
}
