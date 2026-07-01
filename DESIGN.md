# AutoTrack — Workshop Management System for Pastor Emma's Garage
### A Mobile-First, Offline-First Platform for Nigerian Automobile Repair Workshops

**Prepared by:** Cross-functional product team (UX Research, Product Management, Service Design, Mobile UI/UX, Software Architecture, Systems Engineering, SMB Operations, Workflow Automation)

---

## Executive Summary

Pastor Emma's workshop loses money and trust not because the mechanics lack skill, but because **information has nowhere to live**. A customer's second complaint (stiff steering) was never lost because anyone was careless — it was lost because the only "database" in the workshop is human memory, and memory doesn't survive shift changes, multiple jobs, or a busy day.

AutoTrack exists to do one job extremely well: **make sure nothing said by a customer, decided by a mechanic, or promised by the workshop is ever forgotten** — while staying simple enough that an apprentice with basic phone literacy can use it in under 30 seconds per update, even with greasy hands, in direct sunlight, with no internet.

Everything below is designed around that single root cause.

---

## Phase 1 — User Research

### 1.1 Stakeholders

| Stakeholder | Relationship to System | Primary Concern |
|---|---|---|
| Pastor Emma (Owner/Master Mechanic) | Admin, top-level approver, does hardest jobs | Visibility, revenue, reputation, control without micromanaging |
| Senior Mechanics | Diagnose, repair, assign sub-tasks to apprentices | Clear instructions, credit for work, fast tools |
| Specialist Mechanics (Electrical, Gear/Transmission, Panel Beating, etc.) | Handle complaints requiring their specific trade skill, may work across multiple jobs in a day | Being routed only the work that matches their skill, recognition as a specialist rather than a generic "mechanic" |
| Apprentices ("the boys") | Execute delegated tasks, often attached to one specialist for skill-building | Simplicity — must not feel like "computer work" |
| Front Desk / Service Advisor (may be Pastor Emma himself initially) | Customer intake, communication, payment | Capturing every complaint, avoiding awkward "we forgot" calls |
| Customers | Drop off vehicle, await updates, pay, collect | Transparency, trust, not having to chase the workshop |
| Parts Suppliers (informal, local) | Supply parts on request | Not directly in-app initially, tracked as records |
| Consignors (customers selling a part or a whole car through the workshop) | Hand over an item for Pastor Emma to sell to another buyer/"panel taker," usually on trust | Fair tracking of what was handed over, what it sold for, and prompt payout of their share |
| Buyers ("Panel Takers") | Purchase a consigned part, car, or in-stock retail product (oils, fluids) | Trusting that what they're buying is genuine and fairly priced |

### 1.2 User Personas

**1. Pastor Emma — Owner/Master Mechanic ("The Final Authority")**
Decades of hands-on experience, trusted by the community, handles the hardest diagnostic and repair work himself. Time-poor, frequently interrupted, not deeply technical with software. Needs a dashboard that tells him *what's on fire* without making him dig.

**2. Chuks — Senior Mechanic ("The Delegator")**
Capable of independent diagnosis and repair, supervises 2–3 apprentices. Needs to assign tasks quickly, see what's been done so he doesn't redo it, and protect himself from blame when an apprentice's work fails.

**2b. Musa — Specialist Mechanic, Electrical ("The Trade Expert")**
Works across several jobs in a day, only on electrical-system complaints (wiring, starter, alternator, ECU faults). Doesn't need to see panel-beating or gear-system jobs at all — a cluttered task list that mixes trades wastes his time and risks him picking up work outside his expertise. Other specialists (gear/transmission, panel beating, AC, brakes) share this same need: a filtered view of *only* the complaints that match their trade.

**3. Ifeanyi — Apprentice ("The Doer")**
Limited formal education, comfortable with WhatsApp-level phone use, not comfortable with forms or typing. Needs big buttons, voice notes, photos, and minimal reading. Will abandon any tool that feels like punishment.

**4. Mrs. Adaeze — Repeat Customer ("The Anxious Owner")**
Owns the car that pays her family's bills. Has been burned before by forgotten complaints and vague timelines. Wants to know her car is being worked on without having to call and sound demanding.

**5. Tunde — First-Time Customer ("The Skeptic")**
Comparing this workshop to others informally. A documented, professional intake experience (vs. "just tell me your problem") builds trust immediately.

**6. Mr. Okafor — Consignor ("The Trusting Seller")**
Wants to sell an old gearbox he removed, or his entire car, and trusts Pastor Emma's network more than a random online buyer. Needs to know clearly what was listed, what offers came in, and exactly what he'll be paid once it sells — informally today, this lives only in Pastor Emma's head and has caused awkward "how much did it actually sell for" conversations.

### 1.3 Pain Points (Synthesized)

- **Memory-dependent operations** — the root cause of the drive shaft / steering incident.
- **No single source of truth** for a vehicle's status, history, or outstanding issues.
- **Verbal task assignment** — work gets reassigned, forgotten, or duplicated.
- **No accountability trail** — when something goes wrong, no one can show who did what.
- **Reactive communication** — customers call *in*; the workshop never calls *out*.
- **No visibility into bottlenecks** — Pastor Emma can't see backlog, blocked jobs, or overloaded mechanics at a glance.
- **Informal financials** — verbal quotes, no record of deposits or balances, disputes at pickup.
- **No history** — a returning customer is treated like a stranger every visit.

