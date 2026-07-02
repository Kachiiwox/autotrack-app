# AutoTrack — Administration, User Management & System Configuration
### Enterprise Architecture Extension to DESIGN.md

**Purpose:** This document extends the original AutoTrack design with everything needed to configure, maintain, and govern the system after deployment — without a developer touching code. It assumes the MVP core (Customers, Vehicles, Repair Jobs/Complaints, Work Orders, Payments, Auth/Roles) already exists, per DESIGN.md Phase 10.

---

## 1. User Management

### 1.1 Full User Lifecycle

```
Invited → Pending Activation → Active → (Suspended ⇄ Active) → Deactivated
                                              ↓
                                     Archived (soft delete) → Permanently Deleted
```

| Action | Who Can Trigger | Effect | Reversible? |
|---|---|---|---|
| **Register** | Self (rare — invite is default) or Admin | Creates account, status = Pending Activation | N/A |
| **Invite** | Super Admin, Workshop Owner, Branch Manager | Sends SMS/WhatsApp link with a one-time activation code | N/A |
| **Activate** | Invited user | Sets PIN, status → Active | N/A |
| **Deactivate** | Owner/Admin | Login blocked, data retained, still visible in reports | Yes — reactivate |
| **Suspend** | Owner/Admin | Temporary block (e.g. investigation, leave) with a reason field, auto-expiring or manual | Yes — un-suspend |
| **Soft Delete (Archive)** | Owner/Admin | Hidden from active lists, data retained, historical jobs still show their name | Yes — restore |
| **Permanent Delete** | Super Admin only | Irreversibly removes PII; historical job records keep an anonymized reference (`"Former Staff #4821"`) so audit history isn't broken | **No** |
| **Reinstate** | Owner/Admin | Archived/deactivated user → Active again, same account, same history | N/A |

**Business rule:** Permanent deletion never cascades into deleting historical job/audit records — it anonymizes the person, not the history. This directly protects the accountability requirement from Phase 4.5/4.6 of DESIGN.md ("who diagnosed/repaired/approved this") — losing an employee must never mean losing who fixed a car.

### 1.2 Credentials & Access Recovery

- **Reset Password/PIN (by Admin):** Admin-triggered reset generates a temporary PIN, flags `must_change_pin: true`, forces change on next login (same pattern already built for seeded mechanics in the MVP).
- **Forgot PIN (self-service):** User enters phone number → OTP sent via SMS/WhatsApp → on verification, set new PIN. No security questions (low literacy — a static "secret question" is easy to forget and easy to guess).
- **Change PIN:** Available anytime from a Profile screen; requires entering current PIN first.
- **Change phone number:** Requires OTP verification of the **new** number before it takes effect, and triggers a notification to the **old** number ("Your login number was changed — contact your admin if this wasn't you").
- **Change email:** Same OTP pattern, but email is optional for most roles (only meaningfully used for Owner/Admin-tier accounts that may want email reports).

### 1.3 Sessions & Multi-Device

- **Multi-device login:** Allowed by default (a mechanic may use a personal phone and a shared workshop tablet). Each session is tracked separately.
- **Session management screen** (Admin-facing): List of active sessions per user — device type, last active time, approximate location if available.
- **Force logout:** Admin can terminate any specific session, or all sessions for a user (e.g. lost phone, terminated staff).
- **Auto-expiry:** Sessions expire after a configurable inactivity window (default 30 days) — balances security against re-login friction for infrequent users.

### 1.4 Two-Factor Authentication (Optional, Owner/Admin tier only)

- Not applied to Apprentice/Mechanic/Front Desk roles — added friction with no proportional benefit for low-privilege accounts, and directly conflicts with the "low digital literacy, fast entry" design principle from DESIGN.md Phase 5.
- Available as an opt-in for **Super Administrator** and **Workshop Owner** roles specifically, since those accounts can do the most damage if compromised (financial data, permanent deletion, role changes).
- Implementation: SMS/WhatsApp OTP as a second factor, not an authenticator app (matches the phone-first, no-email-required philosophy already established).

### 1.5 Login Audit History

Every login attempt (success or failure) is logged: user, timestamp, device, IP (where available), outcome. Surfaced in the Admin's User Management screen per-user, and rolled up into the global Audit Trail (Section 9).

---

## 2. Roles & Permissions

### 2.1 Role Definitions

