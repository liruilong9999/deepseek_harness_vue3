<template>
  <aside class="sidebar">
    <div class="sidebar-scroll">
      <nav class="primary-actions">
        <button v-for="item in navigationItems" :key="item.label" class="nav-action" type="button">
          <span class="nav-icon-wrap">
            <component :is="item.icon" class="nav-icon" />
          </span>
          <span>{{ item.label }}</span>
          <kbd v-if="item.shortcut">{{ item.shortcut }}</kbd>
          <span v-if="item.badge" class="badge">{{ item.badge }}</span>
        </button>
      </nav>

      <section class="sidebar-section">
        <div class="section-title">
          <span>项目</span>
          <div class="section-actions">
            <button class="mini-button" title="新增项目" type="button">
              <Plus class="button-icon" />
            </button>
            <button class="mini-button" title="刷新项目" type="button">
              <RefreshCw class="button-icon" />
            </button>
          </div>
        </div>

        <div class="project-list">
          <template v-for="project in projects" :key="project.name">
            <article
              class="project-item"
              :class="{ active: project.active }"
              @click="emit('toggle-project', project.name)"
            >
              <FolderClosed class="folder-icon" />
              <div class="project-meta">
                <strong>{{ project.name }}</strong>
                <small>{{ project.path }}</small>
              </div>
              <time>{{ project.time }}</time>
              <button class="project-toggle" type="button" @click.stop="emit('toggle-project', project.name)">
                <ChevronUp v-if="project.expanded" class="button-icon" />
                <ChevronDown v-else class="button-icon" />
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
                <CircleCheck class="session-state" />
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
        <component :is="item.icon" class="footer-icon" />
        {{ item.label }}
      </button>
    </footer>
  </aside>
</template>

<script setup lang="ts">
import { ChevronDown, ChevronUp, CircleCheck, FolderClosed, Plus, RefreshCw } from 'lucide-vue-next'

import type { FooterItem, NavigationItem, ProjectItem } from '@/types/business/harness'

defineProps<{
  /** 侧边栏顶部主导航 */
  navigationItems: NavigationItem[]
  /** 项目与会话列表 */
  projects: ProjectItem[]
  /** 侧边栏底部操作 */
  footerItems: FooterItem[]
}>()

const emit = defineEmits<{
  /** 点击项目或展开按钮时触发，参数为项目名称 */
  'toggle-project': [projectName: string]
}>()
</script>

<style scoped lang="scss">
.sidebar {
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 1.125rem;
  background: rgb(26, 34, 39);
}

.sidebar-scroll {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1rem 0.625rem;
}

.primary-actions {
  display: grid;
  gap: 0.4375rem;
  padding-bottom: 1.125rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.nav-action,
.project-item,
.project-session {
  min-height: 2.5rem;
  display: grid;
  align-items: center;
  border-radius: 0.875rem;
}

.nav-action {
  grid-template-columns: 1.875rem 1fr auto;
  gap: 0.625rem;
  padding: 0 0.625rem;
  color: #d4dde2;
  text-align: left;
}

.nav-action:hover,
.project-item.active,
.project-session.active,
.project-session:hover {
  background: rgba(255, 255, 255, 0.08);
}

.nav-icon-wrap {
  width: 1.5rem;
  height: 1.5rem;
  display: inline-grid;
  place-items: center;
  border-radius: 0.5625rem;
  color: #dce7eb;
  background: rgba(255, 255, 255, 0.065);
}

.nav-icon,
.button-icon,
.folder-icon,
.session-state,
.footer-icon {
  width: 1rem;
  height: 1rem;
}

kbd,
.badge {
  color: #aab6bd;
}

.badge {
  min-width: 1.5625rem;
  height: 1.4375rem;
  display: inline-grid;
  place-items: center;
  color: #d7e1e6;
  border-radius: 999px;
  background: rgba(133, 151, 159, 0.2);
}

.sidebar-section {
  margin-top: 1rem;
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #9facb4;
  margin-bottom: 0.5625rem;
}

.section-actions {
  display: flex;
  gap: 0.375rem;
}

.project-list {
  display: grid;
  gap: 0.4375rem;
  padding-bottom: 0.625rem;
}

.project-item {
  grid-template-columns: 1.75rem minmax(0, 1fr) auto 2rem;
  gap: 0.5625rem;
  padding: 0.5rem 0.5rem 0.5rem 0.625rem;
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
  margin-top: 0.125rem;
}

.project-item time,
.project-session time {
  color: #94a1a8;
}

.folder-icon,
.session-state {
  color: #b5c1c8;
}

.project-toggle {
  width: 1.875rem;
  height: 1.875rem;
  display: inline-grid;
  place-items: center;
  border-radius: 0.6875rem;
  color: #b9c5ca;
  background: rgba(255, 255, 255, 0.045);
}

.project-sessions {
  display: grid;
  gap: 0.25rem;
  margin: -0.125rem 0 0.3125rem 2.1875rem;
}

.project-session {
  grid-template-columns: 1.375rem minmax(0, 1fr) auto;
  gap: 0.5rem;
  padding: 0 0.625rem;
  color: #c1cbd1;
  text-align: left;
}

.sidebar-footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.sidebar-footer button {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: #aeb9bf;
}
</style>
