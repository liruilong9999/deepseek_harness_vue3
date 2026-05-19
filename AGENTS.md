# AGENTS.md

本文件定义本项目中 Codex、开发者和自动化脚本应共同遵守的协作与编码规范。目标是让 Vue 3 + TypeScript 代码结构稳定、可读、可维护，减少隐式约定和个人风格差异。

## 一、适用范围与优先级

1. 本文件适用于当前项目内的所有代码、文档、脚本和自动化修改。
2. 若用户在对话中给出更具体的临时要求，以用户要求为准。
3. 若子目录存在更近层级的 `AGENTS.md`，以更近层级文件为准。
4. 修改已有代码时，优先保持当前模块的设计风格；新代码必须遵守本文规范。

## 二、通用要求

### 2.1 文档要求

1. Markdown 文档默认使用中文，除非用户明确要求英文。
2. Markdown 中的流程图、架构图、状态图等，图内文字也使用中文。
3. 专业术语首次出现时需附英文原词和中文解释，例如：`Composable(组合式逻辑函数)`。
4. 文档应结构清晰，避免长段堆叠；复杂内容优先拆成标题、表格、清单或图示。

### 2.2 脚本要求

1. 需要编写可执行脚本时，必须提供系统入口脚本。
2. Windows 环境提供 `.bat` 入口，Linux/macOS 环境提供 `.sh` 入口。
3. Python、Node.js 等脚本不应要求用户手动记忆命令，入口脚本应可双击或一条命令执行。

## 三、Vue 单文件组件规范

### 3.1 文件区块顺序

每个 `.vue` 文件按以下顺序组织：

```vue
<template>
  <!-- 模板 -->
</template>

<script setup lang="ts">
// 逻辑
</script>

<style scoped lang="scss">
/* 样式 */
</style>
```

要求：

1. `<template>` 放在最前。
2. `<script setup>` 必须使用 `lang="ts"`。
3. `<style>` 默认使用 `scoped` 和 `lang="scss"`。
4. 如确需混用普通 `<script>`，放在 `<script setup>` 前方，且仅用于少量框架级特殊场景。
5. 如确需全局样式，抽离到全局样式文件，不在业务组件中直接污染全局作用域。

## 四、Template 规范

### 4.1 结构与可读性

1. 根节点可以是单个或多个，但必须保持语义清晰。
2. 模板中避免复杂表达式和复杂业务判断，优先抽到 `computed` 或方法中。
3. `v-if`、`v-else`、`v-for` 应兼顾性能与可读性。
4. 频繁切换显示状态时使用 `v-show`，条件分支切换时使用 `v-if`。

### 4.2 指令与属性

1. `v-for` 必须绑定唯一且稳定的 `key`，禁止使用 `index` 作为 `key`。
2. `v-if` 与 `v-for` 不得写在同一节点上，必要时使用 `<template>` 包装。
3. 模板属性名使用 `kebab-case`，例如 `:user-name`、`@update-value`。
4. 布尔属性为 `true` 时不写值，例如 `<input disabled />`，不要写 `disabled="true"`。
5. 简单事件逻辑可以内联，复杂逻辑必须提取为方法。

### 4.3 插槽

1. 插槽名使用 `kebab-case`，例如 `<template #header-actions>`。
2. 作用域插槽解构时使用语义化命名。

```vue
<template #item="{ item, index }">
  ...
</template>
```

### 4.4 事件

1. 组件事件名在模板中使用 `kebab-case`。
2. 父子通信优先使用 `Props + Emit` 或 `v-model`。
3. 兄弟组件或全局状态通信优先使用 Pinia Store 或明确的订阅机制。
4. 不滥用 `provide/inject` 进行跨组件状态传递。

## 五、Script Setup 规范

### 5.1 代码分组顺序

`<script setup lang="ts">` 中必须按以下顺序书写，每组之间空一行：

