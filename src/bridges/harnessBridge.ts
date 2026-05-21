/**
 * DeepSeek Harness 的 QtWebView 本地桥接层。
 *
 * 本文件只负责建立 JavaScript 与 Qt 后端之间的统一入口，不直接处理界面渲染。
 */

/** 本地桥接返回状态码。 */
export type BridgeCode =
  | 'OK'
  | 'INVALID_ARGUMENT'
  | 'NOT_FOUND'
  | 'PERMISSION_REQUIRED'
  | 'CANCELLED'
  | 'BACKEND_BUSY'
  | 'INTERNAL_ERROR'

/** 前端可以调用的后端动作名称。 */
export type HarnessAction =
  | 'app.getSnapshot'
  | 'app.refresh'
  | 'project.list'
  | 'project.pickFolder'
  | 'project.open'
  | 'project.toggleExpanded'
  | 'conversation.open'
  | 'conversation.create'
  | 'conversation.getDetail'
  | 'conversation.rename'
  | 'conversation.refresh'
  | 'conversation.getActions'
  | 'conversation.runAction'
  | 'conversation.sendMessage'
  | 'conversation.stopGeneration'
  | 'message.copy'
  | 'settings.updateRuntime'
  | 'approval.respond'
  | 'plan.respond'
  | 'plan.getCurrent'
  | 'tool.pick'
  | 'file.pickAttachment'
  | 'file.openGenerated'
  | 'context.pick'
  | 'context.getUsage'
  | 'git.getStatus'
  | 'git.openPanel'
  | 'search.query'
  | 'panel.open'

/** Qt 后端可以推送给前端的事件名称。 */
export type HarnessEventName =
  | 'app.snapshot.updated'
  | 'project.list.updated'
  | 'conversation.active.changed'
  | 'conversation.message.started'
  | 'conversation.message.delta'
  | 'conversation.message.finished'
  | 'conversation.message.failed'
  | 'conversation.message.cancelled'
  | 'conversation.task.updated'
  | 'conversation.updated'
  | 'settings.updated'
  | 'approval.prompt.show'
  | 'prompt.hide'
  | 'plan.prompt.show'
  | 'execution.plan.updated'
  | 'tool.execution.updated'
  | 'generated.files.updated'
  | 'context.usage.updated'
  | 'git.status.updated'
  | 'error.raised'

/** 后端返回给前端的统一结果结构。 */
export interface BridgeResponse<TData = unknown> {
  /** 请求编号，便于前后端日志关联。 */
  requestId: string
  /** 当前调用是否成功。 */
  success: boolean
  /** 当前调用状态码。 */
  code: BridgeCode
  /** 面向用户或日志的中文提示。 */
  message: string
  /** 后端返回的业务数据。 */
  data: TData | null
}

/** Qt 注入到 window 上的后端桥接对象。 */
export interface HarnessBackendBridge {
  /**
   * 调用 Qt 后端动作。
   *
   * @param action 动作名称
   * @param payloadJson JSON 字符串参数
   * @returns 后端统一结果 JSON 字符串
   */
  invoke(action: string, payloadJson: string): Promise<string> | string
}

/** 后端推送事件时前端暴露在 window 上的接口。 */
export interface HarnessUIApi {
  /**
   * 分发后端推送事件。
   *
   * @param eventName 事件名称
   * @param payload 事件载荷
   */
  dispatch(eventName: HarnessEventName, payload: unknown): void
  /** 应用全量页面快照。 */
  applySnapshot(payload: unknown): void
  /** 追加助手消息流式增量。 */
  appendMessageDelta(payload: unknown): void
  /** 完成助手消息。 */
  finishMessage(payload: unknown): void
  /** 显示审批权限弹窗。 */
  showApprovalPrompt(payload: unknown): void
  /** 显示计划选择弹窗。 */
  showPlanPrompt(payload: unknown): void
  /** 隐藏审批或计划弹窗。 */
  hidePrompt(payload: unknown): void
  /** 更新右侧执行计划。 */
  updatePlan(payload: unknown): void
  /** 更新右侧 Git 状态。 */
  updateGitStatus(payload: unknown): void
  /** 更新右侧上下文状态。 */
  updateContextUsage(payload: unknown): void
  /** 显示后端错误。 */
  showError(payload: unknown): void
}

/** 后端事件处理函数。 */
export type HarnessEventHandler = (payload: unknown) => void

/** 后端事件处理函数映射。 */
export type HarnessEventHandlerMap = Partial<Record<HarnessEventName, HarnessEventHandler>>

declare global {
  interface Window {
    /** Qt 后端注入的桥接对象。 */
    harnessBridge?: HarnessBackendBridge
    /** 前端暴露给 Qt 后端调用的界面接口。 */
    HarnessUI?: HarnessUIApi
  }
}

/** 当前已注册的后端推送事件处理函数。 */
let harnessEventHandlers: HarnessEventHandlerMap = {}

