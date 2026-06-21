import { useEffect, useRef, useState } from 'react'
import type { AspectRatio, ViewMode } from '../types'

export const ASPECT: Record<AspectRatio, number> = {
  '16:9': 16 / 9,
  '4:3': 4 / 3,
  '1:1': 1,
  '9:16': 9 / 16,
}

export const VIEW_HINTS: Record<ViewMode, string> = {
  camera: '镜头预览 · 导演构图（机位锁定）',
  free: '自由视角 · 拖拽旋转 / 滚轮缩放 / 拖灯改灯位',
  top: '俯视灯位图 · 人物·灯·摄影机关系',
  side: '侧视 · 高度与俯仰关系',
  compare: 'A/B 对比 · 左 A 当前编辑 / 右 B 冻结参考',
}

// Letterbox a pane to its scene's aspect ratio inside the available box.
export function letterbox(w: number, h: number, ratio: number) {
  if (!w || !h) return { boxW: w, boxH: h }
  return w / h > ratio ? { boxW: h * ratio, boxH: h } : { boxW: w, boxH: w / ratio }
}

export function useElementSize() {
  const ref = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return [ref, size] as const
}
