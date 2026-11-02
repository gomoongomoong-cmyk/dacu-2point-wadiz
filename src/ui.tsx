import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useTime, useTransform, type MotionValue } from 'motion/react'
import wordmark from './assets/dacu-wordmark.svg?raw'

/** DACU 워드마크 (currentColor라 글자색을 그대로 따라감) */
export function Logo({ className = '' }: { className?: string }) {
  return <span role="img" aria-label="DACU" className={`inline-block [&_svg]:h-full [&_svg]:w-auto ${className}`} dangerouslySetInnerHTML={{ __html: wordmark }} />
}

/** 모든 모션이 같은 감속 곡선을 씀 — 빠르게 출발해 부드럽게 멈춤 */
export const EASE = [0.22, 1, 0.36, 1] as const
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
const GRAY = '#D9CFC4'

/* 시계 기반 반복: 매 프레임 진행률(0~1)에서 값을 직접 계산 → 시간표가 정확하고 끊김이 없음 */
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3)
/** p가 a→b 구간을 지나는 동안 0→1 (감속), 구간 밖에서는 0 또는 1 */
export const seg = (p: number, a: number, b: number) => (p <= a ? 0 : p >= b ? 1 : easeOut((p - a) / (b - a)))
export function useLoop(duration: number): MotionValue<number> {
  const t = useTime()
  return useTransform(t, v => (v / 1000 % duration) / duration)
}

/* ───────── 섹션 틀 ───────── */
type Tone = 'white' | 'ivory' | 'sand' | 'sky' | 'dark'
const TONE: Record<Tone, string> = {
  white: 'bg-paper',
  ivory: 'bg-ivory',
  sand: 'bg-gradient-to-b from-ivory to-sand',
  sky: 'bg-gradient-to-b from-paper to-sky-l',
  dark: 'bg-espresso text-white',
}
/** cg: 3D 그래픽이 들어간 섹션 → 규정 문구를 섹션 오른쪽 아래에 한 번만 */
export function Section({ cap, tone = 'white', align = 'center', cg = false, className = '', children }: { cap: string; tone?: Tone; align?: 'center' | 'left'; cg?: boolean; className?: string; children: ReactNode }) {
  return (
    <section data-cap={cap} data-tone={tone === 'dark' ? 'dark' : 'light'}
      className={`relative overflow-hidden px-6 py-[72px] ${align === 'left' ? 'text-left' : 'text-center'} ${TONE[tone]} ${className}`}>
      {children}
      {cg && <CgCap className="!mt-8" />}
    </section>
  )
}

/** 리드 18px(500) + 제목 31px. 제목은 기본 500, 핵심어(<b>·강조)는 800으로 강약 */
export function Heading({ lead, children, dark = false, size = 'md' }: { lead?: ReactNode; children: ReactNode; dark?: boolean; size?: 'md' | 'lg' }) {
  return (
    <>
      {lead && <p className={`text-[19px] leading-[1.4] font-medium ${dark ? 'text-white/70' : 'text-sub'}`}>{lead}</p>}
      <h2 className={`mt-1 font-medium tracking-[-0.035em] [&_b]:font-extrabold ${size === 'lg' ? 'text-[37px] leading-[1.32]' : 'text-[33px] leading-[1.36]'} ${dark ? 'text-white' : 'text-ink'}`}>
        {children}
      </h2>
    </>
  )
}

export function Body({ children, dark = false, className = '' }: { children: ReactNode; dark?: boolean; className?: string }) {
  return <p className={`mt-7 text-[15.5px] leading-[1.8] ${dark ? 'text-white/65 [&_b]:text-white' : 'text-sub [&_b]:text-ink'} [&_b]:font-semibold ${className}`}>{children}</p>
}

export function Note({ children, dark = false, className = '' }: { children: ReactNode; dark?: boolean; className?: string }) {
  return <p className={`mt-3 text-[12.5px] leading-[1.6] ${dark ? 'text-white/45' : 'text-mute'} ${className}`}>{children}</p>
}

