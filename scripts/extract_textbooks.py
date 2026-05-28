"""
Extract text from 人教版 textbook PDFs.
Usage: python3 scripts/extract_textbooks.py [book_grade]
If book_grade omitted, processes all.
"""
import fitz
import subprocess
import tempfile
import os
import sys
import re
from PIL import Image

BASE = os.path.dirname(os.path.dirname(__file__))
OUT_DIR = os.path.join(BASE, "src", "textbook", "data")
os.makedirs(OUT_DIR, exist_ok=True)

# Textbook PDF paths mapped to (grade, book_id)
TEXTBOOKS = {
    "初中-七年级上册": "/Users/kongnoma/Downloads/【人教版】七年级上册(2024秋版)地理电子课本.pdf",
    "初中-七年级下册": "/Users/kongnoma/Downloads/【人教版】七年级下册(2025春版)地理电子课本.pdf",
    "初中-八年级上册": "/Users/kongnoma/Downloads/【人教版】八年级上册(2025秋版)地理电子课本.pdf",
    "初中-八年级下册": "/Users/kongnoma/Downloads/【人教版】八年级下册(2026春版)地理电子课本.pdf",
    "高中-必修第一册": "/Users/kongnoma/Downloads/【人教版】高中必修 第一册地理电子课本.pdf",
    "高中-必修第二册": "/Users/kongnoma/Downloads/【人教版】高中必修 第二册地理电子课本-社学整理.pdf",
    "高中-选择性必修1": "/Users/kongnoma/Downloads/【人教版】高中选择性必修1 自然地理基础地理电子课本.pdf",
    "高中-选择性必修2": "/Users/kongnoma/Downloads/【人教版】高中选择性必修2 区域发展地理电子课本-社学整理.pdf",
    "高中-选择性必修3": "/Users/kongnoma/Downloads/【人教版】高中选择性必修3 资源、环境与国家安全地理电子课本.pdf",
}

def extract_page_text(page, use_ocr):
    """Extract text from a page. If use_ocr, render and OCR."""
    if not use_ocr:
        text = page.get_text().strip()
        if text and len(text) > 20:
            return text

    # Fall back to OCR
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

def needs_ocr(pdf_path):
    """Quick check: does this PDF need OCR?"""
    doc = fitz.open(pdf_path)
    try:
        for i in [5, 10, 15]:
            if i < len(doc):
                t = doc[i].get_text().strip()
                if len(t) > 50:
                    return False
        return True
    finally:
        doc.close()

def process_book(key, pdf_path):
    """Extract all text from a textbook and save to file."""
    grade, book = key.split("-", 1)
    book_dir = os.path.join(OUT_DIR, grade, book)
    os.makedirs(book_dir, exist_ok=True)

    out_path = os.path.join(book_dir, "text.txt")
    if os.path.exists(out_path):
        print(f"  [SKIP] {key} already extracted")
        return

    use_ocr = needs_ocr(pdf_path)
    print(f"  OCR needed: {use_ocr}")

    doc = fitz.open(pdf_path)
    try:
        with open(out_path, 'w', encoding='utf-8') as f:
            for i in range(len(doc)):
                page = doc[i]
                text = extract_page_text(page, use_ocr)
                f.write(f"=== PAGE {i+1} ===\n")
                f.write(text + "\n\n")
                if (i+1) % 10 == 0:
                    print(f"    page {i+1}/{len(doc)}...")
        print(f"  [DONE] {key}: {len(doc)} pages -> {out_path}")
    finally:
        doc.close()

if __name__ == "__main__":
    books_to_process = list(TEXTBOOKS.items())

    if len(sys.argv) > 1:
        filter_key = sys.argv[1]
        books_to_process = [(k, v) for k, v in TEXTBOOKS.items() if filter_key.lower() in k.lower()]
        if not books_to_process:
            print(f"No match for '{filter_key}'. Options: {', '.join(TEXTBOOKS.keys())}")
            sys.exit(1)

    for key, path in books_to_process:
        print(f"\n{'='*50}")
        print(f"Processing: {key}")
        print(f"  Path: {path}")
        process_book(key, path)

    print(f"\nAll done!")
