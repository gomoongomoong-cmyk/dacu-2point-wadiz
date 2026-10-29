import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// 깃허브 페이지는 /저장소이름/ 아래에서 열리므로, 배포 빌드에서는 public 파일 경로를 상대 경로로 바꿈
const relativePublic = (): Plugin => ({
  name: 'relative-public',
  apply: 'build',
  transform(code, id) {
    if (!/\.tsx?$/.test(id)) return
    return code.replace(/(["'`])\/(3d|photo|devnote|temp|sign_shimnakhoon)/g, '$1./$2')
  },
})

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), relativePublic()],
})
