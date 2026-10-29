import { motion } from 'motion/react'
import { useEffect, useState, type ReactNode } from 'react'
import { BlankFill, Crossfade, EASE, Laurel, Logo, Marquee, RollNumber, Seal, Slot, Typewriter, WordRoll } from '../ui'
import { FrontView, RoomView, TopView } from '../diagrams'

/* ═══════════════════════════════════════════════════════════════
   시안 2 — "두 개의 점"
   430px 기준으로 짜고 2배(zoom 2) → 가로 860px.
   바탕은 아이보리·화이트, 포인트는 모카, 두 번째 포인트는 톤 다운 스카이.
   진한 색은 배너·핵심 메시지·정면도 카드 세 곳에만.
   ═══════════════════════════════════════════════════════════════ */
const C = {
  bg: '#FBF8F3', ivory: '#F4EDE3', sand: '#EAE0D3', line: '#E6DDD2',
  mocha: '#8C6E5C', mochaD: '#5E4A3E', deep: '#3E322B',
  ink: '#2B231F', sub: '#6F655E', mute: '#857A72',
  sky: '#8FA7B8', skyD: '#56707F', skyL: '#E5EDF2',
}

/* ───────── 기본 틀 ───────── */
function Sec({ cap, bg = C.bg, className = '', children }: { cap: string; bg?: string; className?: string; children: ReactNode }) {
  return <section data-cap={cap} className={`relative overflow-hidden px-6 py-20 text-center ${className}`} style={{ background: bg }}>{children}</section>
}

/** ●● POINT 01 — 모든 섹션 번호에 '두 개의 점' */
function Eyebrow({ n, label = 'POINT', dark = false }: { n?: string; label?: string; dark?: boolean }) {
  return (
    <p className="mb-5 inline-flex items-center gap-2.5 text-[12px] font-bold tracking-[0.22em]" style={{ color: dark ? '#C9D6DF' : C.skyD }}>
      <span className="flex gap-[5px]">
        {[0, 1].map(i => (
          <motion.i key={i} className="block size-[7px] rounded-full" style={{ background: dark ? '#C9D6DF' : C.sky }}
            animate={{ scale: [1, 1.35, 1] }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }} />
        ))}
      </span>
      {label}{n ? ` ${n}` : ''}
    </p>
  )
}

/** 리드(가는 16.5) + 제목(32, 기본 400 · 핵심어 <b> 800) */
function Title({ lead, children, dark = false, size = 32 }: { lead?: ReactNode; children: ReactNode; dark?: boolean; size?: number }) {
  return (
    <>
      {lead && <p className="text-[16.5px] font-medium leading-[1.5]" style={{ color: dark ? 'rgba(255,255,255,.7)' : C.sub }}>{lead}</p>}
      <h2 className="mt-2.5 font-normal leading-[1.32] tracking-[-0.045em] [&_b]:font-extrabold" style={{ fontSize: size, color: dark ? '#fff' : C.ink }}>{children}</h2>
    </>
  )
}
function Body({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`mt-5 text-[14.5px] leading-[1.8] [&_b]:font-bold ${className}`} style={{ color: C.sub }}>{children}</p>
}
const M = ({ children }: { children: ReactNode }) => <b style={{ color: C.mocha }}>{children}</b>

/* ───────── 시그니처 모션 ───────── */

