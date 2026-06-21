// v0.3 white-studio structure/object specs.
// These are Codex-authored product defaults for director-facing set planning.
// Claude can map these presets into store actions, ObjectList rows, panels, and
// simple Three.js geometry without inventing dimensions or material behavior.

import type {
  SceneObjectGeometry,
  SceneObjectKind,
  SceneObjectMaterial,
  SceneObjectSize,
  Vector3,
} from '../types'

export type SceneObjectMaterialSpec = {
  label: string
  color: string
  roughness: number
  metalness: number
  opacity: number
  shadowNote: string
}

export type SceneObjectPreset = {
  id: string
  label: string
  kind: SceneObjectKind
  geometry: SceneObjectGeometry
  size: SceneObjectSize
  defaultPosition: Vector3
  defaultRotationY: number
  material: SceneObjectMaterial
  color: string
  castShadow: boolean
  receiveShadow: boolean
  showLabel: boolean
  useCase: string
  // v0.6c: which add-object group the preset belongs to. Omitted = 'prop'
  // (道具 / 结构); 'gear' = 控光器材 (flags / reflector boards / diffusion frames).
  group?: 'prop' | 'gear'
}

// v0.6c control gear kinds. Used to group the add-object dropdown and, since
// v0.6d, to enumerate gear for optical approximation. Gear is intentionally NOT
// a support surface — getObjectSupportRole's `default: null` already excludes it.
export const CONTROL_GEAR_KINDS = ['blackFlag', 'reflectorBoard', 'diffusionFrame'] as const

export function isControlGearKind(kind: SceneObjectKind): boolean {
  return (CONTROL_GEAR_KINDS as readonly string[]).includes(kind)
}

export type CommunicationSceneObject = {
  presetId: string
  name: string
  position: Vector3
  rotationY: number
}

export const SCENE_OBJECT_MATERIALS: Record<SceneObjectMaterial, SceneObjectMaterialSpec> = {
  matteWhite: {
    label: '白色亚光',
    color: '#f1f0ea',
    roughness: 0.88,
    metalness: 0,
    opacity: 1,
    shadowNote: '最适合判断白棚里的受光、溢光和柔阴影。',
  },
  matteBlack: {
    label: '黑色亚光',
    color: '#18191d',
    roughness: 0.92,
    metalness: 0,
    opacity: 1,
    shadowNote: '吃光明显，适合模拟黑椅、黑旗或暗色道具遮挡。',
  },
  matteGray: {
    label: '灰色亚光',
    color: '#8c8f8a',
    roughness: 0.86,
    metalness: 0,
    opacity: 1,
    shadowNote: '中性参考材质，不抢灯光色彩判断。',
  },
  wood: {
    label: '木质',
    color: '#a77a4f',
    roughness: 0.68,
    metalness: 0,
    opacity: 1,
    shadowNote: '比白色更吃光，桌面受光方向更容易读。',
  },
  metal: {
    label: '金属',
    color: '#b8b7ae',
    roughness: 0.34,
    metalness: 0.72,
    opacity: 1,
    shadowNote: '先做低反射金属，避免第一版出现过强镜面干扰。',
  },
  glass: {
    label: '玻璃占位',
    color: '#d8f0ff',
    roughness: 0.08,
    metalness: 0,
    opacity: 0.34,
    shadowNote: '第一版只做透明占位，不做复杂折射焦散。',
  },
  fabric: {
    label: '布面',
    color: '#5f6670',
    roughness: 0.94,
    metalness: 0,
    opacity: 1,
    shadowNote: '适合沙发、布面人台或吸光背景。',
  },
  scrimWhite: {
    label: '柔光白（半透明）',
    color: '#f3f2ec',
    roughness: 0.9,
    metalness: 0,
    opacity: 0.5,
    shadowNote: '柔光布框扩散面，半透明柔光白，区别于偏蓝玻璃占位。',
  },
}

