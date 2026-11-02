import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { Blank } from './ui'

/* 이벤트 아이콘 — 채운 모양, 3초 안에 한 번씩 움직임 */
function IconDisc({ dark, children }: { dark?: boolean; children: ReactNode }) {
  return <div className={`flex size-[104px] items-center justify-center rounded-full ${dark ? 'bg-espresso-2' : 'bg-paper shadow-[0_14px_28px_-12px_rgba(90,70,59,.35)] ring-1 ring-[#E6DACB]'}`}>{children}</div>
}

function Coin() {
  // 공식 펀딩 인장과 같은 은색 링 질감 + 빛이 한 바퀴 도는 반짝임, 그 상태로 뒤집힘
  return (
    <motion.div className="relative size-[66px] rounded-full drop-shadow-[0_6px_12px_rgba(0,0,0,.3)]" style={{ transformPerspective: 400 }}
      animate={{ rotateY: [0, 0, 360, 360] }}
      transition={{ duration: 3, times: [0, 0.15, 0.55, 1], ease: [0.22, 1, 0.36, 1], repeat: Infinity }}>
      <div className="absolute inset-0 rounded-full bg-[conic-gradient(#ECE9E5,#FFFFFF,#C6C0B8,#F4F1EE,#CFC8BF,#FFFFFF,#DCD6CF,#ECE9E5)]" />
      <motion.div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,255,255,.9)_40deg,transparent_90deg)] mix-blend-screen"
        animate={{ rotate: 360 }} transition={{ duration: 3, ease: 'linear', repeat: Infinity }} />
      <span className="absolute inset-[5px] flex items-center justify-center rounded-full border-[1.5px] border-[#6B5245]/60 text-[16px] font-extrabold tracking-[-0.03em] text-[#5A463B]">100%</span>
    </motion.div>
  )
}

type Ev = { cap: string; when: string; title: ReactNode; desc: ReactNode; icon: ReactNode; steps: ReactNode[]; notes: ReactNode[]; dark?: boolean; bg: string }

/* 섹션마다 은은한 그라데이션 — 바탕은 위아래로 살짝만 진하기가 달라지고, 어두운 섹션만 아이콘 뒤에 옅은 빛
   (밝은 섹션은 흰 빛이 흰 원과 섞여 원이 안 보여서 뺌) */
const GLOW_DARK = 'radial-gradient(circle at 84% 16%, rgba(140,110,92,.55) 0%, rgba(140,110,92,0) 40%)'

