# Security

Gauntlet v0.1 executes untrusted code. This is a **baseline** implementation and not a hardened sandbox.

## Threat Model

- Malicious submissions attempting to access host filesystem or secrets.
- Resource exhaustion (CPU, memory, disk).
- Network exfiltration.
- Abuse of scoring logs or environment variables.

## v0.1 Mitigations

- Execution in a temporary workspace (`RUNS_DIR`) that is deleted after scoring.
- Size limits on ZIP uploads (default 20MB).
- File count limit on ZIP extraction.
- Timeouts for install and test commands.
- Log excerpt truncation to a fixed number of lines.

## Known Gaps

- No OS-level sandboxing (namespaces, seccomp, gVisor).
- Network access is allowed during tests.
- No strict memory or CPU quotas.
- Dependency install still runs arbitrary scripts.

## v0.2 Hardening Plan

- Run submissions in a container or Firecracker VM.
- Disable outbound network egress.
- Apply cgroup CPU/memory limits.
- Read-only bind mounts for challenge tests.
- Signed artifact pipeline for trusted runners.

