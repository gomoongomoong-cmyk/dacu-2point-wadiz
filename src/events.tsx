import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { Blank } from './ui'

/* 이벤트 아이콘 — 채운 모양, 3초 안에 한 번씩 움직임 */
function IconDisc({ dark, children }: { dark?: boolean; children: ReactNode }) {
  return <div className={`flex size-[104px] items-center justify-center rounded-full ${dark ? 'bg-espresso-2' : 'bg-paper shadow-[0_14px_28px_-12px_rgba(90,70,59,.35)] ring-1 ring-[#E6DACB]'}`}>{children}</div>
}

function Bell({ color }: { color: string }) {
  return (
    <motion.svg viewBox="0 0 48 48" className="size-[52px]" fill={color} style={{ originX: '50%', originY: '12%' }}
      animate={{ rotate: [0, 0, 16, -13, 9, -5, 0, 0] }}
      transition={{ duration: 2.4, times: [0, 0.1, 0.18, 0.28, 0.38, 0.46, 0.54, 1], ease: 'easeInOut', repeat: Infinity }}>
      <path d="M24 5a3 3 0 0 1 3 3v1.3c5.6 1.3 9 6 9 11.7v8l3.5 4.6a1.5 1.5 0 0 1-1.2 2.4H9.7a1.5 1.5 0 0 1-1.2-2.4L12 29v-8c0-5.7 3.4-10.4 9-11.7V8a3 3 0 0 1 3-3z" />
      <path d="M19.2 39h9.6a4.8 4.8 0 0 1-9.6 0z" />
    </motion.svg>
  )
}

function Coin() {
  // 공식 펀딩 인장과 같은 은색 링 질감 + 빛이 한 바퀴 도는 반짝임, 그 상태로 뒤집힘
  return (
    <motion.div className="relative size-[66px] rounded-full drop-shadow-[0_6px_12px_rgba(0,0,0,.3)]" style={{ transformPerspective: 400 }}
      animate={{ rotateY: [0, 0, 360, 360] }}
      transition={{ duration: 2.6, times: [0, 0.15, 0.55, 1], ease: [0.22, 1, 0.36, 1], repeat: Infinity }}>
      <div className="absolute inset-0 rounded-full bg-[conic-gradient(#ECE9E5,#FFFFFF,#C6C0B8,#F4F1EE,#CFC8BF,#FFFFFF,#DCD6CF,#ECE9E5)]" />
      <motion.div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,255,255,.9)_40deg,transparent_90deg)] mix-blend-screen"
        animate={{ rotate: 360 }} transition={{ duration: 2.6, ease: 'linear', repeat: Infinity }} />
      <span className="absolute inset-[5px] flex items-center justify-center rounded-full border-[1.5px] border-[#6B5245]/60 text-[16px] font-extrabold tracking-[-0.03em] text-[#5A463B]">100%</span>
    </motion.div>
  )
}

function Coffee({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 48 48" className="size-[56px]" fill={color}>
      {[17, 24, 31].map((x, i) => (
        <motion.path key={x} d={`M${x} 13c-2-2.2 2-3.8 0-6`} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"
          animate={{ y: [3, -2], opacity: [0, 1, 0] }}
          transition={{ duration: 2, delay: i * 0.3, ease: 'easeOut', repeat: Infinity, repeatDelay: 0.4 }} />
      ))}
      <path d="M11 16.5h26a1.5 1.5 0 0 1 1.5 1.5v2a1.5 1.5 0 0 1-1.5 1.5H11A1.5 1.5 0 0 1 9.5 20v-2a1.5 1.5 0 0 1 1.5-1.5z" />
      <path d="M12 23.5h24l-2.4 19.2a2 2 0 0 1-2 1.8H16.4a2 2 0 0 1-2-1.8z" />
      <path d="M13.4 29h21.2l-.8 7H14.2z" fill="#F7F2EA" opacity=".55" />
    </svg>
  )
}

type Ev = { cap: string; n: string; when: string; title: ReactNode; desc: ReactNode; icon: ReactNode; steps: ReactNode[]; notes: ReactNode[]; dark?: boolean; bg: string }

/* 섹션마다 은은한 그라데이션 — 바탕은 위아래로 살짝만 진하기가 달라지고, 어두운 섹션만 아이콘 뒤에 옅은 빛
   (밝은 섹션은 흰 빛이 흰 원과 섞여 원이 안 보여서 뺌) */
const GLOW_DARK = 'radial-gradient(circle at 84% 16%, rgba(140,110,92,.55) 0%, rgba(140,110,92,0) 40%)'

