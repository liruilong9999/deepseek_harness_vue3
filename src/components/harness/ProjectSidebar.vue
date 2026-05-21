<template>
  <aside class="sidebar">
    <nav class="primary-actions">
      <button v-for="item in navigationItems" :key="item.label" class="nav-action" type="button" @click="emit('primary-action', item)">
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
          <button class="mini-button" title="打开文件夹" type="button" @click="emit('pick-project-folder')">
            <FolderPlus class="button-icon" />
          </button>
          <button class="mini-button" title="刷新项目" type="button" @click="emit('refresh-projects')">
            <RefreshCw class="button-icon" />
          </button>
        </div>
      </div>

      <div class="sidebar-scroll">
        <p v-if="projects.length === 0" class="empty-tip">还没有打开项目，点击上方文件夹按钮选择一个工作目录。</p>
        <div v-else class="project-list">
          <template v-for="project in projects" :key="project.id || project.path || project.name">
            <article class="project-item" :class="{ active: project.active }" @click="emit('open-project', project)">
              <FolderClosed class="folder-icon" />
              <div class="project-meta">
                <strong>{{ project.name || '未命名项目' }}</strong>
                <small>{{ project.path }}</small>
              </div>
              <time>{{ project.time }}</time>
              <button class="project-toggle" type="button" @click.stop="emit('toggle-project', project)">
                <ChevronUp v-if="project.expanded" class="button-icon" />
                <ChevronDown v-else class="button-icon" />
              </button>
            </article>

            <div v-if="project.expanded" class="project-sessions">
              <p v-if="project.sessions.length === 0" class="session-empty">暂无会话，点击“新对话”创建。</p>
              <button
                v-for="session in project.sessions"
                :key="session.id || session.title"
                class="project-session"
                :class="{ active: session.active }"
                type="button"
                @click="emit('open-session', session)"
              >
                <CircleCheck class="session-state" />
                <span>{{ session.title || '未命名会话' }}</span>
                <time>{{ session.time }}</time>
              </button>
            </div>
          </template>
        </div>
      </div>
    </section>

    <footer class="sidebar-footer">
      <button v-for="item in footerItems" :key="item.label" type="button" @click="emit('footer-action', item)">
        <component :is="item.icon" class="footer-icon" />
        {{ item.label }}
      </button>
    </footer>
  </aside>
</template>

<script setup lang="ts">
import { ChevronDown, ChevronUp, CircleCheck, FolderClosed, FolderPlus, RefreshCw } from 'lucide-vue-next'

import type { FooterItem, NavigationItem, ProjectItem, SessionItem } from '@/types/business/harness'

defineProps<{
  /** 侧边栏顶部主导航。 */
  navigationItems: NavigationItem[]
  /** 项目与会话列表。 */
  projects: ProjectItem[]
  /** 侧边栏底部操作项。 */
  footerItems: FooterItem[]
}>()

const emit = defineEmits<{
  /** 点击主导航时触发。 */
  'primary-action': [item: NavigationItem]
  /** 选择本地项目文件夹。 */
  'pick-project-folder': []
  /** 刷新项目列表。 */
  'refresh-projects': []
  /** 点击项目时触发。 */
  'open-project': [project: ProjectItem]
  /** 点击项目展开按钮时触发。 */
  'toggle-project': [project: ProjectItem]
  /** 点击会话时触发。 */
  'open-session': [session: SessionItem]
  /** 点击底部操作时触发。 */
  'footer-action': [item: FooterItem]
}>()
</script>

<style scoped lang="scss">
.sidebar {
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 1rem 1rem 0;
  background: rgb(26, 34, 39);
}

.primary-actions {
  flex-shrink: 0;
  display: grid;
  gap: 0.4375rem;
  padding-bottom: 1.125rem;
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
.project-item:hover,
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
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
}

.section-title {
  flex-shrink: 0;
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

.mini-button {
  width: 2rem;
  height: 2rem;
  display: inline-grid;
  place-items: center;
  color: #d7e2e6;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.055);
}

.mini-button:hover {
  background: rgba(255, 255, 255, 0.11);
}

.sidebar-scroll {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding-bottom: 0.625rem;
}

.empty-tip,
.session-empty {
  margin: 0;
  color: #8fa0a8;
  line-height: 1.55;
}

.empty-tip {
  padding: 0.875rem;
  border-radius: 0.875rem;
  background: rgba(255, 255, 255, 0.04);
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

.session-empty {
  padding: 0.5rem 0.625rem;
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
  margin: 0 -1rem;
  padding: 0.875rem 1rem;
}

.sidebar-footer button {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: #aeb9bf;
}
</style>
