"""
Process OCR-extracted text per chapter, split into sections,
and generate JSON content for runtime loading.
Usage: python3 scripts/build_content_json.py
"""
import json
import os
import re

BASE = os.path.dirname(os.path.dirname(__file__))
OCR_DIR = os.path.join(BASE, "src", "textbook", "data", "大学", "自然地理学")
OUT_FILE = os.path.join(OCR_DIR, "index.json")

# Section page ranges from PDF TOC (inclusive, 1-indexed)
CHAPTER_SECTIONS = {
    "第一章": {
        "sections": [
            ("第一节", "地球在宇宙中的位置", 23, 32),
            ("第二节", "地球的形状和大小", 32, 37),
            ("第三节", "地球的运动", 37, 45),
            ("第四节", "地理坐标", 45, 47),
            ("第五节", "地球的圈层构造", 47, 50),
            ("第六节", "地球表面的基本形态和特征", 50, 55),
        ]
    },
    "第二章": {
        "sections": [
            ("第一节", "地壳的组成物质", 58, 68),
            ("第二节", "构造运动与地质构造", 68, 77),
            ("第三节", "大地构造学说", 77, 84),
            ("第四节", "火山与地震", 84, 86),
            ("第五节", "地壳的演变", 86, 94),
        ]
    },
}


def load_pages(chapter_name):
    """Load OCR text and return dict of page_num -> text."""
    path = os.path.join(OCR_DIR, f"{chapter_name}.txt")
    if not os.path.exists(path):
        return {}
    with open(path, 'r') as f:
        content = f.read()

    pages = {}
    current_page = None
    current_text = []

    for line in content.split('\n'):
        m = re.match(r'=== PAGE (\d+) ===', line)
        if m:
            if current_page is not None:
                pages[current_page] = '\n'.join(current_text).strip()
            current_page = int(m.group(1))
            current_text = []
        elif current_page is not None:
            current_text.append(line)

    if current_page is not None:
        pages[current_page] = '\n'.join(current_text).strip()

    return pages


def extract_section_body(pages, start_page, end_page):
    """Extract text body for a page range [start, end)."""
    parts = []
    for p in range(start_page, end_page):
        text = pages.get(p, "")
        if text:
            parts.append(text)
    return '\n\n'.join(parts)


def extract_key_points(text, max_points=3):
    """Extract first meaningful sentences as key points."""
    # Clean common OCR artifacts
    text = re.sub(r'[■◆●○▲△□◇]', '', text)
    sentences = re.split(r'[。！？]', text)
    points = []
    for s in sentences:
        s = s.strip()
        # Skip short lines, page numbers, chapter headings
        if len(s) < 15:
            continue
        if re.match(r'^\d+\s', s):
            continue
        # Skip lines that are mostly symbols or garbled
        alpha_ratio = sum(1 for c in s if '一' <= c <= '鿿') / max(len(s), 1)
        if alpha_ratio < 0.4:
            continue
        s_clean = re.sub(r'\s+', '', s)
        if 20 < len(s_clean) < 300:
            points.append(s_clean)
        if len(points) >= max_points:
            break
    return points


def main():
    print("Building college textbook content JSON...")
    result = {}

    for ch_name, ch_info in CHAPTER_SECTIONS.items():
        print(f"\n{ch_name}:")
        pages = load_pages(ch_name)
        if not pages:
            print(f"  [SKIP] no OCR data")
            result[ch_name] = {}
            continue

        ch_data = {}
        for sec_id, sec_title, start_p, end_p in ch_info["sections"]:
            body = extract_section_body(pages, start_p, end_p)
            if len(body) < 20:
                body = "内容暂缺"
                print(f"  [EMPTY] {sec_id} {sec_title}")
            else:
                print(f"  [OK] {sec_id} {sec_title}: {len(body)} chars")

            kp = extract_key_points(body)
            ch_data[sec_id] = {
                "title": sec_title,
                "keyPoints": kp,
                "body": body[:8000],  # cap at 8000 chars per section
                "interactive": None,
                "ppt": None
            }
        result[ch_name] = ch_data

    with open(OUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print(f"\nWritten to {OUT_FILE}")
    print(f"Total sections: {sum(len(v) for v in result.values())}")


if __name__ == "__main__":
    main()
