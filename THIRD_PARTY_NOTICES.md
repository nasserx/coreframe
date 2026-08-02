# Third-Party Notices

Coreframe includes or adapts the third-party material identified below. The
project's MIT License does not replace the licenses that apply to this
material.

## shadcn/ui component source

The following source files were generated from or adapted from
[shadcn/ui](https://github.com/shadcn-ui/ui), then modified to fit Coreframe's
architecture and design system:

- `src/components/ui/alert-dialog.tsx`
- `src/components/ui/aspect-ratio.tsx`
- `src/components/ui/avatar.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/breadcrumb.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/field.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/label.tsx`
- `src/components/ui/pagination.tsx`
- `src/components/ui/scroll-area.tsx`
- `src/components/ui/separator.tsx`
- `src/components/ui/skeleton.tsx`
- `src/components/ui/spinner.tsx`
- `src/components/ui/table.tsx`
- `src/components/ui/tabs.tsx`
- `src/components/ui/textarea.tsx`
- `src/lib/utils.ts`

License: MIT

Copyright (c) 2023 shadcn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Tajawal font files

The committed Tajawal Arabic font subsets in `src/assets/fonts/` are
redistributed under the SIL Open Font License, Version 1.1.

Copyright 2018 Boutros International. (http://www.boutrosfonts.com)

The complete license and copyright notice is colocated with the font files at
[`src/assets/fonts/OFL.txt`](src/assets/fonts/OFL.txt).

## Historical Noto Sans Arabic font file

Earlier revisions redistributed a Noto Sans Arabic font file under the SIL
Open Font License, Version 1.1. The corresponding copyright and complete OFL
notice remain preserved with that file in Git history:

Copyright 2022 The Noto Project Authors
(https://github.com/notofonts/arabic)

This historical material remains subject to its own license; the Coreframe
MIT License does not relicense it.

## Installed dependencies and generated build assets

Ordinary npm dependencies are referenced through `package.json` and are not
vendored source covered by this notices file. Their own package licenses
continue to apply. This includes runtimes such as Base UI and imported icon
components from Lucide.

Inter and Geist Mono are obtained by `next/font` during the build rather than
committed as source files. Their generated font files retain their own
copyright and SIL Open Font License metadata. This file is intentionally not
an exhaustive inventory of direct or transitive npm dependencies.
