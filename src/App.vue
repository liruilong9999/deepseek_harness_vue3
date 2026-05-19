<template>
  <main class="app-shell">
    <header class="title-bar">
      <section class="brand-area">
        <span class="brand-mark">D</span>
        <strong>DeepSeek Harness 助手</strong>
        <span class="version">v1.2.0</span>
      </section>

      <section class="window-status">
        <span class="connected-dot"></span>
        <span>服务已连接</span>
        <button class="top-tool" title="更多" type="button">⌄</button>
        <button class="window-button" title="最小化" type="button">−</button>
        <button class="window-button" title="最大化" type="button">□</button>
        <button class="window-button" title="还原" type="button">◱</button>
        <button class="window-button close" title="关闭" type="button">×</button>
      </section>
    </header>

    <section class="workspace">
      <aside class="sidebar">
        <div class="sidebar-scroll">
          <nav class="primary-actions">
            <button v-for="item in navigationItems" :key="item.label" class="nav-action" type="button">
              <span class="nav-icon">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
              <kbd v-if="item.shortcut">{{ item.shortcut }}</kbd>
              <span v-if="item.badge" class="badge">{{ item.badge }}</span>
            </button>
          </nav>

          <section class="sidebar-section">
            <div class="section-title">
              <span>项目</span>
              <div class="section-actions">
                <button class="mini-button" title="新增项目" type="button">＋</button>
                <button class="mini-button" title="刷新项目" type="button">⟳</button>
              </div>
            </div>

            <div class="project-list">
              <template v-for="project in projects" :key="project.name">
                <article
                  class="project-item"
                  :class="{ active: project.active }"
                  @click="toggleProject(project)"
                >
                  <span class="folder-icon">▣</span>
                  <div class="project-meta">
                    <strong>{{ project.name }}</strong>
                    <small>{{ project.path }}</small>
                  </div>
                  <time>{{ project.time }}</time>
                  <button class="project-toggle" type="button" @click.stop="toggleProject(project)">
                    {{ project.expanded ? '⌃' : '⌄' }}
                  </button>
                </article>

                <div v-if="project.expanded" class="project-sessions">
                  <button
                    v-for="session in project.sessions"
                    :key="session.title"
                    class="project-session"
                    :class="{ active: session.active }"
                    type="button"
                  >
                    <span class="session-state">✓</span>
                    <span>{{ session.title }}</span>
                    <time>{{ session.time }}</time>
                  </button>
                </div>
              </template>
            </div>
          </section>
        </div>

        <footer class="sidebar-footer">
          <button v-for="item in footerItems" :key="item.label" type="button">
            <span>{{ item.icon }}</span>
            {{ item.label }}
          </button>
        </footer>
      </aside>

      <section class="conversation-panel">
        <div class="conversation-header">
          <div class="conversation-title">
            <h1>设计 DeepSeek Harness GUI 方案</h1>
            <button class="edit-title" type="button" title="编辑标题">✎</button>
          </div>

          <nav class="content-tabs">
            <button v-for="tab in tabs" :key="tab" :class="{ active: tab === '对话' }" type="button">
              {{ tab }}
            </button>
          </nav>

          <div class="header-tools">
            <button class="top-tool" title="同步" type="button">◎</button>
            <button class="top-tool" title="更多" type="button">⋮</button>
          </div>
        </div>

        <section class="chat-scroll">
          <article class="message user-message">
            <div class="avatar user">U</div>
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
            <div class="avatar assistant">✦</div>
            <div class="message-body">
              <div class="message-title">
                <strong>DeepSeek Harness</strong>
                <time>09:45</time>
              </div>
              <p>好的，我将为你设计一个基于 Qt5 的 DeepSeek Harness GUI。以下是整体方案与关键功能模块：</p>

              <ul class="feature-list">
                <li v-for="item in features" :key="item">{{ item }}</li>
              </ul>

              <section class="plan-card">
                <div class="card-header">
                  <span>⌄</span>
                  <strong>已计划 5 个步骤</strong>
                </div>
                <ol>
                  <li v-for="step in planSteps" :key="step">⊙ {{ step }}</li>
                </ol>
              </section>

              <section class="execution-card">
                <div class="card-header">
                  <span>⌄</span>
                  <strong>工具执行</strong>
                  <small>已处理 3m 12s</small>
                </div>
                <div v-for="tool in toolExecutions" :key="tool.name" class="tool-row">
                  <span class="file-icon">▧</span>
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
                    <span>▧</span>
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
              <button title="附加文件" type="button">⌘</button>
              <button title="提及上下文" type="button">@</button>
              <button title="插入工具" type="button">▦</button>
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
            <button class="send-button" type="button">发送 <span>⌄</span></button>
          </div>
        </section>
      </section>

      <aside class="inspector">
        <section class="panel-card session-card">
          <div class="panel-title">
            <strong>☑ 当前会话</strong>
          </div>
          <dl>
            <template v-for="item in sessionInfo" :key="item.label">
              <dt>{{ item.label }}</dt>
              <dd>{{ item.value }}</dd>
            </template>
          </dl>
        </section>

        <section class="panel-card">
          <div class="panel-title">
            <strong>▣ 工具调用</strong>
            <button type="button">查看全部 ›</button>
          </div>
          <div class="call-list">
            <article v-for="call in toolCalls" :key="call.name" class="call-item">
              <span>{{ call.icon }}</span>
              <strong>{{ call.name }}</strong>
              <small>{{ call.desc }}</small>
              <time>{{ call.time }}</time>
              <i :class="call.state"></i>
            </article>
          </div>
          <footer>共 8 次调用</footer>
        </section>

        <section class="panel-card approval-card">
          <div class="panel-title">
            <strong>☑ 审批请求（1）</strong>
            <button type="button">⌃</button>
          </div>
          <strong>apply_patch</strong>
          <p>修改 4 个文件，新增 3 个文件</p>
          <span>风险等级：<b>中</b></span>
          <div class="approval-actions">
            <button class="approve" type="button">批准</button>
            <button class="reject" type="button">拒绝</button>
          </div>
          <a href="#">查看详情</a>
        </section>

        <section class="panel-card git-card">
          <div class="panel-title">
            <strong>⌘ Git 状态</strong>
            <button type="button">⌃</button>
          </div>
          <div class="git-row">
            <span>main</span>
            <small>当前分支</small>
            <strong>已提交</strong>
            <code>a1b2c3d</code>
          </div>
          <div class="change-meter">
            <span>变更文件</span>
            <b class="add">+12</b>
            <b>~4</b>
            <b class="remove">−1</b>
            <div class="meter-track"><i></i></div>
          </div>
          <button class="ghost-button" type="button">查看 Git 面板</button>
        </section>

        <section class="panel-card plugin-card">
          <div class="panel-title">
            <strong>◇ 配置与插件</strong>
            <button type="button">⌃</button>
          </div>
          <article v-for="plugin in plugins" :key="plugin.name">
            <span>◉</span>
            <strong>{{ plugin.name }}</strong>
            <em>{{ plugin.state }}</em>
          </article>
          <footer>
            <a href="#">插件中心 ›</a>
            <a href="#">全部配置 ›</a>
          </footer>
        </section>

        <section class="panel-card web-preview">
          <div class="panel-title">
            <strong>◎ Web 预览</strong>
            <button type="button">⌃</button>
          </div>
          <div class="browser-bar">
            <span>‹</span>
            <span>›</span>
            <span>⟳</span>
            <div>http://127.0.0.1:8080</div>
            <span>⌂</span>
          </div>
          <div class="preview-frame">
            <aside>
              <strong>DeepSeek Harness</strong>
              <span class="active">概览</span>
              <span>会话</span>
              <span>插件</span>
              <span>设置</span>
            </aside>
            <section>
              <h2>仪表盘</h2>
              <div class="metric-grid">
                <div><b>128</b><span>会话数</span></div>
                <div><b>342</b><span>工具调用</span></div>
                <div><b>12</b><span>审批请求</span></div>
                <div><b>3h</b><span>运行时间</span></div>
              </div>
            </section>
          </div>
        </section>
      </aside>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface NavigationItem {
  icon: string
  label: string
  shortcut?: string
  badge?: string
}

