# Releasing Coreframe

This document owns Coreframe's release and semantic-versioning process. A
release turns reviewed work already accepted on `main` into an immutable Git
tag and a GitHub Release. It does not publish an npm package: Coreframe is a
source foundation, `package.json` is marked `"private": true`, and the
repository has no npm-publishing workflow.

## Roles and prerequisites

- The **release owner** is a maintainer with permission to create branches,
  merge the release pull request, push tags, and publish GitHub Releases. They
  select the version, prepare the release branch, run the release gate, and
  verify the published result.
- A **reviewer** independently checks the proposed version, release notes,
  expected-file diff, and validation evidence. The release owner must not
  bypass review merely because the preparation change is small.
- GitHub Actions supplies the repository's stable `CI / quality` check. It
  complements, rather than replaces, the release owner's complete local gate.

Before starting, the release owner needs:

- a clean, current local `main` that matches `origin/main`;
- Node.js `24.18.0` from `.nvmrc`, satisfying `package.json#engines`
  (`>=24.18.0 <25`), and npm from that Node.js installation;
- the committed lockfile installed through `npm ci`;
- Chromium installed for Playwright as described in
  [`TESTING.md`](TESTING.md);
- no unresolved required fix, security decision, or migration note for the
  intended release.

Do not mix unrelated implementation, dependency, or documentation work into a
release branch. A release branch may contain a correction discovered while
preparing that release only when it is required to make the candidate
releasable; prefer landing such corrections on their own focused branches and
restart preparation from updated `main`.

## Selecting the semantic version

Select the version from the aggregate downstream impact of every change since
the latest release tag reachable from the candidate commit. Conventional
Commit types are useful evidence, but no type mechanically determines the
version. For example, a `fix` can still require a major release if it removes a
public contract, while several `feat` commits may collectively remain a minor
release when they are backward-compatible.

From a clean, updated `main`, establish the comparison:

```bash
git describe --tags --abbrev=0 --match "v[0-9]*"
git log --oneline vX.Y.Z..HEAD
git diff --stat vX.Y.Z..HEAD
```

Replace `vX.Y.Z` in the last two commands with the reachable tag reported by
the first command. Review the actual diff and owning documentation, not only
commit subjects.

Apply Semantic Versioning as follows:

- **Patch:** backward-compatible bug fixes; security or dependency remediation
  without intentional consumer-facing behavioral expansion; and
  documentation-only corrections when a versioned release is warranted.
- **Minor:** backward-compatible capabilities; new shared components or
  contracts; intentional backward-compatible changes to reusable default
  behavior; and substantial template improvements that downstream users may
  choose to adopt.
- **Major:** removed or renamed public APIs; incompatible prop, component,
  token, layout, configuration, or runtime-contract changes; and any change
  that requires downstream migration.

When the range contains more than one category, choose the highest required
increment. Record the comparison tag and the rationale in the release pull
request. Pre-1.0 exceptions do not apply; Coreframe would need an explicit
future decision before adopting any.

## Version ownership

`package.json#version` is the authoritative project version.
`package-lock.json` is its required synchronized lockfile representation; its
top-level and root-package version fields are maintained through npm, not by
independent hand edits. Update both without creating a commit or tag:

```bash
npm version X.Y.Z --no-git-tag-version
```

Roadmap entries, release notes, support statements, and other current-release
records are documentation, not independent version sources. Update one only
when the release changes the fact that document owns. Do not copy the version
into unrelated files merely for visibility.

In the normal case, the release diff contains only `package.json` and
`package-lock.json`. An owning document may join the diff when a release makes
its current statement inaccurate. Coreframe has no permanent changelog; the
approved release notes live in the release pull request and the GitHub Release.

## Preparing the release

1. Update local `main`, verify it is clean, and confirm its relationship to the
   remote:

   ```bash
   git switch main
   git pull --ff-only
   git status --porcelain=v1
   git rev-parse HEAD origin/main
   node --version
   npm --version
   npm pkg get engines
   ```

   Stop if the status is not empty, the commits differ, or Node.js does not
   match the repository runtime.

2. Find the latest reachable release tag, review every merged change since it,
   choose the semantic version using the rules above, and record the rationale.

3. Confirm that neither the version nor its tag already exists. Create the
   focused branch:

   ```bash
   git tag --list vX.Y.Z
   git switch -c release/vX.Y.Z
   ```

4. Run `npm version X.Y.Z --no-git-tag-version`. Inspect `package.json` and
   `package-lock.json`; do not accept dependency-tree or lockfile drift from a
   version-only update.

5. Draft release notes from the actual `vPREVIOUS..HEAD` changes. Keep them in
   the release pull-request description until the GitHub Release is created;
   do not add a changelog solely for release preparation.

6. Run focused, non-writing checks while editing. Confirm repeatedly that the
   worktree contains only approved release files. Then run the complete release
   gate below.

7. Stage only the reviewed release files and inspect the staged list. Commit
   with the exact subject:

   ```bash
   git add package.json package-lock.json
   git diff --cached --name-only
   git commit -m "chore(release): vX.Y.Z"
   git push -u origin release/vX.Y.Z
   ```

   Add an owning documentation file to the explicit `git add` command only when
   its release-owned statement genuinely changed. Never use `git add -A` for a
   release commit.

