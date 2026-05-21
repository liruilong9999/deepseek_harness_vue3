import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

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
  pickProjectFolder,
  pickTool,
  querySearch,
  refreshAppScopes,
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
  BridgePromptState,
  ContextUsage,
  ConversationMessage,
  FooterItem,
  GeneratedFile,
  GitStatus,
  NavigationItem,
  ProjectItem,
  SessionItem,
  ToolExecution,
} from '@/types/business/harness'

type PayloadRecord = Record<string, unknown>

interface RuntimeSettingsPayload {
  approvalMode: string
  model: string
  thinkingStrength: string
}

interface SendMessagePayload {
  content: string
  settings: RuntimeSettingsPayload
}

interface ApprovalResponsePayload {
  promptId: string
  taskId?: string
  decision: string
}

interface PlanResponsePayload {
  promptId: string
  taskId?: string
  selectedValue: string
  customText?: string
}

const emptyGitStatus: GitStatus = {
  branch: '',
  branchLabel: '当前分支',
  commitStatus: '未获取',
  shortCommit: '',
  changes: {
    added: 0,
    modified: 0,
    removed: 0,
  },
}

const emptyContextUsage: ContextUsage = {
  inputTokenMiss: 0,
  inputTokenHit: 0,
  outputToken: 0,
  cacheHitRate: 0,
  sessionTotalContext: 0,
  usedContext: 0,
  usageRate: 0,
}

function isRecord(value: unknown): value is PayloadRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readString(payload: PayloadRecord, key: string, fallback = '') {
  const value = payload[key]
  return typeof value === 'string' ? value : fallback
}

function readNumber(payload: PayloadRecord, key: string, fallback = 0) {
  const value = payload[key]
  return typeof value === 'number' ? value : fallback
}

function readArray(payload: PayloadRecord, key: string) {
  const value = payload[key]
  return Array.isArray(value) ? value : []
}

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

function mapMessage(value: unknown): ConversationMessage {
  if (!isRecord(value)) {
    return {
      id: '',
      role: 'assistant',
      authorName: '',
      content: '',
      createdAtText: '',
    }
  }

  const role = readString(value, 'role', 'assistant')
  const normalizedRole = ['system', 'user', 'assistant', 'tool'].includes(role) ? role : 'assistant'

  return {
    id: readString(value, 'id'),
    conversationId: readString(value, 'conversationId'),
    role: normalizedRole as ConversationMessage['role'],
    authorName: readString(value, 'authorName'),
    content: readString(value, 'content'),
    createdAtText: readString(value, 'createdAtText'),
    status: readString(value, 'status'),
    copyable: value.copyable !== false,
  }
}

function mapPlanStep(value: unknown) {
  return isRecord(value) ? readString(value, 'title') : String(value)
}

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

function mapGitStatus(payload: unknown): GitStatus {
  if (!isRecord(payload)) {
    return { ...emptyGitStatus, changes: { ...emptyGitStatus.changes } }
  }

  const changes = isRecord(payload.changes) ? payload.changes : {}
  return {
    projectId: readString(payload, 'projectId'),
    branch: readString(payload, 'branch'),
    branchLabel: readString(payload, 'branchLabel', emptyGitStatus.branchLabel),
    commitStatus: readString(payload, 'commitStatus', emptyGitStatus.commitStatus),
    shortCommit: readString(payload, 'shortCommit'),
    changes: {
      added: readNumber(changes, 'added'),
      modified: readNumber(changes, 'modified'),
      removed: readNumber(changes, 'removed'),
    },
  }
}

function mapContextUsage(payload: unknown): ContextUsage {
  if (!isRecord(payload)) {
    return { ...emptyContextUsage }
  }

  return {
    projectId: readString(payload, 'projectId'),
    conversationId: readString(payload, 'conversationId'),
    inputTokenMiss: readNumber(payload, 'inputTokenMiss'),
    inputTokenHit: readNumber(payload, 'inputTokenHit'),
    outputToken: readNumber(payload, 'outputToken'),
    cacheHitRate: readNumber(payload, 'cacheHitRate'),
    sessionTotalContext: readNumber(payload, 'sessionTotalContext'),
    usedContext: readNumber(payload, 'usedContext'),
    usageRate: readNumber(payload, 'usageRate'),
  }
}

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

function replaceOrAppendMessage(messageList: ConversationMessage[], message: ConversationMessage) {
  const index = messageList.findIndex((item) => item.id === message.id)
  if (index >= 0) {
    messageList.splice(index, 1, { ...messageList[index], ...message })
    return
  }

  messageList.push(message)
}

