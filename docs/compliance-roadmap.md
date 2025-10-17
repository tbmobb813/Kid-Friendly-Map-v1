# Compliance & Privacy Roadmap

_Last updated: 2025-10-01_

## Objectives

- Achieve COPPA and GDPR alignment ahead of external beta launch.
- Deliver auditable policies and internal controls for handling child-directed data.
- Establish ongoing monitoring to keep legal, engineering, and product teams in sync.

## Timeline Overview

| Week | Focus                  | Key Deliverables                                     | Leads                       |
| ---- | ---------------------- | ---------------------------------------------------- | --------------------------- |
| 1    | Legal alignment        | Counsel engagement letter, kickoff agenda            | Product Lead, Legal Liaison |
| 2    | Policy drafting        | Privacy Policy v0.9, Terms of Service v0.8           | Legal Writer                |
| 3    | Operational controls   | Data-handling checklist v1.0, DPIA updates           | Privacy Program Manager     |
| 4    | Monitoring readiness   | Sentry config, Plausible rollout, monitoring runbook | Engineering & DevOps        |
| 5-6  | Offline tiles spike    | Technical decision (Native vs WebView), spike report | Mobile Lead                 |
| 7-8  | Offline implementation | MVP offline experience, QA sign-off                  | Mobile Lead, QA             |

## Workstream Details

### 1. Legal Counsel Engagement

- **Tasks**
  - Assemble product brief (data flows, parental consent UX, retention defaults).
  - Shortlist 3 specialist firms; collect scope & budget (<$12k target).
  - Schedule kickoff workshop (60 min) covering COPPA nuances, cross-border transfers, breach response.
- **Dependencies**: Updated DPIA draft, data inventory spreadsheet.
- **Outputs**: Signed engagement, action list of required product changes, meeting notes.

### 2. Privacy Policy Drafting

- **Tasks**
  - Start from counsel template; tailor kid-facing disclosures, guardian contact channels, analytics vendor list.
  - Capture data minimization rationale for location, AI assistant transcripts, offline caches.
  - Run internal review (Engineering check for accuracy; Marketing check for tone) before legal sign-off.
- **Outputs**: `docs/privacy-policy.md` draft, revision log, translation plan (ES/FR next).

### 3. Terms of Service

- **Tasks**
  - Define acceptable use, guardianship responsibilities, arbitration locale, licensing for map/AI assets.
  - Align with app store policy and include COPPA-compliant consent language.
  - Add change-management clause for AI feature updates.
- **Outputs**: `docs/terms-of-service.md` draft, version control with semantic versioning (v0.8 now).

### 4. Data-Handling Controls

- **Tasks**
  - Build actionable checklist (collection, storage, retention, access, deletion) tied to release cycle.
  - Map each data element to lawful basis and retention window.
  - Integrate checklist into QA exit criteria and CI gates (manual for now).
- **Outputs**: `docs/data-handling-checklist.md`, Jira template for "Privacy Review" stories.

### 5. Monitoring & Analytics

- **Tasks**
  - Finalize Sentry wiring (Expo + backend) with sanitized context.
  - Deploy Plausible (EU region) with event catalog; expose opt-out in parental controls.
  - Publish `docs/monitoring-runbook.md` covering alerts, dashboards, on-call rotation.
- **Quality Gates**: Crash-free users > 99%; analytics retention <= 12 months; privacy toggle unit tests.

### 6. Offline Map Tiles

- **Tasks**
  - Week 5 spike: compare Native SDK vs Enhanced WebView caching vs hybrid approach.
  - Score options (func coverage, bundle size, privacy, maintenance) and pick.
  - Weeks 7-8: implement MVP offline UX, with encryption and guardian-managed download quotas.
- **Outputs**: Decision doc, implementation tickets, QA scripts for airplane mode testing.

## RACI Snapshot

| Task                     | Responsible  | Accountable     | Consulted               | Informed   |
| ------------------------ | ------------ | --------------- | ----------------------- | ---------- |
| Legal counsel engagement | Product Lead | Head of Product | Legal, Data Eng         | Exec Team  |
| Privacy policy draft     | Legal Writer | General Counsel | Engineering, Marketing  | Support    |
| Terms of Service         | Legal Writer | General Counsel | Product, Trust & Safety | Support    |
| Data checklist           | Privacy PM   | CTO             | Legal, DevOps           | Entire org |
| Sentry/Plausible rollout | Mobile Lead  | CTO             | DevOps, Privacy PM      | Exec Team  |
| Offline tiles            | Mobile Lead  | CTO             | Product, Legal          | Exec Team  |

## Risk Register

| Risk                                    | Impact            | Likelihood | Mitigation                                            |
| --------------------------------------- | ----------------- | ---------- | ----------------------------------------------------- |
| Counsel onboarding delayed              | Launch slip       | Medium     | Pre-book intro calls; prepare detailed brief          |
| Policy drafts outdated by feature churn | Compliance gaps   | Medium     | Change log + fortnightly sync                         |
| Analytics vendor stores PII             | Regulatory breach | Low        | Vendor DPIA, contractual clauses, anonymization tests |
| Offline tiles exceed storage budgets    | App uninstalls    | Medium     | Quotas + compression + parental controls              |

## Next Steps

1. Create tracking tickets for Week 1 deliverables.
2. Prepare legal briefing pack by 2025-10-03.
3. Schedule monitoring architecture review on 2025-10-04.
4. Draft privacy policy & ToS skeletons and circulate internally by Week 2 end.