/** 사진 위 '점' 표시: 맥박처럼 뛰는 스카이 점 + 라벨 */
function Hotspot({ x, y, label, side = 'right', delay = 0 }: { x: number; y: number; label: string; side?: 'left' | 'right'; delay?: number }) {
  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
      <motion.span className="absolute -left-[18px] -top-[18px] size-9 rounded-full border-2" style={{ borderColor: C.sky }}
        animate={{ scale: [0.4, 1.4], opacity: [0.9, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay }} />
      <span className="absolute -left-[7px] -top-[7px] size-[14px] rounded-full border-[3px] border-white shadow-[0_2px_8px_rgba(0,0,0,.3)]" style={{ background: C.sky }} />
      <motion.span className={`absolute top-1/2 h-px w-7 -translate-y-1/2 bg-white ${side === 'right' ? 'left-[10px] origin-left' : 'right-[10px] origin-right'}`}
        animate={{ scaleX: [0, 1, 1, 0] }} transition={{ duration: 4, times: [0, .15, .85, 1], repeat: Infinity, delay, ease: EASE }} />
      <motion.span className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-white px-2.5 py-[3px] text-[10.5px] font-extrabold tracking-[0.08em] shadow-[0_4px_12px_rgba(0,0,0,.18)] ${side === 'right' ? 'left-[42px]' : 'right-[42px]'}`}
        style={{ color: C.skyD }}
        animate={{ opacity: [0, 1, 1, 0], x: side === 'right' ? [-6, 0, 0, -6] : [6, 0, 0, 6] }} transition={{ duration: 4, times: [0, .18, .85, 1], repeat: Infinity, delay, ease: EASE }}>
        {label}
      </motion.span>
    </div>
  )
}

/** 취소선이 그어지며 글자가 흐려짐 → 순서대로, 모두 지워진 뒤 다시 */
function Strike({ children, i, total }: { children: ReactNode; i: number; total: number }) {
  const D = 6.5
  const a = (0.4 + i * 0.9) / D
  return (
    <span className="relative inline-block">
      <motion.span animate={{ color: [C.ink, C.ink, '#C2B8AE', '#C2B8AE', C.ink] }} transition={{ duration: D, times: [0, a, a + .08, .9, 1], repeat: Infinity }}>{children}</motion.span>
      <motion.span aria-hidden className="absolute inset-x-[-4px] top-[54%] h-[3px] origin-left rounded-full" style={{ background: C.mocha }}
        animate={{ scaleX: [0, 0, 1, 1, 0], opacity: [1, 1, 1, 1, 0] }} transition={{ duration: D, times: [0, a, a + .1, .9, 1], repeat: Infinity, ease: EASE }} />
      {i === total - 1 && null}
    </span>
  )
}

/** 형광펜 (연한 스카이) */
function Mark({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <span className="relative isolate inline-block">
      <motion.span aria-hidden className="absolute -inset-x-1 bottom-[0.05em] -z-10 h-[0.45em] origin-left" style={{ background: '#D6E3EB' }}
        animate={{ scaleX: [0, 1, 1, 1], opacity: [1, 1, 1, 0] }} transition={{ duration: 5, times: [0, .2, .88, 1], repeat: Infinity, repeatDelay: .4, delay, ease: EASE }} />
      {children}
    </span>
  )
}

/** 궤도: 납작한 원 위를 두 점이 돎 (섹션 사이 장식) */
function Orbit({ w = 120, dark = false }: { w?: number; dark?: boolean }) {
  // 납작한 타원 궤도를 두 점이 마주 보며 돎 (SVG animateMotion)
  const d = 'M -50 0 A 50 15 0 1 1 50 0 A 50 15 0 1 1 -50 0'
  return (
    <svg viewBox="-60 -22 120 44" className="mx-auto block" style={{ width: w, overflow: 'visible' }}>
      <path d={d} fill="none" stroke={dark ? 'rgba(255,255,255,.28)' : '#D9CDBE'} strokeWidth="1" strokeDasharray="2 3" />
      {[0, 1].map(i => (
        <circle key={i} r="4.2" fill={i ? (dark ? '#fff' : C.mocha) : C.sky}>
          <animateMotion dur="5s" repeatCount="indefinite" path={d} begin={`-${i * 2.5}s`} />
        </circle>
      ))}
    </svg>
  )
}

/** 사진 + 왼쪽 위 '임시' 라벨 (Slot 그대로 사용, 860에서 2배라 살짝 작게) */
const Photo = (p: { what: string; code?: string; src: string; className?: string; bleed?: boolean; round?: boolean; compact?: boolean }) =>
  <Slot kind="사진" {...p} />

/* ═══════════════════ 섹션 ═══════════════════ */

function Banner() {
  return (
    <div data-cap="00_배너" className="flex items-center justify-center gap-3 px-5 py-3.5 text-white" style={{ background: C.deep }}>
      <span className="rounded-full px-2 py-[2px] text-[10px] font-extrabold tracking-[0.1em]" style={{ background: C.sky, color: C.deep }}>OPEN</span>
      <p className="text-[13px] font-medium">알림신청하면 <b className="font-extrabold">슈퍼얼리버드 15개</b> 오픈 알림 · 11/16(월)</p>
    </div>
  )
}

function Hero() {
  return (
    <section data-cap="01_히어로" style={{ background: C.bg }}>
      <div className="px-6 pb-9 pt-12 text-center">
        <div className="flex justify-center" style={{ color: C.mochaD }}><Logo className="h-[13px]" /></div>
        <p className="mt-9 text-[14px] font-semibold tracking-[-0.01em]" style={{ color: C.skyD }}>거실장 위 대형 TV 회전 받침대</p>
        <h1 className="mt-3 text-[42px] font-normal leading-[1.2] tracking-[-0.055em] [&_b]:font-extrabold" style={{ color: C.ink }}>
          <b>각도</b>의 차이가<br /><b style={{ color: C.mocha }}>생활</b>을 바꿉니다
        </h1>
        <p className="mt-5 text-[15.5px] font-medium" style={{ color: C.sub }}><WordRoll words={['소파에서', '식탁에서', '창가에서']} /> 보기 좋은 각도로, 손끝으로</p>
      </div>
      <div className="relative">
        <Photo what="손끝으로 밀면 TV가 제자리에서 도는 장면" code="A1" src="/temp/hero.png" className="aspect-[4/5]" />
        <Hotspot x={23} y={43} label="POINT 1" side="right" />
        <Hotspot x={82} y={61} label="POINT 2" side="left" delay={0.5} />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-6 pb-6 pt-16 text-left text-white">
          <p className="font-serif text-[15px] italic text-white/80">Two points, one turn.</p>
          <p className="mt-1 text-[19px] font-medium leading-[1.4]">다리가 둘인 대형 TV를<br /><b className="font-extrabold">두 개의 점</b>으로 받칩니다</p>
        </div>
      </div>
      <div className="grid grid-cols-3 px-6 py-7" style={{ background: C.bg }}>
        {[['벽 타공', '0'], ['설치 공구', '0'], ['베어링·오일', '0']].map(([t, v], i) => (
          <div key={t} className={`text-center ${i < 2 ? 'border-r' : ''}`} style={{ borderColor: C.line }}>
            <b className="block text-[32px] font-extrabold leading-none" style={{ color: C.skyD }}><RollNumber value={v} /></b>
            <span className="mt-2 block text-[12.5px] font-medium" style={{ color: C.sub }}>{t}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function PriceCard({ tier, qty, price, off, best = false }: { tier: string; qty: string; price: number; off: number; best?: boolean }) {
  const pct = Math.round((1 - price / 179900) * 100)
  const won = (n: number) => n.toLocaleString('ko-KR')
  return (
    <div className="relative overflow-hidden rounded-[22px] bg-white text-left shadow-[0_12px_32px_rgba(62,50,43,.08)]" style={best ? { boxShadow: `0 0 0 2px ${C.sky}, 0 16px 36px rgba(62,50,43,.12)` } : undefined}>
      <h4 className="flex items-center justify-center gap-2 py-3 text-[14px] font-bold text-white" style={{ background: best ? C.deep : C.mochaD }}>
        {best && <span className="rounded-full px-2 py-[1px] text-[9.5px] font-extrabold tracking-[0.1em]" style={{ background: C.sky, color: C.deep }}>BEST</span>}
        {tier} · {qty}
      </h4>
      <div className="grid grid-cols-[118px_1fr] gap-5 p-5">
        <div className="relative">
          <Photo what="2-POINT 1세트" code="리워드" src="/temp/reward.png" round compact className="aspect-square !rounded-2xl" />
          <motion.span className="absolute -bottom-3 -right-4 flex size-[62px] items-center justify-center rounded-full text-[19px] font-extrabold text-white shadow-[0_8px_18px_rgba(94,74,62,.35)]"
            style={{ background: `radial-gradient(circle at 32% 28%, #B9998A, ${C.mocha} 55%, ${C.mochaD})` }}
            animate={best ? { scale: [1, 1.08, 1] } : undefined} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>{pct}%</motion.span>
        </div>
        <div>
          <p className="text-[14px] font-medium" style={{ color: C.sub }}>다큐 턴패드</p>
          <p className="text-[21px] font-extrabold tracking-[-0.03em]" style={{ color: C.ink }}>2-POINT 1세트</p>
          <dl className="mt-3 border-t pt-2.5 text-[12.5px]" style={{ borderColor: C.line, color: C.sub }}>
            <div className="flex justify-between"><dt>정상가</dt><dd className="line-through" style={{ color: C.mute }}>179,900원</dd></div>
            <div className="mt-1 flex items-baseline justify-between"><dt>펀딩가</dt>
              <dd className="text-[24px] font-extrabold tracking-[-0.02em]" style={{ color: C.ink }}>{best ? <RollNumber value={won(price)} /> : won(price)}<span className="text-[13px] font-semibold">원</span></dd></div>
          </dl>
          <p className="mt-2.5 flex items-center justify-between rounded-lg px-3 py-2 text-[12px] font-bold text-white" style={{ background: best ? C.mochaD : C.mocha }}>
            할인 금액<b className="text-[15px] font-extrabold">-{won(off)}원</b>
          </p>
        </div>
      </div>
    </div>
  )
}
function Offer() {
  return (
    <Sec cap="02_오픈혜택" bg={C.ivory}>
      <span className="mb-6 inline-block rounded-full px-5 py-2 text-[13px] font-bold text-white" style={{ background: C.mochaD }}>와디즈 단독 공개</span>
      <Title lead="처음 공개하는 가격,"><M>2-POINT</M> <b>오픈 혜택</b></Title>
      <p className="mt-4 text-[12px]" style={{ color: C.mute }}>* 리워드별 수량이 모두 펀딩되면 다음 단계 가격으로 바뀝니다.</p>
      <div className="mt-9 flex flex-col gap-4">
        <PriceCard tier="슈퍼얼리버드" qty="15개 한정" price={129900} off={50000} best />
        <PriceCard tier="얼리버드" qty="40개 한정" price={139900} off={40000} />
        <PriceCard tier="펀딩가" qty="200개" price={149900} off={30000} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-left">
        {[['+ 혜택', '기간 제한 없는 무상 A/S'], ['+ 이벤트', '24시간 페이백 · 72시간 커피']].map(([e, t]) => (
          <div key={e} className="rounded-2xl bg-white px-4 py-4">
            <p className="text-[11.5px] font-extrabold" style={{ color: C.skyD }}>{e}</p>
            <p className="mt-1 text-[13.5px] font-bold leading-[1.45]" style={{ color: C.ink }}>{t}</p>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function Problem() {
  const opts = ['벽에 구멍을 뚫고', '스탠드로 바꾸고', '거실장을 새로 사야 할까요?']
  return (
    <Sec cap="03_문제제기" bg="#fff">
      <Eyebrow label="BEFORE" />
      <p className="text-[16.5px] font-medium" style={{ color: C.sub }}>TV 방향 하나 바꾸려고,</p>
      <div className="mt-4 flex flex-col gap-2 text-[28px] font-bold leading-[1.35] tracking-[-0.045em]">
        {opts.map((o, i) => <div key={o}><Strike i={i} total={opts.length}>{o}</Strike></div>)}
      </div>
      <div className="my-10"><Orbit w={110} /></div>
      <Eyebrow label="AFTER" />
      <Title lead="아니요.">거실장은 <Mark><b>그대로</b></Mark>,<br />TV만 <b style={{ color: C.mocha }}>돌리면</b> 됩니다</Title>
      <Photo what="수납이 정돈된 거실장 위 대형 TV" code="A3" src="/temp/a3.png" bleed className="mt-12 aspect-[4/3]" />
    </Sec>
  )
}

function Statement() {
  return (
    <section data-cap="04_메시지" className="relative overflow-hidden px-6 py-24 text-center text-white" style={{ background: C.deep }}>
      <p className="font-serif text-[15px] italic text-white/55">Less parts, more precision.</p>
      <p className="mt-4 text-[17px] font-medium leading-[1.6] text-white/70">회전판도, 베어링도, 오일도<br />모두 덜어내고</p>
      <h2 className="mt-4 text-[38px] font-normal leading-[1.28] tracking-[-0.05em] [&_b]:font-extrabold">
        <b>두 개의 점</b>만<br />남겼습니다
      </h2>
      <div className="mt-12"><Orbit w={220} dark /></div>
    </section>
  )
}

function Intro() {
  const parts = [{ y: 30, t: '상판', s: 'UHMWPE' }, { y: 51, t: '연결 핀', s: 'UHMWPE' }, { y: 70, t: '하판', s: 'PTFE' }]
  return (
    <Sec cap="05_제품소개" bg={`linear-gradient(180deg, ${C.bg}, ${C.ivory})`} className="pb-16">
      <p className="font-serif text-[15px] italic" style={{ color: C.mute }}>Designed by structural engineers</p>
      <p className="mt-3 text-[16.5px] font-medium" style={{ color: C.sub }}>구조시험 전문기업 대표가 설계한</p>
      <p className="mt-3 text-[64px] font-extrabold leading-none tracking-[-0.05em]" style={{ color: C.mocha }}>2-POINT</p>
      <p className="mt-3 text-[15px] font-bold tracking-[0.02em]" style={{ color: C.ink }}>다큐 턴패드 투포인트</p>
      <div className="relative mx-auto mt-10 w-[86%]">
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
          <Photo what="상판·핀·하판 분리 컷" code="추가" src="/temp/float.jpg" round className="aspect-square !rounded-[28px] shadow-[0_30px_50px_-28px_rgba(62,50,43,.4)]" />
        </motion.div>
        {parts.map((p, i) => (
          <motion.div key={p.t} className="absolute -right-3 flex items-center gap-2" style={{ top: `${p.y}%` }}
            animate={{ opacity: [0, 1, 1, 0], x: [8, 0, 0, 8] }} transition={{ duration: 5, times: [0, .14, .86, 1], repeat: Infinity, delay: i * 0.35, ease: EASE }}>
            <span className="h-px w-6" style={{ background: C.skyD }} />
            <span className="rounded-full bg-white px-3 py-1 text-left text-[11px] font-extrabold shadow-[0_4px_12px_rgba(0,0,0,.08)]" style={{ color: C.ink }}>{p.t} <span style={{ color: C.skyD }}>{p.s}</span></span>
          </motion.div>
        ))}
      </div>
      <div className="mt-12 flex flex-col gap-2">
        <Marquee speed={26}>{['벽 타공 없이', '공구 없이', '무급유', '금속 부품 0개', '국내 CNC 가공', '디자인특허', '3가지 컬러'].map(t =>
          <span key={t} className="whitespace-nowrap rounded-full border bg-white px-4 py-2 text-[13px] font-bold" style={{ borderColor: C.line, color: C.mochaD }}>{t}</span>)}</Marquee>
      </div>
    </Sec>
  )
}

function Point01() {
  return (
    <Sec cap="06_POINT01" bg="#fff">
      <Eyebrow n="01" />
      <Title lead="하나의 축이 아니라"><b>두 개의 점</b>으로 받칩니다</Title>
      <Body>두 패드가 TV의 두 다리를 하나씩 받쳐<br />TV는 원래 서 있던 자세 그대로 섭니다.<br /><b style={{ color: C.ink }}>바뀌는 것은 각도뿐입니다.</b></Body>
      <div className="mt-9 rounded-[26px] px-4 pb-5 pt-6" style={{ background: C.deep }}>
        <FrontView />
        <p className="mt-2 text-[11.5px] text-white/50">정면에서 본 모습 · 다리마다 패드 하나씩</p>
      </div>
      <div className="relative mt-3">
        <Photo what="TV를 손으로 밀어도 흔들리지 않고 각도만 바뀜" code="A5" src="/temp/a5.png" round className="aspect-[4/5] !rounded-[26px]" />
        <Hotspot x={40} y={80} label="미끄럼 방지" side="right" />
      </div>
      <div className="mt-6 flex flex-col gap-2.5 text-left">
        {[['다리마다 패드 하나씩', 'TV의 무게를 두 점에 나눠 받칩니다'], ['바닥의 미끄럼 방지 줄', '거실장을 붙잡아 위의 상판만 움직입니다'], ['TV 자세는 그대로', '높이와 기울기는 바뀌지 않습니다']].map(([b, s], i) => (
          <div key={b} className="flex items-center gap-4 rounded-2xl px-5 py-4" style={{ background: C.bg }}>
            <motion.span className="flex size-7 shrink-0 items-center justify-center rounded-full" style={{ background: C.sky }}
              animate={{ boxShadow: ['0 0 0 0 rgba(143,167,184,.6)', '0 0 0 9px rgba(143,167,184,0)'] }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.5 }}>
              <svg viewBox="0 0 12 10" className="w-3"><path d="M1 5l3.5 3.5L11 1.5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </motion.span>
            <p className="text-[15px] font-bold" style={{ color: C.ink }}>{b}<small className="mt-0.5 block text-[12.5px] font-normal" style={{ color: C.sub }}>{s}</small></p>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function Point02() {
  return (
    <Sec cap="07_POINT02" bg={`linear-gradient(180deg, #fff, ${C.skyL})`}>
      <Eyebrow n="02" />
      <Title lead="밀려나지 않고 그 자리에서">두 패드의 홈은<br /><BlankFill text="같은 원" /> 위에 있습니다</Title>
      <Body>두 패드의 홈은 TV 가운데를 중심으로 한 하나의 원에서 나왔습니다.<br />그래서 TV를 밀면 <b style={{ color: C.ink }}>방향만</b> 바뀝니다.</Body>
      <div className="mt-9 rounded-[26px] bg-white px-3 pb-4 pt-5 shadow-[0_14px_36px_rgba(62,50,43,.06)]"><TopView /></div>
      <div className="mt-14">
        <p className="text-[16px] font-medium" style={{ color: C.sub }}>회전판·베어링·오일을 덜어내고 남긴 부품</p>
        <p className="mt-2 text-[22px] font-bold" style={{ color: C.ink }}>단 <span className="text-[72px] font-extrabold leading-none tracking-[-0.04em]" style={{ color: C.mocha }}><RollNumber value="6" /></span>개</p>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-2">
        {[['상판', '2', 'UHMWPE'], ['하판', '2', 'PTFE'], ['연결 핀', '2', 'UHMWPE']].map(([t, n, m]) => (
          <div key={t} className="rounded-2xl bg-white py-4">
            <p className="text-[12.5px] font-bold" style={{ color: C.sub }}>{t}</p>
            <p className="text-[26px] font-extrabold leading-tight" style={{ color: C.ink }}>{n}</p>
            <p className="text-[10.5px] font-bold tracking-[0.05em]" style={{ color: C.skyD }}>{m}</p>
          </div>
        ))}
      </div>
      <Photo what="부품 6개 탑뷰" code="B1" src="/temp/b1.png" round className="mt-3 aspect-[4/3] !rounded-[26px]" />
    </Sec>
  )
}

function Point03() {
  return (
    <Sec cap="08_POINT03" bg="#fff">
      <Eyebrow n="03" />
      <Title lead="앉은 자리에 맞춰 조금만">그 몇 도가<br /><Mark><b>거실의 하루</b></Mark>를 바꿉니다</Title>
      <Body>소파 끝자리에서도 고개를 돌리지 않고,<br />오후 햇빛이 비칠 때는 살짝 비켜 둡니다.</Body>
      <div className="mt-9 rounded-[26px] px-3 pb-4 pt-5" style={{ background: C.bg }}><RoomView /></div>
      <div className="mt-4 overflow-hidden rounded-[26px]">
        <Crossfade bleed={false} ratio="aspect-[4/5]" slots={[
          { what: '소파에서 본 TV', code: 'A4', src: '/temp/a4_sofa.png' },
          { what: '식탁에서 본 TV', code: 'A4', src: '/temp/a4_dining.png' },
          { what: '창가에서 본 TV', code: 'A4', src: '/temp/a4_window.png' }]} />
      </div>
    </Sec>
  )
}

function Point04() {
  return (
    <Sec cap="09_POINT04" bg={C.ivory}>
      <Eyebrow n="04" />
      <Title lead="받치는 판과 미끄러지는 판,">소재를 나눠<br /><b>조용하게</b> 돕니다</Title>
      <Body>무게는 상판이 받고 움직임은 두 판이 맞닿는 면에서 생겨<br /><b style={{ color: C.ink }}>기름 없이도 부드럽게</b> 돌아갑니다.</Body>
      <Photo what="상판·하판 표면 결" code="B3" src="/temp/b3.jpg" round className="mt-9 aspect-[4/3] !rounded-[26px]" />
      <div className="relative mt-3 grid grid-cols-2 gap-3">
        {[['상판 · 핀', 'UHMWPE', '마모와 충격에 강함', '#F3EDE3'], ['하판', 'PTFE', '마찰이 낮음', '#FFFFFF']].map(([s, b, d, c], i) => (
          <div key={b} className="rounded-[22px] bg-white px-4 py-6">
            <motion.div className="mx-auto h-3 w-20 rounded-full border" style={{ background: c, borderColor: C.line }}
              animate={{ x: i ? [0, 0] : [-6, 6, -6] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
            <p className="mt-4 text-[12px] font-bold" style={{ color: C.mute }}>{s}</p>
            <p className="text-[22px] font-extrabold tracking-[-0.02em]" style={{ color: C.mochaD }}>{b}</p>
            <p className="mt-1 text-[12.5px]" style={{ color: C.sub }}>{d}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 text-[11.5px]" style={{ color: C.mute }}>두 소재 모두 식품에 닿는 곳에도 쓰이는 소재입니다 · 금속 부품 0개</p>
    </Sec>
  )
}

function Install() {
  const steps = [['패드 놓기', 'TV 다리 간격에 맞춰 두 패드를 놓습니다', '/temp/a7_1.jpg', 'A7-1'], ['TV 올리기', '두 다리를 패드 위에 하나씩 올립니다', '/temp/a7_2.png', 'A7-2'], ['손끝으로 돌리기', '보고 싶은 쪽으로 살짝 밉니다', '/temp/a7_3.png', 'A1']]
  const [on, setOn] = useState(0)
  useEffect(() => { const id = setInterval(() => setOn(v => (v + 1) % 3), 1800); return () => clearInterval(id) }, [])
  return (
    <Sec cap="10_설치" bg="#fff">
      <Eyebrow label="HOW TO USE" />
      <Title lead="공구도, 벽 공사도 없이">놓고, 올리면 <b style={{ color: C.mocha }}>끝</b></Title>
      <div className="mt-10 flex flex-col gap-3 text-left">
        {steps.map(([t, d, src, code], i) => (
          <motion.div key={t} className="grid grid-cols-[132px_1fr] items-center gap-5 rounded-[22px] p-3"
            animate={{ background: on === i ? C.ivory : '#FFFFFF', boxShadow: on === i ? `0 0 0 2px ${C.sky}` : '0 0 0 1px #EEE7DD' }} transition={{ duration: .5 }}>
            <Photo what={t} code={code} src={src} round compact className="aspect-square !rounded-2xl" />
            <div>
              <p className="text-[12px] font-extrabold tracking-[0.18em]" style={{ color: on === i ? C.skyD : C.mute }}>STEP 0{i + 1}</p>
              <p className="mt-1 text-[19px] font-extrabold" style={{ color: C.ink }}>{t}</p>
              <p className="mt-1 text-[13px] leading-[1.55]" style={{ color: C.sub }}>{d}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <p className="mt-8 text-[14px]" style={{ color: C.sub }}>두께 <b className="mx-1 text-[30px] font-extrabold" style={{ color: C.mocha }}>[ ]mm</b> 사운드바도 그대로</p>
    </Sec>
  )
}

function Colors() {
  const cs = [['화이트', '#FFFFFF', '/temp/c_white.jpg'], ['아이보리', '#F3EDE3', '/temp/c_ivory.jpg'], ['모카', '#8A6A52', '/temp/c_mocha.jpg']]
  const [on, setOn] = useState(0)
  useEffect(() => { const id = setInterval(() => setOn(v => (v + 1) % 3), 2200); return () => clearInterval(id) }, [])
  return (
    <Sec cap="11_색상" bg={`linear-gradient(180deg, ${C.bg}, ${C.sand})`}>
      <p className="font-serif text-[15px] italic" style={{ color: C.mute }}>Three colors, one living room</p>
      <div className="mt-3"><Title lead="거실장 색에 맞춰 고르는"><b style={{ color: C.mocha }}>세 가지</b> 컬러</Title></div>
      <Body>세 가지 모두 <b style={{ color: C.ink }}>가죽 질감의 시트</b>로 마감했습니다.</Body>
      <div className="relative mt-9 overflow-hidden rounded-[26px]">
        {cs.map(([n, , src], i) => (
          <motion.div key={n} className={i ? 'absolute inset-0' : ''} animate={{ opacity: on === i ? 1 : 0 }} transition={{ duration: .8, ease: EASE }}>
            <Photo what={`${n} 컬러`} code="A9" src={src} className="aspect-[4/3]" />
          </motion.div>
        ))}
      </div>
      <div className="mt-6 flex justify-center gap-6">
        {cs.map(([n, c], i) => (
          <div key={n} className="flex flex-col items-center gap-2">
            <motion.span className="size-11 rounded-full border" style={{ background: c, borderColor: '#D7CEC3' }}
              animate={{ boxShadow: on === i ? `0 0 0 3px #fff, 0 0 0 5px ${C.sky}` : '0 0 0 0 #fff' }} transition={{ duration: .4 }} />
            <span className="text-[13.5px] font-bold" style={{ color: on === i ? C.ink : C.mute }}>{n}</span>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function Recommend() {
  const rows = ['벽 타공 없이 TV 방향을 바꾸고 싶은 분', '수납 거실장을 그대로 쓰고 싶은 분', '소파·식탁 어디서든 화면을 보고 싶은 분', '조용하고 녹슬지 않는 받침대를 찾는 분', '오래 쓸 물건을 고르는 분']
  return (
    <Sec cap="12_추천" bg="#fff">
      <Eyebrow label="FOR YOU" />
      <Title lead="다큐 턴패드 2-POINT,">이런 분들께 <b>추천드립니다</b></Title>
      <div className="mt-9 overflow-hidden rounded-[26px] text-left" style={{ background: C.bg }}>
        {rows.map((r, i) => (
          <div key={r} className={`flex items-center gap-4 px-5 py-[17px] ${i ? 'border-t' : ''}`} style={{ borderColor: C.line }}>
            <span className="font-serif text-[18px] italic" style={{ color: C.sky }}>0{i + 1}</span>
            <p className="text-[15px] font-semibold" style={{ color: C.ink }}>{r}</p>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function Trust() {
  return (
    <Sec cap="13_신뢰" bg={C.ivory}>
      <Eyebrow label="TRUST" />
      <Title lead="구조를 시험하던 사람이 만든">믿고 올릴 수 있는<br /><b style={{ color: C.mocha }}>다큐 2-POINT</b></Title>
      <div className="mt-9 grid grid-cols-3">
        <Laurel label="시제품"><RollNumber value="20" /><sub className="align-baseline text-[16px]">+</sub></Laurel>
        <Laurel label="도면 수정"><RollNumber value="10" /><sub className="align-baseline text-[16px]">+</sub></Laurel>
        <Laurel label="금속 부품"><RollNumber value="0" /></Laurel>
      </div>
      <Body>다큐는 구조시험 전문기업 STN을 이끌어 온 대표가 만든 생활 브랜드입니다.</Body>
      <Photo what="시제품을 순서대로 늘어놓은 탑뷰" code="B4" src="/temp/b4.jpg" round className="mt-8 aspect-[4/3] !rounded-[26px]" />
      <div className="mt-6 flex items-center gap-5 rounded-[26px] bg-white px-5 py-6 text-left">
        <Seal top="GUARANTEE · DACU" main="A/S" sub="무상" size={92} />
        <div>
          <p className="text-[17px] font-extrabold" style={{ color: C.ink }}>기간 제한 없는 <span style={{ color: C.mocha }}>무상 A/S</span></p>
          <p className="mt-1.5 text-[12.5px] leading-[1.6]" style={{ color: C.sub }}>쓰다가 문제가 생기면 기간과 상관없이<br />다큐 본사가 무상으로 [수리·교체]해 드립니다.</p>
        </div>
      </div>
    </Sec>
  )
}

function Reviews() {
  return (
    <Sec cap="14_후기" bg="#fff">
      <Eyebrow label="REAL REVIEW" />
      <Title lead="먼저 써본 일곱 집이 남긴">체험단의 <b>실제 거실</b></Title>
      <p className="mt-6 rounded-xl px-4 py-3 text-left text-[12px] leading-[1.6]" style={{ background: C.bg, color: C.sub }}>아래 후기는 다큐가 체험단 일곱 분께 제품을 무료로 제공하고 받은 후기입니다.</p>
      <div className="mt-4 flex flex-col gap-3 text-left">
        {[1, 2, 3].map(n => (
          <div key={n} className="grid grid-cols-[120px_1fr] overflow-hidden rounded-[22px]" style={{ background: C.bg }}>
            <Photo what={`체험단 거실 ${n}`} src={`/temp/rv${n}.jpg`} compact className="min-h-[140px]" />
            <div className="p-4">
              <p className="text-[11px] tracking-[2px]" style={{ color: C.sky }}>★★★★★</p>
              <p className="mt-1 text-[15.5px] font-extrabold" style={{ color: C.ink }}>[후기 핵심 한 줄]</p>
              <p className="mt-1.5 text-[12px] leading-[1.55]" style={{ color: C.sub }}>[후기 원문, 고치지 않고 인용]</p>
              <p className="mt-2 text-[10.5px]" style={{ color: C.mute }}>[TV 크기·브랜드] · [닉네임 일부]</p>
            </div>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function Maker() {
  return (
    <Sec cap="15_메이커" bg={C.bg}>
      <p className="font-serif text-[15px] italic" style={{ color: C.mute }}>Maker's story</p>
      <div className="mt-3"><Title lead="대표님이 직접 전하는">이 제품을 <b>만든 이유</b></Title></div>
      <Photo what="대표님 손과 작업 공간" code="D1" src="/temp/d1.png" round className="mt-9 aspect-[4/5] !rounded-[26px]" />
      <p className="mt-10 font-serif text-[60px] leading-[.6]" style={{ color: C.sky }}>“</p>
      <p className="mt-2 min-h-[3em] text-[24px] font-bold leading-[1.5] tracking-[-0.03em]" style={{ color: C.ink }}><Typewriter lines={['거실장은 그대로 두고,', 'TV만 돌릴 수는 없을까?']} /></p>
      <Body>[대표님 인터뷰 답변(질문 8개)을 받아 작성]</Body>
      <p className="mt-4 text-[13px]" style={{ color: C.mute }}>다큐 대표 [이름]</p>
    </Sec>
  )
}

function QnA() {
  const qa = [
    ['우리 집 TV에 맞나요?', '다리가 좌우로 나뉜 TV라면 쓸 수 있습니다. 두 패드를 다리 간격에 맞춰 놓으면 됩니다. [○○인치, 약 ○○kg] TV로 직접 사용해 확인했습니다.'],
    ['흔들리거나 넘어지지 않나요?', '두 다리를 각각 받치기 때문에 TV는 원래 서 있던 그대로 섭니다. 평평한 거실장 위에서 써주세요.'],
    ['거실장이 긁히거나 패드가 밀리지 않나요?', '하판 바닥의 미끄럼 방지 줄이 거실장을 붙잡아 패드는 그대로 있고 위의 상판만 움직입니다.'],
    ['돌릴 때 소리가 나지 않나요?', '기름이나 베어링 없이 소재끼리 미끄러지도록 만들어 조용하게 돌아갑니다.'],
    ['하나만 살 수 있나요?', '두 다리를 각각 받쳐야 돌아가는 구조라 두 개가 한 세트입니다.'],
  ]
  return (
    <Sec cap="16_QnA" bg="#fff" className="text-left">
      <div className="text-center"><Eyebrow label="Q&A" /><Title lead="펀딩 전에 확인하세요"><b>자주 묻는</b> 질문</Title></div>
      <div className="mt-9 flex flex-col gap-2.5">
        {qa.map(([q, a]) => (
          <div key={q} className="rounded-[20px] px-5 py-5" style={{ background: C.bg }}>
            <p className="flex gap-2.5 text-[15.5px] font-extrabold leading-[1.45]" style={{ color: C.ink }}><span className="font-serif italic" style={{ color: C.sky }}>Q.</span>{q}</p>
            <p className="mt-2 pl-6 text-[13.5px] leading-[1.7]" style={{ color: C.sub }}>{a}</p>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function Spec() {
  const rows = [['제품명', '다큐 턴패드 2-POINT'], ['구성', '상판 2, 하판 2, 연결 핀 2'], ['소재', '상판·핀 UHMWPE / 하판 PTFE'], ['색상', '화이트, 아이보리, 모카 (인조가죽 시트지)'], ['맞는 TV', '다리가 좌우로 분리된 TV'], ['제조', '국내 CNC 가공'], ['A/S', '기간 제한 없이 무상'], ['판매원', '비티엠이앤씨 (브랜드 DACU)']]
  return (
    <Sec cap="17_스펙" bg={C.ivory} className="text-left">
      <h2 className="border-b-2 pb-4 text-[24px] font-extrabold" style={{ color: C.ink, borderColor: C.ink }}>제품 정보</h2>
      <dl>{rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[88px_1fr] gap-3 border-b py-3.5 text-[13.5px]" style={{ borderColor: C.line }}>
          <dt className="font-bold" style={{ color: C.skyD }}>{k}</dt><dd style={{ color: C.sub }}>{v}</dd>
        </div>
      ))}</dl>
      <div className="mt-16 text-center">
        <div className="flex justify-center" style={{ color: C.mochaD }}><Logo className="h-[14px]" /></div>
        <p className="mt-3 font-serif text-[13px] italic" style={{ color: C.mute }}>Daily And Constant Utility</p>
        <div className="mt-6"><Orbit w={90} /></div>
      </div>
    </Sec>
  )
}

export default function App() {
  return (
    <div className="mx-auto w-[430px] overflow-hidden" style={{ zoom: 2, background: C.bg }}>
      <Banner />
      <Hero />
      <Offer />
      <Problem />
      <Statement />
      <Intro />
      <Point01 />
      <Point02 />
      <Point03 />
      <Point04 />
      <Install />
      <Colors />
      <Recommend />
      <Trust />
      <Reviews />
      <Maker />
      <QnA />
      <Spec />
    </div>
  )
}
