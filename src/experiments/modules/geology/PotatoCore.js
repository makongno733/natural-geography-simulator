const steps = [
  {
    title: '布置勘探网格',
    content: '在地表按一定间距布置勘探网格，标记采样点位。网格间距根据勘探精度要求确定——区域性普查可用较大间距（如 200-500 m），详查阶段需加密至 50-100 m。\n\n本实验中，将土豆视为"地下岩体"，在其表面用牙签或标记笔画出网格线，纵横各 4-5 条，形成 16-25 个网格交点。每个交点即为一个钻孔位置。记录每个孔位的坐标（行号、列号），建立采样定位系统。',
    highlight: '勘探网格是系统化地质勘探的基础——网格越密，对地下构造的空间分辨率越高，但成本也越大。实际矿产勘探中，网格设计需在精度与成本之间权衡。',
    illustration: `<svg width="100%" height="auto" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="200" cy="110" rx="100" ry="50" fill="#e8d5a0" stroke="#b8a57a" stroke-width="2"/>
  <line x1="120" y1="80" x2="120" y2="140" stroke="#9e2426" stroke-width="1" stroke-dasharray="4,3"/>
  <line x1="155" y1="72" x2="155" y2="148" stroke="#9e2426" stroke-width="1" stroke-dasharray="4,3"/>
  <line x1="190" y1="68" x2="190" y2="152" stroke="#9e2426" stroke-width="1" stroke-dasharray="4,3"/>
  <line x1="225" y1="68" x2="225" y2="152" stroke="#9e2426" stroke-width="1" stroke-dasharray="4,3"/>
  <line x1="260" y1="72" x2="260" y2="148" stroke="#9e2426" stroke-width="1" stroke-dasharray="4,3"/>
  <line x1="295" y1="80" x2="295" y2="140" stroke="#9e2426" stroke-width="1" stroke-dasharray="4,3"/>
  <line x1="105" y1="95" x2="310" y2="95" stroke="#9e2426" stroke-width="1" stroke-dasharray="4,3"/>
  <line x1="100" y1="110" x2="315" y2="110" stroke="#9e2426" stroke-width="1" stroke-dasharray="4,3"/>
  <line x1="105" y1="125" x2="310" y2="125" stroke="#9e2426" stroke-width="1" stroke-dasharray="4,3"/>
  <circle cx="120" cy="95" r="3" fill="#9e2426"/>
  <circle cx="155" cy="95" r="3" fill="#9e2426"/>
  <circle cx="190" cy="95" r="3" fill="#9e2426"/>
  <circle cx="225" cy="95" r="3" fill="#9e2426"/>
  <circle cx="155" cy="110" r="3" fill="#9e2426"/>
  <circle cx="190" cy="110" r="3" fill="#9e2426"/>
  <circle cx="225" cy="110" r="3" fill="#9e2426"/>
  <circle cx="260" cy="110" r="3" fill="#9e2426"/>
  <circle cx="155" cy="125" r="3" fill="#9e2426"/>
  <circle cx="190" cy="125" r="3" fill="#9e2426"/>
  <circle cx="225" cy="125" r="3" fill="#9e2426"/>
  <text x="200" y="175" text-anchor="middle" font-size="12" fill="#302820">网格交点 = 钻孔位置  |  纵横线 = 勘探网格</text>
</svg>`,
  },
  {
    title: '钻取岩心样本',
    content: '在标记的每个网格点，用透明吸管（模拟岩心钻机）垂直插入土豆中，旋转并向下推进，获取一段完整的土豆柱作为"岩心样本"。\n\n操作要点：\n1. 保持吸管垂直于土豆表面，缓慢旋转推进\n2. 插到底后轻轻转动半圈，使底部样本断开\n3. 缓慢拔出吸管，保持管内样本完整\n4. 将岩心推出到白纸上，记录该孔位的样本编号\n5. 如果插入深度不够或样本破碎，需在同一位置重新取样',
    highlight: '实际岩心钻探中，钻头内装有岩心管，钻进时岩心进入管内，每钻进一定深度（通常 1.5-3 m）提钻取出岩心。岩心采取率（取出岩心长度/钻进深度）是衡量钻探质量的重要指标，一般要求 ≥ 85%。',
    illustration: `<svg width="100%" height="auto" viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="180" cy="160" rx="90" ry="40" fill="#e8d5a0" stroke="#b8a57a" stroke-width="2"/>
  <text x="180" y="165" text-anchor="middle" font-size="10" fill="#302820">土豆（地下岩体）</text>
  <rect x="173" y="50" width="14" height="100" rx="7" fill="rgba(200,220,240,0.5)" stroke="#b8a57a" stroke-width="1.5"/>
  <rect x="176" y="60" width="8" height="80" fill="#e8d5a0" rx="2"/>
  <line x1="176" y1="70" x2="184" y2="70" stroke="#9e2426" stroke-width="0.8"/>
  <line x1="176" y1="85" x2="184" y2="85" stroke="#9e2426" stroke-width="0.8"/>
  <line x1="176" y1="100" x2="184" y2="100" stroke="#9e2426" stroke-width="0.8"/>
  <line x1="176" y1="115" x2="184" y2="115" stroke="#9e2426" stroke-width="0.8"/>
  <text x="200" y="90" font-size="10" fill="#302820">吸管</text>
  <text x="200" y="103" font-size="9" fill="#b8a57a">（钻机）</text>
  <path d="M187 130 L240 160" stroke="#302820" stroke-width="0.5" stroke-dasharray="2,2"/>
  <rect x="290" y="120" width="20" height="60" rx="3" fill="#e8d5a0" stroke="#b8a57a" stroke-width="1"/>
  <line x1="290" y1="135" x2="310" y2="135" stroke="#9e2426" stroke-width="0.8"/>
  <line x1="290" y1="150" x2="310" y2="150" stroke="#9e2426" stroke-width="0.8"/>
  <line x1="290" y1="165" x2="310" y2="165" stroke="#9e2426" stroke-width="0.8"/>
  <text x="300" y="195" text-anchor="middle" font-size="9" fill="#302820">岩心样本</text>
  <text x="200" y="210" text-anchor="middle" font-size="12" fill="#302820">吸管垂直插入 → 旋转推进 → 获取岩心柱</text>
</svg>`,
  },
  {
    title: '记录岩心数据',
    content: '对每个孔位取出的岩心样本进行详细记录。记录内容包括：\n\n1. 孔位编号（对应网格坐标）\n2. 岩心总长度（模拟地层厚度）\n3. 颜色变化：从顶部到底部颜色的连续变化\n4. 质地描述：致密/疏松、均一/不均匀\n5. 特殊标志：如有无"矿体"指示（例如预先埋入的巧克力豆、葡萄干等）\n6. 绘制岩心柱状图：用彩色铅笔按比例绘制每段岩心的颜色和特征\n\n将所有孔位数据整理成表格，形成系统的钻孔编录。',
    highlight: '岩心编录是地质勘探的核心环节。地质学家通过岩心判断岩性（岩石类型）、构造（断层、节理、褶皱）、矿化（矿石品位、蚀变类型）等关键信息。一块岩心就是一条垂直的地质时间线。',
    illustration: `<svg width="100%" height="auto" viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
  <rect x="30" y="20" width="80" height="160" rx="2" fill="rgba(200,220,240,0.3)" stroke="#b8a57a" stroke-width="1.5"/>
  <line x1="30" y1="40" x2="110" y2="40" stroke="#b8a57a" stroke-width="0.5"/>
  <line x1="30" y1="60" x2="110" y2="60" stroke="#b8a57a" stroke-width="0.5"/>
  <line x1="30" y1="80" x2="110" y2="80" stroke="#b8a57a" stroke-width="0.5"/>
  <line x1="30" y1="100" x2="110" y2="100" stroke="#b8a57a" stroke-width="0.5"/>
  <text x="70" y="32" text-anchor="middle" font-size="8" fill="#302820">深度(m) 颜色 描述</text>
  <text x="70" y="52" text-anchor="middle" font-size="7" fill="#302820">0-0.5 浅黄 表土</text>
  <rect x="38" y="44" width="8" height="8" fill="#e8d5a0"/>
  <text x="70" y="72" text-anchor="middle" font-size="7" fill="#302820">0.5-1.0 棕 风化层</text>
  <rect x="38" y="64" width="8" height="8" fill="#8b6914"/>
  <text x="70" y="92" text-anchor="middle" font-size="7" fill="#302820">1.0-1.5 灰 砂岩</text>
  <rect x="38" y="84" width="8" height="8" fill="#aaa"/>
  <text x="70" y="112" text-anchor="middle" font-size="7" fill="#302820">1.5-2.0 黑 矿体★</text>
  <rect x="38" y="104" width="8" height="8" fill="#302820"/>
  <rect x="170" y="60" width="100" height="120" rx="2" fill="rgba(200,220,240,0.3)" stroke="#b8a57a" stroke-width="1.5"/>
  <rect x="185" y="70" width="18" height="95" rx="3" fill="#e8d5a0" stroke="#b8a57a" stroke-width="1"/>
  <rect x="185" y="70" width="18" height="15" fill="#e8d5a0"/>
  <text x="215" y="82" font-size="7" fill="#302820">表土</text>
  <rect x="185" y="85" width="18" height="25" fill="#8b6914"/>
  <text x="215" y="100" font-size="7" fill="#302820">风化层</text>
  <rect x="185" y="110" width="18" height="30" fill="#aaa"/>
  <text x="215" y="125" font-size="7" fill="#302820">砂岩</text>
  <rect x="185" y="140" width="18" height="20" fill="#302820"/>
  <text x="215" y="152" font-size="7" fill="#302820">矿体</text>
  <text x="220" y="100" font-size="9" fill="#302820" font-weight="700">数据表</text>
  <text x="220" y="113" font-size="9" fill="#302820" font-weight="700">→</text>
  <text x="240" y="100" font-size="9" fill="#302820" font-weight="700">岩心柱状图</text>
  <text x="200" y="195" text-anchor="middle" font-size="11" fill="#302820">记录各孔位岩心长度、颜色、质地、"矿体"位置</text>
</svg>`,
  },
  {
    title: '重建三维模型',
    content: '利用各钻孔的岩心数据，推断地下地质体的三维空间分布。\n\n分析方法：\n1. 将各孔位的岩心柱按网格位置排列，对比相邻孔位的岩心\n2. 连接相同颜色/质地的层位，绘制剖面图（纵截面和横截面）\n3. 识别"矿体"在三维空间中的形状——是层状（沉积型）、透镜状、脉状（热液型）还是块状\n4. 如果有预先埋入的"矿体"（如巧克力豆代表高品位矿体），观察其在各孔位出现的位置，推断矿体的三维形态\n\n结论：钻孔数据本质上是三维地质体的一维"采样线"——通过多条平行采样线的空间插值，可以推断地下构造，这正是矿产勘探和地质建模的基本方法。',
    highlight: '从一维岩心数据到三维地质模型，需要空间推理和地质知识。相邻钻孔的相似层位可以对比连接，形成地质剖面。这一过程在现代勘探中借助计算机软件（如 Leapfrog、Surpac）实现三维建模和储量估算。',
    illustration: `<svg width="100%" height="auto" viewBox="0 0 400 220" xmlns="http://www.w3.org/2000/svg">
  <text x="200" y="15" text-anchor="middle" font-size="9" fill="#302820">钻孔 A</text>
  <text x="270" y="15" text-anchor="middle" font-size="9" fill="#302820">钻孔 B</text>
  <text x="340" y="15" text-anchor="middle" font-size="9" fill="#302820">钻孔 C</text>
  <rect x="190" y="25" width="20" height="155" rx="2" fill="#fff" stroke="#9e2426" stroke-width="1.5"/>
  <rect x="190" y="30" width="20" height="30" fill="#e8d5a0"/>
  <rect x="190" y="60" width="20" height="25" fill="#8b6914"/>
  <rect x="190" y="85" width="20" height="40" fill="#aaa"/>
  <rect x="190" y="125" width="20" height="15" fill="#302820"/>
  <rect x="260" y="25" width="20" height="155" rx="2" fill="#fff" stroke="#9e2426" stroke-width="1.5"/>
  <rect x="260" y="30" width="20" height="25" fill="#e8d5a0"/>
  <rect x="260" y="55" width="20" height="30" fill="#8b6914"/>
  <rect x="260" y="85" width="20" height="35" fill="#aaa"/>
  <rect x="260" y="120" width="20" height="20" fill="#302820"/>
  <rect x="330" y="25" width="20" height="155" rx="2" fill="#fff" stroke="#9e2426" stroke-width="1.5"/>
  <rect x="330" y="30" width="20" height="35" fill="#e8d5a0"/>
  <rect x="330" y="65" width="20" height="20" fill="#8b6914"/>
  <rect x="330" y="85" width="20" height="45" fill="#aaa"/>
  <rect x="330" y="130" width="20" height="10" fill="#302820"/>
  <path d="M210 45 Q240 43 260 43" stroke="#e8d5a0" stroke-width="1.5" fill="none"/>
  <path d="M280 45 Q305 43 330 43" stroke="#e8d5a0" stroke-width="1.5" fill="none"/>
  <path d="M210 75 Q240 73 260 73" stroke="#8b6914" stroke-width="1.5" fill="none"/>
  <path d="M280 73 Q305 73 330 75" stroke="#8b6914" stroke-width="1.5" fill="none"/>
  <path d="M210 105 Q240 105 260 105" stroke="#aaa" stroke-width="1.5" fill="none"/>
  <path d="M280 105 Q305 105 330 105" stroke="#aaa" stroke-width="1.5" fill="none"/>
  <path d="M210 133 Q240 130 260 130" stroke="#302820" stroke-width="2" fill="none"/>
  <path d="M280 130 Q305 130 330 133" stroke="#302820" stroke-width="2" fill="none"/>
  <text x="210" y="195" text-anchor="middle" font-size="8" fill="#e8d5a0">表土</text>
  <text x="260" y="195" text-anchor="middle" font-size="8" fill="#8b6914">风化</text>
  <text x="310" y="195" text-anchor="middle" font-size="8" fill="#aaa">砂岩</text>
  <text x="200" y="210" text-anchor="middle" font-size="12" fill="#302820">连孔对层 → 三维地质模型（一维采样→三维重建）</text>
</svg>`,
  },
]

export default { name: "PotatoCore", steps }