<template>
  <HarnessLayout>
    <template #sidebar>
      <ProjectSidebar
        :navigation-items="navigationItems"
        :projects="projects"
        :footer-items="footerItems"
        @toggle-project="handleProjectToggle"
        @primary-action="handlePrimaryAction"
        @open-project="handleOpenProject"
        @open-session="handleOpenSession"
        @footer-action="handleFooterAction"
      />
    </template>

    <ConversationPanel
      title="设计 DeepSeek Harness GUI 方案"
      :features="features"
      :plan-steps="planSteps"
      :tool-executions="toolExecutions"
      :generated-files="generatedFiles"
      :bridge-prompt="bridgePrompt"
      @refresh-conversation="handleRefreshConversation"
      @get-conversation-actions="handleGetConversationActions"
      @copy-message="handleCopyMessage"
      @open-generated-file="handleOpenGeneratedFile"
      @pick-attachment="handlePickAttachment"
      @pick-context="handlePickContext"
      @pick-tool="handlePickTool"
      @send-message="handleSendMessage"
      @runtime-settings-change="handleRuntimeSettingsChange"
      @approval-response="handleApprovalResponse"
      @plan-response="handlePlanResponse"
      @prompt-close="handlePromptClose"
    />

    <template #inspector>
      <InspectorPanel
        :plan-steps="planSteps"
        :session-info="sessionInfo"
        :tool-calls="toolCalls"
        :plugins="plugins"
        :git-status="gitStatus"
        :context-usage="contextUsage"
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
  gitStatus,
  contextUsage,
  bridgePrompt,
  handleProjectToggle,
  handlePrimaryAction,
  handleOpenProject,
  handleOpenSession,
  handleFooterAction,
  handleRefreshConversation,
  handleGetConversationActions,
  handleCopyMessage,
  handleOpenGeneratedFile,
  handlePickAttachment,
  handlePickContext,
  handlePickTool,
  handleSendMessage,
  handleRuntimeSettingsChange,
  handleApprovalResponse,
  handlePlanResponse,
  handlePromptClose,
} = useHarnessDashboard()
</script>
