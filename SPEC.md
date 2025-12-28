Project Spec: Gauntlet

Challenge ID: GAUNTLET-0001
Title: Build the Arena
Difficulty: Expert
Category: Systems / Full-Stack / Product Engineering
Theme: Vibe Coding vs Professional Development
Status: Canonical

Overview

Build Gauntlet: a web platform that hosts competitive coding challenges, scores submissions, and publishes leaderboards.

This project is intentionally self-referential.
The first challenge is to build the system that hosts the challenges.

Participants may use any tools they want, including AI, frameworks, templates, and code generators. The goal is not purity - it is shipping a working, auditable, reproducible system under real constraints.

Objective

Create a production-grade v0.1 of Gauntlet that allows:

Publishing coding challenges with formal specifications

Accepting participant submissions (repo or archive)

Automatically scoring correctness and performance

Displaying transparent leaderboards

Documenting the system at a professional engineering standard

This project defines the bar for all future challenges.

Functional Requirements
Core Platform

The system MUST:

Display a list of challenges

Display detailed challenge specifications

Accept submissions for a challenge:

Public GitHub repository or

ZIP archive upload

Capture submission metadata:

Display name

Method used (honor system)

Self-reported completion time

Queue submissions for scoring

Execute official tests against submissions

Persist results and logs

Display a leaderboard per challenge

Scoring & Evaluation

Each submission MUST produce:

Correctness score

% of tests passed

Runtime metric

Time to execute the official test suite

Status

Queued -> Running -> Complete / Failed

Leaderboards MUST rank submissions by:

Highest correctness

Lowest runtime

Deterministic tie-breaker (documented)

Self-reported completion time and method used are displayed but not ranked.

Non-Functional Requirements
Reproducibility

A fresh clone of the repo must be runnable with documented setup steps.

Official tests must be deterministic.

Submissions must be scorable in isolation.

Auditability

Submissions must link to source code (repo or archive).

Logs from scoring must be retained (truncated if necessary).

Leaderboard rankings must be explainable.

Security (v0.1 baseline)

Submissions must run with:

Time limits

Size limits

No access to platform secrets

The system must clearly document current security limitations.

Documentation Requirements

A professional-grade solution MUST include documentation covering:

System architecture

Data model

API surface

Scoring pipeline

Local development setup

Operational considerations

Security tradeoffs and future hardening

Documentation quality is part of the challenge.

Allowed Tools

Anything.

Including (but not limited to):

AI coding assistants

Frameworks and templates

Generators and boilerplates

Cloud services or local tooling

This is not a test of restraint - it is a test of outcomes.

Disallowed Practices

Faking leaderboard results

Hardcoding outputs to known test cases

Submitting non-functional or non-runnable code

Omitting documentation to hide complexity

Evaluation Philosophy

Gauntlet does not attempt to answer:

"What is the correct way to code?"

Instead, it measures:

Can you ship?

Can others run it?

Does it work?

Can it be explained?

Different methods are expected to produce different strengths and weaknesses - those differences are the point.

Completion Criteria

The challenge is considered complete when:

The platform is live (locally or hosted)

At least one challenge is published

Submissions can be scored automatically

A leaderboard is visible

Documentation exists at a professional standard

Meta

This challenge intentionally creates the infrastructure required to judge all future challenges.

If you cannot build the arena, you cannot complain about the game.
