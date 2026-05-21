import type { Component } from 'vue'

export type IconComponent = Component

export interface NavigationItem {
  id?: string
  icon: IconComponent
  label: string
  shortcut?: string
  badge?: string
}

export interface SessionItem {
  id?: string
  title: string
  time: string
  active?: boolean
}

export interface ProjectItem {
  id?: string
  name: string
  path: string
  time: string
  active?: boolean
  expanded: boolean
  sessions: SessionItem[]
}

export interface FooterItem {
  id?: string
  icon: IconComponent
  label: string
  panel?: string
}

export interface ToolExecution {
  name: string
  detail: string
  state: '完成' | '运行中'
  cost: string
}

export interface GeneratedFile {
  id?: string
  name: string
  path: string
}

export interface ConversationMessage {
  id: string
  conversationId?: string
  role: 'system' | 'user' | 'assistant' | 'tool'
  authorName: string
  content: string
  createdAtText: string
  status?: string
  copyable?: boolean
}

export interface GitStatus {
  projectId?: string
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

export interface ContextUsage {
  projectId?: string
  conversationId?: string
  inputTokenMiss: number
  inputTokenHit: number
  outputToken: number
  cacheHitRate: number
  sessionTotalContext: number
  usedContext: number
  usageRate: number
}

export interface PromptOption {
  value: string
  label: string
}

export interface BridgePromptState {
  type: 'permission' | 'plan'
  promptId: string
  taskId?: string
  title: string
  description: string
  options: PromptOption[]
  allowCustomInput?: boolean
}

export interface DefinitionListItem {
  label: string
  value: string
}

export interface ToolCallItem {
  icon: IconComponent
  name: string
  desc: string
  time: string
  state: 'done' | 'active'
}

export interface PluginItem {
  name: string
  state: string
}
