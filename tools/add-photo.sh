#!/usr/bin/env bash
#
# Prepare a photo for Ginger's gallery: resize to 800px, strip all metadata
# (including GPS), and file it under the right name.
#
#   ./tools/add-photo.sh <source-image> [YYYY-MM-DD]
#
# With no date given, it reads the photo's EXIF capture date. Accepts JPEG,
# HEIC, PNG — anything ImageMagick can read — and always writes JPEG.

set -euo pipefail

GALLERY="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/assets/img/gallery"

if [[ $# -lt 1 ]]; then
  echo "usage: $0 <source-image> [YYYY-MM-DD]" >&2
  exit 64
fi

src="$1"
date="${2:-}"

[[ -f "$src" ]] || { echo "error: no such file: $src" >&2; exit 66; }

# Work out the date: use the argument, else the photo's own EXIF timestamp.
if [[ -z "$date" ]]; then
  exif_date="$(identify -format '%[EXIF:DateTimeOriginal]' "$src" 2>/dev/null || true)"
  if [[ -z "$exif_date" ]]; then
    echo "error: $src has no EXIF date — pass one explicitly:" >&2
    echo "       $0 \"$src\" 2026-08-15" >&2
    exit 65
  fi
  # EXIF format is "2026:08:15 10:15:00"; we want the date part, dash-separated.
  date="$(echo "${exif_date%% *}" | tr ':' '-')"
fi

[[ "$date" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]] || {
  echo "error: date must look like YYYY-MM-DD, got: $date" >&2
  exit 65
}

# Don't clobber an existing photo — find the next free suffix instead.
dest="$GALLERY/ginger-$date.jpg"
if [[ -e "$dest" ]]; then
  n=2
  while [[ -e "$GALLERY/ginger-$date-$n.jpg" ]]; do n=$((n + 1)); done
  dest="$GALLERY/ginger-$date-$n.jpg"
fi

mkdir -p "$GALLERY"

# -auto-orient must come before -strip, or discarding the orientation tag
# leaves the photo sideways.
convert "$src" \
  -auto-orient \
  -resize '800x800>' \
  -strip \
  -colorspace sRGB \
  -quality 82 \
  -sampling-factor 4:2:0 \
  -interlace Plane \
  "$dest"

# Confirm the privacy strip actually took.
leftover="$(identify -format '%[profiles]' "$dest" 2>/dev/null || true)"
if [[ -n "$leftover" ]]; then
  echo "warning: metadata may remain in $dest (profiles: $leftover)" >&2
fi

printf 'added %s  (%s, %s)\n' \
  "$(basename "$dest")" \
  "$(identify -format '%wx%h' "$dest")" \
  "$(du -h "$dest" | cut -f1)"
echo "Commit and push, and it will appear in the gallery."
