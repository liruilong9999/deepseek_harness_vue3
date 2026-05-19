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
| `payloadJson` | `string` | JSON 字符串，承载请求参数；空参数使用 `{}` |

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

统一返回结构：

```ts
interface BridgeResponse<T = unknown> {
  requestId: string
  success: boolean
  code: BridgeCode
  message: string
  data: T | null
}
```

约定：

| 字段 | 说明 |
|---|---|
| `requestId` | 请求编号。前端请求未传时由后端生成；后端推送事件如由某次请求触发，应尽量透传该编号 |
| `success` | 是否成功。成功时 `code` 固定为 `OK` |
| `code` | 状态码，见第 12 节 |
| `message` | 面向用户或日志的中文提示 |
| `data` | 业务数据。下文所有“返回”接口均表示 `BridgeResponse.data` 内的数据结构 |

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
| `conversation.active.changed` | 当前项目或当前会话切换 |
| `conversation.message.started` | 助手消息开始生成 |
| `conversation.message.delta` | 流式追加助手消息 |
| `conversation.message.finished` | 助手消息生成完成 |
| `conversation.message.failed` | 助手消息生成失败 |
| `conversation.message.cancelled` | 助手消息生成取消 |
| `conversation.task.updated` | 会话任务排队、运行、完成、失败或取消 |
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

所有后端推送 payload 必须包含能定位界面的关键编号。会话相关事件至少包含 `conversationId`，项目相关事件至少包含 `projectId`，任务或流式生成事件至少包含 `taskId` 与 `assistantMessageId`。

### 2.3 界面元素与桥接接口对照

下表按界面可见元素整理，作为 QtWebView 到 JavaScript(JS，浏览器脚本语言) 的桥接能力契约。

| 界面区域 | 界面元素 | 前端发送给后端 | 后端推送或返回给前端 |
|---|---|---|---|
| 左侧栏 | 主导航按钮、新对话、搜索、插件、自动化 | `conversation.create`、`search.query`、`panel.open` | `project.list.updated`、`app.snapshot.updated` |
| 左侧栏 | 项目列表、项目展开/收起、会话列表 | `project.list`、`project.open`、`project.toggleExpanded`、`conversation.open` | `project.list.updated`、`conversation.updated` |
| 左侧栏 | 底部设置、快捷键、帮助/关于 | `panel.open` | `settings.updated`、`error.raised` |
| 中间顶部 | 对话标题、编辑标题、同步、更多菜单 | `conversation.rename`、`conversation.refresh`、`conversation.getActions`、`conversation.runAction` | `conversation.updated`、`error.raised` |
| 中间记录 | 用户消息、助手消息、工作耗时、复制按钮 | `message.copy` | `conversation.updated`、`conversation.message.started`、`conversation.message.delta`、`conversation.message.finished`、`conversation.message.failed`、`conversation.message.cancelled` |
| 中间记录 | 工具执行卡片、生成文件列表 | `file.openGenerated` | `tool.execution.updated`、`generated.files.updated` |
| 中间弹窗 | 审批权限弹窗 | `approval.respond` | `approval.prompt.show`、`prompt.hide` |
| 中间弹窗 | 计划选择弹窗、自定义计划输入、发送按钮 | `plan.respond` | `plan.prompt.show`、`prompt.hide` |
| 输入区 | 附加文件、提及上下文、插入工具 | `file.pickAttachment`、`context.pick`、`tool.pick` | 通过对应调用返回附件、上下文和工具候选数据 |
| 输入区 | 审批模式、模型、思考强度下拉框 | `settings.updateRuntime` | `settings.updated` |
| 输入区 | 文本输入框、发送按钮、停止生成 | `conversation.sendMessage`、`conversation.stopGeneration` | `conversation.task.updated`、`conversation.message.started`、`conversation.message.delta`、`conversation.message.finished`、`conversation.message.failed`、`conversation.message.cancelled`、`conversation.updated`、`error.raised` |
| 右侧栏 | 执行计划列表、未完成/执行中/已完成状态图标 | `plan.getCurrent` | `execution.plan.updated` |
| 右侧栏 | Git 状态、查看 Git 面板 | `git.getStatus`、`git.openPanel` | `git.status.updated` |
| 右侧栏 | 总上下文、Token 指标、缓存命中率、占用进度条 | `context.getUsage` | `context.usage.updated` |