/** 작은 영문 세리프 문구 (쿠나식 편집 장식) */
/** 회색 알약 안내 — 왼쪽에 동그란 i 아이콘 (출원번호 같은 짧은 안내) */
export function InfoPill({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`mx-auto mt-4 flex w-fit items-center gap-1.5 rounded-full bg-[#5A463B]/[.07] py-[5px] pl-[5px] pr-3 text-left text-[12px] font-medium leading-[1.4] text-sub [[data-tone=dark]_&]:bg-white/10 [[data-tone=dark]_&]:text-white/70 ${className}`}>
      <span aria-hidden className="flex size-[15px] shrink-0 items-center justify-center rounded-full bg-[#857A71] font-serif text-[10.5px] font-bold italic leading-none text-white">i</span>
      {children}
    </p>
  )
}

export function Serif({ children, dark = false, className = '' }: { children: ReactNode; dark?: boolean; className?: string }) {
  return <p className={`font-serif text-[14px] italic tracking-[0.01em] ${dark ? 'text-white/55' : 'text-mute'} ${className}`}>{children}</p>
}

/** 얇은 테두리 라벨 */
export function Label({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <span className={`mb-7 inline-flex items-center rounded-full border px-3.5 py-[5px] text-[13px] font-semibold ${dark ? 'border-sky-xl/60 text-sky-xl' : 'border-sky bg-sky-l/60 text-sky-d'}`}>
      {children}
    </span>
  )
}

/** 섹션 머리 띠: ● 키워드 ─────── 01 / 07 (몇 번째 이야기인지) */
export function DetailTag({ label, n, total = 7, dark = false }: { label: string; n: number; total?: number; dark?: boolean }) {
  return (
    <div className={`mb-10 flex items-center justify-between border-b pb-3.5 text-left ${dark ? 'border-white/15' : 'border-ink/15'}`}>
      <span className={`flex items-center gap-2.5 text-[14px] font-bold tracking-[0.06em] ${dark ? 'text-sky-xl' : 'text-ink'}`}>
        <span className={`size-[6px] rounded-full ${dark ? 'bg-sky-xl' : 'bg-ink'}`} />{label}
      </span>
      <span className={`text-[13.5px] font-semibold tabular-nums tracking-[0.04em] ${dark ? 'text-white/45' : 'text-mute'}`}><b className={dark ? 'text-sky-xl' : 'text-ink'}>{String(n).padStart(2, '0')}</b> / {String(total).padStart(2, '0')}</span>
    </div>
  )
}

export function Blank({ children }: { children: ReactNode }) {
  return <span className="font-semibold text-mocha-d [[data-tone=dark]_&]:text-sky-xl">{children}</span>
}

/** 세로선이 위에서 자라났다 사라짐 (섹션 사이 호흡) */
export function VLine({ className = '' }: { className?: string }) {
  return (
    <motion.span aria-hidden className={`mx-auto my-8 block h-12 w-px origin-top bg-sky ${className}`}
      animate={{ scaleY: [0, 1, 1], opacity: [1, 1, 0] }} transition={{ duration: 1.8, times: [0, 0.5, 1], ease: EASE, repeat: Infinity, repeatDelay: 0.2 }} />
  )
}

/* ═════════ 글자 모션 (레퍼런스에서 가져온 것) ═════════ */

/** ① 회색 글자가 왼쪽부터 한 글자씩 색으로 채워짐 → 머묾 → 회색으로 돌아감 (에코따숨 "3초 온열케어") */
export function FillText({ children, color = '#8C6E5C', base = GRAY, duration = 2.6 }: { children: string; color?: string; base?: string; duration?: number }) {
  const chars = [...children]
  const n = chars.length
  return (
    <span className="font-extrabold">
      {chars.map((c, i) => {
        const on = 0.08 + (i / Math.max(n - 1, 1)) * 0.32
        return (
          <motion.span key={i} initial={{ color: base }}
            animate={{ color: [base, base, color, color, base] }}
            transition={{ duration, times: [0, on, Math.min(on + 0.06, 0.8), 0.86, 1], ease: 'easeOut', repeat: Infinity }}>
            {c}
          </motion.span>
        )
      })}
    </span>
  )
}

