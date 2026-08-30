#!/usr/bin/env python3
"""Execute 选必2 figure specs: copy+resize images, register in figureAssets.js, add figures to content.json."""
import json, os, re, subprocess, sys

ROOT = '/Users/makongno/Documents/natural-geography-simulator-source'
SCRIPTS = os.path.join(ROOT, 'scripts')
ASSET_ROOT = os.path.join(ROOT, 'src', 'assets', 'textbook', '选择性必修2')
FIGASSET = os.path.join(ROOT, 'src', 'textbook', 'data', 'figureAssets.js')
CONTENT = os.path.join(ROOT, 'src', 'textbook', 'data', '高中', '选择性必修2', 'content.json')
MEDIA = '/tmp/x2_media'

SEC_DIR = {
    ('第一章','第一节'):'1.1', ('第一章','第二节'):'1.2', ('第一章','问题研究'):'q1',
    ('第二章','第一节'):'2.1', ('第二章','第二节'):'2.2', ('第二章','第三节'):'2.3', ('第二章','问题研究'):'q2',
    ('第三章','第一节'):'3.1', ('第三章','第二节'):'3.2', ('第三章','问题研究'):'q3',
    ('第四章','第一节'):'4.1', ('第四章','第二节'):'4.2', ('第四章','第三节'):'4.3', ('第四章','第四节'):'4.4', ('第四章','问题研究'):'q4',
}

def camel(s):
    parts = re.split(r'[-_\s]+', s)
    return parts[0].lower() + ''.join(p.capitalize() for p in parts[1:])

# 1. load specs
specs = {}
for n in [1,2,3,4]:
    p = os.path.join(SCRIPTS, f'_x2_fig_ch{n}.json')
    if not os.path.exists(p):
        print(f'MISSING {p}'); sys.exit(1)
    with open(p, encoding='utf-8') as f:
        d = json.load(f)
    specs.update(d)

# collect all images (transform key with x2 prefix to avoid collision with other books)
all_imgs = []
for ch, chval in specs.items():
    for sec, secval in chval.items():
        sdir = SEC_DIR.get((ch, sec))
        if not sdir:
            print(f'WARN no dir for {ch}.{sec}'); continue
        for fig in secval.get('figures', []):
            for img in fig.get('images', []):
                raw_key = img['key']
                key = 'x2' + raw_key  # unique prefix
                src = img['src']
                src_abs = os.path.join(MEDIA, sdir, 'ppt', 'media', src)
                if not os.path.exists(src_abs):
                    print(f'WARN missing src: {src_abs}'); continue
                ext = 'png' if src.lower().endswith(('.png', '.gif')) else 'jpg'
                out_rel = os.path.join(ASSET_ROOT, sdir, f'{key}.{ext}')
                all_imgs.append({'key': key, 'raw_key': raw_key, 'src_abs': src_abs,
                                 'out_rel': out_rel, 'ext': ext, 'var': camel(key), 'fig': fig})

from collections import Counter
c = Counter(i['key'] for i in all_imgs)
dups = {k:v for k,v in c.items() if v>1}
if dups:
    print('DUPLICATE KEYS:', dups); sys.exit(1)

# 2. copy + resize
import shutil
os.makedirs(ASSET_ROOT, exist_ok=True)
for i in all_imgs:
    os.makedirs(os.path.dirname(i['out_rel']), exist_ok=True)
    fmt = 'png' if i['ext'] == 'png' else 'jpeg'
    subprocess.run(['sips', '-s', 'format', fmt, '-Z', '1000', i['src_abs'], '--out', i['out_rel']],
                   check=True, capture_output=True)
print(f'copied+resized {len(all_imgs)} images')

# 3. register in figureAssets.js
imports = []
regs = []
for i in all_imgs:
    rel = os.path.relpath(i['out_rel'], os.path.dirname(FIGASSET)).replace(os.sep, '/')
    imports.append(f"import {i['var']} from '{rel}'")
    regs.append(f"  '{i['key']}': {i['var']},")
imports_sorted = sorted(set(imports))
regs_sorted = sorted(set(regs))

with open(FIGASSET, encoding='utf-8') as f:
    fa = f.read()
anchor = "export const figureAssets"
if anchor not in fa:
    print('ANCHOR not found'); sys.exit(1)
fa = fa.replace(anchor, '\n'.join(imports_sorted) + '\n\n' + anchor, 1)
fa = fa.rstrip()
if not fa.endswith('}'):
    print('figureAssets.js does not end with }'); sys.exit(1)
fa = fa[:-1] + '\n'.join(regs_sorted) + '\n}\n'
with open(FIGASSET, 'w', encoding='utf-8') as f:
    f.write(fa)
print('figureAssets.js updated with', len(regs_sorted), 'keys')

# 4. add figures to content.json (use transformed keys)
with open(CONTENT, encoding='utf-8') as f:
    content = json.load(f)
for ch, chval in specs.items():
    for sec, secval in chval.items():
        figs = secval.get('figures', [])
        if not figs:
            continue
        out_figs = []
        for fig in figs:
            keys = ['x2' + img['key'] for img in fig.get('images', [])]
            out_figs.append({'id': fig['id'], 'caption': fig['caption'], 'images': keys})
        content[ch]['sections'][sec]['figures'] = out_figs
        print(f'content.json: {ch}.{sec} -> {len(out_figs)} figures')
with open(CONTENT, 'w', encoding='utf-8', newline='') as f:
    f.write(json.dumps(content, ensure_ascii=False, indent=2))
print('content.json updated')
