<template>
  <section class="conversation-panel">
    <div class="conversation-header">
      <div class="conversation-title">
        <h1>{{ title || '未选择会话' }}</h1>
      </div>

      <div class="header-tools">
        <button class="top-tool" title="刷新" type="button" :disabled="!hasConversation" @click="emit('refresh-conversation')">
          <RefreshCw class="button-icon" />
        </button>
        <button class="top-tool" title="更多" type="button" :disabled="!hasConversation" @click="emit('get-conversation-actions')">
          <MoreVertical class="button-icon" />
        </button>
      </div>
    </div>

    <section class="chat-scroll">
      <div v-if="messages.length === 0" class="chat-empty">
        <Sparkles class="empty-icon" />
        <strong>还没有消息</strong>
        <span>打开文件夹并新建会话后，在底部输入任务开始对话。</span>
      </div>

      <article v-for="message in messages" :key="message.id" class="message" :class="`${message.role}-message`">
        <div class="avatar" :class="message.role">
          <UserRound v-if="message.role === 'user'" class="avatar-icon" />
          <Wrench v-else-if="message.role === 'tool'" class="avatar-icon" />
          <Sparkles v-else class="avatar-icon" />
        </div>
        <div class="message-body">
          <div class="message-title">
            <strong>{{ message.authorName }}</strong>
            <time>{{ message.createdAtText }}</time>
          </div>
          <p>{{ message.content }}</p>
          <button
            v-if="message.copyable !== false"
            class="message-copy"
            type="button"
            title="复制"
            @click="emit('copy-message', message.id)"
          >
            <Copy class="button-icon" />
          </button>
        </div>
      </article>

      <section v-if="toolExecutions.length > 0" class="execution-card">
        <div class="card-header">
          <ChevronDown class="button-icon" />
          <strong>工具执行</strong>
        </div>
        <div v-for="tool in toolExecutions" :key="`${tool.name}-${tool.detail}-${tool.cost}`" class="tool-row">
          <Wrench class="file-icon" />
          <code>{{ tool.name }}</code>
          <span class="tool-command">{{ tool.detail }}</span>
          <strong :class="tool.state === '运行中' ? 'running' : 'success'">{{ tool.state }}</strong>
          <time>{{ tool.cost }}</time>
        </div>
      </section>

      <div v-if="generatedFiles.length > 0" class="generated-files">
        <span>生成文件</span>
        <div class="file-chip-row">
          <button
            v-for="file in generatedFiles"
            :key="file.id || `${file.path}/${file.name}`"
            class="file-chip"
            type="button"
            @click="emit('open-generated-file', file)"
          >
            <FileText class="file-icon" />
            <strong>{{ file.name }}</strong>
            <small>{{ file.path }}</small>
          </button>
        </div>
      </div>
    </section>

    <section class="composer">
      <section v-if="bridgePrompt" class="approval-popover">
        <div class="approval-popover-header">
          <strong>{{ bridgePrompt.title }}</strong>
          <button class="popover-close" type="button" title="关闭" @click="emit('prompt-close', bridgePrompt.promptId)">
            <X class="button-icon" />
          </button>
        </div>
        <p>{{ bridgePrompt.description }}</p>
        <div class="prompt-option-list">
          <button v-for="option in bridgePrompt.options" :key="option.value" class="prompt-option" type="button" @click="handlePromptOption(option)">
            {{ option.label }}
          </button>
        </div>
        <div v-if="bridgePrompt.type === 'plan' && bridgePrompt.allowCustomInput" class="custom-plan-row">
          <input v-model="customPlanText" placeholder="自定义计划..." />
          <button type="button" @click="handleCustomPlanSend">发送</button>
        </div>
      </section>

      <textarea
        v-model="composerText"
        rows="4"
        :disabled="!hasConversation"
        :placeholder="hasConversation ? '描述任务，或输入 / 命令...' : '请先打开文件夹并新建会话'"
        @keydown.ctrl.enter.prevent="handleSendMessage"
      ></textarea>
      <div class="composer-tools">
        <div class="quick-icons">
          <button title="附加文件" type="button" :disabled="!hasConversation" @click="emit('pick-attachment')">
            <Paperclip class="button-icon" />
          </button>
          <button title="提及上下文" type="button" :disabled="!hasConversation" @click="emit('pick-context')">
            <AtSign class="button-icon" />
          </button>
          <button title="插入工具" type="button" :disabled="!hasConversation" @click="emit('pick-tool')">
            <Blocks class="button-icon" />
          </button>
        </div>

        <div class="composer-actions">
          <select v-model="selectedApproval" @change="emitRuntimeSettings">
            <option value="approval_recommended">审批模式（推荐）</option>
            <option value="full_access">完全访问权限</option>
          </select>
          <select v-model="selectedModel" @change="emitRuntimeSettings">
            <option value="deepseek-chat">deepseek-chat</option>
            <option value="deepseek-reasoner">deepseek-reasoner</option>
          </select>
          <select v-model="selectedThinking" @change="emitRuntimeSettings">
            <option value="high">high</option>
            <option value="max">max</option>
          </select>
          <button class="send-button" type="button" title="发送" :disabled="!canSend" @click="handleSendMessage">
            <SendHorizontal class="send-icon" />
          </button>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import {
  AtSign,
  Blocks,
  ChevronDown,
  Copy,
  FileText,
  MoreVertical,
  Paperclip,
  RefreshCw,
  SendHorizontal,
  Sparkles,
  UserRound,
  Wrench,
  X,
} from 'lucide-vue-next'

