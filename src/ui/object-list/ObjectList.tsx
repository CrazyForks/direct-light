import { CameraSection } from './CameraSection'
import { LightsSection } from './LightsSection'
import { PeopleSection } from './PeopleSection'
import { SceneObjectsSection } from './SceneObjectsSection'
import { StudioSection } from './StudioSection'

export function ObjectList() {
  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-3">
      <PeopleSection />
      <LightsSection />
      <SceneObjectsSection />
      <CameraSection />
      <StudioSection />
    </div>
  )
}
