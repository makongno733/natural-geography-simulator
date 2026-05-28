"""
Process extracted middle/high school textbook text.
Extracts content by chapter boundaries, stores as chapter-level text.
Usage: python3 scripts/process_middle_school_content.py
"""
import json
import os
import re

BASE = os.path.dirname(os.path.dirname(__file__))

# Chapter info per book
BOOK_CHAPTERS = {
    "初中/七年级上册": {
        "第一章": "地球",
        "第二章": "地图",
        "第三章": "陆地和海洋",
    },
    "初中/七年级下册": {
        "第七章": "我们生活的大洲——亚洲",
        "第八章": "我们邻近的地区和国家",
        "第九章": "东半球其他的地区和国家",
    },
    "初中/八年级上册": {
        "第一章": "从世界看中国",
        "第二章": "中国的自然环境",
        "第三章": "中国的自然资源",
    },
    "初中/八年级下册": {
        "第六章": "中国的地理差异",
        "第七章": "南方地区",
    },
    "高中/必修第一册": {
        "第一章": "宇宙中的地球",
        "第二章": "地球上的大气",
        "第三章": "地球上的水",
        "第四章": "地貌",
        "第五章": "植被与土壤",
        "第六章": "自然灾害",
    },
    "高中/必修第二册": {
        "第一章": "人口",
        "第二章": "乡村和城镇",
        "第三章": "产业区位因素",
    },
    "高中/选择性必修1": {
        "第一章": "地球的运动",
        "第二章": "地表形态的塑造",
        "第三章": "大气的运动",
    },
    "高中/选择性必修2": {
        "第一章": "区域与区域发展",
    },
    "高中/选择性必修3": {
        "第一章": "自然环境与人类社会",
    },
}


def load_pages(book_key):
    path = os.path.join(BASE, "src", "textbook", "data", book_key, "text.txt")
    if not os.path.exists(path):
        return None
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    pages = {}
    for block in content.split('=== PAGE '):
        block = block.strip()
        if not block:
            continue
        m = re.match(r'(\d+) ===\n(.*)', block, re.DOTALL)
        if m:
            pages[int(m.group(1))] = m.group(2).strip()
    return pages


def page_has_chapter_heading(text, ch_clean):
    """
    Check if a page contains a chapter heading, handling vertical layout
    where characters might be on separate lines (e.g. 第 一 章 spread across lines).
    """
    # Remove all whitespace and check full text
    text_flat = re.sub(r'[\s　]', '', text)

    # Direct match in flattened text
    if ch_clean in text_flat:
        return True

    # Check for vertically-laid-out characters (each on its own line)
    # For "第一章", check if 第, 一, 章 appear on consecutive short lines
    lines = [re.sub(r'[　\s]', '', l) for l in text.split('\n') if l.strip()]
    # Look for 3 short lines containing the characters in order
    for i in range(len(lines) - 2):
        if len(lines[i]) <= 2 and len(lines[i+1]) <= 2 and len(lines[i+2]) <= 2:
            combo = lines[i] + lines[i+1] + lines[i+2]
            if ch_clean in combo:
                return True

    return False


def find_chapter_pages(pages, chapters):
    """
    For each chapter, find the page range by looking for chapter start markers.
    """
    chapter_starts = []

    for ch_id in chapters:
        ch_clean = re.sub(r'[　\s]', '', ch_id)
        found_page = None
        for p in sorted(pages.keys()):
            if p < 8:
                continue
            text = pages[p]
            if page_has_chapter_heading(text, ch_clean):
                # Verify: the page shouldn't look like TOC (no ellipsis-dotted lines)
                lines = text.split('\n')
                toc_lines = sum(1 for l in lines if '…' in l and len(l.strip()) < 50)
                if toc_lines < 3:
                    found_page = p
                    break

        if found_page is not None:
            chapter_starts.append((ch_id, found_page))

    return chapter_starts


def extract_chapter_text(pages, start_page, end_page=None, max_chars=12000):
    """Extract clean text for a chapter's page range."""
    if end_page is None:
        end_page = max(pages.keys())

    parts = []
    for p in range(start_page, end_page + 1):
        if p not in pages:
            continue
        text = pages[p]
        lines = text.split('\n')
        filtered = []
        for line in lines:
            line = line.strip()
            if not line:
                continue
            # Skip running headers (like "12 第一章 地球")
            if re.match(r'^\d{1,3}\s+第[一二三四五六七八九十]+章', line):
                continue
            # Skip page-only numbers
            if re.match(r'^\d{1,3}\s*$', line):
                continue
            filtered.append(line)

        chunk = '\n'.join(filtered)
        if len(chunk) > 30:
            parts.append(chunk)

    result = '\n\n'.join(parts)
    return result[:max_chars]


def extract_key_points(text, max_points=3):
    text = re.sub(r'[■◆●○▲△□◇★※]', '', text)
    text = re.sub(r'[　]', '', text)
    sentences = re.split(r'[。！？]', text)
    points = []
    for s in sentences:
        s = s.strip()
        s = re.sub(r'[①②③④⑤⑥⑦⑧⑨⑩]', '', s)
        if len(s) < 15:
            continue
        chinese_chars = sum(1 for c in s if '一' <= c <= '鿿' or 'a' <= c <= 'z')
        if chinese_chars / max(len(s), 1) < 0.2:
            continue
        points.append(s[:200])
        if len(points) >= max_points:
            break
    return points


def process_book(book_key):
    print(f"\n{book_key}:")
    pages = load_pages(book_key)
    if pages is None:
        print("  [SKIP] no text file")
        return

    chapters = BOOK_CHAPTERS.get(book_key, {})
    data_path = os.path.join(BASE, "src", "textbook", "data", book_key, "content.json")
    result = {}

    chapter_starts = find_chapter_pages(pages, chapters)

    for i, (ch_id, start_page) in enumerate(chapter_starts):
        # End page is the next chapter's start, or end of book
        end_page = chapter_starts[i + 1][1] - 1 if i + 1 < len(chapter_starts) else None

        text = extract_chapter_text(pages, start_page, end_page)
        if len(text) < 20:
            text = "内容暂缺"
            print(f"  [EMPTY] {ch_id} (p.{start_page})")
        else:
            kp = extract_key_points(text)
            # Store at chapter level (all sections share this content)
            result[ch_id] = {
                "fullText": text,
                "keyPoints": kp,
            }
            print(f"  [OK] {ch_id} {chapters[ch_id]}: {len(text)} chars (p.{start_page}-{end_page or 'end'})")

    if not chapter_starts:
        print(f"  [WARN] No chapter starts found - saving full text")
        # Fallback: save all content as one chapter
        first_page = min(p for p in pages if p >= 8)
        text = extract_chapter_text(pages, first_page, None)
        for ch_id in chapters:
            result[ch_id] = {"fullText": text[:12000], "keyPoints": extract_key_points(text)}

    with open(data_path, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print(f"  [SAVED] {data_path}")


if __name__ == "__main__":
    for book_key in BOOK_CHAPTERS:
        process_book(book_key)
    print("\nDone!")