export const SCENE_OBJECT_PRESETS = [
  {
    id: 'table-long',
    label: '长桌',
    kind: 'table',
    geometry: 'box',
    size: { width: 1.8, depth: 0.75, height: 0.74 },
    defaultPosition: { x: 0, y: 0, z: 0.9 },
    defaultRotationY: 0,
    material: 'wood',
    color: '#a77a4f',
    castShadow: true,
    receiveShadow: true,
    showLabel: true,
    useCase: '访谈、产品桌面、人物与桌沿遮挡关系。',
  },
  {
    id: 'table-round',
    label: '圆桌',
    kind: 'table',
    geometry: 'cylinder',
    size: { width: 0.95, depth: 0.95, height: 0.72 },
    defaultPosition: { x: 0.95, y: 0, z: 0.85 },
    defaultRotationY: 0,
    material: 'matteWhite',
    color: '#f1f0ea',
    castShadow: true,
    receiveShadow: true,
    showLabel: true,
    useCase: '圆形桌面受光、产品小景或人物围坐。',
  },
  {
    id: 'table-square',
    label: '方桌',
    kind: 'table',
    geometry: 'box',
    size: { width: 0.85, depth: 0.85, height: 0.74 },
    defaultPosition: { x: -0.95, y: 0, z: 0.85 },
    defaultRotationY: 0,
    material: 'matteGray',
    color: '#8c8f8a',
    castShadow: true,
    receiveShadow: true,
    showLabel: true,
    useCase: '小桌、单人谈话、道具与人物距离关系。',
  },
  {
    id: 'chair-basic',
    label: '椅子',
    kind: 'chair',
    geometry: 'chair',
    size: { width: 0.48, depth: 0.52, height: 0.86 },
    defaultPosition: { x: -0.8, y: 0, z: 1.35 },
    defaultRotationY: 0,
    material: 'matteBlack',
    color: '#18191d',
    castShadow: true,
    receiveShadow: true,
    showLabel: true,
    useCase: '椅背遮挡、坐姿预演、访谈机位沟通。',
  },
  {
    id: 'stool-basic',
    label: '凳子',
    kind: 'stool',
    geometry: 'cylinder',
    size: { width: 0.38, depth: 0.38, height: 0.45 },
    defaultPosition: { x: 0.8, y: 0, z: 1.35 },
    defaultRotationY: 0,
    material: 'matteGray',
    color: '#8c8f8a',
    castShadow: true,
    receiveShadow: true,
    showLabel: true,
    useCase: '矮坐具、产品台替代、简单高度参考。',
  },
  {
    id: 'sofa-block',
    label: '沙发简化块',
    kind: 'sofa',
    geometry: 'sofa',
    size: { width: 1.7, depth: 0.72, height: 0.78 },
    defaultPosition: { x: 0, y: 0, z: 1.55 },
    defaultRotationY: 0,
    material: 'fabric',
    color: '#5f6670',
    castShadow: true,
    receiveShadow: true,
    showLabel: true,
    useCase: '双人访谈、坐姿区域、较大暗色块吃光测试。',
  },
  {
    id: 'plinth-box',
    label: '方形台座',
    kind: 'plinth',
    geometry: 'box',
    size: { width: 0.7, depth: 0.7, height: 0.8 },
    defaultPosition: { x: 1.25, y: 0, z: 0.15 },
    defaultRotationY: 0,
    material: 'matteWhite',
    color: '#f1f0ea',
    castShadow: true,
    receiveShadow: true,
    showLabel: true,
    useCase: '产品台、雕塑台、白物体受光判断。',
  },
  {
    id: 'plinth-cylinder',
    label: '圆柱台座',
    kind: 'cylinderPlinth',
    geometry: 'cylinder',
    size: { width: 0.58, depth: 0.58, height: 0.85 },
    defaultPosition: { x: -1.25, y: 0, z: 0.15 },
    defaultRotationY: 0,
    material: 'matteWhite',
    color: '#f1f0ea',
    castShadow: true,
    receiveShadow: true,
    showLabel: true,
    useCase: '圆台产品、曲面受光、台座投影判断。',
  },
  {
    id: 'platform-low',
    label: '低矮平台',
    kind: 'platform',
    geometry: 'box',
    size: { width: 2.0, depth: 1.2, height: 0.18 },
    defaultPosition: { x: 0, y: 0, z: 0.45 },
    defaultRotationY: 0,
    material: 'matteGray',
    color: '#8c8f8a',
    castShadow: true,
    receiveShadow: true,
    showLabel: true,
    useCase: '人物站台、产品地台、低位阴影关系。',
  },
  {
    id: 'stage-round-live',
    label: '直播圆形小舞台',
    kind: 'platform',
    geometry: 'cylinder',
    size: { width: 1.2, depth: 1.2, height: 0.3 },
    defaultPosition: { x: 1.25, y: 0, z: 0.35 },
    defaultRotationY: 0,
    material: 'matteWhite',
    color: '#eeeeea',
    castShadow: true,
    receiveShadow: true,
    showLabel: true,
    useCase: '直播、产品展示或人物站高半级时的圆形承载台。',
  },
  {
    id: 'mannequin-half',
    label: '半身人台',
    kind: 'mannequin',
    geometry: 'mannequinHalf',
    size: { width: 0.42, depth: 0.26, height: 1.25 },
    defaultPosition: { x: 1.15, y: 0, z: -0.2 },
    defaultRotationY: -0.25,
    material: 'fabric',
    color: '#d7d1c3',
    castShadow: true,
    receiveShadow: true,
    showLabel: true,
    useCase: '服装上半身、胸口受光、轮廓光沟通。',
  },
  {
    id: 'mannequin-full',
    label: '全身人台',
    kind: 'mannequin',
    geometry: 'mannequinFull',
    size: { width: 0.48, depth: 0.32, height: 1.75 },
    defaultPosition: { x: 1.35, y: 0, z: -0.55 },
    defaultRotationY: -0.25,
    material: 'matteWhite',
    color: '#e6e1d5',
    castShadow: true,
    receiveShadow: true,
    showLabel: true,
    useCase: '服装全身展示、人台与真人站位比较。',
  },
  {
    id: 'backdrop-panel',
    label: '背景板',
    kind: 'backdropPanel',
    geometry: 'panel',
    size: { width: 3.2, depth: 0.12, height: 2.4 },
    defaultPosition: { x: 0, y: 0, z: -2.25 },
    defaultRotationY: 0,
    material: 'matteWhite',
    color: '#f1f0ea',
    castShadow: true,
    receiveShadow: true,
    showLabel: true,
    useCase: '局部背景、影子落板、前后层次沟通。',
  },
  {
    id: 'box-basic',
    label: '纸箱 / 箱体',
    kind: 'box',
    geometry: 'box',
    size: { width: 0.6, depth: 0.45, height: 0.45 },
    defaultPosition: { x: -1.15, y: 0, z: 0.65 },
    defaultRotationY: 0.15,
    material: 'wood',
    color: '#b18b62',
    castShadow: true,
    receiveShadow: true,
    showLabel: true,
    useCase: '箱体遮挡、临时道具、产品包装占位。',
  },
  // ── v0.6c 控光器材；v0.6d 起光学由 controlGearOptics 派生 ──
  // castShadow:false / receiveShadow:false 是有意的：gear 不靠 mesh shadow 做光学。
  {
    id: 'black-flag',
    label: '黑旗',
    kind: 'blackFlag',
    geometry: 'gearPanel',
    size: { width: 1.0, depth: 0.05, height: 1.9 },
    defaultPosition: { x: -1.6, y: 0, z: 0.4 },
    defaultRotationY: 0.5,
    material: 'matteBlack',
    color: '#141519',
    castShadow: false,
    receiveShadow: false,
    showLabel: true,
    useCase: '黑色遮光 / 负补光板，切光、压暗局部一侧（v0.6d 起有近似光学）。',
    group: 'gear',
  },
  {
    id: 'reflector-board',
    label: '反光板',
    kind: 'reflectorBoard',
    geometry: 'gearPanel',
    size: { width: 1.0, depth: 0.05, height: 1.8 },
    defaultPosition: { x: 1.7, y: 0, z: 0.2 },
    defaultRotationY: -0.6,
    material: 'matteWhite',
    color: '#f1f0ea',
    castShadow: false,
    receiveShadow: false,
    showLabel: true,
    useCase: '白色反光板（白旗板），给人物暗部补反光（v0.6d 起有虚拟弱补光）。',
    group: 'gear',
  },
  {
    id: 'diffusion-frame',
    label: '柔光布框',
    kind: 'diffusionFrame',
    geometry: 'gearPanel',
    size: { width: 1.2, depth: 0.06, height: 1.9 },
    defaultPosition: { x: -1.7, y: 0, z: -0.6 },
    defaultRotationY: 0.5,
    material: 'scrimWhite',
    color: '#f3f2ec',
    castShadow: false,
    receiveShadow: false,
    showLabel: true,
    useCase: '半透明柔光布框，放在灯与人之间软化光（v0.6d 起有近似软化）。',
    group: 'gear',
  },
] satisfies readonly SceneObjectPreset[]

export const V03_COMMUNICATION_SCENE = [
  {
    presetId: 'table-long',
    name: '访谈长桌',
    position: { x: 0, y: 0, z: 0.95 },
    rotationY: 0,
  },
  {
    presetId: 'chair-basic',
    name: '左侧椅子',
    position: { x: -0.82, y: 0, z: 1.38 },
    rotationY: 0.1,
  },
  {
    presetId: 'mannequin-half',
    name: '服装人台',
    position: { x: 1.2, y: 0, z: -0.15 },
    rotationY: -0.25,
  },
  {
    presetId: 'backdrop-panel',
    name: '可移动背景板',
    position: { x: 0, y: 0, z: -2.25 },
    rotationY: 0,
  },
] satisfies readonly CommunicationSceneObject[]

export const V03_OBJECT_VISUAL_RULES = {
  topViewFootprintOpacity: 0.22,
  selectedOutlineColor: '#d8b4fe',
  labelBackground: 'rgba(15,16,22,0.82)',
  minimumSelectableRadius: 0.42,
  defaultDragBounds: { minX: -3.8, maxX: 3.8, minZ: -4.6, maxZ: 4.6 },
} as const