/** ② ( ) 빈칸에 글자가 타이핑됨 (쿠나 "(나)를 위한") */
export function BlankFill({ text, className = '' }: { text: string; className?: string }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    let alive = true
    ;(async () => {
      while (alive) {
        setN(0); await sleep(300)
        for (let k = 1; k <= text.length && alive; k++) { setN(k); await sleep(110) }
        await sleep(1500)
      }
    })()
    return () => { alive = false }
  }, [text])
  return (
    <span className={`whitespace-nowrap ${className}`}>
      <span className="font-light text-sky-d [[data-tone=dark]_&]:text-sky-xl">(</span>
      <span className="relative mx-1 inline-block font-extrabold">
        <span className="invisible">{text}</span>
        <span className="absolute inset-0 text-center">
          {text.slice(0, n)}
          {n < text.length && <motion.span className="ml-px inline-block h-[0.9em] w-[2px] translate-y-[2px] bg-sky" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.9, repeat: Infinity }} />}
        </span>
      </span>
      <span className="font-light text-sky-d [[data-tone=dark]_&]:text-sky-xl">)</span>
    </span>
  )
}

/** ③ 형광펜처럼 글자 아래쪽 절반을 면으로 칠함 — 왼쪽부터 차오르고, 사라질 땐 옅어짐 (루프 2.8초) */
export function Underline({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <span className="relative isolate inline-block font-extrabold">
      {children}
      <motion.span aria-hidden className="absolute -inset-x-[3px] bottom-[0.06em] -z-10 h-[0.42em] origin-left rounded-[3px] bg-sky/45 [[data-tone=dark]_&]:bg-sky-xl/30"
        initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: [0, 1, 1, 1], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 2.8, times: [0, 0.3, 0.82, 1], ease: EASE, repeat: Infinity, delay }} />
    </span>
  )
}

/** ④ 형광펜 띠 */
export function Marker({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <span className="relative isolate inline-block">
      <motion.span aria-hidden className="absolute inset-x-[-3px] bottom-[0.06em] -z-10 h-[0.42em] origin-left rounded-[2px] bg-marker"
        initial={{ scaleX: 0 }} animate={{ scaleX: [0, 1, 1, 1], opacity: [1, 1, 1, 0] }}
        transition={{ duration: 2.6, times: [0, 0.25, 0.86, 1], ease: EASE, repeat: Infinity, delay }} />
      {children}
    </span>
  )
}


/** ⑥ 줄 단위로 왼쪽부터 드러남 → 오래 머묾 → 짧게 사라짐 */
function RevealLine({ p, start, children }: { p: MotionValue<number>; start: number; children: ReactNode }) {
  const inP = useTransform(p, v => seg(v, start, start + 0.16))
  const outP = useTransform(p, v => seg(v, 0.92, 0.98))
  const clipPath = useTransform(inP, v => `inset(0 ${100 - v * 100}% 0 0)`)
  const y = useTransform(inP, v => (1 - v) * 8)
  const opacity = useTransform([inP, outP] as MotionValue<number>[], ([a, b]: number[]) => a * (1 - b))
  return <motion.span className="block" style={{ clipPath, y, opacity }}>{children}</motion.span>
}
export function Reveal({ lines, className = '', stagger = 0.07, duration = 3 }: { lines: ReactNode[]; className?: string; stagger?: number; duration?: number }) {
  const p = useLoop(duration)
  return (
    <span className={`block ${className}`}>
      {lines.map((l, i) => <RevealLine key={i} p={p} start={0.02 + i * stagger}>{l}</RevealLine>)}
    </span>
  )
}

/** ⑦ 숫자가 슬롯머신처럼 돌다 멈춤 → 또렷하게 머묾 → 짧게 사라짐 (에코따숨 "486.58%") */
function RollDigit({ p, target, order }: { p: MotionValue<number>; target: number; order: number }) {
  const spins = 10 * (order + 1) + target          // 오른쪽 자리일수록 한 바퀴씩 더 돎
  const end = 0.32 + order * 0.06
  const y = useTransform(p, v => `-${seg(v, 0.04, end) * spins}em`)
  const opacity = useTransform(p, v => seg(v, 0, 0.04) * (1 - seg(v, 0.93, 0.99)))
  return (
    <span className="relative inline-block h-[1em] overflow-hidden">
      <motion.span className="flex flex-col" style={{ y, opacity }}>
        {Array.from({ length: spins + 1 }, (_, k) => <span key={k} className="block h-[1em]">{k % 10}</span>)}
      </motion.span>
    </span>
  )
}
export function RollNumber({ value, className = '', duration = 3 }: { value: string; className?: string; duration?: number }) {
  const p = useLoop(duration)
  let order = 0
  return (
    <span className={`inline-flex overflow-hidden leading-none tabular-nums ${className}`} aria-label={value}>
      {[...value].map((ch, i) => /\d/.test(ch)
        ? <RollDigit key={i} p={p} target={+ch} order={order++} />
        : <span key={i}>{ch}</span>)}
    </span>
  )
}

