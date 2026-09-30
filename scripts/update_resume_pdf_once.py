from pathlib import Path
import os, tempfile, shutil
import fitz

PDF_PATH = Path(os.environ.get('RESUME_PDF', 'assets/docs/신동식_이력서_UX & Product Design Lead.pdf'))

DATE_ITEMS = [
    (1, '2025-NOW', '2025.04-NOW'),
    (2, '2022-2024', '2022.02-2024.07'),
    (3, '2021-2022', '2021.01-2022.02'),
    (3, '2020', '2020.07-2020.12'),
    (4, '2017-2020', '2017.08-2020.03'),
    (4, '2016-2017', '2016.05-2017.07'),
    (4, '2013-2016', '2013.09-2016.05'),
    (5, '2005-2013', '2005.08-2013.09'),
]

def exact_span(page, text):
    for block in page.get_text('dict').get('blocks', []):
        for line in block.get('lines', []):
            for span in line.get('spans', []):
                if span.get('text', '').strip() == text:
                    return span
    return None

def find_averta_regular_xref(doc):
    for page in doc:
        for font in page.get_fonts(full=True):
            xref, ext, subtype, basefont = font[0], font[1], font[2], font[3]
            if 'AvertaPE-Regular' in basefont and ext == 'cff':
                return xref
    raise RuntimeError('Embedded Averta PE Regular CFF font not found')

def main():
    if not PDF_PATH.exists():
        raise FileNotFoundError(PDF_PATH)

    doc = fitz.open(PDF_PATH)
    if doc.page_count != 6:
        raise RuntimeError(f'Unexpected page count: {doc.page_count}')

    averta_xref = find_averta_regular_xref(doc)
    _, ext, _, font_bytes = doc.extract_font(averta_xref)
    font_tmp = Path(tempfile.gettempdir()) / f'resume_averta_regular.{ext}'
    font_tmp.write_bytes(font_bytes)
    averta = fitz.Font(fontfile=str(font_tmp))
    helv = fitz.Font('helv')

    positions = []
    for pno, old, new in DATE_ITEMS:
        page = doc[pno]
        if exact_span(page, new):
            continue
        hits = page.search_for(old)
        if not hits:
            raise RuntimeError(f'Date label not found on page {pno + 1}: {old}')
        rect = sorted(hits, key=lambda r: (r.x0, r.y0))[0]
        baseline = None
        for block in page.get_text('dict').get('blocks', []):
            for line in block.get('lines', []):
                for span in line.get('spans', []):
                    if span.get('text', '').strip() == old and abs(span['bbox'][0] - rect.x0) < 2 and abs(span['bbox'][1] - rect.y0) < 2:
                        baseline = span.get('origin', (rect.x0, rect.y1 - 1.5))[1]
                        break
                if baseline is not None:
                    break
            if baseline is not None:
                break
        if baseline is None:
            baseline = rect.y1 - 1.5
        page.add_redact_annot(fitz.Rect(rect.x0 - 0.8, rect.y0 - 0.6, rect.x1 + 1.0, rect.y1 + 0.6), fill=(1, 1, 1))
        positions.append((pno, rect.x0, baseline, new))

    for pno in sorted({p[0] for p in positions}):
        doc[pno].apply_redactions()

    date_size = 6.0
    fallback_size = 5.7
    date_color = (35 / 255, 31 / 255, 32 / 255)
    for pno, x, y, new in positions:
        page = doc[pno]
        page.insert_font(fontname='AvertaDate', fontfile=str(font_tmp))
        cursor = x
        for ch in new:
            if averta.has_glyph(ord(ch)):
                page.insert_text((cursor, y), ch, fontsize=date_size, fontname='AvertaDate', color=date_color, overlay=True)
                cursor += averta.text_length(ch, fontsize=date_size)
            else:
                page.insert_text((cursor, y - 0.05), ch, fontsize=fallback_size, fontname='helv', color=date_color, overlay=True)
                cursor += helv.text_length(ch, fontsize=fallback_size)

    page = doc[5]
    email = exact_span(page, 'subtraction.design@gmail.com')
    website = exact_span(page, 'www.shindongsik.com')
    if not email or not website:
        raise RuntimeError('Contact email / website span not found')

    already_phone = False
    for block in page.get_text('dict').get('blocks', []):
        for line in block.get('lines', []):
            for span in line.get('spans', []):
                if span.get('text', '').startswith('010') and span['bbox'][0] > 280 and span['bbox'][1] > email['bbox'][1]:
                    already_phone = True
                    break

    if not already_phone:
        x = email['origin'][0]
        spacing = email['origin'][1] - website['origin'][1]
        y = email['origin'][1] + spacing
        size = float(email['size'])
        page.insert_font(fontname='AvertaPhone', fontfile=str(font_tmp))
        cursor = x
        for ch in '010 3086 5709':
            if averta.has_glyph(ord(ch)):
                fontname, font, dy = 'AvertaPhone', averta, 0
            else:
                fontname, font, dy = 'helv', helv, 0.05
            page.insert_text((cursor, y + dy), ch, fontsize=size, fontname=fontname,
                             color=(0, 0, 0), fill_opacity=0.62, overlay=True)
            cursor += font.text_length(ch, fontsize=size)

    meta = doc.metadata
    meta.update({
        'title': '신동식_UX & Product Design Lead',
        'author': '신동식',
        'subject': 'UX & Product Design Lead Resume',
        'keywords': 'UX, Product Design, Design Lead, Resume',
    })
    doc.set_metadata(meta)

    out = PDF_PATH.with_suffix('.updated.pdf')
    doc.save(out, garbage=4, deflate=True, clean=True)
    doc.close()
    shutil.move(out, PDF_PATH)

    check = fitz.open(PDF_PATH)
    if check.page_count != 6:
        raise RuntimeError('Output page count changed unexpectedly')
    check.close()
    print(f'Updated {PDF_PATH}')

if __name__ == '__main__':
    main()
