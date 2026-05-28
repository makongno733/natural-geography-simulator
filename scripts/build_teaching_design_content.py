import json
import re
import zipfile
from pathlib import Path
import xml.etree.ElementTree as ET

PROJECT = Path('/Users/kongnoma/Documents/New project')
SOURCE = Path('/Users/kongnoma/Downloads/45-高中地理【人教版】')
TARGET_BASE = PROJECT / 'src' / 'textbook' / 'data' / '高中'

BOOK_RULES = [
    ('选择性必修第一册', '选择性必修1'),
    ('选择性必修第二册', '选择性必修2'),
    ('选择性必修第三册', '选择性必修3'),
    ('必修第一册', '必修第一册'),
    ('必修第二册', '必修第二册'),
]

CN_NUM = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九']


def num_to_cn(n: int) -> str:
    if n <= 10:
        return '十' if n == 10 else CN_NUM[n]
    if n < 20:
        return '十' + CN_NUM[n - 10]
    t, o = divmod(n, 10)
    return CN_NUM[t] + '十' + (CN_NUM[o] if o else '')


def chapter_id(n: int) -> str:
    return f'第{num_to_cn(n)}章'


def section_id(n: int) -> str:
    return f'第{num_to_cn(n)}节'


def detect_book(path: str):
    for key, book in BOOK_RULES:
        if key in path:
            return book
    return None


def extract_nums(name: str):
    m = re.search(r'(\d{1,2})\s*[.．]\s*(\d{1,2})', name)
    if m:
        return int(m.group(1)), int(m.group(2))
    return None, None


def clean_line(line: str) -> str:
    line = line.replace('\u3000', ' ')
    line = re.sub(r'\s+', ' ', line).strip()
    line = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', line)
    if not line:
        return ''
    if re.fullmatch(r'[\W_]+', line):
        return ''
    if len(line) <= 2:
        return ''
    if line.startswith('http'):
        return ''
    return line


def read_docx_lines(file_path: Path):
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    lines = []
    try:
        with zipfile.ZipFile(file_path) as zf:
            xml = zf.read('word/document.xml')
        root = ET.fromstring(xml)
        for p in root.findall('.//w:p', ns):
            text = ''.join((t.text or '') for t in p.findall('.//w:t', ns))
            text = clean_line(text)
            if text:
                lines.append(text)
    except Exception:
        return []
    return lines


def split_by_markers(lines):
    idx = {}
    for i, ln in enumerate(lines):
        if '教材分析' in ln and '教材分析' not in idx:
            idx['analysis'] = i
        if '教学目标' in ln and 'goal' not in idx:
            idx['goal'] = i
        if ('重点' in ln or '难点' in ln) and 'focus' not in idx:
            idx['focus'] = i
        if '教学过程' in ln and 'process' not in idx:
            idx['process'] = i
    return idx


def slice_block(lines, start, end):
    if start is None:
        return []
    s = start + 1
    e = end if end is not None else len(lines)
    return [x for x in lines[s:e] if x]


def unique_keep_order(items, limit=None):
    seen = set()
    out = []
    for it in items:
        key = re.sub(r'\s+', '', it)
        if key in seen:
            continue
        seen.add(key)
        out.append(it)
        if limit and len(out) >= limit:
            break
    return out


def pick_sentences(text, max_count=4):
    sents = re.split(r'[。！？；!?.]\s*', text)
    out = []
    for s in sents:
        s = s.strip(' ，,;；：:')
        if 16 <= len(s) <= 100:
            out.append(s + '。')
        if len(out) >= max_count:
            break
    return out


