<template>
  <HarnessLayout>
    <template #sidebar>
      <ProjectSidebar
        :navigation-items="navigationItems"
        :projects="projects"
        :footer-items="footerItems"
        @toggle-project="handleProjectToggle"
      />
    </template>

    <ConversationPanel
      title="设计 DeepSeek Harness GUI 方案"
      :features="features"
      :plan-steps="planSteps"
      :tool-executions="toolExecutions"
      :generated-files="generatedFiles"
    />

    <template #inspector>
      <InspectorPanel
        :plan-steps="planSteps"
        :session-info="sessionInfo"
        :tool-calls="toolCalls"
        :plugins="plugins"
      />
    </template>
  </HarnessLayout>
</template>

<script setup lang="ts">
import { useHarnessDashboard } from './hooks/useHarnessDashboard'

import ConversationPanel from '@/components/harness/ConversationPanel.vue'
import InspectorPanel from '@/components/harness/InspectorPanel.vue'
import ProjectSidebar from '@/components/harness/ProjectSidebar.vue'
import HarnessLayout from '@/layouts/HarnessLayout.vue'

const {
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
} = useHarnessDashboard()
</script>
