import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier/flat";

/*
 * Restricted import patterns used to enforce the dependency direction
 * documented in ARCHITECTURE.md (Module Boundary Rules). ESLint replaces
 * (not merges) rule options between config objects, so every folder-scoped
 * `no-restricted-imports` entry must include each pattern it needs.
 */
const deepRelativeImports = {
  group: ["../../../*", "../../../../*", "../../../../../*"],
  message: "Use the @/ path alias for cross-folder imports instead of long relative paths.",
};

const appLayerImports = {
  group: ["@/app", "@/app/*"],
  message:
    "src/app is the routing entry point; other layers must not import from it (ARCHITECTURE.md).",
};

const featureImports = {
  group: ["@/features", "@/features/*"],
  message:
    "Only src/app may import features. Inside a feature, use relative imports; across features, promote a shared contract to a shared folder (ARCHITECTURE.md).",
};

const componentImports = {
  group: ["@/components", "@/components/*"],
  message: "Foundation and core layers must not depend on shared UI components (ARCHITECTURE.md).",
};

const coreImports = {
  group: ["@/core", "@/core/*"],
  message: "Foundation folders must not depend on core infrastructure (ARCHITECTURE.md).",
};

const reactAndNextImports = {
  group: ["react", "react-dom", "react-dom/*", "next", "next/*"],
  message:
    "src/utils must stay framework-agnostic. Move React- or Next.js-aware code to hooks, components, or core (ARCHITECTURE.md).",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          fixStyle: "inline-type-imports",
          prefer: "type-imports",
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
          varsIgnorePattern: "^_",
        },
      ],
      curly: ["error", "all"],
      eqeqeq: ["error", "always"],
      "no-duplicate-imports": [
        "error",
        {
          allowSeparateTypeImports: true,
        },
      ],
      "import/no-cycle": "error",
      "import/no-self-import": "error",
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", ["parent", "sibling", "index"]],
          pathGroups: [
            { pattern: "react", group: "external", position: "before" },
            { pattern: "react-dom", group: "external", position: "before" },
            { pattern: "react-dom/**", group: "external", position: "before" },
            { pattern: "next", group: "external", position: "before" },
            { pattern: "next/**", group: "external", position: "before" },
            { pattern: "@/**", group: "internal" },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
          "newlines-between": "ignore",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [deepRelativeImports],
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "ExportDefaultDeclaration",
          message:
            "Use named exports. Default exports are reserved for framework and tool configuration files.",
        },
      ],
      "prefer-const": "error",
      "sort-imports": [
        "warn",
        {
          allowSeparatedGroups: true,
          ignoreCase: true,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
        },
      ],
    },
  },
  // Architectural boundaries (ARCHITECTURE.md — Module Boundary Rules).
  {
    files: ["src/features/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [deepRelativeImports, appLayerImports, featureImports] },
      ],
    },
  },
  {
    files: ["src/components/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [deepRelativeImports, appLayerImports, featureImports] },
      ],
    },
  },
  {
    files: ["src/core/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [deepRelativeImports, appLayerImports, featureImports, componentImports] },
      ],
    },
  },
  {
    files: ["src/hooks/**", "src/lib/**", "src/services/**", "src/api/**", "src/store/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [deepRelativeImports, appLayerImports, featureImports] },
      ],
    },
  },
  {
    files: ["src/theme/**", "src/config/**", "src/constants/**", "src/types/**", "src/styles/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            deepRelativeImports,
            appLayerImports,
            featureImports,
            componentImports,
            coreImports,
          ],
        },
      ],
    },
  },
  {
    files: ["src/utils/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            deepRelativeImports,
            appLayerImports,
            featureImports,
            componentImports,
            coreImports,
            reactAndNextImports,
          ],
        },
      ],
    },
  },
  {
    files: [
      "commitlint.config.mjs",
      "eslint.config.mjs",
      "next.config.ts",
      "postcss.config.mjs",
      "src/app/**/default.{ts,tsx}",
      "src/app/**/error.{ts,tsx}",
      "src/app/**/global-error.{ts,tsx}",
      "src/app/**/layout.{ts,tsx}",
      "src/app/**/loading.{ts,tsx}",
      "src/app/**/not-found.{ts,tsx}",
      "src/app/**/page.{ts,tsx}",
      "src/app/**/template.{ts,tsx}",
    ],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
  // Disables stylistic rules that would conflict with Prettier; must stay last
  // so it wins over any formatting rules the presets above enable.
  prettierConfig,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
