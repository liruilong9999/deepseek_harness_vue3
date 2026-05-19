<template>
  <aside class="inspector">
    <section class="panel-card plan-overview-card">
      <div class="panel-title">
        <strong>
          <ListChecks class="title-icon" />
          执行计划
        </strong>
      </div>
      <ol class="plan-overview-list">
        <li v-for="(step, index) in planSteps" :key="step">
          <CircleCheck v-if="getPlanState(index) === 'done'" class="plan-state done" />
          <LoaderCircle v-else-if="getPlanState(index) === 'running'" class="plan-state running" />
          <Circle v-else class="plan-state pending" />
          <span>{{ step }}</span>
        </li>
      </ol>
    </section>

    <div class="inspector-bottom">
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
          <span>{{ gitStatus.branch }}</span>
          <small>{{ gitStatus.branchLabel }}</small>
          <strong>{{ gitStatus.commitStatus }}</strong>
          <code>{{ gitStatus.shortCommit }}</code>
        </div>
        <div class="change-meter">
          <span>变更文件</span>
          <b class="add">+{{ gitStatus.changes.added }}</b>
          <b>~{{ gitStatus.changes.modified }}</b>
          <b class="remove">-{{ gitStatus.changes.removed }}</b>
          <div class="meter-track"><i :style="{ width: gitChangeMeterWidth }"></i></div>
        </div>
        <button class="ghost-button" type="button">查看 Git 面板</button>
      </section>

      <section class="panel-card context-card">
        <div class="panel-title">
          <strong>
            <Gauge class="title-icon" />
            上下文状态
          </strong>
        </div>
        <div class="context-grid">
          <article>
            <span>输入 Token（未命中）</span>
            <strong>{{ formatToken(contextUsage.inputTokenMiss) }}</strong>
          </article>
          <article>
            <span>输入 Token（命中）</span>
            <strong>{{ formatToken(contextUsage.inputTokenHit) }}</strong>
          </article>
          <article>
            <span>输出 Token</span>
            <strong>{{ formatToken(contextUsage.outputToken) }}</strong>
          </article>
          <article>
            <span>缓存命中率</span>
            <strong>{{ formatPercent(contextUsage.cacheHitRate) }}</strong>
          </article>
        </div>
        <div class="context-usage">
          <div>
            <span>会话总上下文</span>
            <strong>{{ formatToken(contextUsage.sessionTotalContext) }}</strong>
          </div>
          <div>
            <span>已用上下文</span>
            <strong>{{ formatToken(contextUsage.usedContext) }}</strong>
          </div>
          <div class="context-track">
            <i :style="{ width: contextUsageRateText }"></i>
          </div>
          <footer>占用 {{ contextUsageRateText }}</footer>
        </div>
      </section>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { ChevronUp, Circle, CircleCheck, Gauge, GitBranch, ListChecks, LoaderCircle } from 'lucide-vue-next'

import type { ContextUsage, DefinitionListItem, GitStatus, PluginItem, ToolCallItem } from '@/types/business/harness'

const props = defineProps<{
  /** 右侧执行计划步骤列表。 */
  planSteps: string[]
  /** 当前会话基础信息，保留给父级数据契约。 */
  sessionInfo: DefinitionListItem[]
  /** 工具调用列表，保留给父级数据契约。 */
  toolCalls: ToolCallItem[]
  /** 插件运行状态列表，保留给父级数据契约。 */
  plugins: PluginItem[]
  /** Git 状态。 */
  gitStatus: GitStatus
  /** 上下文用量状态。 */
  contextUsage: ContextUsage
}>()

/** Git 变更条占用宽度。 */
const gitChangeMeterWidth = computed(() => {
  const { added, modified, removed } = props.gitStatus.changes
  const total = added + modified + removed

  if (total <= 0) {
    return '0%'
  }

  return `${Math.min(100, Math.round(((added + modified) / total) * 100))}%`
})

/** 上下文占用率文案。 */
const contextUsageRateText = computed(() => formatPercent(props.contextUsage.usageRate))

/**
 * 格式化 Token 数值。
 *
 * @param value Token 数值
 * @returns 界面展示文案
 */
function formatToken(value: number) {
  if (value >= 1000) {
    return `${Number((value / 1000).toFixed(1))}K`
  }

  return `${value}`
}

/**
 * 格式化百分比。
 *
 * @param value 小数百分比
 * @returns 百分比文案
 */
function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`
}

/**
 * 根据计划步骤位置生成演示状态。
 *
 * @param index 计划步骤下标
 * @returns 当前步骤展示状态
 */
function getPlanState(index: number) {
  if (index < 3) {
    return 'done'
  }

  if (index === 3) {
    return 'running'
  }

  return 'pending'
}
</script>

<style scoped lang="scss">
.inspector {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.625rem;
  overflow: hidden;
  border-radius: 1.125rem;
  background: rgb(45, 45, 45);
}

.plan-overview-card {
  flex-shrink: 0;
}

.inspector-bottom {
  min-height: 0;
  max-height: 48%;
  margin-top: auto;
  display: grid;
  grid-auto-rows: min-content;
  gap: 0.5rem;
  overflow-y: auto;
}

.panel-card {
  min-width: 0;
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
.panel-title button {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.title-icon,
.button-icon {
  width: 1rem;
  height: 1rem;
}

.panel-title button {
  color: #93a1a8;
}

.plan-overview-list {
  display: grid;
  gap: 0.75rem;
  margin: 0;
  padding: 0.75rem 0.8125rem 0.875rem;
  color: #c9d3d8;
  list-style: none;
}

.plan-overview-list li {
  min-width: 0;
  display: grid;
  grid-template-columns: 1.125rem minmax(0, 1fr);
  align-items: center;
  gap: 0.5rem;
}

.plan-overview-list span {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.plan-state {
  width: 1rem;
  height: 1rem;
}

.plan-state.done {
  color: #58ca72;
}

.plan-state.running {
  color: #4bb4ef;
  animation: plan-running-rotate 1s linear infinite;
}

.plan-state.pending {
  color: #7f8b93;
}

@keyframes plan-running-rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.git-card,
.context-card {
  padding-bottom: 0.625rem;
}

.git-row,
.change-meter {
  display: grid;
  grid-template-columns: minmax(0, auto) minmax(0, auto) minmax(0, 1fr) auto;
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
  white-space: nowrap;
}

.git-row code {
  min-width: 0;
  overflow: hidden;
  color: #9eb0ba;
  text-overflow: ellipsis;
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

.context-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
  padding: 0.75rem 0.75rem 0;
}

.context-grid article {
  min-width: 0;
  display: grid;
  gap: 0.25rem;
  padding: 0.625rem;
  border-radius: 0.75rem;
  background: rgba(38, 38, 38, 0.72);
}

.context-grid span,
.context-usage span,
.context-usage footer {
  color: #8f9da5;
}

.context-grid strong,
.context-usage strong {
  color: #e2eaee;
}

.context-usage {
  display: grid;
  gap: 0.5rem;
  padding: 0.75rem 0.75rem 0;
}

.context-usage > div:not(.context-track) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.context-track {
  height: 0.4375rem;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

.context-track i {
  display: block;
  width: 72%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #4cb982, #4ea7da);
}
</style>