def build_summary(lines, file_stem):
    if not lines:
        return {
            'body': '## 教学设计（精简版）\n\n当前节次暂未检索到可用教学设计文件。建议先导入对应课件文件夹，再补充本节教学设计。',
            'keyPoints': ['教学设计暂未收录', '可先参考教材原文与课堂活动安排']
        }

    markers = split_by_markers(lines)
    a = markers.get('analysis')
    g = markers.get('goal')
    f = markers.get('focus')
    p = markers.get('process')

    order = [a, g, f, p]
    order = [x for x in order if x is not None]
    order_sorted = sorted(order)

    def next_pos(pos):
        for x in order_sorted:
            if x > pos:
                return x
        return None

    analysis_block = slice_block(lines, a, next_pos(a) if a is not None else None)
    goal_block = slice_block(lines, g, next_pos(g) if g is not None else None)
    focus_block = slice_block(lines, f, next_pos(f) if f is not None else None)
    process_block = slice_block(lines, p, None)

    analysis_text = ' '.join(analysis_block[:10])
    intro_sents = pick_sentences(analysis_text, 4)

    goal_candidates = []
    for ln in goal_block:
        if re.match(r'^[0-9一二三四五六七八九十①②③④⑤⑥⑦⑧⑨⑩].{4,}', ln) or re.search(r'掌握|理解|说明|运用|分析|绘制|比较|归纳', ln):
            goal_candidates.append(re.sub(r'^[0-9一二三四五六七八九十①②③④⑤⑥⑦⑧⑨⑩\.．、\)）\s]+', '', ln))
    goals = unique_keep_order([x for x in goal_candidates if 8 <= len(x) <= 80], limit=6)

    focus = []
    for ln in focus_block:
        if re.search(r'重点|难点|易错|关键', ln):
            focus.append(ln.replace('【', '').replace('】', ''))
    if not focus:
        for ln in lines:
            if re.search(r'重点|难点', ln):
                focus.append(ln)
    focus = unique_keep_order([x for x in focus if len(x) <= 90], limit=4)

    process_steps = []
    for ln in process_block:
        if re.match(r'^[一二三四五六七八九十]+[、.．]', ln) or re.match(r'^\d+[、.．)]', ln) or re.search(r'导入|活动|探究|讨论|讲解|总结|练习|评价|作业', ln):
            process_steps.append(ln)
    process_steps = unique_keep_order([x for x in process_steps if 6 <= len(x) <= 90], limit=10)

    knowledge = []
    for ln in lines:
        if re.search(r'形成|作用|影响|原因|规律|特征|分布|联系|措施|过程|条件|意义', ln) and 10 <= len(ln) <= 95:
            knowledge.append(ln)
    knowledge = unique_keep_order(knowledge, limit=16)

    body_parts = []
    body_parts.append('## 教学设计导读')
    if intro_sents:
        body_parts.append(''.join(intro_sents))
    else:
        body_parts.append('本节围绕核心概念、过程机制与地理应用展开，建议以“现象—原理—案例—迁移”路径完成学习。')

    body_parts.append('\n## 学习目标（精读）')
    if goals:
        body_parts.extend([f'- {g}' for g in goals])
    else:
        body_parts.extend(['- 说清本节核心概念及其地理意义。', '- 能用图表或案例解释关键过程与规律。', '- 能迁移到区域案例进行综合判断。'])

    body_parts.append('\n## 核心知识与判读')
    if knowledge:
        body_parts.extend([f'- {k}' for k in knowledge[:8]])
    else:
        body_parts.extend(['- 按“要素—过程—结果”梳理本节知识框架。', '- 结合典型图表进行因果链条分析。'])

    body_parts.append('\n## 课堂流程（45 分钟建议）')
    if process_steps:
        for i, s in enumerate(process_steps[:6], 1):
            body_parts.append(f'{i}. {s}')
    else:
        body_parts.extend([
            '1. 情境导入：从真实区域案例提出问题。',
            '2. 概念建构：明确关键词与判读指标。',
            '3. 过程分析：用图表推导机制与规律。',
            '4. 迁移应用：完成分层练习与同伴讨论。',
            '5. 课堂小结：回到问题，形成结构化结论。'
        ])

    body_parts.append('\n## 易错提醒')
    if focus:
        body_parts.extend([f'- {x}' for x in focus])
    else:
        body_parts.extend(['- 注意区分概念层级，不要混淆定义与现象。', '- 作图与读图时先看变量，再看空间与时间关系。'])

    body_parts.append('\n## 即时检测（3 题）')
    body_parts.extend([
        '1. 用 2 句话解释本节最核心的地理机制。',
        '2. 结合一幅图，说出“现象—原因—影响”的完整链条。',
        '3. 针对一个区域案例，给出一条可操作的地理解释或建议。'
    ])

    body = '\n'.join(body_parts).strip()

    # 阅读时长约束：按 240 字/分钟，7 分钟≈1680字，允许 1500~2600
    pure = re.sub(r'[#\-\d\.\s]', '', body)
    if len(pure) < 1500:
        extra_pool = [x for x in (knowledge[8:] + process_steps + analysis_block) if x not in body and len(x) <= 120]
        extra_pool = unique_keep_order(extra_pool)
        if extra_pool:
            body += '\n\n## 延伸要点\n' + '\n'.join(f'- {x}' for x in extra_pool[:18])
    if len(re.sub(r'[#\-\d\.\s]', '', body)) > 2600:
        # 粗截断到 2600 左右，保持结构
        lines_body = body.split('\n')
        keep = []
        total = 0
        for ln in lines_body:
            keep.append(ln)
            total += len(re.sub(r'\s', '', ln))
            if total > 2800:
                break
        body = '\n'.join(keep)

    # 若仍偏短，自动扩展为“课堂讲解稿”长度（接近7分钟）
    pure_len = len(re.sub(r'[#\-\d\.\s]', '', body))
    if pure_len < 1500:
        explain_items = unique_keep_order(goals + knowledge + focus, limit=10)
        if explain_items:
            body += '\n\n## 课堂讲解展开\n'
            for item in explain_items:
                body += (
                    f'- 围绕“{item}”，建议按“概念界定—成因机制—空间分异—现实应用”四步展开。'
                    f'先指出该知识在本章中的位置，再结合图表说明其变化特征，最后回到区域案例完成迁移。\\n'
                )
                pure_len = len(re.sub(r'[#\\-\\d\\.\\s]', '', body))
                if pure_len >= 1650:
                    break

    key_points = unique_keep_order(goals + knowledge + focus, limit=6)
    if not key_points:
        key_points = ['本节围绕核心概念、过程机制和区域应用展开。', '建议先读图，再用因果链条组织答案。']

    return {
        'body': body,
        'keyPoints': key_points
    }