### 1.4 Hidden Operational Problems (Beyond the Brief)

- **No multi-complaint protection.** Single-complaint thinking ("fix the noise") is the default mental model; multi-issue jobs need a checklist structure, not a single text field.
- **No "job is actually finished" definition.** Without a quality-inspection gate, "done" means "the mechanic moved on," not "verified."
- **No protection against scope creep disputes.** Extra repairs found mid-job get done verbally without customer sign-off, causing payment disputes at pickup.
- **No apprentice growth tracking.** Pastor Emma has no record of which apprentices are ready for more responsibility — this is a retention and quality issue, not just a logging one.
- **Single point of failure.** The entire business currently depends on Pastor Emma's personal memory and presence; the system should let the workshop function correctly even when he's not on-site.

### 1.5 User Journeys (Current State, Narrative)

**Mrs. Adaeze's journey today:** Drives in → explains two problems verbally to whoever is free → no record made → drive shaft fixed → steering issue never resurfaces because nothing prompted anyone to check the list (there is no list) → she leaves, returns later, repeats the unresolved complaint from scratch → frustration, wasted trip, eroded trust.

**Ifeanyi's journey today:** Told verbally "fix the brake on that Camry" → no detail on what "fix" means specifically → does his best guess → no one checks his work against an actual list of what was wrong → senior mechanic discovers gaps only when customer complains.

These journeys are the basis for the To-Be workflow in Phase 2.

---

## Phase 2 — Workflow Analysis

### 2.1 As-Is Workflow (Current, Manual)

```
Customer arrives
   → Verbal complaint(s) shared with whoever is available
   → No structured record created
   → Informal/no inspection
   → Verbal or no cost estimate
   → No formal approval step
   → Work assigned verbally to a mechanic or apprentice
   → Repair happens (possibly only some of the complaints addressed)
   → No formal quality check
   → Verbal payment negotiation at pickup
   → Vehicle released
   → No follow-up; customer must call back if anything was missed
```

**Failure point demonstrated by the real incident:** between "verbal complaint shared" and "work assigned," the steering complaint was never converted into a trackable item, so it simply ceased to exist operationally.

### 2.2 To-Be Workflow (Digital, Optimized)

```
1. CUSTOMER ARRIVAL
   → Search customer by phone number (existing customer auto-recognized
     with full vehicle + repair history) OR create new customer in <60s

2. VEHICLE INSPECTION & COMPLAINT RECORDING
   → Select vehicle (or add new vehicle to customer profile)
   → Record EACH complaint as a SEPARATE line item (voice note, photo,
     short text) — multi-complaint jobs are structurally impossible
     to "merge and lose"
   → Each complaint gets a unique status: Open → Diagnosed → Approved
     → In Progress → Repaired → Verified

3. DIAGNOSIS
   → Mechanic attaches diagnosis notes/photos to each open complaint
     individually
   → Diagnosis timestamped and attributed to the diagnosing mechanic

4. COST ESTIMATION
   → Estimate generated per complaint (labour + parts)
   → Consolidated quotation auto-built from line items

5. CUSTOMER APPROVAL
   → Quotation sent via WhatsApp/SMS
   → Customer approves all, approves partial, or declines per line item
   → Declined items are recorded (not deleted) — protects workshop from
     "why didn't you fix X" disputes later

6. WORK ASSIGNMENT
   → System suggests mechanic(s) by matching each complaint's trade tag
     (Electrical, Gear/Transmission, Panel Beating, AC, Brakes, General)
     to mechanics carrying that specialty — front desk/senior mechanic
     confirms or overrides
   → A single complaint requiring multiple trades (e.g. panel beating
     then re-wiring) generates one work order per specialist, in sequence
   → Assignment is visible to assignee on their own task list —
     no verbal-only handoff
   → Priority and target completion time set

7. REPAIR
   → Mechanic updates status per complaint as work proceeds
   → Photos/notes optional but encouraged at key steps
   → System tracks parts used (workshop-supplied or customer-supplied)

8. QUALITY INSPECTION
   → ALL complaints must reach "Repaired" before job can move to
     "Ready for Inspection" — system blocks premature closure
   → Senior mechanic/Pastor Emma performs final check, marks each
     complaint "Verified" or sends back with notes

9. PAYMENT
   → Final invoice auto-calculated from approved line items + any
     additions (which require the same approval step as #5)
   → Deposit, balance, and full payment history tracked per job

10. VEHICLE RELEASE
   → Release only permitted after: all complaints Verified AND
     payment status acceptable (configurable — e.g. balance allowed
     for trusted customers)
   → Digital handover note generated (what was fixed, by whom, warranty
     terms if any)

11. AFTER-SERVICE FOLLOW-UP
   → Automated check-in message after X days ("How is the car running?")
   → Warranty period tracked against repaired components
   → Maintenance reminders scheduled based on repair type/vehicle data
```