interface SessionItem {
  title: string
  time: string
  active?: boolean
}

interface ProjectItem {
  name: string
  path: string
  time: string
  active?: boolean
  expanded: boolean
  sessions: SessionItem[]
}

interface ToolExecution {
  name: string
  detail: string
  state: '完成' | '运行中'
  cost: string
}

const navigationItems: NavigationItem[] = [
  { icon: '＋', label: '新对话', shortcut: 'Ctrl+N' },
  { icon: '⌕', label: '搜索', shortcut: 'Ctrl+F' },
  { icon: '▦', label: '插件', badge: '12' },
  { icon: '◴', label: '自动化', badge: '3' },
]

const projects = ref<ProjectItem[]>([
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
])

const footerItems = [
  { icon: '⚙', label: '设置' },
  { icon: '⌨', label: '快捷键' },
  { icon: '?', label: '帮助' },
  { icon: 'ⓘ', label: '关于' },
]

const tabs = ['对话', '代码', '文件', '运行']

const features = [
  '三栏式布局：会话列表 / 工作区 / 右侧检查面板',
  '插件管理：管理已安装插件、启用 / 禁用、配置权限',
  '工具调用：显示调用历史与实时状态',
  '审批流程：高风险操作需用户确认',
  'Web 预览：基于 QtWebEngine，用于渲染 Vue 应用或文档预览',
  '主题与设置：深色主题、快捷键、自定义代理与模型',
]

