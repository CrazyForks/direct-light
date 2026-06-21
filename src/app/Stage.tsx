import { StudioScene } from '../scene/StudioScene'
import { useStore } from '../state/store'
import { ASPECT, letterbox, useElementSize } from './canvasLayout'
import { CompareStage } from './compare/CompareStage'
import { DirectorLightBrief } from './DirectorLightBrief'

export function Stage() {
  const viewMode = useStore((s) => s.viewMode)
  const aspect = useStore((s) => s.scene.camera.aspectRatio)
  const [ref, { w, h }] = useElementSize()
  const ratio = ASPECT[aspect] ?? 16 / 9

  const { boxW, boxH } =
    viewMode === 'camera' ? letterbox(w, h, ratio) : { boxW: w, boxH: h }

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden bg-black">
      {viewMode === 'compare' ? (
        <CompareStage />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative" style={{ width: `${boxW}px`, height: `${boxH}px` }}>
            {boxW > 0 && boxH > 0 && <StudioScene key={`stage-${viewMode}`} />}
            {viewMode === 'camera' && (
              <div className="pointer-events-none absolute inset-0 ring-1 ring-violet-300/30" />
            )}
            <DirectorLightBrief />
          </div>
        </div>
      )}
    </div>
  )
}