### 2.4 基础类型与命名约定

接口字段统一使用 camelCase(小驼峰命名)。编号统一使用字符串，由后端生成并保证在对应业务范围内稳定。

```ts
type BridgeCode =
  | 'OK'
  | 'INVALID_ARGUMENT'
  | 'NOT_FOUND'
  | 'PERMISSION_REQUIRED'
  | 'CANCELLED'
  | 'BACKEND_BUSY'
  | 'INTERNAL_ERROR'

type MessageRole = 'user' | 'assistant' | 'system'
type MessageStatus = 'queued' | 'streaming' | 'done' | 'error' | 'cancelled'
type TaskStatus = 'queued' | 'running' | 'done' | 'failed' | 'cancelled'

interface RequestPayload {
  requestId?: string
}

interface EntityRef {
  id: string
  title: string
}
```

时间字段约定：

| 字段形式 | 说明 |
|---|---|
| `createdAt`、`updatedAt`、`startedAt`、`endedAt` | ISO 8601 字符串，例如 `2026-05-19T10:30:00+08:00` |
| `createdAtText`、`updatedAtText`、`lastActiveText`、`costText` | 面向界面展示的中文文案，例如 `刚刚`、`3 分钟前`、`0.3s` |

### 2.5 事件 payload 总表

| 事件名 | payload 数据结构 |
|---|---|
| `app.snapshot.updated` | `AppSnapshot` |
| `project.list.updated` | `{ projects: ProjectItem[], activeProjectId: string, activeConversationId: string }` |
| `conversation.active.changed` | `ProjectOpenResult | ConversationOpenResult` |
| `conversation.updated` | `{ projectId: string, conversationId: string, conversation: ConversationDetail }` |
| `conversation.message.started` | `MessageStartedPayload` |
| `conversation.message.delta` | `MessageDeltaPayload` |
| `conversation.message.finished` | `FinishMessagePayload` |
| `conversation.message.failed` | `MessageFailedPayload` |
| `conversation.message.cancelled` | `MessageCancelledPayload` |
| `conversation.task.updated` | `ConversationTask` |
| `execution.plan.updated` | `{ projectId: string, conversationId: string, taskId?: string, steps: PlanStep[] }` |
| `tool.execution.updated` | `{ projectId: string, conversationId: string, taskId?: string, executions: ToolExecution[] }` |
| `generated.files.updated` | `{ projectId: string, conversationId: string, taskId?: string, files: GeneratedFile[] }` |
| `approval.prompt.show` | `ApprovalPrompt` |
| `plan.prompt.show` | `PlanPrompt` |
| `prompt.hide` | `{ promptId: string, reason?: string }` |
| `git.status.updated` | `GitStatus` |
| `context.usage.updated` | `ContextUsage` |
| `settings.updated` | `{ projectId: string, conversationId?: string, settings: RuntimeSettings }` |
| `error.raised` | `ErrorPayload` |

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
  conversation: ConversationDetail | null
  executionPlan: PlanStep[]
  gitStatus: GitStatus | null
  contextUsage: ContextUsage | null
  settings: RuntimeSettings
}

interface NavigationItem {
  id: string
  label: string
  icon: string
  active: boolean
  badgeText?: string
}

interface FooterAction {
  id: string
  label: string
  icon: string
  panel: 'plugins' | 'automation' | 'settings' | 'shortcuts' | 'help' | 'about'
}
```

用途：初始化左侧导航、项目列表、中间对话、右侧计划、Git 状态、上下文状态和底部输入配置。

### 3.2 前端请求局部刷新

```ts
window.harnessBridge.invoke('app.refresh', JSON.stringify({
  scopes: ['projects', 'conversation', 'plan', 'git', 'context']
}))
```

返回：

```ts
interface RefreshResult {
  scopes: string[]
  projects?: ProjectItem[]
  conversation?: ConversationDetail | null
  executionPlan?: PlanStep[]
  gitStatus?: GitStatus
  contextUsage?: ContextUsage
  settings?: RuntimeSettings
}
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
interface ProjectListResult {
  projects: ProjectItem[]
  activeProjectId: string
  activeConversationId: string
}

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
  status: 'idle' | 'queued' | 'running' | 'error'
  unread: boolean
}
```

### 4.2 切换项目展开状态

```ts
window.harnessBridge.invoke('project.toggleExpanded', JSON.stringify({
  projectId: 'project-id',
  expanded: true
}))
```

返回：

```ts
interface ProjectToggleExpandedResult {
  projectId: string
  expanded: boolean
  projects: ProjectItem[]
}
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

