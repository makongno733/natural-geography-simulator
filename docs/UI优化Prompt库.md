# 地理教学系统 UI 优化 Prompt 库

> 来源:根据 git 提交 `69d2a46`(冷色清爽教科书风)与 `89cb544`(液态玻璃·虹彩·动效纪律)的完整实现整理。
> 每条 prompt 均可独立复制使用,也可按顺序组合成一次完整改版指令。

---

## Prompt 1 · 总纲(一次改版的开场指令)

```
请对「中学地理教学系统」全站 UI 做一次视觉升级,目标风格是:
「iOS 26 液态玻璃 + 青金石材质 + 虹彩高光 + 动效纪律」,面向中学生教学场景,
必须保持教学严肃性与中文界面,视觉华丽但不花哨、不喧宾夺主。

硬性要求:
1. 所有颜色、圆角、阴影、渐变、动画时长一律通过 CSS 自定义属性(--*)统一定义在
   src/style.css 的 :root,组件内只引用变量,不写死色值。
2. 旧组件使用的旧变量名(如 --red/--cream/--paper/--grid-green/--button-green/
   --brown/--card-bg)必须保留为别名映射到新色板,保证历史组件零改动自动换肤。
3. 动效必须遵守「动效纪律」:尊重系统「减弱动态效果」、页面切后台全部暂停、
   空闲自动休眠;任何装饰性动画不得影响可读性与性能。
4. 不得改动任何教学文案、路由、数据结构与 Three.js 场景逻辑,只动视觉层。
5. 完成后运行 pnpm build 验证构建通过。
```

---

## Prompt 2 · 语义色板与设计令牌

```
定义一套「青金石·白水晶·镜面」冷色语义色板,全部放在 :root:

【主色】深群青宝石蓝
- --accent: #2456d6 (主强调色)
- --accent-strong: #1a3fb0 (按压/悬停加深)
- --accent-soft: #e9f0ff (浅色底)
- --accent-softer: #f2f6ff (更浅底)
- --accent-ink: #ffffff (强调色上的文字)

【文字】
- --text: #1a2733 / --text-muted: #5c6b7a / --text-faint: #8a97a6

【液态玻璃面】
- --surface: rgba(255,255,255,0.66) (半透明白)
- --surface-soft: rgba(250,251,253,0.55)
- --glass-border: rgba(255,255,255,0.65) (玻璃亮边)
- --blur: blur(24px) saturate(1.8) (统一毛玻璃参数)
- --border: #dbe5f0 / --border-strong: #c0cfe0

【阴影】苹果式柔和弥散投影 + 顶部 1px 玻璃高光棱 + 外圈 1px 白描边
- --shadow-sm: 0 1px 2px rgba(15,40,80,0.05), 0 10px 32px rgba(24,70,150,0.13),
  inset 0 1px 0 rgba(255,255,255,0.85), 0 0 0 1px rgba(255,255,255,0.4)
- --shadow-hover: 同结构但 0 20px 48px rgba(24,70,150,0.2)、inset 不透明度提到 0.95

【圆角】苹果式大圆角
- --radius-card: 18px / --radius-box: 20px / --radius-sm: 10px / --radius-pill: 999px
- --transition: 0.18s

【青金石材质渐变】(深群青,像宝石切面由浅入深)
- --lapis: linear-gradient(155deg, #4d74e8 0%, #3a5cd8 20%, #2a48c0 40%,
  #1f369e 58%, #18289a 74%, #0f1c70 100%)
- --lapis-deep: linear-gradient(155deg, #3a5cd8 0%, #2441b8 30%, #1f3aac 50%, #122283 100%)

【冰晶星屑】深群青里嵌 4~5 个 1~1.5px 的白/淡蓝 radial-gradient 亮点(仿钻石碎光)
【镜面高光】--specular: inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -2px 4px rgba(3,12,46,0.4)
【宝石光晕】--gem-glow: 0 4px 20px rgba(40,80,200,0.42), 0 1px 3px rgba(10,30,90,0.28),
  0 0 44px rgba(70,120,235,0.28)

【铂金包边】(替代金色的高光描边,冰晶感)
- --platinum: linear-gradient(120deg, #fff 0%, #dfeaf7 30%, #b8c8dc 52%, #eef4fb 100%)

【虹彩色带】(低饱和淡彩,两端渐隐,像光融化在玻璃里,不抢眼)
- --rainbow: linear-gradient(90deg, #a8c4ff, #b9a8ff 22%, #e0b8ee 45%, #b9a8ff 68%, #a8c4ff)
- --rainbow-fade: 同色相但两端 transparent(横向渐隐)
- --rainbow-fade-v: 纵向渐隐版
- --rainbow-sweep: 两端 transparent 的扫光带,用于按钮/卡片 hover 扫光

【旧变量别名】--ink→--text、--muted→--text-muted、--red→--accent、--red-hover→--accent-strong、
--cream→--surface-soft、--paper→--bg-soft、--button-green→--accent-soft、
--button-green-deep→--accent-strong、--brown→--border、--card-bg→--surface、
--grid-green/--grid-gold→transparent(废弃的网格线背景直接移除)
```

