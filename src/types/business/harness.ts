import type { Component } from 'vue'

/**
 * 可渲染的图标组件。
 */
export type IconComponent = Component

/**
 * 侧边栏主导航项。
 */
export interface NavigationItem {
  /** 导航唯一标识，用于桥接动作分发。 */
  id?: string
  /** 导航图标 */
  icon: IconComponent
  /** 导航名称 */
  label: string
  /** 快捷键提示 */
  shortcut?: string
  /** 角标数字或状态 */
  badge?: string
}

/**
 * 项目下的会话条目。
 */
export interface SessionItem {
  /** 会话唯一编号，由后端生成。 */
  id?: string
  /** 会话标题 */
  title: string
  /** 最近更新时间 */
  time: string
  /** 是否为当前选中会话 */
  active?: boolean
}

/**
 * 左侧项目条目。
 */
export interface ProjectItem {
  /** 项目唯一编号，由后端生成。 */
  id?: string
  /** 项目名称 */
  name: string
  /** 项目本地路径 */
  path: string
  /** 最近更新时间 */
  time: string
  /** 是否为当前选中项目 */
  active?: boolean
  /** 是否展开会话列表 */
  expanded: boolean
  /** 项目关联会话 */
  sessions: SessionItem[]
}

/**
 * 侧边栏底部操作项。
 */
export interface FooterItem {
  /** 操作唯一标识，用于桥接动作分发。 */
  id?: string
  /** 操作图标 */
  icon: IconComponent
  /** 操作名称 */
  label: string
  /** 对应后端面板名称。 */
  panel?: string
}

/**
 * 工具执行记录。
 */
export interface ToolExecution {
  /** 工具名称 */
  name: string
  /** 执行命令或说明 */
  detail: string
  /** 当前执行状态 */
  state: '完成' | '运行中'
  /** 执行耗时 */
  cost: string
}

/**
 * 生成文件信息。
 */
export interface GeneratedFile {
  /** 生成文件唯一编号，由后端生成。 */
  id?: string
  /** 文件名称 */
  name: string
  /** 文件所在目录 */
  path: string
}

/**
 * 右侧 Git 状态。
 */
export interface GitStatus {
  /** 项目唯一编号。 */
  projectId?: string
  /** 当前分支名称。 */
  branch: string
  /** 分支说明文案。 */
  branchLabel: string
  /** 提交状态文案。 */
  commitStatus: string
  /** 短提交哈希。 */
  shortCommit: string
  /** 文件变更数量。 */
  changes: {
    /** 新增文件数量。 */
    added: number
    /** 修改文件数量。 */
    modified: number
    /** 删除文件数量。 */
    removed: number
  }
}

/**
 * 右侧上下文用量状态。
 */
export interface ContextUsage {
  /** 项目唯一编号。 */
  projectId?: string
  /** 会话唯一编号。 */
  conversationId?: string
  /** 未命中缓存的输入 Token 数。 */
  inputTokenMiss: number
  /** 命中缓存的输入 Token 数。 */
  inputTokenHit: number
  /** 输出 Token 数。 */
  outputToken: number
  /** 缓存命中率，取值 0 到 1。 */
  cacheHitRate: number
  /** 会话总上下文。 */
  sessionTotalContext: number
  /** 已用上下文。 */
  usedContext: number
  /** 上下文占用率，取值 0 到 1。 */
  usageRate: number
}

/**
 * 审批或计划弹窗选项。
 */
export interface PromptOption {
  /** 后端识别值。 */
  value: string
  /** 前端展示文案。 */
  label: string
}

/**
 * 后端推送的审批或计划弹窗状态。
 */
export interface BridgePromptState {
  /** 弹窗类型。 */
  type: 'permission' | 'plan'
  /** 弹窗唯一编号。 */
  promptId: string
  /** 关联任务编号。 */
  taskId?: string
  /** 弹窗标题。 */
  title: string
  /** 弹窗说明。 */
  description: string
  /** 可选项列表。 */
  options: PromptOption[]
  /** 是否允许自定义输入。 */
  allowCustomInput?: boolean
}

/**
 * 右侧键值信息项。
 */
export interface DefinitionListItem {
  /** 字段名称 */
  label: string
  /** 字段值 */
  value: string
}

/**
 * 工具调用列表项。
 */
export interface ToolCallItem {
  /** 工具图标 */
  icon: IconComponent
  /** 工具名称 */
  name: string
  /** 工具说明 */
  desc: string
  /** 调用时间 */
  time: string
  /** 调用状态 */
  state: 'done' | 'active'
}

/**
 * 插件运行状态。
 */
export interface PluginItem {
  /** 插件名称 */
  name: string
  /** 插件状态 */
  state: string
}
