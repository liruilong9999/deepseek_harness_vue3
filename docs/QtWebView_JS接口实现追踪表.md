# QtWebView JS 接口实现追踪表

## 1. 文档说明

本文用于追踪 `QtWebView_JS接口清单.md` 中定义的 QtWebView(Qt 网页视图) 与 JavaScript(JS，浏览器脚本语言) 桥接接口实现进度。这里的接口不是 HTTP(超文本传输协议) 接口，而是前端页面与 Qt 后端之间通过 QWebChannel(Qt Web 通道) 或等价注入对象完成的本地调用接口。

状态说明：

| 状态 | 含义 |
|---|---|
| 未开始 | 尚未在代码中补齐调用或事件处理 |
| 已完成 | 前端已有明确封装或事件入口，类型与调用路径已建立 |
| 部分完成 | 仅完成基础入口，尚未完整接入界面状态 |
| 阻塞 | 需要后端能力或产品规则确认后才能继续 |

## 2. 总体进度

| 分类 | 总数 | 已完成 | 部分完成 | 未开始 | 阻塞 |
|---|---:|---:|---:|---:|---:|
| 初始化 | 3 | 3 | 0 | 0 | 0 |
| 项目 | 4 | 4 | 0 | 0 | 0 |
| 会话 | 17 | 9 | 8 | 0 | 0 |
| 消息 | 1 | 1 | 0 | 0 | 0 |
| 运行配置 | 2 | 1 | 1 | 0 | 0 |
| 审批 | 2 | 2 | 0 | 0 | 0 |
| 弹窗 | 1 | 1 | 0 | 0 | 0 |
| 计划 | 4 | 4 | 0 | 0 | 0 |
| 工具 | 2 | 2 | 0 | 0 | 0 |
| 文件 | 3 | 3 | 0 | 0 | 0 |
| 上下文 | 3 | 3 | 0 | 0 | 0 |
| Git | 3 | 3 | 0 | 0 | 0 |
| 搜索 | 1 | 1 | 0 | 0 | 0 |
| 面板 | 1 | 1 | 0 | 0 | 0 |
| 错误 | 1 | 0 | 1 | 0 | 0 |

## 3. 接口明细

