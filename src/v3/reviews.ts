/* 체험단 후기 — 후기가 오면 여기만 채우고, App.tsx에서 <Reviews /> 주석을 풀면 페이지에 나옴
   (11/2: 후기 마감 11/15 전이라 페이지에서는 빼 둠)

   채우는 법
   - photo: 체험단이 보낸 거실 사진을 public/photo/review_1.jpg 처럼 넣고 그 경로
   - title: 후기에서 가장 와닿는 한 줄 (뜻을 바꾸지 않게, 줄이기만)
   - quote: 후기 원문 그대로 인용 (고치지 않음)
   - tv: TV 크기·브랜드 (예: 75인치 · 삼성)
   - nick: 닉네임 일부만 (예: 김**)
   - 맨 앞 문구 "제품을 무료로 제공받아 작성한 후기"는 페이지가 자동으로 붙임 (공정위 추천·보증 심사지침) */
export type Review = { photo?: string; title: string; quote: string; tv: string; nick: string }

export const REVIEWS: Review[] = [
  { title: '[후기 핵심 한 줄]', quote: '[후기 원문, 고치지 않고 인용]', tv: '[TV 크기·브랜드]', nick: '[닉네임 일부]' },
  { title: '[후기 핵심 한 줄]', quote: '[후기 원문, 고치지 않고 인용]', tv: '[TV 크기·브랜드]', nick: '[닉네임 일부]' },
  { title: '[후기 핵심 한 줄]', quote: '[후기 원문, 고치지 않고 인용]', tv: '[TV 크기·브랜드]', nick: '[닉네임 일부]' },
]