---

## Prompt 3 · 页面背景(极光氛围 + 鼠标光斑)

```
背景分四层,全部装饰性、固定不动(background-attachment: fixed):

1. 基底:斜向线性渐变 + 三个柔和大光斑(右上蓝、左下蓝紫、底部蓝),
   末层再叠一条 180deg 的 #f4f8fe→#e7eefb→#dae6f6 线性渐变。
2. 极光层(.aurora):fixed 全屏、inset -15%、pointer-events:none,
   3~4 个 rgba(150~224, 160~190, 230~255, 0.10~0.18) 的大块 radial-gradient,
   动画 aurora-drift 22s 往复漂移缩放(±2.5%、scale 1→1.07)+ glow-hue 48s hue-rotate 360°。
3. 鼠标光斑层(.cursor-glow):fixed 全屏、pointer-events:none,
   radial-gradient(640px circle at var(--mx) var(--my), rgba(120,170,255,0.26), transparent 70%),
   光标位置由 JS 以 0.08 插值系数平滑写入 CSS 变量 --mx/--my,光斑自身 glow-hue 14s 缓慢变色。
4. 顶部彩虹加载条(.top-rainbow):fixed 顶部、高 2.5px、z-index 300,
   background 为 --rainbow、background-size 300%、rainbow-slide 1.1s 循环,
   默认 opacity 0;路由 beforeEach 时加 .active 亮起,afterEach 后 420ms 熄灭。

性能要求(动效纪律):
- 鼠标静止超过 2 秒,requestAnimationFrame 循环自动退出休眠;
- document.hidden 时给 <html> 加 .motion-paused 类暂停全部 CSS 动画,恢复可见时移除;
- 系统 prefers-reduced-motion: reduce 时完全不启动 rAF 循环;
- 所有装饰层 aria-hidden="true" 且 pointer-events: none,不得遮挡交互。
```

---

## Prompt 4 · 液态玻璃组件(卡片 / 面板 / 顶栏)

```
统一改造所有卡片与面板为「液态玻璃」质感:

1. 面板:为所有 class 含 "-panel" 的元素自动附加
   -webkit-backdrop-filter/backdrop-filter: var(--blur)(用属性选择器 [class*="-panel"] 一次覆盖全站)。
2. 卡片基础样式:background: var(--surface);border: 1px solid var(--glass-border);
   border-radius: var(--radius-box);box-shadow: var(--shadow-sm)。
3. 顶栏:.app-header 保持 sticky,背景降为 rgba(255,255,255,0.5) + var(--blur),
   底部改为 1px rgba(255,255,255,0.6) 白色亮边。
4. hover 行为:不用「上浮」位移,改为背景变 --accent-softer、边框变 --accent 的「点亮」式反馈;
   可选给卡片加 .sheen-card:overlay 一道 40% 宽的白光斜带,
   hover 时 0.65s 从 translateX(-170%) 滑到 370%(玻璃反光扫过)。
5. 左侧彩虹条:重要入口卡片(如首页入口卡、实验卡)加 ::before 伪元素——
   宽 3px、贴左、纵向彩虹 --rainbow-fade-v、background-size 300%、
   rainbow-slide 4s 往复流动,圆角 999px 0 0 999px。
6. 所有玻璃元素必须同时提供 -webkit-backdrop-filter(兼容 Safari/Electron)。
```

---

## Prompt 5 · 宝石按钮与高光

```
主按钮做成「青金石宝石」质感,四层结构:

1. 底材:background: var(--gem-flecks), var(--gem)(先星屑后青金石渐变);
   box-shadow: var(--gem-glow), var(--gem-inner)(外光晕 + 内镜面高光)。
2. 形状:border-radius: 999px;border: 1px solid var(--accent-strong);文字白色、font-weight 700。
3. 扫光:::after 宽 45% 的 --rainbow-sweep 光带,skewX(-14deg),
   hover 时 0.55s 从 translateX(-140%) 滑到 340%(彩虹扫光)。
4. hover 态:背景换成 --gem-deep(更深一档),光晕压到
   0 6px 20px rgba(31,111,235,0.42) + var(--gem-inner),边框加深 #154aa8。

按压反馈:全局 button:active { transform: scale(0.96); }(iOS 式轻按回弹),
同时 -webkit-tap-highlight-color: transparent。

可复用类 .gem-face:元素套上后自动获得宝石底 + 每 3.2s 一次的斜向白光扫过
(animation: gem-shine 3.2s cubic-bezier(0.4,0,0.2,1) infinite),
适合首页 Hero 标题底饰、区块分隔等装饰性高光。
```

---

