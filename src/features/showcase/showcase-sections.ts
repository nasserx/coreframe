/**
 * The showcase's section catalog — single source for the sidebar navigation
 * and the index page's overview cards. Data only (no "use client"), so both
 * server and client components may import it.
 */
export const SHOWCASE_SECTIONS = [
  {
    href: "/showcase/tokens",
    title: "Tokens",
    description: "Semantic colors, typography, radius, and theme behavior.",
  },
  {
    href: "/showcase/direction",
    title: "Direction & Arabic",
    description: "RTL behavior, Arabic type ramp, numerals, and bidi content.",
  },
  {
    href: "/showcase/layout",
    title: "Layout",
    description: "Stack, Container, measure tokens, PageHeader, and the AppShell.",
  },
  {
    href: "/showcase/actions",
    title: "Actions",
    description: "Buttons and badges across every variant and size.",
  },
  {
    href: "/showcase/forms",
    title: "Forms",
    description: "Inputs, textareas, labels, and Field composition.",
  },
  {
    href: "/showcase/display",
    title: "Display",
    description: "Cards, tables, avatars, separators, and scroll areas.",
  },
  {
    href: "/showcase/navigation",
    title: "Navigation",
    description: "Tabs, breadcrumbs, and pagination.",
  },
  {
    href: "/showcase/overlays",
    title: "Overlays",
    description: "Dialogs, alert dialogs, and toasts.",
  },
  {
    href: "/showcase/feedback",
    title: "Feedback",
    description: "Skeletons, spinners, empty states, and error boundaries.",
  },
  {
    href: "/showcase/data",
    title: "Data",
    description: "React Query wiring with loading composition.",
  },
] as const;
