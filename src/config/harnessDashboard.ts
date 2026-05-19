import {
  Blocks,
  CircleHelp,
  FilePenLine,
  Globe,
  Info,
  Keyboard,
  MessageSquarePlus,
  Search,
  Settings,
  Terminal,
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
 * 侧边栏主导航演示数据。
 */
export const navigationItems: NavigationItem[] = [
  { icon: MessageSquarePlus, label: '新对话', shortcut: 'Ctrl+N' },
  { icon: Search, label: '搜索', shortcut: 'Ctrl+F' },
  { icon: Blocks, label: '插件', badge: '12' },
  { icon: Workflow, label: '自动化', badge: '3' },
]

/**
 * 项目与会话演示数据。
 */
export const projectItems: ProjectItem[] = [
  {
    name: 'deepseek-harness-gui',
    path: 'D:\\work\\deepseek-harness-gui',
    time: '',
    active: true,
    expanded: true,
    sessions: [
      { title: '设计 DeepSeek Harness GUI 方案', time: '09:45', active: true },
      { title: '集成 ChannelJS 插件机制', time: '昨天' },
      { title: '修复 WebEngine 崩溃问题', time: '昨天' },
      { title: '实现沙箱执行安全策略', time: '5月23日' },
    ],
  },
  {
    name: 'DeepSeek-Toolkit',
    path: 'D:\\work\\DeepSeek-Toolkit',
    time: '09:21',
    expanded: false,
    sessions: [
      { title: '工具注册表重构', time: '09:21' },
      { title: '模型请求流式输出', time: '昨天' },
    ],
  },
  {
    name: 'ChannelJS',
    path: 'D:\\work\\ChannelJS',
    time: '昨天',
    expanded: false,
    sessions: [
      { title: '桥接协议设计', time: '昨天' },
      { title: 'WebChannel 对象暴露', time: '2天前' },
    ],
  },
  {
    name: 'QtComponents',
    path: 'D:\\work\\QtComponents',
    time: '2天前',
    expanded: false,
    sessions: [
      { title: '窗口控件样式统一', time: '2天前' },
      { title: '深色主题变量整理', time: '3天前' },
    ],
  },
  {
    name: 'Harness-Scripts',
    path: 'D:\\work\\Harness-Scripts',
    time: '3天前',
    expanded: false,
    sessions: [
      { title: '构建发布包与打包脚本', time: '3天前' },
      { title: '添加自动化工作流', time: '5月21日' },
    ],
  },
]

/**
 * 侧边栏底部操作演示数据。
 */
export const footerItems: FooterItem[] = [
  { icon: Settings, label: '设置' },
  { icon: Keyboard, label: '快捷键' },
  { icon: CircleHelp, label: '帮助' },
  { icon: Info, label: '关于' },
]

/**
 * 助手回复功能点演示数据。
 */
export const features = [
  '三栏式布局：会话列表 / 工作区 / 右侧检查面板',
  '插件管理：管理已安装插件、启用 / 禁用、配置权限',
  '工具调用：显示调用历史与实时状态',
  '审批流程：高风险操作需用户确认',
  'Web 预览：基于 QtWebEngine，用于渲染 Vue 应用或文档预览',
  '主题与设置：深色主题、快捷键、自定义代理与模型',
]

/**
 * 执行计划演示数据。
 */
export const planSteps = [
  '初始化 Qt5 项目结构',
  '搭建三栏主界面与基础导航',
  '实现会话与消息模型',
  '集成工具调用与审批流程',
  '嵌入 WebEngine 预览与插件管理界面',
]

/**
 * 工具执行演示数据。
 */
export const toolExecutions: ToolExecution[] = [
  { name: 'run_shell', detail: 'mkdir -p src/{ui,core,models,services,plugins}', state: '完成', cost: '0.3s' },
  { name: 'apply_patch', detail: '创建主窗口与侧栏布局文件', state: '完成', cost: '1.2s' },
  { name: 'read_file', detail: '读取项目配置 qmake.pro', state: '完成', cost: '0.1s' },
  { name: 'web_run', detail: '启动本地预览 http://127.0.0.1:8080', state: '运行中', cost: '1.5s' },
]

/**
 * 生成文件演示数据。
 */
export const generatedFiles: GeneratedFile[] = [
  { name: 'main.cpp', path: 'src/' },
  { name: 'MainWindow.cpp', path: 'src/ui/' },
  { name: 'MainWindow.h', path: 'src/ui/' },
  { name: 'Sidebar.cpp', path: 'src/ui/' },
  { name: 'ChatView.cpp', path: 'src/ui/' },
]

/**
 * 当前会话信息演示数据。
 */
export const sessionInfo: DefinitionListItem[] = [
  { label: '会话 ID', value: '7f3c2e91-9b7f-4f1a-9d43' },
  { label: '工作目录', value: 'D:\\work\\deepseek-harness-gui' },
  { label: '当前模型', value: 'DeepSeek-V3（32K）' },
  { label: '创建时间', value: '2025-05-24 09:45:12' },
  { label: '会话时长', value: '3m 12s' },
]

/**
 * 工具调用演示数据。
 */
export const toolCalls: ToolCallItem[] = [
  { icon: FilePenLine, name: 'read_file', desc: '读取文件', time: '09:45:15', state: 'done' },
  { icon: Terminal, name: 'run_shell', desc: '运行命令', time: '09:45:16', state: 'done' },
  { icon: Globe, name: 'web_run', desc: '启动 Web 预览', time: '09:47:02', state: 'active' },
  { icon: FilePenLine, name: 'apply_patch', desc: '应用补丁', time: '09:45:20', state: 'done' },
]

/**
 * 插件状态演示数据。
 */
export const plugins: PluginItem[] = [
  { name: 'Harness 核心服务', state: '运行中' },
  { name: 'Tools 工具调用', state: '运行中' },
  { name: 'ChannelJS 消息通道', state: '已连接' },
  { name: 'WebEngine 预览', state: '运行中' },
]