/** ⑧ 불편 신호가 하나씩 켜져 쌓임 → 잠깐 다 켜진 채 머묾 → 함께 꺼짐 (3초 한 바퀴) */
function LightRow({ p, on, i, children }: { p: MotionValue<number>; on: number; i: number; children: ReactNode }) {
  const k = useTransform(p, v => seg(v, on, on + 0.07) * (1 - seg(v, 0.9, 0.97)))
  const opacity = useTransform(k, v => 0.3 + 0.7 * v)
  const boxShadow = useTransform(k, v => `0 0 0 ${v * 5}px rgba(226,213,198,${0.22 * v})`)
  return (
    <div className={`flex items-center gap-4 py-[18px] text-left ${i ? 'border-t border-white/12' : ''}`}>
      <span className="w-5 font-serif text-[16px] italic text-sky-xl/70">0{i + 1}</span>
      <motion.span className="flex-1 text-[17px] font-medium text-white [&_b]:font-bold [&_b]:text-sky-xl" style={{ opacity }}>{children}</motion.span>
      <motion.span aria-hidden className="size-2 rounded-full bg-sky-xl" style={{ opacity: k, scale: k, boxShadow }} />
    </div>
  )
}
export function LightList({ items }: { items: ReactNode[] }) {
  const p = useLoop(3)
  return (
    <div className="border-y border-white/12">
      {items.map((it, i) => <LightRow key={i} p={p} on={0.06 + i * 0.15} i={i}>{it}</LightRow>)}
    </div>
  )
}

/** 은은한 광택이 지나가는 글자 */
export function Sheen({ children, dark = false, className = '' }: { children: ReactNode; dark?: boolean; className?: string }) {
  const base = dark ? '#FFFFFF' : '#8C6E5C'
  const glow = dark ? '#E8DCCD' : '#C9AE98'
  return (
    <motion.span className={`bg-clip-text text-transparent ${className}`}
      style={{ backgroundImage: `linear-gradient(100deg, ${base} 0%, ${base} 38%, ${glow} 50%, ${base} 62%, ${base} 100%)`, backgroundSize: '250% 100%' }}
      animate={{ backgroundPosition: ['120% 0%', '-20% 0%'] }}
      transition={{ duration: 1.8, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.6 }}>
      {children}
    </motion.span>
  )
}

/** 단어가 아래에서 올라오며 바뀜 */
export function WordRoll({ words, interval = 1800 }: { words: string[]; interval?: number }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setI(v => (v + 1) % words.length), interval)
    return () => clearInterval(id)
  }, [words.length, interval])
  return (
    <span className="relative inline-grid overflow-hidden align-bottom">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={i} className="col-start-1 row-start-1 font-semibold text-sky-d [[data-tone=dark]_&]:text-sky-xl"
          initial={{ y: '70%', opacity: 0, filter: 'blur(6px)' }} animate={{ y: '0%', opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '-70%', opacity: 0, filter: 'blur(6px)' }} transition={{ duration: 0.7, ease: EASE }}>
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

/** 인용 문구를 한 글자씩 */
export function Typewriter({ lines }: { lines: string[] }) {
  const full = lines.join('\n')
  const [n, setN] = useState(0)
  useEffect(() => {
    let alive = true
    ;(async () => {
      while (alive) {
        for (let k = 0; k <= full.length && alive; k++) { setN(k); await sleep(full[k - 1] === '\n' ? 260 : 85) }
        await sleep(2600)
      }
    })()
    return () => { alive = false }
  }, [full])
  return (
    <span className="whitespace-pre-line">
      {full.slice(0, n)}
      <motion.span className="ml-[2px] inline-block h-[0.95em] w-[2px] translate-y-[3px] bg-sky"
        animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }} />
    </span>
  )
}

