import { Fragment, useEffect, useRef, useState } from 'react'
import { motion, useTransform } from 'motion/react'
import type { ReactNode } from 'react'
import { SKETCHES } from './devnoteSketches'
import { REVIEWS } from './reviews'
import { LOGO_DEFS, LOGO_GRID_DEFS, LOGO_MARK } from './brandLogo'
import { Break, InfoPill, Blank, BlankFill, CgCap, Logo, Body, Crossfade, DetailTag, EASE, FillText, Heading, Label, Laurel, LightList, Marquee, Note, Reveal, RollNumber, Seal, Section, Serif, Sheen, Slot, Typewriter, Underline, VLine, WordRoll, seg, useLoop } from './ui'
import { PadSize, RoomView } from './diagrams'

const won = (n: number) => n.toLocaleString('ko-KR')

/* ⓪ 교체형 배너 — 기간마다 하나만 올림 */
export function Banners() {
  const items = [
    { cap: '00a_배너_오픈예정', tag: '오픈예정 알림신청 혜택', msg: <>알림신청하시면 슈퍼얼리버드 15개가<br />열리는 순간 가장 먼저 알려드려요</>, sub: '11월 17일(화) 낮 12시 오픈' },
    { cap: '00b_배너_24시간', tag: '오픈 24시간 이벤트', msg: <>24시간 안에 펀딩하신 분 중 3분께<br />결제 금액 100% 페이백</>, sub: '11월 18일(수) 오전 11시 59분까지 · 펀딩 → 지지서명 → 응원 댓글' },
    { cap: '00c_배너_72시간', tag: '오픈 72시간 이벤트', msg: <>72시간 안에 펀딩하신 분 중 10분께<br />커피를 보내드려요</>, sub: '11월 19일(목) 오전 11시 59분까지 · 24시간 이벤트 참여자 자동 포함' },
  ]
  return (
    <>
      {items.map((b, i) => (
        <div key={b.cap}>
          {i === 1 && <p className="bg-[#E2DCD4] py-1.5 text-center text-[12px] text-sub">↑ 교체형 배너 · 기간마다 아래 것으로 바꿔 올림 ↓</p>}
          <section data-cap={b.cap} data-tone="dark" className="bg-espresso px-6 py-5 text-center text-white">
            <p className="inline-block rounded-full border border-sky-xl/60 px-3 py-[3px] text-[12px] font-semibold text-sky-xl">{b.tag}</p>
            <p className="mt-2 text-[18px] font-semibold leading-[1.45]">{b.msg}</p>
            <p className="mt-1 text-[12.5px] text-white/55">{b.sub}</p>
          </section>
        </div>
      ))}
    </>
  )
}

/* 1 공식 펀딩 블록 */
export function Official() {
  // 위(이벤트03·아이보리)·아래(히어로·흰색)와 겹치지 않게 진한 모카 띠
  return (
    <section data-cap="04_공식펀딩" data-tone="dark" className="flex items-center gap-5 bg-gradient-to-r from-mocha-d to-espresso px-6 py-8 text-left text-white">
      <Seal ring top="OFFICIAL FUNDING · DACU" main={<Logo className="h-full" />} size={104} />
      <div>
        <h2 className="inline-block bg-[linear-gradient(100deg,#E6E2DC_0%,#F4F1EE_35%,#C9C2B9_70%,#E2DDD6_100%)] bg-clip-text text-[19px] font-bold tracking-[-0.03em] text-transparent">다큐 공식 펀딩</h2>
        <p className="mt-1.5 text-[13.5px] leading-[1.65] text-white/70 [&_b]:font-semibold [&_b]:text-white">이번 펀딩은 <b>다큐 본사가 직접 진행</b>합니다.<br />설계부터 A/S까지 <b>본사가 직접 책임</b>집니다.</p>
        <p className="mt-1.5 text-[11.5px] leading-[1.5] text-white/45">* 다큐 턴패드는<br />와디즈에서 처음 공개하는 제품입니다.</p>
      </div>
    </section>
  )
}

/* 오프닝 영상 — 어두운 무대에서 패드가 처음 모습을 드러냄 (핀이 박힘 → 패드가 바닥에 놓임), 아래 밝은 히어로로 넘어감 */
export function Opening() {
  return (
    <section data-cap="04b_오프닝" data-tone="dark" className="relative bg-[#120D0A]">
      <Slot kind="GIF" what="어두운 무대에서 패드가 처음 드러나는 오프닝" how="3D · 핀이 상판 구멍에 박힘 → 패드가 돌며 내려와 바닥에 놓임 · 약 3초" code="C12" src="/3d/open_c3.gif" noTag className="aspect-square" />
      <CgCap className="absolute bottom-3 right-4 z-10 mt-0" />
    </section>
  )
}

/* 다큐 워드마크가 모눈·구성선 위에 선으로 그려진 뒤 채워짐 (turnpad about 첫 화면과 같은 그림) → 머묾 → 옅어지고 다시 · 6초 반복 */
function LogoDraw() {
  return (
    <div data-loop="6000" className="logo-draw mx-auto w-[230px]">
      <div className="relative" dangerouslySetInnerHTML={{ __html: LOGO_DEFS.replace('</svg>', LOGO_GRID_DEFS + '</svg>') + LOGO_MARK }} />
      <p className="mt-3 whitespace-nowrap pl-[.3em] text-[9.5px] tracking-[.3em] text-sub [&_b]:font-bold [&_b]:text-mocha-d"><b>D</b>AILY <b>A</b>ND <b>C</b>ONSTANT <b>U</b>TILITY</p>
    </div>
  )
}

/* 브랜드 로고 — 흰 바탕의 작은 섹션 하나 (이벤트 다음, 공식 펀딩 띠 앞) */
export function BrandMark() {
  return (
    <section data-cap="04c_브랜드로고" data-tone="light" className="bg-paper px-6 py-16 text-center">
      <LogoDraw />
    </section>
  )
}

