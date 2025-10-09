# Monitoring & Analytics Runbook (Draft)

**Last updated:** 2025-10-01

## Overview

This runbook describes how Kid-Friendly Map monitors reliability, privacy-first analytics, and production health across mobile, web, and backend services.

## Tooling Summary

| Capability          | Primary Tool                           | Backup / Notes                          |
| ------------------- | -------------------------------------- | --------------------------------------- |
| Error tracking      | Sentry (expo + backend)                | Console logs with redacted stack traces |
| Performance metrics | Expo performance API, custom monitors  | Pending Prometheus/Grafana integration  |
| Analytics           | Plausible (EU region)                  | Redshift aggregate exports (monthly)    |
| Backend health      | `/status` endpoints + heartbeat checks | Manual verification via runbooks        |

## Environment Variables

| Variable             | Description                                                |
| -------------------- | ---------------------------------------------------------- |
| `SENTRY_DSN`         | Project-specific DSN issued by Sentry                      |
| `SENTRY_ENVIRONMENT` | `development`, `staging`, or `production`                  |
| `SENTRY_RELEASE`     | Git SHA or semantic app version                            |
| `PLAUSIBLE_API_KEY`  | Server access for event forwarding                         |
| `PLAUSIBLE_SITE_ID`  | Domain/app identifier (e.g., `app.kidfriendlymap.example`) |

Store secrets in EAS environment configs and backend secret manager. Never commit DSNs or API keys to source control.

## Setup Checklist

1. Configure Sentry native modules via `@sentry/react-native` and ensure source maps upload during EAS builds.
2. Register Plausible site (EU data center) and set retention to 12 months.
3. Implement opt-in toggles in parental dashboard; default analytics to disabled until consent recorded.
4. Add heartbeat monitors for AI assistant latency, map tile delivery, and backend job queues.
5. Update CI to run monitoring unit tests (`__tests__/monitoring.test.ts`).

## Onboarding & Dashboards

- Sentry dashboards: Crash-free users, top issues, release comparisons.
- Plausible dashboards: Daily active guardians, session duration, feature adoption.
- Status page: Publish real-time uptime (private initially, on-call only).

Provide read-only access to Product, Support, and Legal for transparency.

## Alert Policies

| Alert                       | Threshold                   | Channel                   | Playbook                                         |
| --------------------------- | --------------------------- | ------------------------- | ------------------------------------------------ |
| Crash-free rate drop        | <99% over 30 min            | Pager + Slack `#alerts`   | Investigate latest release, compare stack traces |
| API latency spike           | p95 > 1.5s for 15 min       | Pager + Slack             | Check backend health endpoints, scale workers    |
| Offline tile failures       | >5% download errors in 1 hr | Slack mention Mobile lead | Inspect CDN logs, verify storage quotas          |
| Plausible opt-out anomalies | Opt-outs > opt-ins in 24 hr | Slack `#privacy`          | Review consent flow, confirm bug vs real trend   |

Escalation: If P0 unresolved after 30 min, notify CTO and Legal if user data risk present.

## Incident Response Steps

1. Triage alert severity (P0–P3) and acknowledge within 5 minutes.
2. Assign incident commander (on-call engineer) and scribe.
3. Communicate status updates in Slack `#incident-room` every 15 minutes.
4. Engage Legal/Privacy if issue involves personal data exposure.
5. Publish post-incident report within 48 hours; include remediation tasks and privacy impact review.

## Privacy Considerations

- Redact user identifiers before sending to Sentry using `beforeSend` hooks.
- Configure Plausible in cookieless mode with no local storage.
- Log consent state changes and analytics opt-in/out events for auditing.
- Retain raw logs no longer than 30 days; aggregate metrics only beyond that.

## Testing & Verification

- Run synthetic error injection weekly to confirm Sentry ingestion.
- Execute Plausible event smoke test (trigger sample events) after each release.
- Validate parental opt-out by toggling setting and confirming events cease within 5 minutes.
- Track test cases in `__tests__/monitoring.test.ts` and update when instrumentation changes.

## Change Management

- Document monitoring configuration changes in CHANGELOG.
- For new alerts, attach runbook entry and test evidence before enabling.
- Legal review required if tooling begins collecting new categories of data.

## Contacts

| Role                    | Primary        | Backup          |
| ----------------------- | -------------- | --------------- |
| On-call engineer        | @mobile-oncall | @backend-oncall |
| Privacy program manager | @privacy-pm    | @legal-liaison  |
| DevOps lead             | @devops-lead   | @ops-escalation |

Update contact list monthly. Include phone numbers in secure vault.

---

_This document is a living draft. Submit change requests via PR or `#privacy-eng` Slack channel._
