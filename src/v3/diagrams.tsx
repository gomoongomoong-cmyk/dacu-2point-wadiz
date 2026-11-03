import { motion, useMotionValueEvent } from 'motion/react'
import { useState, type ReactNode } from 'react'
import { useLoop } from './ui'

const inOut = (v: number, a: number, b: number) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t) }

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
  const p = useLoop(6)
  const [angle, setAngle] = useState(0)
  // 정면 → 1.2초부터 32° 돌아감 → 4.2초부터 정면으로 돌아옴 (가운데 부드럽게)
  useMotionValueEvent(p, 'change', v => setAngle(32 * (inOut(v, 0.2, 0.4) - inOut(v, 0.7, 0.9))))
  return (
    <svg viewBox="0 0 400 290" className="w-full" aria-label="위에서 본 거실. TV가 소파 정면에서 식탁 쪽으로 각도를 바꾼다">
      <rect x="20" y="16" width="360" height="262" rx="14" fill="none" stroke="#E2DBD1" strokeWidth="1.4" />
      <rect x="110" y="36" width="180" height="26" rx="5" fill="#EFE6DA" />
      <text x="112" y="78" fontSize="11" fill="#6E625A">거실장</text>
      {/* 회전 중심 = TV 가운데(200,53). 11/2: SVG 자체 애니메이션은 캡처 시계를 안 따라 멈춰 찍혀서, 페이지 공통 시계(6초 한 바퀴)로 각도를 계산 */}
      <g transform={`rotate(${angle} 200 53)`}>
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

/** 거실장 폭 맞춤 (11/3 회의): 위에서 본 거실장. 하판(500mm)이 앞으로 나온 만큼 잘려 나가 거실장 폭에 꼭 맞음 — 3초 반복 */
export function CabinetTrim() {
  const p = useLoop(3)
  const k = 0.4, D = 420 * k, L = 500 * k, W = 130 * k
  const x0 = 30, y0 = 22, cw = 196, px = x0 + 70
  const [c, setC] = useState(0)
  useMotionValueEvent(p, 'change', v => setC(inOut(v, 0.3, 0.5) * (1 - inOut(v, 0.9, 0.98))))
  const tick = (y1: number, y2: number, x: number) => `M${x} ${y1} V${y2} M${x - 5} ${y1} H${x + 5} M${x - 5} ${y2} H${x + 5}`
  return (
    <svg viewBox="0 0 344 236" className="w-full" aria-label="거실장 앞뒤 폭이 하판 500mm보다 좁으면, 앞으로 나오는 만큼 하판을 줄여 보내드립니다">
      <path d={`M${x0 - 8} ${y0 - 7} H${x0 + cw + 8}`} stroke="#C9AE98" strokeWidth="3" strokeLinecap="round" />
      <text x={x0 + cw + 14} y={y0 - 3} fontSize="10.5" fill="#8C7B6E">벽</text>
      <rect x={x0} y={y0} width={cw} height={D} rx="4" fill="#EADFD1" stroke="#C9AE98" />
      <text x={x0 + 10} y={y0 + D - 10} fontSize="10.5" fill="#8C7B6E">거실장 앞</text>
      <rect x={px} y={y0} width={W} height={D} rx="3" fill="#FFFFFF" stroke="#B9A796" />
      <rect x={px + (W - 40) / 2} y={y0 + (D - 140) / 2 + 4} width="40" height="140" rx="3" fill="#F3ECE3" stroke="#C9AE98" />
      {/* 앞으로 나온 부분: 점선으로 보였다가 잘려 아래로 빠짐 */}
      <g opacity={1 - c} transform={`translate(0 ${c * 16})`}>
        <rect x={px} y={y0 + D} width={W} height={L - D} rx="3" fill="#F2E4D8" stroke="#A88B78" strokeDasharray="4 3" />
        <text x={px - 8} y={y0 + D + (L - D) / 2 + 4} textAnchor="end" fontSize="10.5" fill="#8A6A52">밖으로 나온 만큼</text>
      </g>
      <path d={`M${px - 6} ${y0 + D} H${px + W + 6}`} stroke="#6B5245" strokeWidth="1.2" strokeDasharray="3 3" opacity={0.35 + 0.65 * Math.min(1, c * 3)} />
      {/* 길이 표시: 500mm → 거실장 폭에 맞춘 길이 */}
      <g stroke="#A88B78" strokeWidth="1" fill="none">
        <path d={tick(y0, y0 + L, x0 + cw + 22)} opacity={1 - c} />
        <path d={tick(y0, y0 + D, x0 + cw + 22)} opacity={c} />
      </g>
      <g fontSize="11" fill="#6E625A">
        <text x={x0 + cw + 32} y={y0 + L - 2} opacity={1 - c}>하판 500mm</text>
        <text x={x0 + cw + 32} y={y0 + D / 2 - 3} opacity={c} fill="#6B5245" fontWeight="700">거실장 폭에</text>
        <text x={x0 + cw + 32} y={y0 + D / 2 + 12} opacity={c} fill="#6B5245" fontWeight="700">맞춘 길이</text>
      </g>
    </svg>
  )
}

/** 물세척 (11/3 회의): 떼기 → 물로 씻기(물방울이 3초마다 떨어짐) → 말려서 끼우기 */
export function WashSteps() {
  const p = useLoop(3)
  const [t, setT] = useState(0)
  useMotionValueEvent(p, 'change', v => setT(v))
  const drop = (d: number) => { const v = (t + d) % 1; return { y: 8 + v * 22, o: v < 0.75 ? 1 : (1 - v) * 4 } }
  const plate = <rect x="10" y="40" width="44" height="7" rx="2" fill="#FFFFFF" stroke="#B9A796" />
  const steps: [string, ReactNode][] = [
    ['떼기', <>{plate}<rect x="16" y="22" width="32" height="7" rx="2" fill="#F3ECE3" stroke="#C9AE98" /><path d="M32 18 V8 M27 13 L32 8 L37 13" stroke="#6B5245" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></>],
    ['물로 씻기', <>{[0, 0.33, 0.66].map((d, i) => { const { y, o } = drop(d); return <path key={i} d={`M${22 + i * 10} ${y} q-3 5 0 7 q3 -2 0 -7z`} fill="#8FB3C8" opacity={o} /> })}{plate}</>],
    ['말려서 끼우기', <>{plate}<rect x="16" y="33" width="32" height="7" rx="2" fill="#F3ECE3" stroke="#C9AE98" /><path d="M24 18 l5 5 l10 -11" stroke="#6B5245" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" /></>],
  ]
  return (
    <div className="mt-6 grid grid-cols-3 gap-2">
      {steps.map(([n, g], i) => (
        <div key={n} className="flex flex-col items-center rounded-[10px] bg-[#F7F2EA] px-2 pb-4 pt-3">
          <svg viewBox="0 0 64 56" className="w-[84px]" aria-hidden>{g}</svg>
          <p className="mt-1 text-[14px] font-semibold text-ink"><span className="mr-1 text-mocha">{i + 1}</span>{n}</p>
        </div>
      ))}
    </div>
  )
}