返回：

```ts
interface ProjectOpenResult {
  activeProjectId: string
  activeConversationId: string
  projects: ProjectItem[]
  conversation: ConversationDetail | null
  executionPlan: PlanStep[]
  gitStatus: GitStatus | null
  contextUsage: ContextUsage | null
  settings: RuntimeSettings
}

interface ConversationOpenResult {
  activeProjectId: string
  activeConversationId: string
  projects: ProjectItem[]
  conversation: ConversationDetail
  executionPlan: PlanStep[]
  gitStatus: GitStatus
  contextUsage: ContextUsage
  settings: RuntimeSettings
}
```

会话切换约定：

| 场景 | 后端行为 |
|---|---|
| 打开项目 | 返回该项目下最近活跃会话；如果项目没有会话，`activeConversationId` 为空字符串且 `conversation` 为 `null` |
| 打开会话 | 返回该会话详情，并同步返回左侧项目激活态、右侧计划、Git 状态、上下文状态和运行设置 |
| 切换会话时存在其它会话运行任务 | 不取消其它会话任务；后端继续推送任务事件，payload 必须带 `conversationId`，前端按当前激活会话决定是否展示到主对话区 |
| 打开不存在的项目或会话 | 返回 `NOT_FOUND`，并通过 `error.raised` 推送错误 |

打开项目或会话成功后，后端必须推送 `conversation.active.changed`，payload 使用 `ProjectOpenResult` 或 `ConversationOpenResult`。

### 4.4 创建新对话

```ts
window.harnessBridge.invoke('conversation.create', JSON.stringify({
  projectId: 'project-id',
  title: '新对话'
}))
```

返回：

```ts
interface ConversationCreateResult {
  projectId: string
  conversationId: string
  conversation: ConversationDetail
  projects: ProjectItem[]
}
```

创建成功后，新会话自动成为当前激活会话，并推送 `conversation.active.changed` 与 `project.list.updated`。

### 4.5 搜索

```ts
window.harnessBridge.invoke('search.query', JSON.stringify({
  keyword: '插件',
  scopes: ['project', 'conversation', 'message', 'file']
}))
```

返回：

```ts
interface SearchResult {
  keyword: string
  items: SearchResultItem[]
}

interface SearchResultItem {
  id: string
  scope: 'project' | 'conversation' | 'message' | 'file'
  title: string
  subtitle?: string
  projectId?: string
  conversationId?: string
  messageId?: string
  filePath?: string
}
```

### 4.6 打开功能面板

```ts
window.harnessBridge.invoke('panel.open', JSON.stringify({
  panel: 'plugins'
}))
```

可选值：`plugins`、`automation`、`settings`、`shortcuts`、`help`、`about`。

返回：

```ts
interface PanelOpenResult {
  panel: 'plugins' | 'automation' | 'settings' | 'shortcuts' | 'help' | 'about'
  title: string
  data: object
}
```

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
  projectId: string
  title: string
  createdAt: string
  updatedAt: string
  status: 'idle' | 'queued' | 'running' | 'error'
  messages: ChatMessage[]
  tasks: ConversationTask[]
  toolExecutions: ToolExecution[]
  generatedFiles: GeneratedFile[]
}

interface ChatMessage {
  id: string
  conversationId: string
  taskId?: string
  role: MessageRole
  authorName: string
  content: string
  sequence: number
  createdAt: string
  createdAtText: string
  workDurationText?: string
  status: MessageStatus
  copyable: boolean
  errorMessage?: string
}