/** 옆으로 계속 흐르는 줄 */
export function Marquee({ children, reverse = false, speed = 28 }: { children: ReactNode; reverse?: boolean; speed?: number }) {
  return (
    <div className="-mx-6 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
      <motion.div className="flex w-max gap-2" animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{ duration: speed, ease: 'linear', repeat: Infinity }}>
        {children}{children}
      </motion.div>
    </div>
  )
}

/* ───────── 이미지·영상 자리 ───────── */
export type SlotKind = '사진' | '영상' | 'GIF' | '서류' | '도면'
/** 이미지 자리 번호: data-slot 문자열 → 페이지 순서 번호 */
export const SlotNo = createContext<Record<string, number>>({})
export const imgNo = (n?: number) => (n ? `IMG-${String(n).padStart(2, '0')}` : '')

/** 촬영 전 빈 자리: 무엇을(what) + 어떻게 찍는지(how). bleed면 화면 끝까지 */
/** 3D 렌더 아래에 다는 와디즈 규정 문구 (작게, 이미지 밖에) */
/* 3D 그래픽 안내 — 2~3섹션에 한 번만, 작고 연하게 */
export function CgCap({ className = '' }: { className?: string }) {
  return <p className={`mt-1.5 text-right text-[8.5px] leading-none text-mute/50 [[data-tone=dark]_&]:text-white/25 ${className}`}>이해를 돕기 위한 3D 그래픽입니다</p>
}

/** 실사로 바꿀 자리 표시 — 오른쪽 위 점선 알약 (todo 문구가 없으면 '수정 예정') */
function TodoBadge({ text }: { text: string }) {
  return <span className="absolute right-3 top-3 z-20 rounded-full border border-dashed border-mocha-d bg-paper/90 px-2.5 py-[3px] text-[11px] font-bold text-mocha-d">{text}</span>
}

/** cg: 3D 렌더 → 아래에 규정 문구(capOff면 부모가 직접 배치). contain: 배경 없는 PNG를 여백 두고 가운데에. bare: 바탕 없이 누끼만 */
export function Slot({ kind, what, how, code, src, cg = false, capOff = false, contain = false, bare = false, noTag = false, temp = false, todo, className = '', compact = false, bleed = false, round = false }: { kind: SlotKind; what: string; how?: string; code?: string; src?: string; cg?: boolean; capOff?: boolean; contain?: boolean; bare?: boolean; noTag?: boolean; temp?: boolean; todo?: string; className?: string; compact?: boolean; bleed?: boolean; round?: boolean }) {
  const tag = `${kind}|${what}|${code ?? ''}|${how ?? ''}`
  const no = imgNo(useContext(SlotNo)[tag])
  const box = `${bleed ? '-mx-6 w-[calc(100%+48px)]' : 'w-full'} ${round ? 'rounded-[6px]' : ''} ${className}`
  if (src) return (<>
    <div data-slot={tag} className={`relative ${bare ? '' : `overflow-hidden ${contain ? 'bg-[linear-gradient(155deg,#F7F2EA,#ECE3D8)]' : 'bg-[#ECE3D8]'}`} ${box}`}>
      <img src={src} alt={what} className={`absolute inset-0 size-full ${bare ? 'object-contain' : contain ? `object-contain ${compact ? 'p-2' : 'p-6'}` : 'object-cover'} ${temp ? 'opacity-45 grayscale-[35%]' : ''}`} />
      {no && !noTag && <span className="absolute left-3 top-3 z-20 rounded-full bg-mocha-d/85 px-2 py-[2px] text-[10.5px] font-bold text-white">{no}</span>}
      {/* temp: 임시로 넣어 둔 이미지 → 연하게 + 표시 (나중에 바꿀 것) */}
      {(temp || todo) && <TodoBadge text={todo ?? '수정 예정'} />}
    </div>
    {/* 작은 칸(compact)은 칸마다 달지 않고, 묶음 아래에 부모가 한 줄로 */}
  </>)
  // 실사 자리: 가운데에 번호와 무엇인지만 (찍는 법은 맨 아래 촬영 체크리스트에)
  return (
    <div data-slot={tag}
      className={`relative flex flex-col items-center justify-center overflow-hidden text-center
        bg-[linear-gradient(155deg,#F4EEE6,#E9DFD3)] [[data-tone=dark]_&]:bg-[linear-gradient(155deg,#6A5548,#5E4A3E)]
        ${compact ? 'gap-1.5 px-2 py-8' : 'gap-2.5 px-7 py-12'} ${box}`}>
      <TodoBadge text={todo ?? '실사 촬영 예정'} />
      {no && <span className={`rounded-full bg-mocha-d font-bold tracking-[.02em] text-white ${compact ? 'px-2.5 py-[3px] text-[12px]' : 'px-3.5 py-1 text-[14px]'}`}>{no}</span>}
      <span className={`font-semibold text-mocha [[data-tone=dark]_&]:text-sky-xl ${compact ? 'text-[10.5px]' : 'text-[12.5px]'}`}>실사 {kind}{code ? ` · ${code}` : ''}</span>
      <span className={`${compact ? 'text-[12.5px]' : 'text-[15px]'} font-bold leading-[1.45] text-ink/80 [[data-tone=dark]_&]:text-white/85`}>{what}</span>
    </div>
  )
}