**Key structural fix:** complaints are first-class records, not sentences inside a note. A job cannot be closed while any complaint is still open. This single rule eliminates the incident described in the brief.

---

## Phase 3 — Information Architecture

```
AutoTrack
│
├── Dashboard            (role-aware home screen)
├── Customers            (profiles, search, history — incl. consignors/buyers)
├── Vehicles             (linked to customers, full repair history)
├── Repair Jobs          (the core entity — one per visit)
│    └── Complaints      (sub-entity — one per issue, the critical fix)
├── Work Orders          (assigned tasks derived from approved complaints,
│                          routed by mechanic specialty)
├── Mechanics            (team directory, specialty tags, workload, performance)
├── Inventory            (repair parts stock + retail products for counter sale)
├── Marketplace          (consignment listings: parts & vehicles sold on
│                          behalf of customers to other buyers)
├── Payments             (estimates, invoices, deposits, balances, retail
│                          sales, consignment payouts)
├── Reports              (operational + financial reporting)
├── Notifications        (customer + internal messaging log)
└── Settings             (roles, permissions, specialty tags, business
                           profile, commission rates, sync)
```

**Core entity relationships:**

```
Customer (1) ── owns ──> (many) Vehicle
Vehicle (1) ── has ──> (many) Repair Job (one per visit/intake)
Repair Job (1) ── contains ──> (many) Complaint   ← THE CRITICAL FIX
Complaint (1) ── generates ──> (many) Work Order ── assigned to ──>
                                  Mechanic (matched by specialty tag)
Repair Job (1) ── has ──> (1) Quotation/Invoice ── has ──> (many) Payment
Mechanic (many) ── carries ──> (many) Specialty Tag
Product (1) ── sold via ──> (many) Retail Sale (independent of Repair Job)
Customer (1) ── consigns ──> (many) Marketplace Listing ── sold to ──> Buyer
```

Making **Complaint** a distinct, trackable entity — rather than a sentence in a notes field — is the single most important architectural decision in this entire system. It is what makes forgetting a complaint structurally difficult instead of merely "frowned upon."

---

## Phase 4 — Feature Specification (Per Module)

### 4.1 Customers
- **Purpose:** Single source of truth for who has used the workshop and their full history.
- **Features:** Search by phone/name, profile with all vehicles owned, full repair timeline, notes (e.g. "prefers WhatsApp," "always pays balance same week").
- **Business rules:** Phone number is the unique identifier; duplicate detection on similar names/numbers.
- **Edge cases:** Shared family vehicles with multiple drivers; customer without a phone (walk-in, rare) — allow name-only with manual flag.
- **Permissions:** All roles can view; only front desk/admin can edit core profile.

### 4.2 Vehicles
- **Purpose:** Track each vehicle independently of its owner for accurate history even if ownership changes.
- **Features:** Plate number, make/model/year, VIN (optional), photo, full repair history, mileage log, warranty-active components.
- **Business rules:** Plate number unique within workshop; one vehicle can have ownership reassigned without losing history.
- **Validation:** Plate number format check (soft warning, not hard block — informal plates exist).
- **Dependencies:** Linked to Customers and Repair Jobs.

### 4.3 Repair Jobs & Complaints (Core Module)
- **Purpose:** Capture every visit and, critically, every individual complaint as a separately tracked item.
- **Features:** Multi-complaint intake (voice, text, photo per complaint), status per complaint, diagnosis log, approval log, assignment log.
- **Business rules:** A Repair Job cannot move to "Ready for Release" while any Complaint is not "Verified" or explicitly "Declined by customer."
- **Validation:** At least one complaint required to create a job.
- **Edge cases:** Complaint discovered mid-repair (not part of original intake) → must go through the same approval flow as new complaints, time-stamped as "found during repair."
- **Permissions:** Front desk creates; mechanics update assigned complaints; only senior mechanic/owner can mark "Verified."

### 4.4 Work Orders
- **Purpose:** Translate approved complaints into assigned, trackable tasks.
- **Features:** Assignee, priority, target time, status, linked complaint(s).
- **Business rules:** Auto-generated from approved complaints; cannot exist without a parent complaint.
- **Edge cases:** Reassignment mid-job (e.g. apprentice leaves early) — full handoff history retained, not overwritten.

### 4.5 Mechanics
- **Purpose:** Team directory, workload visibility, performance and accountability record — including each mechanic's **trade specialty** so work routes to the right hands automatically.
- **Features:** One or more specialty tags per mechanic (e.g. Electrical, Gear/Transmission, Panel Beating, AC, Brakes, General); active task count; completed jobs; average completion time; quality-flag history (jobs sent back at inspection); apprentice-to-specialist attachment (which apprentice is learning under which specialist).
- **Business rules:** A complaint tagged with a trade (e.g. "electrical fault") can only be assigned to a mechanic carrying that specialty tag, or to a general/senior mechanic who can self-override; specialists see a filtered task list containing only complaints matching their tag(s) — they are not shown the full job board.
- **Edge cases:** A complaint may need more than one specialty in sequence (e.g. panel beating then electrical re-wiring on the same accident-damaged panel) — the system must support multiple work orders against a single complaint, each routed to a different specialist, with the complaint only marked "Repaired" once all linked work orders are done.
- **Permissions:** Mechanics see their own stats; Pastor Emma/admin sees all and can reassign across specialties.

