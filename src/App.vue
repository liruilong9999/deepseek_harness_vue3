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
        <button class="icon-button" title="更多">⌄</button>
        <button class="window-button" title="最小化">−</button>
        <button class="window-button" title="最大化">□</button>
        <button class="window-button close" title="关闭">×</button>
      </section>
    </header>

    <section class="workspace">
      <aside class="sidebar">
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
              <button class="mini-button" title="新增项目">＋</button>
              <button class="mini-button" title="收起">⌃</button>
            </div>
          </div>

          <div class="project-list">
            <article
              v-for="project in projects"
              :key="project.name"
              class="project-item"
              :class="{ active: project.active }"
            >
              <span class="folder-icon">▣</span>
              <div>
                <strong>{{ project.name }}</strong>
                <small>{{ project.path }}</small>
              </div>
              <span class="project-time">{{ project.time }}</span>
            </article>
          </div>
        </section>

        <section class="sidebar-section history-section">
          <div class="section-title">
            <span>会话历史</span>
            <button class="mini-button" title="收起">⌃</button>
          </div>

          <div class="history-list">
            <article
              v-for="session in sessions"
              :key="session.title"
              class="history-item"
              :class="{ active: session.active }"
            >
              <span class="history-state">✓</span>
              <span>{{ session.title }}</span>
              <time>{{ session.time }}</time>
            </article>
          </div>
        </section>

        <footer class="sidebar-footer">
          <button v-for="item in footerItems" :key="item.label" type="button">
            <span>{{ item.icon }}</span>
            {{ item.label }}
          </button>
        </footer>
      </aside>

      <section class="conversation-panel">
        <div class="conversation-header">
          <div>
            <h1>设计 DeepSeek Harness GUI 方案</h1>
            <button class="edit-title" type="button" title="编辑标题">✎</button>
          </div>

          <nav class="content-tabs">
            <button v-for="tab in tabs" :key="tab" :class="{ active: tab === '对话' }" type="button">
              {{ tab }}
            </button>
          </nav>

          <div class="header-tools">
            <button class="icon-button" title="同步">◎</button>
            <button class="icon-button" title="更多">⋮</button>
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
              <p>帮我设计一个基于 Qt5 的 DeepSeek Harness GUI，替代当前复杂的 CLI，要求包含插件管理、工具调用、审批流程和内置 Web 预览能力。</p>
            </div>
          </article>

          <article class="message assistant-message">
            <div class="avatar assistant">✺</div>
            <div class="message-body">
              <div class="message-title">
                <strong>DeepSeek Harness</strong>
                <time>09:45</time>
              </div>
              <p>好的，我将为你设计一个基于 Qt5 的 DeepSeek Harness GUI。以下是整体方案与关键功能模块：</p>

              <ul class="feature-list">
                <li v-for="item in features" :key="item">三栏式布局：{{ item }}</li>
              </ul>

              <p>我将先创建项目骨架和核心界面框架。</p>

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
                <div class="tool-row" v-for="tool in toolExecutions" :key="tool.name">
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
interface NavigationItem {
  icon: string
  label: string
  shortcut?: string
  badge?: string
}

interface ProjectItem {
  name: string
  path: string
  time: string
  active?: boolean
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

const projects: ProjectItem[] = [
  { name: 'deepseek-harness-gui', path: 'D:\\work\\deepseek-harness-gui', time: '', active: true },
  { name: 'DeepSeek-Toolkit', path: 'D:\\work\\DeepSeek-Toolkit', time: '09:21' },
  { name: 'ChannelJS', path: 'D:\\work\\ChannelJS', time: '昨天' },
  { name: 'QtComponents', path: 'D:\\work\\QtComponents', time: '2天前' },
  { name: 'Harness-Scripts', path: 'D:\\work\\Harness-Scripts', time: '3天前' },
]

const sessions = [
  { title: '设计 DeepSeek Harness GUI 方案', time: '09:45', active: true },
  { title: '集成 ChannelJS 插件机制', time: '昨天' },
  { title: '修复 WebEngine 崩溃问题', time: '昨天' },
  { title: '实现沙箱执行安全策略', time: '5月23日' },
  { title: '优化代码索引与检索', time: '5月22日' },
  { title: '添加自动化工作流', time: '5月21日' },
  { title: '构建发布包与打包脚本', time: '5月20日' },
]

const footerItems = [
  { icon: '⚙', label: '设置' },
  { icon: '⌨', label: '快捷键' },
  { icon: '?', label: '帮助' },
  { icon: 'ⓘ', label: '关于' },
]

const tabs = ['对话', '代码', '文件', '运行']

const features = [
  '会话列表 / 工作区 / 右侧检查面板',
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
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: rgb(26, 34, 39);
  box-sizing: border-box;
}

.brand-area,
.window-status,
.section-title,
.conversation-header,
.panel-title,
.composer-tools,
.sidebar-footer {
  display: flex;
  align-items: center;
}

.brand-area {
  gap: 11px;
}

.brand-mark {
  width: 19px;
  height: 19px;
  display: inline-grid;
  place-items: center;
  color: #6bc4ff;
  border: 1px solid rgba(93, 181, 237, 0.65);
  border-radius: 5px;
  font-size: 11px;
  font-weight: 800;
  box-shadow: inset 0 0 18px rgba(42, 151, 221, 0.18);
}

.version,
.window-status {
  color: #9caab2;
  font-size: 13px;
}

.connected-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #65cf69;
  box-shadow: 0 0 13px rgba(101, 207, 105, 0.62);
}

