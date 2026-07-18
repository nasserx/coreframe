/**
 * Commit message convention: Conventional Commits, enforced by the
 * commit-msg hook (.husky/commit-msg).
 *
 * Format: `<type>(<optional scope>): <subject>`
 *
 * Allowed types (from @commitlint/config-conventional):
 * - build:    build system or external dependency changes
 * - chore:    maintenance that touches no src or test files
 * - ci:       CI configuration and workflow changes
 * - docs:     documentation only
 * - feat:     a new capability
 * - fix:      a bug fix
 * - perf:     a performance improvement
 * - refactor: code change that neither fixes a bug nor adds a feature
 * - revert:   reverts a previous commit
 * - style:    formatting only, no behavior change
 * - test:     adding or correcting tests
 */
const commitlintConfig = {
  extends: ["@commitlint/config-conventional"],
};

export default commitlintConfig;
