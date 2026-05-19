# DeepSeek Harness GUI QtWebView 与 JS 接口清单

## 1. 文档目标

本文档根据界面元素整理 QtWebView(Qt 网页视图) 与 JavaScript(JS，浏览器脚本语言) 之间的桥接接口契约。本文不定义 HTTP(超文本传输协议)接口，所有交互均通过 QtWebView / QtWebEngine 内嵌页面与 Qt 后端之间的本地桥接完成。

推荐桥接方式为 QWebChannel(Qt Web 通道)：前端通过 `window.harnessBridge` 调用 Qt 后端槽函数，Qt 后端通过 `runJavaScript` 或 QWebChannel 回调调用前端注册在 `window.HarnessUI` 上的方法。

## 2. 总体通信约定

### 2.1 前端调用后端

前端统一调用：

```ts
window.harnessBridge.invoke(action: string, payloadJson: string): Promise<string>
```

参数说明：

| 字段 | 类型 | 说明 |
|---|---|---|
| `action` | `string` | 动作名称，例如 `conversation.sendMessage` |
| `payloadJson` | `string` | JSON 字符串，承载请求参数 |

返回值统一为 JSON 字符串：

```json
{
  "requestId": "uuid",
  "success": true,
  "code": "OK",
  "message": "处理成功",
  "data": {}
}
```

### 2.2 后端推送前端

Qt 后端通过 JS 调用前端：

```ts
window.HarnessUI.dispatch(eventName: string, payload: object): void
```

通用推送事件：

| 事件名 | 说明 |
|---|---|
| `app.snapshot.updated` | 全量刷新界面数据 |
| `project.list.updated` | 更新左侧项目与会话列表 |
| `conversation.updated` | 更新当前对话记录 |
| `conversation.message.delta` | 流式追加助手消息 |
| `execution.plan.updated` | 更新右侧执行计划 |
| `tool.execution.updated` | 更新中间工具执行卡片 |
| `generated.files.updated` | 更新生成文件列表 |
| `approval.prompt.show` | 显示审批权限弹窗 |
| `plan.prompt.show` | 显示计划选择弹窗 |
| `prompt.hide` | 隐藏审批或计划弹窗 |
| `git.status.updated` | 更新右侧 Git 状态 |
| `context.usage.updated` | 更新右侧上下文状态 |
| `settings.updated` | 更新模型、审批模式、思考强度等配置 |
| `error.raised` | 显示错误状态或提示 |

### 2.3 界面元素与桥接接口对照

下表按界面可见元素整理，作为 QtWebView 到 JavaScript(JS，浏览器脚本语言) 的桥接能力契约。

| 界面区域 | 界面元素 | 前端发送给后端 | 后端推送或返回给前端 |
|---|---|---|---|
| 左侧栏 | 主导航按钮、新对话、搜索、插件、自动化 | `conversation.create`、`search.query`、`panel.open` | `project.list.updated`、`app.snapshot.updated` |
| 左侧栏 | 项目列表、项目展开/收起、会话列表 | `project.list`、`project.open`、`project.toggleExpanded`、`conversation.open` | `project.list.updated`、`conversation.updated` |
| 左侧栏 | 底部设置、快捷键、帮助/关于 | `panel.open` | `settings.updated`、`error.raised` |
| 中间顶部 | 对话标题、编辑标题、同步、更多菜单 | `conversation.rename`、`conversation.refresh`、`conversation.getActions`、`conversation.runAction` | `conversation.updated`、`error.raised` |
| 中间记录 | 用户消息、助手消息、工作耗时、复制按钮 | `message.copy` | `conversation.updated`、`conversation.message.delta` |
| 中间记录 | 工具执行卡片、生成文件列表 | `file.openGenerated` | `tool.execution.updated`、`generated.files.updated` |
| 中间弹窗 | 审批权限弹窗 | `approval.respond` | `approval.prompt.show`、`prompt.hide` |
| 中间弹窗 | 计划选择弹窗、自定义计划输入、发送按钮 | `plan.respond` | `plan.prompt.show`、`prompt.hide` |
| 输入区 | 附加文件、提及上下文、插入工具 | `file.pickAttachment`、`context.pick`、`tool.pick` | 通过对应调用返回附件、上下文和工具候选数据 |
| 输入区 | 审批模式、模型、思考强度下拉框 | `settings.updateRuntime` | `settings.updated` |
| 输入区 | 文本输入框、发送按钮、停止生成 | `conversation.sendMessage`、`conversation.stopGeneration` | `conversation.message.delta`、`conversation.updated`、`error.raised` |
| 右侧栏 | 执行计划列表、未完成/执行中/已完成状态图标 | `plan.getCurrent` | `execution.plan.updated` |
| 右侧栏 | Git 状态、查看 Git 面板 | `git.getStatus`、`git.openPanel` | `git.status.updated` |
| 右侧栏 | 总上下文、Token 指标、缓存命中率、占用进度条 | `context.getUsage` | `context.usage.updated` |

