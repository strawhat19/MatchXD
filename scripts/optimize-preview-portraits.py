"""Generate the phone preview portraits with Python and Pillow."""

import re
from pathlib import Path

from PIL import Image, ImageOps


project = Path(__file__).resolve().parents[1]
profiles = project / "assets" / "profiles"
previews = profiles / "previews"
people = project / "src" / "features" / "landing" / "phoneOrbit.ts"
photo_names = set(re.findall(r"photo: `([^`]+)`", people.read_text(encoding="utf-8")))
sources = {source.stem: source for source in profiles.rglob("*.png")}
previews.mkdir(exist_ok=True)
original_bytes = 0
preview_bytes = 0

for photo_name in sorted(photo_names):
    source = sources[photo_name]
    output = previews / f"{photo_name}.webp"
    with Image.open(source) as image:
        portrait = ImageOps.exif_transpose(image).convert("RGB")
        portrait.thumbnail((560, 840), Image.Resampling.LANCZOS)
        portrait.save(output, "WEBP", quality=85, method=6)
        print(f"{output.relative_to(project)}: {portrait.width} x {portrait.height}")
    original_bytes += source.stat().st_size
    preview_bytes += output.stat().st_size

print(f"{original_bytes:,} -> {preview_bytes:,} bytes ({1 - preview_bytes / original_bytes:.1%} smaller)")
