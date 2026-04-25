# Control-plane action registry — `@experimental`

> **Stability: experimental.** This module ships in `@agentage/core` but has no production consumer yet. Public types (`ActionManifest`, `InvokeEvent`, `ActionErrorCode`, registry methods) may change between minor versions until a host-UI client (CLI daemon route, dashboard panel, desktop IPC, MCP `tools/call` adapter) lands and exercises the surface end-to-end.

## Why it's experimental

Shipped in #105 (2026-04-17). Tests cover registry mechanics — versioning, idempotency, capability checks, cancellation, deprecation — and the three reference actions in isolation, but:

- No host integration yet (`cli/daemon` does not register or dispatch through it).
- No contract test against a transport adapter (REST/WS/IPC/MCP).
- No dashboard surface — exposing it to a real UI would freeze the schema before it has been validated by use.

Per `work/tasks/feature-stabilization.md`, this module sits in the **NOT TESTED** tier for v1.0. The plan is to either wire one host-UI consumer before the v1.0 cut or hide the export behind a build-time flag.

## What you can rely on

- The factory builders (`action()`, `createRegistry()`) and the reference action factories will continue to exist and accept the documented inputs.
- The error union is closed (`ActionErrorCode`); new codes will only be added, not removed.

## What may change

- Manifest shape, scope semantics, capability matching rules.
- `InvokeEvent` discriminator names and payload fields.
- Idempotency key composition.
- Whether reference actions remain in `@agentage/core` at all (they may move to a separate `@agentage/control-actions` package once a host owns them).

## When this stops being experimental

A host-UI consumer ships, exercises the registry across at least one real transport, and we have a behavioral test that drives `accepted → progress* → result` end-to-end. At that point this README is removed and the JSDoc tags drop.