def build():
    docs = list(SOURCE.rglob('*.docx'))
    docs = [p for p in docs if '教学设计' in str(p)]

    grouped = {}
    for doc in docs:
        book = detect_book(str(doc))
        if not book:
            continue
        ch_num, sec_num = extract_nums(doc.name)
        if not ch_num or not sec_num:
            continue
        grouped.setdefault(book, {}).setdefault(ch_num, {}).setdefault(sec_num, []).append(doc)

    report = {}
    for book_dir in sorted(TARGET_BASE.iterdir()):
        if not book_dir.is_dir():
            continue
        book = book_dir.name
        src_json = book_dir / 'content.json'
        if src_json.exists():
            with open(src_json, 'r', encoding='utf-8') as f:
                old = json.load(f)
            chapter_keys = list(old.keys())
        else:
            chapter_keys = []

        new_obj = {}
        covered_sections = 0

        # 优先按已有章节生成
        for c_key in chapter_keys:
            m = re.search(r'第([一二三四五六七八九十\d]+)章', c_key)
            if not m:
                continue
            # 中文转数字（简单）
            cn = m.group(1)
            if cn.isdigit():
                c_num = int(cn)
            else:
                mapv = {'一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9}
                if cn == '十':
                    c_num = 10
                elif '十' in cn:
                    parts = cn.split('十')
                    left = mapv.get(parts[0], 1) if parts[0] else 1
                    right = mapv.get(parts[1], 0) if len(parts) > 1 else 0
                    c_num = left * 10 + right
                else:
                    c_num = mapv.get(cn, 1)

            sec_map = {}
            for s_num, files in sorted(grouped.get(book, {}).get(c_num, {}).items()):
                lines = []
                for fp in files:
                    lines.extend(read_docx_lines(fp))
                summary = build_summary(lines, files[0].stem if files else '')
                sec_map[section_id(s_num)] = summary
                covered_sections += 1

            chapter_summary_texts = [v['body'] for _, v in sorted(sec_map.items())]
            chapter_full = '\n\n'.join(chapter_summary_texts[:2]) if chapter_summary_texts else '本章教学设计暂未收录，建议先导入该章教学设计文档。'
            chapter_kp = []
            for _, v in sorted(sec_map.items()):
                chapter_kp.extend(v.get('keyPoints', []))
            chapter_kp = unique_keep_order(chapter_kp, limit=8)

            new_obj[c_key] = {
                'fullText': chapter_full,
                'keyPoints': chapter_kp if chapter_kp else ['本章教学设计暂未收录'],
                'sections': sec_map
            }

        # 兜底：把未在旧章节中出现但有教学设计的章节补上
        existing_nums = set()
        for ck in new_obj.keys():
            m = re.search(r'第([一二三四五六七八九十\d]+)章', ck)
            if m:
                if m.group(1).isdigit():
                    existing_nums.add(int(m.group(1)))
        for c_num, secs in sorted(grouped.get(book, {}).items()):
            if c_num in existing_nums:
                continue
            ck = chapter_id(c_num)
            sec_map = {}
            for s_num, files in sorted(secs.items()):
                lines = []
                for fp in files:
                    lines.extend(read_docx_lines(fp))
                summary = build_summary(lines, files[0].stem if files else '')
                sec_map[section_id(s_num)] = summary
                covered_sections += 1
            chapter_kp = []
            for _, v in sorted(sec_map.items()):
                chapter_kp.extend(v.get('keyPoints', []))
            chapter_kp = unique_keep_order(chapter_kp, limit=8)
            new_obj[ck] = {
                'fullText': '\n\n'.join(v['body'] for _, v in sorted(sec_map.items())[:2]),
                'keyPoints': chapter_kp if chapter_kp else ['本章教学设计暂未收录'],
                'sections': sec_map
            }

        with open(src_json, 'w', encoding='utf-8') as f:
            json.dump(new_obj, f, ensure_ascii=False, indent=2)

        report[book] = {
            'chapters': len(new_obj),
            'sections': covered_sections
        }

    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    build()
