// 五种超弦理论与对偶网络权威数据 · GEO COSMOS
// 参考：David Tong (String Theory, Ch. 7 & 8), Polchinski (Vol II), Green-Schwarz-Witten

export const SUPERSTRING_THEORIES = [
  {
    id: 'type1',
    name: 'Type I 超弦',
    nameEn: 'Type I Superstring',
    stringType: '开弦与闭弦（混合）',
    orientability: '未定向 (Unoriented, 经世界面宇称反转 Ω 投影)',
    spacetimeChirality: '手征 (Chiral)',
    supersymmetry10D: 'N = 1 (16 个实超对称荷生成元)',
    gaugeGroup: 'SO(32)',
    gaugeOrigin: '微扰开弦端点携带的 Chan-Paton 自由度；Green-Schwarz 机制证明仅 SO(32) 能消除反常',
    dBraneTypes: 'D1, D5, D9 膜（配合时空充满的 O9 负张力取向面以保持电荷中性）',
    strongCouplingDual: '经由 S 对偶等价于弱耦合杂化 SO(32) 弦理论 (g_s_het = 1 / g_s_I)',
    phenoPotential: '开弦扇区包含丰富规范场，早期被寄予厚望，但构建真实粒子标准模型较为复杂',
    pdgOrSource: 'Green & Schwarz (1984); Polchinski Vol II Ch. 12'
  },
  {
    id: 'type2a',
    name: 'Type IIA 超弦',
    nameEn: 'Type IIA Superstring',
    stringType: '仅闭弦 (微扰下无开弦)',
    orientability: '定向 (Oriented)',
    spacetimeChirality: '非手征 (Non-chiral, 左右行超对称手征相反，记为 (1,1))',
    supersymmetry10D: 'N = 2 (32 个超对称荷生成元)',
    gaugeGroup: '微扰下无非平凡规范群 (仅含阿贝尔 U(1) R-R 势)',
    gaugeOrigin: '重要警示：Type IIA 微扰闭弦没有非阿贝尔规范群！真实的非阿贝尔规范场必须依赖非微扰 D 膜堆叠产生',
    dBraneTypes: '稳定偶数维膜：D0 (粒子状), D2, D4, D6, D8 (耦合于 R-R 奇数阶微分形式)',
    strongCouplingDual: '强耦合极限 g_s → ∞ 时展开出第 11 个圆维度，低能极限为 11 维超引力 (M 理论)',
    phenoPotential: '在 Calabi-Yau 紧致化中因非手征性难以直接得到 4 维手征费米子，通常需引入相交 D6 膜破缺超对称',
    pdgOrSource: 'Witten (1995); Polchinski Vol II Ch. 10'
  },
  {
    id: 'type2b',
    name: 'Type IIB 超弦',
    nameEn: 'Type IIB Superstring',
    stringType: '仅闭弦 (微扰下无开弦)',
    orientability: '定向 (Oriented)',
    spacetimeChirality: '手征 (Chiral, 左右行超对称具有相同手征性，记为 (2,0))',
    supersymmetry10D: 'N = 2 (32 个超对称荷生成元)',
    gaugeGroup: '微扰下无非平凡规范群 (含标量轴子 C_0、二阶势 C_2 与四阶自对偶势 C_4^+)',
    gaugeOrigin: '同样微扰下无非阿贝尔规范群；非阿贝尔规范场源于非微扰 D 膜世界体积上的开弦激发',
    dBraneTypes: '稳定奇数维膜：D(-1) (瞬子), D1 (D 弦), D3 (AdS_5×S^5 基础), D5, D7',
    strongCouplingDual: '具有精确的 SL(2, Z) S 自对偶性；强弱耦合变换 τ → −1/τ 下仍是 Type IIB 本身',
    phenoPotential: '广泛用于 AdS/CFT 对应 (D3 膜堆叠) 以及 KKLT 模稳定化与通量紧致化研究',
    pdgOrSource: 'Maldacena (1997); Polchinski Vol II Ch. 10 & 14'
  },
  {
    id: 'het_so32',
    name: 'Heterotic SO(32) 杂化弦',
    nameEn: 'Heterotic SO(32)',
    stringType: '仅闭弦 (左行 26 维玻色，右行 10 维超弦)',
    orientability: '定向 (Oriented)',
    spacetimeChirality: '手征 (Chiral)',
    supersymmetry10D: 'N = 1 (16 个超对称荷生成元)',
    gaugeGroup: 'SO(32)',
    gaugeOrigin: '微扰闭弦原生激发：左行 26 维玻色弦中 16 维在偶自对偶转置晶格紧致化产生的卡茨-穆迪代数',
    dBraneTypes: '微扰下无 D 膜 (不具有开弦端点；存在非微扰五膜孤子与非阿贝尔瞬子)',
    strongCouplingDual: '经由 S 对偶等价于弱耦合 Type I 理论 (两者在强弱耦合下互换)',
    phenoPotential: '具有大规范对称群，但 SO(32) 破缺到标准模型家族树通常不如 E8×E8 自然',
    pdgOrSource: 'Gross, Harvey, Martinec, Rohm (1985); Tong Ch. 7'
  },
  {
    id: 'het_e8',
    name: 'Heterotic E8×E8 杂化弦',
    nameEn: 'Heterotic E8×E8',
    stringType: '仅闭弦 (左行 26 维玻色，右行 10 维超弦)',
    orientability: '定向 (Oriented)',
    spacetimeChirality: '手征 (Chiral)',
    supersymmetry10D: 'N = 1 (16 个超对称荷生成元)',
    gaugeGroup: 'E8 × E8',
    gaugeOrigin: '微扰闭弦原生激发：左行在 Γ8 × Γ8 根晶格紧致化产生，提供极其优美的统一代数结构',
    dBraneTypes: '微扰下无 D 膜 (无开弦)',
    strongCouplingDual: '强耦合极限对应 11 维 Hořava-Witten 理论 (11 维时空在区间 S¹/Z₂ 紧致化，两个 E8 分布在两端边界膜)',
    phenoPotential: '弦唯象学的核心热门候选：一个 E8 通过 Calabi-Yau 旋量联络嵌入破缺为 E6/SO(10)/SU(5) 乃至标准模型，另一个 E8 充当暗物质隐匿区',
    pdgOrSource: 'Gross et al. (1985); Hořava & Witten (1996)'
  }
]

