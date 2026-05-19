<template>
  <section class="conversation-panel">
    <div class="conversation-header">
      <div class="conversation-title">
        <h1>{{ title }}</h1>
        <button class="edit-title" type="button" title="编辑标题">
          <Pencil class="button-icon" />
        </button>
      </div>

      <div class="header-tools">
        <button class="top-tool" title="同步" type="button">
          <RefreshCw class="button-icon" />
        </button>
        <button class="top-tool" title="更多" type="button">
          <MoreVertical class="button-icon" />
        </button>
      </div>
    </div>

    <section class="chat-scroll">
      <article class="message user-message">
        <div class="avatar user">
          <UserRound class="avatar-icon" />
        </div>
        <div class="message-body">
          <div class="message-title">
            <strong>你</strong>
            <time>09:45</time>
          </div>
          <p>
            帮我设计一个基于 Qt5 的 DeepSeek Harness GUI，替代当前复杂的 CLI，要求包含插件管理、工具调用、审批流程和内置 Web 预览能力。
          </p>
          <button class="message-copy" type="button" title="复制">
            <Copy class="button-icon" />
          </button>
        </div>
      </article>

      <article class="message assistant-message">
        <div class="avatar assistant">
          <Sparkles class="avatar-icon" />
        </div>
        <div class="message-body">
          <div class="message-title">
            <div class="assistant-title">
              <strong>DeepSeek Harness</strong>
              <time>09:45 · 已工作 3min 12s</time>
            </div>
          </div>
          <p>好的，我将为你设计一个基于 Qt5 的 DeepSeek Harness GUI。以下是整体方案与关键功能模块：</p>

          <ul class="feature-list">
            <li v-for="item in features" :key="item">
              <CheckCircle2 class="list-icon" />
              <span>{{ item }}</span>
            </li>
          </ul>

          <section class="execution-card">
            <div class="card-header">
              <ChevronDown class="button-icon" />
              <strong>工具执行</strong>
              <small>已处理 3m 12s</small>
            </div>
            <div v-for="tool in toolExecutions" :key="tool.name" class="tool-row">
              <Wrench class="file-icon" />
              <code>{{ tool.name }}</code>
              <span class="tool-command">{{ tool.detail }}</span>
              <strong :class="tool.state === '运行中' ? 'running' : 'success'">{{ tool.state }}</strong>
              <time>{{ tool.cost }}</time>
            </div>
          </section>

          <div class="generated-files">
            <span>生成了以下文件（12）</span>
            <div class="file-chip-row">
              <button v-for="file in generatedFiles" :key="file.name" class="file-chip" type="button">
                <FileText class="file-icon" />
                <strong>{{ file.name }}</strong>
                <small>{{ file.path }}</small>
              </button>
              <button class="file-chip more" type="button">+7</button>
            </div>
          </div>
        </div>
      </article>
    </section>

    <section class="composer">
      <section v-if="showApprovalPopover" class="approval-popover">
        <div class="approval-popover-header">
          <strong>{{ activePrompt.title }}</strong>
          <div class="prompt-tabs">
            <button
              v-for="prompt in promptModes"
              :key="prompt.type"
              type="button"
              :class="{ active: activePromptType === prompt.type }"
              @click="switchPromptType(prompt.type)"
            >
              {{ prompt.label }}
            </button>
          </div>
          <button class="popover-close" type="button" title="关闭" @click="showApprovalPopover = false">
            <X class="button-icon" />
          </button>
        </div>
        <p>{{ activePrompt.description }}</p>
        <div class="prompt-option-list">
          <button v-for="option in activePrompt.options" :key="option" class="prompt-option" type="button">
            {{ option }}
          </button>
        </div>
        <div v-if="activePromptType === 'plan'" class="custom-plan-row">
          <input placeholder="自定义输入" />
          <button type="button">发送</button>
        </div>
      </section>

      <textarea rows="4" placeholder="描述任务，或输入 / 命令..."></textarea>
      <div class="composer-tools">
        <div class="quick-icons">
          <button title="附加文件" type="button">
            <Paperclip class="button-icon" />
          </button>
          <button title="提及上下文" type="button">
            <AtSign class="button-icon" />
          </button>
          <button title="插入工具" type="button">
            <Blocks class="button-icon" />
          </button>
        </div>

        <div class="composer-actions">
          <div class="select-control approval-select" :class="{ open: openedMenu === 'approval' }">
            <button class="select-trigger" type="button" @click="toggleSelectMenu('approval')">
              <strong>{{ selectedApproval }}</strong>
              <ChevronDown class="button-icon" />
            </button>
            <div v-if="openedMenu === 'approval'" class="select-menu approval-menu">
              <strong class="select-menu-title">审批模式</strong>
              <button
                v-for="mode in approvalOptions"
                :key="mode"
                class="select-menu-item"
                type="button"
                @click="selectApproval(mode)"
              >
                <span>{{ mode }}</span>
                <Check v-if="selectedApproval === mode" class="button-icon" />
              </button>
            </div>
          </div>
          <div class="select-control intelligence-select" :class="{ open: openedMenu === 'intelligence' }">
            <button class="select-trigger intelligence-trigger" type="button" @click="toggleSelectMenu('intelligence')">
              <strong>{{ selectedModel }}</strong>
              <span>{{ selectedThinking }}</span>
              <ChevronDown class="button-icon" />
            </button>
            <div v-if="openedMenu === 'intelligence'" class="select-menu intelligence-menu">
              <div class="thinking-panel">
                <strong class="select-menu-title">智能</strong>
                <button
                  v-for="level in thinkingOptions"
                  :key="level"
                  class="select-menu-item thinking-item"
                  :class="{ active: selectedThinking === level }"
                  type="button"
                  @click="selectThinking(level)"
                >
                  <span>{{ level }}</span>
                  <Check v-if="selectedThinking === level" class="button-icon" />
                </button>
              </div>
              <div class="model-panel">
                <strong class="select-menu-title">模型</strong>
                <button
                  v-for="model in modelOptions"
                  :key="model"
                  class="select-menu-item model-item"
                  :class="{ active: selectedModel === model }"
                  type="button"
                  @click="selectModel(model)"
                >
                  <span>{{ model }}</span>
                  <Check v-if="selectedModel === model" class="button-icon" />
                </button>
              </div>
            </div>
          </div>
          <button class="send-button" type="button" title="发送">
            <img
              class="send-icon-image"
              src="https://upload.wikimedia.org/wikipedia/commons/5/59/Up_arrow_white.svg"
              alt="发送"
            />
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
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  FileText,
  MoreVertical,
  Paperclip,
  Pencil,
  RefreshCw,
  Sparkles,
  UserRound,
  Wrench,
  X,
} from 'lucide-vue-next'

