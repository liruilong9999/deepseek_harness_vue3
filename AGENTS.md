一、文件结构

1. 区块顺序
   每个 .vue 文件按 <template> → <script setup> → <style> 的顺序排布,如有<script>混用(极少数场景)则放在<script setup>前。
   例如：
   <template>
   <!-- 模板 -->
   </template>

   <script setup lang="ts">
   // 逻辑
   </script>

   <style scoped lang="scss">
   /* 样式 */
   </style>

2. 区块说明
<script setup>：必须添加 lang="ts"

<style>：默认使用 scoped 样式；如确需全局样式，请单独抽离到全局样式文件


二、<template> 规范
    2.1 模板结构
    根节点允许单个或多个（无包装），但保持语义清晰

    使用 v-if/v-else/v-for 时，注意性能与可读性
    
    避免模板内书写复杂逻辑：应使用 computed 或方法
    
    2.2 指令使用
    v-for 必须绑定 key，值为唯一稳定标识，严禁使用 index
    
    v-if 与 v-for 不得同级，需要时用 <template> 包装
    
    属性名使用 kebab-case：@click.prevent、:user-name
    
    布尔属性不加值(当为true时)：<input disabled /> 而不是 disabled="true"
    
    条件渲染优先用 v-if/v-else，频繁切换用 v-show
    
    2.3 插槽
    插槽名使用 kebab-case：<template #header-actions>
    
    作用域插槽解构时使用语义化名称：
    <template #item="{ item, index }">
    ...
    </template>
    
    2.4 事件绑定
    事件名使用 kebab-case（模板中）：
    <ChildComponent @update-value="handleUpdate" />
    
    内联处理简单逻辑，复杂逻辑必须提取为函数

三、<script setup lang="ts"> 规范
    3.1 代码顺序需要1：1按照这个来：
    按以下分组，每组之间空行分隔：
     3.1.1、第三方库导入（vue, pinia, lodash 等）
     3.1.2、自定义 Composables 导入
     3.1.3、本地组件与工具函数导入
     3.1.4、类型导入（import type）
     3.1.5、props声明
     3.1.6、Emits声明
     3.1.7、变量声明
     3.1.8、computed声明
     3.1.9、watch声明
     3.1.10、方法声明
     3.1.11、生命周期声明
     比如：
        // 1. 第三方
        import { ref, computed, onMounted } from 'vue'
        import { storeToRefs } from 'pinia'

        // 2. Composables
        import { useUserStore } from '@/store/useUserStore'
        import { useWebSocket } from '@/composables/useWebSocket'
    
        // 3. 组件与工具
        import BaseButton from '@/components/base/BaseButton.vue'
        import { formatDate } from '@/utils/date'
    
        // 4. 类型
        import type { UserInfo } from '@/types/user'
    
        //5 .props
        .......等等
    
    3.2、注意：
        -尽量复用已有组件
        -defineProps声明，defineEmits声明，不要当成types提到别的文件去，直接在当前文件写出来，不然不好阅读
        -Emits 声明：使用类型声明，并给每个事件添加注释
        -优先使用 ref 管理复杂类型时可用 reactive，但除表单外不建议过度使用
        -computed 保持纯函数，不产生副作用
        -watch/watchEffect 必须明确清理（当有定时器、订阅等时）；组件卸载时自动停止，但若手动创建资源需在 onUnmounted 中释放
        -生命周期按执行顺序排列：onBeforeMount, onMounted, ...
        -方法声明用function ,避免用const ，与变量定义一眼区分开
        -组件暴露仅暴露必要内容，使用 defineExpose
            defineExpose({
            validate,
            reset
            })
        -状态与通信->跨组件状态使用 Pinia Store，不通过 provide/inject 滥用，父子通信：Props + Emit / v-model、兄弟或全局：Store / WebSocket 订阅
四：<style scoped> 规范
    4.1：样式作用域所有业务组件必须使用 <style scoped>，避免样式污染，若需修改子组件内部样式，必须使用 :deep() 穿透选择器，禁止使用 !important，提高可维护性，统一使用 SCSS（或 Less/Stylus 团队约定），嵌套不超过 3 层，保持样式扁平，优先使用弹性布局和网格布局，避免固定尺寸，字体大小使用 rem/em，间距推荐 rem 或设计变量；views下面的每个业务文件夹下面的vue文件中的样式，可以提成每一个业务的一个公共的scss进行统一管理，比如入口文件index.vue的样式可以由index.scss注入
       

