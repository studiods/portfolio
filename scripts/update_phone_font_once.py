from pathlib import Path
import fitz

PDF_PATH = Path("assets/docs/신동식_이력서_UX & Product Design Lead.pdf")
FONT_PATH = Path("fonts/Averta-PE-Thin.otf")
PHONE = "010 3086 5709"

if not PDF_PATH.exists():
    raise FileNotFoundError(PDF_PATH)
if not FONT_PATH.exists():
    raise FileNotFoundError(FONT_PATH)

doc = fitz.open(PDF_PATH)
page = doc[-1]

hits = page.search_for(PHONE)
if len(hits) != 1:
    raise RuntimeError(f"Expected exactly one phone number hit, found {len(hits)}")

rect = hits[0]

# Preserve the baseline from the existing phone text.
baseline = None
for block in page.get_text("dict").get("blocks", []):
    for line in block.get("lines", []):
        line_text = "".join(span.get("text", "") for span in line.get("spans", []))
        if PHONE in line_text:
            spans = line.get("spans", [])
            if spans:
                baseline = spans[0].get("origin", (rect.x0, rect.y1 - 1.5))[1]
            break
    if baseline is not None:
        break
if baseline is None:
    baseline = rect.y1 - 1.5

# Remove only the existing phone number.
page.add_redact_annot(
    fitz.Rect(rect.x0 - 0.6, rect.y0 - 0.4, rect.x1 + 0.8, rect.y1 + 0.5),
    fill=(1, 1, 1)
)
page.apply_redactions()

# Reinsert in Averta PE Thin at the same size/position/tone.
page.insert_font(fontname="AvertaPhoneThin", fontfile=str(FONT_PATH))
page.insert_text(
    (rect.x0, baseline),
    PHONE,
    fontsize=10,
    fontname="AvertaPhoneThin",
    color=(0, 0, 0),
    fill_opacity=0.62,
    overlay=True,
)

out = PDF_PATH.with_suffix(".thin-phone.pdf")
doc.save(out, garbage=4, deflate=True, clean=True)
doc.close()
out.replace(PDF_PATH)

# Validate extraction and embedded font.
check = fitz.open(PDF_PATH)
page = check[-1]
if len(page.search_for(PHONE)) != 1:
    raise RuntimeError("Phone number validation failed after edit")

thin_seen = False
for block in page.get_text("dict").get("blocks", []):
    for line in block.get("lines", []):
        for span in line.get("spans", []):
            if PHONE in span.get("text", "") and "Thin" in span.get("font", ""):
                thin_seen = True
                break
        if thin_seen:
            break
    if thin_seen:
        break

if not thin_seen:
    # Some PDFs split text into multiple spans; verify page font resources too.
    thin_seen = any("Thin" in f[3] for f in page.get_fonts(full=True))

check.close()
if not thin_seen:
    raise RuntimeError("Averta PE Thin font validation failed")

print("Phone number updated to Averta PE Thin.")
