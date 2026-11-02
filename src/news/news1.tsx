import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import '../v3/index.css'
import { Announce, CoffeeEvent } from './OpenSoon'
import { Recruit } from './Recruit'

/* 11/4 오픈예정 시작 때 올릴 새소식 3개의 이미지 — 새소식마다 이름표를 달아 위아래로 띄움 (이름표는 캡처되지 않음) */
function Post({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <div>
      <p className="bg-[#2A2422] px-4 py-2.5 text-[13px] font-semibold text-white/80">새소식 {n} · {title}</p>
      {children}
    </div>
  )
}
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <main className="mx-auto flex w-[400px] flex-col gap-8 overflow-hidden bg-[#444]">
      <Post n={1} title="오픈예정 공개"><Announce /></Post>
      <Post n={2} title="알림신청 커피 이벤트"><CoffeeEvent /></Post>
      <Post n={3} title="체험단 7명 모집"><Recruit /></Post>
    </main>
  </StrictMode>,
)
