# services/extractor.py
# Extract text from PDF/DOCX and split into safe-sized chunks for the LLM

import re
import os
import logging

logger = logging.getLogger(__name__)

# Claude's context is 200k tokens, but we keep chunks small for:
# - Better focused analysis (model doesn't lose attention)
# - Cheaper API calls
# - Ability to parallelize later
MAX_WORDS_PER_CHUNK = 1200   # ~1,600 tokens — safe for any model
OVERLAP_WORDS       = 100    # carry 100 words across chunk boundaries


# ── Public API ────────────────────────────────────────────────────────────────

def extract_text(file_path: str) -> dict:
    """
    Extract text from PDF, DOCX, or TXT.
    Returns: { text, page_count, word_count, method }
    """
    ext = os.path.splitext(file_path)[-1].lower()

    if ext == ".pdf":
        return _extract_pdf(file_path)
    elif ext in (".docx", ".doc"):
        return _extract_docx(file_path)
    elif ext == ".txt":
        return _extract_txt(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")


def chunk_document(text: str) -> list[dict]:
    """
    Main chunking function.

    Strategy (in order):
      1. Split by legal section headers  (§1, Article II, Section 3…)
      2. Any chunk still > MAX_WORDS → split it into smaller pieces with overlap
      3. Merge any chunk that's too tiny (< 80 words) into the previous one

    Returns list of: { header, full_text, word_count, chunk_index }
    """
    # Step 1 — section split
    sections = _split_by_headers(text)

    # Step 2 — break oversized sections, keep overlap
    chunks = []
    for section in sections:
        word_count = len(section["full_text"].split())
        if word_count > MAX_WORDS_PER_CHUNK:
            sub = _split_with_overlap(section["header"], section["full_text"])
            chunks.extend(sub)
        else:
            chunks.append(section)

    # Step 3 — merge tiny chunks into previous
    chunks = _merge_tiny(chunks, min_words=80)

    # Tag with index
    for i, c in enumerate(chunks):
        c["chunk_index"] = i
        c["word_count"]  = len(c["full_text"].split())

    logger.info(
        f"Chunked into {len(chunks)} pieces "
        f"(avg {sum(c['word_count'] for c in chunks) // max(len(chunks),1)} words each)"
    )
    return chunks


# ── Step 1: Section-based split ───────────────────────────────────────────────

def _split_by_headers(text: str) -> list[dict]:
    """
    Split on legal section markers:
    §1, §1.2, Article I, Article III, Section 2, CLAUSE 4, etc.
    """
    pattern = (
        r"((?:§\s*[\d.]+|Article\s+[IVXLC\d]+|Section\s+\d+[\d.]*"
        r"|CLAUSE\s+\d+|SCHEDULE\s+[A-Z\d]+)[^\n]*)"
    )
    parts = re.split(pattern, text, flags=re.IGNORECASE)

    sections = []

    # parts = [preamble, header, content, header, content, ...]
    # Handle preamble (text before first header)
    preamble = parts[0].strip()
    if len(preamble) > 80:
        sections.append({"header": "Preamble", "full_text": preamble})

    for i in range(1, len(parts), 2):
        header  = parts[i].strip()
        content = parts[i + 1].strip() if i + 1 < len(parts) else ""
        if len(content) > 30:
            sections.append({"header": header, "full_text": f"{header}\n\n{content}"})

    # No headers found — treat whole text as one block (will be split next)
    if not sections:
        sections = [{"header": "Contract", "full_text": text}]

    return sections


# ── Step 2: Overlap split for large sections ──────────────────────────────────

def _split_with_overlap(header: str, text: str) -> list[dict]:
    """
    Split a single oversized section into chunks of MAX_WORDS_PER_CHUNK words
    with OVERLAP_WORDS words of carry-over at each boundary.

    Example with MAX=1200, OVERLAP=100:
      chunk 1: words 0–1200
      chunk 2: words 1100–2300   (100 word overlap from chunk 1)
      chunk 3: words 2200–3400
    """
    words  = text.split()
    total  = len(words)
    step   = MAX_WORDS_PER_CHUNK - OVERLAP_WORDS
    chunks = []
    part   = 1
    start  = 0

    while start < total:
        end        = min(start + MAX_WORDS_PER_CHUNK, total)
        chunk_text = " ".join(words[start:end])
        chunk_label = f"{header} (part {part})" if total > MAX_WORDS_PER_CHUNK else header
        chunks.append({"header": chunk_label, "full_text": chunk_text})
        part  += 1
        start += step   # slide forward by step (not full window, hence overlap)

    return chunks


# ── Step 3: Merge tiny chunks ─────────────────────────────────────────────────

def _merge_tiny(chunks: list[dict], min_words: int) -> list[dict]:
    """
    Merge any chunk smaller than min_words into the previous chunk.
    Prevents sending 10-word signature blocks as separate API calls.
    """
    if not chunks:
        return chunks

    merged = [chunks[0]]
    for chunk in chunks[1:]:
        if len(chunk["full_text"].split()) < min_words:
            # Append to previous chunk
            merged[-1]["full_text"] += "\n\n" + chunk["full_text"]
            merged[-1]["header"]    += " + " + chunk["header"]
        else:
            merged.append(chunk)

    return merged


# ── Text extraction helpers ───────────────────────────────────────────────────

def _extract_pdf(path: str) -> dict:
    try:
        import fitz
        doc   = fitz.open(path)
        pages = [page.get_text() for page in doc]
        text  = "\n\n".join(pages)
        if len(text.strip()) > 100:
            return _doc(text, len(doc), "pymupdf")
        logger.info("PyMuPDF got little text — trying pdfplumber")
    except Exception as e:
        logger.warning(f"PyMuPDF failed: {e}")

    try:
        import pdfplumber
        with pdfplumber.open(path) as pdf:
            pages = [p.extract_text() or "" for p in pdf.pages]
            count = len(pdf.pages)
        text = "\n\n".join(pages)
        return _doc(text, count, "pdfplumber")
    except Exception as e:
        raise RuntimeError(f"Cannot extract text from PDF: {e}")


def _extract_docx(path: str) -> dict:
    from docx import Document
    doc  = Document(path)
    text = "\n\n".join(p.text for p in doc.paragraphs if p.text.strip())
    return _doc(text, 1, "docx")


def _extract_txt(path: str) -> dict:
    with open(path, encoding="utf-8", errors="replace") as f:
        text = f.read()
    return _doc(text, 1, "txt")


def _doc(text: str, pages: int, method: str) -> dict:
    text = _clean(text)
    return {"text": text, "page_count": pages, "word_count": len(text.split()), "method": method}


def _clean(text: str) -> str:
    text = re.sub(r"Page\s+\d+\s+of\s+\d+", "", text, flags=re.IGNORECASE)
    text = re.sub(r"CONFIDENTIAL.*?(?=\n)", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    return text.strip()