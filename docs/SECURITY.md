# Security

Gauntlet v0.1 executes untrusted code. Scoring is **disabled by default** and must be
explicitly enabled with `WORKER_ENABLED=true` and `RUN_UNTRUSTED_CODE=true`.
This is a baseline sandbox, not a hardened production isolation boundary.

## Threat Model

- Malicious submissions attempting to access host filesystem or secrets.
- Resource exhaustion (CPU, memory, disk).
- Network exfiltration.
- Abuse of scoring logs or environment variables.

## v0.1 Mitigations

- Kill switch: worker exits unless `WORKER_ENABLED` and `RUN_UNTRUSTED_CODE` are true.
- Per-job Docker sandbox with `--network none`, read-only root FS, memory/pids/cpu limits.
- Temp workspace per job under `RUNS_DIR`, deleted after scoring.
- ZIP size + unzipped size + file count limits.
- Hard runtime timeout plus watchdog cancellation for stale jobs.
- Bounded concurrency via `WORKER_MAX_CONCURRENCY`.
- Submission rate limiting (per IP + per display name).
- Log excerpt truncation to a fixed number of lines.

## Known Gaps

- Docker is not a full sandbox (no custom seccomp/gVisor/Firecracker).
- Git clone happens on the host and requires outbound network access.
- In-memory rate limiting resets on deploy and does not share state across instances.
- Dependency installs still execute arbitrary scripts (inside the container).

## v0.2 Hardening Plan

- Dedicated runner host or VM (gVisor/Firecracker) with stronger isolation.
- Network egress control at the host level + allowlist for Git cloning.
- Rootless containers and tighter filesystem permissions.
- Artifact-based scoring pipeline (build once, test in sealed runner).
- Centralized rate limiting (Redis/Upstash) + per-account quotas.
