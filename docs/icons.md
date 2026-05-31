# Icons in cm-ui

cm-ui does **not** lock you into a single icon library. An icon set is a
product decision, and no single set covers every product. So cm-ui ships **one
sensible default** and treats every other icon source as **optional** — bring
whatever fits your project.

## The one default: `lucide-react`

Built-in component affordances (chevrons, the close `×`, check marks, spinners,
etc.) use [`lucide-react`](https://lucide.dev). It is the **only** bundled icon
dependency, so components look right out of the box with zero configuration. You
don't need to install anything to get these.

## Optional: the universal `CmIcon` gateway (`@iconify/react`)

`CmIcon` renders any icon from [Iconify](https://iconify.design) — 150+ icon
sets (Material Symbols, MDI, Phosphor, Lucide, Heroicons, and more) addressed by
name, loaded on demand:

```tsx
import { CmIcon } from "cm-ui/server";

<CmIcon name="material-symbols:store-outline" />
<CmIcon name="mdi:truck-delivery-outline" />
<CmIcon name="ph:address-book-fill" />
<CmIcon name="lucide:mail" />
```

`@iconify/react` is an **optional peer dependency**. Install it only if you use
`CmIcon`:

```bash
npm install @iconify/react
```

If you never use `CmIcon`, it stays out of your bundle.

## Optional: bring your own icons

Every component that takes an icon accepts a plain `ReactNode`, so you can pass
an icon from any library — or your own SVG — directly:

```tsx
import { CmButton } from "cm-ui/client";

// lucide-react (already available)
import { Download } from "lucide-react";
<CmButton icon={<Download size={16} />}>Export</CmButton>;

// react-icons
import { FiDownload } from "react-icons/fi";
<CmButton icon={<FiDownload />}>Export</CmButton>;

// @heroicons/react
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
<CmButton icon={<ArrowDownTrayIcon width={16} />}>Export</CmButton>;

// your own SVG
<CmButton
  icon={
    <svg aria-hidden viewBox="0 0 24 24">
      …
    </svg>
  }
>
  Export
</CmButton>;
```

None of these (other than `lucide-react`) are dependencies of cm-ui — install
only what you use.

## Summary

| Source                                            | Status                   | Install                  |
| ------------------------------------------------- | ------------------------ | ------------------------ |
| `lucide-react`                                    | Bundled default          | nothing — included       |
| `@iconify/react` (`CmIcon`)                       | Optional peer dependency | `npm i @iconify/react`   |
| `react-icons`, Heroicons, Phosphor, custom SVG, … | Bring your own           | install the one you want |
