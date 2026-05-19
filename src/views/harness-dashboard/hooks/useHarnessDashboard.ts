import { ref } from 'vue'

import {
  features,
  footerItems,
  generatedFiles,
  navigationItems,
  planSteps,
  plugins,
  projectItems,
  sessionInfo,
  toolCalls,
  toolExecutions,
} from '@/config/harnessDashboard'

/**
 * 管理 Harness 仪表盘页面的演示数据与交互状态。
 *
 * @returns 页面渲染所需状态与项目展开方法
 */
export function useHarnessDashboard() {
  // 项目展开状态属于页面交互状态，复制一份避免直接修改静态配置。
  const projects = ref(projectItems.map((project) => ({ ...project, sessions: [...project.sessions] })))

  /**
   * 切换项目的会话展开状态。
   *
   * @param projectName 项目名称
   */
  function handleProjectToggle(projectName: string) {
    const targetProject = projects.value.find((project) => project.name === projectName)

    if (!targetProject) {
      return
    }

    targetProject.expanded = !targetProject.expanded
  }

  return {
    navigationItems,
    projects,
    footerItems,
    features,
    planSteps,
    toolExecutions,
    generatedFiles,
    sessionInfo,
    toolCalls,
    plugins,
    handleProjectToggle,
  }
}
