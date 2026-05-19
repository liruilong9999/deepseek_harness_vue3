<template>
  <aside class="inspector">
    <section class="panel-card session-card">
      <div class="panel-title">
        <strong>
          <PanelTop class="title-icon" />
          当前会话
        </strong>
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
        <strong>
          <Wrench class="title-icon" />
          工具调用
        </strong>
        <button type="button">
          查看全部
          <ChevronRight class="button-icon" />
        </button>
      </div>
      <div class="call-list">
        <article v-for="call in toolCalls" :key="call.name" class="call-item">
          <component :is="call.icon" class="call-icon" />
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
        <strong>
          <BadgeCheck class="title-icon" />
          审批请求（1）
        </strong>
        <button type="button">
          <ChevronUp class="button-icon" />
        </button>
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
        <strong>
          <GitBranch class="title-icon" />
          Git 状态
        </strong>
        <button type="button">
          <ChevronUp class="button-icon" />
        </button>
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
        <b class="remove">-1</b>
        <div class="meter-track"><i></i></div>
      </div>
      <button class="ghost-button" type="button">查看 Git 面板</button>
    </section>

    <section class="panel-card plugin-card">
      <div class="panel-title">
        <strong>
          <Blocks class="title-icon" />
          配置与插件
        </strong>
        <button type="button">
          <ChevronUp class="button-icon" />
        </button>
      </div>
      <article v-for="plugin in plugins" :key="plugin.name">
        <Circle class="plugin-icon" />
        <strong>{{ plugin.name }}</strong>
        <em>{{ plugin.state }}</em>
      </article>
      <footer>
        <a href="#">
          插件中心
          <ChevronRight class="link-icon" />
        </a>
        <a href="#">
          全部配置
          <ChevronRight class="link-icon" />
        </a>
      </footer>
    </section>

    <section class="panel-card web-preview">
      <div class="panel-title">
        <strong>
          <MonitorPlay class="title-icon" />
          Web 预览
        </strong>
        <button type="button">
          <ChevronUp class="button-icon" />
        </button>
      </div>
      <div class="browser-bar">
        <ChevronLeft class="browser-icon" />
        <ChevronRight class="browser-icon" />
        <RefreshCw class="browser-icon" />
        <div>http://127.0.0.1:8080</div>
        <House class="browser-icon" />
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
</template>

<script setup lang="ts">
import {
  BadgeCheck,
  Blocks,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  GitBranch,
  House,
  MonitorPlay,
  PanelTop,
  RefreshCw,
  Wrench,
} from 'lucide-vue-next'

import type { DefinitionListItem, PluginItem, ToolCallItem } from '@/types/business/harness'

defineProps<{
  /** 当前会话基础信息 */
  sessionInfo: DefinitionListItem[]
  /** 工具调用列表 */
  toolCalls: ToolCallItem[]
  /** 插件运行状态列表 */
  plugins: PluginItem[]
}>()
</script>

<style scoped lang="scss">
.inspector {
  display: grid;
  grid-auto-rows: min-content;
  gap: 0.5rem;
  padding: 0.625rem;
  overflow: auto;
  border-radius: 1.125rem;
  background: rgb(45, 45, 45);
}

.panel-card {
  border-radius: 1rem;
  background: rgba(29, 29, 29, 0.42);
}

.panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}

