"""
Process OCR text and update textbook data with extracted content.
Usage: python3 scripts/process_ocr_content.py
"""
import re
import json
import os

DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)),
                         "src", "textbook", "data", "index.js")
OCR_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)),
                       "src", "textbook", "data", "大学", "自然地理学")

def load_ocr(chapter_name):
    """Load OCR text for a chapter."""
    path = os.path.join(OCR_DIR, f"{chapter_name}.txt")
    if not os.path.exists(path):
        print(f"  [WARN] OCR file not found: {path}")
        return ""
    with open(path, 'r') as f:
        return f.read()

def extract_section_text(text, section_title):
    """Extract text for a section based on heading marker."""
    lines = text.split('\n')
    result = []
    in_section = False

    # Find the section heading
    for i, line in enumerate(lines):
        if section_title in line and not line.startswith('==='):
            in_section = True
            continue
        if in_section:
            # Check if we hit next heading (下一节/下一章 marker or === PAGE for new major section)
            if line.startswith('===') and any(kw in line for kw in ['思考', '主要参考', '节']):
                break
            # Stop at next major section heading (looking for the next section's page header)
            if line.startswith('=== PAGE') and i < len(lines) - 1:
                next_line = lines[i+1] if i+1 < len(lines) else ""
                # Only break if the next page starts with a different major section
                for kw in ['思考题', '主要参考']:
                    if kw in next_line or kw in line:
                        return '\n'.join(result).strip()
            if line.strip() and not line.startswith('==='):
                # Skip page number lines (like "70 第一章 地球")
                if re.match(r'^\d+\s+第[一二三四五六七八]章', line):
                    continue
                result.append(line)

    return '\n'.join(result).strip()

def extract_key_points(text):
    """Extract key points from section text (first substantive sentences)."""
    sentences = []
    for line in text.split('\n'):
        line = line.strip()
        if len(line) > 20 and not line.startswith('一、') and not line.startswith('二、'):
            sentences.append(line)
        if len(sentences) >= 3:
            break
    # Take first 2-3 meaningful sentences as key points
    key_points = []
    for s in sentences[:3]:
        s = s.strip()
        if len(s) > 15:
            key_points.append(s[:150])  # truncate long sentences
    return key_points

# Section mapping: section_id -> title keywords to find in OCR
CHAPTER_SECTIONS = {
    "第一章": {
        "sections": {
            "第一节": "地球在宇宙中的位置",
            "第二节": "地球的形状和大小",
            "第三节": "地球的运动",
            "第四节": "地理坐标",
            "第五节": "地球的圈层构造",
            "第六节": "地球表面的基本形态和特征",
        },
        "page_range": (21, 55)
    }
}

def update_data_file(chapter, section_map):
    """Update index.js with extracted content."""
    ocr_text = load_ocr(chapter)
    if not ocr_text:
        return

    with open(DATA_FILE, 'r') as f:
        content = f.read()

    for sec_id, sec_title in section_map["sections"].items():
        sec_text = extract_section_text(ocr_text, sec_title)
        if not sec_text:
            print(f"  [WARN] No text extracted for {sec_id} {sec_title}")
            continue

        # Get key points
        key_points = extract_key_points(sec_text)

        # Escape for JS string
        body_escaped = sec_text.replace('\\', '\\\\').replace("'", "\\'").replace('\n', '\\n').replace('"', '\\"')
        body_truncated = body_escaped[:5000]  # limit body to reasonable length

        # Find the section in index.js and replace the body
        old_pattern = f"id: '{sec_id}', title: '{sec_title}', content: {{ keyPoints:"
        # Try without keyPoints first
        old_pattern_alt = f"id: '{sec_id}', title: '{sec_title}', content: {{ keyPoints: [], body: '详细内容待填充…'"

        kp_json = json.dumps(key_points, ensure_ascii=False)
        new_content_str = f"id: '{sec_id}', title: '{sec_title}', content: {{ keyPoints: {kp_json}, body: '{body_truncated}'"

        if old_pattern_alt in content:
            content = content.replace(old_pattern_alt, new_content_str)
            print(f"  [OK] Updated {sec_id} {sec_title}: {len(key_points)} key points, {len(body_truncated)} chars body")
        else:
            print(f"  [WARN] Pattern not found for {sec_id} {sec_title}")

    with open(DATA_FILE, 'w') as f:
        f.write(content)

if __name__ == "__main__":
    print("Processing OCR content for 大学/自然地理学...")
    for chapter, section_map in CHAPTER_SECTIONS.items():
        print(f"\n{chapter}:")
        update_data_file(chapter, section_map)
    print("\nDone!")
