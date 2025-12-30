# Security

## Threat Model (v0.1)

Gauntlet v0.1 executes **untrusted code** with a “Render-only, risk accepted”
posture:

- Runner executes in a **separate private Render service** (blast radius reduction).
- Runner uses **process-level guardrails** (timeouts, file limits, log caps,
  best-effort network disabling).

**This is not a hardened sandbox.** A determined attacker may still break out
via runtime or dependency exploits. If you are not comfortable with that risk,
do not run the runner against public untrusted submissions.

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
- DB polling uses atomic job claims to prevent double execution.
- Bounded concurrency via `WORKER_MAX_CONCURRENCY`.
- Submission rate limiting (per IP + per display name).
- Log capture capped at ~64KB per job and truncated.
- Runner receives a minimal env allowlist (no `ADMIN_TOKEN` or Render API key).

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