const planSteps = [
  '初始化 Qt5 项目结构',
  '搭建三栏主界面与基础导航',
  '实现会话与消息模型',
  '集成工具调用与审批流程',
  '嵌入 WebEngine 预览与插件管理界面',
]

const toolExecutions: ToolExecution[] = [
  { name: 'run_shell', detail: 'mkdir -p src/{ui,core,models,services,plugins}', state: '完成', cost: '0.3s' },
  { name: 'apply_patch', detail: '创建主窗口与侧栏布局文件', state: '完成', cost: '1.2s' },
  { name: 'read_file', detail: '读取项目配置 qmake.pro', state: '完成', cost: '0.1s' },
  { name: 'web_run', detail: '启动本地预览 http://127.0.0.1:8080', state: '运行中', cost: '1.5s' },
]

const generatedFiles = [
  { name: 'main.cpp', path: 'src/' },
  { name: 'MainWindow.cpp', path: 'src/ui/' },
  { name: 'MainWindow.h', path: 'src/ui/' },
  { name: 'Sidebar.cpp', path: 'src/ui/' },
  { name: 'ChatView.cpp', path: 'src/ui/' },
]

const sessionInfo = [
  { label: '会话 ID', value: '7f3c2e91-9b7f-4f1a-9d43' },
  { label: '工作目录', value: 'D:\\work\\deepseek-harness-gui' },
  { label: '当前模型', value: 'DeepSeek-V3（32K）' },
  { label: '创建时间', value: '2025-05-24 09:45:12' },
  { label: '会话时长', value: '3m 12s' },
]

const toolCalls = [
  { icon: '▧', name: 'read_file', desc: '读取文件', time: '09:45:15', state: 'done' },
  { icon: '›_', name: 'run_shell', desc: '运行命令', time: '09:45:16', state: 'done' },
  { icon: '◎', name: 'web_run', desc: '启动 Web 预览', time: '09:47:02', state: 'active' },
  { icon: '▤', name: 'apply_patch', desc: '应用补丁', time: '09:45:20', state: 'done' },
]

