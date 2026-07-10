// Bottom preset bar: save input, save button, empty hint, and per-preset chrome.
// Saved-preset NAMES are user-authored data and stay as entered.

import type { AppLanguage } from '../languages'

const zh = {
  'presetBar.namePlaceholder': '方案名称…',
  'presetBar.save': '保存方案',
  'presetBar.empty': '还没有保存的方案。调好灯后点「保存方案」。',
  'presetBar.noPreview': '无预览',
  'presetBar.load': '点击载入方案',
  'presetBar.duplicate': '复制方案',
  'presetBar.delete': '删除方案',
  'presetBar.saved': '方案已保存到此浏览器。',
  'presetBar.saveFailed': '保存失败：浏览器存储空间不足或不可用，方案未加入列表。',
  'presetBar.duplicated': '方案副本已保存。',
  'presetBar.duplicateFailed': '复制失败：浏览器存储空间不足或不可用。',
  'presetBar.deleted': '方案已删除。',
  'presetBar.deleteFailed': '删除失败：浏览器存储不可用，原方案仍保留。',
} as const

type Key = keyof typeof zh

const en: Record<Key, string> = {
  'presetBar.namePlaceholder': 'Preset name…',
  'presetBar.save': 'Save preset',
  'presetBar.empty': 'No saved presets yet. Set up your lighting, then click “Save preset”.',
  'presetBar.noPreview': 'No preview',
  'presetBar.load': 'Click to load preset',
  'presetBar.duplicate': 'Duplicate preset',
  'presetBar.delete': 'Delete preset',
  'presetBar.saved': 'Preset saved in this browser.',
  'presetBar.saveFailed': 'Save failed: browser storage is full or unavailable. The preset was not added.',
  'presetBar.duplicated': 'Preset copy saved.',
  'presetBar.duplicateFailed': 'Duplicate failed: browser storage is full or unavailable.',
  'presetBar.deleted': 'Preset deleted.',
  'presetBar.deleteFailed': 'Delete failed: browser storage is unavailable. The preset was kept.',
}

const ja: Record<Key, string> = {
  'presetBar.namePlaceholder': 'プリセット名…',
  'presetBar.save': 'プリセット保存',
  'presetBar.empty': '保存済みプリセットはありません。ライティングを決めて「プリセット保存」を押してください。',
  'presetBar.noPreview': 'プレビューなし',
  'presetBar.load': 'クリックで読み込み',
  'presetBar.duplicate': 'プリセットを複製',
  'presetBar.delete': 'プリセットを削除',
  'presetBar.saved': 'このブラウザにプリセットを保存しました。',
  'presetBar.saveFailed': '保存できませんでした。ブラウザの保存領域が不足または使用不可です。プリセットは追加されていません。',
  'presetBar.duplicated': 'プリセットのコピーを保存しました。',
  'presetBar.duplicateFailed': '複製できませんでした。ブラウザの保存領域が不足または使用不可です。',
  'presetBar.deleted': 'プリセットを削除しました。',
  'presetBar.deleteFailed': '削除できませんでした。ブラウザの保存領域が使用不可のため、元のプリセットを保持しました。',
}

export const presetBar: Record<AppLanguage, Record<Key, string>> = { 'zh-CN': zh, en, ja }