export const DUALITY_CONNECTIONS = [
  {
    id: 't_ii',
    from: 'type2a',
    to: 'type2b',
    type: 'T 对偶 (T-Duality)',
    formula: 'R_IIB = α′ / R_IIA',
    description: '在紧致圆空间上，交换绕圈数 (Winding) 与卡鲁扎-克莱因动量模 (Momentum)，并对右行世界面费米子作宇称反转 (-1)^F_R，从而在 IIA 与 IIB 之间建立完全等价映射。',
    prerequisites: '圆周紧致化 S¹ 背景；弱微扰弦论范畴',
    status: '具有严格的世界面共形场论 (CFT) 谱级可计算证明'
  },
  {
    id: 't_het',
    from: 'het_so32',
    to: 'het_e8',
    type: 'T 对偶 (T-Duality)',
    formula: 'R′ = α′ / R + 规范 Wilson 圈',
    description: '在具有非平凡阿贝尔 Wilson 圈背景的圆紧致化下，两个杂化弦理论的晶格通过移位发生混叠，连续形变相互转换。',
    prerequisites: '圆紧致化且必须开启规范背景场；微扰展开',
    status: '弦微扰代数与格点自对偶定理严格保证'
  },
  {
    id: 's_type1_hetso32',
    from: 'type1',
    to: 'het_so32',
    type: 'S 对偶 (S-Duality)',
    formula: 'g_s(Heterotic) = 1 / g_s(Type I)',
    description: '强弱耦合对偶：Type I 的强耦合极限精确等价于弱耦合的杂化 SO(32) 理论，其低能有效作用量在爱因斯坦系下完全一致。',
    prerequisites: '全 10 维平直时空，非微扰超引力解与低能有效场论一致性',
    status: '低能有效作用量与 BPS 孤子谱精确吻合，尚无完整非微扰定义下的通用全能量证明'
  },
  {
    id: 's_type2b',
    from: 'type2b',
    to: 'type2b',
    type: 'S 自对偶 (SL(2, Z))',
    formula: 'τ → −1/τ，其中 τ = C₀ + i e^{−Φ}',
    description: 'Type IIB 具有自身到自身的非微扰自对偶对称性，基本弦 (F-string) 与 D1 弦在 S 变换下互换。',
    prerequisites: '超对称与非微扰 R-R 标量背景',
    status: 'BPS 态谱与 D 膜张力匹配良好'
  },
  {
    id: 'm_iia',
    from: 'type2a',
    to: 'm_theory',
    type: 'M 理论极限 (M-Theory)',
    formula: 'R₁₁ = g_s ℓ_s，ℓ₁₁ = g_s^{1/3} ℓ_s',
    description: 'Type IIA 的弦耦合常数 g_s 实际上由标量膨胀子控制。当 g_s → ∞ 时，第 11 个空间圆半径无限展开，产生完整的 11 维 M 理论；D0 膜成为 11 维超引力的 KK 动量塔。',
    prerequisites: '非微扰强耦合边界；超引力低能极限',
    status: '1995 年 Witten 提出，第二次超弦革命里程碑；无摄动超引力严格支持'
  },
  {
    id: 'm_hete8',
    from: 'het_e8',
    to: 'm_theory',
    type: 'Hořava-Witten 理论',
    formula: '11D 空间 × (S¹ / Z₂)',
    description: '杂化 E8×E8 的强耦合极限等价于 11 维超引力在有界一维区间紧致化；为了消除引力与规范反常，两个独立的 E8 规范扇区分别定域在区间的两个 10 维边界膜上。',
    prerequisites: '11 维时空轨形 (Orbifold) 紧致化与超引力反常消除',
    status: 'Hořava 与 Witten (1996) 严格数学构造'
  }
]