## Prompt 6 · 虹彩微动效(Logo / 导航 / 标题)

```
为品牌与导航加三处虹彩微动效,全部低饱和、动画统一走 --transition 时长体系:

1. 品牌 Logo(.brand-mark):中心小球用 --rainbow 渐变 + rainbow-slide 4.5s;
   外圈用 conic-gradient(#a8c4ff,#b9a8ff,#e0b8ee,#b9d4ff,#a8c4ff) 的
   Apple 式跑马灯(mask 挖成 2px 细环)+ rainbow-spin 2.6s;
   再外一圈 Siri 双环:反向旋转(reverse)、更高一层(inset -3px)、
   只留 42~92° 一段光弧(其余 transparent)、opacity 0.85。
2. 导航链接下划线:.nav-link::after 高 2px、--rainbow-fade、rainbow-slide 5s,
   默认 scaleX(0),hover/active 时 scaleX(1),transform-origin 左端。
3. Hero 主标题:文字用 115deg 深蓝渐变(#0f2d5c→#1f6feb→#4d9bff→#14396f)的
   background-clip: text 做成宝石字;下方 96px×3px 的 --rainbow-fade 分隔线
   + 0 0 12px rgba(124,58,237,0.4) 紫色微光。
```

---

## Prompt 7 · 动效纪律(无障碍 + 省电)

```
全站动画必须服从以下纪律,任何新动效都要遵守:

1. 系统减弱动态:
   @media (prefers-reduced-motion: reduce) 下,所有元素
   animation-duration / transition-duration 压到 0.01ms、animation-iteration-count 为 1。
2. 后台暂停:document 的 visibilitychange 事件里,
   页面隐藏时给 <html> 加 .motion-paused,该类的 CSS 规则
   animation-play-state: paused !important 作用于全部元素及伪元素;恢复可见时移除类并恢复 rAF。
3. 空闲休眠:鼠标跟踪类 rAF 循环在静止 2 秒后自行退出(cancel 由循环内判断);
   所有事件监听使用 { passive: true };组件卸载(onBeforeUnmount)时必须
   移除全部监听、clearTimeout、cancelAnimationFrame、移除 .motion-paused。
4. 焦点可见性:保留 :focus-visible 的 2px --accent 外框(键盘可访问性)。
5. 装饰元素全部 aria-hidden="true" + pointer-events: none,不影响读屏与点击。
```

---

## Prompt 8 · 页面过渡与点击反馈

```
1. 路由过渡:router-view 外层套 <transition name="page" mode="out-in">,
   以 route.path 为 :key。动画:进入 opacity 0→1 + translateY(10px→0),
   离开 translateY(0→-8px),时长 0.22s ease(快、克制,不拖堂)。
2. 点击星光:window 级 click 监听,在光标处生成一个 ✦ 字符元素,
   动画 sparkle-pop 0.7s ease-out forwards:scale 0.3→1.25(30% 时)→0.5、
   同时上飘 16px、旋转 0→28°→60°、opacity 0→1→0;
   颜色 #e8f2ff,text-shadow 双层蓝色辉光(0 0 8px + 0 0 18px);
   720ms 后从数组移除。整层 pointer-events:none、z-index 100。
3. 滚动条:宽 9px、thumb #cdd7e2 圆角 2px、hover #b6c4d3、轨道透明。
```

---

## Prompt 9 · 移动端与排版守则

```
1. 断点 ≤720px:顶栏改为纵向排列(品牌一行、导航占满一行),导航项 flex:1 均分、
   字号 13px、居中对齐;hero 标题用 clamp(32px,5vw,46px)。
2. 字体栈:"PingFang SC","Microsoft YaHei","Noto Sans SC","Helvetica Neue",sans-serif;
   标题统一 letter-spacing 0.01em;全局 -webkit-font-smoothing: antialiased +
   text-rendering: optimizeLegibility。
3. 所有文本元素(body/button/a/p/h1~h4/span/li/div)overflow-wrap: anywhere,防长词溢出。
4. html/body overflow-x: hidden,防止光斑、极光层造成横向滚动。
5. 教学场景底线:正文区域对比度保持 WCAG AA(文字 #1a2733 对浅底);
   实验操作按钮、知识面板标签等可读性优先,装饰光效只允许出现在非正文层。
```

---

## 组合用法(一次性完整改版)

把 Prompt 1(总纲)+ Prompt 2(色板)+ Prompt 3(背景)+ Prompt 4(玻璃组件)+
Prompt 5(宝石按钮)+ Prompt 6(虹彩微动效)+ Prompt 7(动效纪律)+ Prompt 8(过渡与点击)
按顺序合并成一条指令发出,即可复现当前「液态玻璃·虹彩·动效纪律」的完整改版。

单独微调时只复制对应条目,并在结尾附上:
「只改本次指定的范围,其余视觉与交互保持现状;完成后运行 pnpm build 验证。」
