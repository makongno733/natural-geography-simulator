# GEO COSMOS 资料与科学来源核验记录

核验日期：2026-11-05（首版）、2026-11-06（第二阶段：弦理论专题 D1—D11 体系化深化与 PDG 粒子数据库）。

本知识中心内容严格遵照大学物理/天文学高阶课程体系与权威同行评审文献标准，正文采用原创叙述，严禁将未证实假说宣称为实验结论，公式采用标准定义并注明物理量纲与适用边界。

---

## 一、第二阶段（2026-11-06）新增核验权威资料

### 1. 粒子物理与国际标准数据库
- **Particle Data Group (PDG 2024) · Review of Particle Physics**：https://pdg.lbl.gov/
  - 核验内容：夸克 6 种与轻子 6 种质量、自旋、电荷。
  - 科学规范：
    * 夸克质量严格标注重整化方案（u, d, s, c, b 采用 $\overline{\text{MS}}$ 方案在特定标度下的流夸克质量；t 采用直接重建极点质量）。
    * 中微子绝不填虚构精确质量，严格标明 KATRIN 直接能谱上限（$m(\nu_e) < 0.45\text{ eV}$）、振荡实验质量平方差（$\Delta m_{21}^2, |\Delta m_{32}^2|$）与普朗克宇宙学总和上限（$\sum m_\nu < 0.12\text{ eV}$）。
    * 希格斯玻色子（自旋 0）严格归为标量玻色子，绝不混淆为自旋 1 的规范玻色子。
    * 引力子（自旋 2）单独列为理论预测候选，严禁列入已确证的标准模型基本粒子表。

### 2. 现代宇宙学与观测数据
- **Planck Collaboration (2018) · Cosmological Parameters (A&A 641, A6)**：https://arxiv.org/abs/1807.06209
  - 核验内容：基准宇宙学参数 $H_0 = 67.4\text{ km/s/Mpc}, \Omega_m = 0.315, \Omega_\Lambda = 0.685$，宇宙今日年龄为 $13.797 \pm 0.023\text{ Gyr}$，重组退耦期红移 $z \approx 1100$。
  - 在 `src/cosmos/physics.js` 中构建 Simpson 数值积分算法，并通过爱因斯坦-德西特模型（$\Omega_m=1, t_0 = \frac{2}{3H_0}$）解析基准严密测试。

### 3. 弦理论原始里程碑文献
- **Gabriele Veneziano (1968) · Construction of a crossing-symmetric, Regge-behaved amplitude for linearly rising trajectories (Nuovo Cim. A)**：https://doi.org/10.1007/BF02824451
  - 弦论数学发轫：强子散射与欧拉 Beta 函数双共振对偶性。
- **Michael B. Green & John H. Schwarz (1984) · Anomaly Cancellations in Supersymmetric D=10 Gauge Theory and Superstring Theory (Phys. Lett. B149)**：https://doi.org/10.1016/0370-2693(84)91565-X
  - 第一次超弦革命标志：证明仅有 SO(32) 与 E8×E8 能通过 Green-Schwarz 机制奇迹般消除 10 维量子手征反常。
- **Gross, Harvey, Martinec, Rohm (1985) · Heterotic String (Phys. Rev. Lett. 54)**：https://doi.org/10.1103/PhysRevLett.54.502
  - 杂化弦构造：左行 26 维玻色与右行 10 维超弦组合，格点紧致化原生激发出 SO(32) 或 E8×E8 规范群。
- **Joseph Polchinski (1995) · Dirichlet-Branes and Ramond-Ramond Charges (Phys. Rev. Lett. 75)**：https://arxiv.org/abs/hep-th/9510017
  - D 膜突破：指出狄利克雷边界条件对应携带 R-R 荷的动力学非微扰孤子，奠定膜世界与 AdS/CFT 根基。
- **Edward Witten (1995) · String Theory Dynamics In Various Dimensions (Nucl. Phys. B443)**：https://arxiv.org/abs/hep-th/9503124
  - 第二次超弦革命标志：提出五种超弦理论之间的 T 对偶、S 对偶网络，确立 Type IIA 强耦合极限与 11 维超引力/M 理论的等价性。
