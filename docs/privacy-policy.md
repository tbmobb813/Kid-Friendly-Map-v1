# Kid-Friendly Map — Privacy Policy (Draft)

**Last updated:** 2025-10-01

> **Disclaimer:** This draft is provided for internal review only and must be vetted and approved by qualified legal counsel before publication.

## 1. Introduction

Kid-Friendly Map ("Company", "we", "our", or "us") designs navigation and discovery experiences tailored for children and their guardians. Protecting the privacy of children is central to our mission. This draft describes the personal data we collect, how we use it, and the rights available to guardians and eligible users. The policy is intended to align with the Children’s Online Privacy Protection Act (COPPA), the EU General Data Protection Regulation (GDPR), and similar child privacy frameworks.

## 2. Scope

This policy applies to:

- The Kid-Friendly Map mobile applications (iOS, Android) and web experiences.
- Optional AI Journey Companion features.
- Backend services, offline map packages, analytics dashboards, and customer support channels.

It does not cover third-party services accessed via external links. Guardians should review third-party policies independently.

## 3. Information We Collect

### 3.1 Information Provided Directly

- **Guardian Account Details:** Email address, password, two-factor authentication settings.
- **Child Profile Data:** Nickname, avatar, age range band (e.g., 6–8, 9–11), and accessibility preferences.
- **Parental Consent Records:** Verification status, consent timestamp, preferred contact method.

### 3.2 Information Collected Automatically

- **Device Information:** Device model, OS version, app version, locale, anonymized identifiers (generated per install).
- **Approximate Location:** City-level or region-level geolocation derived from guardian-approved inputs. Precise GPS coordinates are cached only locally for routing and never transmitted unless a guardian enables live tracking.
- **Usage & Interactions:** Screen views, button taps, feature opt-ins, crash logs (via Sentry), and performance metrics.
- **Offline Map Metadata:** Download timestamps, tile package identifiers, storage usage (aggregated).

### 3.3 Information Collected from Third Parties

- **Guardian Sign-In Providers:** If using OAuth (Apple, Google), we receive tokens and basic profile (name, email) as permitted.
- **Analytics Platform (Plausible):** Aggregated page views and events without cookies or persistent identifiers.

We do not knowingly collect or store persistent identifiers for children beyond what is necessary to operate the service with parental consent.

## 4. How We Use Information

- Provide navigation, route planning, and discovery features tailored for children.
- Personalize content (e.g., fun facts, achievements) within guardian-approved limits.
- Maintain safety features, including arrival alerts and accessibility settings.
- Monitor app performance, detect bugs, and improve reliability.
- Comply with legal obligations, including record-keeping for parental consent and data-subject requests.

## 5. Legal Bases for Processing (GDPR)

| Purpose                        | Legal Basis                                         |
| ------------------------------ | --------------------------------------------------- |
| Core app functionality         | Performance of a contract (Art. 6(1)(b))            |
| Parental consent records       | Compliance with legal obligations (Art. 6(1)(c))    |
| Optional analytics (Plausible) | Legitimate interests with safeguards (Art. 6(1)(f)) |
| AI companion personalization   | Guardian consent (Art. 6(1)(a))                     |

When legitimate interests are used, we conduct balancing tests to ensure the interests of children and guardians are protected.

## 6. Parental Consent & Controls

- Guardians must create an account and verify their identity before enabling child profiles.
- Consent flows provide granular toggles (location sharing, AI assistant, analytics).
- Guardians can review, update, or revoke consent at any time in the parental dashboard.
- If consent is revoked, associated child data is deactivated or deleted within 30 days unless retention is required by law.

## 7. Data Retention

| Data Category                    | Retention Period           | Notes                                                   |
| -------------------------------- | -------------------------- | ------------------------------------------------------- |
| Guardian account data            | Active account + 24 months | Purged after account closure unless legal hold          |
| Child profile settings           | Active profile + 30 days   | Deleted immediately upon guardian request               |
| Consent records                  | 5 years                    | Stored for compliance auditing                          |
| Crash logs (Sentry)              | 90 days                    | Aggregated metrics retained beyond 90 days              |
| Analytics aggregates (Plausible) | 12 months                  | No raw identifiers stored                               |
| Offline tile metadata            | Active device only         | Stored locally; wiped upon uninstall or guardian action |

## 8. Sharing & Disclosure

We do not sell personal data. We share information only with:

- **Service Providers:** Hosting (e.g., AWS), analytics (Plausible), error monitoring (Sentry) with privacy-centric configurations.
- **Legal Authorities:** When required to comply with law or protect vital interests.
- **Business Transfers:** In the event of a merger or acquisition, subject to equivalent privacy protections.

All vendors undergo data protection impact assessments (DPIA) and execute data processing agreements (DPAs).

## 9. International Data Transfers

If data is transferred outside the user’s region, we implement appropriate safeguards such as Standard Contractual Clauses (SCCs) or rely on adequacy decisions where available. EU/EEA data is stored in EU-based infrastructure whenever feasible.

## 10. Security Measures

- Encryption in transit (TLS 1.2+) and at rest (AES-256).
- Role-based access control with least-privilege principles.
- Incident response plan with 72-hour notification window for GDPR reportable breaches.
- Regular penetration testing and automated dependency scanning.

## 11. Data Subject & Guardian Rights

Guardians and eligible users may:

- Request access, correction, or deletion of child data.
- Export guardian account information in a machine-readable format.
- Object to or restrict processing of optional analytics features.
- Withdraw consent at any time without affecting the legality of prior processing.

Requests can be initiated via the in-app guardian dashboard or by contacting [privacy@kidfriendlymap.example](mailto:privacy@kidfriendlymap.example).

## 12. Children’s Privacy

We do not knowingly allow children to create accounts without verified guardian consent. Guardians are responsible for supervising child usage and managing permissions. If we discover unauthorized data collection from a child, we will delete it promptly and notify the guardian.

## 13. Changes to This Policy

We will notify guardians of significant updates via email and in-app notices at least 30 days before the effective date. Version history and a summary of changes will be maintained in this document.

## 14. Contact Us

- **Privacy inquiries:** [privacy@kidfriendlymap.example](mailto:privacy@kidfriendlymap.example)
- **Data protection officer:** [dpo@kidfriendlymap.example](mailto:dpo@kidfriendlymap.example)
- **Postal address:** Kid-Friendly Map Privacy Office, 123 Maple Lane, Suite 200, Portland, OR 97205, USA

---

_This draft is for internal collaboration. Do not distribute externally without legal approval._