| Role | Core Responsibility | Typical Scope |
|---|---|---|
| **Super Administrator** | Platform-level control — only exists for multi-branch/multi-tenant deployments or the software vendor's own support access | Cross-workshop |
| **Workshop Owner** | Full control of their workshop(s); financial visibility; staff management | Single workshop (or all branches they own) |
| **Branch Manager** | Day-to-day operational control of one branch | Single branch |
| **Service Advisor** | Front desk — customer intake, complaints, quotations, communication | Single branch |
| **Senior Mechanic** | Diagnosis, repair, verification/quality inspection, apprentice supervision | Assigned jobs + team |
| **Mechanic** | Diagnosis and repair on assigned jobs | Assigned jobs only |
| **Apprentice** | Executes delegated repair tasks | Assigned tasks only, most restricted |
| **Cashier** | Payment recording, invoicing, balance tracking | Financial module only |
| **Inventory Officer** | Parts stock, retail products, purchase tracking | Inventory module only |
| **Receptionist** | Customer-facing scheduling/communication, no repair/financial access | Customers, notifications only |

### 2.2 Permissions Matrix (Representative Sample)

| Permission | Super Admin | Owner | Branch Mgr | Service Advisor | Senior Mech | Mechanic | Apprentice | Cashier | Inventory | Receptionist |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| View Dashboard (full) | ✅ | ✅ | ✅ (branch) | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ |
| Create Repair Job | ✅ | ✅ | ✅ | ✅ | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ |
| Add/Edit Complaint | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ➖ | ➖ | ➖ | ➖ |
| Diagnose Complaint | ✅ | ✅ | ✅ | ➖ | ✅ | ✅ | ➖ | ➖ | ➖ | ➖ |
| Mark Complaint Verified | ✅ | ✅ | ✅ | ➖ | ✅ | ➖ | ➖ | ➖ | ➖ | ➖ |
| Assign Work Order | ✅ | ✅ | ✅ | ✅ | ✅ | ➖ | ➖ | ➖ | ➖ | ➖ |
| Record Payment | ✅ | ✅ | ✅ | ➖ | ➖ | ➖ | ➖ | ✅ | ➖ | ➖ |
| View Financial Reports | ✅ | ✅ | ✅ (branch) | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ |
| Manage Inventory | ✅ | ✅ | ✅ | ➖ | ➖ | ➖ | ➖ | ➖ | ✅ | ➖ |
| Invite/Manage Users | ✅ | ✅ | ✅ (branch) | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ |
| Manage Roles/Permissions | ✅ | ✅ | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ |
| Permanent Delete (any entity) | ✅ | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ |
| Edit System Settings | ✅ | ✅ | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ |
| View Audit Logs | ✅ | ✅ | ✅ (branch) | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ | ➖ |

*(Full matrix covers every permission × role combination — this table shows the representative decision logic; the actual system stores this as data, not code, per 2.3 below.)*

### 2.3 Flexible RBAC — Not Hardcoded

Rather than baking "if role === X" checks throughout the app (which is what the MVP currently does, by necessity, for speed), the admin layer introduces:

- **`roles` collection:** `{ id, name, description, is_system_role (bool), workshop_id }` — `is_system_role = true` for the 10 defaults above, protecting them from accidental deletion; custom roles have `is_system_role = false`.
- **`permissions` collection:** a fixed catalog of granular permission keys (e.g. `complaint.verify`, `payment.record`, `user.invite`, `settings.edit`) — this catalog **is** code-defined (permissions correspond to real guarded actions in the app), but which roles hold which permissions is data.
- **`role_permissions` join collection:** `{ role_id, permission_key }` — this is what an Admin edits when they "create a role" or "assign a permission." No app redeploy needed.
- **`user_roles` join collection:** supports **multiple roles per user** (e.g. someone who is both Branch Manager and Senior Mechanic at a small branch) — permissions are the union of all assigned roles.

**Admin actions enabled by this structure:**
- Create/rename/clone/delete custom roles (system roles can be cloned into a custom variant, but not deleted/renamed).
- Assign/revoke individual permissions per role.
- Create custom permission keys **only** for genuinely new guarded actions added in future app updates — Admins cannot invent permissions for features that don't exist; this stays a developer-defined catalog, admin-assigned matrix.

---

## 3. Mechanics & Specialties Management

### 3.1 Mechanic Record (Extended)

Building on the MVP's minimal `Mechanic` model, the admin layer extends it:

```
mechanics {
  id, name, phone, role, workshop_id, auth_uid,
  photo_url,
  specialties: [specialty_id, ...],       // many-to-many
  employment_status: Active | On Leave | Former,
  years_experience,
  certifications: [{ name, issuer, date, doc_url }],
  hire_date,
  status: Active | Deactivated | Archived,
  performance_stats: { computed, not stored — derived from work_orders },
}
```

- **Performance statistics** (completed jobs, average completion time, quality-flag rate) are **computed on read** from existing `work_orders`/`complaints` data, not duplicated/stored — avoids sync drift between the stat and the underlying facts.
- **Current workload:** live count of assigned, unresolved work orders — this is what powers smart task-routing recommendations (DESIGN.md Phase 8).
- **Availability:** simple toggle (Available / On a Job / Off Today) — mechanic-settable or admin-settable, used to avoid assigning new work to someone already at capacity.

### 3.2 Specialty Management

- **`specialties` collection:** `{ id, name, workshop_id, active: bool }` — starts seeded with the list in your brief (Engine, Gearbox, Suspension, Steering, Brakes, Electrical, Diagnostics, AC, Body Work, Painting, Welding, Tyres, Alignment) but is fully admin-editable.
- **Add/Rename:** straightforward CRUD, requires unique name per workshop.
- **Merge duplicates:** Admin selects two specialties (e.g. "AC" and "Air Conditioning" entered separately by mistake) → merge tool re-tags every mechanic and every complaint's `required_specialty` referencing the old one to point to the surviving one, then archives the duplicate. This must be a transactional batch operation — a partial merge would silently break specialty-based routing (the core mechanism from DESIGN.md Phase 4.5).
- **Disable (not delete):** obsolete specialties are archived, not deleted — historical complaints/work orders keep their reference intact; disabled specialties simply stop appearing in new-complaint specialty pickers.

---

## 4. Customer Management (Administration Layer)

Extends the MVP Customers module with back-office controls:

- **Merge duplicate customers:** common when the same person is entered twice under slightly different name spellings or a new phone number. Admin selects the "surviving" record; all vehicles, repair jobs, payments, and marketplace listings from the merged record are re-parented to the survivor. This is a transactional operation with a preview step ("Merging will move 3 vehicles, 7 repair jobs, ₦145,000 in payment history — confirm?") before committing, since it's irreversible.
- **Archive/Restore:** soft-delete pattern consistent with Users (Section 1) — archived customers vanish from active search but their history remains intact and restorable.
- **VIP flag:** a simple boolean/tag surfaced prominently on the customer profile and in the front-desk intake flow, so a returning high-value customer is recognized and prioritized without relying on staff memory (the same root problem this whole app exists to solve).
- **Blacklist:** flags a customer as high-risk (e.g. chronic non-payment, abusive behavior) — visible to Front Desk/Owner at intake with a required-acknowledgment warning; does not block service outright (business decision, not a system decision) but ensures no one is caught by surprise.
- **Customer notes:** free-text, timestamped, attributed to whoever wrote them — visible across all future visits.

---

## 5. Vehicle Management (Administration Layer)

- **Correct VIN/plate:** editable by Admin/Branch Manager roles only (not Front Desk) — since these are legal identifiers, changes are logged with a required "reason for correction" field in the audit trail.
- **Transfer ownership:** re-parents a vehicle from one Customer record to another without losing its repair history — the exact mechanism needed for the Marketplace module's consigned-vehicle-sale flow (DESIGN.md Phase 4.7) once a sale completes.
- **Merge duplicate vehicles:** same transactional pattern as customer merging — re-parents all repair jobs/complaints history to the surviving vehicle record.
- **Archive/Restore:** for vehicles that are scrapped, sold outside the workshop's marketplace, or otherwise no longer relevant, without losing their historical repair record for reporting purposes.

---

## 6. Repair Job Administration

This section governs **corrections after the fact** — the MVP's core Repair Job/Complaint flow assumes things go right; this layer handles when they don't.