.panel-title strong,
.panel-title button,
.plugin-card footer a {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.title-icon,
.button-icon,
.call-icon,
.plugin-icon,
.browser-icon,
.link-icon {
  width: 1rem;
  height: 1rem;
}

.panel-title button,
.panel-card footer,
.panel-card a {
  color: #93a1a8;
  text-decoration: none;
}

.session-card dl {
  display: grid;
  grid-template-columns: 4.75rem 1fr;
  gap: 0.5625rem;
  margin: 0;
  padding: 0.625rem 0.8125rem;
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
  padding: 0.5rem 0.75rem;
}

.call-item {
  display: grid;
  grid-template-columns: 1.3125rem 5.75rem 1fr 3.875rem 0.875rem;
  align-items: center;
  gap: 0.5rem;
  min-height: 1.75rem;
  color: #cfdae0;
}

.call-item small,
.call-item time {
  color: #8f9da5;
}

.call-item i {
  width: 0.75rem;
  height: 0.75rem;
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
  padding: 0 0.75rem 0.625rem;
}

.approval-card {
  position: relative;
  padding-bottom: 0.75rem;
}

.approval-card > strong,
.approval-card p,
.approval-card > span,
.approval-card a {
  display: block;
  margin-left: 0.8125rem;
}

.approval-card > strong {
  margin-top: 0.625rem;
}

.approval-card p,
.approval-card > span {
  color: #aab8bf;
}

.approval-card b {
  color: #efb44b;
}

.approval-actions {
  position: absolute;
  right: 0.8125rem;
  top: 3.0625rem;
  display: flex;
  gap: 0.5rem;
}

.approval-actions button {
  height: 1.9375rem;
  padding: 0 0.875rem;
  border-radius: 0.75rem;
  color: #fff;
}

.approve {
  background: #42a568;
}

.reject {
  background: #b9484c;
}

.git-card {
  padding-bottom: 0.625rem;
}

.git-row,
.change-meter {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  gap: 0.625rem;
  align-items: center;
  padding: 0.625rem 0.8125rem 0;
  color: #c8d3d8;
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
  grid-template-columns: 4.875rem 2.625rem 2.125rem 2.125rem 1fr;
}

.add {
  color: #51d181;
}

.remove {
  color: #df5f67;
}

.meter-track {
  height: 0.3125rem;
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
  width: calc(100% - 1.5rem);
  height: 1.9375rem;
  margin: 0.625rem 0.75rem 0;
  color: #aab8bf;
  border-radius: 0.75rem;
  background: rgba(58, 58, 58, 0.88);
}

.plugin-card article {
  display: grid;
  grid-template-columns: 1.375rem 1fr auto;
  gap: 0.5rem;
  align-items: center;
  min-height: 1.625rem;
  padding: 0 0.8125rem;
}

.plugin-card em {
  color: #62c76c;
  font-style: normal;
}

.plugin-icon {
  color: #62c76c;
  fill: currentColor;
}

.plugin-card footer {
  display: flex;
  justify-content: space-between;
  padding-top: 0.5rem;
}

.browser-bar {
  display: grid;
  grid-template-columns: repeat(3, 1.25rem) 1fr 1.25rem;
  gap: 0.3125rem;
  align-items: center;
  padding: 0.5rem 0.625rem;
  color: #a7b4ba;
}

.browser-bar div {
  height: 1.5rem;
  display: flex;
  align-items: center;
  padding: 0 0.5625rem;
  border-radius: 0.625rem;
  color: #b9c5ca;
  background: rgba(28, 28, 28, 0.72);
}

.preview-frame {
  display: grid;
  grid-template-columns: 5.75rem 1fr;
  height: 9.75rem;
  margin: 0 0.625rem 0.625rem;
  overflow: hidden;
  border-radius: 1rem;
  background: rgba(28, 28, 28, 0.82);
}

.preview-frame aside {
  display: grid;
  align-content: start;
  gap: 0.5rem;
  padding: 0.6875rem 0.5rem;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
}

.preview-frame aside strong {
  white-space: nowrap;
}

.preview-frame aside span {
  padding: 0.3125rem 0.4375rem;
  border-radius: 0.625rem;
  color: #91a0a8;
}

.preview-frame aside .active {
  color: #dbe6ea;
  background: rgba(54, 113, 163, 0.42);
}

.preview-frame section {
  padding: 0.875rem;
}

.preview-frame h2 {
  margin: 0 0 0.6875rem;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
}

.metric-grid div {
  min-height: 3.25rem;
  display: grid;
  place-items: center;
  border-radius: 0.875rem;
  background: rgba(47, 47, 47, 0.92);
}

.metric-grid b {
  color: #e5eef2;
}

.metric-grid span {
  color: #8d9aa2;
}
</style>