## 3. 页面全量数据接口

### 3.1 获取初始页面快照

前端启动后调用：

```ts
window.harnessBridge.invoke('app.getSnapshot', '{}')
```

返回数据：

```ts
interface AppSnapshot {
  navigation: NavigationItem[]
  projects: ProjectItem[]
  footerActions: FooterAction[]
  activeProjectId: string
  activeConversationId: string
  conversation: ConversationDetail
  executionPlan: PlanStep[]
  gitStatus: GitStatus
  contextUsage: ContextUsage
  settings: RuntimeSettings
}
```

用途：初始化左侧导航、项目列表、中间对话、右侧计划、Git 状态、上下文状态和底部输入配置。

### 3.2 前端请求局部刷新

```ts
window.harnessBridge.invoke('app.refresh', JSON.stringify({
  scopes: ['projects', 'conversation', 'plan', 'git', 'context']
}))
```

## 4. 左侧栏接口

左侧栏包含：新对话、搜索、插件、自动化、项目列表、会话列表、底部设置/快捷键/帮助/关于。

### 4.1 获取项目与会话列表

```ts
window.harnessBridge.invoke('project.list', JSON.stringify({
  keyword: '',
  includeSessions: true
}))
```

返回：

```ts
interface ProjectItem {
  id: string
  name: string
  path: string
  lastActiveText: string
  active: boolean
  expanded: boolean
  sessions: SessionItem[]
}

interface SessionItem {
  id: string
  title: string
  lastActiveText: string
  active: boolean
}
```

### 4.2 切换项目展开状态

```ts
window.harnessBridge.invoke('project.toggleExpanded', JSON.stringify({
  projectId: 'project-id',
  expanded: true
}))
```

### 4.3 打开项目或会话

```ts
window.harnessBridge.invoke('project.open', JSON.stringify({
  projectId: 'project-id'
}))
```

```ts
window.harnessBridge.invoke('conversation.open', JSON.stringify({
  conversationId: 'conversation-id'
}))
```

### 4.4 创建新对话

```ts
window.harnessBridge.invoke('conversation.create', JSON.stringify({
  projectId: 'project-id',
  title: '新对话'
}))
```

### 4.5 搜索

```ts
window.harnessBridge.invoke('search.query', JSON.stringify({
  keyword: '插件',
  scopes: ['project', 'conversation', 'message', 'file']
}))
```

### 4.6 打开功能面板

```ts
window.harnessBridge.invoke('panel.open', JSON.stringify({
  panel: 'plugins'
}))
```

可选值：`plugins`、`automation`、`settings`、`shortcuts`、`help`、`about`。

## 5. 中间对话区接口

中间区域包含：对话标题、用户消息、助手消息、复制按钮、功能点列表、工具执行卡片、生成文件列表、审批/计划弹窗、输入框、附件/上下文/工具按钮、审批模式、模型、思考强度、发送按钮。

### 5.1 获取当前对话详情

```ts
window.harnessBridge.invoke('conversation.getDetail', JSON.stringify({
  conversationId: 'conversation-id'
}))
```

返回：

```ts
interface ConversationDetail {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messages: ChatMessage[]
  toolExecutions: ToolExecution[]
  generatedFiles: GeneratedFile[]
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  authorName: string
  content: string
  createdAtText: string
  workDurationText?: string
  status?: 'streaming' | 'done' | 'error'
  copyable: boolean
}
```

### 5.2 修改对话标题

```ts
window.harnessBridge.invoke('conversation.rename', JSON.stringify({
  conversationId: 'conversation-id',
  title: '设计 DeepSeek Harness GUI 方案'
}))
```

### 5.3 发送用户消息

```ts
window.harnessBridge.invoke('conversation.sendMessage', JSON.stringify({
  conversationId: 'conversation-id',
  content: '帮我设计一个基于 Qt5 的 DeepSeek Harness GUI',
  attachments: [],
  contextRefs: [],
  toolRefs: [],
  settings: {
    approvalMode: 'approval_recommended',
    model: 'deepseek-v4-flash',
    thinkingStrength: 'high'
  }
}))
```

字段说明：