/** 사진이 차례로 넘어가고 아래 진행바가 움직임 (쿠나 첫 화면) */
export function Crossfade({ slots, ratio = 'aspect-[4/3]', interval = 2200, bleed = true }: { slots: { what: string; how?: string; code?: string; src?: string; cg?: boolean }[]; ratio?: string; interval?: number; bleed?: boolean }) {
  const [i, setI] = useState(0)
  const nos = useContext(SlotNo)
  useEffect(() => {
    const id = setInterval(() => setI(v => (v + 1) % slots.length), interval)
    return () => clearInterval(id)
  }, [slots.length, interval])
  return (
    <div className={bleed ? '-mx-6' : ''}>
      {/* 체크리스트용: 모든 사진 자리를 숨겨 둔 채 남김 */}
      <div className="hidden">{slots.map((s, k) => <Slot key={k} kind="사진" what={s.what} how={s.how} code={s.code} />)}</div>
      <div className={`relative ${ratio} overflow-hidden bg-[#ECE3D8]`}>
        <AnimatePresence initial={false}>
          <motion.div key={i} className="absolute inset-0" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.1, ease: EASE }}>
            {slots[i].src ? <>
              <img src={slots[i].src} alt={slots[i].what} className="size-full object-cover" />
              {nos[`사진|${slots[i].what}|${slots[i].code ?? ''}|${slots[i].how ?? ''}`] && <span className="absolute left-3 top-3 rounded-full bg-mocha-d/85 px-2 py-[2px] text-[10.5px] font-bold text-white">{imgNo(nos[`사진|${slots[i].what}|${slots[i].code ?? ''}|${slots[i].how ?? ''}`])}</span>}
            </> :
            <div className="flex h-full flex-col items-center justify-center gap-2.5 bg-[linear-gradient(155deg,#F4EEE6,#E9DFD3)] p-4 text-center">
              {nos[`사진|${slots[i].what}|${slots[i].code ?? ''}|${slots[i].how ?? ''}`] && <span className="rounded-full bg-mocha-d px-3.5 py-1 text-[14px] font-bold text-white">{imgNo(nos[`사진|${slots[i].what}|${slots[i].code ?? ''}|${slots[i].how ?? ''}`])}</span>}
              <span className="text-[12.5px] font-semibold text-mocha">실사 사진{slots[i].code ? ` · ${slots[i].code}` : ''} · {i + 1}/{slots.length}</span>
              <span className="text-[15px] font-bold text-ink/80">{slots[i].what}</span>
            </div>}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className={`relative mt-3 h-[3px] overflow-hidden bg-line ${bleed ? 'mx-6' : ''}`}>
        <motion.span className="absolute inset-y-0 bg-mocha-d" style={{ width: `${100 / slots.length}%` }}
          animate={{ left: `${(100 / slots.length) * i}%` }} transition={{ duration: 0.8, ease: EASE }} />
      </div>
    </div>
  )
}

