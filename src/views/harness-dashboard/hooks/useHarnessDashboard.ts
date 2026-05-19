import { onBeforeUnmount, onMounted, ref } from 'vue'

import {
  copyMessage,
  createConversation,
  fetchAppSnapshot,
  getConversationActions,
  openConversation,
  openGeneratedFile,
  openPanel,
  openProject,
  pickAttachment,
  pickContext,
  pickTool,
  querySearch,
  refreshConversation,
  respondApprovalPrompt,
  respondPlanPrompt,
  sendConversationMessage,
  toggleProjectExpanded,
  updateRuntimeSettings,
} from '@/api/harnessBridgeActions'
import { registerHarnessUI } from '@/bridges/harnessBridge'
import {
  features,
  footerItems,
  generatedFiles,
  navigationItems,
  planSteps,
  plugins,
  projectItems,
  sessionInfo,
  toolCalls,
  toolExecutions,
} from '@/config/harnessDashboard'

import type {
  ContextUsage,
  BridgePromptState,
  FooterItem,
  GeneratedFile,
  GitStatus,
  NavigationItem,
  ProjectItem,
  SessionItem,
  ToolExecution,
} from '@/types/business/harness'

/** 桥接 payload 中的普通对象。 */
type PayloadRecord = Record<string, unknown>

/** 运行配置参数。 */
interface RuntimeSettingsPayload {
  /** 审批模式。 */
  approvalMode: string
  /** 模型名称。 */
  model: string
  /** 思考强度。 */
  thinkingStrength: string
}

/** 发送消息参数。 */
interface SendMessagePayload {
  /** 消息正文。 */
  content: string
  /** 运行配置。 */
  settings: RuntimeSettingsPayload
}

/** 审批回复参数。 */
interface ApprovalResponsePayload {
  /** 弹窗唯一编号。 */
  promptId: string
  /** 关联任务编号。 */
  taskId?: string
  /** 审批决策。 */
  decision: string
}

/** 计划回复参数。 */
interface PlanResponsePayload {
  /** 弹窗唯一编号。 */
  promptId: string
  /** 关联任务编号。 */
  taskId?: string
  /** 选中的计划值。 */
  selectedValue: string
  /** 自定义计划内容。 */
  customText?: string
}

/** 默认 Git 状态，用于后端尚未推送前的占位展示。 */
const defaultGitStatus: GitStatus = {
  branch: 'main',
  branchLabel: '当前分支',
  commitStatus: '已提交',
  shortCommit: 'a1b2c3d',
  changes: {
    added: 12,
    modified: 4,
    removed: 1,
  },
}

/** 默认上下文状态，用于后端尚未推送前的占位展示。 */
const defaultContextUsage: ContextUsage = {
  inputTokenMiss: 6400,
  inputTokenHit: 11800,
  outputToken: 4800,
  cacheHitRate: 0.82,
  sessionTotalContext: 32000,
  usedContext: 23000,
  usageRate: 0.72,
}

/**
 * 判断值是否是普通对象。
 *
 * @param value 待判断值
 * @returns 是否为普通对象
 */
function isRecord(value: unknown): value is PayloadRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * 从对象中读取字符串字段。
 *
 * @param payload 数据对象
 * @param key 字段名
 * @param fallback 默认值
 * @returns 字符串字段值
 */
function readString(payload: PayloadRecord, key: string, fallback = '') {
  const value = payload[key]

  return typeof value === 'string' ? value : fallback
}

/**
 * 从对象中读取数字字段。
 *
 * @param payload 数据对象
 * @param key 字段名
 * @param fallback 默认值
 * @returns 数字字段值
 */
function readNumber(payload: PayloadRecord, key: string, fallback = 0) {
  const value = payload[key]

  return typeof value === 'number' ? value : fallback
}

/**
 * 从对象中读取数组字段。
 *
 * @param payload 数据对象
 * @param key 字段名
 * @returns 数组字段值
 */
function readArray(payload: PayloadRecord, key: string) {
  const value = payload[key]

  return Array.isArray(value) ? value : []
}

/**
 * 将后端会话数据转换为当前侧边栏展示结构。
 *
 * @param value 后端会话数据
 * @returns 侧边栏会话项
 */
function mapSessionItem(value: unknown): SessionItem {
  if (!isRecord(value)) {
    return { title: '', time: '' }
  }

  return {
    id: readString(value, 'id'),
    title: readString(value, 'title'),
    time: readString(value, 'lastActiveText', readString(value, 'time')),
    active: Boolean(value.active),
  }
}

/**
 * 将后端项目数据转换为当前侧边栏展示结构。
 *
 * @param value 后端项目数据
 * @returns 侧边栏项目项
 */