const plugins = [
  { name: 'Harness 核心服务', state: '运行中' },
  { name: 'Tools 工具调用', state: '运行中' },
  { name: 'ChannelJS 消息通道', state: '已连接' },
  { name: 'WebEngine 预览', state: '运行中' },
]

function toggleProject(project: ProjectItem): void {
  project.expanded = !project.expanded
}
</script>

<style scoped>
.app-shell {
  min-width: 1200px;
  height: 100vh;
  overflow: hidden;
  color: #d8e1e7;
  background: rgb(24, 24, 24);
}

.title-bar {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px 0 16px;
  background: rgb(26, 34, 39);
}

.brand-area,
.window-status,
.section-title,
.conversation-header,
.panel-title,
.composer-tools,
.sidebar-footer,
.conversation-title {
  display: flex;
  align-items: center;
}

.brand-area {
  gap: 11px;
}

.brand-mark {
  width: 22px;
  height: 22px;
  display: inline-grid;
  place-items: center;
  color: #6bc4ff;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 800;
  background: rgba(86, 170, 225, 0.14);
  box-shadow: inset 0 0 0 1px rgba(93, 181, 237, 0.45);
}

.version,
.window-status {
  color: #9caab2;
  font-size: 13px;
}

.connected-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: #65cf69;
  box-shadow: 0 0 13px rgba(101, 207, 105, 0.62);
}

.window-status {
  gap: 10px;
}

button,
select,
textarea {
  font: inherit;
}

