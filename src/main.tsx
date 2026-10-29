import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// 배포 주소(깃허브 페이지)에서는 캡처용 2.15배 대신 화면 너비에 맞춤 (폰: 꽉 차게, PC: 최대 2.15배)
if (import.meta.env.PROD) {
  const fit = () => document.documentElement.style.setProperty('--page-zoom', String(Math.min(2.15, window.innerWidth / 400)))
  fit()
  window.addEventListener('resize', fit)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