import type { GeneratedFile, ToolExecution } from '@/types/business/harness'

defineProps<{
  /** 当前会话标题。 */
  title: string
  /** 助手回复中的功能点。 */
  features: string[]
  /** 计划步骤列表，仅由右侧计划面板展示。 */
  planSteps: string[]
  /** 工具执行记录。 */
  toolExecutions: ToolExecution[]
  /** 生成文件列表。 */
  generatedFiles: GeneratedFile[]
}>()

/** 审批模式下拉选项。 */
const approvalOptions = ['审批模式（推荐）', '完全访问权限'] as const

/** 模型下拉选项，顺序与产品菜单展示保持一致。 */
const modelOptions = ['ds-v4-flash', 'ds-v4-flash[1m]', 'ds-v4-pro', 'ds-v4-pro[1m]'] as const

/** 思考强度下拉选项。 */
const thinkingOptions = ['high', 'max'] as const

/** 弹窗模式配置，用于演示权限审批和计划选择。 */
const promptModes = [
  {
    type: 'permission',
    label: '审批权限',
    title: '需要审批权限',
    description: '当前操作需要你确认是否允许继续执行。',
    options: ['同意', '总是同意', '拒绝', '全部拒绝'],
  },
  {
    type: 'plan',
    label: '计划选择',
    title: '选择执行计划',
    description: '请选择一个计划方案，或在下方输入自定义计划。',
    options: ['A. 使用 xxx', 'B. 使用 asdfa', 'C. 自定义输入'],
  },
] as const

/** 当前打开的底部下拉菜单。 */
const openedMenu = ref<'approval' | 'intelligence' | ''>('')