| 分类 | action / event | 方向 | 必需 | 状态 | 对应代码 | 备注 |
|---|---|---|---|---|---|---|
| 初始化 | `app.getSnapshot` | 前端到后端 | 是 | 已完成 | `src/bridges/harnessBridge.ts`、`src/api/harnessBridgeActions.ts` | 已封装 `fetchAppSnapshot` |
| 初始化 | `app.refresh` | 前端到后端 | 是 | 已完成 | `src/bridges/harnessBridge.ts`、`src/api/harnessBridgeActions.ts` | 已封装 `refreshAppScopes` |
| 初始化 | `app.snapshot.updated` | 后端到前端 | 是 | 已完成 | `src/bridges/harnessBridge.ts`、`src/views/harness-dashboard/hooks/useHarnessDashboard.ts` | 已接入全量快照状态 |
| 项目 | `project.list` | 前端到后端 | 是 | 已完成 | `src/api/harnessBridgeActions.ts` | 已封装 `listProjects` |
| 项目 | `project.open` | 前端到后端 | 是 | 已完成 | `src/api/harnessBridgeActions.ts` | 已封装 `openProject` |
| 项目 | `project.toggleExpanded` | 前端到后端 | 是 | 已完成 | `src/api/harnessBridgeActions.ts` | 已封装 `toggleProjectExpanded` |
| 项目 | `project.list.updated` | 后端到前端 | 是 | 已完成 | `src/bridges/harnessBridge.ts`、`src/views/harness-dashboard/hooks/useHarnessDashboard.ts` | 已接入左侧项目列表状态 |
| 会话 | `conversation.open` | 前端到后端 | 是 | 已完成 | `src/api/harnessBridgeActions.ts` | 已封装 `openConversation` |
| 会话 | `conversation.create` | 前端到后端 | 是 | 已完成 | `src/api/harnessBridgeActions.ts` | 已封装 `createConversation` |
| 会话 | `conversation.getDetail` | 前端到后端 | 是 | 已完成 | `src/api/harnessBridgeActions.ts` | 已封装 `getConversationDetail` |
| 会话 | `conversation.rename` | 前端到后端 | 是 | 已完成 | `src/api/harnessBridgeActions.ts` | 已封装 `renameConversation` |
| 会话 | `conversation.refresh` | 前端到后端 | 是 | 已完成 | `src/api/harnessBridgeActions.ts` | 已封装 `refreshConversation` |
| 会话 | `conversation.getActions` | 前端到后端 | 是 | 已完成 | `src/api/harnessBridgeActions.ts` | 已封装 `getConversationActions` |
| 会话 | `conversation.runAction` | 前端到后端 | 是 | 已完成 | `src/api/harnessBridgeActions.ts` | 已封装 `runConversationAction` |
| 会话 | `conversation.sendMessage` | 前端到后端 | 是 | 已完成 | `src/api/harnessBridgeActions.ts` | 已封装 `sendConversationMessage` |
| 会话 | `conversation.stopGeneration` | 前端到后端 | 是 | 已完成 | `src/api/harnessBridgeActions.ts` | 已封装 `stopConversationGeneration` |
| 会话 | `conversation.active.changed` | 后端到前端 | 是 | 部分完成 | `src/bridges/harnessBridge.ts` | 已注册 JS 事件入口，待完整接入会话状态 |
| 会话 | `conversation.message.started` | 后端到前端 | 是 | 部分完成 | `src/bridges/harnessBridge.ts` | 已注册 JS 事件入口，待完整接入消息流状态 |
| 会话 | `conversation.message.delta` | 后端到前端 | 是 | 部分完成 | `src/bridges/harnessBridge.ts` | 已注册 JS 事件入口，待完整接入消息流状态 |
| 会话 | `conversation.message.finished` | 后端到前端 | 是 | 部分完成 | `src/bridges/harnessBridge.ts` | 已注册 JS 事件入口，待完整接入消息流状态 |
| 会话 | `conversation.message.failed` | 后端到前端 | 是 | 部分完成 | `src/bridges/harnessBridge.ts` | 已注册 JS 事件入口，待完整接入消息流状态 |
| 会话 | `conversation.message.cancelled` | 后端到前端 | 是 | 部分完成 | `src/bridges/harnessBridge.ts` | 已注册 JS 事件入口，待完整接入消息流状态 |
| 会话 | `conversation.task.updated` | 后端到前端 | 是 | 部分完成 | `src/bridges/harnessBridge.ts` | 已注册 JS 事件入口，待完整接入任务状态 |
| 会话 | `conversation.updated` | 后端到前端 | 是 | 部分完成 | `src/bridges/harnessBridge.ts` | 已注册 JS 事件入口，待完整接入会话详情 |
| 消息 | `message.copy` | 前端到后端 | 是 | 已完成 | `src/api/harnessBridgeActions.ts` | 已封装 `copyMessage` |
| 运行配置 | `settings.updateRuntime` | 前端到后端 | 是 | 已完成 | `src/api/harnessBridgeActions.ts` | 已封装 `updateRuntimeSettings` |
| 运行配置 | `settings.updated` | 后端到前端 | 是 | 部分完成 | `src/bridges/harnessBridge.ts` | 已注册 JS 事件入口，待完整接入底部选择器状态 |
| 审批 | `approval.prompt.show` | 后端到前端 | 是 | 已完成 | `src/bridges/harnessBridge.ts`、`src/views/harness-dashboard/hooks/useHarnessDashboard.ts`、`src/components/harness/ConversationPanel.vue` | 已接入审批弹窗状态 |
| 审批 | `approval.respond` | 前端到后端 | 是 | 已完成 | `src/api/harnessBridgeActions.ts` | 已封装 `respondApprovalPrompt` |
| 弹窗 | `prompt.hide` | 后端到前端 | 是 | 已完成 | `src/bridges/harnessBridge.ts`、`src/views/harness-dashboard/hooks/useHarnessDashboard.ts`、`src/components/harness/ConversationPanel.vue` | 已接入弹窗隐藏状态 |
| 计划 | `plan.prompt.show` | 后端到前端 | 是 | 已完成 | `src/bridges/harnessBridge.ts`、`src/views/harness-dashboard/hooks/useHarnessDashboard.ts`、`src/components/harness/ConversationPanel.vue` | 已接入计划弹窗状态 |
| 计划 | `plan.respond` | 前端到后端 | 是 | 已完成 | `src/api/harnessBridgeActions.ts` | 已封装 `respondPlanPrompt` |
| 计划 | `plan.getCurrent` | 前端到后端 | 是 | 已完成 | `src/api/harnessBridgeActions.ts` | 已封装 `getCurrentPlan` |
| 计划 | `execution.plan.updated` | 后端到前端 | 是 | 已完成 | `src/bridges/harnessBridge.ts`、`src/views/harness-dashboard/hooks/useHarnessDashboard.ts` | 已接入右侧计划状态 |
| 工具 | `tool.pick` | 前端到后端 | 是 | 已完成 | `src/api/harnessBridgeActions.ts` | 已封装 `pickTool` |
| 工具 | `tool.execution.updated` | 后端到前端 | 是 | 已完成 | `src/bridges/harnessBridge.ts`、`src/views/harness-dashboard/hooks/useHarnessDashboard.ts` | 已接入中间工具执行记录 |
| 文件 | `file.pickAttachment` | 前端到后端 | 是 | 已完成 | `src/api/harnessBridgeActions.ts` | 已封装 `pickAttachment` |
| 文件 | `generated.files.updated` | 后端到前端 | 是 | 已完成 | `src/bridges/harnessBridge.ts`、`src/views/harness-dashboard/hooks/useHarnessDashboard.ts` | 已接入中间生成文件列表 |
| 文件 | `file.openGenerated` | 前端到后端 | 是 | 已完成 | `src/api/harnessBridgeActions.ts` | 已封装 `openGeneratedFile` |
| 上下文 | `context.pick` | 前端到后端 | 是 | 已完成 | `src/api/harnessBridgeActions.ts` | 已封装 `pickContext` |
| 上下文 | `context.getUsage` | 前端到后端 | 是 | 已完成 | `src/api/harnessBridgeActions.ts` | 已封装 `getContextUsage` |
| 上下文 | `context.usage.updated` | 后端到前端 | 是 | 已完成 | `src/bridges/harnessBridge.ts`、`src/views/harness-dashboard/hooks/useHarnessDashboard.ts`、`src/components/harness/InspectorPanel.vue` | 已接入右侧上下文状态 |
| Git | `git.getStatus` | 前端到后端 | 是 | 已完成 | `src/api/harnessBridgeActions.ts` | 已封装 `getGitStatus` |
| Git | `git.openPanel` | 前端到后端 | 是 | 已完成 | `src/api/harnessBridgeActions.ts` | 已封装 `openGitPanel` |
| Git | `git.status.updated` | 后端到前端 | 是 | 已完成 | `src/bridges/harnessBridge.ts`、`src/views/harness-dashboard/hooks/useHarnessDashboard.ts`、`src/components/harness/InspectorPanel.vue` | 已接入右侧 Git 状态 |
| 搜索 | `search.query` | 前端到后端 | 是 | 已完成 | `src/api/harnessBridgeActions.ts` | 已封装 `querySearch` |
| 面板 | `panel.open` | 前端到后端 | 是 | 已完成 | `src/api/harnessBridgeActions.ts` | 已封装 `openPanel` |
| 错误 | `error.raised` | 后端到前端 | 是 | 部分完成 | `src/bridges/harnessBridge.ts` | 已注册 JS 事件入口，待接入统一错误提示 |