### 4.6 Inventory
Inventory is split into two distinct flows that share the same stock table but behave differently:

**(a) Repair Parts** — items consumed during a job.
- **Purpose:** Track parts — workshop-stocked, purchased-for-job, and customer-supplied.
- **Features:** Stock count, low-stock alert, cost per part, linkage to specific repair job, "customer-supplied" flag (no cost, but liability note).
- **Business rules:** Customer-supplied parts are logged for accountability ("we are not liable for parts you provided") even though not charged.
- **Edge cases:** Part ordered but workshop closes before it arrives → job status becomes "Awaiting Parts," visible in reporting.

**(b) Retail Products** — items sold over the counter on the spot, not tied to a repair job (e.g. gear oil, power steering fluid, engine oil, coolant).
- **Purpose:** Let Pastor Emma sell on-hand consumables to anyone — a customer mid-repair, or a walk-in buying nothing else — as a standalone, fast transaction.
- **Features:** Quick-sale screen (product, quantity, price, instant receipt); stock count shared with the same inventory pool used for repairs (selling a bottle of gear oil at the counter reduces the same stock a mechanic would draw from for a job); low-stock alerts; optionally attach a counter sale to a customer profile if they're recognized, or treat as anonymous walk-in sale if not.
- **Business rules:** A retail sale does not require a Repair Job to exist — it is its own lightweight transaction type, recorded directly into Payments/Reports as "Product Sale" revenue, separate from "Labour" and "Repair Parts" revenue so Pastor Emma can see which line is actually profitable.
- **Edge cases:** Product low/out of stock at point of sale → system blocks the sale rather than letting stock go negative.

### 4.7 Marketplace (Consignment Sales of Parts & Vehicles)
- **Purpose:** Give structure to the informal brokerage Pastor Emma already does — car owners asking him to sell a used part or an entire vehicle to another buyer ("panel taker") — so nothing depends on memory or trust alone, and payouts are clear.
- **Features:** Create a Listing (item type: Part or Vehicle; description; photos; asking price; consignor identity, pulled from Customers if they already exist); status per listing (Listed → Offer Received → Sold → Paid Out → Closed); offer log (who offered what, when); sold price vs. asking price; workshop's commission/fee (flat or percentage, configurable); consignor payout amount and payout status.
- **Business rules:** A listing always belongs to a Consignor (existing or new customer record) — it is never anonymous, so there is always a clear answer to "whose part/car is this." Commission terms are recorded on the listing at creation, before any offer comes in, to avoid later disputes about "how much Pastor Emma is taking." A listing cannot be marked "Sold" without recording the buyer (existing customer, new contact, or anonymous walk-in with at least a phone number) and the agreed price.
- **Validation:** Payout to consignor cannot be marked complete until sale price and commission are both recorded.
- **Edge cases:** Item sells for less than asking price after negotiation — requires the same kind of explicit confirmation from the consignor as a repair-cost change requires from a customer, so no one is surprised by the payout amount; vehicle sold "as is" with no warranty — listing should carry a flag distinguishing this from a workshop-repaired vehicle sale, to keep liability clear.
- **Dependencies:** Linked to Customers (for both consignor and buyer); separate from Repair Jobs (a car being sold is not necessarily a car being repaired, though the two can be linked if a consigned car was also serviced there first).
- **Permissions:** Only Pastor Emma/admin can create or close listings and confirm payouts, given the financial trust involved; mechanics can flag "this part is available" from a job (e.g. a removed-but-working alternator) which creates a draft listing for the owner to approve.

### 4.8 Payments
- **Purpose:** Full financial trail per job — estimate through final receipt — plus retail product sales and consignment payouts.
- **Features:** Per-complaint cost lines, consolidated quotation, deposit recording, balance tracking, payment method log, printable/shareable receipt; revenue tagged by type (Labour, Repair Parts, Retail Product Sale, Consignment Commission).
- **Business rules:** Any cost added after initial approval requires a new customer approval event before it can be invoiced.
- **Validation:** Final invoice total must reconcile against sum of approved line items + verified additions.

### 4.9 Notifications
- **Purpose:** Outbound and inbound communication trail, replacing "customer keeps calling for updates."
- **Features:** Status-change triggers (e.g. "Diagnosis complete — view estimate," "Car ready for pickup"), WhatsApp/SMS delivery, internal mechanic-to-mechanic notes, consignor notifications ("offer received," "your item sold," "payout ready").
- **Business rules:** Key milestones (estimate ready, approval needed, car ready, listing sold) auto-suggest a message; front desk confirms send (not fully automatic, to preserve a human touch and avoid wrong-context messages).

### 4.10 Reports
- **Purpose:** Give Pastor Emma operational visibility without him having to ask anyone.
- **Features:** Vehicles currently in workshop, overdue jobs, jobs awaiting parts, jobs awaiting customer approval, daily completed jobs, revenue by type (labour/parts/retail/commission), most common repairs, mechanic productivity by specialty, average turnaround time, active marketplace listings and pending payouts.
- **Business rules:** All reports filterable by date range, mechanic, and specialty; exportable for offline review.