import type {
  BridgePromptState,
  ConversationMessage,
  GeneratedFile,
  PromptOption,
  ToolExecution,
} from '@/types/business/harness'

const props = defineProps<{
  /** 当前会话标题。 */
  title: string
  /** 当前会话编号。 */
  conversationId: string
  /** 后端消息列表。 */
  messages: ConversationMessage[]
  /** 工具执行记录。 */
  toolExecutions: ToolExecution[]
  /** 生成文件列表。 */
  generatedFiles: GeneratedFile[]
  /** 后端推送的审批或计划弹窗。 */
  bridgePrompt: BridgePromptState | null
}>()

const emit = defineEmits<{
  'refresh-conversation': []
  'get-conversation-actions': []
  'copy-message': [messageId: string]
  'open-generated-file': [file: GeneratedFile]
  'pick-attachment': []
  'pick-context': []
  'pick-tool': []
  'send-message': [payload: { content: string; settings: RuntimeSettingsPayload }]
  'runtime-settings-change': [settings: RuntimeSettingsPayload]
  'approval-response': [payload: { promptId: string; taskId?: string; decision: string }]
  'plan-response': [payload: { promptId: string; taskId?: string; selectedValue: string; customText?: string }]
  'prompt-close': [promptId?: string]
}>()

interface RuntimeSettingsPayload {
  approvalMode: string
  model: string
  thinkingStrength: string
}

const composerText = ref('')
const customPlanText = ref('')
const selectedApproval = ref('approval_recommended')
const selectedModel = ref('deepseek-chat')
const selectedThinking = ref('high')

const hasConversation = computed(() => props.conversationId.trim().length > 0)
const canSend = computed(() => hasConversation.value && composerText.value.trim().length > 0)

const runtimeSettings = computed<RuntimeSettingsPayload>(() => ({
  approvalMode: selectedApproval.value,
  model: selectedModel.value,
  thinkingStrength: selectedThinking.value,
}))

function emitRuntimeSettings() {
  emit('runtime-settings-change', runtimeSettings.value)
}

function handleSendMessage() {
  const content = composerText.value.trim()
  if (!content || !hasConversation.value) {
    return
  }

  emit('send-message', {
    content,
    settings: runtimeSettings.value,
  })
  composerText.value = ''
}

function handlePromptOption(option: PromptOption) {
  const prompt = props.bridgePrompt
  if (!prompt) {
    return
  }

  if (prompt.type === 'permission') {
    emit('approval-response', {
      promptId: prompt.promptId,
      taskId: prompt.taskId,
      decision: option.value,
    })
    return
  }

  if (option.value !== 'custom') {
    emit('plan-response', {
      promptId: prompt.promptId,
      taskId: prompt.taskId,
      selectedValue: option.value,
    })
  }
}

function handleCustomPlanSend() {
  const prompt = props.bridgePrompt
  const customText = customPlanText.value.trim()
  if (!prompt || prompt.type !== 'plan') {
    return
  }

  emit('plan-response', {
    promptId: prompt.promptId,
    taskId: prompt.taskId,
    selectedValue: 'custom',
    customText,
  })
  customPlanText.value = ''
}
</script>

<style scoped lang="scss">
.conversation-panel {
  min-width: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  overflow: hidden;
  border-radius: 1.125rem;
  background: rgb(24, 24, 24);
}

.conversation-header {
  height: 4.5625rem;
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  background: rgb(26, 34, 39);
}

.conversation-title h1 {
  margin: 0;
  color: #f4f8fa;
}

.header-tools {
  margin-left: auto;
  display: flex;
  gap: 0.375rem;
}

.top-tool {
  width: 2.5rem;
  height: 2.5rem;
  display: inline-grid;
  place-items: center;
  color: #c7d1d6;
  border-radius: 0.875rem;
  background: rgba(255, 255, 255, 0.055);
}

.top-tool:disabled,
.send-button:disabled,
.quick-icons button:disabled,
textarea:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.chat-scroll {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  overflow-x: hidden;
  padding: 1.125rem 1.625rem;
}

.chat-empty {
  height: 100%;
  min-height: 18rem;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 0.5rem;
  color: #91a0a8;
  text-align: center;
}

.empty-icon {
  width: 2.25rem;
  height: 2.25rem;
  color: #63d6ae;
}

.chat-empty strong {
  color: #dce7eb;
}

.message {
  display: grid;
  grid-template-columns: 2.4375rem minmax(0, 1fr);
  gap: 0.8125rem;
  margin-bottom: 1.4375rem;
}

.user-message {
  grid-template-columns: minmax(0, 1fr) 2.4375rem;
}

.user-message .avatar {
  grid-column: 2;
}