| 字段 | 类型 | 说明 |
|---|---|---|
| `content` | `string` | 输入框正文 |
| `attachments` | `AttachmentRef[]` | 附件文件引用 |
| `contextRefs` | `ContextRef[]` | 被 @ 提及的上下文 |
| `toolRefs` | `ToolRef[]` | 插入的工具引用 |
| `settings.approvalMode` | `string` | 审批模式 |
| `settings.model` | `string` | 模型名称 |
| `settings.thinkingStrength` | `string` | 思考强度 |

### 5.4 停止生成

```ts
window.harnessBridge.invoke('conversation.stopGeneration', JSON.stringify({
  conversationId: 'conversation-id',
  messageId: 'assistant-message-id'
}))
```

### 5.5 复制消息

复制按钮可优先前端本地复制；如需要后端记录行为：

```ts
window.harnessBridge.invoke('message.copy', JSON.stringify({
  conversationId: 'conversation-id',
  messageId: 'message-id'
}))
```

### 5.6 附件按钮

```ts
window.harnessBridge.invoke('file.pickAttachment', JSON.stringify({
  conversationId: 'conversation-id',
  accept: ['*']
}))
```

返回：

```ts
interface AttachmentRef {
  id: string
  name: string
  path: string
  size: number
  mimeType: string
}
```

### 5.7 提及上下文按钮

```ts
window.harnessBridge.invoke('context.pick', JSON.stringify({
  conversationId: 'conversation-id',
  keyword: ''
}))
```

返回可选上下文：

```ts
interface ContextRef {
  id: string
  type: 'file' | 'folder' | 'symbol' | 'conversation' | 'selection'
  title: string
  path?: string
  summary?: string
}
```

### 5.8 插入工具按钮

```ts
window.harnessBridge.invoke('tool.pick', JSON.stringify({
  conversationId: 'conversation-id',
  keyword: ''
}))
```

返回：

```ts
interface ToolRef {
  id: string
  name: string
  description: string
  riskLevel: 'low' | 'medium' | 'high'
}
```

### 5.9 更新运行设置

审批模式、模型、思考强度变化时调用：

```ts
window.harnessBridge.invoke('settings.updateRuntime', JSON.stringify({
  conversationId: 'conversation-id',
  approvalMode: 'approval_recommended',
  model: 'deepseek-v4-flash',
  thinkingStrength: 'high'
}))
```

运行设置结构：

```ts
interface RuntimeSettings {
  approvalMode: 'approval_recommended' | 'full_access'
  model: 'deepseek-v4-flash' | 'deepseek-v4-flash[1m]' | 'deepseek-v4-pro' | 'deepseek-v4-pro[1m]'
  thinkingStrength: 'high' | 'max'
}
```

### 5.10 工具执行卡片

后端推送：

```ts
window.HarnessUI.dispatch('tool.execution.updated', {
  conversationId: 'conversation-id',
  executions: [
    {
      id: 'tool-run-id',
      name: 'run_shell',
      detail: 'mkdir -p src/{ui,core,models,services,plugins}',
      state: 'done',
      costText: '0.3s'
    }
  ]
})
```

工具执行结构：

```ts
interface ToolExecution {
  id: string
  name: string
  detail: string
  state: 'pending' | 'running' | 'done' | 'failed' | 'cancelled'
  costText: string
  startedAt?: string
  endedAt?: string
}
```

### 5.11 生成文件列表

后端推送：

```ts
window.HarnessUI.dispatch('generated.files.updated', {
  conversationId: 'conversation-id',
  files: [
    { id: 'file-id', name: 'main.cpp', path: 'src/', status: 'created' }
  ]
})
```

点击文件时：

```ts
window.harnessBridge.invoke('file.openGenerated', JSON.stringify({
  conversationId: 'conversation-id',
  fileId: 'file-id'
}))
```

## 6. 审批权限与计划选择弹窗接口

弹窗不由前端按钮触发，应由后端推送显示。

### 6.1 后端推送审批权限弹窗

```ts
window.HarnessUI.dispatch('approval.prompt.show', {
  promptId: 'approval-id',
  title: '需要审批权限',
  description: '当前操作需要你确认是否允许继续执行。',
  options: [
    { value: 'approve_once', label: '同意' },
    { value: 'approve_always', label: '总是同意' },
    { value: 'reject_once', label: '拒绝' },
    { value: 'reject_all', label: '全部拒绝' }
  ],
  context: {
    riskLevel: 'medium',
    toolName: 'apply_patch',
    summary: '修改 4 个文件，新增 3 个文件'
  }
})
```

用户选择后前端发送：