### 4.11 Settings
- **Purpose:** Configure roles, permissions, business identity, and sync behavior.
- **Features:** Role management (Owner/Senior Mechanic/Specialist/Apprentice/Front Desk), specialty/trade tag management, business profile (name, logo, contact for receipts), default consignment commission rate, language (English now, local-language-ready), sync/backup status indicator.

---

## Phase 5 — Mobile UX Principles

Designed for **Android phones, used outdoors, by people who do not want to "do computer work."**

- **Big, thumb-friendly touch targets** — minimum 48dp, primary actions even larger.
- **Minimal typing.** Default to: tap-to-select, voice notes, photo capture, pre-set quick-tags ("noise," "leak," "won't start") that can be combined with a short voice note instead of full typing.
- **High-contrast, sunlight-readable UI.** Avoid light-gray-on-white; favor solid color status chips over subtle shading.
- **Offline-first.** Every core action (record complaint, update status, assign task) must work with zero signal and sync automatically when connectivity returns. The mechanic should never see "no internet, try again."
- **Status over data entry.** Mechanics interact mostly through large tap-to-update status buttons ("Mark Diagnosed," "Mark Repaired") rather than forms.
- **Role-simplified views.** An apprentice's home screen shows only *their* assigned tasks — not the full system — to avoid overwhelm.
- **Graceful degradation for low literacy.** Icons paired with short words, not icon-only or paragraph-only; voice notes reduce reliance on reading/writing entirely.
- **English now, local-language-ready.** All UI strings externalized for future Pidgin/Hausa/Yoruba/Igbo translation without rebuilding screens.

---

## Phase 6 — UI Design (Key Screens)

> Following **Material Design 3** — dynamic color, elevated cards, rounded corners, clear state layers.

### 6.1 Dashboard (Role: Owner)
- **Layout:** Top app bar (business name + sync status icon) → scrollable card stack.
- **Components:** "Today at a Glance" card (vehicles in shop, jobs overdue, jobs awaiting approval); horizontally scrollable mechanic workload chips; revenue snapshot card; quick-action FAB ("+ New Job").
- **Status indicators:** Color-coded chips — green (on track), amber (awaiting parts/approval), red (overdue).
- **Empty state:** "No active jobs — tap + to start one" with a friendly illustration.
- **Loading state:** Skeleton cards, not spinners, to feel fast.
- **Error state:** "Showing last synced data — will update when back online," never a blocking error.

### 6.2 New Job / Complaint Intake (Role: Front Desk)
- **Layout:** Step 1 — search/select customer (phone-number-first search with auto-suggest); Step 2 — select/add vehicle; Step 3 — complaint capture screen.
- **Complaint capture component:** Repeatable card — each tap on "+ Add Another Complaint" creates a new card with: quick-tag chips, voice-note button (large, central), optional photo, optional short text.
- **Why this matters:** This screen is the direct fix for the brief's core incident — every complaint becomes its own card, impossible to silently merge or drop.
- **Buttons:** "Save & Continue" (primary, full-width); "Add Another Complaint" (secondary, always visible until intake is finished).

### 6.3 Job Detail Screen (All Roles, Permission-Filtered)
- **Layout:** Vehicle header (photo, plate, customer name) → vertical list of complaint cards, each showing its own status chip and assigned mechanic.
- **Components:** Tap any complaint card to expand into diagnosis/approval/repair timeline for that complaint only.
- **Status indicators:** Per-complaint chips (Open/Diagnosed/Approved/In Progress/Repaired/Verified) — never a single status for the whole job, reinforcing that each issue is tracked independently.
- **Navigation:** Sticky bottom bar — "Request Approval," "Mark Ready for Inspection" (disabled/grayed until all complaints are Verified or Declined).

### 6.4 Mechanic's Task List (Role: Mechanic/Apprentice)
- **Layout:** Simple vertical list, "My Tasks Today," sorted by priority.
- **Components:** Each task = large card with vehicle plate, one-line complaint summary, big "Start," "Mark Repaired" buttons.
- **Empty state:** "No tasks assigned yet — check with your supervisor" (friendly, not blank).

### 6.5 Quotation/Approval Screen (Role: Front Desk, shared view sent to Customer)
- **Layout:** Itemized list (one row per complaint: description, labour, parts, subtotal) → total at bottom → approve/decline-per-item toggle.
- **Components:** "Send via WhatsApp" primary button; approval status badge per line once customer responds.

### 6.6 Reports Screen (Role: Owner)
- **Layout:** Filter bar (date range, mechanic) → list of report cards, each expandable into a simple chart or table.
- **Components:** Bar chart for "Most Common Repairs," line chart for "Average Turnaround Time," simple count cards for the rest.

### 6.7 Quick Sale Screen (Role: Front Desk/Owner — Retail Products)
- **Layout:** Grid of large product tiles (gear oil, power steering fluid, engine oil, coolant, etc.) with stock count badge on each tile.
- **Components:** Tap product → quantity stepper → "Sell" button → instant receipt (shareable via WhatsApp or print); optional "attach to customer" toggle if buyer is recognized.
- **Status indicators:** Tile turns gray with "Out of Stock" label when stock hits zero — sale blocked at the UI level, not just the backend.
- **Empty state:** "No products yet — add your first item in Settings."

