# Airport T-Shirt Generator

A tool for organizing a Secret Santa-style t-shirt exchange among a remote friend group.

## Glossary

**Draw** — the act of randomly assigning each Participant a Recipient. Constraints: no self-assignment. Mutual pairs (A→B and B→A) are allowed.

**Participant** — a person taking part in the exchange, both as a Giver and a Recipient.

**Giver** — a Participant who must prepare a t-shirt for their assigned Recipient.

**Recipient** — the Participant a Giver is assigned to make a t-shirt for.

**Assignment** — a single Giver→Recipient pair produced by the Draw.

**Assignment Link** — a unique URL generated for each Participant after the Draw. Opening it reveals only that Participant's Recipient. The Assignment is encoded (base64-obfuscated) in the URL — not plaintext — to prevent casual snooping by non-technical users.

**Organizer** — the person who runs the Draw, enters all Participant names, and distributes Assignment Links privately (e.g. via WhatsApp).

**Size** — a Participant's t-shirt size, one of: XS, S, M, L, XL, 2XL. Entered by the Participant on the Reveal page before seeing their Recipient. Stored server-side and shown to whoever is buying for that Participant.

**Size Notification** — an email sent to a Giver when their Recipient submits their Size. Only sent if the Giver subscribed (entered their email on the result screen) while the Recipient's size was still unknown.

## Flow

1. Organizer enters all Participant names in the app.
2. Organizer clicks "Draw" — app produces one Assignment per Participant.
3. App generates one Assignment Link per Participant.
4. Organizer copies each link and sends it privately to the correct Participant.
5. Participant opens their link → enters their Size → hits the red detonator button.
6. Participant sees their Recipient's name and Size (or a placeholder if Recipient hasn't submitted yet).
7. If placeholder: Participant enters their email on the result screen to subscribe for a Size Notification.
8. When Recipient later submits their Size, a Size Notification email is sent to subscribed Givers.

## Tech

- React + Vite + Tailwind + shadcn/ui
- Node.js + Hono backend + SQLite (stores Participant sizes and emails)
- Resend for transactional email (Size Notifications)
- Assignment encoded in URL (base64-obfuscated)
