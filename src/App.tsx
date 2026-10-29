import { useEffect, useState } from 'react'
import { BrandWall, Closing, Colors, Fit, Grip, Guarantee, Hero, Maker, NoWay, Offer, Official, Opening, Point01, Point02, Point03, Spaces, Point04, Point05, Problem, QnA, Reviews, Spec, Standards, Statement, Trust } from './sections'
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
        <Events />
        <Official />
        <Opening />
        <Hero />
        <NoWay />
        <Problem />
        <Statement cap="08_두개의점" lead="TV 다리 둘, 패드 둘" lines={['그래서', <><b className="text-sky-xl">2-POINT</b>입니다</>]}
          media={<Slot kind="GIF" what="두 세트가 날아와 하나씩 조립되는 장면" how="3D · 어두운 무대 · 카메라 컷 1개 분량(약 5초)" code="C0" src="/3d/A3_kit_assemble_c3_zoom.gif" noTag cg round className="mt-12 aspect-[4/3] shadow-[0_24px_48px_-20px_rgba(0,0,0,.5)]" />} />
        <BrandWall />
        <Point01 />
        <Grip />
        <Point02 />
        <Point03 />
        <Spaces />
        <Point04 />
        <Standards />
        <Trust />
        <Point05 />
        <Fit />
        <Colors />
        <Guarantee />
        <Reviews />
        <Maker />
        <Closing />
        <Offer />
        <QnA />
        <Spec />
      </main>
    </SlotNo.Provider>
  )
}