### 6.8 Marketplace Listing Screen (Role: Owner)
- **Layout:** List of listings as cards (photo thumbnail, item name, asking price, status chip) → tap to open detail.
- **Components in detail view:** Consignor info, photos, offer log (timestamped list of offers received), "Mark Sold" button (requires entering buyer + final price before it activates), payout summary (sale price − commission = payout amount) with "Mark Paid Out" action.
- **Status indicators:** Chips — Listed (blue), Offer Received (amber), Sold/Awaiting Payout (orange), Paid Out (green).
- **Empty state:** "No items listed — tap + to list a part or vehicle for a customer."

---

## Phase 7 — System Design

### 7.1 Authentication & Roles
- Phone-number-based login with PIN (low literacy friendly, no email required).
- Roles: **Owner/Admin**, **Senior Mechanic**, **Apprentice**, **Front Desk**.
- Permission matrix enforced at API layer, not just UI (defense in depth).

### 7.2 Database Schema (Core Tables, Simplified)

```
customers(id, name, phone, notes, created_at)
vehicles(id, customer_id, plate, make, model, year, vin, photo_url)
repair_jobs(id, vehicle_id, status, created_at, closed_at)
complaints(id, repair_job_id, description, voice_note_url, photo_url,
           status, required_specialty, created_by, created_at)
diagnoses(id, complaint_id, mechanic_id, notes, photo_url, created_at)
estimates(id, complaint_id, labour_cost, parts_cost, approved_status,
          approved_at)
work_orders(id, complaint_id, assigned_to, specialty, priority,
            target_time, status, sequence_order)
specialties(id, name)                         -- Electrical, Gear/Transmission,
                                                  Panel Beating, AC, Brakes, General
mechanic_specialties(id, user_id, specialty_id)  -- many-to-many
parts(id, name, stock_qty, unit_cost, item_type[repair_part/retail_product])
parts_used(id, work_order_id, part_id, source[workshop/customer], qty)
retail_sales(id, product_id, customer_id NULLABLE, qty, sale_price,
             sold_by, created_at)              -- counter sales, no job required
marketplace_listings(id, item_type[part/vehicle], description, photo_url,
                      consignor_customer_id, asking_price, commission_type,
                      commission_value, status, created_at)
marketplace_offers(id, listing_id, buyer_customer_id NULLABLE, buyer_phone,
                    offer_amount, created_at)
marketplace_sales(id, listing_id, final_price, commission_amount,
                   payout_amount, payout_status, sold_at)
payments(id, repair_job_id NULLABLE, retail_sale_id NULLABLE,
         marketplace_sale_id NULLABLE, amount, method,
         type[deposit/balance/full/retail/payout], recorded_by, created_at)
notifications(id, repair_job_id NULLABLE, listing_id NULLABLE, channel,
              message, sent_at)
audit_log(id, entity_type, entity_id, action, actor_id, timestamp)
users(id, name, phone, pin_hash, role)
```

Note that `payments` now carries three nullable foreign keys (repair job, retail sale, marketplace sale) rather than three separate payment tables — this keeps "all money that moved through the workshop" queryable from one place for reporting, while still tracing each payment back to exactly one source.

### 7.3 API Structure
- RESTful resource-based endpoints (`/customers`, `/vehicles`, `/repair-jobs/{id}/complaints`, etc.).
- Mutating endpoints require idempotency keys (critical for offline sync — see below — to prevent duplicate records on retry).

### 7.4 Offline Storage & Synchronization
- Local on-device database (e.g. SQLite) mirrors the schema above.
- All writes happen locally first, queued for sync.
- Sync engine uses **last-write-wins per field with conflict logging**, not whole-record overwrite, so two mechanics updating different complaints on the same job never clobber each other.
- Conflicts that can't auto-resolve (e.g. two people marking the same complaint differently) are flagged for the senior mechanic/owner to resolve — visible, not silently dropped.
- Visible sync status indicator in the UI at all times ("Synced," "3 changes pending," "Syncing now").