function mapProjectItem(value: unknown): ProjectItem {
  if (!isRecord(value)) {
    return {
      name: '',
      path: '',
      time: '',
      expanded: false,
      sessions: [],
    }
  }

  return {
    id: readString(value, 'id'),
    name: readString(value, 'name'),
    path: readString(value, 'path'),
    time: readString(value, 'lastActiveText', readString(value, 'time')),
    active: Boolean(value.active),
    expanded: Boolean(value.expanded),
    sessions: readArray(value, 'sessions').map(mapSessionItem),
  }
}

/**
 * 将后端计划步骤转换为右侧计划文案。
 *
 * @param value 后端计划步骤
 * @returns 计划步骤标题
 */
function mapPlanStep(value: unknown) {
  return isRecord(value) ? readString(value, 'title') : String(value)
}

/**
 * 将后端工具状态转换为界面文案。
 *
 * @param value 后端工具状态
 * @returns 工具执行记录
 */
function mapToolExecution(value: unknown): ToolExecution {
  if (!isRecord(value)) {
    return { name: '', detail: '', state: '完成', cost: '' }
  }

  return {
    name: readString(value, 'name'),
    detail: readString(value, 'detail'),
    state: readString(value, 'state') === 'running' ? '运行中' : '完成',
    cost: readString(value, 'costText', readString(value, 'cost')),
  }
}

/**
 * 将后端生成文件数据转换为界面文件项。
 *
 * @param value 后端生成文件数据
 * @returns 生成文件项
 */
function mapGeneratedFile(value: unknown): GeneratedFile {
  if (!isRecord(value)) {
    return { name: '', path: '' }
  }

  return {
    id: readString(value, 'id'),
    name: readString(value, 'name'),
    path: readString(value, 'path'),
  }
}

/**
 * 将后端 Git 状态转换为右侧展示结构。
 *
 * @param payload 后端 Git 状态
 * @returns Git 状态
 */
function mapGitStatus(payload: unknown): GitStatus {
  if (!isRecord(payload)) {
    return defaultGitStatus
  }

  const changes = isRecord(payload.changes) ? payload.changes : {}

  return {
    projectId: readString(payload, 'projectId'),
    branch: readString(payload, 'branch', defaultGitStatus.branch),
    branchLabel: readString(payload, 'branchLabel', defaultGitStatus.branchLabel),
    commitStatus: readString(payload, 'commitStatus', defaultGitStatus.commitStatus),
    shortCommit: readString(payload, 'shortCommit', defaultGitStatus.shortCommit),
    changes: {
      added: readNumber(changes, 'added', defaultGitStatus.changes.added),
      modified: readNumber(changes, 'modified', defaultGitStatus.changes.modified),
      removed: readNumber(changes, 'removed', defaultGitStatus.changes.removed),
    },
  }
}

/**
 * 将后端上下文状态转换为右侧展示结构。
 *
 * @param payload 后端上下文状态
 * @returns 上下文状态
 */
function mapContextUsage(payload: unknown): ContextUsage {
  if (!isRecord(payload)) {
    return defaultContextUsage
  }

  return {
    projectId: readString(payload, 'projectId'),
    conversationId: readString(payload, 'conversationId'),
    inputTokenMiss: readNumber(payload, 'inputTokenMiss', defaultContextUsage.inputTokenMiss),
    inputTokenHit: readNumber(payload, 'inputTokenHit', defaultContextUsage.inputTokenHit),
    outputToken: readNumber(payload, 'outputToken', defaultContextUsage.outputToken),
    cacheHitRate: readNumber(payload, 'cacheHitRate', defaultContextUsage.cacheHitRate),
    sessionTotalContext: readNumber(payload, 'sessionTotalContext', defaultContextUsage.sessionTotalContext),
    usedContext: readNumber(payload, 'usedContext', defaultContextUsage.usedContext),
    usageRate: readNumber(payload, 'usageRate', defaultContextUsage.usageRate),
  }
}

/**
 * 将后端弹窗 payload 转换为前端弹窗状态。
 *
 * @param payload 后端弹窗 payload
 * @param type 弹窗类型
 * @returns 前端弹窗状态
 */
function mapBridgePrompt(payload: unknown, type: BridgePromptState['type']): BridgePromptState | null {
  if (!isRecord(payload)) {
    return null
  }

  const options = readArray(payload, 'options')
    .filter(isRecord)
    .map((option) => ({
      value: readString(option, 'value', readString(option, 'label')),
      label: readString(option, 'label', readString(option, 'value')),
    }))

  return {
    type,
    promptId: readString(payload, 'promptId'),
    taskId: readString(payload, 'taskId'),
    title: readString(payload, 'title'),
    description: readString(payload, 'description'),
    options,
    allowCustomInput: Boolean(payload.allowCustomInput),
  }
}

