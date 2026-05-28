"""
OCR extraction for 自然地理学.pdf
Processes pages by chapter and saves to text files.
Usage: python3 scripts/ocr_natural_geography.py [chapter_num]
If chapter_num omitted, processes all chapters.
"""
import fitz
import subprocess
import tempfile
import os
import sys
import time
from PIL import Image

PDF_PATH = "/Users/kongnoma/Desktop/自然地理学.pdf"
OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)),
                       "src", "textbook", "data", "大学", "自然地理学")
os.makedirs(OUT_DIR, exist_ok=True)

# Chapter page ranges (0-indexed)
CHAPTERS = {
    "绪论": (14, 20),
    "第一章": (21, 55),
    "第二章": (56, 94),
    "第三章": (94, 186),
    "第四章": (186, 258),
    "第五章": (259, 323),
    "第六章": (323, 393),
    "第七章": (393, 471),
    "第八章": (471, 516),
}

def ocr_page(page, page_num):
    """OCR a single page and return text."""
    pix = page.get_pixmap(dpi=200)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f:
        tmp_path = f.name
        img.save(tmp_path, 'PNG')
    try:
        result = subprocess.run(
            ['tesseract', tmp_path, 'stdout', '-l', 'chi_sim+eng', '--psm', '6'],
            capture_output=True, text=True, timeout=60
        )
        return result.stdout.strip()
    finally:
        os.unlink(tmp_path)

def process_chapter(ch_name, start_page, end_page):
    """OCR all pages in a chapter range and save to file."""
    out_file = os.path.join(OUT_DIR, f"{ch_name}.txt")

    # Check if already done
    existing_text = ""
    if os.path.exists(out_file):
        with open(out_file, 'r') as f:
            existing_text = f.read()
        existing_pages = len([l for l in existing_text.split('\n') if l.startswith('=== PAGE ')])
        if existing_pages >= (end_page - start_page):
            print(f"  [SKIP] {ch_name} already complete ({existing_pages} pages)")
            return existing_text

    doc = fitz.open(PDF_PATH)
    try:
        output_lines = []
        total = end_page - start_page

        for i, page_num in enumerate(range(start_page, end_page)):
            idx = page_num - 1  # PyMuPDF is 0-indexed
            if idx >= len(doc):
                break
            page = doc[idx]
            print(f"  OCR {ch_name}: page {page_num}/{end_page} ({i+1}/{total})...")
            text = ocr_page(page, page_num)
            output_lines.append(f"=== PAGE {page_num} ===")
            output_lines.append(text)
            output_lines.append("")

        result = '\n'.join(output_lines)
        with open(out_file, 'w') as f:
            f.write(result)
        print(f"  [DONE] {ch_name}: {len(output_lines)} lines -> {out_file}")
        return result
    finally:
        doc.close()

if __name__ == "__main__":
    chapters_to_process = list(CHAPTERS.items())

    if len(sys.argv) > 1:
        num = sys.argv[1]
        chapters_to_process = [(k, v) for k, v in CHAPTERS.items() if k.startswith(num) or k == num]
        if not chapters_to_process:
            print(f"Chapter '{num}' not found. Options: 绪论, 第一章~第八章")
            sys.exit(1)

    doc = fitz.open(PDF_PATH)
    doc.close()

    total_est = 0
    for ch_name, (start, end) in chapters_to_process:
        pages = end - start
        total_est += pages
        print(f"\n{'='*50}")
        print(f"Processing {ch_name} ({pages} pages, ~{pages*2}s estimated)")
        print(f"{'='*50}")
        process_chapter(ch_name, start, end)

    print(f"\nAll done! ~{total_est} pages processed.")
