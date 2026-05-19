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
        </div>
      </article>

      <article class="message assistant-message">
        <div class="avatar assistant">
          <Sparkles class="avatar-icon" />
        </div>
        <div class="message-body">
          <div class="message-title">
            <strong>DeepSeek Harness</strong>
            <time>09:45</time>
          </div>
          <p>好的，我将为你设计一个基于 Qt5 的 DeepSeek Harness GUI。以下是整体方案与关键功能模块：</p>

          <ul class="feature-list">
            <li v-for="item in features" :key="item">
              <CheckCircle2 class="list-icon" />
              <span>{{ item }}</span>
            </li>
          </ul>

          <section class="plan-card">
            <div class="card-header">
              <ChevronDown class="button-icon" />
              <strong>已计划 5 个步骤</strong>
            </div>
            <ol>
              <li v-for="step in planSteps" :key="step">
                <CircleDot class="list-icon" />
                <span>{{ step }}</span>
              </li>
            </ol>
          </section>

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
      <textarea rows="3" placeholder="描述任务，或输入 / 命令..."></textarea>
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
        <label>
          <span>模型</span>
          <select>
            <option>DeepSeek-V3</option>
            <option>DeepSeek-R1</option>
          </select>
        </label>
        <label>
          <span>审批模式</span>
          <select>
            <option>审批模式（推荐）</option>
            <option>完全访问权限</option>
          </select>
        </label>
        <button class="send-button" type="button">
          发送
          <ChevronDown class="button-icon" />
        </button>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import {
  AtSign,
  Blocks,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  FileText,
  MoreVertical,
  Paperclip,
  Pencil,
  RefreshCw,
  Sparkles,
  UserRound,
  Wrench,
} from 'lucide-vue-next'

import type { GeneratedFile, ToolExecution } from '@/types/business/harness'

defineProps<{
  /** 当前会话标题 */
  title: string
  /** 助手回复中的功能点 */
  features: string[]
  /** 计划步骤列表 */
  planSteps: string[]
  /** 工具执行记录 */
  toolExecutions: ToolExecution[]
  /** 生成文件列表 */
  generatedFiles: GeneratedFile[]
}>()
</script>

<style scoped lang="scss">
.conversation-panel {
  position: relative;
  min-width: 0;
  display: grid;
  grid-template-rows: auto 1fr;
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
  min-height: 0;
  overflow: auto;
  padding: 1.125rem 1.625rem 11.875rem;
}

.message {
  display: grid;
  grid-template-columns: 2.4375rem minmax(0, 1fr);
  gap: 0.8125rem;
  margin-bottom: 1.4375rem;
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

.message-title time {
  color: #8f9da5;
}

.message-body p {
  color: #d1dbe0;
  line-height: 1.72;
  margin: 0 0 0.8125rem;
}

.feature-list {
  display: grid;
  gap: 0.5rem;
  margin: 0.9375rem 0 1.0625rem;
  padding: 0;
  list-style: none;
  color: #d6e0e4;
}

.feature-list li,
.plan-card li {
  display: flex;
  align-items: center;
  gap: 0.5625rem;
}

.feature-list .list-icon {
  color: #63d6ae;
  flex-shrink: 0;
}

.plan-card .list-icon {
  color: #69b8f0;
  flex-shrink: 0;
}

.plan-card,
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

.plan-card ol {
  display: grid;
  gap: 0.5625rem;
  margin: 0;
  padding: 0 0.9375rem 1rem;
  color: #b5c3c9;
  list-style: none;
}

.tool-row {
  display: grid;
  grid-template-columns: 1.375rem 6.5625rem minmax(10rem, 1fr) 4.0625rem 3rem;
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
  position: absolute;
  left: 1.5rem;
  right: 1.5rem;
  bottom: 1.125rem;
  z-index: 4;
  padding: 0.875rem;
  border-radius: 1.375rem;
  background: rgba(38, 38, 38, 0.98);
  box-shadow: 0 20px 55px rgba(0, 0, 0, 0.34);
}

.composer textarea {
  width: 100%;
  max-height: 6.875rem;
  resize: vertical;
  padding: 0.75rem;
  color: #e1eaee;
  border-radius: 1rem;
  outline: none;
  background: rgba(24, 24, 24, 0.86);
}

.composer textarea::placeholder {
  color: #8a989f;
}

.composer-tools {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  margin-top: 0.75rem;
}

.quick-icons {
  display: flex;
  gap: 0.5rem;
  margin-right: auto;
}

.quick-icons button {
  width: 2rem;
  height: 2rem;
  border-radius: 0.75rem;
  color: #b2c0c7;
  background: rgba(255, 255, 255, 0.045);
}

.composer label {
  width: 16.5625rem;
  height: 2.75rem;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.5625rem;
  padding: 0 0.75rem;
  border-radius: 0.875rem;
  color: #9fadb4;
  background: rgba(24, 24, 24, 0.72);
}

.composer select {
  min-width: 0;
  color: #e4ecef;
  outline: 0;
  background: transparent;
}

.send-button {
  width: 6.5rem;
  height: 2.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  border-radius: 0.875rem;
  background: linear-gradient(135deg, #45ba87, #2b9a78);
  color: #ffffff;
}

@media (max-width: 1440px) {
  .composer label {
    width: 13.125rem;
  }
}
</style>
