# Airport T-Shirt Generator

A tool for organizing a Secret Santa-style t-shirt exchange among a remote friend group.

## Glossary

**Trip** — a named event (e.g. "Wakacje Chorwacja 2025") that groups a specific set of Participants for one t-shirt exchange. Participants are scoped to a Trip — the same person can appear in multiple Trips as separate records. Each Trip has exactly one active Draw at a time; re-drawing replaces the previous Assignments. Displayed as "Trip" in the Polish UI.

**Draw** — the act of randomly assigning each Participant a Recipient. Constraints: no self-assignment. Mutual pairs (A→B and B→A) are allowed.

**Participant** — a person taking part in the exchange, both as a Giver and a Recipient.

**Giver** — a Participant who must prepare a t-shirt for their assigned Recipient.

**Recipient** — the Participant a Giver is assigned to make a t-shirt for.

**Assignment** — a single Giver→Recipient pair produced by the Draw.

**Assignment Link** — a unique URL generated for each Participant after the Draw. Opening it reveals only that Participant's Recipient. The Assignment is encoded (base64-obfuscated) in the URL — not plaintext — to prevent casual snooping by non-technical users. Encodes `{ g: giver, r: recipient, w: wyjazd_id }` so the server can scope the lookup to the correct Trip.

**Organizer** — the person who creates a Trip, runs the Draw, and distributes Assignment Links privately (e.g. via WhatsApp). Organizer access is via the `/admin` path — no authentication, access by URL knowledge.

**Size** — a Participant's t-shirt size, one of: XS, S, M, L, XL, 2XL. Entered by the Participant on the Reveal page before seeing their Recipient. Stored server-side and shown to whoever is buying for that Participant.

**Size Notification** — an email sent to a Giver when their Recipient submits their Size. Only sent if the Giver subscribed (entered their email on the result screen) while the Recipient's size was still unknown.

## Flow

1. Organizer opens `/admin` — sees list of all Tripys.
2. Organizer creates a new Trip (enters name) or opens an existing one.
3. Organizer enters all Participant names and clicks "Draw" — app produces one Assignment per Participant.
4. Assignments are saved to the database (scoped to the Trip).
5. App generates one Assignment Link per Participant (encodes giver, recipient, wyjazd_id).
6. Organizer copies each link and sends it privately to the correct Participant.
7. Participant opens their link → enters their Size → hits the red detonator button.
8. Participant sees their Recipient's name and Size (or a placeholder if Recipient hasn't submitted yet).
9. If placeholder: Participant enters their email on the result screen to subscribe for a Size Notification.
10. When Recipient later submits their Size, a Size Notification email is sent to subscribed Givers.
11. Organizer can return to `/admin/wyjazd/:id` at any time to resend a lost Assignment Link.

## Language

The app UI is in **Polish**. All user-facing strings (labels, buttons, messages, email copy) must be in Polish.

## Tech

- React + Vite + Tailwind + shadcn/ui
- Node.js + Hono backend + SQLite (stores Participant sizes and emails)
- Resend for transactional email (Size Notifications)
- Assignment encoded in URL (base64-obfuscated)
- `sonner` for toast notifications (bottom-right)
