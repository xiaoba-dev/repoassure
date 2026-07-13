# Blocked Goal Recovery Full Lifecycle Real Campaign Validation v0.1 Design

## Purpose

Validate recovery artifacts from recovery package through closure receipt across accepted, accepted-risk, blocked, failed, incomplete, environment-blocked, boundary-violating, and tampered scenarios.

## Contract

The campaign input lists local relative artifact directories and expected outcomes. The validator reads the artifacts itself, verifies schemas, raw-byte SHA links, blocked actions, redaction boundaries, and non-execution flags, then emits a sanitized JSON/Markdown summary.

`rejected_tampered` is the only expected outcome that passes by rejecting invalid evidence. Normal scenarios fail the campaign when their chain is malformed or their actual outcome differs from expectation.

## Boundaries

Validation does not execute recovery commands, change external state, mutate target repos, publish, launch, contact customers, change pricing/spend or repository visibility, or claim commercial/hosted availability.

