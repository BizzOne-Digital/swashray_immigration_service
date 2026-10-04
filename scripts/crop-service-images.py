"""Center-crop service card images to a 4:5 portrait ratio matching the
ServiceCard container (~400x450px), so object-cover shows the full image
without zooming past native resolution."""
from PIL import Image
import os

SERVICES_DIR = r"D:\projects\swashray-immigration-service\public\images\services"
TARGET_RATIO = 4 / 5
TARGET_WIDTH = 1200
TARGET_HEIGHT = 1500

IMAGES = [
    "family-sponsorship.png",
    "temporary-residence.png",
    "permanent-residence.png",
    "citizenship.png",
    "irb-representation.png",
    "other-immigration-services.png",
    "visitor-visa.png",
    "work-permits.png",
    "study-permits.png",
    "passport-services.png",
]

for name in IMAGES:
    path = os.path.join(SERVICES_DIR, name)
    if not os.path.exists(path):
        print(f"SKIP (missing): {name}")
        continue
    img = Image.open(path)
    w, h = img.size
    src_ratio = w / h
    if src_ratio > TARGET_RATIO:
        # too wide -> crop width
        new_w = int(h * TARGET_RATIO)
        left = (w - new_w) // 2
        box = (left, 0, left + new_w, h)
    else:
        # too tall -> crop height
        new_h = int(w / TARGET_RATIO)
        top = (h - new_h) // 2
        box = (0, top, w, top + new_h)
    img = img.crop(box)
    img = img.resize((TARGET_WIDTH, TARGET_HEIGHT), Image.LANCZOS)
    img.save(path, "PNG", optimize=True)
    print(f"OK: {name} -> {TARGET_WIDTH}x{TARGET_HEIGHT}")
