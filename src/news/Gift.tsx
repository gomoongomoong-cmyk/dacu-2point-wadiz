import { motion } from 'motion/react'

/* 새소식 · 펀딩 선물 인조가죽 시트 (11/3 회의: 판매는 화이트 한 가지, 펀딩하신 모든 분께 아이보리나 모카 시트 1장을 선물로)
   새소식은 글 사이에 들어가서 흰 그라데이션 없이 바탕색 그대로 */

const COLORS: [string, string, string][] = [['화이트', '#FFFFFF', '기본'], ['아이보리', '#F3EDE3', '선물 시트'], ['모카', '#8A6A52', '선물 시트']]
const STEPS: [string, string][] = [['색 고르기', '펀딩할 때 옵션 칸에'], ['잘라 내기', '상판 크기에 맞춰'], ['붙이기', '상판 위에 붙이면 끝']]

export function Gift() {
  return (
    <section data-cap="news_펀딩선물" data-tone="light" className="relative overflow-hidden bg-[#F7F2EA] px-6 py-[52px] text-center">
      {/* 선물 알약: 3초마다 살짝 통 튐 */}
      <motion.p className="mx-auto flex w-fit items-center gap-1.5 rounded-full bg-mocha-d px-4 py-[7px] text-[14px] font-semibold text-white"
        animate={{ scale: [1, 1.08, 1, 1] }} transition={{ duration: 3, times: [0, 0.12, 0.26, 1], ease: 'easeInOut', repeat: Infinity }}>
        <svg viewBox="0 0 16 16" className="size-[15px]" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"><rect x="2" y="6" width="12" height="8" rx="1" /><path d="M1.5 6h13M8 6v8M8 6C6.5 3 3.5 3.5 4.5 5.2 5.2 6 8 6 8 6zm0 0c1.5-3 4.5-2.5 3.5-.8C10.8 6 8 6 8 6z" /></svg>
        펀딩 선물
      </motion.p>
      <h2 className="mt-6 text-[33px] font-medium leading-[1.36] tracking-[-0.04em] text-ink">펀딩하신 모든 분께<br /><b className="font-extrabold text-mocha-d">인조가죽 시트 한 장</b></h2>
      <p className="mt-4 text-[16px] leading-[1.65] text-sub">아이보리와 모카 중 하나를 골라<br />거실장 색에 맞춰 바꿔 보세요.</p>

      <div className="relative mt-9 overflow-hidden rounded-[14px]">
        <img src="/3d/color_trio_top.jpg" alt="위에서 본 화이트, 아이보리, 모카 패드" className="block aspect-square w-full object-cover" />
        <span className="absolute bottom-2 right-3 text-[10.5px] text-ink/40">이해를 돕기 위한 3D 그래픽입니다</span>
      </div>
      <div className="mt-4 grid grid-cols-3">
        {COLORS.map(([n, c, t], i) => (
          <div key={n} className="flex flex-col items-center gap-1">
            <p className="flex items-center gap-2 text-[15px] font-semibold text-ink">
              <motion.i className="size-4 rounded-full border border-[#D5CEC4]" style={{ background: c }}
                animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 3, times: [0, .15, .3], ease: 'easeInOut', repeat: Infinity, delay: i * 0.4 }} />{n}
            </p>
            <p className={`text-[12.5px] font-medium ${i ? 'text-mocha-d' : 'text-mute'}`}>{t}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-3 gap-2 text-center">
        {STEPS.map(([t, d], i) => (
          <div key={t} className="rounded-[10px] bg-white/60 px-2 py-4">
            <span className="mx-auto flex size-[24px] items-center justify-center rounded-full bg-espresso text-[13px] font-bold text-white">{i + 1}</span>
            <p className="mt-2 text-[15px] font-bold text-ink">{t}</p>
            <p className="mt-0.5 text-[12px] leading-[1.4] text-mute">{d}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
