# Security Policy

## Supported versions

Security fixes are provided for the current `2.1.x` release line and for
unreleased work on `main`.

| Version          | Supported |
| ---------------- | --------- |
| `main`           | Yes       |
| `2.1.x`          | Yes       |
| Earlier versions | No        |

Fixes normally land on `main` and are included in a release when warranted.
Coreframe does not maintain security backports for earlier release lines.

## Reporting a vulnerability

Do not report suspected vulnerabilities through public GitHub Issues, pull
requests, discussions, or other public channels.

The preferred reporting channel is GitHub Private Vulnerability Reporting:

<https://github.com/nasserx/coreframe/security/advisories/new>

Private Vulnerability Reporting will be enabled before this repository becomes
public. While the repository is private, or if that link is temporarily
unavailable, authorized collaborators should use an existing private channel
with the repository owner. If no private channel is available after launch, a
public issue may request restoration of private reporting, but it must contain
no vulnerability details.

Please include as much of the following as is practical:

- the affected Coreframe version or commit;
- a description of the issue and its potential impact;
- minimal reproduction steps or a proof of concept;
- relevant runtime, operating-system, and browser details;
- any known mitigations or workarounds;
- whether the issue has been disclosed anywhere else.

The maintainer aims to acknowledge a complete report within three business
days and provide an initial assessment within seven business days. These are
targets, not guarantees; complex or upstream-dependent issues can take longer.
Updates will be provided when triage, remediation, or release status changes.

Please allow reasonable time to investigate and prepare a fix, and coordinate
the timing and content of any public disclosure with the maintainer. Do not
access other people's data, disrupt services, or extend testing beyond what is
necessary to demonstrate the issue.

## Dependency advisories

Dependency advisories are evaluated for affected code paths, exploit
preconditions, and safe compatible remediation. They are not automatically
force-fixed: an audit recommendation that downgrades the framework, breaks the
tooling baseline, or changes architecture must be rejected in favor of a
reviewed upgrade or mitigation. The current point-in-time advisory analysis
and reevaluation triggers are maintained in `docs/ROADMAP.md`.

## Scope

This policy covers vulnerabilities in Coreframe itself. An application created
from Coreframe has its own dependencies, deployment, data, authentication, and
threat model; its maintainers must replace or extend this policy and perform
their own security review.
