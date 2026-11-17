# Security policy

## Reporting a vulnerability

Please **do not open a public issue**. Use GitHub's private reporting instead:
[Report a vulnerability](https://github.com/zxxdev/zxxdev.github.io/security/advisories/new).

Include the page or file involved, what an attacker could do, and the steps to reproduce it.
I will acknowledge the report within a week and keep you updated until it is fixed.

## Scope

This repository builds a static website. There is no server, database, login or form that stores
data, so the main risks are:

- a compromised build dependency that alters the published pages;
- a GitHub Actions workflow that could be abused to push or publish content;
- content on the site that leaks private information.

Reports about any of these are welcome. The protections already in place are listed in the
[README](README.md#security-and-privacy).

## Supported versions

Only the version currently published at https://zxxdev.github.io is maintained.
