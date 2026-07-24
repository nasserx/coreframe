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

/*
 * Physical Tailwind direction utilities (ml-, pr-, left-, text-left,
 * rounded-l-, border-l, …) break rendering under RTL, which this foundation
 * must support (docs/DIRECTION_AND_I18N.md). The custom rule below fails the
 * lint when one appears in any string or template chunk in src/. Escape
 * hatch for the rare genuinely-physical case:
 *   // eslint-disable-next-line foundation/no-physical-tailwind-classes -- <why physical is correct>
 * `translate-x-*` is deliberately not banned: translation is used for
 * direction-neutral centering and motion, not for start/end alignment.
 */
const PHYSICAL_CLASS_PATTERN =
  /(?:^|[^a-zA-Z0-9])-?(?:m[lr]-|p[lr]-|(?:left|right)-(?:\d|\[|full|px|auto)|text-left(?![a-zA-Z-])|text-right(?![a-zA-Z-])|rounded-(?:t[lr]|b[lr]|[lr])(?![a-zA-Z])|border-[lr](?![a-zA-Z]))/;

const foundationPlugin = {
  rules: {
    "no-physical-tailwind-classes": {
      meta: {
        type: "problem",
        docs: {
          description:
            "Disallow physical direction utilities in favor of logical ones so components render correctly under RTL.",
        },
        schema: [],
        messages: {
          physical:
            'Physical direction utility "{{match}}" breaks RTL. Use the logical equivalent (ms-/me-, ps-/pe-, start-/end-, text-start/text-end, rounded-s-/rounded-e-, border-s/border-e). If physical direction is genuinely intended, disable this rule for the line with a justification (docs/DIRECTION_AND_I18N.md).',
        },
      },
      create(context) {
        const checkText = (node, text) => {
          if (typeof text !== "string") {
            return;
          }
          const match = PHYSICAL_CLASS_PATTERN.exec(text);
          if (match !== null) {
            context.report({
              node,
              messageId: "physical",
              data: { match: match[0].replace(/^[^a-zA-Z-]+/, "") },
            });
          }
        };
        return {
          Literal(node) {
            checkText(node, node.value);
          },
          TemplateElement(node) {
            checkText(node, node.value.raw);
          },
        };
      },
    },
  },
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Direction safety: logical properties only (see foundationPlugin above).
  {
    files: ["src/**"],
    plugins: { foundation: foundationPlugin },
    rules: { "foundation/no-physical-tailwind-classes": "error" },
  },
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
    // These layers are consumed BY components/features and must never
    // render UI themselves — componentImports added deliberately when
    // src/api gained real code, so a transport or state module can never
    // grow a dependency on the presentation layer.
    files: ["src/hooks/**", "src/lib/**", "src/services/**", "src/api/**", "src/store/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [deepRelativeImports, appLayerImports, featureImports, componentImports] },
      ],
    },
  },
  {
    files: [
      "src/theme/**",
      "src/config/**",
      "src/constants/**",
      "src/types/**",
      "src/styles/**",
      "src/i18n/**",
    ],
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
      "playwright.config.ts",
      "postcss.config.mjs",
      "vitest.config.ts",
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
