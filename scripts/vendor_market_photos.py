#!/usr/bin/env python3
"""Vendor four approved Unsplash photos into compact, versioned local WebP assets.

Run only when the recorded sources are still valid/approved. Normal production
page loads never contact Unsplash. The script fails closed if a download fails,
rather than inserting a synthetic replacement photo.
"""
from __future__ import annotations

from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen
import os

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1] / "public" / "market"
PHOTOS = {
    "report-market-v27.webp": (
        "photo-1527410651988-c2f385ccd3f7", (1200, 500), 190_000,
    ),
    "topic-housing-v27.webp": (
        "photo-1746047139717-9cb0a70e0302", (960, 540), 120_000,
    ),
    "topic-infrastructure-v27.webp": (
        "photo-1767884161909-1abc7d766341", (960, 540), 120_000,
    ),
    "topic-green-building-v27.webp": (
        "photo-1773592396589-1ac47b18a23e", (960, 540), 120_000,
    ),
}
ALLOWED_HOST = "https://images.unsplash.com/"
MAX_SOURCE_SIZE = 15_000_000


def fetch(photo_id: str) -> bytes:
    url = f"{ALLOWED_HOST}{photo_id}?auto=format&fit=crop&w=1600&q=88"
    request = Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; LocalPhotoImport/1.0)"})
    with urlopen(request, timeout=35) as response:
        kind = response.headers.get("Content-Type", "")
        if not kind.lower().startswith("image/"):
            raise ValueError(f"Source is not an image: {kind}")
        data = response.read(MAX_SOURCE_SIZE + 1)
    if not data or len(data) > MAX_SOURCE_SIZE:
        raise ValueError("Image download empty or exceeds source-size limit")
    return data


def convert(source: bytes, size: tuple[int, int], cap: int) -> bytes:
    with Image.open(BytesIO(source)) as raw:
        if raw.width < size[0] // 2 or raw.height < size[1] // 2:
            raise ValueError(f"Source resolution unexpectedly small: {raw.size}")
        rgb = ImageOps.exif_transpose(raw).convert("RGB")
    # Match the actual editorial viewport while retaining generous image detail.
    image = ImageOps.fit(rgb, size, method=Image.Resampling.LANCZOS, centering=(.5, .52))
    result = b""
    for quality in (78, 72, 66, 60, 54, 48):
        out = BytesIO()
        image.save(out, format="WEBP", quality=quality, method=6)
        result = out.getvalue()
        if len(result) <= cap:
            break
    if len(result) > cap:
        raise ValueError(f"Converted image exceeds budget: {len(result)}>{cap}")
    with Image.open(BytesIO(result)) as check:
        if check.format != "WEBP" or check.size != size:
            raise ValueError("Converted asset did not pass integrity check")
    return result


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    total = 0
    for file_name, (photo_id, size, budget) in PHOTOS.items():
        target = ROOT / file_name
        if target.is_file() and target.stat().st_size > 1000:
            payload = target.read_bytes()
            with Image.open(BytesIO(payload)) as check:
                if check.format != "WEBP" or check.size != size:
                    raise ValueError(f"Existing asset has unexpected format/dimensions: {target}")
        else:
            payload = convert(fetch(photo_id), size, budget)
            target.write_bytes(payload)
        total += len(payload)
        print(f"{target.relative_to(ROOT.parent.parent)}: {size[0]}x{size[1]} {len(payload)/1024:.1f} KiB")
    print(f"TOTAL {total / 1024:.1f} KiB; 4 original licensed photographs vendored locally")


if __name__ == "__main__":
    main()