五：封装组件 规范和时机
    5.1：封装组件时机:->
        5.1.1: 重复复用（≥2次）:同一段模板结构出现两次以上;同一组样式和交互逻辑被复制粘贴(例子：多个页面的“空状态”显示文案不同，但结构和样式一致 → 封装 <EmptyState />)，这种就要提到全局src/components下面去充当全局公共组件。
        5.1.2: 单一职责单元：该单元完成一项明确的展示或交互任务，在语义上与父组件有明确分层例如分为一张卡片区域、一个文件上传区域，一个树区域等等，这些有明确“身份”的 UI 块。
        5.1.3：频繁条件判断或分支，模板中出现大量 v-if="type === 'a'" 来选择不同子结构，可以拆分为各个类型的专用组件，父组件只负责渲染对应的子组件。例子：通知卡片有“系统通知”、“点赞通知”、“评论通知”三种样式 → 拆分为三个子组件，或一个容器组件内动态选择
    5.2： 二次封装组件使用 v-bind="$attrs" 并合并自定义 props，同时通过 useAttrs() 区分继承属性。尽可能保留原组件的灵活性和功能，不随意阉割。原组件的核心能力通过透传保留，而非重新声明。封装后组件的 TypeScript 类型必须完整，不丢失原组件类型信息。不要过度封装：仅当有明确复用价值或一致性需求时才封装。
    5.3：自定义组件规范：template的思考（Slot还是组件里写好？）1、基本原则是内容固定就写死，不确定的部分slot传入，此外还要考虑数据传递的问题把某一个行为分成基本部分和业务部分，建议每一个行为都留给父组件监听，业务部分用emit抛出去自己处理，基本部分作通用化处理 。props的思考（到底哪些东西作为props，哪些东西作为组件本身的data）1、组件前端行为需要的数据内部定义，业务相关数据父组件传入2、props也是一个组件扩展的重要接口、需要父组件二次处理的，比如格式化数据，就需要用作用域插槽，由子组件抛给父组件处理。

六：代码抽离hook的地方和时机，如何区分是提公共方法还是抽离hook
    6.1:代码抽离hook的地方:在当前业务文件夹下建立hooks文件夹，对应的业务hook就放进去
    6.2：hooks抽离的场景和时机：逻辑虽然当前只在一处，但复杂度高（超过 30 行且包含多个 watch/生命周期）；多人协作且其他开发者需要使用类似功能；同一逻辑在 2 个或以上 组件中出现。暂时不抽离的情况：逻辑仅在一个组件内使用，且短小精悍（如一个简单的 toggle）。逻辑与组件模板强绑定，抽离后会导致 Props 和回调过度传递。需要响应式状态：内部维护会被视图或其它逻辑使用的响应式数据。需要生命周期钩子：需要在挂载/卸载时注册/清理资源（如 DOM 事件、定时器、WebSocket 订阅）。组合多个响应式 API：组合运用 watch, computed, provide/inject 等 Vue 特性。提供模板可直接绑定的方法：返回的函数用于 @click="handleSubmit" 等。多个组件共享同一有状态的逻辑：不仅仅是数据格式转换，而是包含交互状态（如加载、错误、分页）。
    6.3：抽离为工具函数存放的地方：一般放在src/utils下面
    6.3:抽离为工具函数的场景:纯数据转换/计算：无任何响应式依赖，输入确定则输出确定。通用算法/格式化：日期格式化、数字千分位、深拷贝、排序、校验规则等。不依赖 Vue：代码可以直接在 Node.js 或任何 JS 环境运行。无副作用或副作用可忽略：不涉及 DOM、网络、存储等外部资源，或调用方自行管理。需要在多处复用，但无需响应式包裹：即使它在组件内使用，也只是把结果赋值给一个 ref，那逻辑本身仍可保持纯净。

七：关于ts类型的定义规范，该怎么放，怎么定义
    把ts的类型定义全部放在src/types一个文件夹里管理，然后按照全局、api、业务，业务下再细分模块去定义。
八：注释的规范
    8.1、总体原则
    注释为何，而非什么：代码本身说明“做了什么”，注释解释“为什么这样做”和“设计意图”。
    保持及时更新：代码变更，注释同步更新。过时注释比没有注释更可怕。
    公共 API 必须注释：所有导出给外部使用的函数、类型、组件 Props、Composable 都必须有 JSDoc。
    非英语团队：注释统一使用中文，专有名词保留英文。
    方法或函数定义处（说明用途、入参、返回值）。
    关键变量定义处（说明业务含义，不只写类型）。
    关键逻辑分支处（说明“为什么这样做”）。
    注释要求简洁、准确，避免无意义注释。
    方法用/** **/这种格式注释在上方，其余注释用//加在上方
    8.2 文件头注释 ：每个文件开头可携带简洁的说明，标注模块职责及注意事项。
    8.3 类型定义注释（TypeScript / JSDoc）：所有导出的 interface, type, enum 及其属性必须用 JSDoc 描述。借助 VSCode 的悬停提示，调用方无需跳转查看源码。
    8.4 Props 是组件的公共合同，每个属性都要注释。 Emits 注释每个事件必须说明触发时机和参数含义。复杂逻辑与行内注释，模板内尽量不写复杂逻辑，如不可避免，用单行注释解释条件。<script> 中的算法、特殊边界处理需用行内注释说明为什么这样写。
    8.5 工具函数注释，纯工具函数建议使用完整的 JSDoc，写明参数、异常和示例，以便脱离 IDE 也能理解。
    8.6 API 接口注释，在 api/ 模块中，每个请求函数必须注释用途、URL（可选）、参数与返回类型。