8. Open a pull request from `release/vX.Y.Z` to `main`. Use
   `chore(release): vX.Y.Z` as its title and include the version rationale,
   comparison tag, release notes, expected file list, full validation results,
   audit posture, and any known limitation or accepted residual risk.

## Complete release validation gate

Run this gate against the final release-branch contents. The full Playwright
matrix is mandatory for every release candidate, even when the preparation
diff itself is documentation-only.

```bash
git status --porcelain=v1
node --version
npm pkg get engines
npm ci
npm ls --depth=0
npm ls --all
npm audit --json
npm audit --omit=dev --json
npm run format:check
npm run lint
npm run typecheck -- --incremental false
npm test
npm run build
npm run test:e2e
git diff --check
git status --short
```

The first status must show only the expected release files before they are
committed; after the release commit, the worktree must be clean. Record the
exact command results in the pull request. Do not hard-code test totals into
this guide; Vitest and Playwright output are the point-in-time measurements.

Both npm audits are point-in-time registry evidence, not a permanent security
claim. Investigate every nonzero advisory result using the reachability and
policy rules in [`ROADMAP.md`](ROADMAP.md) and [`../SECURITY.md`](../SECURITY.md).
An unaccepted advisory, unexplained dependency-tree error, or any failed gate
blocks the release.

Do not hide a failure through retries, increased timeouts, skipped coverage,
weakened assertions, forced dependency resolutions, or a narrower browser
selection. Diagnose it, correct the owning layer on an appropriate branch, and
rerun the affected checks followed by the complete release gate.

## Review, merge, and tag

The release pull request may merge only when:

- its diff contains only approved release-owned files;
- the semantic-version rationale and release notes match the complete change
  range;
- required review is complete and every discussion is resolved;
- `CI / quality` succeeds for the final pull-request head;
- the complete release gate above succeeds; and
- breaking changes have migration instructions, or the notes explicitly state
  that none exist.

Merge using a method that leaves one accepted release commit on `main` with the
subject `chore(release): vX.Y.Z`; a squash merge with that exact title is the
default reproducible method. If repository settings require another method,
verify that its resulting release commit has the same subject before tagging.
Do not tag an unmerged branch.

After merge, return to `main`, update it, and verify the accepted release commit
and version before creating the tag:

```bash
git switch main
git pull --ff-only
git status --porcelain=v1
git log -1 --oneline
npm pkg get version
```

Create an annotated tag on that verified commit and push only that tag:

```bash
git tag -a vX.Y.Z <release-commit-sha> -m "Coreframe vX.Y.Z"
git push origin vX.Y.Z
```

`vX.Y.Z` is the only tag format. The tag must resolve to the accepted release
commit on `main`. Never force-update, move, or reuse a tag that has been pushed
or otherwise published.

## GitHub Release and release notes

After the tag is visible on GitHub, create a GitHub Release from that existing
tag. Verify the UI shows the same target commit, use `Coreframe vX.Y.Z` as the
title (a short descriptive suffix is optional), paste the reviewed release
notes, and publish it as a normal release unless a separately approved plan
explicitly calls for a prerelease.

Release notes must include:

- user- and downstream-relevant changes;
- changes to shared contracts or reusable default behavior;
- dependency and security-posture changes;
- breaking changes with migration instructions, or an explicit statement that
  there are none;
- the validation summary; and
- known limitations or accepted residual risk when relevant.

Do not publish to npm. The source tag and GitHub Release are Coreframe's release
artifacts.

## Post-release verification and cleanup

Verify all of the following before declaring the release complete:

- the tag shown by GitHub resolves to the reviewed `main` commit;
- the GitHub Release uses that same tag and is neither draft nor unintended
  prerelease;
- the tagged `package.json` and `package-lock.json` versions match;
- the `main` push CI run succeeds;
- the release notes render correctly and source archives are available; and
- local `main` is current and clean.

After verification, delete the local and remote `release/vX.Y.Z` branch when it
is no longer needed for audit or review. Never delete `main` or the release tag.

## Failure, rollback, and hotfixes

- **Before merge:** correct the same release branch when the correction is
  release-owned, rerun affected checks, then rerun the complete release gate.
  Put unrelated corrections on focused branches and restart preparation from
  updated `main`.
- **After merge, before tagging:** do not tag the defective commit. Correct the
  issue through a normal focused branch and reviewed pull request, then restart
  release preparation and validation from updated `main`.
- **After creating a local tag, before pushing it:** a mistaken, unpushed tag
  may be deleted and recreated on the corrected accepted commit. Record the
  correction in the release evidence.
- **After pushing the tag, before creating the GitHub Release:** treat the tag
  as published and potentially consumed. Do not move it silently and do not
  reuse the version; correct the problem with a new patch release. Coreframe
  grants no standing permission to rewrite a pushed tag.
- **After a GitHub Release or downstream consumption:** never rewrite the
  release. Land the correction normally and issue a new patch release.
- **Hotfix:** branch the fix from current `main`, review and validate it through
  the normal focused-change process, merge it, then prepare a new patch version
  on `release/vX.Y.Z`. A hotfix is never an excuse to skip the full release
  gate or to retag an existing version.

## Explicit non-goals

This process does not define npm publication, deployment, automated versioning,
generated changelogs, prerelease channels, release trains, or maintenance
backports beyond the current policy in [`../SECURITY.md`](../SECURITY.md).
Adding any of those requires separate evidence, ownership, and a durable
decision; do not infer them from the existence of a GitHub Release.
