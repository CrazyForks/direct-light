# `src/panels`（历史建议目录，当前未使用）

> 决策（v0.4.3，2026-06-19）：本项目的传统 UI 面板层已统一落在 **`src/ui`**，不使用本目录。
> 保留此文件仅作历史说明，避免后续把面板一半放 `ui`、一半放 `panels`。
> 新增面板请放到 `src/ui`，不要在这里新建文件。

原始建议（已被 `src/ui` 取代）：

这里曾计划放对象列表、参数面板、方案栏、视图切换等组件，例如 `ObjectList.tsx` / `InspectorPanel.tsx` / `PresetBar.tsx`。
现已分别由 `src/ui/ObjectList.tsx`、`src/ui/ParamPanel.tsx`（分发）+ `LightPanel/PersonPanel/ObjectPanel/CameraPanel/StudioPanel`、`src/ui/PresetBar.tsx` 承担。

不要在这里写 Three.js mesh 或渲染计算。
