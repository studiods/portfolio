from pathlib import Path
import base64
import lzma
import hashlib

EXPECTED_SIZE = 144307
EXPECTED_SHA256 = "701c58e2365a39a1687a666c21015a77fee8a581ee01b73973141044788e03b0"
TARGET = Path("assets/docs/신동식_이력서_UX & Product Design Lead.pdf")

parts = []
for i in range(1, 17):
    p = Path(f"tmp/resume_payload_{i:02d}.b64")
    if not p.exists():
        raise FileNotFoundError(p)
    parts.append(p.read_text(encoding="utf-8").strip())

compressed = base64.b64decode("".join(parts))
pdf = lzma.decompress(compressed)

if len(pdf) != EXPECTED_SIZE:
    raise RuntimeError(f"Size mismatch: {len(pdf)} != {EXPECTED_SIZE}")

digest = hashlib.sha256(pdf).hexdigest()
if digest != EXPECTED_SHA256:
    raise RuntimeError(f"SHA256 mismatch: {digest} != {EXPECTED_SHA256}")

TARGET.write_bytes(pdf)
print(f"Replaced {TARGET} ({len(pdf)} bytes, sha256={digest})")