1. 第三方库导入，例如 `vue`、`pinia`、`lodash`。
2. 自定义 Composables 导入。
3. 本地组件、工具函数导入。
4. 类型导入，使用 `import type`。
5. `defineProps` 声明。
6. `defineEmits` 声明。
7. 变量声明。
8. `computed` 声明。
9. `watch` 或 `watchEffect` 声明。
10. 方法声明。
11. 生命周期声明。
12. `defineExpose` 声明。

示例：

```ts
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'

import { useWebSocket } from '@/composables/useWebSocket'
import { useUserStore } from '@/store/useUserStore'

import BaseButton from '@/components/base/BaseButton.vue'
import { formatDate } from '@/utils/date'

import type { UserInfo } from '@/types/user'

const props = defineProps<{
  /** 用户信息 */
  userInfo: UserInfo
}>()

const emit = defineEmits<{
  /** 用户提交表单时触发 */
  submit: [value: UserInfo]
}>()

const loading = ref(false)

const userName = computed(() => props.userInfo.name)

function handleSubmit() {
  emit('submit', props.userInfo)
}

onMounted(() => {
  // 初始化逻辑
})
```

### 5.2 Props 与 Emits

1. `defineProps` 和 `defineEmits` 直接写在当前组件中，不抽离到其他类型文件，保证组件公共契约可读。
2. Props 每个属性必须有中文注释，说明业务含义。
3. Emits 使用类型声明，并为每个事件添加中文注释，说明触发时机和参数含义。
4. 组件只通过 `defineExpose` 暴露必要能力。

```ts
defineExpose({
  validate,
  reset
})
```

### 5.3 响应式与副作用

1. 优先使用 `ref`；复杂表单对象可使用 `reactive`，但不要过度使用。
2. `computed` 必须保持纯函数，不产生副作用。
3. `watch`、`watchEffect` 中如创建定时器、订阅、事件监听等资源，必须明确清理。
4. 生命周期按执行顺序排列，例如 `onBeforeMount`、`onMounted`、`onBeforeUnmount`、`onUnmounted`。
5. 方法声明使用 `function`，避免使用 `const` 声明函数，以便与变量定义区分。

## 六、样式规范

### 6.1 基本要求

1. 业务组件必须使用 `<style scoped lang="scss">`。
2. 修改子组件内部样式时使用 `:deep()`，禁止使用 `!important`。
3. SCSS 嵌套不超过 3 层，保持样式扁平。
4. 优先使用 Flex 或 Grid 布局，避免不必要的固定尺寸。
5. 字体大小使用 `rem` 或 `em`，间距优先使用 `rem` 或设计变量。

### 6.2 样式抽离

1. 同一业务目录下多个页面共享样式时，可抽离业务公共 SCSS 文件。
2. `views` 下业务入口组件的样式可按模块抽离，例如 `index.vue` 对应 `index.scss`。
3. 抽离样式时应保持命名语义化，避免全局选择器污染。

## 七、组件封装规范

### 7.1 何时封装组件

满足以下任一条件时，优先考虑封装组件：

1. 同一模板结构、样式或交互逻辑出现 2 次及以上。
2. 某个 UI 块具有明确职责，例如卡片区域、文件上传区域、树区域、筛选区域。
3. 模板中出现大量条件分支，例如多处 `v-if="type === 'xxx'"`。
4. 多个页面存在结构一致但文案、数据或行为不同的区域，例如空状态、详情卡片、操作栏。

### 7.2 组件边界

1. 内容固定时写在组件内部，不确定内容通过 Slot(插槽)传入。
2. 组件内部只维护前端交互状态，业务数据由父组件通过 Props 传入。
3. 需要父组件二次处理的数据，通过作用域插槽或 Emit 暴露。
4. 通用组件应保留原组件核心能力，不随意阉割功能。

### 7.3 二次封装

1. 二次封装组件应使用 `v-bind="$attrs"` 保留透传能力。
2. 必要时使用 `useAttrs()` 区分继承属性和自定义属性。
3. TypeScript 类型必须完整，不丢失原组件类型信息。
4. 不要过度封装，只有存在明确复用价值或一致性需求时才封装。