interface ConversationTask {
  id: string
  projectId: string
  conversationId: string
  parentTaskId?: string
  userMessageId: string
  assistantMessageId: string
  status: TaskStatus
  createdAt: string
  startedAt?: string
  endedAt?: string
  errorMessage?: string
}
```

### 5.2 修改对话标题

```ts
window.harnessBridge.invoke('conversation.rename', JSON.stringify({
  conversationId: 'conversation-id',
  title: '设计 DeepSeek Harness GUI 方案'
}))
```

返回：

```ts
interface ConversationRenameResult {
  projectId: string
  conversationId: string
  title: string
  conversation: ConversationDetail
  projects: ProjectItem[]
}
```

### 5.3 发送用户消息

```ts
window.harnessBridge.invoke('conversation.sendMessage', JSON.stringify({
  conversationId: 'conversation-id',
  parentTaskId: '',
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
| `conversationId` | `string` | 会话编号 |
| `parentTaskId` | `string` | 父任务编号。普通消息传空字符串；子任务传父任务编号 |
| `content` | `string` | 输入框正文 |
| `attachments` | `AttachmentRef[]` | 附件文件引用 |
| `contextRefs` | `ContextRef[]` | 被 @ 提及的上下文 |
| `toolRefs` | `ToolRef[]` | 插入的工具引用 |
| `settings.approvalMode` | `string` | 审批模式 |
| `settings.model` | `string` | 模型名称 |
| `settings.thinkingStrength` | `string` | 思考强度 |

返回：

```ts
interface SendMessageResult {
  projectId: string
  conversationId: string
  taskId: string
  parentTaskId?: string
  userMessageId: string
  assistantMessageId: string
  status: TaskStatus
}
```

发送消息成功后，后端必须立即返回 `SendMessageResult`。如果任务进入队列，`status` 为 `queued`；如果立即运行，`status` 为 `running`。前端必须保存 `taskId`，停止生成、流式增量、完成、失败、取消都通过 `taskId` 关联。

### 5.4 流式消息生命周期

一次助手回复必须遵循以下事件顺序：

```text
conversation.message.started
conversation.message.delta(可重复 0 到 N 次)
conversation.message.finished | conversation.message.failed | conversation.message.cancelled
conversation.updated
```

如果任务排队，后端应先推送 `conversation.task.updated`，待真正开始生成时再推送 `conversation.message.started`。

消息开始：

```ts
window.HarnessUI.dispatch('conversation.message.started', {
  projectId: 'project-id',
  conversationId: 'conversation-id',
  taskId: 'task-id',
  parentTaskId: '',
  userMessageId: 'user-message-id',
  assistantMessageId: 'assistant-message-id',
  assistantMessage: {
    id: 'assistant-message-id',
    conversationId: 'conversation-id',
    taskId: 'task-id',
    role: 'assistant',
    authorName: 'DeepSeek',
    content: '',
    sequence: 12,
    createdAt: '2026-05-19T10:30:00+08:00',
    createdAtText: '刚刚',
    status: 'streaming',
    copyable: true
  }
})
```

流式增量：

```ts
window.HarnessUI.dispatch('conversation.message.delta', {
  projectId: 'project-id',
  conversationId: 'conversation-id',
  taskId: 'task-id',
  assistantMessageId: 'assistant-message-id',
  delta: '这里是新增文本片段',
  fullContent: '这里是截至当前的完整文本，可为空',
  index: 3,
  isFinal: false
})
```

生成完成：

```ts
window.HarnessUI.dispatch('conversation.message.finished', {
  projectId: 'project-id',
  conversationId: 'conversation-id',
  taskId: 'task-id',
  assistantMessageId: 'assistant-message-id',
  content: '完整助手回复',
  status: 'done',
  workDurationText: '12.4s'
})
```

生成失败：

```ts
window.HarnessUI.dispatch('conversation.message.failed', {
  projectId: 'project-id',
  conversationId: 'conversation-id',
  taskId: 'task-id',
  assistantMessageId: 'assistant-message-id',
  status: 'error',
  code: 'INTERNAL_ERROR',
  message: '模型请求失败',
  recoverable: true
})
```

生成取消：

```ts
window.HarnessUI.dispatch('conversation.message.cancelled', {
  projectId: 'project-id',
  conversationId: 'conversation-id',
  taskId: 'task-id',
  assistantMessageId: 'assistant-message-id',
  status: 'cancelled',
  message: '已停止生成'
})
```

对应数据结构：

```ts
interface MessageStartedPayload {
  projectId: string
  conversationId: string
  taskId: string
  parentTaskId?: string
  userMessageId: string
  assistantMessageId: string
  assistantMessage: ChatMessage
}

interface MessageDeltaPayload {
  projectId: string
  conversationId: string
  taskId: string
  assistantMessageId: string
  delta: string
  fullContent?: string
  index: number
  isFinal: boolean
}

interface FinishMessagePayload {
  projectId: string
  conversationId: string
  taskId: string
  assistantMessageId: string
  content: string
  status: 'done'
  workDurationText: string
}

interface MessageFailedPayload {
  projectId: string
  conversationId: string
  taskId: string
  assistantMessageId: string
  status: 'error'
  code: BridgeCode
  message: string
  recoverable: boolean
}

interface MessageCancelledPayload {
  projectId: string
  conversationId: string
  taskId: string
  assistantMessageId: string
  status: 'cancelled'
  message: string
}
```

流式显示规则：

| 规则 | 说明 |
|---|---|
| 增量顺序 | 前端按 `index` 从小到大追加；如果收到重复 `index`，后到达事件覆盖前一次 |
| 会话切换 | 当前激活会话与 payload 的 `conversationId` 不一致时，前端只更新左侧任务状态，不把增量追加到当前主对话区 |
| 完整内容 | `fullContent` 可为空；如果不为空，前端以 `fullContent` 修正当前助手消息内容 |
| 最终状态 | `finished`、`failed`、`cancelled` 三类终态只允许出现一个 |
| 刷新兜底 | 终态事件后必须推送 `conversation.updated`，用于修正消息列表、工具卡片、生成文件和上下文统计 |

### 5.5 停止生成

```ts
window.harnessBridge.invoke('conversation.stopGeneration', JSON.stringify({
  conversationId: 'conversation-id',
  taskId: 'task-id',
  assistantMessageId: 'assistant-message-id'
}))
```

返回：

```ts
interface StopGenerationResult {
  projectId: string
  conversationId: string
  taskId: string
  assistantMessageId: string
  status: 'cancelled'
}
```

停止生成以 `taskId` 为准；`assistantMessageId` 用于前端定位界面消息。

### 5.6 任务状态更新

```ts
window.HarnessUI.dispatch('conversation.task.updated', {
  id: 'task-id',
  projectId: 'project-id',
  conversationId: 'conversation-id',
  parentTaskId: '',
  userMessageId: 'user-message-id',
  assistantMessageId: 'assistant-message-id',
  status: 'running',
  createdAt: '2026-05-19T10:30:00+08:00',
  startedAt: '2026-05-19T10:30:01+08:00'
})
```

同一会话内任务必须串行：一个 `conversationId` 同一时间最多一个 `running` 任务；同一项目或不同项目下的不同会话可以并行运行。子任务不创建新会话，通过 `parentTaskId` 归属于父任务。

### 5.7 复制消息

复制按钮可优先前端本地复制；如需要后端记录行为：

```ts
window.harnessBridge.invoke('message.copy', JSON.stringify({
  conversationId: 'conversation-id',
  messageId: 'message-id'
}))
```

返回：

```ts
interface MessageCopyResult {
  conversationId: string
  messageId: string
  copied: boolean
}
```

### 5.8 附件按钮

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
  conversationId: string
  name: string
  path: string
  size: number
  mimeType: string
}
```

### 5.9 提及上下文按钮

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
  conversationId: string
  type: 'file' | 'folder' | 'symbol' | 'conversation' | 'selection'
  title: string
  path?: string
  summary?: string
}
```

### 5.10 插入工具按钮

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
  conversationId: string
  name: string
  description: string
  riskLevel: 'low' | 'medium' | 'high'
}
```

### 5.11 更新运行设置

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
  projectId: string
  conversationId?: string
  approvalMode: 'approval_recommended' | 'full_access'
  model: 'deepseek-v4-flash' | 'deepseek-v4-flash[1m]' | 'deepseek-v4-pro' | 'deepseek-v4-pro[1m]'
  thinkingStrength: 'high' | 'max'
}
```

返回：`RuntimeSettings`。更新成功后后端必须推送 `settings.updated`。

### 5.12 工具执行卡片

后端推送：

```ts
window.HarnessUI.dispatch('tool.execution.updated', {
  projectId: 'project-id',
  conversationId: 'conversation-id',
  taskId: 'task-id',
  executions: [
    {
      id: 'tool-run-id',
      projectId: 'project-id',
      conversationId: 'conversation-id',
      taskId: 'task-id',
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
  projectId: string
  conversationId: string
  taskId: string
  name: string
  detail: string
  state: 'pending' | 'running' | 'done' | 'failed' | 'cancelled'
  costText: string
  startedAt?: string
  endedAt?: string
}
```

### 5.13 生成文件列表

后端推送：

```ts
window.HarnessUI.dispatch('generated.files.updated', {
  projectId: 'project-id',
  conversationId: 'conversation-id',
  taskId: 'task-id',
  files: [
    {
      id: 'file-id',
      projectId: 'project-id',
      conversationId: 'conversation-id',
      taskId: 'task-id',
      name: 'main.cpp',
      path: 'src/main.cpp',
      status: 'created'
    }
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

返回：

```ts
interface FileOpenGeneratedResult {
  projectId: string
  conversationId: string
  fileId: string
  path: string
  opened: boolean
}
```

生成文件结构：

```ts
interface GeneratedFile {
  id: string
  projectId: string
  conversationId: string
  taskId?: string
  name: string
  path: string
  status: 'created' | 'modified' | 'deleted'
}
```

## 6. 审批权限与计划选择弹窗接口

弹窗不由前端按钮触发，应由后端推送显示。

### 6.1 后端推送审批权限弹窗

```ts
window.HarnessUI.dispatch('approval.prompt.show', {
  promptId: 'approval-id',
  projectId: 'project-id',
  conversationId: 'conversation-id',
  taskId: 'task-id',
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
  taskId: 'task-id',
  decision: 'approve_once'
}))
```

审批弹窗结构：

```ts
interface ApprovalPrompt {
  promptId: string
  projectId: string
  conversationId: string
  taskId: string
  title: string
  description: string
  options: PromptOption[]
  context: {
    riskLevel: 'low' | 'medium' | 'high'
    toolName?: string
    summary: string
  }
}