```ts
window.harnessBridge.invoke('approval.respond', JSON.stringify({
  promptId: 'approval-id',
  decision: 'approve_once'
}))
```

### 6.2 后端推送计划选择弹窗

```ts
window.HarnessUI.dispatch('plan.prompt.show', {
  promptId: 'plan-id',
  title: '选择执行计划',
  description: '请选择一个计划方案，或在下方输入自定义计划。',
  options: [
    { value: 'plan_a', label: 'A. 使用 xxx' },
    { value: 'plan_b', label: 'B. 使用 asdfa' },
    { value: 'custom', label: 'C. 自定义输入' }
  ],
  allowCustomInput: true
})
```

用户选择或自定义输入后前端发送：

```ts
window.harnessBridge.invoke('plan.respond', JSON.stringify({
  promptId: 'plan-id',
  selectedValue: 'custom',
  customText: '自定义执行计划内容'
}))
```

### 6.3 后端隐藏弹窗

```ts
window.HarnessUI.dispatch('prompt.hide', {
  promptId: 'approval-id'
})
```

## 7. 右侧执行计划接口

右侧顶部显示执行计划，状态包括：未完成、正在执行、已完成。

### 7.1 获取执行计划

```ts
window.harnessBridge.invoke('plan.getCurrent', JSON.stringify({
  conversationId: 'conversation-id'
}))
```

返回：

```ts
interface PlanStep {
  id: string
  title: string
  status: 'pending' | 'running' | 'done' | 'failed'
  description?: string
}
```

### 7.2 后端推送计划状态

```ts
window.HarnessUI.dispatch('execution.plan.updated', {
  conversationId: 'conversation-id',
  steps: [
    { id: 's1', title: '初始化 Qt5 项目结构', status: 'done' },
    { id: 's2', title: '搭建三栏主界面与基础导航', status: 'running' }
  ]
})
```

## 8. 右侧 Git 状态接口

### 8.1 获取 Git 状态

```ts
window.harnessBridge.invoke('git.getStatus', JSON.stringify({
  projectId: 'project-id'
}))
```

返回：

```ts
interface GitStatus {
  branch: string
  branchLabel: string
  commitStatus: string
  shortCommit: string
  changes: {
    added: number
    modified: number
    removed: number
  }
}
```

### 8.2 打开 Git 面板

```ts
window.harnessBridge.invoke('git.openPanel', JSON.stringify({
  projectId: 'project-id'
}))
```

### 8.3 后端推送 Git 状态

```ts
window.HarnessUI.dispatch('git.status.updated', {
  projectId: 'project-id',
  branch: 'main',
  branchLabel: '当前分支',
  commitStatus: '已提交',
  shortCommit: 'a1b2c3d',
  changes: { added: 12, modified: 4, removed: 1 }
})
```

## 9. 右侧上下文状态接口

### 9.1 获取上下文状态

```ts
window.harnessBridge.invoke('context.getUsage', JSON.stringify({
  conversationId: 'conversation-id'
}))
```

返回：

```ts
interface ContextUsage {
  inputTokenMiss: number
  inputTokenHit: number
  outputToken: number
  cacheHitRate: number
  sessionTotalContext: number
  usedContext: number
  usageRate: number
}
```

字段与界面对应：

| 字段 | 界面文案 |
|---|---|
| `inputTokenMiss` | 输入 Token（未命中） |
| `inputTokenHit` | 输入 Token（命中） |
| `outputToken` | 输出 Token |
| `cacheHitRate` | 缓存命中率 |
| `sessionTotalContext` | 会话总上下文 |
| `usedContext` | 已用上下文 |
| `usageRate` | 占用与进度条 |

### 9.2 后端推送上下文状态

```ts
window.HarnessUI.dispatch('context.usage.updated', {
  conversationId: 'conversation-id',
  inputTokenMiss: 6400,
  inputTokenHit: 11800,
  outputToken: 4800,
  cacheHitRate: 0.82,
  sessionTotalContext: 32000,
  usedContext: 23000,
  usageRate: 0.72
})
```

## 10. 顶部工具按钮接口

### 10.1 同步或刷新当前会话

```ts
window.harnessBridge.invoke('conversation.refresh', JSON.stringify({
  conversationId: 'conversation-id'
}))
```

### 10.2 更多菜单

```ts
window.harnessBridge.invoke('conversation.getActions', JSON.stringify({
  conversationId: 'conversation-id'
}))
```

返回：

```ts
interface ActionItem {
  id: string
  label: string
  enabled: boolean
  danger?: boolean
}
```

点击菜单项：

