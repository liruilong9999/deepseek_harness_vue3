/**
 * QtWebView 桥接动作 API。
 *
 * 本文件按接口清单逐个封装前端到后端的 action，组件层不直接拼接 action 字符串。
 */
import { callHarnessAction, getAppSnapshot, refreshApp } from '@/bridges/harnessBridge'

/** 通用桥接参数对象。 */
export type BridgePayload = object

/** 获取页面全量快照。 */
export const fetchAppSnapshot = getAppSnapshot

/** 按作用域刷新页面数据。 */
export const refreshAppScopes = refreshApp

/**
 * 获取项目与会话列表。
 *
 * @param payload 查询参数
 * @returns 后端统一响应
 */
export function listProjects(payload: BridgePayload) {
  return callHarnessAction('project.list', payload)
}

/**
 * 打开项目。
 *
 * @param payload 项目编号参数
 * @returns 后端统一响应
 */
export function openProject(payload: BridgePayload) {
  return callHarnessAction('project.open', payload)
}

/**
 * 切换项目展开状态。
 *
 * @param payload 项目展开参数
 * @returns 后端统一响应
 */
export function toggleProjectExpanded(payload: BridgePayload) {
  return callHarnessAction('project.toggleExpanded', payload)
}

/**
 * 打开会话。
 *
 * @param payload 会话编号参数
 * @returns 后端统一响应
 */
export function openConversation(payload: BridgePayload) {
  return callHarnessAction('conversation.open', payload)
}

/**
 * 创建新会话。
 *
 * @param payload 新会话参数
 * @returns 后端统一响应
 */
export function createConversation(payload: BridgePayload) {
  return callHarnessAction('conversation.create', payload)
}

/**
 * 获取会话详情。
 *
 * @param payload 会话编号参数
 * @returns 后端统一响应
 */
export function getConversationDetail(payload: BridgePayload) {
  return callHarnessAction('conversation.getDetail', payload)
}

/**
 * 重命名会话。
 *
 * @param payload 会话标题参数
 * @returns 后端统一响应
 */
export function renameConversation(payload: BridgePayload) {
  return callHarnessAction('conversation.rename', payload)
}

/**
 * 刷新当前会话。
 *
 * @param payload 会话编号参数
 * @returns 后端统一响应
 */
export function refreshConversation(payload: BridgePayload) {
  return callHarnessAction('conversation.refresh', payload)
}

/**
 * 获取会话更多操作。
 *
 * @param payload 会话编号参数
 * @returns 后端统一响应
 */
export function getConversationActions(payload: BridgePayload) {
  return callHarnessAction('conversation.getActions', payload)
}

/**
 * 执行会话操作。
 *
 * @param payload 操作编号参数
 * @returns 后端统一响应
 */
export function runConversationAction(payload: BridgePayload) {
  return callHarnessAction('conversation.runAction', payload)
}

/**
 * 发送用户消息。
 *
 * @param payload 消息与运行配置参数
 * @returns 后端统一响应
 */
export function sendConversationMessage(payload: BridgePayload) {
  return callHarnessAction('conversation.sendMessage', payload)
}

/**
 * 停止会话生成。
 *
 * @param payload 任务编号参数
 * @returns 后端统一响应
 */
export function stopConversationGeneration(payload: BridgePayload) {
  return callHarnessAction('conversation.stopGeneration', payload)
}

/**
 * 记录消息复制行为。
 *
 * @param payload 消息编号参数
 * @returns 后端统一响应
 */
export function copyMessage(payload: BridgePayload) {
  return callHarnessAction('message.copy', payload)
}

/**
 * 更新运行配置。
 *
 * @param payload 模型、审批模式与思考强度参数
 * @returns 后端统一响应
 */
export function updateRuntimeSettings(payload: BridgePayload) {
  return callHarnessAction('settings.updateRuntime', payload)
}

/**
 * 回复审批权限弹窗。
 *
 * @param payload 审批决策参数
 * @returns 后端统一响应
 */
export function respondApprovalPrompt(payload: BridgePayload) {
  return callHarnessAction('approval.respond', payload)
}

/**
 * 回复计划选择弹窗。
 *
 * @param payload 计划选择参数
 * @returns 后端统一响应
 */
export function respondPlanPrompt(payload: BridgePayload) {
  return callHarnessAction('plan.respond', payload)
}

/**
 * 获取当前执行计划。
 *
 * @param payload 会话编号参数
 * @returns 后端统一响应
 */
export function getCurrentPlan(payload: BridgePayload) {
  return callHarnessAction('plan.getCurrent', payload)
}

/**
 * 打开工具选择器。
 *
 * @param payload 工具搜索参数
 * @returns 后端统一响应
 */
export function pickTool(payload: BridgePayload) {
  return callHarnessAction('tool.pick', payload)
}

/**
 * 选择附件文件。
 *
 * @param payload 附件选择参数
 * @returns 后端统一响应
 */
export function pickAttachment(payload: BridgePayload) {
  return callHarnessAction('file.pickAttachment', payload)
}

/**
 * 打开生成文件。
 *
 * @param payload 文件编号参数
 * @returns 后端统一响应
 */
export function openGeneratedFile(payload: BridgePayload) {
  return callHarnessAction('file.openGenerated', payload)
}

/**
 * 打开上下文选择器。
 *
 * @param payload 上下文搜索参数
 * @returns 后端统一响应
 */
export function pickContext(payload: BridgePayload) {
  return callHarnessAction('context.pick', payload)
}

/**
 * 获取上下文用量。
 *
 * @param payload 会话编号参数
 * @returns 后端统一响应
 */
export function getContextUsage(payload: BridgePayload) {
  return callHarnessAction('context.getUsage', payload)
}

/**
 * 获取 Git 状态。
 *
 * @param payload 项目编号参数
 * @returns 后端统一响应
 */
export function getGitStatus(payload: BridgePayload) {
  return callHarnessAction('git.getStatus', payload)
}

/**
 * 打开 Git 面板。
 *
 * @param payload 项目编号参数
 * @returns 后端统一响应
 */
export function openGitPanel(payload: BridgePayload) {
  return callHarnessAction('git.openPanel', payload)
}

/**
 * 执行全局搜索。
 *
 * @param payload 搜索关键词与范围
 * @returns 后端统一响应
 */
export function querySearch(payload: BridgePayload) {
  return callHarnessAction('search.query', payload)
}

/**
 * 打开功能面板。
 *
 * @param payload 面板名称参数
 * @returns 后端统一响应
 */
export function openPanel(payload: BridgePayload) {
  return callHarnessAction('panel.open', payload)
}
