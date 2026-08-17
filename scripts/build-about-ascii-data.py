#!/usr/bin/env python3
import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent.parent
FRAME_DIR = ROOT / "assets" / "about-ascii"
OUTPUT = ROOT / "about-ascii-data.js"
WIDTH = 288
HEIGHT = 162
COUNT = 7


def fnv1a(data: bytes) -> str:
    value = 0x811C9DC5
    for byte in data:
        value ^= byte
        value = (value * 0x01000193) & 0xFFFFFFFF
    return f"{value:08x}"


def pack_frame(path: Path) -> bytes:
    with Image.open(path) as image:
        gray = image.convert("L")
        if gray.size != (WIDTH, HEIGHT):
            raise ValueError(f"{path.name}: expected {WIDTH}x{HEIGHT}, got {gray.size}")
        values = [min(15, max(0, round(pixel / 17))) for pixel in gray.get_flattened_data()]

    packed = bytearray()
    for index in range(0, len(values), 2):
        high = values[index]
        low = values[index + 1] if index + 1 < len(values) else 0
        packed.append((high << 4) | low)
    return bytes(packed)


def main() -> None:
    payload = b"".join(
        pack_frame(FRAME_DIR / f"frame-{index:02d}.png")
        for index in range(1, COUNT + 1)
    )
    data = {
        "width": WIDTH,
        "height": HEIGHT,
        "levels": 15,
        "count": COUNT,
        "encoding": "u4-array",
        "checksum": fnv1a(payload),
        "bytes": list(payload),
    }
    OUTPUT.write_text(
        "window.ABOUT_ASCII_PACKED="
        + json.dumps(data, separators=(",", ":"))
        + ";\n",
        encoding="utf-8",
    )
    print(f"wrote {OUTPUT.name}: {WIDTH}x{HEIGHT} x {COUNT}, {len(payload)} bytes, {data['checksum']}")


if __name__ == "__main__":
    main()
