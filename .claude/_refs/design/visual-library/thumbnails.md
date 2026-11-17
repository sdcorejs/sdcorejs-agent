# Thumbnails for UI choices

Use after visual intent is requested or accepted for an unresolved layout choice.
Pick 2–3 viable layouts from the actual task; do not overwhelm a consumer with
the entire library or invent alternatives to a fixed design. Preserve the
visual-offer policy, project tokens and existing approval boundaries.

## Browse, compare, then inspect

The shipped PNGs are browser captures of the 42 default illustrative variants.
They help recognize structure before adapting the design to a project. They
are not screenshots of a consumer's product, production assets, or approved
final designs. The gallery is a browsing surface; a choice remains feedback.

```sh
node _refs/design/visual-library/compose-preview.mjs --gallery > <authorized-gallery.html>
node _refs/design/visual-library/compose-preview.mjs --example queue-context --thumbnails > <authorized-comparison.html>
node _refs/design/visual-library/compose-preview.mjs --example queue-context --thumbnail-assets
```

Gallery cards show actual PNGs and open a full interactive HTML preview.
Comparison mode keeps the thumbnail in the option button and the full preview
in a separate keyboard-accessible disclosure. Opening that disclosure does not
select an option. Copy/submit retains the current screen digest and
`design-feedback-only` authority. The default CLI still supports full previews.

For in-chat delivery, read `--thumbnail-assets` output, use the host's native
image attachment/render action on each verified `asset_path`, and provide a
short label, pattern/variant and trade-off beside each image. Prefer 2–3 images.
Do not assume that a Markdown local path will display in every host. If native
images are unknown or unsupported, deliver the gallery/comparison HTML through
an available artifact surface and say images were not displayed in chat. If
HTML is also unavailable, provide numbered text and disclose that limitation.
Never request a new visual invitation for an already accepted choice.

## Project-specific alternatives

Default thumbnails must not stand in for changed content, theme, locale,
viewport or state. Supply a complete localized screen and content as usual.
The resolver verifies the exact HTML hash, current library revision, PNG hash,
byte count, dimensions and fixed browser capture metadata. A missing/stale/invalid capture falls back to full
HTML for the entire comparison; it never shows a partially mismatched set.
Asset lookup exits 2 when any requested image is unavailable.

When an existing trusted browser capability is available, capture the exact
screen into a **new** project-owned output directory:

```sh
node _refs/design/visual-library/capture-thumbnails.mjs --input <screen.json> --out <new-thumbnail-directory>
node _refs/design/visual-library/compose-preview.mjs --input <screen.json> --thumbnails --thumbnail-dir <thumbnail-directory> > <authorized-comparison.html>
node _refs/design/visual-library/compose-preview.mjs --input <screen.json> --thumbnail-assets --thumbnail-dir <thumbnail-directory>
```

Capture requires already installed absolute `SDCOREJS_PLAYWRIGHT_MODULE` and
`SDCOREJS_CHROMIUM_PATH` capability paths. It does not install a browser or add
project dependencies. An unavailable browser is a reason to use HTML, not a
reason to pretend that a screenshot was captured. Use only authorized output
locations; project screenshots may contain private content and remain local
unless sharing is explicitly authorized. Do not copy them into this skill pack.

Capture loads only the validated generated HTML, blocks requests, takes the
complete `.pp-frame` at a 1360 CSS-pixel viewport with device scale 0.5, and
writes `index.json` only after all images succeed. Existing output directories
are rejected. Partial output has no completion index and is not valid evidence.
The images are visual summaries; inspect the full HTML before implementation.

## Integrity and maintenance

`thumbnails/index.json` binds every shipped image to its exact default preview.
Only the capture helper's non-interlaced 8-bit PNG profile (IHDR, IDAT and IEND
chunks) is embedded. Checksums, bounded pixel decompression and scanline filters
are verified before use; arbitrary image URLs, SVGs, traversal and
symlinked assets are rejected. The standalone artifact permits data images but
no network destinations. A manifest is an integrity binding, not a signature
or proof that an untrusted producer captured the claimed pixels; use the
trusted capture helper and inspect the rendered output.

The derived `thumbnails/` directory is excluded from `libraryRevision()` to
avoid circular hashing. Its files have independent byte hashes. Any governing
renderer/data change invalidates old captures. Maintainers run
`capture-thumbnails.mjs --catalog --out <new-directory>`, verify all 42 images,
then deliberately promote that output into the shipped directory and regenerate
mirrors. Never edit an old manifest to claim that stale pixels are current.