/* ───────── 은색 원형 인증 마크 ───────── */
export function Seal({ top, main, sub, size = 112, ring = false }: { top: string; main: ReactNode; sub?: string; size?: number; ring?: boolean }) {
  const r = size / 2 - 11
  const id = `arc-${top.length}-${size}`
  // ring: 가운데를 비운 은색 링 — 바닥(섹션 배경) 위에서 링만 돌고, 로고는 바닥에 그대로 놓임
  const hole = ring ? { WebkitMaskImage: 'radial-gradient(closest-side, transparent 65.5%, #000 66.5%)', maskImage: 'radial-gradient(closest-side, transparent 65.5%, #000 66.5%)' } : undefined
  return (
    <div data-loop="7000" className={`relative shrink-0 rounded-full ${ring ? 'drop-shadow-[0_6px_14px_rgba(0,0,0,.28)]' : 'shadow-[0_8px_20px_rgba(42,36,34,.16)]'}`} style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full bg-[conic-gradient(#ECE9E5,#FFFFFF,#C6C0B8,#F4F1EE,#CFC8BF,#FFFFFF,#DCD6CF,#ECE9E5)]" style={hole} />
      <motion.div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,255,255,.85)_40deg,transparent_90deg)] mix-blend-screen" style={hole}
        animate={{ rotate: 360 }} transition={{ duration: 7, ease: 'linear', repeat: Infinity }} />
      {/* 글자가 두 번 이어져 반 바퀴(7초)마다 같은 모습 → 반짝임 7초와 맞물려 짤로도 끊김 없이 반복 */}
      <motion.svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 14, ease: 'linear', repeat: Infinity }}>
        <defs><path id={id} d={`M${size / 2} ${size / 2}m-${r} 0a${r} ${r} 0 1 1 ${2 * r} 0a${r} ${r} 0 1 1 -${2 * r} 0`} /></defs>
        <text fontSize={size * 0.072} fontWeight={700} letterSpacing={size * 0.018} fill="#6B5245"><textPath href={`#${id}`}>{`${top} · ${top} · `}</textPath></text>
      </motion.svg>
      <div className={`absolute inset-[17%] flex flex-col items-center justify-center rounded-full ${ring ? '' : 'bg-[radial-gradient(circle_at_35%_30%,#FFFFFF,#E9E5E0_72%)] shadow-[inset_0_1px_3px_rgba(0,0,0,.12)]'}`}>
        {typeof main === 'string'
          ? <b className={`font-bold leading-none tracking-[-0.02em] ${ring ? 'text-white' : 'text-mocha-d'}`} style={{ fontSize: size * 0.17 }}>{main}</b>
          : <span className={`flex ${ring ? 'text-white' : 'text-mocha-d'}`} style={{ height: size * 0.1 }}>{main}</span>}
        {sub && <small className="mt-1 text-[10.5px] font-semibold tracking-[0.1em] text-mute">{sub}</small>}
      </div>
    </div>
  )
}

/** 월계수로 감싼 숫자 */
export function Laurel({ label, children, big = false }: { label: string; children: ReactNode; big?: boolean }) {
  const half = (
    <g fill="#D8D0C5">
      <path d="M40 100 C 18 84, 14 50, 30 18" fill="none" stroke="#CBC2B7" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M33 88 q-12 -2 -14 -12 q12 0 14 12z M26 74 q-12 -4 -12 -14 q12 2 12 14z M23 59 q-11 -6 -9 -16 q11 4 9 16z M24 44 q-9 -8 -5 -17 q9 6 5 17z M29 30 q-6 -9 0 -16 q6 8 0 16z" />
    </g>
  )
  const w = big ? 220 : 170
  return (
    <div className="relative flex h-[108px] flex-col items-center justify-center">
      <svg viewBox={`0 0 ${w} 118`} className="absolute inset-0 h-full w-full" aria-hidden>
        <g transform={`translate(${big ? 40 : 14} 6)`}>{half}</g>
        <g transform={`translate(${w - (big ? 40 : 14)} 6) scale(-1 1)`}>{half}</g>
      </svg>
      <small className="relative text-[14px] font-semibold text-ink">{label}</small>
      <b className={`relative mt-1 font-bold tracking-[-0.03em] text-sky-d ${big ? 'text-[46px]' : 'text-[38px]'}`}>{children}</b>
    </div>
  )
}