- **Hořava & Witten (1996) · Heterotic and Type I string dynamics from eleven dimensions (Nucl. Phys. B460)**：https://arxiv.org/abs/hep-th/9510209
  - 强耦合 Heterotic E8×E8 对应 11 维时空在区间 $S^1/\mathbb{Z}_2$ 上的紧致化。
- **Juan Maldacena (1997) · The Large N Limit of Superconformal Field Theories and Supergravity (Adv. Theor. Math. Phys. 2)**：https://arxiv.org/abs/hep-th/9711200
  - 全息原理 AdS/CFT 对偶：$AdS_5 \times S^5$ 上的 IIB 弦理论与 4 维 $\mathcal{N}=4$ 超杨-米尔斯规范场论精确对偶。明确区分：反德西特空间宇宙学常数为负，现实宇宙宇宙学常数为正，不能直接将现实宇宙等同于已验证的全息模型。
- **Kachru, Kallosh, Linde, Trivedi (KKLT 2003) · de Sitter Vacua in String Theory (Phys. Rev. D68)**：https://arxiv.org/abs/hep-th/0301240
  - 模稳定化与通量紧致化，导出具有 $10^{500}$ 种亚稳真空的“弦景观”（String Landscape）。作为理论争议章节（D11）的关键依据。
- **Jacob D. Bekenstein (1973) · Black Holes and Entropy (Phys. Rev. D7)**：https://doi.org/10.1103/PhysRevD.7.2333
  - 黑洞熵面积律 $S \propto A$：全息原理的直接热力学思想源头。

---

## 二、既有权威教学资源
- David Tong (剑桥大学教授) 理论物理系列讲义：
  * String Theory: https://davidtong.org/teaching/string-theory/
  * General Relativity: https://davidtong.org/teaching/general-relativity/
  * Cosmology: https://davidtong.org/teaching/cosmology/
  * Quantum Field Theory: https://davidtong.org/teaching/quantum-field-theory/
- Einstein Online (马克斯·普朗克引力物理研究所科普平台):
  * Light Clocks & Time Dilation: https://www.einstein-online.info/en/spotlight/light-clocks-time-dilation/
- CERN (欧洲核子研究中心):
  * The Standard Model: https://home.cern/science/physics/standard-model
  * Supersymmetry: https://home.cern/science/physics/supersymmetry
- NASA 官方科学探索系列:
  * Universe Overview: https://science.nasa.gov/universe/overview/
  * Stars Evolution: https://science.nasa.gov/universe/stars/
  * Black Holes: https://science.nasa.gov/universe/black-holes/

---

## 三、科学地位枚举与严格使用规范
所有章节的 `status` 字段受到 `src/cosmos/schema.test.js` 自动化强制检查，枚举范围：
1. **成熟观测方法**（如视差测距法）
2. **获得大量观测支持**（如恒星流体平衡与核聚变演化）
3. **成熟且经实验检验**（如狭义相对论、广义相对论弱场进动透镜、标准模型电弱精确检验）
4. **成熟理论框架**（如量子场论有效场论架构）
5. **标准模型获广泛观测支持**（如 FLRW $\Lambda\text{CDM}$ 宇宙学大尺度结构与 CMB）
6. **尚未证实的量子引力候选**（如弦理论几何描述、引力子模式涌现）
7. **有数学证据的候选框架**（如玻色弦共形反常消除、五种超弦微扰分类、T/S 对偶网络）
8. **研究中的候选理论**（如 D 膜动力学、AdS/CFT 全息对应）
9. **理论假设，尚未观测确认**（如超对称伴侣粒子、微观额外维度、弦景观真空）
10. **黑洞有观测支持；量子效应仍待检验**（黑洞经典视界与引力波有实证；霍金辐射仍待检验）
11. **多种推测性设想与诠释**（如永恒暴胀泡泡、多世界诠释、弦景观多重真空）
12. **科学史与方法概览**（科学方法论与认知循环）