/**
 * 管理 Harness 仪表盘页面的桥接状态与交互。
 *
 * @returns 页面渲染所需状态与桥接交互方法
 */
export function useHarnessDashboard() {
  /** 项目展开状态属于页面交互状态，复制一份避免直接修改静态配置。 */
  const projects = ref(projectItems.map((project) => ({ ...project, sessions: [...project.sessions] })))
  /** 右侧执行计划。 */
  const currentPlanSteps = ref([...planSteps])
  /** 中间工具执行记录。 */
  const currentToolExecutions = ref([...toolExecutions])
  /** 中间生成文件列表。 */
  const currentGeneratedFiles = ref([...generatedFiles])
  /** 右侧 Git 状态。 */
  const gitStatus = ref<GitStatus>({ ...defaultGitStatus, changes: { ...defaultGitStatus.changes } })
  /** 右侧上下文状态。 */
  const contextUsage = ref<ContextUsage>({ ...defaultContextUsage })
  /** 当前后端推送的审批或计划弹窗。 */
  const bridgePrompt = ref<BridgePromptState | null>(null)
  /** 当前项目编号。 */
  const activeProjectId = ref(projectItems[0]?.id || projectItems[0]?.name || '')
  /** 当前会话编号。 */
  const activeConversationId = ref(projectItems[0]?.sessions[0]?.id || projectItems[0]?.sessions[0]?.title || '')
  /** 取消注册后端推送事件的函数。 */
  let unregisterHarnessUI: (() => void) | undefined

  /**
   * 应用后端推送的全量快照。
   *
   * @param payload 全量快照
   */
  function applySnapshot(payload: unknown) {
    if (!isRecord(payload)) {
      return
    }

    if (Array.isArray(payload.projects)) {
      projects.value = payload.projects.map(mapProjectItem)
    }

    activeProjectId.value = readString(payload, 'activeProjectId', activeProjectId.value)
    activeConversationId.value = readString(payload, 'activeConversationId', activeConversationId.value)

    if (Array.isArray(payload.executionPlan)) {
      currentPlanSteps.value = payload.executionPlan.map(mapPlanStep)
    }

    if (Array.isArray(payload.toolExecutions)) {
      currentToolExecutions.value = payload.toolExecutions.map(mapToolExecution)
    }

    if (Array.isArray(payload.generatedFiles)) {
      currentGeneratedFiles.value = payload.generatedFiles.map(mapGeneratedFile)
    }

    if (payload.gitStatus) {
      gitStatus.value = mapGitStatus(payload.gitStatus)
    }

    if (payload.contextUsage) {
      contextUsage.value = mapContextUsage(payload.contextUsage)
    }
  }

  /**
   * 切换项目的会话展开状态，并通知后端。
   *
   * @param project 项目
   */
  function handleProjectToggle(project: ProjectItem) {
    project.expanded = !project.expanded
    void toggleProjectExpanded({
      projectId: project.id || project.name,
      expanded: project.expanded,
    })
  }

  /**
   * 处理左侧主导航动作。
   *
   * @param item 主导航项
   */
  function handlePrimaryAction(item: NavigationItem) {
    if (item.id === 'new-conversation') {
      void createConversation({
        projectId: activeProjectId.value,
        title: '新对话',
      })
      return
    }

    if (item.id === 'search') {
      void querySearch({
        keyword: '',
        scopes: ['project', 'conversation', 'message', 'file'],
      })
      return
    }

    if (item.id === 'plugins' || item.id === 'automation') {
      void openPanel({
        panel: item.id,
      })
    }
  }

  /**
   * 打开项目。
   *
   * @param project 项目
   */
  function handleOpenProject(project: ProjectItem) {
    activeProjectId.value = project.id || project.name
    void openProject({
      projectId: activeProjectId.value,
    })
  }

  /**
   * 打开会话。
   *
   * @param session 会话
   */
  function handleOpenSession(session: SessionItem) {
    activeConversationId.value = session.id || session.title
    void openConversation({
      conversationId: activeConversationId.value,
    })
  }

  /**
   * 处理左侧底部面板入口。
   *
   * @param item 底部操作项
   */
  function handleFooterAction(item: FooterItem) {
    if (!item.panel) {
      return
    }

    void openPanel({
      panel: item.panel,
    })
  }

  /**
   * 刷新当前会话。
   */
  function handleRefreshConversation() {
    void refreshConversation({
      conversationId: activeConversationId.value,
    })
  }

  /**
   * 获取当前会话更多操作。
   */
  function handleGetConversationActions() {
    void getConversationActions({
      conversationId: activeConversationId.value,
    })
  }

  /**
   * 记录消息复制行为。
   *
   * @param messageId 消息编号
   */
  function handleCopyMessage(messageId: string) {
    void copyMessage({
      conversationId: activeConversationId.value,
      messageId,
    })
  }

  /**
   * 打开生成文件。
   *
   * @param file 生成文件
   */
  function handleOpenGeneratedFile(file: GeneratedFile) {
    void openGeneratedFile({
      conversationId: activeConversationId.value,
      fileId: file.id || file.name,
    })
  }

  /**
   * 选择附件。
   */
  function handlePickAttachment() {
    void pickAttachment({
      conversationId: activeConversationId.value,
      accept: ['*'],
    })
  }

  /**
   * 选择上下文。
   */
  function handlePickContext() {
    void pickContext({
      conversationId: activeConversationId.value,
      keyword: '',
    })
  }

  /**
   * 选择工具。
   */
  function handlePickTool() {
    void pickTool({
      conversationId: activeConversationId.value,
      keyword: '',
    })
  }

  /**
   * 发送用户消息。
   *
   * @param payload 消息与运行配置
   */
  function handleSendMessage(payload: SendMessagePayload) {
    void sendConversationMessage({
      conversationId: activeConversationId.value,
      parentTaskId: '',
      content: payload.content,
      attachments: [],
      contextRefs: [],
      toolRefs: [],
      settings: payload.settings,
    })
  }

  /**
   * 更新运行配置。
   *
   * @param settings 运行配置
   */
  function handleRuntimeSettingsChange(settings: RuntimeSettingsPayload) {
    void updateRuntimeSettings({
      projectId: activeProjectId.value,
      conversationId: activeConversationId.value,
      ...settings,
    })
  }

  /**
   * 回复审批弹窗。
   *
   * @param payload 审批回复参数
   */
  function handleApprovalResponse(payload: ApprovalResponsePayload) {
    void respondApprovalPrompt(payload)
    bridgePrompt.value = null
  }

  /**
   * 回复计划弹窗。
   *
   * @param payload 计划回复参数
   */
  function handlePlanResponse(payload: PlanResponsePayload) {
    void respondPlanPrompt(payload)
    bridgePrompt.value = null
  }

  /**
   * 关闭当前弹窗。
   */
  function handlePromptClose() {
    bridgePrompt.value = null
  }

  onMounted(() => {
    unregisterHarnessUI = registerHarnessUI({
      'app.snapshot.updated': applySnapshot,
      'project.list.updated': (payload) => {
        if (isRecord(payload) && Array.isArray(payload.projects)) {
          projects.value = payload.projects.map(mapProjectItem)
          activeProjectId.value = readString(payload, 'activeProjectId', activeProjectId.value)
          activeConversationId.value = readString(payload, 'activeConversationId', activeConversationId.value)
        }
      },
      'execution.plan.updated': (payload) => {
        if (isRecord(payload) && Array.isArray(payload.steps)) {
          currentPlanSteps.value = payload.steps.map(mapPlanStep)
        }
      },
      'tool.execution.updated': (payload) => {
        if (isRecord(payload) && Array.isArray(payload.executions)) {
          currentToolExecutions.value = payload.executions.map(mapToolExecution)
        }
      },
      'generated.files.updated': (payload) => {
        if (isRecord(payload) && Array.isArray(payload.files)) {
          currentGeneratedFiles.value = payload.files.map(mapGeneratedFile)
        }
      },
      'git.status.updated': (payload) => {
        gitStatus.value = mapGitStatus(payload)
      },
      'context.usage.updated': (payload) => {
        contextUsage.value = mapContextUsage(payload)
      },
      'approval.prompt.show': (payload) => {
        bridgePrompt.value = mapBridgePrompt(payload, 'permission')
      },
      'plan.prompt.show': (payload) => {
        bridgePrompt.value = mapBridgePrompt(payload, 'plan')
      },
      'prompt.hide': () => {
        bridgePrompt.value = null
      },
    })

    void fetchAppSnapshot().then((response) => {
      if (response.success && response.data) {
        applySnapshot(response.data)
      }
    })
  })

  onBeforeUnmount(() => {
    unregisterHarnessUI?.()
  })

  return {
    navigationItems,
    projects,
    footerItems,
    features,
    planSteps: currentPlanSteps,
    toolExecutions: currentToolExecutions,
    generatedFiles: currentGeneratedFiles,
    sessionInfo,
    toolCalls,
    plugins,
    gitStatus,
    contextUsage,
    bridgePrompt,
    handleProjectToggle,
    handlePrimaryAction,
    handleOpenProject,
    handleOpenSession,
    handleFooterAction,
    handleRefreshConversation,
    handleGetConversationActions,
    handleCopyMessage,
    handleOpenGeneratedFile,
    handlePickAttachment,
    handlePickContext,
    handlePickTool,
    handleSendMessage,
    handleRuntimeSettingsChange,
    handleApprovalResponse,
    handlePlanResponse,
    handlePromptClose,
  }
}
