import { useEffect, useState } from 'react'
import { BrandWall, Closing, Colors, Fit, Grip, Guarantee, Hero, Maker, NoWay, Offer, Official, Opening, Point01, Point02, Point03, Spaces, Point04, Point05, Problem, QnA, Reviews, Spec, Standards, Statement, TopFilm, Trust } from './sections'
import { Events } from './events'
import { Slot, SlotNo } from './ui'

export default function App() {
  // 페이지에 놓인 순서대로 이미지 자리 번호를 매김
  const [nos, setNos] = useState<Record<string, number>>({})
  useEffect(() => {
    const m: Record<string, number> = {}
    document.querySelectorAll<HTMLElement>('main [data-slot]').forEach((el, k) => { m[el.dataset.slot ?? ''] = k + 1 })
    setNos(m)
  }, [])
  return (
    <SlotNo.Provider value={nos}>
      <main className="mx-auto w-[400px] overflow-hidden bg-paper">
        <TopFilm />
        <Events />
        <Official />
        <Opening />
        <Hero />
        <NoWay />
        <Problem />
        <Statement cap="08_두개의점" lead="TV 다리 둘, 패드 둘" lines={['그래서', <><b className="text-sky-xl">2-POINT</b>입니다</>]}
          media={<>
            <Slot kind="GIF" what="두 세트가 날아와 하나씩 조립되는 장면" how="3D · 어두운 무대 · 카메라 컷 1개 분량(약 5초)" code="C0" src="/3d/A3_kit_assemble_c3_zoom.gif" noTag cg round className="mt-12 aspect-[4/3] shadow-[0_24px_48px_-20px_rgba(0,0,0,.5)]" />
            {/* 위에서 본 두 패드: 상판이 같은 원을 따라 함께 돎 */}
            <Slot kind="GIF" what="위에서 본 두 패드가 함께 도는 장면" how="3D · 상판 반투명 · 3초" code="C13" src="/3d/V12_pair_xray.gif" noTag round className="mt-3 aspect-[2/1]" />
            <p className="mt-4 text-[15px] leading-[1.6] text-white/65">다리마다 패드 하나씩, 두 패드가 함께 돌아갑니다.</p>
          </>} />
        <BrandWall />
        {/* 10/30 순서②: 비싼 이유(원리·구조·소재·기준)를 먼저 → 그래서 생활이 바뀜·설치 쉬움 → 색·맞는 TV → 집 밖 활용 → 믿을 근거 → 후기 → 혜택 */}
        <Point02 />
        <Point01 />
        <Grip />
        <Point04 />
        <Standards />
        <Point03 />
        <Point05 />
        <Colors />
        <Fit />
        <Spaces />
        <Trust />
        <Maker />
        <Guarantee />
        <Reviews />
        <Closing />
        <Offer />
        <QnA />
        <Spec />
      </main>
    </SlotNo.Provider>
  )
}
