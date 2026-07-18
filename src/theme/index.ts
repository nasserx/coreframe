/**
 * Public design token exports.
 *
 * CSS custom properties in `src/styles` are the single source of truth for
 * every themable design decision (see docs/DESIGN_TOKENS.md). TypeScript
 * tokens exist only where CSS variables cannot reach — currently just
 * breakpoints, because media queries and `matchMedia` cannot read custom
 * properties. Do not add a TS mirror of a CSS token here; that is a drift
 * risk by construction.
 */
export * from "./breakpoints";
