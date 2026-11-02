import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../v3/index.css'
import { Recruit } from './Recruit'

/* 새소식용 이미지 모음 — 상세페이지 v3와 같은 틀(400px 디자인 × 2.15배 = 860px)로 그려서 캡처해 씀 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <main className="mx-auto w-[400px] overflow-hidden bg-paper">
      <Recruit />
    </main>
  </StrictMode>,
)
