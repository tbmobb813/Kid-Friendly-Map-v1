# Data Handling Checklist (Draft)

**Last updated:** 2025-10-01

> **Use this checklist during feature design, pre-release reviews, and quarterly privacy audits. Tag owners in each row and attach evidence links.**

## 1. Data Inventory & Mapping

| Item                                | Description                                             | Owner       | Status |
| ----------------------------------- | ------------------------------------------------------- | ----------- | ------ |
| Data flow diagram updated           | Covers mobile, web, backend, analytics, offline tiles   | Privacy PM  | ☐      |
| Data classification applied         | Label each element (Public, Internal, Sensitive, Child) | Engineering | ☐      |
| Lawful basis documented             | Contract, consent, legitimate interest, etc.            | Legal       | ☐      |
| Record of processing updated (RoPA) | Add new vendors or subprocessors                        | Legal       | ☐      |

## 2. Collection Controls

| Item                         | Description                                            | Owner       | Status |
| ---------------------------- | ------------------------------------------------------ | ----------- | ------ |
| Parental consent UX reviewed | Includes clear toggles, disclosures, audit trail       | Product     | ☐      |
| Minimum data captured        | Avoid unnecessary fields; confirm optional vs required | Engineering | ☐      |
| Age gating validated         | Blocks self-serve child sign-up attempts               | QA          | ☐      |
| In-app copy approved         | Aligned with privacy policy and ToS draft              | Legal       | ☐      |

## 3. Storage & Security

| Item                         | Description                                            | Owner       | Status |
| ---------------------------- | ------------------------------------------------------ | ----------- | ------ |
| Encryption verified          | TLS in transit, AES-256 at rest, key rotation schedule | DevOps      | ☐      |
| Access controls reviewed     | Role-based permissions, least privilege enforced       | Security    | ☐      |
| Audit logs enabled           | Access to guardian/child data traceable                | DevOps      | ☐      |
| Offline cache policy applied | Tile packages encrypted, quota enforced                | Mobile Lead | ☐      |

## 4. Retention & Deletion

| Item                           | Description                                      | Owner          | Status |
| ------------------------------ | ------------------------------------------------ | -------------- | ------ |
| Retention schedule documented  | Matches privacy policy table                     | Privacy PM     | ☐      |
| Auto-deletion jobs operational | Verify cron/Lambda success + alerts              | DevOps         | ☐      |
| Manual deletion tested         | Guardian request processed end-to-end within SLA | Support        | ☐      |
| Backups sanitized              | Ensure child data removed from expired backups   | Infrastructure | ☐      |

## 5. Vendor Management

| Item                         | Description                                        | Owner       | Status |
| ---------------------------- | -------------------------------------------------- | ----------- | ------ |
| DPIA for new vendors         | Complete assessments for Sentry, Plausible, others | Legal       | ☐      |
| DPA/SCC executed             | Signed agreements stored in contract repo          | Legal       | ☐      |
| Telemetry opt-out documented | Sentry & analytics respect disable flags           | Engineering | ☐      |
| Vendor breach notifications  | Contacts verified and on record                    | Privacy PM  | ☐      |

## 6. Data Subject Requests (DSR)

| Item                              | Description                           | Owner   | Status |
| --------------------------------- | ------------------------------------- | ------- | ------ |
| DSR process documented            | Step-by-step SOP published            | Support | ☐      |
| Response SLA tracked              | <30 days for GDPR, <45 days for COPPA | Support | ☐      |
| Identity verification flow tested | Prevents unauthorized disclosure      | Support | ☐      |
| Appeals/escalation path defined   | Legal escalation guidelines approved  | Legal   | ☐      |

## 7. Incident Response

| Item                        | Description                                  | Owner      | Status |
| --------------------------- | -------------------------------------------- | ---------- | ------ |
| Incident runbook updated    | Includes privacy breach timeline & templates | Security   | ☐      |
| On-call roster confirmed    | Contact list current for engineering & legal | DevOps     | ☐      |
| Tabletop exercise conducted | Annual COPPA/GDPR breach simulation complete | Privacy PM | ☐      |
| Notification drafts ready   | Email + in-app copy prepared in advance      | Marketing  | ☐      |

## 8. Documentation & Sign-Off

- Attach evidence (screenshots, Jira tickets, logs) for completed items.
- Capture exceptions or deferrals in the risk register with mitigation owners.
- Final review requires signatures from Legal, Privacy PM, and Engineering lead before release.