/**
 * 创建失败响应，保证桥接异常也能以统一格式返回给业务层。
 *
 * @param code 状态码
 * @param message 中文错误提示
 * @returns 统一失败响应
 */
function createFailureResponse<TData>(code: BridgeCode, message: string): BridgeResponse<TData> {
  return {
    requestId: '',
    success: false,
    code,
    message,
    data: null,
  }
}

/**
 * 解析后端桥接返回值。
 *
 * @param rawResponse 后端返回的 JSON 字符串
 * @returns 统一响应结构
 */
function parseBridgeResponse<TData>(rawResponse: string): BridgeResponse<TData> {
  try {
    return JSON.parse(rawResponse) as BridgeResponse<TData>
  } catch {
    return createFailureResponse<TData>('INTERNAL_ERROR', '后端桥接返回不是合法 JSON')
  }
}

/**
 * 调用 Qt 后端桥接动作。
 *
 * @param action 动作名称
 * @param payload 业务参数
 * @returns 统一响应结构
 */
export async function invokeHarnessBridge<TData = unknown, TPayload extends object = Record<string, never>>(
  action: HarnessAction,
  payload = {} as TPayload,
): Promise<BridgeResponse<TData>> {
  if (!window.harnessBridge?.invoke) {
    return createFailureResponse<TData>('BACKEND_BUSY', 'Qt 后端桥接对象尚未注入')
  }

  try {
    const rawResponse = await window.harnessBridge.invoke(action, JSON.stringify(payload))

    return parseBridgeResponse<TData>(rawResponse)
  } catch {
    return createFailureResponse<TData>('INTERNAL_ERROR', `调用后端动作 ${action} 失败`)
  }
}

/**
 * 等待 Qt WebChannel 注入后端桥接对象。
 *
 * Qt 注入 qwebchannel.js 后会异步把注册对象挂到 window 上，页面刚挂载时可能还拿不到。
 */
export function waitForHarnessBridge(timeoutMs = 3000, intervalMs = 50): Promise<boolean> {
  const startedAt = Date.now()

  return new Promise((resolve) => {
    const checkBridge = () => {
      if (window.harnessBridge?.invoke) {
        resolve(true)
        return
      }

      if (Date.now() - startedAt >= timeoutMs) {
        resolve(false)
        return
      }

      window.setTimeout(checkBridge, intervalMs)
    }

    checkBridge()
  })
}

/**
 * 分发 Qt 后端推送事件。
 *
 * @param eventName 事件名称
 * @param payload 事件载荷
 */
export function dispatchHarnessEvent(eventName: HarnessEventName, payload: unknown) {
  harnessEventHandlers[eventName]?.(payload)
}

/**
 * 注册前端暴露给 Qt 后端的 window.HarnessUI 接口。
 *
 * @param handlers 事件处理函数映射
 * @returns 取消注册函数
 */
export function registerHarnessUI(handlers: HarnessEventHandlerMap = {}) {
  harnessEventHandlers = {
    ...harnessEventHandlers,
    ...handlers,
  }

  window.HarnessUI = {
    dispatch: dispatchHarnessEvent,
    applySnapshot: (payload) => dispatchHarnessEvent('app.snapshot.updated', payload),
    appendMessageDelta: (payload) => dispatchHarnessEvent('conversation.message.delta', payload),
    finishMessage: (payload) => dispatchHarnessEvent('conversation.message.finished', payload),
    showApprovalPrompt: (payload) => dispatchHarnessEvent('approval.prompt.show', payload),
    showPlanPrompt: (payload) => dispatchHarnessEvent('plan.prompt.show', payload),
    hidePrompt: (payload) => dispatchHarnessEvent('prompt.hide', payload),
    updatePlan: (payload) => dispatchHarnessEvent('execution.plan.updated', payload),
    updateGitStatus: (payload) => dispatchHarnessEvent('git.status.updated', payload),
    updateContextUsage: (payload) => dispatchHarnessEvent('context.usage.updated', payload),
    showError: (payload) => dispatchHarnessEvent('error.raised', payload),
  }

  return () => {
    harnessEventHandlers = {}
    delete window.HarnessUI
  }
}

/**
 * 获取页面全量快照。
 *
 * @returns 后端页面快照响应
 */
export function getAppSnapshot<TData = unknown>() {
  return invokeHarnessBridge<TData>('app.getSnapshot')
}

/**
 * 按作用域刷新页面数据。
 *
 * @param scopes 需要刷新的数据范围
 * @returns 后端局部刷新响应
 */
export function refreshApp<TData = unknown>(scopes: string[]) {
  return invokeHarnessBridge<TData, { scopes: string[] }>('app.refresh', { scopes })
}

/**
 * 调用指定后端动作。
 *
 * @param action 动作名称
 * @param payload 业务参数
 * @returns 后端统一响应
 */
export function callHarnessAction<TData = unknown, TPayload extends object = Record<string, never>>(
  action: HarnessAction,
  payload = {} as TPayload,
) {
  return invokeHarnessBridge<TData, TPayload>(action, payload)
}
