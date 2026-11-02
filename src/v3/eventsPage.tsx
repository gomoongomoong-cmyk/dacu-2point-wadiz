import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AllEvents } from './events'

/* 이벤트 섹션 3개만 따로 (캡처용): 커피 · 체험단(오픈예정 스토리) / 페이백(본펀딩 스토리) */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <main className="mx-auto flex w-[400px] flex-col gap-[14px] overflow-hidden bg-white">
      <AllEvents />
    </main>
  </StrictMode>,
)
