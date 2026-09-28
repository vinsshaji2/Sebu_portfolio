#!/usr/bin/env python3
"""
Optional helper for PRD §7.4 — turn a folder of full-resolution photos into
web-ready AVIF + WebP + JPG at the right widths.

The site does NOT need this to run or deploy. It is a convenience so the
image step is repeatable instead of hand-done in Photoshop each time.

    pip install pillow
    python tools/optimise-images.py <source-folder> <preset>

Presets
    hero     640 / 1000 / 1280   (portrait, the LCP image)
    work     700 / 1400          (posters, frame grabs)
    thumb    1080                (video card stills, export 1080x1350 = 4:5)
    gallery  700 / 1400          (behind-the-scenes stills)

Output lands next to the source in an `out/` folder, named
<original-stem>-<width>.<ext>. Move the files into assets/img/... and point
the markup at them.

Every file is checked against the 250 KB per-image ceiling and the script
retries at a lower quality rather than shipping something too heavy.
"""
import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is not installed.  Run:  pip install pillow")

PRESETS = {
    "hero":    [640, 1000, 1280],
    "work":    [700, 1400],
    "thumb":   [1080],
    "gallery": [700, 1400],
}
MAX_KB = 250
EXTS = (".jpg", ".jpeg", ".png", ".tif", ".tiff", ".webp", ".heic")


def write_under_cap(im, path, fmt, start_q, floor_q=40):
    """Save, stepping quality down until the file fits the size ceiling."""
    q = start_q
    while True:
        if fmt == "JPEG":
            im.save(path, "JPEG", quality=q, optimize=True, progressive=True)
        elif fmt == "WEBP":
            im.save(path, "WEBP", quality=q, method=6)
        else:
            im.save(path, "AVIF", quality=q)
        kb = os.path.getsize(path) / 1024
        if kb <= MAX_KB or q <= floor_q:
            return kb, q
        q -= 6


def main():
    if len(sys.argv) != 3 or sys.argv[2] not in PRESETS:
        sys.exit(__doc__)

    src_dir, preset = sys.argv[1], sys.argv[2]
    widths = PRESETS[preset]
    out_dir = os.path.join(src_dir, "out")
    os.makedirs(out_dir, exist_ok=True)

    files = sorted(f for f in os.listdir(src_dir) if f.lower().endswith(EXTS))
    if not files:
        sys.exit("No images found in " + src_dir)

    for name in files:
        stem = os.path.splitext(name)[0].lower().replace(" ", "-")
        im = Image.open(os.path.join(src_dir, name)).convert("RGB")
        for w in widths:
            if w > im.width:
                continue  # never upscale
            r = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
            base = os.path.join(out_dir, "%s-%d" % (stem, w))
            jkb, jq = write_under_cap(r, base + ".jpg", "JPEG", 82)
            wkb, _ = write_under_cap(r, base + ".webp", "WEBP", 75)
            akb, _ = write_under_cap(r, base + ".avif", "AVIF", 55)
            print("%-34s %5dpx   avif %5.0fKB   webp %5.0fKB   jpg %5.0fKB (q%d)"
                  % (stem, w, akb, wkb, jkb, jq))
            print("    width=\"%d\" height=\"%d\"" % (r.width, r.height))

    print("\nDone. Files are in %s" % out_dir)
    print("Copy the width/height values printed above into the <img> tags —")
    print("they are what keeps CLS at zero.")


if __name__ == "__main__":
    main()
