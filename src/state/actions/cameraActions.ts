import type { Store, StoreSet } from '../storeTypes'
import { clampCameraInsideStudio } from '../../domain/cameraMath'
import { CAMERA_PRESETS } from '../../data/cameraPresets'
import { getPeopleCenterAimTarget, getPersonAimTarget } from '../../domain/lightTargets'

export function createCameraActions(
  set: StoreSet,
): Pick<
  Store,
  | 'updateCamera'
  | 'setCameraPositionXZ'
  | 'setCameraTargetMode'
  | 'aimCameraAtPerson'
  | 'applyCameraPreset'
  | 'requestFreeCameraCapture'
  | 'setCameraFromFree'
> {
  return {
    updateCamera: (patch) =>
      set((s) => {
        const camera = { ...s.scene.camera, ...patch }
        // keep the camera inside the studio so polar/height edits stop at the walls
        if (patch.position) camera.position = clampCameraInsideStudio(patch.position, s.scene.studio)
        return { scene: { ...s.scene, camera } }
      }),

    setCameraPositionXZ: (x, z) =>
      set((s) => {
        const position = clampCameraInsideStudio({ ...s.scene.camera.position, x, z }, s.scene.studio)
        return { scene: { ...s.scene, camera: { ...s.scene.camera, position } } }
      }),

    setCameraTargetMode: (mode, personId) =>
      set((s) => {
        const people = s.scene.people
        const cam = s.scene.camera
        const targetPerson =
          people.find((p) => p.id === personId) ??
          people.find((p) => p.id === cam.targetPersonId) ??
          people[0]
        // snapshot the resolved target now so the panel polar controls + gizmo stay
        // coherent; live follow as people move is computed at render (CameraRig).
        const target =
          mode === 'person' && targetPerson
            ? getPersonAimTarget(targetPerson)
            : mode === 'peopleCenter'
              ? getPeopleCenterAimTarget(people) ?? cam.target
              : cam.target
        return {
          scene: {
            ...s.scene,
            camera: {
              ...cam,
              target,
              targetMode: mode,
              targetPersonId: mode === 'person' ? targetPerson?.id : cam.targetPersonId,
            },
          },
        }
      }),

    aimCameraAtPerson: (personId) =>
      set((s) => {
        const person = s.scene.people.find((p) => p.id === personId) ?? s.scene.people[0]
        if (!person) return s
        return {
          scene: {
            ...s.scene,
            camera: {
              ...s.scene.camera,
              target: getPersonAimTarget(person),
              targetMode: 'manual',
              targetPersonId: person.id,
            },
          },
        }
      }),

    applyCameraPreset: (presetId) =>
      set((s) => {
        const preset = CAMERA_PRESETS.find((p) => p.id === presetId)
        if (!preset) return s
        return {
          scene: {
            ...s.scene,
            camera: {
              ...s.scene.camera,
              position: clampCameraInsideStudio(preset.position, s.scene.studio),
              target: { ...preset.target },
              focalLength: preset.focalLength,
              aspectRatio: preset.aspectRatio,
              targetMode: 'manual',
            },
          },
        }
      }),

    requestFreeCameraCapture: () =>
      set((s) => ({ freeCameraCaptureRequestId: s.freeCameraCaptureRequestId + 1 })),

    setCameraFromFree: (position, target) =>
      set((s) => ({
        viewMode: 'camera',
        dragTarget: null,
        scene: {
          ...s.scene,
          camera: {
            ...s.scene.camera,
            position: clampCameraInsideStudio(position, s.scene.studio),
            target: { x: target.x, y: target.y, z: target.z },
            targetMode: 'manual',
          },
        },
      })),
  }
}