## 4. 更新记录

| 时间 | 变更 |
|---|---|
| 2026-05-19 | 创建追踪表，按接口清单初始化全部必需接口状态。 |
| 2026-05-19 | 新增 `src/bridges/harnessBridge.ts` 与 `src/api/harnessBridgeActions.ts`；前端到后端 action 已完成统一封装，后端到前端 event 已建立基础 JS 入口。 |
| 2026-05-19 | 接入 `app.snapshot.updated`、`project.list.updated`、`execution.plan.updated`、`tool.execution.updated`、`generated.files.updated`、`git.status.updated`、`context.usage.updated` 到页面状态。 |
| 2026-05-19 | 中间对话区已接入 `conversation.refresh`、`conversation.getActions`、`conversation.sendMessage`、`message.copy`、`settings.updateRuntime`、`file.pickAttachment`、`file.openGenerated`、`context.pick`、`tool.pick` 的界面触发。 |
| 2026-05-19 | 左侧栏已接入 `conversation.create`、`search.query`、`panel.open`、`project.open`、`conversation.open`、`project.toggleExpanded` 的界面触发。 |
| 2026-05-19 | 接入 `approval.prompt.show`、`plan.prompt.show`、`prompt.hide` 到中间弹窗状态，并接通 `approval.respond`、`plan.respond` 的界面回复。 |
