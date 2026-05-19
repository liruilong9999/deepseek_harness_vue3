import type { Component } from 'vue'

/**
 * 可渲染的图标组件。
 */
export type IconComponent = Component

/**
 * 侧边栏主导航项。
 */
export interface NavigationItem {
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
  /** 操作图标 */
  icon: IconComponent
  /** 操作名称 */
  label: string
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
  /** 文件名称 */
  name: string
  /** 文件所在目录 */
  path: string
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