function EventBlock({ cap, n, when, title, desc, icon, steps, notes, dark = false, bg }: Ev) {
  return (
    <section data-cap={cap} data-tone={dark ? 'dark' : 'light'} style={{ backgroundImage: dark ? `${GLOW_DARK}, ${bg}` : bg }}
      className={`px-6 pb-14 pt-16 text-left ${dark ? 'bg-espresso text-white' : 'bg-ivory text-ink'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-[14px] font-semibold ${dark ? 'text-sky-xl' : 'text-mocha'}`}>이벤트 {n} · {when}</p>
          <h3 className="mt-3 text-[29.5px] font-medium leading-[1.34] tracking-[-0.035em] [&_b]:font-extrabold">{title}</h3>
        </div>
        <div className="shrink-0">{icon}</div>
      </div>
      <p className={`mt-6 text-[16px] leading-[1.75] [&_b]:font-bold ${dark ? 'text-white/70 [&_b]:text-white' : 'text-sub [&_b]:text-ink'}`}>{desc}</p>
      <div className={`my-9 h-px ${dark ? 'bg-white/15' : 'bg-line'}`} />
      <p className="text-[18px] font-bold">참여 방법</p>
      <ol className="mt-4 flex flex-col gap-3">
        {steps.map((s, i) => (
          <li key={i} className={`flex items-start gap-3 text-[15.5px] leading-[1.55] ${dark ? 'text-white/85' : 'text-text'}`}>
            <span className={`mt-[1px] flex size-[22px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${dark ? 'bg-sky-xl text-espresso' : 'bg-espresso text-white'}`}>{i + 1}</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
      <ul className={`mt-8 rounded-[8px] px-4 py-4 text-[13px] leading-[1.75] ${dark ? 'bg-white/[.06] text-white/55' : 'bg-paper text-mute'}`}>
        {notes.map((t, i) => <li key={i} className="flex gap-1.5"><span>·</span><span>{t}</span></li>)}
      </ul>
    </section>
  )
}

const DO_THREE = [
  <>기간 안에 <b className="font-semibold">다큐 턴패드 2-POINT</b>에 펀딩하기</>,
  <>프로젝트 <b className="font-semibold">지지서명</b> 남기기</>,
  <>커뮤니티에 <b className="font-semibold">펀딩번호와 응원 댓글</b> 남기기</>,
]

/** 오픈 이벤트 3가지 (체험단은 새소식으로만 안내) */
export function Events() {
  const MOCHA = '#8C6E5C'
  const items: Ev[] = [
    {
      cap: '01_이벤트01_알림신청', n: '01', when: '오픈예정',
      bg: 'linear-gradient(165deg, #FCFAF6 0%, #F7F2EA 50%, #EEE4D7 100%)',
      title: <>알림신청하고<br /><b>슈퍼얼리버드</b><br />먼저 받기</>,
      desc: <>알림신청하신 분께 11월 16일 낮 12시 오픈 소식을<br />가장 먼저 보내드립니다.<br />가장 낮은 가격의 슈퍼얼리버드는 <b>15개 한정</b>입니다.</>,
      icon: <IconDisc><Bell color={MOCHA} /></IconDisc>,
      steps: [
        <>프로젝트 상단의 <b className="font-semibold">알림신청</b> 버튼 누르기</>,
        <>오픈일에 와디즈 <b className="font-semibold">오픈 알림</b> 확인하기</>,
        <><b className="font-semibold">슈퍼얼리버드</b> 리워드로 펀딩하기</>,
      ],
      notes: [
        <>오픈: 11월 16일(월) 낮 12시</>,
        <>슈퍼얼리버드 15개가 모두 펀딩되면<br />얼리버드 가격으로 바뀝니다.</>,
        '알림신청은 무료이며, 신청해도 펀딩 참여 의무는 없습니다.',
      ],
    },
    {
      cap: '02_이벤트02_24시간', n: '02', when: '오픈 24시간', dark: true,
      bg: 'linear-gradient(165deg, #634D41 0%, #5A463B 50%, #4D3B31 100%)',
      title: <>첫날 펀딩하면<br />3분께<br /><b>100% 페이백</b></>,
      desc: <>오픈 후 24시간 안에 펀딩하신 분 중 3분을 추첨해<br /><b>결제하신 금액 전액</b>을 돌려드립니다.</>,
      icon: <IconDisc dark><Coin /></IconDisc>,
      steps: DO_THREE,
      notes: [
        <>기간: 11월 16일(월) 낮 12시 ~ 11월 17일(화) 오전 11시 59분</>,
        '발표: 펀딩 종료 후 결제가 모두 끝나면 새소식으로 발표합니다.',
        '결제가 실패하거나 취소된 펀딩은 추첨에서 제외됩니다.',
        <>페이백은 당첨자 확인 후 <b>본인 명의 계좌로 입금</b>해 드립니다.<br />입금을 위해 이름·은행·계좌번호를 받으며,<br />지급 후 바로 파기합니다.<br />제세공과금은 다큐가 부담합니다.</>,
        <>24시간 이벤트 참여자는<br />72시간 이벤트 추첨에도 자동으로 포함됩니다.</>,
      ],
    },
    {
      cap: '03_이벤트03_72시간', n: '03', when: '오픈 72시간',
      bg: 'linear-gradient(195deg, #FCFAF6 0%, #F6F0E6 50%, #ECE1D2 100%)',
      title: <>오픈 72시간 안에<br />펀딩하면 10분께<br /><b>커피 한 잔</b></>,
      desc: <>오픈 후 72시간 안에 펀딩하신 분 중 10분을 추첨해<br />커피 기프티콘을 보내드립니다.<br /><b>첫날 참여하시면 두 이벤트에 모두 응모</b>됩니다.</>,
      icon: <IconDisc><Coffee color={MOCHA} /></IconDisc>,
      steps: DO_THREE,
      notes: [
        <>기간: 11월 16일(월) 낮 12시 ~ 11월 19일(목) 오전 11시 59분</>,
        <>경품: 스타벅스 아메리카노 기프티콘</>,
        '발표: 펀딩 종료 후 결제가 모두 끝나면 새소식으로 발표합니다.',
        '결제가 실패하거나 취소된 펀딩은 추첨에서 제외됩니다.',
      ],
    },
  ]
  return <>{items.map(e => <EventBlock key={e.cap} {...e} />)}</>
}
