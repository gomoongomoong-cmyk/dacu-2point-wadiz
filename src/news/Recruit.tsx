import { motion, useTransform, type MotionValue } from 'motion/react'
import type { ReactNode } from 'react'
import { Logo, seg, useLoop } from '../v3/ui'

/* 새소식 이미지 · 체험단 7명 모집 (11/4 발행) — 11/2: 제목 문구는 새소식 글 제목으로 옮기고, 거실 3D 그림은 뺌. 새소식은 글 사이에 들어가서 흰 그라데이션 없이 */

const CHECK = <svg viewBox="0 0 24 24" className="size-[22px] shrink-0" fill="none"><circle cx="12" cy="12" r="10.5" stroke="#8C6E5C" strokeWidth="1.3" /><path d="m7.5 12.3 3 3 6-6.3" stroke="#6B5245" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
const IVORY = 'bg-[#F7F2EA]'

/* 일정: 3초마다 선이 왼쪽부터 차오르며 날짜가 하나씩 켜짐 → 잠깐 머묾 → 함께 옅어짐 */
const STEPS: [string, string, string][] = [
  ['11/4(수)~11/6(금)', '모집', '자정까지'],
  ['11/7(토)', '발표', '새소식'],
  ['11/9(월)', '발송', '우체국 택배'],
  ['11/15(일)', '후기 마감', '와디즈 커뮤니티'],
]
function Stop({ p, i, children }: { p: MotionValue<number>; i: number; children: ReactNode }) {
  const at = 0.06 + i * 0.16
  const k = useTransform(p, v => seg(v, at, at + 0.08) * (1 - seg(v, 0.9, 0.97)))
  const bg = useTransform(k, v => `rgba(107,82,69,${0.18 + 0.82 * v})`)
  const ring = useTransform(k, v => `0 0 0 ${v * 6}px rgba(168,139,120,${0.25 * v})`)
  const opacity = useTransform(k, v => 0.45 + 0.55 * v)
  return (
    <div className="relative flex flex-col items-center text-center">
      <motion.span className="relative z-10 size-[14px] rounded-full" style={{ background: bg, boxShadow: ring }} />
      <motion.div className="mt-3" style={{ opacity }}>{children}</motion.div>
    </div>
  )
}
function Timeline() {
  const p = useLoop(3)
  const fill = useTransform(p, v => seg(v, 0.06, 0.6) * (1 - seg(v, 0.9, 0.97)))
  return (
    <div className="relative mt-8">
      {/* 점 사이를 잇는 선 (첫 점 가운데 → 마지막 점 가운데) */}
      <span className="absolute left-[12.5%] right-[12.5%] top-[6px] h-[2px] bg-line" />
      <motion.span className="absolute left-[12.5%] top-[6px] h-[2px] origin-left bg-mocha-d" style={{ width: '75%', scaleX: fill }} />
      <div className="grid grid-cols-4">
        {STEPS.map(([d, t, s], i) => (
          <Stop key={t} p={p} i={i}>
            <p className="text-[15px] font-bold text-ink">{t}</p>
            <p className="mt-1 text-[12px] font-semibold leading-[1.35] text-mocha-d">{d}</p>
            <p className="mt-0.5 text-[11px] leading-[1.35] text-mute">{s}</p>
          </Stop>
        ))}
      </div>
    </div>
  )
}

function Head({ children }: { children: ReactNode }) {
  return <p className="flex items-center gap-2.5 text-[18px] font-bold text-ink"><span className="h-[18px] w-[3px] rounded-full bg-mocha-d" />{children}</p>
}