interface ApprovalRespondResult {
  promptId: string
  taskId: string
  decision: 'approve_once' | 'approve_always' | 'reject_once' | 'reject_all'
}
```

### 6.2 后端推送计划选择弹窗

```ts
window.HarnessUI.dispatch('plan.prompt.show', {
  promptId: 'plan-id',
  projectId: 'project-id',
  conversationId: 'conversation-id',
  taskId: 'task-id',
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
  taskId: 'task-id',
  selectedValue: 'custom',
  customText: '自定义执行计划内容'
}))
```

计划弹窗结构：

```ts
interface PlanPrompt {
  promptId: string
  projectId: string
  conversationId: string
  taskId: string
  title: string
  description: string
  options: PromptOption[]
  allowCustomInput: boolean
}

interface PromptOption {
  value: string
  label: string
  description?: string
}

interface PlanRespondResult {
  promptId: string
  taskId: string
  selectedValue: string
  customText?: string
}
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
  projectId: string
  conversationId: string
  taskId?: string
  title: string
  status: 'pending' | 'running' | 'done' | 'failed'
  description?: string
}
```

### 7.2 后端推送计划状态

```ts
window.HarnessUI.dispatch('execution.plan.updated', {
  projectId: 'project-id',
  conversationId: 'conversation-id',
  taskId: 'task-id',
  steps: [
    { id: 's1', projectId: 'project-id', conversationId: 'conversation-id', taskId: 'task-id', title: '初始化 Qt5 项目结构', status: 'done' },
    { id: 's2', projectId: 'project-id', conversationId: 'conversation-id', taskId: 'task-id', title: '搭建三栏主界面与基础导航', status: 'running' }
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
  projectId: string
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

返回：

```ts
interface GitOpenPanelResult {
  projectId: string
  opened: boolean
  gitStatus: GitStatus
}
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
  projectId: string
  conversationId: string
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
  projectId: 'project-id',
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

返回：`ConversationOpenResult`。

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

返回：

```ts
interface ConversationRunActionResult {
  conversationId: string
  actionId: string
  handled: boolean
  message: string
}
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
  requestId: 'request-id',
  projectId: 'project-id',
  conversationId: 'conversation-id',
  taskId: 'task-id',
  code: 'INTERNAL_ERROR',
  message: '工具执行失败',
  detail: 'apply_patch 返回非零退出码',
  recoverable: true
})
```

错误结构：

```ts
interface ErrorPayload {
  requestId?: string
  projectId?: string
  conversationId?: string
  taskId?: string
  code: BridgeCode
  message: string
  detail?: string
  recoverable: boolean
}
```

## 13. 必需接口清单

后端需要按以下动作与事件完成桥接。未在本表出现但已在上文定义的结构字段，也属于契约的一部分。

| 分类 | action / event | 方向 | 必需 |
|---|---|---|---|
| 初始化 | `app.getSnapshot` | 前端到后端 | 是 |
| 初始化 | `app.refresh` | 前端到后端 | 是 |
| 初始化 | `app.snapshot.updated` | 后端到前端 | 是 |
| 项目 | `project.list` | 前端到后端 | 是 |
| 项目 | `project.open` | 前端到后端 | 是 |
| 项目 | `project.toggleExpanded` | 前端到后端 | 是 |
| 项目 | `project.list.updated` | 后端到前端 | 是 |
| 会话 | `conversation.open` | 前端到后端 | 是 |
| 会话 | `conversation.create` | 前端到后端 | 是 |
| 会话 | `conversation.getDetail` | 前端到后端 | 是 |
| 会话 | `conversation.rename` | 前端到后端 | 是 |
| 会话 | `conversation.refresh` | 前端到后端 | 是 |
| 会话 | `conversation.getActions` | 前端到后端 | 是 |
| 会话 | `conversation.runAction` | 前端到后端 | 是 |
| 会话 | `conversation.sendMessage` | 前端到后端 | 是 |
| 会话 | `conversation.stopGeneration` | 前端到后端 | 是 |
| 会话 | `conversation.active.changed` | 后端到前端 | 是 |
| 会话 | `conversation.message.started` | 后端到前端 | 是 |
| 会话 | `conversation.message.delta` | 后端到前端 | 是 |
| 会话 | `conversation.message.finished` | 后端到前端 | 是 |
| 会话 | `conversation.message.failed` | 后端到前端 | 是 |
| 会话 | `conversation.message.cancelled` | 后端到前端 | 是 |
| 会话 | `conversation.task.updated` | 后端到前端 | 是 |
| 会话 | `conversation.updated` | 后端到前端 | 是 |
| 消息 | `message.copy` | 前端到后端 | 是 |
| 运行配置 | `settings.updateRuntime` | 前端到后端 | 是 |
| 运行配置 | `settings.updated` | 后端到前端 | 是 |
| 审批 | `approval.prompt.show` | 后端到前端 | 是 |
| 审批 | `approval.respond` | 前端到后端 | 是 |
| 弹窗 | `prompt.hide` | 后端到前端 | 是 |
| 计划 | `plan.prompt.show` | 后端到前端 | 是 |
| 计划 | `plan.respond` | 前端到后端 | 是 |
| 计划 | `plan.getCurrent` | 前端到后端 | 是 |
| 计划 | `execution.plan.updated` | 后端到前端 | 是 |
| 工具 | `tool.pick` | 前端到后端 | 是 |
| 工具 | `tool.execution.updated` | 后端到前端 | 是 |
| 文件 | `file.pickAttachment` | 前端到后端 | 是 |
| 文件 | `generated.files.updated` | 后端到前端 | 是 |
| 文件 | `file.openGenerated` | 前端到后端 | 是 |
| 上下文 | `context.pick` | 前端到后端 | 是 |
| Git | `git.getStatus` | 前端到后端 | 是 |
| Git | `git.openPanel` | 前端到后端 | 是 |
| Git | `git.status.updated` | 后端到前端 | 是 |
| 上下文 | `context.getUsage` | 前端到后端 | 是 |
| 上下文 | `context.usage.updated` | 后端到前端 | 是 |
| 搜索 | `search.query` | 前端到后端 | 是 |
| 面板 | `panel.open` | 前端到后端 | 是 |
| 错误 | `error.raised` | 后端到前端 | 是 |