### 7.5 Notifications Delivery
- WhatsApp Business API (or SMS fallback where WhatsApp isn't available) for customer-facing messages.
- Internal notifications (task assigned, complaint flagged) delivered as in-app push when online, queued otherwise.

### 7.6 Audit Logs
- Every state change (complaint status, assignment, payment, approval) writes an immutable audit_log entry: who, what, when.
- This single table answers every "who diagnosed/repaired/approved/inspected" accountability requirement from the brief.

### 7.7 Backup & Security
- Automatic encrypted local backup on-device; scheduled cloud backup when connectivity available (future phase).
- Role-based field-level access (e.g. apprentices cannot view financials).
- PIN lockout after repeated failed attempts; session timeout on shared devices.

### 7.8 Future Cloud Deployment
- Architecture designed so the local-first sync engine can point at a cloud backend (e.g. a managed Postgres + object storage for photos/voice notes) without a schema rewrite — local SQLite schema and cloud schema are kept structurally identical from day one.

### 7.9 Scalability Architecture

The system must scale along **four independent axes**, and each one is designed for from day one even though it isn't all built on day one — retrofitting scalability later (especially multi-tenancy and data isolation) is far more expensive than designing for it upfront.

**Axis 1 — More devices in one workshop** (already covered in 7.4): the offline-first, queued-sync model already supports many phones hitting one workshop's data concurrently. The field-level conflict resolution (not whole-record overwrite) is what prevents this from breaking as headcount grows.

**Axis 2 — More workshops (multi-branch / multi-tenant)**
- Every table from Phase 7.2 gains a `workshop_id` column. This single change is the difference between "one workshop's app" and "a platform many workshops can run on."
- Data is logically isolated per `workshop_id` at the query layer (every API call is scoped to the authenticated user's workshop) and, for paying multi-branch customers, can later be physically isolated (separate database/schema per large tenant) without changing the application code.
- Pastor Emma's own expansion (a second location) becomes just another `workshop_id` he has visibility across, rather than a second app.

**Axis 3 — More data volume (jobs, photos, voice notes, history)**
- Relational data (jobs, complaints, payments) stays in Postgres with indexes on the fields actually queried at scale: `workshop_id`, `status`, `created_at`, `vehicle_id`.
- Heavy media (photos, voice notes) never lives in the database — it goes straight to object storage (e.g. S3-compatible) with only the URL stored relationally. This keeps the database small and fast no matter how many years of job photos accumulate.
- Historical data (closed jobs older than e.g. 18 months) can be moved to cheaper "cold" storage/read-only archive tables without affecting day-to-day performance, while remaining searchable from Reports.
- Database read replicas handle reporting/analytics queries separately from the live transactional writes mechanics are making, so a busy "generate monthly revenue report" query never slows down someone trying to mark a complaint as repaired.

**Axis 4 — More concurrent users (as the platform grows beyond one operator)**
- Stateless API servers behind a load balancer — any server can handle any request, so capacity is added by adding servers, not by redesigning the app.
- A message queue (e.g. for sync processing, notification delivery, report generation) decouples slow work from user-facing requests, so a spike in WhatsApp notifications never makes the app feel slow for a mechanic updating a task.
- Rate limiting and idempotency keys (already required for offline sync, Phase 7.3) double as protection against accidental request storms as usage grows.
- Observability built in from the start: structured logs, error tracking, and basic uptime/performance dashboards — so problems are caught from monitoring, not from Pastor Emma calling to say the app is slow.

**What this buys, concretely:** the same codebase that runs Pastor Emma's single workshop today can, without a rewrite, run as the backend for hundreds of independent workshops later (the roadmap's Phase E), each with their own mechanics, inventory, and customers, fully isolated from one another, while Pastor Emma's own multi-branch view (if he expands) is just a cross-`workshop_id` query for an owner who has access to more than one.

---

## Phase 8 — Smart (AI) Features — Only the Ones That Earn Their Place

| Feature | Why it's worth building | Priority |
|---|---|---|
| **Voice-to-text complaint capture** | Removes typing entirely for low-literacy users; the voice note itself is also kept as a permanent record (text is a convenience layer, not a replacement). | High |
| **Automatic extraction of distinct complaints from a single conversation** | Directly solves the brief's root incident — if a customer rambles about two problems in one breath, the system should propose splitting them into two complaint cards for confirmation. | High |
| **Reminder system for unresolved/stalled complaints** | Surfaces anything sitting in "Open" or "Diagnosed" too long without progressing. | High |
| **Intelligent task prioritization** | Suggests ordering based on promised pickup time, parts availability, and mechanic load — owner can override. | Medium |
| **Estimated completion time prediction** | Based on historical turnaround for similar repair types — sets realistic customer expectations instead of guesses. | Medium |
| **Automatic job summaries** | Generates a plain-language handover note at release ("what was wrong, what was done, by whom") from the structured data — saves front desk from writing it manually. | Medium |
| **Repair history recommendations** | Flags relevant past issues on a returning vehicle ("last steering complaint was 8 months ago — may be related"). | Medium |
| **Predictive maintenance reminders** | Mileage/time-based nudges (oil change, brake check) — low cost, high goodwill. | Low-Medium |
| **WhatsApp integration for updates** | Already the dominant channel in Nigeria; meets customers where they are rather than asking them to adopt a new app. | High |
| **OCR for handwritten notes/receipts** | Useful for digitizing legacy paper records during onboarding, lower ongoing value. | Low |
| **Barcode/QR for vehicles and work orders** | Speeds up lookup at busy times (scan plate tag instead of searching) — nice-to-have once volume grows. | Low-Medium |

**Deliberately excluded for now:** AI-assisted diagnosis (mechanical diagnosis), AI price-setting, and chatbot customer service — these touch trust-sensitive, liability-sensitive territory and belong in a later, carefully validated phase (see Roadmap), not the MVP.

---

## Phase 9 — Future Roadmap

**Phase A (MVP, 0–3 months):** Single workshop, single device or shared tablet, offline-first core (Customers, Vehicles, Repair Jobs, Complaints, Work Orders, basic Payments, basic Reports), WhatsApp notifications.

**Phase B (3–6 months):** Multi-device sync for the same workshop (each mechanic with their own phone), Inventory module, full financial reporting, customer approval flow via WhatsApp.

**Phase C (6–12 months):** Technician mobile app refinements based on real usage, Owner dashboard analytics, digital inspection checklists, warranty management module.

**Phase D (12–18 months):** Customer-facing mobile app/portal (track your own car's status), online booking, accounting integration (basic export to common Nigerian SMB accounting tools).

**Phase E (18+ months):** Multi-branch support (if Pastor Emma expands), fleet management for commercial customers, parts supplier integration/ordering, AI-assisted diagnostics (only after the data set from Phases A–D is large and trustworthy enough to support it responsibly).

---

---

## Phase 10 — Next Steps (Implementation Plan)

This turns the design into an actionable build sequence. The guiding rule: **build the smallest version that already prevents the founding incident (forgotten complaints), get Pastor Emma using it for real, then expand outward.**

### Step 1 — Validate with Pastor Emma before writing code (Week 1)
- Walk him through the Phase 6 screens (paper sketches or a simple clickable prototype, not real software yet) for: New Job/Complaint Intake, Mechanic's Task List, Dashboard.
- Confirm with him and 2–3 of his mechanics: does the complaint-per-card model match how they actually think about a job? Adjust before building — this is the cheapest point to change anything.
- Get a real device inventory: how many Android phones are actually available, what condition, what connectivity is realistic at the workshop.

### Step 2 — Build the MVP core (Weeks 2–8)
Build only what's needed to stop complaints from being forgotten — resist the urge to build Marketplace, Retail, or Reports yet:
1. Customers + Vehicles (search, create, history view)
2. Repair Jobs + Complaints (the multi-complaint intake screen — this is the single highest-value screen in the whole system)
3. Work Orders + basic Mechanic task list (no specialty routing yet — simple assignment is fine for v1)
4. Offline-first local storage + sync (must be solid before anything else, since this is what makes the app usable in the actual workshop environment)
5. Basic Payments (record amount, method, balance — full quotation/approval flow can come in v2)

**Suggested stack** (battle-tested for offline-first mobile + small backend, easy to staff in Nigeria): React Native (or Flutter) for the mobile app with a local SQLite store; Node.js/Express or similar for the API; Postgres for the cloud database; S3-compatible object storage for photos/voice notes; WhatsApp Business API (or Twilio for SMS fallback) for notifications.

### Step 3 — Pilot with real jobs, real customers (Weeks 9–12)
- Run it alongside the existing paper/verbal process for 2–4 weeks, not as a replacement yet — reduces risk if something doesn't fit real usage.
- Track one number above all others: **did any complaint get fully forgotten this month?** This is the metric the entire system was designed to fix; it should be the first thing measured.
- Collect friction points directly from Ifeanyi-type users (apprentices), not just from Pastor Emma — they're the ones doing the most data entry.

### Step 4 — Expand based on real usage, in this order (Months 4–6)
1. Mechanic specialties + routing (once there's enough job volume to make manual assignment annoying)
2. Inventory — Repair Parts (once parts-waiting becomes a visibly common bottleneck in the pilot data)
3. Customer approval/quotation flow via WhatsApp (once front desk is comfortable with the core app)
4. Reports (revenue, turnaround time, overdue jobs) — these become valuable once there's a few months of real data to report on
5. Retail Products quick-sale screen
6. Marketplace/Consignment module (lowest urgency — lowest transaction frequency of all modules)

### Step 5 — Add the `workshop_id` scalability layer (Month 6+, before any second workshop)
- Even if Pastor Emma never opens a second branch, this is the point to add multi-tenant scoping if there's any intention of eventually offering AutoTrack to other workshops — it is far cheaper to add this before a second real workshop's data exists than to retrofit it afterward.

### Step 6 — Decide on growth path (Month 6–12 checkpoint)
At this point there's enough real usage to make an informed decision rather than guessing:
- **Stay single-workshop:** keep refining based on Pastor Emma's actual operations (warranty tracking, predictive maintenance reminders, customer-facing tracking link).
- **Go multi-workshop:** if the `workshop_id` layer is in place, onboarding a second, unrelated workshop becomes a sales/onboarding problem rather than an engineering one — this is the fork toward the Phase 9 roadmap's later phases (multi-branch, platform play).

### Immediate next action
Before any of the above, the single most useful next step is **Step 1**: sit with Pastor Emma and two mechanics and walk through the Complaint Intake screen concept using nothing but paper or a simple clickable mockup. Everything else in this plan depends on confirming that one screen actually matches how the workshop thinks about a job.

---

## Why This Design Solves the Founding Problem

Every design decision above traces back to one fix: **a complaint is a row in a table, not a sentence someone has to remember.** Once that's true, a job literally cannot be closed while a complaint is still open, a mechanic cannot "forget" a task because it lives on their own task list, and Pastor Emma cannot lose visibility because the dashboard surfaces stalled items automatically. Everything else in this document — personas, workflow, screens, schema, AI features, roadmap — exists to make that one structural guarantee usable by people who have never used workshop software before.
