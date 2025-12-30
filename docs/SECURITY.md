# Security

Gauntlet v0.1 executes untrusted code. Scoring is **disabled by default** and must be
explicitly enabled with `WORKER_ENABLED=true` and `RUN_UNTRUSTED_CODE=true`.
This is a process-level guardrail, not a hardened production isolation boundary.

## Threat Model

- Malicious submissions attempting to access host filesystem or secrets.
- Resource exhaustion (CPU, memory, disk).
- Network exfiltration.
- Abuse of scoring logs or environment variables.

## v0.1 Mitigations

- Kill switch: runner exits unless `WORKER_ENABLED` and `RUN_UNTRUSTED_CODE` are true.
- Process-level network blocking via a preload hook.
- Temp workspace per job under `RUNS_DIR`, deleted after scoring.
- ZIP size + unzipped size + file count limits.
- Hard runtime timeout plus watchdog cancellation for stale jobs.
- Bounded concurrency via `WORKER_MAX_CONCURRENCY`.
- Submission rate limiting (per IP + per display name).
- Log capture capped at ~64KB per job and truncated.

## Known Gaps

- No VM-grade sandboxing (no gVisor/Firecracker).
- Git clone happens on the host and requires outbound network access.
- In-memory rate limiting resets on deploy and does not share state across instances.
- Dependency installs are not supported in the v0.1 runner.

## Risk Accepted (v0.1)

Gauntlet v0.1 relies on process-level guardrails and a private runner service
boundary. This is not equivalent to VM-grade isolation. Proceed accordingly.

## v0.2 Hardening Plan

- Dedicated runner host or VM (gVisor/Firecracker) with stronger isolation.
- Network egress control at the host level + allowlist for Git cloning.
- Rootless containers and tighter filesystem permissions.
- Artifact-based scoring pipeline (build once, test in sealed runner).
- Centralized rate limiting (Redis/Upstash) + per-account quotas.
