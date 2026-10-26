/**
 * 地学学术公式轻量安全渲染与解析工具
 * 支持自然地理学、气象气候学、水动力学、空间分析等常用 LaTeX 公式渲染
 */

// 常用典型地理学经典公式模板库（供一键快捷填入）
export const GEO_FORMULA_PRESETS = [
  {
    name: '地转偏向力',
    latex: 'f = 2\\Omega \\sin\\phi',
    desc: '科里奥利参数（纬度相关）'
  },
  {
    name: '曼宁流速公式',
    latex: 'v = \\frac{1}{n} R^{2/3} S^{1/2}',
    desc: '明渠水动力学均匀流速'
  },
  {
    name: '水平气压梯度力',
    latex: 'G = -\\frac{1}{\\rho} \\frac{\\partial P}{\\partial n}',
    desc: '大气动力学风场驱动'
  },
  {
    name: '地表水热平衡',
    latex: 'R_n = H + LE + G',
    desc: '地表能量收支平衡方程'
  },
  {
    name: '太阳高度角',
    latex: '\\sin h = \\sin\\phi \\sin\\delta + \\cos\\phi \\cos\\delta \\cos\\omega',
    desc: '日地空间几何计算'
  },
  {
    name: '干绝热直减率',
    latex: '\\Gamma_d = \\frac{g}{c_p} \\approx 0.98^\\circ\\text{C}/100\\text{m}',
    desc: '未饱和气块绝热抬升降温'
  }
]

/**
 * HTML 特殊字符转义，彻底防止 XSS
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * 格式化简单数学上下标与常用地学希腊符号（轻量纯 CSS 渲染，无需外部庞大 CDN）
 */
function formatMathSnippet(latex) {
  let res = escapeHtml(latex.trim())

  // 常见希腊字母与数学符号转义为语义化 Unicode
  const greekMap = {
    '\\\\Omega': 'Ω',
    '\\\\omega': 'ω',
    '\\\\phi': 'φ',
    '\\\\delta': 'δ',
    '\\\\rho': 'ρ',
    '\\\\Gamma': 'Γ',
    '\\\\partial': '∂',
    '\\\\approx': '≈',
    '\\\\sin': 'sin',
    '\\\\cos': 'cos',
    '\\\\text\\{C\\}': '°C',
    '\\\\text\\{m\\}': 'm',
    '\\\\circ': '°'
  }

  for (const [key, val] of Object.entries(greekMap)) {
    res = res.replace(new RegExp(key, 'g'), val)
  }

  // 简易分数转换 \frac{A}{B}
  res = res.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '<span class="math-fraction"><span class="num">$1</span><span class="den">$2</span></span>')

  // 上标 ^2 或 ^{2/3}
  res = res.replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>')
  res = res.replace(/\^([0-9a-zA-Z°]+)/g, '<sup>$1</sup>')

  // 下标 _n 或 _{min}
  res = res.replace(/_\{([^}]+)\}/g, '<sub>$1</sub>')
  res = res.replace(/_([0-9a-zA-Z]+)/g, '<sub>$1</sub>')

  return `<span class="math-formula-rendered">${res}</span>`
}

/**
 * 将混排了普通文本与 LaTeX 公式的帖子正文转换为安全的 HTML
 * 块级公式：$$公式$$
 * 行内公式：$公式$
 */
export function renderGeoScholarlyText(text) {
  if (!text) return ''

  // 1. 拆分块级公式 $$...$$
  const blockParts = text.split(/\$\$([^$]+)\$\$/g)
  let html = ''

  for (let i = 0; i < blockParts.length; i++) {
    if (i % 2 === 1) {
      // 块级公式
      html += `<div class="math-block" role="region" aria-label="数学公式">${formatMathSnippet(blockParts[i])}</div>`
    } else {
      // 普通段落，内部可能包含行内公式 $...$
      const inlineParts = blockParts[i].split(/\$([^$\n]+)\$/g)
      for (let j = 0; j < inlineParts.length; j++) {
        if (j % 2 === 1) {
          // 行内公式
          html += `<span class="math-inline">${formatMathSnippet(inlineParts[j])}</span>`
        } else {
          // 纯文本，按行转为段落并保留换行
          const escaped = escapeHtml(inlineParts[j])
          html += escaped.replace(/\n\n+/g, '</p><p>').replace(/\n/g, '<br/>')
        }
      }
    }
  }

  return `<p>${html}</p>`
}
