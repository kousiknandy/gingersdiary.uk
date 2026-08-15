# gingersdiary.uk

Ginger's photo album and occasional diary. A Jekyll site on the `minima` theme,
built automatically by GitHub Pages from the `main` branch, root folder.

Nothing here needs a local build. Commit, push, and GitHub Pages publishes.

## Adding photos

The gallery lists **whatever is in `assets/img/gallery/`** — it reads the folder
at build time, so there is no list to maintain and no template to edit. Drop a
photo in, push, and it appears.

Two rules for a new photo:

1. **Name it `ginger-YYYY-MM-DD.jpg`** (the date it was taken). Filenames sort
   chronologically, and that is exactly the order the gallery uses. For two
   photos on the same day, add a suffix: `ginger-2026-08-15-2.jpg`.
2. **Resize it and strip its metadata first** (see below). Never commit a
   straight-off-the-phone photo: it will be several megabytes and it will carry
   EXIF data including the GPS coordinates of where it was taken.

### Preparing a photo

Use `tools/add-photo.sh`, which does the resize, the metadata strip, and the
renaming in one go:

```sh
./tools/add-photo.sh ~/Downloads/PXL_20260815_101500123.jpg 2026-08-15
```

Or by hand, with ImageMagick:

```sh
convert input.jpg \
  -auto-orient -resize '800x800>' -strip \
  -colorspace sRGB -quality 82 -sampling-factor 4:2:0 -interlace Plane \
  assets/img/gallery/ginger-2026-08-15.jpg
```

What each part is for:

- `-auto-orient` — bakes the rotation flag into the pixels **before** metadata
  is discarded, so the photo cannot end up sideways.
- `-resize '800x800>'` — caps the longest side at 800px, keeps the aspect ratio,
  and never upscales a smaller image.
- `-strip` — removes all EXIF/IPTC/XMP: **GPS location**, camera model,
  timestamps. This is the privacy step. Do not skip it.

Check it worked — this should print nothing but the filename and size:

```sh
identify -format '%f %wx%h profiles=[%[profiles]]\n' assets/img/gallery/ginger-2026-08-15.jpg
```

HEIC files from iPhones and Samsungs work as input (`convert` handles them), and
come out the other side as JPEG, which is what browsers can actually display.

## Captions

Entirely optional, in `_data/gallery.yml`, keyed by filename without the
extension. A photo with no entry just shows its date.

```yaml
ginger-2026-08-15:
  caption: Something funny, in Ginger's voice.
  alt: Plain description, for screen readers.
  focus: 70% center
```

`focus` is worth knowing about. Gallery tiles are **square**, so a wide photo
gets cropped on the left and right. `focus` picks which part survives — the
first value runs left (`0%`) to right (`100%`). If Ginger's face is off to one
side and the tile is cutting it off, set this. Default is `center center`.

## Writing a diary post

Add a file to `_posts/` named `YYYY-MM-DD-some-title.md`:

```markdown
---
layout: post
title: "The Day The Vacuum Returned"
---

It came back. I have concerns.
```

It appears on `/blog.html` and in the five most recent on the front page. The
"no entries yet" placeholder disappears on its own once a post exists.

## Adding an avatar

Drop a square-ish photo at **`assets/img/ginger-avatar.jpg`** and it appears as
a round portrait beside the title on the front page. Until that file exists the
layout just skips it. Same treatment as any other photo — resize and strip it
first (400px is plenty for an avatar):

```sh
convert input.jpg -auto-orient -resize '400x400>' -strip \
  -colorspace sRGB -quality 85 assets/img/ginger-avatar.jpg
```

## How it fits together

| Path | What it does |
|---|---|
| `index.md` | Front page intro, in Ginger's voice. Uses `layout: home`. |
| `about.md` | The longer story. |
| `blog.html` | Diary index, with an empty state. |
| `_layouts/home.html` | Front page: hero, intro, gallery, recent posts. |
| `_includes/gallery.html` | The auto-listing gallery. **The bit that means you never edit a template to add a photo.** |
| `_includes/head.html`, `header.html`, `footer.html` | Override minima's versions. |
| `_sass/ginger.scss` | All the styling. Colours are CSS custom properties at the top. |
| `assets/main.scss` | Sets minima's variables, imports minima, then imports the above. |
| `assets/js/lightbox.js` | Click-to-enlarge. No dependencies; photos are plain links, so they still open without JavaScript. |
| `_data/gallery.yml` | Optional captions. |
| `CNAME` | The custom domain. Must stay at the repo root. |

Two things to leave alone:

- **Don't rename `assets/` to `_assets/`.** Jekyll ignores any top-level folder
  starting with `_`, and the photos would silently stop publishing.
- **Don't delete `_posts/.gitkeep`** until there is a real post in there — Git
  does not track empty folders.

## Settings worth knowing

In `_config.yml`:

- `gallery_newest_first: false` — the album reads oldest to newest, as a
  journey. Flip to `true` to put the newest photos at the top.
- `header_pages` — the nav. Add a page's filename to it and the link appears.

## Previewing locally (optional)

Not required, but if you want it:

```sh
bundle install
bundle exec jekyll serve
```
