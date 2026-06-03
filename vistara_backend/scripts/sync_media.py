"""
Small helper to copy image files from the `photos` app folders into the project's `media` folder
so that Django can serve them at /media/... during development.

Run from the repository root (autumn_photo_backend):

    python scripts/sync_media.py

It will create `media/photos/thumbnails`, `media/photos/originals`, `media/photos/displays`
and copy files if they exist. Existing files will be overwritten.
"""
import shutil
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
APP_PHOTOS = BASE_DIR / "photos"
MEDIA_ROOT = BASE_DIR / "media"

SRC_MAP = {
    "thumbnails": APP_PHOTOS / "thumbnails",
    "originals": APP_PHOTOS / "originals",
    "displays": APP_PHOTOS / "displays",
}

def ensure_and_copy():
    MEDIA_ROOT.mkdir(parents=True, exist_ok=True)
    for sub, src in SRC_MAP.items():
        dest_dir = MEDIA_ROOT / "photos" / sub
        if not src.exists():
            print(f"source not found, skipping: {src}")
            continue
        dest_dir.mkdir(parents=True, exist_ok=True)
        for item in src.iterdir():
            if item.is_file():
                dest_file = dest_dir / item.name
                shutil.copy2(item, dest_file)
                print(f"copied {item} -> {dest_file}")

if __name__ == "__main__":
    ensure_and_copy()
    print("done")
