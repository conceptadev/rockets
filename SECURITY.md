# Security Policy

## Supported versions

Rockets is **pre-1.0**. The in-repo release line is `1.0.0-alpha.8`;
publication under the `alpha` dist-tag is pending. npm currently serves an
older `0.0.1-dev.0` drop on the `dev`/`latest` tags only — that line is
not supported. There are no maintained release branches yet.

| Version | Supported |
|---|---|
| latest published `alpha` (once `1.0.0-alpha.8` ships) | yes |
| `0.0.1-dev.0` on npm (`dev`/`latest`) | no — upgrade when `alpha` ships |
| unreleased workspace builds | no |

The upstream `@concepta/nestjs-*` stack this project composes is itself
pre-release. Vulnerabilities originating there are reported upstream and
tracked here until a fixed version ships.

## Reporting a vulnerability

**Do not open a public issue.**

Report privately through
[GitHub Security Advisories](https://github.com/conceptadev/rockets/security/advisories/new).
If you cannot use that, email <thiago.ramalho@concepta.com> with
`SECURITY` in the subject.

Please include:

- affected package(s) and version(s);
- a description of the impact (what an attacker gains);
- reproduction steps or a minimal proof of concept;
- any suggested fix, if you have one.

## What to expect

- **Acknowledgement within 3 business days.**
- An assessment (severity and affected versions) within 10 business days.
- A fix released on the supported dist-tag (once `alpha` is live), with a
  GitHub Security Advisory and a `CHANGELOG.md` entry crediting you unless
  you prefer otherwise.

Please give us a reasonable window to release a fix before public
disclosure.

## Scope

In scope — anything that lets a request read or write data it should not:

- **Row visibility**: owner scoping, path-scope guards for nested
  resources, custom scope hooks being bypassed.
- **Response exposure**: a field reaching the wire that the schema marks
  as hidden (`dto: { response: false }`), or an undeclared column leaking
  through a computed field or a relation projection.
- **Input trust**: a client-supplied value overriding a server-stamped
  one (ownership, timestamps, ids).
- **Authentication and authorization**: guard bypass, adapter chain
  misbehaviour, ACL possession being ignored.

Out of scope:

- Vulnerabilities in the example apps under `examples/` — they are
  demonstrations, not production code, and use stub adapters and
  in-memory databases on purpose.
- Missing hardening that the documentation explicitly describes as
  opt-in and the consumer's responsibility (for example: a resource that
  never enables owner scoping, or a secret column the author did not mark
  `dto: { response: false }` — see the exposure rules in
  `packages/rockets-core/README.md`).
- Deprecation warnings from development-only tooling that never ships to
  consumers.
