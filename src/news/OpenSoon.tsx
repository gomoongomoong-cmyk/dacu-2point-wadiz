import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { Logo } from '../v3/ui'

/* 11/4 오픈예정 시작과 함께 올릴 새소식 이미지 (11/2: 새소식을 셋으로 나눔 — 오픈예정 공개 / 커피 이벤트 / 체험단)
   ① 오픈예정 공개: 실사 영상 + 11월 17일(화) 낮 12시  ② 커피 이벤트 포스터  (③ 체험단은 Recruit.tsx)
   새소식은 이미지 사이에 글이 들어가서 위아래 흰 그라데이션 없이 바탕색 그대로 */

function Card({ cap, className = '', children }: { cap: string; className?: string; children: ReactNode }) {
  return <section data-cap={cap} data-tone="light" className={`relative overflow-hidden bg-[#F7F2EA] px-6 py-[52px] text-center ${className}`}>{children}</section>
}

/* ① 오픈 안내 포스터 (11/2 다시): 진한 바탕 한 장, 로고는 오른쪽 위 작게.
   "무엇을 → 언제"가 바로 읽히게: 제목(와디즈에서 처음 공개) → 공개일·시간을 이름표와 함께 → 실사 영상 (움직임은 영상만) */
function Announce() {
  return (
    <section data-cap="news01_오픈예정공개" data-tone="dark" className="relative bg-espresso text-center text-white">
      {/* DACU × wadiz — 와디즈 로고 파일을 받으면 글자 자리에 그대로 바꿔 넣음 (심사에서 안 된다고 하면 이 줄만 빼면 됨) */}
      <div className="flex items-center justify-center gap-3.5 pt-11">
        <Logo className="h-[12px] text-white" />
        <span className="text-[15px] font-light text-white/50">×</span>
        <span className="text-[19px] font-extrabold leading-none tracking-[-0.03em] text-white">wadiz</span>
      </div>
      <div className="px-7 pb-8 pt-9">
        <p className="text-[16px] font-semibold text-[#E2D5C6]">다큐 턴패드 2-POINT</p>
        <h2 className="mt-2 text-[32px] font-bold leading-[1.3] tracking-[-0.035em]">와디즈에서<br />처음 공개합니다</h2>
        <div className="mx-auto mt-7 grid grid-cols-2 rounded-[12px] bg-white/[.08] py-4">
          {[['공개일', '11월 17일 (화)'], ['시간', '낮 12시']].map(([k, v], i) => (
            <div key={k} className={`px-5 ${i ? 'border-l border-white/15' : ''}`}>
              <p className="text-[13px] font-semibold text-[#E2D5C6]">{k}</p>
              <p className="mt-1 text-[21px] font-bold tracking-[-0.02em]">{v}</p>
            </div>
          ))}
        </div>
      </div>
      {/* 짤은 상자 안에 (캡처 도구가 짤의 바로 위 상자를 칠해 섞기 때문에 섹션 바탕이 물들지 않게) */}
      <div className="relative aspect-video"><img src="/photo/r_hero3.gif" alt="손끝으로 밀면 거실장 위 TV가 제자리에서 각도를 바꾸는 장면" className="absolute inset-0 size-full object-cover" /></div>
      <p className="px-7 pb-10 pt-5 text-center text-[15px] leading-[1.6] text-white/70">손끝으로 밀면, 거실장 위 TV가 제자리에서 돌아갑니다</p>
    </section>
  )
}

/* ② 알림신청 커피 이벤트 */
function CoffeeEvent() {
  return (
    <Card cap="news02_커피이벤트">
      <p className="mx-auto w-fit rounded-full bg-mocha-d px-4 py-[7px] text-[14px] font-semibold text-white">오픈예정 이벤트</p>
      <h2 className="mt-6 text-[33px] font-medium leading-[1.36] tracking-[-0.04em] text-ink">알림신청하고 응원 남기면<br /><b className="font-extrabold text-mocha-d">10분께 커피 한 잔</b></h2>
      <div className="relative mx-auto mt-9 w-[118px]">
        {/* 컵만 잘라 둔 그림이라 정확히 가운데 · 그림자는 따로 */}
        <span className="absolute -bottom-2 left-1/2 h-[14px] w-[150px] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgba(90,70,59,.28),rgba(90,70,59,0))]" />
        <img src="/photo/iced_americano_cup.png" alt="아이스 아메리카노" className="relative block w-full" />
        {/* 추첨 10분: 위 알약과 같은 단색 모카 스티커 — 살짝 기울여 컵 오른쪽 아래(그림자 잘린 곳)를 덮음 · 3초마다 살짝 통 튐 */}
        <motion.div className="absolute -bottom-2 left-[calc(100%-42px)] flex size-[96px] flex-col items-center justify-center rounded-full bg-mocha-d text-white shadow-[0_12px_24px_-10px_rgba(42,36,34,.55)]"
          style={{ rotate: -8 }} animate={{ scale: [1, 1.08, 1, 1] }} transition={{ duration: 3, times: [0, 0.12, 0.26, 1], ease: 'easeInOut', repeat: Infinity }}>
          <span className="text-[14px] font-semibold text-champagne">추첨</span>
          <span className="-mt-0.5 text-[28px] font-extrabold tracking-[-0.03em]">10분</span>
        </motion.div>
      </div>
      <p className="mt-6 text-[17px] font-semibold text-ink">스타벅스 아메리카노 기프티콘</p>
      <p className="mt-1 text-[14px] text-mute">11월 4일(수) ~ 11월 17일(화) 낮 12시 오픈 전까지</p>
    </Card>
  )
}

export { Announce, CoffeeEvent }