button {
  color: inherit;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.top-tool,
.window-button,
.mini-button {
  display: inline-grid;
  place-items: center;
  color: #c3cdd2;
  border-radius: 12px;
}

.top-tool {
  width: 34px;
  height: 34px;
  background: rgba(255, 255, 255, 0.05);
}

.window-button {
  width: 42px;
  height: 34px;
  font-size: 18px;
  background: rgba(255, 255, 255, 0.055);
}

.top-tool:hover,
.window-button:hover,
.mini-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.window-button.close:hover {
  color: #fff;
  background: rgba(205, 75, 84, 0.78);
}

.workspace {
  height: calc(100vh - 50px);
  display: grid;
  grid-template-columns: 390px minmax(620px, 1fr) 470px;
  gap: 8px;
  padding: 8px;
  background: rgb(24, 24, 24);
}

.sidebar,
.conversation-panel,
.inspector {
  overflow: hidden;
  border-radius: 18px;
  border: 0;
  box-shadow: none;
}

.sidebar {
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: rgb(26, 34, 39);
}

.sidebar-scroll {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding: 16px 16px 10px;
}

.primary-actions {
  display: grid;
  gap: 7px;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.nav-action,
.project-item,
.project-session {
  min-height: 40px;
  display: grid;
  align-items: center;
  border-radius: 14px;
}

.nav-action {
  grid-template-columns: 30px 1fr auto;
  gap: 10px;
  padding: 0 10px;
  color: #d4dde2;
  text-align: left;
}

.nav-action:hover,
.project-item.active,
.project-session.active,
.project-session:hover {
  background: rgba(255, 255, 255, 0.08);
}

.nav-icon {
  width: 24px;
  height: 24px;
  display: inline-grid;
  place-items: center;
  border-radius: 9px;
  color: #dce7eb;
  background: rgba(255, 255, 255, 0.065);
}

kbd,
.badge {
  color: #aab6bd;
  font-size: 12px;
}

.badge {
  min-width: 25px;
  height: 23px;
  display: inline-grid;
  place-items: center;
  color: #d7e1e6;
  border-radius: 999px;
  background: rgba(133, 151, 159, 0.2);
}

.sidebar-section {
  margin-top: 16px;
}

.section-title {
  justify-content: space-between;
  color: #9facb4;
  font-size: 13px;
  margin-bottom: 9px;
}

.section-actions {
  display: flex;
  gap: 6px;
}

.mini-button {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.045);
}

.project-list {
  display: grid;
  gap: 7px;
  padding-bottom: 10px;
}

.project-item {
  grid-template-columns: 28px minmax(0, 1fr) auto 32px;
  gap: 9px;
  padding: 8px 8px 8px 10px;
}

.project-meta,
.project-meta strong,
.project-session span:nth-child(2) {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.project-meta small {
  display: block;
  color: #7f9099;
  font-size: 12px;
  margin-top: 2px;
}

.project-item time,
.project-session time {
  color: #94a1a8;
  font-size: 13px;
}

.folder-icon,
.session-state {
  color: #b5c1c8;
}

.project-toggle {
  width: 30px;
  height: 30px;
  border-radius: 11px;
  color: #b9c5ca;
  background: rgba(255, 255, 255, 0.045);
}

.project-sessions {
  display: grid;
  gap: 4px;
  margin: -2px 0 5px 35px;
}

.project-session {
  grid-template-columns: 22px minmax(0, 1fr) auto;
  gap: 8px;
  padding: 0 10px;
  color: #c1cbd1;
  text-align: left;
}

.sidebar-footer {
  flex-shrink: 0;
  gap: 14px;
  padding: 14px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.sidebar-footer button {
  color: #aeb9bf;
  font-size: 13px;
}

.conversation-panel {
  position: relative;
  min-width: 0;
  display: grid;
  grid-template-rows: auto 1fr;
  background: rgb(24, 24, 24);
}

.conversation-header {
  position: relative;
  height: 73px;
  padding: 0 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.conversation-title {
  gap: 10px;
}

.conversation-header h1 {
  margin: 0 0 10px;
  color: #f4f8fa;
  font-size: 17px;
  font-weight: 700;
}

.edit-title {
  margin-bottom: 10px;
  color: #9aa7ae;
}

.content-tabs {
  position: absolute;
  left: 24px;
  bottom: 0;
  display: flex;
  gap: 25px;
}

.content-tabs button {
  height: 31px;
  color: #8999a2;
  border-bottom: 2px solid transparent;
}

.content-tabs .active {
  color: #e1eaee;
  border-color: #37c2b2;
}

.header-tools {
  margin-left: auto;
  display: flex;
  gap: 6px;
}

.chat-scroll {
  min-height: 0;
  overflow: auto;
  padding: 18px 26px 190px;
}

.message {
  display: grid;
  grid-template-columns: 39px minmax(0, 1fr);
  gap: 13px;
  margin-bottom: 23px;
}

.avatar {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  font-weight: 700;
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
  margin-bottom: 8px;
}

.message-title time {
  color: #8f9da5;
  font-size: 13px;
}

.message-body p {
  color: #d1dbe0;
  line-height: 1.72;
  margin: 0 0 13px;
}

.feature-list {
  display: grid;
  gap: 8px;
  margin: 15px 0 17px;
  padding: 0;
  list-style: none;
  color: #d6e0e4;
}

.feature-list li::before {
  content: '●';
  margin-right: 9px;
  color: #63d6ae;
  font-size: 10px;
}

.plan-card,
.execution-card {
  width: min(620px, 100%);
  margin: 14px 0;
  border-radius: 16px;
  border: 0;
  background: rgba(33, 33, 33, 0.86);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 11px 13px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.card-header small {
  margin-left: auto;
  color: #92a0a8;
}

.plan-card ol {
  display: grid;
  gap: 9px;
  margin: 0;
  padding: 0 15px 16px;
  color: #b5c3c9;
  list-style: none;
}

.tool-row {
  display: grid;
  grid-template-columns: 22px 105px minmax(160px, 1fr) 65px 48px;
  align-items: center;
  gap: 10px;
  min-height: 27px;
  padding: 0 12px;
  color: #afbdc4;
  font-size: 13px;
}

.tool-row code {
  color: #d8e3e7;
  font-family: 'JetBrains Mono', 'Cascadia Mono', Consolas, monospace;
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
  margin-top: 14px;
  color: #b7c4ca;
  font-size: 13px;
}

.file-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
  margin-top: 10px;
}

.file-chip {
  min-width: 132px;
  display: grid;
  grid-template-columns: 18px 1fr;
  gap: 2px 7px;
  padding: 10px;
  text-align: left;
  border-radius: 14px;
  border: 0;
  background: rgba(38, 38, 38, 0.92);
}

.file-chip small {
  grid-column: 2;
  color: #87979f;
}

.file-chip.more {
  min-width: 52px;
  place-items: center;
  display: inline-grid;
}

.composer {
  position: absolute;
  left: 24px;
  right: 24px;
  bottom: 18px;
  z-index: 4;
  padding: 14px;
  border-radius: 22px;
  border: 0;
  background: rgba(38, 38, 38, 0.98);
  box-shadow: 0 20px 55px rgba(0, 0, 0, 0.34);
}

.composer textarea {
  width: 100%;
  max-height: 110px;
  resize: vertical;
  box-sizing: border-box;
  padding: 12px;
  color: #e1eaee;
  border: 0;
  border-radius: 16px;
  outline: none;
  background: rgba(24, 24, 24, 0.86);
}

.composer textarea::placeholder {
  color: #8a989f;
}

.composer-tools {
  gap: 14px;
  margin-top: 12px;
}

.quick-icons {
  display: flex;
  gap: 8px;
  margin-right: auto;
}

.quick-icons button {
  width: 32px;
  height: 32px;
  border-radius: 12px;
  color: #b2c0c7;
  background: rgba(255, 255, 255, 0.045);
}

.composer label {
  width: 265px;
  height: 44px;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 9px;
  padding: 0 12px;
  border-radius: 14px;
  color: #9fadb4;
  background: rgba(24, 24, 24, 0.72);
}

.composer select {
  min-width: 0;
  color: #e4ecef;
  border: 0;
  outline: 0;
  background: transparent;
}

.send-button {
  width: 104px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, #45ba87, #2b9a78);
  color: #ffffff;
  font-weight: 700;
}

.inspector {
  display: grid;
  grid-auto-rows: min-content;
  gap: 8px;
  padding: 10px;
  overflow: auto;
  background: rgb(45, 45, 45);
}

.panel-card {
  border-radius: 16px;
  border: 0;
  background: rgba(29, 29, 29, 0.42);
}

.panel-title {
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.panel-title button,
.panel-card footer,
.panel-card a {
  color: #93a1a8;
  font-size: 12px;
  text-decoration: none;
}

.session-card dl {
  display: grid;
  grid-template-columns: 76px 1fr;
  gap: 9px;
  margin: 0;
  padding: 10px 13px;
  font-size: 13px;
}

.session-card dt {
  color: #8e9ca4;
}

.session-card dd {
  min-width: 0;
  margin: 0;
  color: #d0d9de;
  overflow: hidden;
  text-align: right;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.call-list {
  padding: 8px 12px;
}

.call-item {
  display: grid;
  grid-template-columns: 21px 92px 1fr 62px 14px;
  align-items: center;
  gap: 8px;
  min-height: 28px;
  color: #cfdae0;
  font-size: 13px;
}

.call-item small,
.call-item time {
  color: #8f9da5;
}

.call-item i {
  width: 12px;
  height: 12px;
  border-radius: 999px;
}

.call-item i.done {
  box-shadow: inset 0 0 0 1px #55c970;
}

.call-item i.active {
  border: 2px solid #3cace8;
  border-left-color: transparent;
}

.panel-card footer {
  padding: 0 12px 10px;
}

.approval-card {
  position: relative;
  padding-bottom: 12px;
}

.approval-card > strong,
.approval-card p,
.approval-card > span,
.approval-card a {
  display: block;
  margin-left: 13px;
}

.approval-card > strong {
  margin-top: 10px;
}

.approval-card p,
.approval-card > span {
  color: #aab8bf;
  font-size: 13px;
}

.approval-card b {
  color: #efb44b;
}

.approval-actions {
  position: absolute;
  right: 13px;
  top: 49px;
  display: flex;
  gap: 8px;
}

.approval-actions button {
  height: 31px;
  padding: 0 14px;
  border-radius: 12px;
  color: #fff;
  font-weight: 700;
}

.approve {
  background: #42a568;
}

.reject {
  background: #b9484c;
}

.git-card {
  padding-bottom: 10px;
}

.git-row,
.change-meter {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 10px 13px 0;
  color: #c8d3d8;
  font-size: 13px;
}

.git-row small,
.change-meter span {
  color: #87959d;
}

.git-row strong {
  justify-self: end;
}

.git-row code {
  color: #9eb0ba;
}

.change-meter {
  grid-template-columns: 78px 42px 34px 34px 1fr;
}

.add {
  color: #51d181;
}

.remove {
  color: #df5f67;
}

.meter-track {
  height: 5px;
  border-radius: 999px;
  background: #263238;
  overflow: hidden;
}

.meter-track i {
  display: block;
  width: 82%;
  height: 100%;
  background: linear-gradient(90deg, #5ccc72 0 74%, #eead43 74% 90%, #d75a5f 90%);
}

.ghost-button {
  width: calc(100% - 24px);
  height: 31px;
  margin: 10px 12px 0;
  color: #aab8bf;
  border: 0;
  border-radius: 12px;
  background: rgba(58, 58, 58, 0.88);
}

.plugin-card article {
  display: grid;
  grid-template-columns: 22px 1fr auto;
  gap: 8px;
  align-items: center;
  min-height: 26px;
  padding: 0 13px;
  font-size: 13px;
}

.plugin-card em {
  color: #62c76c;
  font-style: normal;
}

.plugin-card footer {
  display: flex;
  justify-content: space-between;
  padding-top: 8px;
}

.browser-bar {
  display: grid;
  grid-template-columns: repeat(3, 20px) 1fr 20px;
  gap: 5px;
  align-items: center;
  padding: 8px 10px;
  color: #a7b4ba;
  font-size: 12px;
}

.browser-bar div {
  height: 24px;
  display: flex;
  align-items: center;
  padding: 0 9px;
  border: 0;
  border-radius: 10px;
  color: #b9c5ca;
  background: rgba(28, 28, 28, 0.72);
}

.preview-frame {
  display: grid;
  grid-template-columns: 92px 1fr;
  height: 156px;
  margin: 0 10px 10px;
  overflow: hidden;
  border-radius: 16px;
  border: 0;
  background: rgba(28, 28, 28, 0.82);
}

.preview-frame aside {
  display: grid;
  align-content: start;
  gap: 8px;
  padding: 11px 8px;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 11px;
}

.preview-frame aside strong {
  font-size: 10px;
  white-space: nowrap;
}

.preview-frame aside span {
  padding: 5px 7px;
  border-radius: 10px;
  color: #91a0a8;
}

.preview-frame aside .active {
  color: #dbe6ea;
  background: rgba(54, 113, 163, 0.42);
}

.preview-frame section {
  padding: 14px;
}

.preview-frame h2 {
  margin: 0 0 11px;
  font-size: 15px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.metric-grid div {
  min-height: 52px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  border: 0;
  background: rgba(47, 47, 47, 0.92);
}

.metric-grid b {
  color: #e5eef2;
  font-size: 17px;
}

.metric-grid span {
  color: #8d9aa2;
  font-size: 10px;
}

@media (max-width: 1440px) {
  .workspace {
    grid-template-columns: 320px minmax(560px, 1fr) 390px;
  }

  .composer label {
    width: 210px;
  }
}
</style>