| Action | Who | Notes |
|---|---|---|
| **Edit repair request** | Service Advisor, Branch Mgr, Owner | Only while job is still Open; once diagnosis has started, edits require a logged reason |
| **Add forgotten complaint post-check-in** | Any front-line role | This is exactly the scenario from the founding incident — the system must make this trivially easy, not a special "admin" action buried in settings. It's really just "Add Another Complaint" on an already-created job, always available regardless of job status, timestamped as "added after intake" |
| **Remove incorrect complaint** | Branch Mgr, Owner | Never a hard delete — status changes to `Cancelled` with a required reason, stays visible in the job's history so "why isn't this complaint here anymore" always has an answer |
| **Reassign job/complaint** | Branch Mgr, Senior Mechanic, Owner | Full reassignment history retained (already a stated requirement in DESIGN.md 4.4) |
| **Split one job into multiple** | Branch Mgr, Owner | E.g. a job with 4 complaints where 2 need to wait for parts — split lets the 2 ready complaints proceed to payment/release independently while the other 2 remain open under a new linked job |
| **Merge jobs** | Branch Mgr, Owner | E.g. customer brought the same car in twice for related issues — merges complaints under one job; requires the same vehicle |
| **Change priority** | Service Advisor, Branch Mgr, Senior Mechanic, Owner | Simple field update, logged |
| **Extend deadline** | Branch Mgr, Senior Mechanic, Owner | Requires a reason (parts delay, complexity, customer request) — feeds into the "jobs overdue" report so extensions are visible, not hidden |
| **Reopen completed job** | Branch Mgr, Owner only | High-friction deliberately — reopening a released, paid, closed job is unusual and should require explicit justification |
| **Cancel job** | Branch Mgr, Owner | Requires a cancellation reason from a controlled list (customer declined, duplicate entry, vehicle withdrawn, other + free text) |

**Universal rule:** every action in this section writes to the immutable Audit Trail (Section 9) with before/after values — this section is, by definition, the set of actions most likely to be disputed later ("who changed this and why"), so it gets the strictest logging of anything in the system.

---

## 7. Lookup & Master Data Management

A single **Settings → Master Data** area lets Admins manage all reference/lookup data without a developer:

| Lookup Table | Examples | Admin Actions |
|---|---|---|
| Repair Categories | Engine, Electrical, Bodywork | Add, Edit, Archive, Reorder |
| Complaint Categories | Noise, Leak, Won't Start, Vibration | Add, Edit, Archive, Reorder |
| Vehicle Makes/Models | Toyota → Camry, Corolla... | Add, Edit, Archive |
| Fuel Types | Petrol, Diesel, Hybrid, Electric | Add, Edit, Disable |
| Transmission Types | Manual, Automatic, CVT | Add, Edit, Disable |
| Payment Methods | Cash, POS, Bank Transfer, Mobile Money | Add, Edit, Disable |
| Job Priorities | Low, Normal, High, Urgent | Add, Edit, Reorder |
| Job Statuses | (mostly system-defined per DESIGN.md Phase 2, but labels are editable) | Edit label only, not the underlying workflow logic |
| Branches/Locations | Main Branch, Branch 2 | Add, Edit, Archive |
| Labour Rates | Standard rate, Specialist rate, Emergency/after-hours rate | Add, Edit, Archive, version-dated (rate changes shouldn't silently rewrite historical invoices) |
| Taxes | VAT %, applicable rules | Add, Edit, Archive |
| Service Types | Routine Maintenance, Major Repair, Bodywork, Diagnostic-Only | Add, Edit, Archive |
| Notification Templates | "Job ready" message, "Approval needed" message | Add, Edit, Archive, with placeholder variables (e.g. `{customer_name}`, `{plate_number}`) |

**Design principle applied uniformly:** every lookup table supports Add/Edit/Archive/Restore/Reorder — **never hard delete** — because lookup values are referenced by historical records; deleting "Petrol" as a fuel type must not corrupt every past vehicle record that used it. Disabling only affects *future* selection, never past data.

---

## 8. System Settings

| Setting Group | Contents | Notes |
|---|---|---|
| **Workshop Profile** | Name, logo, address, phone, working hours, public holidays | Feeds receipts, invoices, and WhatsApp message signatures |
| **Regional** | Currency (₦ default), time zone | Set once at onboarding, editable by Owner/Super Admin only given downstream financial impact |
| **Document Templates** | Receipt template, Invoice numbering format (e.g. `AT-2026-0001`), Work Order numbering format | Numbering sequences must be gapless/sequential per workshop for basic accounting hygiene — enforced server-side, not just a UI suggestion |
| **Communications** | SMS provider config, WhatsApp Business API credentials, Email (SMTP) config | Credentials stored server-side only, never exposed to client bundles |
| **Backup** | Schedule (daily/weekly), retention period, manual "backup now" trigger | See Section 12 for detail |
| **Security** | Session timeout duration, 2FA requirement toggle (per role), password/PIN complexity rules, IP allowlisting (multi-branch enterprise tier only) | |

---

## 9. Audit Trail

### 9.1 Schema

```
audit_log {
  id,
  workshop_id,
  entity_type,      // e.g. "complaint", "user", "payment"
  entity_id,
  action,            // e.g. "status_changed", "deleted", "reassigned"
  actor_id,
  actor_role,        // role AT TIME of action — roles can change later, log must not
  timestamp,
  device_type,       // mobile / web
  ip_address,        // where available; not always on mobile
  previous_value,
  new_value,
  reason,            // required for sensitive actions (Section 6), optional otherwise
}
```

### 9.2 Human-Readable Rendering

The raw log entry above renders in the UI as your example:
> *"Mechanic assigned changed from John to Musa by Branch Manager on 4 July 2026 at 10:43 AM."*

This is a **presentation-layer transform**, not a separate stored string — storing only the structured fields (not a pre-written sentence) keeps the log queryable/filterable (e.g. "show all reassignments this month") while still rendering naturally for a non-technical reader.

### 9.3 Immutability & Search

- Audit log entries are **append-only** — no update or delete operation exists in the application layer or the security rules (`allow update, delete: if false`, the same pattern already used for `complaints` deletion in the MVP).
- Searchable/filterable by: entity type, actor, date range, action type, workshop/branch.
- Retention: kept indefinitely by default (storage cost is low for structured log entries — heavy media like job photos are the actual storage cost driver, and those aren't duplicated into audit logs, just referenced by URL).

---

## 10. Data Integrity

| Concern | Mechanism |
|---|---|
| **Accidental data loss** | Soft delete/archive is the default everywhere (Users, Customers, Vehicles, Complaints, Lookup Data) — permanent deletion is a separate, rarer, Super-Admin-only action |
| **Referential integrity** | Enforced at the application layer via required foreign keys (a Vehicle cannot exist without a Customer, a Complaint cannot exist without a Repair Job) — already the pattern established in the MVP schema |
| **Duplicate detection** | Phone-number uniqueness (Customers, already built); plate-number soft-warning (Vehicles, already built); extended here with a periodic "possible duplicates" admin report (fuzzy name/phone matching) surfaced for manual review, not auto-merged — auto-merging identity data is too risky to automate |
| **Validation rules** | Centralized validation schema per entity (shared between client-side form validation and server-side security rules, to avoid the two drifting apart) |
| **Required fields** | Enforced at both UI (can't submit) and database (security rules reject malformed writes) layers — defense in depth, consistent with the existing Firestore rules pattern |
| **Concurrency handling** | Firestore's native optimistic concurrency (already in use via the offline sync layer, DESIGN.md Phase 7.4) extends naturally here — last-write-wins per field, with the same conflict-visibility pattern: if two admins edit the same lookup table entry simultaneously, the second write's conflicting fields are flagged for review rather than silently overwritten |

---

## 11. Administration UI

### 11.1 Shared Patterns (apply across all admin screens)

- **Layout:** left-side navigation drawer (desktop/tablet) collapsing to a bottom-accessible menu (mobile) — Admin screens are more likely to be used on a tablet/desktop than the field-mechanic screens, so this can be slightly denser than the mobile-first MVP screens.
- **Search:** every list screen has a persistent search bar (name/phone/plate/ID depending on entity).
- **Filters:** collapsible filter panel — status, date range, role/branch where applicable.
- **Bulk actions:** checkbox-select on list rows → action bar appears (e.g. "Archive Selected," "Reassign Branch") — available on Users, Customers, Vehicles, Lookup Data.
- **Empty states:** consistent with MVP tone — friendly, action-oriented ("No roles created yet — start from a template or build your own").
- **Confirmation dialogs:** required for anything irreversible (permanent delete, merge, reopen closed job) — shows a plain-language summary of consequences before the final confirm tap, never a bare "Are you sure?".
- **Validation messages:** inline, next to the field, in plain language — not generic "Invalid input."
- **Mobile adaptation:** Admin screens are usable on mobile (since Pastor Emma himself may check things from his phone) but bulk actions and dense tables collapse into card-based single-column views below tablet width.

### 11.2 Key Screens (Highlights)

**User Management**
- Table: Name, Role(s), Branch, Status, Last Login → row-tap opens profile with tabs: Details, Roles, Sessions, Login History.
- "Invite User" opens a form: phone, name, role(s), branch → sends invite, shows Pending status until activated.

**Roles & Permissions**
- Left panel: list of roles (system roles marked with a lock icon, non-deletable).
- Right panel: permission checklist grouped by module (Repair Jobs, Payments, Inventory, etc.) with toggle switches.
- "Clone Role" button duplicates a system role as an editable custom role.

**Mechanics & Specialties**
- Grid/card view (photo-forward, since this is a people-management screen) with specialty tag chips, workload indicator, availability toggle.
- Separate "Manage Specialties" sub-screen: simple list with Add/Rename/Merge/Disable actions, showing usage count per specialty ("Electrical — used by 3 mechanics, 47 complaints").

**Customers/Vehicles Admin**
- Standard searchable table + the "possible duplicates" report as a dedicated tab/badge-notification.
- Merge flow: side-by-side comparison of the two records before confirming.

**Repair Job Administration**
- Same Job Detail screen as the MVP, with an additional "Admin Actions" expandable section (visible only to roles with permission) containing Split/Merge/Reopen/Cancel/Reassign controls, each opening its own reason-required confirmation dialog.

**Lookup Tables**
- Generic, reusable table-editor component (same UI pattern for all 14 lookup types) — Add/Edit/Archive/Reorder (drag handles), reducing this from 14 custom screens to 1 configurable component.

**System Settings**
- Tabbed layout: Profile, Regional, Documents, Communications, Backup, Security.

**Audit Logs**
- Table: Timestamp, Actor, Action, Entity, Before → After (collapsed by default, expandable).
- Filter bar: entity type, actor, date range, action type.
- Export to CSV for external record-keeping/compliance requests.

---

## 12. Best Practices (Enterprise-Grade)

| Area | Recommendation |
|---|---|
| **Security** | Principle of least privilege by default for every new role; permission catalog is developer-defined, assignment is admin-controlled (Section 2.3); credentials never in client bundles; security rules are the actual enforcement layer, UI restrictions are just UX (a lesson already learned the hard way during MVP build) |
| **Scalability** | `workshop_id` on every table (already established); the RBAC join-collection pattern (Section 2.3) scales to any number of custom roles without schema changes; lookup tables scoped per workshop so branches can have different labour rates, priorities, etc. if needed |
| **Maintainability** | Generic, reusable UI components for structurally similar screens (14 lookup tables → 1 component, Section 11.2) rather than 14 bespoke screens: one bug fix instead of fourteen |
| **Performance** | Computed stats (mechanic performance) calculated on read, not duplicated in writes — avoids write-amplification and stale-data drift; audit log queries indexed on `workshop_id + entity_type + timestamp` for fast filtered search at scale |
| **Disaster Recovery** | Scheduled automated backups (daily minimum) to a separate storage location from the live database; documented, periodically-tested restore procedure — a backup that's never been restored isn't a verified backup |
| **Backup & Restore** | Point-in-time restore capability for at least the retention window (e.g. 30 days); manual "backup now" trigger available to Owner/Super Admin before risky bulk operations (e.g. before a large merge) |
| **Compliance** | Audit trail immutability (Section 9) directly supports dispute resolution and, if ever needed, regulatory/legal record requests; customer data deletion requests (right-to-be-forgotten style) handled via the same anonymization pattern as staff permanent deletion (Section 1.1) — history preserved, PII scrubbed |
| **Logging** | Separate from the audit trail: technical application logs (errors, performance) vs business audit logs (who did what) — different retention needs, different audiences (developers vs business owners) |
| **Monitoring** | Basic uptime/error-rate dashboards from day one (already noted in DESIGN.md Phase 7.9); alert thresholds for anomalies worth an admin's attention (e.g. unusual number of failed logins, a spike in job cancellations) |

---

## Why This Layer Matters

The MVP proves the core promise — no complaint gets forgotten. This administration layer exists so that promise **keeps holding as the business grows**: as staff turn over, as mistakes get corrected, as a second branch opens, as roles get more specific than "mechanic." Every design choice here follows the same rule that shaped the MVP — prefer soft, reversible, logged actions over hard, silent, unrecoverable ones — because a workshop management system's whole job is to be a source of truth people can actually trust, especially in the moments something goes wrong.
