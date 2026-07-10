import type { AppLanguage } from '../languages'

const zh = {
  'onboarding.help': '新手导览',
  'onboarding.progress': '第 {current} / {total} 步',
  'onboarding.skip': '跳过导览',
  'onboarding.back': '上一步',
  'onboarding.start': '开始导览',
  'onboarding.next': '下一步',
  'onboarding.done': '完成',
  'onboarding.welcome.title': '两分钟认识 Direct Light',
  'onboarding.welcome.body': '左侧选人物、灯、道具或摄影机，中间看画面，右侧调参数。所有改动都会立刻反映在白棚里。',
  'onboarding.lights.title': '先动一盏灯',
  'onboarding.lights.body': '从左侧选灯，再到右侧试着改变亮度、高度或颜色。灯越低，地面影子通常越长。',
  'onboarding.views.title': '让每个视角各司其职',
  'onboarding.views.body': '自由 / 俯视用于摆位，侧视检查高度，镜头用于确认最终构图。',
  'onboarding.presets.title': '留住一个版本',
  'onboarding.presets.body': '在底部给方案命名并保存；再打开顶部“对比”，把当前画面冻结为 B，继续修改 A。',
  'onboarding.export.title': '把结果带出去',
  'onboarding.export.body': '“导出图片”会保存当前预览，适合和导演、摄影、灯光团队沟通。之后随时点 ? 重看导览。',
  'onboarding.narrow.title': '请扩大窗口进入灯光预演',
  'onboarding.narrow.body': 'Direct Light 目前是桌面优先工具。当前宽度不足以同时显示对象列表、画面和参数面板。',
  'onboarding.narrow.hint': '请横屏使用，或把窗口扩大到至少 960px。你的场景数据不会受影响。',
} as const

type Key = keyof typeof zh

const en: Record<Key, string> = {
  'onboarding.help': 'Quick tour',
  'onboarding.progress': 'Step {current} of {total}',
  'onboarding.skip': 'Skip tour',
  'onboarding.back': 'Back',
  'onboarding.start': 'Start tour',
  'onboarding.next': 'Next',
  'onboarding.done': 'Done',
  'onboarding.welcome.title': 'Get oriented in Direct Light',
  'onboarding.welcome.body': 'Choose a person, light, prop, or camera on the left; watch the frame in the center; adjust it on the right. Changes appear immediately.',
  'onboarding.lights.title': 'Start with one light',
  'onboarding.lights.body': 'Select a light on the left, then try changing its intensity, height, or color on the right. A lower light usually makes a longer ground shadow.',
  'onboarding.views.title': 'Give each view a job',
  'onboarding.views.body': 'Use Free or Top to block the setup, Side to check height, and Camera to judge the final frame.',
  'onboarding.presets.title': 'Keep a version',
  'onboarding.presets.body': 'Name and save the setup at the bottom. Then open Compare, freeze the current frame as B, and keep editing A.',
  'onboarding.export.title': 'Take the result with you',
  'onboarding.export.body': 'Export image saves the current preview for conversations with the director, DP, and lighting team. Reopen this tour from ? anytime.',
  'onboarding.narrow.title': 'Widen the window to enter the lighting preview',
  'onboarding.narrow.body': 'Direct Light is currently desktop-first. This window is too narrow to show the object list, frame, and parameter panel together.',
  'onboarding.narrow.hint': 'Use landscape orientation or widen the window to at least 960px. Your scene data is safe.',
}

const ja: Record<Key, string> = {
  'onboarding.help': 'クイックガイド',
  'onboarding.progress': '{current} / {total} ステップ',
  'onboarding.skip': 'ガイドをスキップ',
  'onboarding.back': '戻る',
  'onboarding.start': 'ガイドを開始',
  'onboarding.next': '次へ',
  'onboarding.done': '完了',
  'onboarding.welcome.title': 'Direct Light の使い方',
  'onboarding.welcome.body': '左で人物・ライト・小道具・カメラを選び、中央で画を確認し、右で調整します。変更はすぐに反映されます。',
  'onboarding.lights.title': 'まずライトを1灯動かす',
  'onboarding.lights.body': '左でライトを選び、右で明るさ・高さ・色を変えてみてください。ライトを低くすると床の影は一般に長くなります。',
  'onboarding.views.title': 'ビューを使い分ける',
  'onboarding.views.body': 'フリー / トップで配置し、サイドで高さを確認し、カメラで最終構図を判断します。',
  'onboarding.presets.title': 'バージョンを残す',
  'onboarding.presets.body': '下部で名前を付けて保存し、「比較」で現在の画を B に固定して A の編集を続けます。',
  'onboarding.export.title': '結果を持ち出す',
  'onboarding.export.body': '「画像を書き出し」で現在のプレビューを保存し、監督・撮影・照明チームとの共有に使えます。? からいつでも再開できます。',
  'onboarding.narrow.title': 'ウィンドウを広げてプレビューを開く',
  'onboarding.narrow.body': 'Direct Light は現在デスクトップ優先です。この幅ではオブジェクト一覧、画面、設定パネルを同時に表示できません。',
  'onboarding.narrow.hint': '横向きにするか、ウィンドウ幅を 960px 以上にしてください。シーンデータは失われません。',
}

export const onboarding: Record<AppLanguage, Record<Key, string>> = { 'zh-CN': zh, en, ja }