/** 当前弹窗展示类型。 */
const activePromptType = ref<(typeof promptModes)[number]['type']>('plan')

/** 是否显示审批/计划弹窗。 */
const showApprovalPopover = ref(false)

/** 当前选中的审批模式。 */
const selectedApproval = ref<(typeof approvalOptions)[number]>('审批模式（推荐）')

/** 当前选中的模型。 */
const selectedModel = ref<(typeof modelOptions)[number]>('ds-v4-flash')

/** 当前选中的思考强度等级。 */
const selectedThinking = ref<(typeof thinkingOptions)[number]>('high')

/** 当前弹窗配置。 */
const activePrompt = computed(() => promptModes.find((prompt) => prompt.type === activePromptType.value) ?? promptModes[0])

/**
 * 切换弹窗展示类型。
 *
 * @param type 弹窗类型
 */
function switchPromptType(type: (typeof promptModes)[number]['type']) {
  activePromptType.value = type
}

/**
 * 切换指定下拉菜单的展开状态。
 *
 * @param menu 菜单标识
 */
function toggleSelectMenu(menu: 'approval' | 'intelligence') {
  openedMenu.value = openedMenu.value === menu ? '' : menu
}

/**
 * 选择审批模式并关闭菜单。
 *
 * @param mode 审批模式
 */
function selectApproval(mode: (typeof approvalOptions)[number]) {
  selectedApproval.value = mode
  openedMenu.value = ''
}

/**
 * 选择模型并关闭菜单。
 *
 * @param model 模型名称
 */
function selectModel(model: (typeof modelOptions)[number]) {
  selectedModel.value = model
}

/**
 * 选择思考强度等级并关闭菜单。
 *
 * @param level 思考强度等级
 */
function selectThinking(level: (typeof thinkingOptions)[number]) {
  selectedThinking.value = level
}
</script>

<style scoped lang="scss">
.conversation-panel {
  position: relative;
  min-width: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  overflow: hidden;
  border-radius: 1.125rem;
  background: rgb(24, 24, 24);
}