export function Recruit() {
  return (
    <section data-cap="news_체험단모집" data-tone="light" className={`relative overflow-hidden px-6 py-[52px] text-center ${IVORY}`}>
      <Logo className="h-[13px] text-mocha-d" />
      <p className="mx-auto mt-7 w-fit rounded-full bg-mocha-d px-4 py-[7px] text-[14px] font-semibold text-white">오픈 전 체험단 모집</p>
      <h2 className="mt-6 text-[35px] font-medium leading-[1.34] tracking-[-0.04em] text-ink">턴패드 2-POINT<br /><b className="font-extrabold text-mocha-d">체험단 7분 모집</b></h2>
      <p className="mt-4 text-[16px] leading-[1.65] text-sub">거실장 위 우리 집 TV로 먼저 써 보고<br />솔직한 후기를 남겨 주세요.</p>

      {/* 보내드리는 것 */}
      <div className="mt-9 overflow-hidden rounded-[14px] bg-paper text-left shadow-[0_10px_28px_rgba(42,36,34,.07)] ring-1 ring-line">
        <div className="relative aspect-[16/9]">
          <img src="/3d/kit_06_angle_dark.jpg" alt="2-POINT 1세트 구성: 상판 2, 하판 2, 연결 핀 2" className="absolute inset-0 size-full object-cover" />
        </div>
        <div className="flex items-center justify-between gap-3 px-5 py-5">
          <div>
            <p className="text-[13px] font-semibold text-mocha">보내드리는 것</p>
            <p className="mt-1 text-[18px] font-bold text-ink">2-POINT 1세트</p>
            <p className="mt-0.5 text-[13.5px] text-sub">상판 2 · 하판 2 · 연결 핀 2</p>
          </div>
          <span className="shrink-0 rounded-full bg-mocha-d px-3 py-1.5 text-[13px] font-bold text-white">제품 제공</span>
        </div>
      </div>

      {/* 참여 방법 */}
      <div className="mt-10 text-left">
        <Head>참여 방법</Head>
        <ol className="mt-5 flex flex-col gap-2">
          {[
            <>이 프로젝트 <b>알림신청</b></>,
            <><b>지지서명</b>에 응원 댓글 남기기</>,
            <><b>신청 폼</b> 작성 · TV와 거실장 사진 첨부<span className="mt-0.5 block text-[12.5px] font-normal text-mute">폼 링크는 새소식 본문에 있습니다</span></>,
          ].map((t, i) => (
            <li key={i} className="flex items-start gap-3.5 rounded-[10px] bg-paper px-5 py-4 text-[16px] leading-[1.5] text-text ring-1 ring-line [&_b]:font-bold [&_b]:text-ink">
              <span className="mt-[1px] flex size-[24px] shrink-0 items-center justify-center rounded-full bg-espresso text-[13px] font-bold text-white">{i + 1}</span>
              <span>{t}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* 이런 분을 찾아요 */}
      <div className="mt-10 text-left">
        <Head>이런 분을 찾아요</Head>
        <div className="mt-5 flex flex-col gap-3.5 px-1">
          {[
            <>다리가 <b>좌우로 나뉜 스탠드형 TV</b>를 쓰시는 분</>,
            <>TV를 <b>거실장 위</b>에 두고 쓰시는 분</>,
            <><b>11월 15일(일)까지</b> 사진·영상 후기를 남겨주실 분</>,
          ].map((t, i) => (
            <p key={i} className="flex items-center gap-3 text-[16px] leading-[1.5] text-text [&_b]:font-bold [&_b]:text-ink">{CHECK}<span>{t}</span></p>
          ))}
        </div>
      </div>

      {/* 일정 */}
      <div className="mt-11 text-left">
        <Head>일정</Head>
        <Timeline />
      </div>

      {/* 안내 */}
      <ul className="mt-11 flex flex-col gap-1.5 rounded-[10px] bg-paper px-5 py-5 text-left text-[13px] leading-[1.65] text-sub ring-1 ring-line">
        {[
          '다양한 TV 크기와 브랜드에서 써보실 수 있도록 고르게 선정합니다.',
          '선정 결과는 11월 7일(토) 새소식으로 알려드립니다. (닉네임 일부 가림)',
          '후기 맨 앞에 "다큐로부터 제품을 무료로 제공받아 작성한 후기입니다"를 꼭 적어 주세요.',
          '받은 연락처와 주소는 제품 발송에만 쓰고, 발송 후 파기합니다.',
        ].map(t => <li key={t} className="flex gap-1.5"><span>·</span><span>{t}</span></li>)}
      </ul>
    </section>
  )
}