## 八、Composables 与工具函数

### 8.1 Composables 放置位置

1. 当前业务专用 Composable 放在当前业务目录下的 `hooks` 文件夹。
2. 跨业务复用的 Composable 放在 `src/composables`。
3. Composable 文件命名使用 `useXxx.ts`。

### 8.2 适合抽成 Composable 的场景

1. 逻辑超过 30 行，且包含多个响应式状态、`watch` 或生命周期。
2. 同一有状态逻辑在 2 个及以上组件中出现。
3. 需要在挂载或卸载时注册、清理资源，例如 DOM 事件、定时器、WebSocket 订阅。
4. 需要组合多个 Vue 响应式 API，例如 `ref`、`computed`、`watch`。
5. 需要返回模板可直接绑定的方法，例如 `handleSubmit`、`handleSearch`。

### 8.3 暂不抽成 Composable 的场景

1. 逻辑仅在单个组件中使用，且短小清晰。
2. 逻辑与模板强绑定，抽离后会导致 Props 和回调过度传递。
3. 只是简单开关、格式化或一次性赋值。

### 8.4 工具函数规范

1. 工具函数放在 `src/utils`。
2. 工具函数必须是无 Vue 依赖的纯逻辑，输入确定则输出确定。
3. 适合工具函数的场景包括日期格式化、数字千分位、深拷贝、排序、校验规则、纯数据转换。
4. 涉及 DOM、网络、存储或响应式状态的逻辑，不应放入 `utils`。

## 九、TypeScript 类型规范

1. 全局类型、API 类型、业务类型统一放在 `src/types`。
2. 类型按 `global`、`api`、`business` 等维度拆分，业务类型再按模块细分。
3. 所有导出的 `interface`、`type`、`enum` 及其属性必须有 JSDoc 中文注释。
4. 组件本地 Props 和 Emits 类型直接写在组件中，不抽离到 `src/types`。
5. 类型命名应表达业务含义，避免 `Data`、`Info`、`Item` 等过度泛化命名单独出现。

## 十、注释规范

### 10.1 总体原则

1. 注释解释为什么这样做，而不是重复代码做了什么。
2. 代码变更时必须同步更新相关注释。
3. 注释统一使用中文，专有名词可保留英文。
4. 注释要简洁、准确，避免无意义注释。

### 10.2 必须注释的内容

1. 公共 API、导出函数、导出类型、组件 Props、Composable。
2. 方法或函数定义处，说明用途、参数和返回值。
3. 关键变量定义处，说明业务含义。
4. 关键逻辑分支处，说明设计意图或边界原因。
5. API 请求函数，说明用途、接口地址、参数与返回类型。

### 10.3 注释格式

方法、函数、类型、Props、Emits 使用 JSDoc：

```ts
/**
 * 根据用户 ID 查询用户详情。
 *
 * @param userId 用户唯一标识
 * @returns 用户详情
 */
function fetchUserDetail(userId: string) {
  // ...
}
```

普通逻辑说明使用单行注释，写在对应代码上方：

```ts
// 后端分页从 1 开始，前端表格页码保持同一语义，避免来回转换。
const currentPage = ref(1)
```

## 十一、API 模块规范

1. `api` 模块中的每个请求函数都必须添加 JSDoc。
2. 请求函数应明确参数类型与返回类型。
3. API URL 可在注释中说明，便于维护和排查。
4. 不在组件中直接拼装复杂请求逻辑，复杂参数转换优先放到 API 模块或纯工具函数中。

## 十二、提交前检查清单

提交或交付前，至少确认以下事项：

1. `.vue` 文件区块顺序是否正确。
2. `<script setup>` 是否使用 `lang="ts"`。
3. `v-for` 是否使用稳定唯一的 `key`。
4. Props、Emits、导出类型和公共函数是否有中文注释。
5. 是否存在可抽离的重复组件、Composable 或工具函数。
6. 样式是否使用 `scoped`，是否避免了 `!important`。
7. 是否误改了无关文件或覆盖了他人未提交变更。
