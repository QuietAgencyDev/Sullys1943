# Digital Waiver System

## Purpose

Completely replace paper forms with **versioned, signed, stored, auditable** documents — including minor consent and future template types.

---

## Requirements Coverage

| Requirement | Approach |
|-------------|----------|
| Multiple templates | Template library per org |
| Version history | Immutable versions; new version → re-sign required |
| Digital signatures | Draw + typed name + consent checkbox |
| Date/time stamp | Server-side authoritative timestamp + timezone |
| PDF generation | Server render (e.g., PDFKit/Puppeteer) on sign |
| Cloud storage | Encrypted object storage (S3-compatible) |
| Emergency contacts | Structured fields on profile + snapshot on signature packet |
| Medical information | Structured + free text; **sensitive** flag; minimized access |
| Minor consent | Parent/guardian signature required; relationship attested |
| Parent signatures | Multi-signer support |
| Competition waivers | Separate template type linked to events |
| Photography consent | Standalone or section; granular revoke |
| Privacy consent | PIPEDA/GDPR notice acceptance |
| Staff acknowledgement | HR policy templates |
| Insurance forms | Template type + file attach |
| Future templates | Generic `DocumentTemplate` engine |

---

## Template Engine

```
DocumentTemplate
  id, org_id, type, name, locale
DocumentTemplateVersion
  id, template_id, version, status (draft|active|retired)
  body (rich structured blocks), required_fields schema
  validity_days nullable, re_sign_on_change bool
DocumentRequirement
  ties product / program / event → template(s)
SignaturePacket
  subject_user_id, signer_user_id, version_id, status
Signature
  method, signature_blob_or_vector, typed_name, ip, user_agent, signed_at
SignedDocument
  pdf_storage_key, sha256, metadata snapshot
```

### Body Blocks

- Markdown/HTML legal text (sanitized)
- Checkboxes (required)
- Initial fields
- Data fields (emergency contacts, medical)
- Display-only profile snapshot

---

## Signing Flows

### Adult
1. Present active version
2. Complete required fields
3. Sign
4. Generate PDF → store → mark valid until expiry

### Minor
1. Parent authenticates
2. Child selected
3. Relationship attestation
4. Medical + emergency
5. Parent signature (and teen acknowledgement if age ≥ threshold)
6. Packet links child as subject, parent as signer

### Staff
1. On hire / annual
2. Policy acknowledgement
3. Stored in staff file (RBAC restricted)

---

## Validity & Gates

- Check-in and membership activation call `ComplianceService.assertDocuments(user, context)`
- States: `missing | expired | superseded | valid`
- Grace period configurable (default 0 for liability waiver)

---

## Security & Privacy

- PDFs encrypted at rest; signed URLs short-lived
- Medical fields: separate column encryption / restricted roles (coach sees flags like "asthma" only if policy allows — default: front desk + assigned coach limited view)
- Immutable audit: who viewed document
- Retention schedule per legal counsel
- Right to access: export packet; erasure: legal hold exceptions for liability docs

---

## Operational Considerations

- Lawyer reviews every active template before publish
- Bilingual templates (EN/FR) for Canadian readiness
- Kiosk mode for walk-in tablet signing (large UI)
- Unable to train without signature — culture change training for staff

---

## Missing Adjacent Docs to Include

- Code of conduct
- Concussion awareness acknowledgement
- Travel/team trip permission
- Media release for fight night broadcasts