.user-message .message-body {
  grid-column: 1;
  grid-row: 1;
  text-align: right;
}

.avatar {
  width: 2.25rem;
  height: 2.25rem;
  display: grid;
  place-items: center;
  border-radius: 999px;
}

.avatar-icon,
.button-icon,
.file-icon,
.send-icon {
  width: 1rem;
  height: 1rem;
}

.avatar.user {
  background: rgba(34, 94, 148, 0.34);
}

.avatar.assistant {
  background: linear-gradient(145deg, #52cf9b, #238b70);
  color: #ffffff;
}

.avatar.system,
.avatar.tool {
  background: rgba(255, 255, 255, 0.075);
}

.message-title {
  display: flex;
  gap: 0.625rem;
  color: #ecf4f7;
  margin-bottom: 0.5rem;
}

.user-message .message-title {
  justify-content: flex-end;
}

.message-title time {
  color: #8f9da5;
}

.message-body p {
  color: #d1dbe0;
  line-height: 1.72;
  margin: 0 0 0.8125rem;
  white-space: pre-wrap;
}

.message-copy {
  width: 2rem;
  height: 2rem;
  display: inline-grid;
  place-items: center;
  border-radius: 0.75rem;
  color: #9daab1;
  background: rgba(255, 255, 255, 0.045);
}

.execution-card {
  width: min(620px, 100%);
  margin: 0.875rem 0;
  border-radius: 1rem;
  background: rgba(33, 33, 33, 0.86);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.5625rem;
  padding: 0.6875rem 0.8125rem;
}

.tool-row {
  display: grid;
  grid-template-columns: 1.375rem 5.5rem minmax(0, 1fr) 3.625rem 2.75rem;
  align-items: center;
  gap: 0.625rem;
  min-height: 1.6875rem;
  padding: 0 0.75rem 0.375rem;
  color: #afbdc4;
}

.tool-command {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.success {
  color: #54ce77;
}

.running {
  color: #f0aa42;
}

.generated-files {
  margin-top: 0.875rem;
  color: #b7c4ca;
}

.file-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5625rem;
  margin-top: 0.625rem;
}

.file-chip {
  min-width: 8.25rem;
  display: grid;
  grid-template-columns: 1.125rem 1fr;
  gap: 0.125rem 0.4375rem;
  padding: 0.625rem;
  text-align: left;
  border-radius: 0.875rem;
  background: rgba(38, 38, 38, 0.92);
}

.file-chip small {
  grid-column: 2;
  color: #87979f;
}

.composer {
  position: sticky;
  bottom: 0;
  min-width: 0;
  margin: 0 1rem 0.3125rem;
  z-index: 4;
  display: flex;
  flex-direction: column;
  padding: 0.75rem 0.75rem 0.375rem;
  border-radius: 1.375rem;
  background: rgb(37, 37, 37);
  box-shadow: 0 20px 55px rgba(0, 0, 0, 0.34);
}

.approval-popover {
  width: 100%;
  margin-bottom: 0.5rem;
  padding: 0.625rem;
  border-radius: 1rem;
  background: rgb(37, 37, 37);
}

.approval-popover-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.popover-close {
  width: 1.875rem;
  height: 1.875rem;
  color: #aeb8be;
  border-radius: 0.625rem;
  background: rgba(255, 255, 255, 0.045);
}

.prompt-option-list {
  display: grid;
  gap: 0.1875rem;
}

.prompt-option {
  min-height: 1.875rem;
  padding: 0 0.625rem;
  color: #edf3f6;
  text-align: left;
  border-radius: 0.625rem;
  background: rgba(24, 24, 24, 0.46);
}

.custom-plan-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 4.25rem;
  gap: 0.375rem;
  margin-top: 0.375rem;
}

.custom-plan-row input {
  min-width: 0;
  height: 2rem;
  padding: 0 0.625rem;
  color: #e7eef2;
  outline: 0;
  border-radius: 0.625rem;
  background: rgba(24, 24, 24, 0.46);
}

.composer textarea {
  width: 100%;
  min-height: 5.125rem;
  max-height: 8.5rem;
  resize: vertical;
  padding: 0.875rem;
  color: #e1eaee;
  border-radius: 1rem;
  outline: none;
  background: rgb(24, 24, 24);
}

.composer textarea::placeholder {
  color: #8a989f;
}

.composer-tools {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.875rem;
}

.quick-icons {
  flex-shrink: 0;
  display: flex;
  gap: 0.375rem;
}

.quick-icons button {
  width: 2rem;
  height: 2rem;
  border-radius: 0.75rem;
  color: #b2c0c7;
  background: rgba(255, 255, 255, 0.045);
}

.composer-actions {
  min-width: 0;
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
}

.composer-actions select {
  height: 2.5rem;
  max-width: 12rem;
  color: #dce7eb;
  border: 0;
  outline: 0;
  border-radius: 0.75rem;
  background: rgb(37, 37, 37);
}

.send-button {
  flex: 0 0 2.75rem;
  width: 2.75rem;
  height: 2.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #151515;
  border-radius: 0.875rem;
  background: #dce7eb;
}
</style>