.conversation-header {
  position: relative;
  height: 4.5625rem;
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.conversation-title {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.conversation-header h1 {
  margin: 0;
  color: #f4f8fa;
}

.edit-title {
  color: #9aa7ae;
}

.header-tools {
  margin-left: auto;
  display: flex;
  gap: 0.375rem;
}

.chat-scroll {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  overflow-x: hidden;
  padding: 1.125rem 1.625rem;
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

.user-message .message-title {
  justify-content: flex-end;
  gap: 0.75rem;
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
.list-icon {
  width: 1rem;
  height: 1rem;
}

.avatar.user {
  background: rgba(34, 94, 148, 0.34);
  box-shadow: inset 0 0 0 1px rgba(89, 164, 226, 0.28);
}

.avatar.assistant {
  background: linear-gradient(145deg, #52cf9b, #238b70);
  color: #ffffff;
}

.message-title {
  display: flex;
  justify-content: space-between;
  color: #ecf4f7;
  margin-bottom: 0.5rem;
}

.assistant-title {
  display: inline-flex;
  align-items: baseline;
  gap: 0.625rem;
}

.message-title time {
  color: #8f9da5;
}

.message-body p {
  color: #d1dbe0;
  line-height: 1.72;
  margin: 0 0 0.8125rem;
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

.message-copy:hover {
  color: #d9e3e8;
  background: rgba(255, 255, 255, 0.08);
}

.feature-list {
  display: grid;
  gap: 0.5rem;
  margin: 0.9375rem 0 1.0625rem;
  padding: 0;
  list-style: none;
  color: #d6e0e4;
}

.feature-list li {
  display: flex;
  align-items: center;
  gap: 0.5625rem;
}

.feature-list .list-icon {
  color: #63d6ae;
  flex-shrink: 0;
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.card-header small {
  margin-left: auto;
  color: #92a0a8;
}

.tool-row {
  display: grid;
  grid-template-columns: 1.375rem 5.5rem minmax(0, 1fr) 3.625rem 2.75rem;
  align-items: center;
  gap: 0.625rem;
  min-height: 1.6875rem;
  padding: 0 0.75rem;
  color: #afbdc4;
}

.tool-row code {
  color: #d8e3e7;
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

.file-chip .file-icon {
  align-self: center;
}

.file-chip small {
  grid-column: 2;
  color: #87979f;
}

.file-chip.more {
  min-width: 3.25rem;
  place-items: center;
  display: inline-grid;
}

.composer {
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

.approval-popover-header strong {
  color: #f1f5f7;
}

.prompt-tabs {
  margin-left: auto;
  display: flex;
  gap: 0.25rem;
}

.popover-close {
  width: 1.875rem;
  height: 1.875rem;
  display: inline-grid;
  place-items: center;
  color: #aeb8be;
  border-radius: 0.625rem;
  background: rgba(255, 255, 255, 0.045);
}

.popover-close:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.09);
}

.prompt-tabs button {
  height: 1.625rem;
  padding: 0 0.5rem;
  color: #aeb8be;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.045);
}

.prompt-tabs button.active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.11);
}

.approval-popover p {
  margin: 0.375rem 0;
  color: #aeb9bf;
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

.prompt-option:hover {
  background: rgba(255, 255, 255, 0.08);
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

.custom-plan-row button {
  color: #ffffff;
  border-radius: 0.625rem;
  background: #3f8f67;
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
  margin-bottom: 0;
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

.select-control {
  position: relative;
  width: 11rem;
  flex: 0 0 11rem;
}

.select-control.intelligence-select {
  width: 12.75rem;
  flex-basis: 12.75rem;
}

.select-trigger {
  width: 100%;
  height: 2.75rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.75rem;
  color: #9fadb4;
  text-align: left;
  border-radius: 0.875rem;
  background: rgb(37, 37, 37);
}

.select-trigger strong {
  min-width: 0;
  overflow: hidden;
  color: #e4ecef;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.intelligence-trigger {
  grid-template-columns: minmax(0, 1fr) auto auto;
}

.intelligence-trigger span {
  color: #b0bac0;
  white-space: nowrap;
}

.select-control.open .select-trigger,
.select-trigger:hover {
  background: rgba(255, 255, 255, 0.07);
}

.select-menu {
  position: absolute;
  left: 0;
  bottom: calc(100% + 0.5rem);
  z-index: 12;
  width: max(100%, 12.5rem);
  padding: 0.625rem;
  border-radius: 0.75rem;
  color: #f0f3f5;
  background: rgb(37, 37, 37);
  box-shadow: 0 1rem 2.5rem rgba(0, 0, 0, 0.38);
}

.approval-menu {
  width: 16.5rem;
}

.intelligence-menu {
  left: auto;
  right: 0;
  width: 25.25rem;
  display: grid;
  grid-template-columns: 12.75rem 12.5rem;
  gap: 0.25rem;
  padding: 0;
  overflow: hidden;
  border-radius: 0.875rem;
  background: transparent;
  box-shadow: none;
}

.thinking-panel,
.model-panel {
  padding: 0.625rem;
  border-radius: 0.875rem;
  background: rgb(37, 37, 37);
  box-shadow: 0 1rem 2.5rem rgba(0, 0, 0, 0.38);
}

.thinking-panel {
  display: grid;
  align-content: start;
  gap: 0.125rem;
}

.model-panel {
  align-self: end;
}

.select-menu-title {
  display: block;
  padding: 0.25rem 0.25rem 0.5rem;
  color: #aab4ba;
}

.select-menu-item {
  width: 100%;
  min-height: 2rem;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.625rem;
  padding: 0 0.25rem;
  color: #f0f4f6;
  text-align: left;
  border-radius: 0.5rem;
}

.select-menu-item:hover {
  background: rgba(255, 255, 255, 0.07);
}

.thinking-item,
.model-item {
  min-height: 1.875rem;
  padding: 0 0.5rem;
}

.thinking-item.active,
.model-item.active {
  background: rgba(255, 255, 255, 0.1);
}

.send-button {
  flex: 0 0 2.75rem;
  width: 2.75rem;
  height: 2.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.875rem;
  background: rgb(37, 37, 37);
}

.send-button:hover {
  background: rgba(255, 255, 255, 0.08);
}

.send-icon-image {
  width: 1.75rem;
  height: 1.75rem;
  display: block;
}
</style>