```ts
window.harnessBridge.invoke('conversation.runAction', JSON.stringify({
  conversationId: 'conversation-id',
  actionId: 'export'
}))
```

## 11. 前端需要注册的 JS 接口

Qt 后端需要能调用以下前端 JS 方法：

```ts
window.HarnessUI = {
  dispatch(eventName: string, payload: object): void,
  applySnapshot(snapshot: AppSnapshot): void,
  appendMessageDelta(payload: MessageDeltaPayload): void,
  finishMessage(payload: FinishMessagePayload): void,
  showApprovalPrompt(payload: ApprovalPrompt): void,
  showPlanPrompt(payload: PlanPrompt): void,
  hidePrompt(payload: { promptId: string }): void,
  updatePlan(payload: { conversationId: string; steps: PlanStep[] }): void,
  updateGitStatus(payload: GitStatus): void,
  updateContextUsage(payload: ContextUsage): void,
  showError(payload: ErrorPayload): void
}
```

推荐内部只实现 `dispatch`，其它方法作为语义化包装：

```ts
window.HarnessUI.showApprovalPrompt = (payload) => {
  window.HarnessUI.dispatch('approval.prompt.show', payload)
}
```

## 12. 错误与状态码约定

本地桥接返回也应保持统一格式：

| code | 说明 |
|---|---|
| `OK` | 成功 |
| `INVALID_ARGUMENT` | 参数错误 |
| `NOT_FOUND` | 项目、会话、消息或文件不存在 |
| `PERMISSION_REQUIRED` | 需要审批权限 |
| `CANCELLED` | 用户取消或后端取消 |
| `BACKEND_BUSY` | 后端忙 |
| `INTERNAL_ERROR` | 后端内部错误 |

错误推送：

```ts
window.HarnessUI.dispatch('error.raised', {
  code: 'INTERNAL_ERROR',
  message: '工具执行失败',
  detail: 'apply_patch 返回非零退出码',
  recoverable: true
})
```

## 13. 最小接口清单

后端至少需要实现以下动作：

| 分类 | action / event | 方向 | 必需 |
|---|---|---|---|
| 初始化 | `app.getSnapshot` | 前端到后端 | 是 |
| 初始化 | `app.snapshot.updated` | 后端到前端 | 是 |
| 项目 | `project.list` | 前端到后端 | 是 |
| 项目 | `project.toggleExpanded` | 前端到后端 | 是 |
| 会话 | `conversation.open` | 前端到后端 | 是 |
| 会话 | `conversation.create` | 前端到后端 | 是 |
| 会话 | `conversation.getDetail` | 前端到后端 | 是 |
| 会话 | `conversation.sendMessage` | 前端到后端 | 是 |
| 会话 | `conversation.message.delta` | 后端到前端 | 是 |
| 会话 | `conversation.updated` | 后端到前端 | 是 |
| 运行配置 | `settings.updateRuntime` | 前端到后端 | 是 |
| 审批 | `approval.prompt.show` | 后端到前端 | 是 |
| 审批 | `approval.respond` | 前端到后端 | 是 |
| 计划 | `plan.prompt.show` | 后端到前端 | 是 |
| 计划 | `plan.respond` | 前端到后端 | 是 |
| 计划 | `execution.plan.updated` | 后端到前端 | 是 |
| 工具 | `tool.execution.updated` | 后端到前端 | 是 |
| 文件 | `generated.files.updated` | 后端到前端 | 是 |
| 文件 | `file.openGenerated` | 前端到后端 | 是 |
| Git | `git.getStatus` | 前端到后端 | 是 |
| Git | `git.status.updated` | 后端到前端 | 是 |
| 上下文 | `context.getUsage` | 前端到后端 | 是 |
| 上下文 | `context.usage.updated` | 后端到前端 | 是 |
| 错误 | `error.raised` | 后端到前端 | 是 |

## 14. 建议落地顺序

1. 先实现 `app.getSnapshot` 和 `window.HarnessUI.dispatch`，让界面可以一次性加载全量状态。
2. 实现 `conversation.sendMessage`、`conversation.message.delta`、`tool.execution.updated`，打通对话主流程。
3. 实现 `approval.prompt.show`、`approval.respond`、`plan.prompt.show`、`plan.respond`，打通审批与计划选择。
4. 实现 `project.list`、`conversation.open`、`project.toggleExpanded`，补齐左侧项目与会话切换。
5. 实现 `git.status.updated` 和 `context.usage.updated`，补齐右侧状态。
6. 最后补充文件打开、附件选择、搜索、插件、自动化、设置等扩展能力。
