import {
  Blocks,
  CircleHelp,
  Info,
  Keyboard,
  MessageSquarePlus,
  Search,
  Settings,
  Workflow,
} from 'lucide-vue-next'

import type {
  DefinitionListItem,
  FooterItem,
  GeneratedFile,
  NavigationItem,
  PluginItem,
  ProjectItem,
  ToolCallItem,
  ToolExecution,
} from '@/types/business/harness'

/**
 * 侧边栏主导航。这里只保留静态入口，不放业务假数据。
 */
export const navigationItems: NavigationItem[] = [
  { id: 'new-conversation', icon: MessageSquarePlus, label: '新对话', shortcut: 'Ctrl+N' },
  { id: 'search', icon: Search, label: '搜索', shortcut: 'Ctrl+F' },
  { id: 'plugins', icon: Blocks, label: '插件' },
  { id: 'automation', icon: Workflow, label: '自动化' },
]

/**
 * 左侧底部静态入口。
 */
export const footerItems: FooterItem[] = [
  { id: 'settings', icon: Settings, label: '设置', panel: 'settings' },
  { id: 'shortcuts', icon: Keyboard, label: '快捷键', panel: 'shortcuts' },
  { id: 'help', icon: CircleHelp, label: '帮助', panel: 'help' },
  { id: 'about', icon: Info, label: '关于', panel: 'about' },
]

export const projectItems: ProjectItem[] = []
export const features: string[] = []
export const planSteps: string[] = []
export const toolExecutions: ToolExecution[] = []
export const generatedFiles: GeneratedFile[] = []
export const sessionInfo: DefinitionListItem[] = []
export const toolCalls: ToolCallItem[] = []
export const plugins: PluginItem[] = []