/* 2 히어로 — 화면 끝까지 꽉 찬 사진 위에 제품명 (쿠나 첫 화면) */
export function Hero() {
  return (
    <section data-cap="05_히어로">
      {/* 위는 아이보리, 아래로 갈수록 사진이 드러남 — 글자는 아이보리 위에 있어 늘 또렷 */}
      <div className="relative bg-[linear-gradient(to_bottom,#FFFFFF_0px,#F7F2EA_140px,#F7F2EA_calc(100%_-_200px),#FFFFFF_100%)]">
        <div className="relative z-10 px-6 pt-14 text-center text-ink">
          <div className="flex justify-center"><Logo className="h-[14px] text-mocha-d" /></div>
          <p className="mt-9 inline-block rounded-full bg-mocha-d px-4 py-[7px] text-[14px] font-semibold text-white">거실장 위 대형 TV 회전 받침대</p>
          <h1 className="mt-6 text-[42px] font-medium leading-[1.26] tracking-[-0.045em]"><b className="font-bold">각도의 차이</b>가<br /><Sheen className="font-extrabold">생활</Sheen>을 바꿉니다</h1>
          <p className="mt-5 pb-4 text-[18px] font-medium leading-[1.6] text-sub"><WordRoll words={['소파에서', '식탁에서', '창가에서']} /> 보기 좋은 각도로<br />다큐 턴패드 2-POINT</p>
        </div>
        {/* 11/2 실사: TV 전체가 손끝으로 밀려 제자리에서 돌아감 (화면은 꺼진 화면으로) — 원본 위쪽에 벽이 거의 없어 흐림 대신 둥근 카드로 */}
        <div className="relative mt-4 px-6 pb-12">
          <Slot kind="GIF" what="손끝으로 밀면 TV가 제자리에서 각도를 바꾸는 장면" how="삼각대 고정 · 2~3초 왕복 반복 · TV·거실장 전체와 양쪽 패드가 보이게 · 화면 위쪽은 밝은 벽(아이보리 그라데이션과 이어짐) · 860×860 GIF 4MB 미만" code="A1" src="/photo/r_hero3.gif" noTag round className="aspect-video shadow-[0_18px_40px_-18px_rgba(42,36,34,.45)]" />
        </div>
      </div>
      <div data-cut aria-hidden className="h-0" />{/* 11/2: 영상과 아이콘 줄을 따로 (둘 다 끝이 흰색) */}
      {/* 필요 없는 세 가지: 얇은 선 아이콘 위로 사선이 차례로 그어짐 */}
      <div className="bg-paper px-6 pb-12 pt-12 text-center text-ink">
        <div className="grid grid-cols-3">
          {[
            { t: '벽 타공', sub: '벽은 그대로', d: ['M4 3h9a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', 'M15.5 4.6h2a.8.8 0 0 1 .8.8v2.2a.8.8 0 0 1-.8.8h-2z', 'M18.3 5.9h3.9a.6.6 0 0 1 0 1.2h-3.9z', 'M5.4 10.6h5.4l-1.5 7H6.6z', 'M4.8 18.3h6.4a1 1 0 0 1 1 1v1.6a1 1 0 0 1-1 1H4.8a1 1 0 0 1-1-1v-1.6a1 1 0 0 1 1-1z'] },
            { t: '설치 공구', sub: '올려두면 끝', d: ['M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z'] },
            { t: '베어링·오일', sub: '기름칠 없이', d: ['M12 2.2c3.4 4.4 6.6 8 6.6 11.9a6.6 6.6 0 0 1-13.2 0c0-3.9 3.2-7.5 6.6-11.9z'] },
          ].map(({ t, sub, d }, i) => {
            const s = 0.08 + i * 0.14
            const times = [0, s, s + 0.1, 0.86, 0.96]
            return (
              <div key={t} className={`flex flex-col items-center ${i ? 'border-l border-line' : ''}`}>
                <div className="relative flex size-[66px] items-center justify-center rounded-full bg-ivory">
                  <svg viewBox="0 0 24 24" className="size-[30px]" fill="#8C6E5C">
                    {d.map((x) => <path key={x} d={x} />)}
                    {i === 2 && <path d="M9.2 13.6a2.8 2.8 0 0 0 2.4 3" fill="none" stroke="#F7F2EA" strokeWidth="1.4" strokeLinecap="round" />}
                  </svg>
                  <motion.span aria-hidden className="absolute -right-0.5 -top-0.5 flex size-[22px] items-center justify-center rounded-full bg-mocha-d ring-[3px] ring-paper"
                    animate={{ scale: [0, 0, 1, 1, 0] }}
                    transition={{ duration: 3, times, ease: [0.34, 1.56, 0.64, 1], repeat: Infinity }}>
                    <svg viewBox="0 0 12 12" className="size-[9px]" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7" /></svg>
                  </motion.span>
                </div>
                <p className="mt-4 text-[17px] font-extrabold tracking-[-0.03em] text-ink">{t}</p>
                <p className="mt-1 text-[13px] font-medium text-sub">{sub}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* 어두운 핵심 메시지 — 줄 단위로 드러남 */
export function Statement({ cap, lead, lines, media }: { cap: string; lead: ReactNode; lines: ReactNode[]; media?: ReactNode }) {
  return (
    <Section cap={cap} tone="dark" className="py-24">
      <div className="relative">
        <p className="text-[20px] font-medium leading-[1.5] text-white/65">{lead}</p>
        <h2 className="mt-3 text-[38px] font-medium leading-[1.34] tracking-[-0.04em] [&_b]:font-extrabold"><Reveal lines={lines} /></h2>
      </div>
      {media}
    </Section>
  )
}

/* 3b 문제 제기 — 글자는 늘 읽히게 두고, 3초 안에 세 번의 동작: 벽이 드릴처럼 떨림 → 거실장이 갈아 끼워짐 → "없잖아요" 도장 */
export function NoWay() {
  // 한 시계(3초)로 세 동작을 묶음 → 순서와 박자가 항상 정확
  const p = useLoop(3)
  const shakeX = useTransform(p, v => {
    if (v < 0.06 || v > 0.22) return 0
    const k = (v - 0.06) / 0.16
    return 5 * Math.sin(k * Math.PI * 8) * (1 - k)
  })
  const rollY = useTransform(p, v => `${v < 0.36 ? -110 * seg(v, 0.28, 0.36) : 110 * (1 - seg(v, 0.36, 0.46))}%`)
  const stampScale = useTransform(p, v => (v < 0.54 ? 1 : v < 0.62 ? 1.6 - 0.66 * seg(v, 0.54, 0.62) : 0.94 + 0.06 * seg(v, 0.62, 0.7)))
  const stampOpacity = useTransform(p, v => (v < 0.54 ? 1 : seg(v, 0.54, 0.6)))
  const stampRotate = useTransform(p, v => (v < 0.54 ? -2 : -6 + 4 * seg(v, 0.54, 0.66)))
  return (
    <Section cap="06_문제제기" tone="dark" className="py-24">
      <p className="text-[20px] font-medium leading-[1.5] text-white/65">TV 방향 하나 바꾸려고,</p>
      <h2 className="mt-3 text-[38px] font-medium leading-[1.4] tracking-[-0.04em]">
        <motion.span className="block font-extrabold" style={{ x: shakeX }}>벽을 뚫거나</motion.span>
        <span className="block">
          <span className="inline-flex overflow-hidden align-bottom">
            <motion.b className="inline-block font-extrabold" style={{ y: rollY }}>거실장을</motion.b>
          </span>{' '}<b className="font-extrabold">바꿀</b> 순
        </span>
        <motion.span className="mt-3 inline-block bg-sky-xl px-3 font-extrabold text-espresso"
          style={{ scale: stampScale, opacity: stampOpacity, rotate: stampRotate }}>
          없습니다
        </motion.span>
      </h2>
    </Section>
  )
}

/* 0 첫 화면 — 이벤트보다 먼저, 무슨 제품인지 6초 안에: 다리 아래 패드 클로즈업 → TV 전체가 돌아감 */
export function TopFilm() {
  return (
    <section data-cap="00_첫화면" data-tone="light" className="bg-[#EFE6DA]">
      <Slot kind="GIF" what="패드 클로즈업에서 TV 전체로 멀어지며 돌아가는 장면" how="3D · 6초 · 720px" code="C14" src="/3d/A2_tv_reveal_top.gif" noTag className="aspect-square" />
    </section>
  )
}

/* 마무리 장면 — 가격 공개 직전, 제품이 놓인 거실을 한 번 더 */
export function Closing() {
  return (
    <section data-cap="23_마무리" className="relative bg-[linear-gradient(to_bottom,#FFFFFF_0px,#EFE6DA_140px,#EFE6DA_100%)]">
      <div className="relative z-10 px-6 pt-12 text-left">
        <div className="flex justify-between font-serif text-[13px] italic text-mute"><span>Your living room</span><span>Premium</span><span>2-POINT</span></div>
        <p className="mt-8 text-[32px] font-medium leading-[1.38] tracking-[-0.035em] text-ink">앉은 자리가<br /><b className="font-extrabold">정면이 되는 거실</b>,<br />다큐와 함께 만들어 보세요.</p>
      </div>
      <div className="relative mt-6 aspect-[4/3] w-full">
        <Slot kind="사진" what="2-POINT를 쓰는 거실 전경" how="자연광 · 소파에서 TV 쪽으로 · TV가 앉은 자리를 향해 살짝 돌아간 상태 · 위쪽은 밝은 벽(모래색 그라데이션과 이어짐)" code="E1" src="/3d/closing_4x3.jpg" noTag capOff className="h-full" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[24%]" style={{ background: 'linear-gradient(to bottom, rgba(239,230,218,1) 0%, rgba(239,230,218,.85) 30%, rgba(239,230,218,.45) 65%, rgba(239,230,218,0) 100%)' }} />
        <CgCap className="absolute bottom-3 right-4 !mt-0" />
      </div>
    </section>
  )
}

/* 오픈 혜택 · 가격 — 이야기를 다 들은 뒤, Q&A 바로 앞에서 처음 공개 */
export function Offer() {
  const tiers: [string, string, number][] = [['슈퍼얼리버드', '15개 한정', 129900], ['얼리버드', '40개 한정', 139900], ['펀딩가', '200개', 149900]]
  const LIST = 179900
  const off = (p: number) => Math.round((1 - p / LIST) * 100)  // 와디즈 리워드 화면 표기(반올림)와 같게: 28·22·17%
  return (
    <Section cap="24_오픈혜택" tone="ivory">
      <Label>와디즈 단독 공개</Label>
      <Heading lead="와디즈에서 처음 선보이는 가격"><b className="text-mocha">2-POINT</b> 오픈 혜택</Heading>
      {/* 01 슈퍼얼리버드만 큰 카드로 — 구성이 같아서 나머지 두 단계는 아래 짧은 줄로 */}
      <div className="mt-10 text-left">
        <p className="text-[15px] font-semibold text-mocha underline underline-offset-4">01</p>
        <p className="mt-1 flex items-center gap-2.5 text-[28.5px] font-extrabold tracking-[-0.03em] text-ink">{tiers[0][0]}<span className="rounded-full bg-paper px-2.5 py-[3px] text-[13px] font-bold text-mocha-d ring-1 ring-mocha/30">{tiers[0][1]}</span></p>
      </div>
      <div className="relative mt-4 rounded-[14px] bg-paper text-left shadow-[0_10px_28px_rgba(42,36,34,.07)] ring-1 ring-line">
        {/* 할인 배지: 은빛 테두리가 돌고, 빛줄기가 지나가고, 빛이 번짐 — 3초 반복 */}
        <motion.span className="absolute -right-2 -top-5 z-30 flex size-[90px] items-center justify-center"
          animate={{ scale: [1, 1.07, 1, 1], rotate: [0, -4, 3, 0] }} transition={{ duration: 3, times: [0, 0.18, 0.36, 1], ease: 'easeInOut', repeat: Infinity }}>
          <motion.span aria-hidden className="absolute inset-0 rounded-full"
            style={{ background: 'conic-gradient(from 0deg, #6B5245, #C9AE98, #F4EBE1, #A88B78, #6B5245, #E2D2C2, #6B5245)' }}
            animate={{ rotate: 360 }} transition={{ duration: 3, ease: 'linear', repeat: Infinity }} />
          <span className="relative flex size-[82px] items-center justify-center overflow-hidden rounded-full bg-mocha-d text-white shadow-[0_8px_18px_rgba(107,82,69,.35)]">
            <motion.span aria-hidden className="absolute inset-y-0 w-[55%] -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent"
              animate={{ left: ['-60%', '-60%', '130%', '130%'] }} transition={{ duration: 3, times: [0, 0.2, 0.55, 1], ease: 'easeInOut', repeat: Infinity }} />
            <span className="relative font-[Poppins,Pretendard] text-[28.5px] font-semibold leading-none tracking-[-0.03em]">{off(tiers[0][2])}<span className="text-[18px]">%</span></span>
          </span>
          {/* 바깥으로 번지는 빛 */}
          <motion.span aria-hidden className="absolute inset-0 rounded-full"
            animate={{ boxShadow: ['0 0 0 0 rgba(168,139,120,.55)', '0 0 0 16px rgba(168,139,120,0)'] }} transition={{ duration: 2, ease: 'easeOut', repeat: Infinity, repeatDelay: 1 }} />
        </motion.span>
        <div className="overflow-hidden rounded-t-[14px]">
          <Slot kind="사진" what="2-POINT 1세트 구성 컷" how="흰 배경 위 상판 2 · 하판 2 · 핀 2를 간격 맞춰 배치 · 위에서 수직 촬영 · 그림자 부드럽게 · 대표 색 아이보리" code="리워드" src="/3d/kit_03_top.jpg" noTag className="aspect-[4/3]" />
        </div>
        <div className="px-6 pb-6 pt-6">
          <p className="text-[19px] font-bold text-ink">다큐 턴패드 2-POINT 1세트</p>
          <ul className="mt-3 flex flex-col gap-1.5 text-[15px] text-text">
            {['상판 2 · 하판 2 · 연결 핀 2', '색상 선택 (화이트 · 아이보리 · 모카)', '기간 제한 없는 무상 A/S'].map(t => (
              <li key={t} className="flex items-center gap-2"><span className="flex size-[15px] items-center justify-center rounded-full border border-mocha/60 text-[12px] leading-none text-mocha">+</span>{t}</li>
            ))}
          </ul>
          <div className="mt-5 border-t border-line pt-5">
            <p className="flex items-center gap-2.5"><span className="rounded-[4px] px-1.5 py-[2px] text-[13px] font-medium text-mute ring-1 ring-line">정가</span><span className="text-[18px] text-mute line-through">{won(LIST)}원</span></p>
            <p className="mt-2 flex items-center gap-2.5"><span className="rounded-[4px] bg-mocha-d px-1.5 py-[3px] text-[13px] font-bold text-white">혜택가</span><span className="text-[36px] font-extrabold leading-none tracking-[-0.03em] text-mocha-d">{won(tiers[0][2])}<span className="ml-0.5 text-[19px]">원</span></span></p>
          </div>
        </div>
      </div>
      <div className="mt-3 text-left">
        {tiers.slice(1).map(([t, q, price], k) => (
          <div key={t} className="flex items-center justify-between border-b border-line py-4">
            <p className="flex items-baseline gap-2"><span className="text-[14px] font-semibold text-mocha underline underline-offset-4">0{k + 2}</span><span className="text-[17px] font-bold text-ink">{t}</span><span className="text-[13px] text-mute">{q}</span></p>
            <p className="flex items-baseline gap-2"><span className="text-[14px] font-semibold text-mocha">{off(price)}%</span><span className="text-[19px] font-bold tracking-[-0.02em] text-ink">{won(price)}<span className="ml-0.5 text-[13px] font-semibold">원</span></span></p>
          </div>
        ))}
      </div>
      <Note className="!mt-4">세 리워드의 구성은 같습니다.<br />앞 단계 수량이 모두 펀딩되면 다음 단계 가격으로 바뀝니다.</Note>
      <div className="mt-6 grid grid-cols-2 gap-2 text-left">
        {[['혜택 01', '기간 제한 없는', '무상 A/S'], ['혜택 02', '오픈 이벤트', '알림신청 커피 · 첫날 페이백']].map(([e, b, sub]) => (
          <div key={e} className="rounded-[8px] bg-paper p-4 ring-1 ring-line">
            <em className="text-[12.5px] font-semibold not-italic text-mocha">{e}</em>
            <b className="mt-1 block text-[15.5px] font-bold text-ink">{b}</b>
            <span className="mt-0.5 block text-[13px] text-sub">{sub}</span>
          </div>
        ))}
      </div>
    </Section>
  )
}

/* 4 그래서 다큐는 (문제 제기는 바로 위 NoWay 하나로) */
export function Problem() {
  // 같은 자리에서 찍은 회전 전 → 후 사진 교차: 시계 기준 4.5초(약 1.6초 머묾 · 0.6초 바뀜) → 캡처도 웹과 똑같이
  const swap = useLoop(4.5)
  const after = useTransform(swap, v => seg(v, 0.37, 0.5) * (1 - seg(v, 0.87, 1)))
  const before = useTransform(after, v => 1 - v)
  return (
    <>
      <Section cap="07_그래서다큐는">
        <p className="text-[19px] font-medium text-sub">그래서 다큐는</p>
        <h2 className="mt-2 text-[33px] font-medium leading-[1.42] tracking-[-0.035em] text-ink">
          <BlankFill text="거실장" />은 그대로 두고<br /><FillText>TV만 돌리는 방법</FillText>을<br />찾았습니다
        </h2>
        <VLine />
        <Body className="!mt-0">수납 거실장 위, 쓰던 자리 그대로.<br />벽도 가구도 손대지 않고 <b>TV 각도만</b> 바꿉니다.</Body>
        <div data-cut aria-hidden className="h-9" />{/* 11/2: 한 장이 길어 회전 전/후 사진 위 흰 여백에서 나눔 */}
        <div data-loop="4500" className="relative -mx-6 aspect-[4/5] overflow-hidden bg-sand">
          <img src="/photo/r_rot_before.jpg" alt="수납 거실장 위 대형 TV" className="absolute inset-0 size-full object-cover" />
          <motion.img src="/photo/r_rot_after.jpg" alt="같은 자리에서 각도만 바꾼 TV" className="absolute inset-0 size-full object-cover" style={{ opacity: after }} />
          {(['회전 전', '회전 후'] as const).map((t, k) => (
            <motion.span key={t} className="absolute left-4 top-4 rounded-full bg-espresso/80 px-3 py-1 text-[13px] font-semibold text-white backdrop-blur-sm"
              style={{ opacity: k ? after : before }}>{t}</motion.span>
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-2 text-left">
          {[<>공들여 고른 <b>거실장을 바꾸지 않아도</b> 됩니다</>, <>셋톱박스·공유기 <b>선 정리도 그대로</b>입니다</>, <>사운드바와 오브제 <b>자리도 그대로</b>입니다</>].map((t, i) => (
            <div key={i} className="flex items-center gap-3 rounded-[10px] bg-ivory px-5 py-4 text-[16px] text-text [&_b]:font-bold [&_b]:text-ink">{CHECK}<span>{t}</span></div>
          ))}
        </div>
      </Section>
    </>
  )
}

/* 5 브랜드 워드마크 */
export function BrandWall() {
  return (
    <section data-cap="09_브랜드" data-tone="dark" className="bg-[radial-gradient(ellipse_at_50%_48%,#A88B78_0%,#8C6E5C_50%,#76594A_100%)] px-6 pb-14 pt-20 text-center text-white">
      <Logo className="h-[18px] text-white" />
      <Serif dark className="mt-3">Designed by structural engineers</Serif>
      <p className="mt-4 text-[19px] font-medium text-white/75">구조시험 전문기업 대표가 설계한</p>
      <h2 className="mt-1 text-[30.5px] font-medium tracking-[-0.035em] text-white">거실장 위 대형TV <b className="font-extrabold">회전 받침대</b></h2>
      <p className="mt-6 whitespace-nowrap text-[46px] font-extrabold leading-none tracking-[-0.04em]"><span className="relative inline-block">
        <span className="font-bold text-white">2-POINT</span> <span className="text-sky-xl">턴패드</span>
        {/* 같은 글자를 한 겹 더 올려 빛줄기만 2-POINT부터 턴패드까지 한 번에 지나가게 */}
        <motion.span aria-hidden className="absolute inset-0 bg-clip-text text-transparent"
          style={{ backgroundImage: 'linear-gradient(100deg, transparent 0%, transparent 40%, rgba(255,255,255,.95) 50%, transparent 60%, transparent 100%)', backgroundSize: '250% 100%' }}
          animate={{ backgroundPosition: ['120% 0%', '-20% 0%'] }} transition={{ duration: 2.2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.8 }}>
          <span className="font-bold">2-POINT</span> 턴패드
        </motion.span>
      </span></p>
      {/* 누끼 제품만 크게 둥둥 — 섹션 전체를 모카로 깔아 흰 패드가 보이게 (위아래 에스프레소 섹션과는 다른 색) */}
      <div className="-mx-2 mt-10">
        <motion.div className="relative" animate={{ y: [0, -12, 0], rotate: [-0.8, 0.8, -0.8] }} transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}>
          <Slot kind="사진" what="2-POINT 패드 한 쌍 단독 컷" how="밝은 무지 배경 · 상판을 하판 위로 살짝 띄운 분해 컷(핀이 보이게) · 사선 위 45° · 실물 촬영(AI 합성 불가)" code="추가" src="/3d/set_02_exploded.png" noTag cg capOff bare className="aspect-[1150/579]" />
        </motion.div>
        <motion.div className="mx-auto mt-5 h-4 w-[62%] rounded-[50%] bg-[radial-gradient(rgba(42,30,24,.45),transparent_70%)]"
          animate={{ scaleX: [1, 0.82, 1], opacity: [1, 0.6, 1] }} transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }} />
      </div>
      <div className="mt-14 border-t border-white/20 text-left">
        {([['Stable', '두 다리를 하나씩 받쳐', 'TV는 원래 자세 그대로'], ['Silent', '기름도 베어링도 없이', '소재끼리 조용하게'], ['Simple', '놓고 올리면 끝', '벽도 거실장도 그대로']] as const).map(([en, a, b], i) => (
          <div key={en} className="grid grid-cols-[124px_1fr] items-center border-b border-white/20 py-6">
            {/* 모카 그라데이션 위로 밝은 띠가 삭 지나감 (줄마다 조금씩 늦게) */}
            <motion.p className="w-fit bg-clip-text pb-1 font-[Poppins,Pretendard] text-[30.5px] font-semibold leading-none tracking-[-0.035em] text-transparent"
              style={{ backgroundImage: 'linear-gradient(100deg, #E2D5C6 0%, #F3ECE3 30%, #FFFFFF 50%, #F3ECE3 70%, #E2D5C6 100%)', backgroundSize: '260% 100%' }}
              animate={{ backgroundPosition: ['100% 0%', '0% 0%'] }} transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1, delay: i * 0.25 }}>{en}</motion.p>
            <p className="text-[15px] leading-[1.55] text-white/70">{a}<br /><b className="font-bold text-white">{b}</b></p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* 기준 — 가격을 설명하지 않고 우리가 지킨 네 가지를 보여줌 */
export function Standards() {
  const rows: [string, string, ReactNode, ReactNode][] = [
    ['Material', '소재', <>받치는 판은 <b>UHMWPE</b><br />미끄러지는 판은 <b>PTFE</b></>, <>식품에 닿아도 되는 원료<br />SGS 유해물질 불검출</>],
    ['Structure', '구조', <>구조시험 전문기업 대표가 <b>직접 설계</b></>, <>TV의 무게를 두 점에 나눠 받칩니다<br />디자인 등록 제30-1267775호</>],
    ['Machining', '가공', <><b>국내 CNC</b> 정밀 가공</>, '한 장씩 같은 정밀도로 깎습니다'],
    ['Care', '관리', <>분리해서 <b>물로 세척</b></>, '손으로 끼우고 빼는 구조라 늘 청결하게 씁니다'],
  ]
  return (
    <Section cap="15_기준" align="left">
      <Heading lead="덜어낸 자리에 남은">우리가 지킨<br /><Underline>네 가지 기준</Underline></Heading>
      <div className="mt-10 border-t border-ink/80">
        {rows.map(([en, ko, fact, note]) => (
          <div key={en} className="grid grid-cols-[76px_1fr] gap-3 border-b border-line py-6">
            <div>
              <p className="text-[18px] font-extrabold text-ink">{ko}</p>
              <p className="mt-0.5 font-serif text-[14px] italic text-mute">{en}</p>
            </div>
            <div>
              <p className="text-[17.5px] font-medium leading-[1.5] text-ink [&_b]:font-extrabold [&_b]:text-mocha-d">{fact}</p>
              <p className="mt-1.5 text-[14px] leading-[1.6] text-sub">{note}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

function Fig({ children, caption, dark = false }: { children: ReactNode; caption?: string; dark?: boolean }) {
  return (
    <figure className={`mt-9 rounded-[8px] px-3 pb-4 pt-5 ${dark ? 'bg-white/[.04]' : 'bg-paper shadow-[0_8px_24px_rgba(42,36,34,.05)]'}`}>
      {children}
      {caption && <figcaption className={`mt-3 text-center text-[12.5px] ${dark ? 'text-white/45' : 'text-mute'}`}>{caption}</figcaption>}
    </figure>
  )
}

/* Detail 01 — 안정감 (어두운 바탕, 왼쪽 정렬 편집 레이아웃) */
/* 정면 3D 컷 위 두 패드 표시 — 화면을 어둡게 깔고 두 패드에만 빛을 남김(고정), 아래에 숫자 배지 + 라벨
   (좌표는 렌더 카메라에서 계산: 30.1% / 69.9%, 63.8%) */
const PADS = [['30.08%', 1], ['69.92%', 2]] as const
function FrontPoints() {
  const hole = (x: string) => `radial-gradient(ellipse 15% 10% at ${x} 63.8%, transparent 45%, #000 100%)`
  const mask = `${hole(PADS[0][0])}, ${hole(PADS[1][0])}`
  return (
    <div className="relative -mx-6">
      <Slot kind="사진" what="정면에서 본 TV와 두 패드" how="3D · 거실장 위 대형 TV 정면 · 배경 투명" code="C10" src="/3d/front_tv_pads.png" noTag cg capOff bare className="aspect-[4/3] [mask-image:linear-gradient(to_bottom,#000_78%,transparent_100%)]" />
      <div aria-hidden className="absolute inset-0 z-10 bg-[#1E1612]/70"
        style={{ maskImage: mask, WebkitMaskImage: mask, maskComposite: 'intersect', WebkitMaskComposite: 'source-in' }} />
      {PADS.map(([x, n]) => (
        <div key={n} className="absolute z-20 flex -translate-x-1/2 flex-col items-center" style={{ left: x, top: '71%' }}>
          <span className="flex size-[21px] items-center justify-center rounded-full bg-white font-[Poppins,Pretendard] text-[11.5px] font-semibold text-mocha-d shadow-[0_3px_8px_rgba(0,0,0,.3)]">{n}</span>
          <span className="mt-1.5 font-[Poppins,Pretendard] text-[12.5px] font-medium tracking-[.1em] text-white/90 [text-shadow:0_1px_6px_rgba(0,0,0,.6)]">POINT {n}</span>
        </div>
      ))}
    </div>
  )
}

export function Point01() {
  const checks = [['다리마다 패드 하나씩', 'TV의 무게를 두 점에 나눠 받칩니다'], ['바닥의 미끄럼 방지 줄', '거실장을 붙잡아 위의 상판만 움직입니다'], ['TV 자세는 그대로', '높이와 기울기는 바뀌지 않습니다']]
  return (
    <Section cap="10_D01_안정감" tone="dark" align="left">
      <DetailTag n={2} label="STABILITY" dark />
      <Heading dark lead="하나의 축이 아니라"><Underline>두 개의 점</Underline>으로 받칩니다</Heading>
      <div className="mt-5 border-l border-sky-xl/40 pl-4">
        <Body dark className="!mt-0">두 패드가 TV의 두 다리를 하나씩 받쳐<br />TV는 원래 서 있던 자세 그대로 섭니다.<br /><b>바뀌는 것은 각도뿐입니다.</b></Body>
      </div>
      <div className="mt-8"><FrontPoints /></div>
      <Slot kind="GIF" what="TV를 손으로 밀어도 흔들림 없이 각도만 바뀌는 장면" how="가장 중요한 컷 · 삼각대 고정 · TV 윗부분까지 화면에 다 들어오게 · 손이 TV 옆면을 밀고 멈출 때까지 · 원본 10초 → GIF 2~3초 발췌" code="A5" src="/photo/pad_turn_real_169_b.gif" noTag bleed className="aspect-video" />
      <div className="mt-6 flex flex-col gap-2">
        {checks.map(([b, s], i) => (
          <div key={b} className="flex items-center gap-4 rounded-[8px] bg-white/[.06] px-4 py-3.5">
            <motion.span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sky"
              animate={{ boxShadow: ['0 0 0 0 rgba(168,139,120,.55)', '0 0 0 9px rgba(168,139,120,0)'] }} transition={{ duration: 3, ease: 'easeOut', repeat: Infinity, delay: i * 0.5 }}>
              <svg viewBox="0 0 12 10" className="w-3"><path d="M1 5l3.5 3.5L11 1.5" fill="none" stroke="#3A2E27" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </motion.span>
            <p className="text-[15.5px] font-semibold">{b}<small className="mt-0.5 block text-[13.5px] font-normal text-white/55">{s}</small></p>
          </div>
        ))}
      </div>
    </Section>
  )
}

/* GRIP — 하판 바닥 미끄럼 방지: 패드는 제자리, 상판만 움직임 */
export function Grip() {
  // 그림 대신 실제 GIF 한 장 + 주석 두 개로 (시안 A)
  const checks: ReactNode[] = [
    <>하판은 거실장 위 <b>제자리에</b></>,
    <>움직이는 건 위의 <b>상판뿐</b></>,
    <>거실장에 닿는 면에는 <b>미끄럼 방지 줄</b></>,
  ]
  return (
    <Section cap="11_미끄럼방지" tone="sand">
      <DetailTag n={3} label="GRIP" />
      <Heading lead="밀어도 밀리지 않도록"><Underline>거실장을 붙잡는</Underline><br />하판 바닥</Heading>
      <Body>하판 바닥 홈에 미끄럼 방지 줄을 끼웠습니다.<br />TV를 밀어도 하판은 거실장 위에 그대로 있고<br /><b>움직이는 건 위의 상판뿐</b>입니다.</Body>
      <div className="relative -mx-6 mt-9">
        <Slot kind="GIF" what="TV를 밀 때 하판은 그대로, 상판만 움직이는 장면" how="패드 높이에서 옆으로 · 하판과 거실장 경계에 초점 · 삼각대 고정 · 2~3초 왕복 · 주석 자리(위: 상판, 아래: 하판)를 비워 두고 구도 잡기" code="B8" src="/3d/V5_leg_turn.gif" noTag cg capOff className="aspect-[4/3]" />
        {/* 점 위치: 상판 = 다리 바로 앞 상판 앞 모서리(다리와 함께 움직임) · 하판 = 왼쪽 앞 하판 면(움직이지 않음) */}
        <PhotoPin x="55%" y="53%" side="r"><b>상판</b> 움직임</PhotoPin>
        <PhotoPin x="38%" y="72%" side="r"><b>하판</b> 제자리</PhotoPin>
      </div>
      <div className="mt-6 flex flex-col gap-2 text-left">
        {checks.map((c, i) => (
          <div key={i} className="flex items-center gap-3 rounded-[10px] bg-paper px-5 py-4 text-[16px] text-text [&_b]:font-bold [&_b]:text-ink">{CHECK}<span>{c}</span></div>
        ))}
      </div>
      <Slot kind="사진" what="하판 바닥 미끄럼 방지 줄" how="하판을 뒤집어 바닥의 줄이 보이게 · 사선 조명으로 질감 · 줄 끝부분까지" code="B2" src="/3d/bottom_strip_macro.jpg" noTag round className="mt-8 aspect-[16/9]" />
      <Note>평평한 거실장 위에서 사용해 주세요.</Note>
    </Section>
  )
}

/** 사진 위 주석 알약 — (x, y)는 가리키는 점의 위치. side: 글자 알약이 점의 왼쪽(l) / 오른쪽(r) */
function PhotoPin({ x, y, side, children }: { x: string; y: string; side: 'l' | 'r'; children: ReactNode }) {
  const pill = <span className="whitespace-nowrap rounded-full bg-paper px-3 py-1.5 text-[13.5px] font-semibold text-ink shadow-[0_4px_12px_rgba(42,36,34,.12)] [&_b]:font-extrabold [&_b]:text-mocha-d" style={{ border: '1px solid rgba(140,110,92,.3)' }}>{children}</span>
  const line = <span className="h-px w-[40px] shrink-0 bg-mocha-d" />
  const dot = <span className="size-2.5 shrink-0 rounded-full border-2 border-paper bg-mocha-d shadow-[0_0_0_3px_rgba(107,82,69,.25)]" />
  return (
    <div className="absolute z-20 flex items-center" style={{ left: x, top: y, transform: side === 'l' ? 'translate(calc(-100% + 5px), -50%)' : 'translate(-5px, -50%)' }}>
      {side === 'l' ? <>{pill}{line}{dot}</> : <>{dot}{line}{pill}</>}
    </div>
  )
}

/* Detail 02 — 같은 원 */
export function Point02() {
  const parts = [['상판', 'TV 다리를 받치는 판', '/3d/part_upper.jpg'], ['하판', '곡선 홈이 난 판', '/3d/part_lower.jpg'], ['연결 핀', '두 판을 잇는 축', '/3d/part_pin.jpg']]
  return (
    <Section cap="12_D02_원" tone="sky" cg>
      <DetailTag n={1} label="PRINCIPLE" />
      <Heading lead="밀려나지 않고 그 자리에서">두 패드의 홈은<br /><BlankFill text="같은 원" /> 위에 있습니다</Heading>
      <Body>두 패드의 홈은 TV 가운데를 중심으로 한<br />하나의 원에서 나왔습니다.<br />그래서 TV를 밀면 <b>방향만</b> 바뀝니다.</Body>
      {/* 위에서 본 3D 위에 같은 원을 그려 둠 — 원의 중심 = TV 가운데, 두 핀이 이 원 위를 지남 */}
      <figure className="mt-9">
        <div className="relative">
          <Slot kind="GIF" what="위에서 본 TV와 두 패드가 좌우로 도는 장면" how="3D · 수직 부감 · 두 상판이 같은 원을 따라 함께 돎" code="C4" src="/3d/V7_top_turn.gif" noTag cg round className="aspect-[16/10]" />
          <svg viewBox="0 0 860 538" aria-hidden className="pointer-events-none absolute inset-0 size-full">
            <circle cx="434" cy="250" r="215" fill="none" stroke="#fff" strokeWidth="4" strokeDasharray="2 12" strokeLinecap="round" opacity=".95" />
            <circle cx="434" cy="250" r="11" fill="#fff" />
            <circle cx="434" cy="250" r="5.5" fill="#6B5245" />
          </svg>
          <span className="absolute left-1/2 top-[60%] -translate-x-1/2 rounded-full bg-mocha-d/90 px-2.5 py-[3px] text-[11.5px] font-semibold text-white">TV 가운데 = 원의 중심</span>
        </div>
        <figcaption className="mt-3 text-center text-[12.5px] text-mute">위에서 본 모습 · 점선이 두 홈이 놓인 원입니다</figcaption>
      </figure>
      <Break h={140} className="mt-6 mb-2" />{/* 11/2: 움직이는 그림마다 한 장씩 — 흰 띠 가운데서 나눔 */}
      <div>
        <p className="text-[18px] font-bold text-ink">손으로 밀면, 두 패드가 함께 움직입니다</p>
        <p className="mt-3 text-[14.5px] leading-[1.7] text-sub">상판 아래 핀이 하판의 곡선 홈을 따라 움직입니다.<br />두 다리 간격은 그대로, 좌우 상판이 함께 돌아<br />TV의 방향만 바뀝니다.</p>
        <Slot kind="GIF" what="위에서 본 패드 하나: 상판이 홈을 따라 돌았다 돌아옴" how="3D · 수직 부감" code="C4-2" src="/3d/open_c4.gif" noTag round className="mt-6 aspect-square" />
      </div>
      <Break h={140} className="mt-6 mb-2" />
      <div><Heading lead="회전판·베어링·오일을 덜어내고"><b>세 가지 부품</b>만 남겼습니다</Heading></div>
      {/* 부품 카드 3장 */}
      <div className="mt-9 grid grid-cols-3 gap-2 text-center">
        {parts.map(([name, role, img], i) => (
          <div key={name} className="rounded-[10px] bg-paper px-2 pb-4 pt-2 shadow-[0_8px_20px_rgba(42,36,34,.06)]">
            {/* 부품 하나씩 크게 찍은 3D 컷 (모래색 바닥 위) */}
            <img src={img} alt={name} className="aspect-square w-full rounded-[8px] object-cover" />
            <p className="mt-3 text-[16px] font-bold text-ink">{name}</p>
            <p className="mt-1 text-[12.5px] leading-[1.45] text-sub">{role}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[13.5px] text-sub">세 가지가 맞물려 패드 하나가 되고, 패드 두 개가 한 세트입니다.</p>
      <InfoPill>디자인 등록 30-1267775 · 디자인 출원 30-2026-0034869</InfoPill>
    </Section>
  )
}

/* Detail 03 — 몇 도의 차이 */
export function Point03() {
  return (
    <Section cap="13_D03_각도" tone="sand">
      <DetailTag n={5} label="EVERYDAY" />
      <Heading lead="앉은 자리에 맞춰 조금만">그 몇 도가<br /><FillText>거실의 하루</FillText>를 바꿉니다</Heading>
      <Body>소파 끝자리에서도 고개를 돌리지 않고,<br />오후 햇빛이 비칠 때는 살짝 비켜 둡니다.</Body>
      <div data-loop="6000"><Fig caption="위에서 본 거실 · 앉는 자리에 따라 화면을 맞춥니다"><RoomView /></Fig></div>{/* 11/2: 너무 빨라 6초 한 바퀴로 */}
      {/* 지금까지는 / 턴패드는: 진한 바탕 한 장 — 자르는 줄(data-cut)은 흰 띠 끝, 진한 면이 시작하는 자리. 진한 면은 섹션 끝까지 */}
      <div aria-hidden className="-mx-6 mt-6 h-[110px] bg-[linear-gradient(to_bottom,rgba(255,255,255,0),#FFFFFF)]" />
      <div data-cut aria-hidden className="-mx-6 h-0" />
      <div data-tone="dark" className="-mx-6 -mb-[72px] bg-espresso px-6 py-[72px]">
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="overflow-hidden rounded-[10px] bg-white/[.06] ring-1 ring-white/10">
          <p className="bg-white/15 py-3 text-[15px] font-semibold text-white/80">지금까지는</p>
          {['둘이 TV를 들어 옮기고', '다리 위치를 다시 맞추고', '선을 다시 정리하고'].map((t, i) => (
            <p key={t} className={`px-3 py-4 text-[14.5px] leading-[1.5] text-white/55 ${i ? 'border-t border-white/10' : ''}`}>{t}</p>
          ))}
        </div>
        <div className="overflow-hidden rounded-[10px] bg-paper shadow-[0_12px_28px_rgba(0,0,0,.28)]">
          <p className="bg-mocha-d py-3 text-[15px] font-semibold text-white">턴패드는</p>
          {/* 글자는 그대로, '끝' 원만 맥박처럼 두 번 뛰고 쉼 (1.6초 반복) */}
          <div className="flex h-[calc(100%-44px)] flex-col items-center justify-center gap-1 px-3 py-6">
            <p className="text-[16px] font-bold leading-[1.5] text-ink">손끝으로<br />밀면</p>
            <span className="relative mt-2 flex size-[52px] items-center justify-center">
              <motion.span aria-hidden className="absolute inset-0 rounded-full border-2 border-mocha-d"
                animate={{ scale: [1, 1.7], opacity: [0.5, 0] }} transition={{ duration: 1.5, ease: 'easeOut', repeat: Infinity }} />
              <motion.span className="relative flex size-full items-center justify-center rounded-full bg-mocha-d text-[23.5px] font-extrabold text-white"
                animate={{ scale: [1, 1.14, 1, 1.08, 1, 1] }} transition={{ duration: 1.5, times: [0, 0.1, 0.22, 0.32, 0.45, 1], ease: 'easeOut', repeat: Infinity }}>끝</motion.span>
            </span>
          </div>
        </div>
      </div>
      <div aria-hidden className="mx-auto my-10 h-12 w-px bg-white/25" />
      <p className="text-[16px] text-white/65">들어 옮길 필요도, 다시 맞출 필요도 없이</p>
      <p className="mt-2 text-[25.5px] font-medium leading-[1.4] tracking-[-0.03em] text-white">하루에 몇 번이고<br /><b className="font-extrabold">앉은 자리에 맞춰</b> 바꿉니다</p>
      </div>
    </Section>
  )
}

/* 집 밖에서도 — 회의실·행사장·매장처럼 큰 TV를 여럿이 보는 곳 (각도 섹션 다음) */
const SPACE_ICON: Record<string, string> = {
  meet: 'M4 4h16v10H4z M12 14v3 M8 20h8 M2 20h20',
  event: 'M3 20h18 M5 20V10l7-6 7 6v10 M10 20v-5h4v5',
  shop: 'M4 9l1.2-5h13.6L20 9 M4 9v11h16V9 M4 9h16 M9 20v-6h6v6',
  cafe: 'M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z M16 10.5h1.5a2 2 0 0 1 0 4H16 M8 3v3 M12 3v3',
}
export function Spaces() {
  const rows: [string, string, ReactNode][] = [
    ['meet', '회의실', <>발표하는 사람 쪽으로,<br />앉은 자리 쪽으로</>],
    ['event', '행사장·전시 부스', <>관람 동선에 맞춰 돌리고<br />철수도 공구 없이</>],
    ['shop', '매장·쇼룸', <>손님이 서는 자리 쪽으로<br />진열이 바뀌어도 그대로</>],
    ['cafe', '카페·라운지', <>좌석 배치에 맞춰<br />벽 공사 없이 바로</>],
  ]
  return (
    <Section cap="13b_공간" tone="dark">
      <Serif dark>Beyond the living room</Serif>
      <div className="mt-3"><Heading dark lead="집 밖에서도">큰 화면이 있는 곳이라면<br /><b>어디든</b></Heading></div>
      <Body dark>벽에 구멍을 낼 수 없는 공간,<br />자리 배치가 자주 바뀌는 공간일수록<br /><b>턴패드</b>가 편합니다.</Body>
      <div className="mt-9 grid grid-cols-2 gap-2 text-left">
        {rows.map(([k, t, d]) => (
          <div key={k} className="rounded-[10px] bg-white/[.06] px-4 pb-5 pt-4">
            <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="#E2D5C6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={SPACE_ICON[k]} /></svg>
            <p className="mt-3 text-[16px] font-bold text-white">{t}</p>
            <p className="mt-1 text-[13px] leading-[1.6] text-white/60">{d}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-1.5">
        {['벽 공사 없이', '공구 없이 설치·철수', '두께 15mm'].map(t => (
          <span key={t} className="rounded-full border border-white/20 px-3 py-1.5 text-[13px] font-semibold text-sky-xl">{t}</span>
        ))}
      </div>
      <p className="mt-6 text-[13.5px] text-white/55">여러 대가 필요하시면 메이커에게 문의해 주세요.<br />수량에 맞춰 안내해 드립니다.</p>
    </Section>
  )
}

/* Detail 04 — 소재 (왼쪽 정렬) */
const CHECK = <svg viewBox="0 0 24 24" className="size-[22px] shrink-0" fill="none"><circle cx="12" cy="12" r="10.5" stroke="#8C6E5C" strokeWidth="1.3" /><path d="m7.5 12.3 3 3 6-6.3" stroke="#6B5245" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
export function Point04() {
  const checks: ReactNode[] = [
    <><b>잘 닳지 않고</b> 충격에 강한 소재</>,
    <><b>기름 없이도</b> 부드럽게 미끄러지는 소재</>,
    <><b>금속 없이</b> 만들어 녹슬 곳 없는 구조</>,
    <><b>식품에 닿아도 되는</b> 원료</>,
  ]
  // 근거: 근거자료_대신자동화/00_근거자료_정리.md (OKULEN 식품 접촉 적합 선언서, SGS 성적서)
  const proofs: [string, ReactNode, string][] = [
    ['food', <><b>식품에 직접 닿아도 되는</b> 원료<br />유럽·미국 식품 접촉 기준에 맞습니다</>, '원료 제조사 식품 접촉 적합 선언서'],
    ['sgs', <>중금속·브롬계 난연제<br /><b>유해물질 불검출</b></>, '공인 시험기관 SGS 시험성적서'],
  ]
  return (
    <Section cap="14_D04_소재" tone="ivory">
      <DetailTag n={4} label="MATERIAL" />
      <Heading lead="식품이 닿는 곳에도 쓰이는">두 가지 소재로 <b>만들었습니다</b></Heading>

      {/* 소재 카드: 사진 위에 아이콘 원이 걸쳐 있는 구성 */}
      <div className="mt-9 overflow-hidden rounded-[10px] bg-paper text-center shadow-[0_8px_24px_rgba(42,36,34,.05)] ring-1 ring-line">
        <Slot kind="사진" what="상판·하판 표면 결 클로즈업" how="두 판이 맞닿은 단면 · 사선 조명으로 질감 · 매크로 · 인조가죽 마감 면과 판 단면이 함께 보이게" code="B3" src="/3d/open_c1.gif" noTag capOff className="aspect-[4/3]" />
        <div className="relative px-5 pb-7 pt-12">
          <span className="absolute left-1/2 top-0 flex size-[62px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-paper shadow-[0_0_0_6px_rgba(247,242,234,.9)]">
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="#6B5245" strokeWidth="1.6" strokeLinejoin="round"><path d="M12 3 2.5 8 12 13l9.5-5z" /><path d="m2.5 12.5 9.5 5 9.5-5" /><path d="m2.5 16.5 9.5 5 9.5-5" opacity=".45" /></svg>
          </span>
          <p className="font-serif text-[15px] italic text-mocha">Material grade</p>
          <p className="mt-2 text-[25.5px] font-medium leading-[1.4] tracking-[-0.03em] text-ink">오래 같은 모습으로<br /><b className="font-extrabold">쓰도록 고른 소재</b></p>
          <div className="mt-5 flex flex-wrap justify-center gap-1">
            {['국내 가공', '금속 부품 0', '무급유'].map(t => (
              <span key={t} className="rounded-full bg-ivory px-2.5 py-1.5 text-[13px] font-semibold text-ink"><span className="mr-0.5 text-mocha">#</span>{t}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-2 text-left">
        {checks.map((c, i) => (
          <div key={i} className="flex items-center gap-3 rounded-[10px] bg-paper ring-1 ring-line px-5 py-4 text-[16px] text-text [&_b]:font-bold [&_b]:text-ink">
            {CHECK}<span>{c}</span>
          </div>
        ))}
      </div>

      {/* 부드러운 움직임: 진한 바탕 한 장 — 위아래 자르는 줄(data-cut)은 흰 띠 끝, 진한 면 시작/끝에 딱 맞춤 */}
      <div aria-hidden className="-mx-6 mt-6 h-[110px] bg-[linear-gradient(to_bottom,rgba(255,255,255,0),#FFFFFF)]" />
      <div data-cut aria-hidden className="-mx-6 h-0" />
      <div data-tone="dark" className="-mx-6 bg-espresso px-6 py-[72px]">
        <Heading dark lead="낮은 마찰 소재가 만드는"><Underline>부드러운 움직임</Underline></Heading>
        <Body dark>오일이나 볼베어링 없이도<br />두 소재가 맞닿아 미끄러지는 힘만으로<br />무거운 TV가 <b>조용하게</b> 돌아갑니다.</Body>
        <Slot kind="GIF" what="하판 위를 상판이 미끄러지는 클로즈업" how="핀이 곡선 홈을 따라 움직이는 게 보이게 · 위에서 비스듬히 · 삼각대 고정 · 2~3초 왕복" code="B7" src="/3d/V3X_rotate_xray.gif" noTag cg round className="mt-9 aspect-[4/3]" />
      </div>
      <div data-cut aria-hidden className="-mx-6 h-0" />
      <div aria-hidden className="-mx-6 mb-6 h-[110px] bg-[linear-gradient(to_bottom,#FFFFFF,rgba(255,255,255,0))]" />
      <p className="text-[22.5px] font-medium leading-[1.45] tracking-[-0.03em] text-ink">거실에 늘 두는 물건이라<br /><b className="font-extrabold">원료부터 따졌습니다</b></p>
      <div className="mt-6 border-t border-ink/80">
        {proofs.map(([part, fact, src]) => (
          <div key={part} className="border-b border-line py-6">
            <p className="text-[16.5px] font-medium leading-[1.5] text-ink [&_b]:font-bold">{fact}</p>
            <p className="mt-1.5 text-[13px] text-mute">{src}</p>
          </div>
        ))}
      </div>
      <Body>아이와 반려동물이 있는 집에서도<br />걱정을 덜고 쓰시도록 원료부터 골랐고,<br />그 원판을 <b>국내 공장</b>에서 한 장씩 CNC로 깎습니다.</Body>
      <div className="mt-9 grid grid-cols-2 gap-1.5">
        {/* 협력사 공장 외관 — 사용 허락 확인 필요 */}
        <div className="relative">
          <Slot kind="사진" what="가공 협력사 공장 외관" how="대신자동화 시흥 공장 · 사용 허락 후 선명하게" code="B5" src="/photo/factory_exterior.jpg" noTag compact round className="aspect-square" />
          <span className="absolute bottom-2 left-2 z-20 rounded-full bg-espresso/80 px-2.5 py-1 text-[11.5px] font-semibold text-white backdrop-blur-sm">경기 시흥 가공 공장</span>
        </div>
        {/* 2-POINT 가공 장면이 아니라 협력사 현장임을 사진 위에 밝힘 */}
        <div className="relative">
          <Slot kind="GIF" what="CNC로 판을 깎는 장면" how="공장 실사 · 절삭 날과 판이 함께 · 2~3초" code="B6" src="/photo/factory_cnc_groove.jpg" noTag compact round className="aspect-square" />
          <span className="absolute bottom-2 left-2 z-20 rounded-full bg-espresso/80 px-2.5 py-1 text-[11.5px] font-semibold text-white backdrop-blur-sm">가공 협력사 현장</span>
        </div>
      </div>
      <div className="mt-1.5 grid grid-cols-2 gap-1.5">
        {/* SGS 성적서는 일부만 옮기면 안 된다고 적혀 있어 3쪽 전체를 나란히 */}
        <div className="relative">
          <Slot kind="서류" what="원료 식품 접촉 적합 선언서" how="OKULEN 선언서 윗부분" src="/photo/doc_okulen.jpg" noTag compact round className="aspect-[4/3]" />
          <span className="absolute bottom-2 left-2 z-20 rounded-full bg-espresso/80 px-2.5 py-1 text-[11.5px] font-semibold text-white backdrop-blur-sm">식품 접촉 적합</span>
        </div>
        <div className="relative">
          <Slot kind="서류" what="원료 SGS 시험성적서" how="3쪽 전체" src="/photo/doc_sgs.jpg" noTag compact round className="aspect-[4/3]" />
          <span className="absolute bottom-2 left-2 z-20 rounded-full bg-espresso/80 px-2.5 py-1 text-[11.5px] font-semibold text-white backdrop-blur-sm">SGS 유해물질 불검출</span>
        </div>
      </div>
    </Section>
  )
}

/* 이런 분들께 추천 */
export function Recommend() {
  const rows: [string, string][] = [['벽 타공 없이', ' TV 방향을 바꾸고 싶은 분'], ['수납 거실장', '을 그대로 쓰고 싶은 분'], ['소파·식탁', ' 어디서든 화면을 보고 싶은 분'], ['조용하고 녹슬지 않는', ' 받침대를 찾는 분'], ['오래 쓸 물건', '을 고르는 분']]
  return (
    <section data-cap="12_추천" data-tone="dark" className="relative overflow-hidden bg-gradient-to-b from-mocha to-mocha-d pt-20 text-center text-white">
      <p aria-hidden className="absolute inset-x-0 top-9 text-[66px] font-bold tracking-[-0.04em] text-white/[.07]">2-POINT</p>
      <div className="relative px-6"><Heading dark lead="다큐 턴패드 2-POINT,">이런 분들께 <b>추천드립니다</b></Heading></div>
      <ul className="relative mt-8 rounded-t-[20px] bg-paper px-6 pb-10 pt-4 text-left" data-tone="light">
        {rows.map(([b, s], i) => (
          <li key={b} className={`grid grid-cols-[34px_1fr] items-center py-3.5 text-[15.5px] text-sub ${i ? 'border-t border-line' : ''}`}>
            <em className="font-serif text-[15px] italic text-sky-d">0{i + 1}</em><span><b className="font-semibold text-ink">{b}</b>{s}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* Detail 05 — 설치 */
export function Point05() {
  // 간편 설치 3단계 — 핀은 상판에 끼워진 채로 오므로, 하판 위에 상판을 올리기만 하면 됨 (① 3D, ②·③ 11/2 실사)
  const steps: [string, string, string, string, string][] = [
    ['상판 올리기', '하판 위에 상판을 올리기만 하면 됩니다.\n핀은 상판에 끼워진 채로 보내드립니다.', '공구 필요 없음', '/3d/open_c3.gif', 'C7'],
    ['다리 아래 놓기', 'TV 다리 간격에 맞춰 두 패드를 하나씩 놓고\n그 위에 다리를 내려놓습니다.', '벽·가구 그대로', '/photo/r_two_pads.jpg', 'A7-1'],
    ['손끝으로 돌리기', '보고 싶은 쪽으로 TV를 살짝 밀면 끝.\n하판은 그대로, 상판만 돌아갑니다.', '기름칠 없이', '/photo/r_hero_v2.gif', 'A7-2'],
  ]
  return (
    <Section cap="17_D05_설치">
      <DetailTag n={6} label="SETUP" />
      <Heading lead="공구도, 벽 공사도 없이">놓고, 올리면 <Underline>설치 끝</Underline></Heading>
      <div className="mt-10 flex flex-col gap-11 text-left">
        {steps.map(([t, d, tag, src, code], i) => (
          <div key={t} className="relative">
            {i === 2 && <div data-cut aria-hidden className="absolute inset-x-0 -top-[22px] h-0" />}{/* 한 장이 10MB를 넘어서 2·3단계 사이 흰 여백에서 나눔 */}
            <div className="relative">
              <Slot kind="GIF" what={t} how={d} code={code} src={src} noTag round className="aspect-[16/10]" />
              <span className="absolute left-3 top-3 z-20 flex size-[30px] items-center justify-center rounded-full bg-mocha-d text-[14px] font-bold text-white">{i + 1}</span>
            </div>
            {i === 0 && <CgCap className="!mt-1.5" />}{/* 11/2: 3D 표기는 3D인 1단계에만 (2·3단계는 실사) */}
            <div className="mt-4 flex items-baseline justify-between gap-3">
              <p className="text-[19px] font-bold text-ink">{t}</p>
              <span className="shrink-0 text-[12.5px] font-semibold text-mocha">{tag}</span>
            </div>
            <p className="mt-1.5 whitespace-pre-line text-[14px] leading-[1.6] text-sub">{d}</p>
          </div>
        ))}
      </div>
      <div data-cut aria-hidden className="mt-9 h-0" />
      <div className="mt-9 pt-4 text-left">
        <div className="flex items-start justify-between">
          <p className="text-[25.5px] font-medium leading-[1.35] tracking-[-0.03em] text-ink">거실장 위에서<br /><b className="font-extrabold">드러나지 않는 두께</b></p>
          <span className="font-serif text-[16px] italic text-mute">Low profile</span>
        </div>
        <p className="mt-4 text-[56px] font-extrabold leading-none tracking-[-0.04em] text-mocha-d">15<span className="ml-1 text-[25.5px] font-bold">mm</span></p>
        <div className="mt-5 flex flex-col gap-1.5">
          <div className="relative">
            <Slot kind="사진" what="하판 모서리 클로즈업" how="3D · 판 두께와 둥근 모서리가 보이게" code="C3" src="/3d/open_c5.gif" noTag round className="aspect-[4/3]" />
            <span className="absolute bottom-2 left-2 z-20 rounded-full bg-espresso/80 px-2.5 py-1 text-[11.5px] font-semibold text-white backdrop-blur-sm">낮은 각도에서 본 패드</span>
          </div>
          <div className="relative">
            <Slot kind="사진" what="옆에서 본 하판" how="3D · 눈높이 측면" code="C3-2" src="/3d/thk_profile.jpg" noTag round className="aspect-[5/1]" />
            <span className="absolute bottom-2 left-2 z-20 rounded-full bg-espresso/80 px-2.5 py-1 text-[11.5px] font-semibold text-white backdrop-blur-sm">옆에서 본 하판</span>
          </div>
        </div>
        <CgCap className="!mt-1.5" />
        <p className="mt-4 text-[15px] leading-[1.75] text-sub">상판 10mm와 하판 5mm를 합친 두께입니다.<br />TV는 그만큼만 높아지고<br /><b className="font-semibold text-ink">사운드바·선 정리는 그대로</b>입니다.</p>
      </div>
      <ul className="mt-6 border-t border-line pt-4 text-left">
        {['평평한 거실장 위에서 사용해 주세요.', 'TV를 들어 올릴 때는 두 사람이 함께해 주세요.', '돌리기 전 전원·HDMI 케이블에 여유가 있는지 확인해 주세요.'].map(t => (
          <li key={t} className="relative pl-3 text-[13.5px] leading-[1.9] text-sub before:absolute before:left-0 before:top-[10px] before:size-1 before:rounded-full before:bg-sky">{t}</li>
        ))}
      </ul>
    </Section>
  )
}

/* 맞는 TV — 레퍼런스의 '어떤 사이즈가 적합할까요?' 자리: 되는 TV / 안 되는 TV + 패드 크기 */
function TvIcon({ legs }: { legs: 'two' | 'center' }) {
  return (
    <svg viewBox="0 0 120 80" className="mx-auto w-[110px]" fill="none">
      <rect x="10" y="6" width="100" height="56" rx="3" fill="#2F2620" />
      {legs === 'two'
        ? <><path d="M26 62 L20 74 M94 62 L100 74" stroke="#2F2620" strokeWidth="4" strokeLinecap="round" /><rect x="10" y="73" width="22" height="5" rx="1.5" fill="#C9AE98" /><rect x="88" y="73" width="22" height="5" rx="1.5" fill="#C9AE98" /></>
        : <><path d="M60 62 L60 72" stroke="#2F2620" strokeWidth="5" /><rect x="40" y="71" width="40" height="5" rx="2" fill="#2F2620" /></>}
    </svg>
  )
}
export function Fit() {
  return (
    <Section cap="18_맞는TV" tone="sand">
      <DetailTag n={7} label="FIT" />
      <Heading lead="펀딩 전에 확인하세요">우리 집 TV에<br /><b>맞을까요?</b></Heading>
      <div className="mt-9 grid grid-cols-2 gap-2">
        <div className="rounded-[10px] bg-paper px-3 pb-6 pt-7 ring-1 ring-mocha/30">
          <TvIcon legs="two" />
          <p className="mt-4 text-[14px] font-bold text-mocha-d">맞습니다</p>
          <p className="mt-1 text-[16px] font-bold leading-[1.45] text-ink">다리가 양쪽으로<br />나뉜 TV</p>
          <p className="mt-2 text-[13px] leading-[1.6] text-sub">두 다리 아래에<br />패드를 하나씩 놓습니다</p>
        </div>
        <div className="rounded-[10px] bg-paper/60 px-3 pb-6 pt-7">
          <div className="opacity-45"><TvIcon legs="center" /></div>
          <p className="mt-4 text-[14px] font-bold text-mute">권하지 않습니다</p>
          <p className="mt-1 text-[16px] font-bold leading-[1.45] text-sub">가운데 스탠드<br />하나인 TV</p>
          <p className="mt-2 text-[13px] leading-[1.6] text-mute">두 점으로 받치는 구조라<br />맞지 않습니다</p>
        </div>
      </div>
      <Fig><PadSize /></Fig>
      <Body>TV 다리 바닥이 <b>상판(100 × 350mm)</b> 위에<br />올라가는지 확인해 주세요.</Body>
      <Body className="!mt-3">거실장 위에 <b>하판(500 × 130mm)</b>이<br />밖으로 나오지 않고 다 올라가는지도 봐 주세요.</Body>
    </Section>
  )
}

/* 색상 */
export function Colors() {
  const cs: [string, string, string, string][] = [
    ['화이트', '#FFFFFF', '흰색·밝은 거실장에 깔끔하게', 'white'],
    ['아이보리', '#F3EDE3', '베이지·밝은 원목에 부드럽게', 'ivory'],
    ['모카', '#8A6A52', '짙은 원목 거실장에 차분하게', 'mocha'],
  ]
  return (
    <Section cap="19_색상" tone="ivory" cg>
      <Serif>Three colors, one living room</Serif>
      <div className="mt-3"><Heading lead="거실장 색에 맞춰"><b className="text-mocha">세 가지</b> 컬러</Heading></div>
      <Body>세 가지 모두 <b>가죽 질감의 시트</b>로 마감했습니다.</Body>
      {/* 한눈에: 위에서 본 세 색 패드 — 아래 색 이름과 같은 열에 놓임 */}
      <Slot kind="사진" what="세 가지 색 패드를 위에서" how="3D · 화이트 · 아이보리 · 모카 나란히" code="C11-2" src="/3d/color_trio_top.jpg" noTag round className="mt-8 aspect-square" />
      <div className="mt-4 grid grid-cols-3">
        {cs.map(([n, c], i) => (
          <p key={n} className="flex items-center justify-center gap-2 text-[15px] font-semibold">
            <motion.i className="size-4 rounded-full border border-[#D5CEC4]" style={{ background: c }}
              animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 3, times: [0, .15, .3], ease: 'easeInOut', repeat: Infinity, delay: i * 0.4 }} />{n}
          </p>
        ))}
      </div>
      {/* 하나씩: TV 다리 아래에 놓았을 때 */}
      <p className="mt-12 text-[16px] font-semibold text-ink">TV 다리 아래에 놓으면</p>
      <div className="mt-5 flex flex-col gap-3 text-left">
        {cs.map(([n, c, d, k]) => (
          <div key={n} className="grid grid-cols-[1.25fr_1fr] items-center gap-4 overflow-hidden rounded-[12px] bg-paper ring-1 ring-line">
            <Slot kind="사진" what={`${n} 패드를 TV 다리 아래에 놓은 모습`} how="3D · 다리 클로즈업" code={`C11-${k}`} src={`/3d/color_${k}.jpg`} noTag className="aspect-[4/3]" />
            <div className="pr-4">
              <p className="flex items-center gap-2 text-[18px] font-bold text-ink"><i className="size-[14px] rounded-full border border-[#D5CEC4]" style={{ background: c }} />{n}</p>
              <p className="mt-1.5 text-[13.5px] leading-[1.5] text-sub">{d}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

/* 개발 노트 손그림 — 화면에 들어오면 펜으로 그리듯 선이 그려지고 3초마다 반복 (about 페이지 스케치) */
function Sketch({ n }: { n: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    // 선 순서(--i)의 최댓값을 --n 으로 둬서, 그림마다 그려지는 시간이 같게(약 1.1초 안에 다 시작)
    const max = Math.max(1, ...[...el.querySelectorAll<SVGElement>('[style*="--i"]')].map(x => Number(x.style.getPropertyValue('--i')) || 0))
    el.style.setProperty('--n', String(max))
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect() } }, { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <div ref={ref} className={`dn-sk ${on ? 'on' : ''}`} dangerouslySetInnerHTML={{ __html: SKETCHES[n] }} />
}

/* 믿을 수 있는 다큐 — 개발 노트 (turnpad/docs/about-copy.md 4번 + 대표 인터뷰로 1단계 보완) */
export function Trust() {
  const steps: [string, ReactNode, string][] = [
    ['고민의 시작', <>시작은 거실장 위의 대형 TV였습니다.<br />앉는 자리가 바뀔 때마다<br />들어 옮기지 않고 <b>방향만 바꾸고</b> 싶었습니다.</>, '/devnote/01-sketch.svg'],
    ['베어링 없는 구조', <><b>고장 나는 부품을 아예 빼기로</b> 했습니다.<br />판과 판이 맞닿아 미끄러지며 도는 구조를 정하고,<br />그 위에서 <b>오래 버틸 소재</b>를 찾았습니다.</>, '/devnote/02-structure.svg'],
    ['열 번이 넘는 도면 수정', <>구조시험 전문가인 대표가 직접<br /><b>도면을 열 번 넘게</b> 고쳤습니다.<br />무거운 TV를 받치면서도<br /><b>손끝으로 돌아가는</b> 마찰력을 찾는 과정이었습니다.</>, '/devnote/03-drawing.svg'],
    ['스무 번이 넘는 시제품', <>판마다 CNC로 깎아<br /><b>시제품을 스무 번 넘게</b> 새로 만들었습니다.<br />올리고 돌리는 테스트를 셀 수 없이 반복해<br />지금의 턴패드가 나왔습니다.</>, '/devnote/04-assembly.svg'],
  ]
  return (
    <Section cap="16_신뢰">
      <Serif>Development note</Serif>
      <div className="mt-3"><Heading lead="작은 불편 하나에서">매일 쓰는 물건이<br /><b className="text-mocha">되기까지</b></Heading></div>
      <Body>다큐는 구조시험 전문기업 STN을 이끌어 온<br />대표가 만든 생활 브랜드입니다.</Body>
      <div className="mt-10 text-left">
        {steps.map(([t, body], i) => (<Fragment key={t}>
          {/* 2→3단계: 이음선이 끊기지 않게 선을 그은 채로 자르는 줄(data-cut)을 둠 (흰 바탕이라 띠 없이) */}
          {i === 2 && <div data-cut aria-hidden className="relative h-6"><span className="absolute inset-y-0 left-[11px] w-px bg-line" /></div>}
          <div className={`relative pb-10 pl-9 ${i < steps.length - 1 ? 'before:absolute before:bottom-0 before:left-[11px] before:top-7 before:w-px before:bg-line' : ''}`}>
            <span className="absolute left-0 top-0 flex size-[23px] items-center justify-center rounded-full bg-mocha-d text-[12px] font-bold text-white">{String(i + 1).padStart(2, '0')}</span>
            <p className="text-[18px] font-bold leading-[1.4] text-ink">{t}</p>
            <p className="mt-2 text-[14px] leading-[1.75] text-sub [&_b]:font-bold [&_b]:text-ink">{body}</p>
            <div className="mt-4 rounded-[8px] bg-ivory px-3 py-3">
              <Sketch n={i} />
            </div>
          </div>
        </Fragment>))}
      </div>
      {/* 시제품 변천 사진 대신: 구조를 지키는 디자인 권리 — 진한 바탕 한 장, 진한 면이 시작하는 줄에서 자름 */}
      <div data-cut aria-hidden className="-mx-6 h-0" />
      <div data-tone="dark" className="-mx-6 -mb-[72px] bg-espresso px-6 py-[72px]">
      <Serif dark>Design registration</Serif>
      <div className="mt-3"><Heading dark lead="스무 번 고쳐 완성한 구조를">디자인 <b className="text-sky-xl">등록</b>으로 지킵니다</Heading></div>
      <Body dark>턴패드의 구조는 디자인 등록을 받았고,<br />두 점으로 받치는 2-POINT는 <b>디자인 출원</b>을 마쳤습니다.</Body>
      <div className="mt-8 grid grid-cols-2 gap-1.5">
        <div className="relative">
          <Slot kind="서류" what="디자인 등록증" how="등록번호가 보이게 첫 장" src="/photo/doc_design_cert.jpg" noTag compact round className="aspect-[3/4]" />
          <span className="absolute bottom-2 left-2 z-20 rounded-full bg-espresso/80 px-2.5 py-1 text-[11.5px] font-semibold text-white backdrop-blur-sm">디자인 등록 30-1267775</span>
        </div>
        <div className="relative">
          <Slot kind="서류" what="2-POINT 디자인 출원 도면" how="출원 30-2026-0034869 도면 1" src="/photo/doc_design_2026.jpg" noTag compact round className="aspect-[3/4]" />
          <span className="absolute bottom-2 left-2 z-20 rounded-full bg-espresso/80 px-2.5 py-1 text-[11.5px] font-semibold text-white backdrop-blur-sm">2-POINT 디자인 출원</span>
        </div>
      </div>
      <InfoPill>디자인 등록 30-1267775 · 디자인 출원 30-2026-0034869</InfoPill>
      </div>
    </Section>
  )
}

/* A/S 보장 띠 */
export function Guarantee() {
  return (
    <section data-cap="20_AS보장" data-tone="dark" className="flex items-center gap-5 bg-gradient-to-r from-espresso to-espresso-2 px-6 py-7 text-left text-white">
      <Seal top="GUARANTEE · DACU" main="A/S" sub="무상" size={96} />
      <div>
        <h3 className="text-[18px] font-bold">기간 제한 없는 <span className="text-sky-xl">무상 A/S</span></h3>
        <p className="mt-1.5 text-[13.5px] leading-[1.6] text-white/70">정상적으로 쓰다 생긴 하자는 기간과 상관없이<br />무상으로 부품 교체 또는 교환해 드립니다.</p>
        <p className="mt-1.5 text-[11.5px] text-white/45">* 사용자 부주의로 인한 손상은 유상으로 처리될 수 있습니다.</p>
      </div>
    </section>
  )
}

/* 체험단 — 11/2 페이지에서 빼 둠(App.tsx 주석). 후기 오면 reviews.ts 채우고 다시 넣기 */
export function Reviews() {
  return (
    <Section cap="21_체험단" tone="ivory">
      <Serif>Real living rooms</Serif>
      <div className="mt-3"><Heading lead="먼저 써본 일곱 집이 남긴">체험단의 <Underline>실제 거실</Underline></Heading></div>
      <p className="mt-6 rounded-[6px] bg-paper px-4 py-3 ring-1 ring-line text-left text-[13px] leading-[1.6] text-sub">아래 후기는 다큐가 체험단 일곱 분께<br />제품을 무료로 제공하고 받은 후기입니다.</p>
      <div className="mt-3 flex flex-col gap-2 text-left">
        {/* 후기 내용은 reviews.ts에서 */}
        {REVIEWS.map((r, n) => (
          <div key={n} className="grid grid-cols-[118px_1fr] overflow-hidden rounded-[8px] bg-paper ring-1 ring-line">
            <Slot kind="사진" what={`체험단 거실 ${n + 1}`} how="체험단이 보낸 실제 거실 사진" src={r.photo} noTag={!!r.photo} todo={r.photo ? undefined : '후기 사진 예정'} compact className="min-h-[140px]" />
            <div className="p-4">
              <p className="text-right text-[12px] tracking-[2px] text-sky">★★★★★</p>
              <h4 className="mt-1 text-[16px] font-bold text-ink">{r.title}</h4>
              <p className="mt-1.5 text-[13px] leading-[1.55] text-sub">{r.quote}</p>
              <span className="mt-2 block text-[11.5px] text-mute">{r.tv} · {r.nick}</span>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

/* 메이커 이야기 — 대표 인터뷰(10/28 받음) 원문을 최소 수정 (notion/14_대표인터뷰_정리.md) */
export function Maker() {
  const qa: [string, ReactNode][] = [
    ['벽에 거는 방법이나 스탠드가 있는데도, 굳이 거실장 위에서 돌리는 방법을 만든 이유는 무엇인가요?', <>물론 최근에는 거실 공간을 넓게 사용하기 위하여<br />벽걸이형을 사용하기도 하고,<br />이동성을 고려하여 스탠드형을 사용하기도 합니다.<br />본 턴패드 제품은 수납공간 활용을 위하여<br /><b>TV 거실장 사용을 선호하는 소비자들이</b><br /><b>간단하게 설치하고 옮길 수 있는 제품</b>입니다.</>],
    ['회전판이나 베어링을 쓰지 않기로 한 이유는 무엇인가요?', <>여러 부품의 조합으로 이루어진 구조는<br />먼지 등의 이물질로 인한 <b>고장이 발생할 수 있습니다.</b><br />본 턴패드 제품은 <b>마찰계수가 작은</b><br /><b>재료 자체의 성질만을 이용</b>해서<br />간단히 조립하고 분리할 수 있기 때문에<br /><b>청결하고 물세척이 가능하며, 오래 사용할 수 있습니다.</b></>],
    ['도면을 10번, 시제품을 20번 넘게 다시 만들면서 가장 어려웠던 건 무엇이었나요?', <>처음 아이디어 출발은<br />공학적 지식을 바탕으로 한 것이었기 때문에<br />기술적인 문제를 해결하는 것은 크게 어렵지 않았습니다.<br />하지만 <b>소비자들이 안전하게 사용할 수 있는</b><br /><b>제품으로 만들기까지</b> 제품 자체는 물론<br />가정에서 사용하는 과정에서<br /><b>안전사고가 발생하지 않도록</b><br />해결해야 하는 문제들이 있었습니다.<br />이러한 문제들을 해결하기 위하여<br />다양한 시행착오들을 겪어야 했습니다.</>],
    ['이 소재(PTFE·UHMWPE)를 고른 이유는요?', <>공학적인 기본 원리를 이용하여<br />턴패드의 사용에 <b>가장 적합한</b><br /><b>재료 조합</b>이라고 판단했습니다.<br />즉 <b>너무 미끄럽지도 않고 너무 거칠지도 않으면서</b><br />합리적인 가격을 제공할 수 있는<br />소재의 조합이라는 결론에 도달한 것입니다.</>],
    ['다큐(Daily And Constant Utility)라는 이름에 담고 싶었던 마음은요?', <>우리 <b>생활 속의 실속형 디자인(도구)</b>을 담고 있습니다.<br />본 턴패드 제품도 역시 우리 생활 속의 제품이며,<br /><b>주방의 도마 소재로도 사용되는</b><br /><b>플라스틱 재료</b>로 제작되었습니다.</>],
    ['이 제품을 어떤 집, 어떤 사람이 썼으면 좋겠나요?', <>이 제품을 보는 순간 “이거다”라고 느끼는<br />소비자분들이 많을 것이라 생각합니다.<br />즉 무엇보다 <b>실용적인 제품</b>이며<br /><b>현재 고정형 TV의 품격을 업그레이드</b>시켜줄 것입니다.<br />이로써 답을 대신하고자 합니다.</>],
    ['와디즈에서 처음 선보이는 이유는 무엇인가요?', <>와디즈는 새로운 생각을 먼저 알아보고<br />응원해 주시는 분들이 모이는 곳이라고 생각합니다.<br /><b>오랜 시간 공들여 다듬은 턴패드</b>를<br />그런 분들께 <b>가장 먼저 보여드리고 싶었습니다.</b><br />서포터분들의 이야기에 귀 기울여<br /><b>더 오래 곁에 두실 수 있는 제품</b>으로 만들어 가겠습니다.</>],
  ]
  return (
    <Section cap="22_메이커">
      <Serif>Maker's story</Serif>
      <div className="mt-3"><Heading lead="다큐 대표가 직접 전하는">이 제품을 <b>만든 이유</b></Heading></div>
      {/* 대표 인사 — 소개서 말투 대신 말 거는 투로. STN은 2017년부터 */}
      <p className="mt-9 text-[19px] font-semibold leading-[1.5] text-ink">안녕하세요,<br />다큐 대표 심낙훈입니다.</p>
      <Body className="!mt-4">저는 2017년부터<br />구조시험 전문기업 <b>STN</b>을 이끌어 왔습니다.<br />무게를 받치는 구조가 얼마나 버티는지<br />시험하고 따지는 일입니다.<br /><br />그 경험을 집에서 매일 쓰는 물건에도<br />담아 보고 싶어 생활 브랜드 <b>다큐</b>를 만들었고,<br />턴패드 2-POINT는 그렇게 시작했습니다.</Body>
      <Slot kind="사진" what="도면을 보며 작업하는 대표님" how="도면·시제품·공구가 놓인 책상 · 손이 시제품을 만지는 순간 · 얼굴 노출은 선택" code="D1" src="/photo/maker_ceo.jpg" noTag bleed className="mt-9 aspect-[4/3]" />
      <Break h={40} className="mt-4 -mb-4" />
      <p className="mt-8 font-serif text-[56px] leading-[.8] text-sky">“</p>
      <p className="min-h-[3.2em] text-[23.5px] font-semibold leading-[1.5] text-ink"><Typewriter lines={['식탁에 앉아서도', 'TV를 편하게 보고 싶었습니다']} /></p>
      <Body>스탠드형 대형 TV를 거실장 위에 두고 씁니다.<br />소파에서는 정면이지만, 옆쪽 식탁에 앉으면<br />화면이 비스듬히 보였습니다.<br />그래서 회전 받침대를 직접 고안하기 시작했고,<br />시행착오 끝에 찾은 답은 <b>소재</b>였습니다.</Body>
      <div className="mt-10 border-t border-ink/80 text-left">
        {qa.map(([q, a], k) => (<Fragment key={q}>
          {k === 3 && <Break h={40} className="my-0" />}
          <div className="border-b border-line py-6">
            <p className="flex gap-2 text-[16px] font-bold leading-[1.5] text-ink"><span className="font-serif text-[18px] italic text-mocha">Q.</span><span>{q}</span></p>
            <p className="mt-3 text-[14.5px] leading-[1.8] text-sub [&_b]:font-semibold [&_b]:text-ink">{a}</p>
          </div>
        </Fragment>))}
      </div>
      {/* 서명: 이름 오른쪽에 나란히 (겹치면 이름이 안 읽힘) */}
      <div className="mt-12 flex items-end justify-end gap-2.5">
        <p className="text-[14px] text-mute">다큐 대표 <b className="font-semibold text-ink">심낙훈</b></p>
        <img src="/sign_shimnakhoon.png" alt="심낙훈 서명" className="mb-[3px] h-[27px] w-auto opacity-90" />
      </div>
    </Section>
  )
}

/* Q&A */
export function QnA() {
  const qa: [string, ReactNode][] = [
    ['우리 집 TV에 맞나요?', <>다리가 좌우로 나뉜 TV라면 쓸 수 있습니다.<br />두 패드를 다리 간격에 맞춰 놓으면 됩니다.</>],
    ['가운데 스탠드 하나로 서는 TV도 되나요?', <>2-POINT는 두 다리를 각각 받치는 구조라<br />다리가 좌우로 나뉜 TV에 맞춰 만들었습니다.</>],
    ['흔들리거나 넘어지지 않나요?', <>두 다리를 각각 받치기 때문에<br />TV는 원래 서 있던 그대로 섭니다.<br />평평한 거실장 위에서 써주세요.</>],
    ['거실장이 긁히거나 패드가 밀리지 않나요?', <>하판 바닥의 미끄럼 방지 줄이 거실장을 붙잡아<br />패드는 그대로 있고 위의 상판만 움직입니다.</>],
    ['베어링 없이 어떻게 돌아가나요?', <>마찰이 낮은 PTFE 위를 상판이 같은 원을 따라 미끄러져<br />TV는 제자리에서 방향만 바뀝니다.</>],
    ['돌릴 때 소리가 나지 않나요?', <>기름이나 베어링 없이 소재끼리 미끄러지도록 만들어<br />조용하게 돌아갑니다.</>],
    ['TV가 높아지지 않나요?', <>패드 두께 15mm만큼만 높아집니다.<br />사운드바나 거실장 위 소품은 그대로 두셔도 됩니다.</>],
    ['하나만 살 수 있나요?', '두 다리를 각각 받쳐야 돌아가는 구조라 두 개가 한 세트입니다.'],
  ]
  return (
    <Section cap="25_QnA" align="left">
      <Serif>Q&amp;A</Serif>
      <div className="mt-2"><Heading lead="펀딩 전에 확인하세요"><b>자주 묻는</b> 질문</Heading></div>
      <div className="mt-7 border-t border-ink/80">
        {qa.map(([q, a]) => (
          <div key={q} className="border-b border-line py-4">
            <h3 className="flex gap-2.5 text-[15.5px] font-semibold leading-[1.45] text-ink">
              <span className="font-serif text-[16px] italic text-sky-d">Q.</span>{q}
            </h3>
            <p className="mt-1.5 pl-6 text-[14px] leading-[1.7] text-sub">{a}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}

/* 제품 상세정보 (어두운 표) */
export function Spec() {
  const spec: [string, ReactNode][] = [
    ['제품명', '다큐 턴패드 2-POINT'], ['구성', '상판 2, 하판 2, 연결 핀 2'],
    ['상판', <>350 × 100 × 10mm<br />UHMWPE, 인조가죽 시트지 마감</>],
    ['하판', <>500 × 130 × 5mm · 곡선 홈<br />PTFE, 바닥 미끄럼 방지 줄</>],
    ['연결 핀', 'Ø10 × 13mm · UHMWPE'], ['두께', '15mm (상판 10mm + 하판 5mm)'], ['색상', '화이트, 아이보리, 모카'],
    ['맞는 TV', <>다리가 좌우로 분리된 TV</>],
    ['디자인권', <>등록 제30-1267775호<br />출원 30-2026-0034869 (2-POINT)</>], ['제조', '국내 CNC 가공'], ['판매원', '비티엠이앤씨 (브랜드 DACU)'],
  ]
  const policy: [string, ReactNode][] = [
    ['배송', <>펀딩이 끝난 뒤 12월 중순부터 순서대로<br />우체국 택배로 보내드립니다.<br />해외 배송은 하지 않습니다.</>],
    ['교환·환불', <>배송 완료일로부터 7일 안에<br />단순 변심 환불을 신청하실 수 있습니다.<br />아래의 경우 단순 변심에 의한 반품·환불이 어려울 수 있습니다.
      <ul className="mt-1.5 flex flex-col gap-1">{[
        '구성품(상판 2, 하판 2, 연결 핀 2) 중 일부가 빠진 경우',
        '사용으로 인해 상판 시트지에 오염·찢김·들뜸이 생기거나, 하판 바닥의 미끄럼 방지 줄이 분리·손상된 경우',
        '안내된 사용 환경(평평한 거실장 위, 다리가 좌우로 분리된 TV) 외의 용도로 사용하다 파손된 경우',
      ].map(t => <li key={t} className="flex gap-1.5"><span>·</span><span>{t}</span></li>)}</ul>
      <span className="mt-1.5 block">소재 특성상 표면에 미세한 결이 보일 수 있으며,<br />이는 제품 불량이 아닙니다.</span></>],
    ['A/S', <>기간 제한 없이 무상 A/S를 제공합니다.<br />정상적인 사용 중 생긴 하자(파손, 변형, 시트지 들뜸 등)는 기간과 관계없이 무상으로 부품 교체 또는 제품 교환해 드립니다.<br />사용자 부주의나 안내된 사용 환경 외 사용으로 인한 손상은 유상으로 처리될 수 있습니다.<br />A/S 왕복 배송비는 서포터님 부담입니다. 단, 수령 직후 발견한 초기 불량이나 오배송은 메이커가 부담합니다.</>],
    ['A/S 접수', <>비티엠이앤씨 고객센터 <b className="font-semibold text-white">061-333-8386</b><br />접수 시 제품 사진이나 영상을 요청드릴 수 있습니다.</>],
    ['사용 주의', <>평평한 곳에서 쓰고, 무리하게 빠르게 돌리지 말고,<br />케이블 여유 길이를 확인해 주세요.</>],
  ]
  const table = (rows: [string, ReactNode][]) => (
    <dl>{rows.map(([k, v]) => (
      <div key={k} className="grid grid-cols-[86px_1fr] gap-3 border-b border-white/10 py-3 text-[13.5px] leading-[1.6]">
        <dt className="font-semibold text-sky-xl">{k}</dt><dd className="text-white/70">{v}</dd>
      </div>
    ))}</dl>
  )
  return (
    <section data-cap="26_제품상세정보" data-tone="dark" className="bg-espresso px-6 py-16 text-left text-white">
      <h2 className="border-b border-white/60 pb-3.5 text-[22.5px] font-semibold">제품 상세정보</h2>
      {table(spec)}
      <h2 className="mt-11 border-b border-white/60 pb-3.5 text-[22.5px] font-semibold">배송 · 교환 · A/S</h2>
      {table(policy)}
      <p className="mt-10 text-[13px] leading-[1.7] text-white/50">턴패드는 특허청에 상표 출원 중입니다 (40-2026-0191706).<br />상표와 콘텐츠를 허락 없이 쓰면 관련 법에 따라 처벌받을 수 있습니다.</p>
      <div className="mt-12 text-center"><Logo className="h-[20px] text-white/80" /><p className="mt-2 font-serif text-[13px] italic text-white/45">Daily And Constant Utility</p></div>
    </section>
  )
}