.window-status {
  gap: 14px;
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

.icon-button,
.window-button,
.mini-button {
  display: inline-grid;
  place-items: center;
  color: #b9c4ca;
}

.icon-button {
  width: 25px;
  height: 25px;
  border-radius: 6px;
}

.window-button {
  width: 30px;
  height: 28px;
}

.icon-button:hover,
.window-button:hover,
.mini-button:hover {
  background: rgba(255, 255, 255, 0.07);
}

.window-button.close:hover {
  background: rgba(205, 75, 84, 0.72);
}

.workspace {
  height: calc(100vh - 42px);
  display: grid;
  grid-template-columns: 390px minmax(620px, 1fr) 470px;
  gap: 1px;
  padding: 0;
  background: rgba(255, 255, 255, 0.04);
  box-sizing: border-box;
}

.sidebar,
.conversation-panel,
.inspector {
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.sidebar {
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow: hidden;
  background: rgb(26, 34, 39);
}

.primary-actions {
  display: grid;
  gap: 6px;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.nav-action,
.project-item,
.history-item {
  min-height: 38px;
  display: grid;
  align-items: center;
  border-radius: 7px;
}

.nav-action {
  grid-template-columns: 28px 1fr auto;
  gap: 10px;
  padding: 0 9px;
  color: #d4dde2;
  text-align: left;
}

.nav-action:hover,
.project-item.active,
.history-item.active {
  background: rgba(130, 151, 160, 0.13);
}

.nav-icon {
  width: 21px;
  height: 21px;
  display: inline-grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: #dce7eb;
}

kbd,
.badge {
  color: #aab6bd;
  font-size: 12px;
}

.badge {
  min-width: 24px;
  height: 22px;
  display: inline-grid;
  place-items: center;
  color: #d7e1e6;
  border-radius: 999px;
  background: rgba(133, 151, 159, 0.18);
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
  width: 28px;
  height: 28px;
  border-radius: 6px;
}

.project-list,
.history-list {
  display: grid;
  gap: 6px;
}

.project-item {
  grid-template-columns: 26px minmax(0, 1fr) auto;
  gap: 9px;
  padding: 7px 9px;
}

.project-item strong,
.history-item span:nth-child(2) {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.project-item small {
  display: block;
  color: #7f9099;
  font-size: 12px;
  margin-top: 2px;
}

.folder-icon {
  color: #b5c1c8;
}

.project-time,
.history-item time {
  color: #94a1a8;
  font-size: 13px;
}

.history-section {
  min-height: 0;
  flex: 1;
  overflow: hidden;
}

.history-list {
  max-height: 100%;
  overflow: auto;
}

.history-item {
  grid-template-columns: 22px minmax(0, 1fr) auto;
  gap: 8px;
  padding: 0 8px;
  color: #c1cbd1;
}

.history-state {
  color: #9db0b9;
}

.sidebar-footer {
  gap: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.sidebar-footer button {
  color: #aeb9bf;
  font-size: 13px;
}

.conversation-panel {
  min-width: 0;
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: rgb(24, 24, 24);
}

.conversation-header {
  position: relative;
  height: 73px;
  padding: 0 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.conversation-header h1 {
  display: inline-flex;
  margin: 0 10px 10px 0;
  color: #f4f8fa;
  font-size: 17px;
  font-weight: 700;
}

.edit-title {
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
  gap: 4px;
}

.chat-scroll {
  min-height: 0;
  overflow: auto;
  padding: 18px 26px 8px;
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
  border-radius: 50%;
  font-weight: 700;
}

.avatar.user {
  background: rgba(34, 94, 148, 0.34);
  border: 1px solid rgba(89, 164, 226, 0.28);
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
  border-radius: 8px;
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
  border-radius: 7px;
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
  margin: 0 24px 16px;
  padding: 13px;
  border-radius: 15px;
  border: 0;
  background: rgba(38, 38, 38, 0.96);
}

.composer textarea {
  width: 100%;
  resize: none;
  box-sizing: border-box;
  padding: 10px;
  color: #e1eaee;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 7px;
  outline: none;
  background: rgba(24, 24, 24, 0.82);
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
  width: 27px;
  height: 27px;
  color: #b2c0c7;
}

.composer label {
  width: 265px;
  height: 44px;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 9px;
  padding: 0 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 7px;
  color: #9fadb4;
  box-sizing: border-box;
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
  border-radius: 8px;
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
  border-radius: 7px;
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
  border-radius: 50%;
}

.call-item i.done {
  border: 1px solid #55c970;
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
  height: 29px;
  padding: 0 13px;
  border-radius: 6px;
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
  height: 30px;
  margin: 10px 12px 0;
  color: #aab8bf;
  border: 0;
  border-radius: 6px;
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
  border-radius: 5px;
  color: #b9c5ca;
  background: rgba(28, 28, 28, 0.72);
}

.preview-frame {
  display: grid;
  grid-template-columns: 92px 1fr;
  height: 156px;
  margin: 0 10px 10px;
  overflow: hidden;
  border-radius: 7px;
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
  border-radius: 5px;
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
  border-radius: 6px;
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