function EventBlock({ cap, when, title, desc, icon, steps, notes, dark = false, bg }: Ev) {
  return (
    <section data-cap={cap} data-tone={dark ? 'dark' : 'light'} style={{ backgroundImage: dark ? `${GLOW_DARK}, ${bg}` : bg }}
      className={`px-6 pb-11 pt-12 text-left ${dark ? 'bg-espresso text-white' : 'bg-ivory text-ink'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-[14px] font-semibold ${dark ? 'text-sky-xl' : 'text-mocha'}`}>{when}</p>
          <h3 className="mt-3 text-[29.5px] font-medium leading-[1.34] tracking-[-0.035em] [&_b]:font-extrabold">{title}</h3>
        </div>
        <div className="shrink-0">{icon}</div>
      </div>
      <p className={`mt-6 text-[16px] leading-[1.75] [&_b]:font-bold ${dark ? 'text-white/70 [&_b]:text-white' : 'text-sub [&_b]:text-ink'}`}>{desc}</p>
      <div className={`my-7 h-px ${dark ? 'bg-white/15' : 'bg-line'}`} />
      <p className="text-[18px] font-bold">참여 방법</p>
      <ol className="mt-4 flex flex-col gap-3">
        {steps.map((s, i) => (
          <li key={i} className={`flex items-start gap-3 text-[15.5px] leading-[1.55] ${dark ? 'text-white/85' : 'text-text'}`}>
            <span className={`mt-[1px] flex size-[22px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${dark ? 'bg-sky-xl text-espresso' : 'bg-espresso text-white'}`}>{i + 1}</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
      <ul className={`mt-6 rounded-[8px] px-4 py-4 text-[13px] leading-[1.75] ${dark ? 'bg-white/[.06] text-white/55' : 'bg-paper text-mute ring-1 ring-line'}`}>
        {notes.map((t, i) => <li key={i} className="flex gap-1.5"><span>·</span><span>{t}</span></li>)}
      </ul>
    </section>
  )
}

const DO_THREE = [
  <>기간 안에 <b className="font-semibold">펀딩</b>하기</>,
  <>프로젝트 <b className="font-semibold">지지서명</b> 남기기</>,
  <>커뮤니티에 <b className="font-semibold">펀딩번호와 응원 댓글</b> 남기기</>,
]

/* 이벤트 3가지 (11/2: 번호 없이 따로따로 — 와디즈 스토리를 오픈예정용·본펀딩용으로 나눠 넣기 위해)
   오픈예정 스토리: 커피 · 체험단 / 본펀딩 스토리: 페이백 */
const LIGHT_BG = 'linear-gradient(to bottom, #FFFFFF 0px, #F6F0E6 140px, #F0E7DA calc(100% - 140px), #FFFFFF 100%)'

const COFFEE: Ev = {
  cap: '02_이벤트_커피', when: '오픈예정 이벤트', dark: true,
  bg: 'linear-gradient(165deg, #634D41 0%, #5A463B 50%, #4D3B31 100%)',
  title: <>알림신청하고<br />응원 남기면<br /><b>커피 한 잔</b></>,
  desc: <>알림신청 후 지지서명 응원 댓글을 남겨 주신 분 중<br />추첨으로 10분께 <b>스타벅스 아메리카노</b>를 보내드립니다.</>,
  // 새소식과 같은 아이스 아메리카노 사진 + 추첨 10분 스티커
  icon: (
    <div className="relative mr-3 mt-1 w-[78px]">
      <img src="/photo/iced_americano_cup.png" alt="스타벅스 아이스 아메리카노" className="block w-full drop-shadow-[0_10px_14px_rgba(0,0,0,.35)]" />
      <span className="absolute -bottom-2 -right-7 flex size-[56px] rotate-[-8deg] flex-col items-center justify-center rounded-full bg-champagne text-espresso shadow-[0_8px_16px_-6px_rgba(0,0,0,.45)]">
        <span className="text-[10px] font-semibold text-mocha-d">추첨</span>
        <span className="-mt-0.5 text-[16px] font-extrabold tracking-[-0.03em]">10분</span>
      </span>
    </div>
  ),
  steps: [
    <>프로젝트 상단의 <b className="font-semibold">알림신청</b> 버튼 누르기</>,
    <><b className="font-semibold">지지서명</b>과 응원 댓글 남기기</>,
  ],
  notes: [
    <>기간: 11월 4일(수) 오전 10시 15분 ~ 11월 17일(화) 낮 12시 오픈 전까지</>,
    '발표: 펀딩 종료 후 새소식 · 기프티콘은 종료 후 14일 안에 발송',
  ],
}

const RECRUIT: Ev = {
  cap: '02b_이벤트_체험단', when: '오픈예정 이벤트', bg: LIGHT_BG,
  title: <>오픈 전에<br />먼저 써 볼<br /><b>체험단 7분</b></>,
  desc: <>다큐 턴패드 2-POINT 1세트를 <b>제품으로 제공</b>해 드리고<br />우리 집 거실장 위에서 써 본 솔직한 후기를 받습니다.</>,
  icon: (
    <div className="size-[104px] overflow-hidden rounded-full shadow-[0_14px_28px_-12px_rgba(90,70,59,.45)] ring-4 ring-paper">
      <img src="/3d/kit_06_angle_dark.jpg" alt="2-POINT 1세트: 상판 2, 하판 2, 연결 핀 2" className="size-full object-cover" />
    </div>
  ),
  steps: [
    <>프로젝트 상단의 <b className="font-semibold">알림신청</b> 버튼 누르기</>,
    <><b className="font-semibold">지지서명</b>과 응원 댓글 남기기</>,
    <><b className="font-semibold">신청 폼</b> 작성 · TV와 거실장 사진 첨부</>,
  ],
  notes: [
    '신청 폼 링크는 체험단 모집 새소식에 있습니다.',
    <>모집: 11월 4일(수) ~ 11월 6일(금) 자정 · 발표: 11월 7일(토) 새소식</>,
    '발송: 11월 9일(월) · 후기 마감: 11월 15일(일) 와디즈 커뮤니티',
    '다리가 좌우로 나뉜 스탠드형 TV를 거실장 위에 두고 쓰시는 분',
    '후기 맨 앞에 "제품을 무료로 제공받아 작성한 후기입니다"를 적어 주세요.',
  ],
}

const PAYBACK: Ev = {
  cap: '03_이벤트_페이백', when: '펀딩 오픈 이벤트 · 24시간', bg: LIGHT_BG,
  title: <>첫날 펀딩하면<br />3분께<br /><b>100% 페이백</b></>,
  desc: <>오픈 24시간 안에 펀딩하신 분 중 3분께<br /><b>결제 금액 전액</b>을 돌려드립니다.</>,
  icon: <IconDisc><Coin /></IconDisc>,
  steps: DO_THREE,
  notes: [
    <>기간: 11월 17일(화) 낮 12시 ~ 11월 18일(수) 오전 11시 59분</>,
    '발표: 펀딩 종료 후 새소식 (결제 실패·취소 건 제외)',
    <>본인 명의 계좌로 입금, 제세공과금은 다큐가 부담합니다.</>,
  ],
}

/** 상세페이지 미리보기용: 커피·페이백 (자리 수를 그대로 두어 기존 캡처 파일 번호가 밀리지 않게) */
export function Events() {
  return <>{[COFFEE, PAYBACK].map(e => <EventBlock key={e.cap} {...e} />)}</>
}

/** 이벤트 캡처용 페이지(events.html): 세 개 모두, 각각 한 장씩 */
export function AllEvents() {
  return <>{[COFFEE, RECRUIT, PAYBACK].map(e => <EventBlock key={e.cap} {...e} />)}</>
}