export function useHarnessDashboard() {
  const projects = ref(projectItems.map((project) => ({ ...project, sessions: [...project.sessions] })))
  const currentPlanSteps = ref([...planSteps])
  const currentToolExecutions = ref([...toolExecutions])
  const currentGeneratedFiles = ref([...generatedFiles])
  const currentMessages = ref<ConversationMessage[]>([])
  const currentConversationTitle = ref('')
  const gitStatus = ref<GitStatus>({ ...emptyGitStatus, changes: { ...emptyGitStatus.changes } })
  const contextUsage = ref<ContextUsage>({ ...emptyContextUsage })
  const bridgePrompt = ref<BridgePromptState | null>(null)
  const activeProjectId = ref('')
  const activeConversationId = ref('')
  let unregisterHarnessUI: (() => void) | undefined

  const hasProject = computed(() => activeProjectId.value.trim().length > 0)

  function applyConversation(value: unknown) {
    if (!isRecord(value)) {
      currentConversationTitle.value = ''
      currentMessages.value = []
      currentToolExecutions.value = []
      currentGeneratedFiles.value = []
      return
    }

    currentConversationTitle.value = readString(value, 'title')
    currentMessages.value = readArray(value, 'messages').map(mapMessage).filter((message) => message.id && message.content)
    currentToolExecutions.value = readArray(value, 'toolExecutions').map(mapToolExecution)
    currentGeneratedFiles.value = readArray(value, 'generatedFiles').map(mapGeneratedFile)
  }

  function applySnapshot(payload: unknown) {
    if (!isRecord(payload)) {
      return
    }

    if (Array.isArray(payload.projects)) {
      projects.value = payload.projects.map(mapProjectItem)
    }

    activeProjectId.value = projects.value.length > 0 ? readString(payload, 'activeProjectId') : ''
    activeConversationId.value = readString(payload, 'activeConversationId')
    applyConversation(payload.conversation)

    currentPlanSteps.value = Array.isArray(payload.executionPlan) ? payload.executionPlan.map(mapPlanStep) : []
    currentToolExecutions.value =
      currentToolExecutions.value.length > 0
        ? currentToolExecutions.value
        : readArray(payload, 'toolExecutions').map(mapToolExecution)
    currentGeneratedFiles.value =
      currentGeneratedFiles.value.length > 0
        ? currentGeneratedFiles.value
        : readArray(payload, 'generatedFiles').map(mapGeneratedFile)
    gitStatus.value = mapGitStatus(payload.gitStatus)
    contextUsage.value = mapContextUsage(payload.contextUsage)
  }

  function applyProjectList(payload: unknown) {
    if (!isRecord(payload)) {
      return
    }

    if (Array.isArray(payload.projects)) {
      projects.value = payload.projects.map(mapProjectItem)
    }

    activeProjectId.value = readString(payload, 'activeProjectId', activeProjectId.value)
    activeConversationId.value = readString(payload, 'activeConversationId', activeConversationId.value)
  }

  function handleProjectToggle(project: ProjectItem) {
    project.expanded = !project.expanded
    void toggleProjectExpanded({
      projectId: project.id || project.path || project.name,
      expanded: project.expanded,
    })
  }

  function handlePickProjectFolder() {
    void pickProjectFolder({}).then((response) => {
      if (response.success && response.data) {
        applySnapshot(response.data)
      }

      if (response.success) {
        void fetchAppSnapshot().then((snapshotResponse) => {
          if (snapshotResponse.success && snapshotResponse.data) {
            applySnapshot(snapshotResponse.data)
          }
        })
      }
    })
  }

  function handleRefreshProjects() {
    void refreshAppScopes(['projects', 'conversation', 'plan', 'git', 'context']).then((response) => {
      if (response.success && response.data) {
        applySnapshot(response.data)
      }
    })
  }

  function handlePrimaryAction(item: NavigationItem) {
    if (item.id === 'new-conversation') {
      if (!hasProject.value) {
        handlePickProjectFolder()
        return
      }

      void createConversation({
        projectId: activeProjectId.value,
        title: '新对话',
      }).then((response) => {
        if (response.success && response.data) {
          applySnapshot(response.data)
        }
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
      void openPanel({ panel: item.id })
    }
  }

  function handleOpenProject(project: ProjectItem) {
    activeProjectId.value = project.id || project.path || project.name
    void openProject({
      projectId: activeProjectId.value,
    }).then((response) => {
      if (response.success && response.data) {
        applySnapshot(response.data)
      }
    })
  }

  function handleOpenSession(session: SessionItem) {
    activeConversationId.value = session.id || session.title
    void openConversation({
      conversationId: activeConversationId.value,
    }).then((response) => {
      if (response.success && response.data) {
        applySnapshot(response.data)
      }
    })
  }

  function handleFooterAction(item: FooterItem) {
    if (item.panel) {
      void openPanel({ panel: item.panel })
    }
  }

  function handleRefreshConversation() {
    if (!activeConversationId.value) {
      return
    }

    void refreshConversation({
      conversationId: activeConversationId.value,
    }).then((response) => {
      if (response.success && response.data) {
        applySnapshot(response.data)
      }
    })
  }

  function handleGetConversationActions() {
    if (!activeConversationId.value) {
      return
    }

    void getConversationActions({
      conversationId: activeConversationId.value,
    })
  }

  function handleCopyMessage(messageId: string) {
    void copyMessage({
      conversationId: activeConversationId.value,
      messageId,
    })
  }

  function handleOpenGeneratedFile(file: GeneratedFile) {
    void openGeneratedFile({
      conversationId: activeConversationId.value,
      fileId: file.id || file.name,
    })
  }

  function handlePickAttachment() {
    void pickAttachment({
      conversationId: activeConversationId.value,
      accept: ['*'],
    })
  }

  function handlePickContext() {
    void pickContext({
      conversationId: activeConversationId.value,
      keyword: '',
    })
  }

  function handlePickTool() {
    void pickTool({
      conversationId: activeConversationId.value,
      keyword: '',
    })
  }

  function handleSendMessage(payload: SendMessagePayload) {
    if (!activeConversationId.value) {
      return
    }

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

  function handleRuntimeSettingsChange(settings: RuntimeSettingsPayload) {
    void updateRuntimeSettings({
      projectId: activeProjectId.value,
      conversationId: activeConversationId.value,
      ...settings,
    })
  }

  function handleApprovalResponse(payload: ApprovalResponsePayload) {
    void respondApprovalPrompt(payload)
    bridgePrompt.value = null
  }

  function handlePlanResponse(payload: PlanResponsePayload) {
    void respondPlanPrompt(payload)
    bridgePrompt.value = null
  }

  function handlePromptClose() {
    bridgePrompt.value = null
  }

  onMounted(() => {
    unregisterHarnessUI = registerHarnessUI({
      'app.snapshot.updated': applySnapshot,
      'project.list.updated': applyProjectList,
      'conversation.active.changed': applySnapshot,
      'conversation.updated': (payload) => {
        if (isRecord(payload)) {
          applyConversation(payload.conversation)
        }
      },
      'conversation.message.started': (payload) => {
        if (isRecord(payload) && isRecord(payload.assistantMessage)) {
          replaceOrAppendMessage(currentMessages.value, mapMessage(payload.assistantMessage))
        }
      },
      'conversation.message.delta': (payload) => {
        if (!isRecord(payload)) {
          return
        }

        const messageId = readString(payload, 'assistantMessageId')
        const message = currentMessages.value.find((item) => item.id === messageId)
        if (message) {
          message.content = readString(payload, 'fullContent', message.content + readString(payload, 'delta'))
        }
      },
      'conversation.message.finished': (payload) => {
        if (!isRecord(payload)) {
          return
        }

        const messageId = readString(payload, 'assistantMessageId')
        const message = currentMessages.value.find((item) => item.id === messageId)
        if (message) {
          message.content = readString(payload, 'content', message.content)
          message.status = readString(payload, 'status', 'done')
        }
      },
      'conversation.message.failed': (payload) => {
        if (!isRecord(payload)) {
          return
        }

        const messageId = readString(payload, 'assistantMessageId')
        const message = currentMessages.value.find((item) => item.id === messageId)
        if (message) {
          message.content = readString(payload, 'message', message.content)
          message.status = readString(payload, 'status', 'error')
        }
      },
      'conversation.message.cancelled': (payload) => {
        if (!isRecord(payload)) {
          return
        }

        const messageId = readString(payload, 'assistantMessageId')
        const message = currentMessages.value.find((item) => item.id === messageId)
        if (message) {
          message.status = readString(payload, 'status', 'cancelled')
        }
      },
      'execution.plan.updated': (payload) => {
        currentPlanSteps.value = isRecord(payload) && Array.isArray(payload.steps) ? payload.steps.map(mapPlanStep) : []
      },
      'tool.execution.updated': (payload) => {
        currentToolExecutions.value =
          isRecord(payload) && Array.isArray(payload.executions) ? payload.executions.map(mapToolExecution) : []
      },
      'generated.files.updated': (payload) => {
        currentGeneratedFiles.value =
          isRecord(payload) && Array.isArray(payload.files) ? payload.files.map(mapGeneratedFile) : []
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
    messages: currentMessages,
    conversationTitle: currentConversationTitle,
    activeConversationId,
    sessionInfo,
    toolCalls,
    plugins,
    gitStatus,
    contextUsage,
    bridgePrompt,
    handleProjectToggle,
    handlePickProjectFolder,
    handleRefreshProjects,
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
