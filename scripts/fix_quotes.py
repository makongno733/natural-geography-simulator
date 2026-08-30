#!/usr/bin/env python3
"""把 refine 脚本里中文内容中的 ASCII 双引号转换为全角引号。

只处理"内容"里的引号，不动结构（字典键、字符串定界符）。
"""
import io, re, sys

def fix_alternating(text):
    res = []
    open_q = True
    for ch in text:
        if ch == '"':
            res.append('\u201c' if open_q else '\u201d')
            open_q = not open_q
        else:
            res.append(ch)
    return ''.join(res)

def main():
    p = sys.argv[1]
    s = io.open(p, encoding='utf-8').read()
    lines = s.split('\n')
    out = []
    for ln in lines:
        if '"""' in ln:  # body 边界或含三引号，交给后面的 body 处理
            out.append(ln)
            continue
        # 1) 概念定义值行  "初中": "..." / "高中": "..."
        m = re.match(r'^(\s*"(?:初中|高中)": ")(.*)("[,}]?)$', ln)
        if m:
            out.append(m.group(1) + fix_alternating(m.group(2)) + m.group(3))
            continue
        # 2) 字典键行（"key": ...）跳过
        if re.match(r'^(\s*)"[^"]*"\s*:', ln):
            out.append(ln)
            continue
        # 3) 裸字符串列表项（keyPoints 等）："..." 或 "...",
        m = re.match(r'^(\s*)"(.*)"(,?)$', ln)
        if m:
            out.append(m.group(1) + '"' + fix_alternating(m.group(2)) + '"' + m.group(3))
            continue
        out.append(ln)
    s2 = '\n'.join(out)

    # 4) body 三引号块内的 ASCII 引号 → 全角
    def fix_body(m):
        return '"""' + fix_alternating(m.group(1)) + '"""'
    s2 = re.sub(r'"""(.*?)"""', fix_body, s2, flags=re.S)

    io.open(p, 'w', encoding='utf-8').write(s2)
    print('fixed quotes in', p)

if __name__ == '__main__':
    main()
