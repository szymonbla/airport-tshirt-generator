# PRD: T-Shirt Draw Tool

## Problem Statement

A friend group wants to organize a t-shirt exchange where each person makes a t-shirt for one other person. They are geographically remote, so they need a way to randomly assign Givers to Recipients and share each person's assignment privately — without anyone accidentally seeing someone else's result.

## Solution

A static web app with two views:

1. **Organizer view** — enter Participant names, run the Draw, get a unique Assignment Link per Participant, copy and send each link privately (e.g. via WhatsApp).
2. **Reveal view** — a Participant opens their Assignment Link and sees only their Recipient's name.

Assignments are base64-encoded in the URL, so no backend is required and non-technical users cannot trivially decode them.

## User Stories

1. As an Organizer, I want to enter a list of Participant names, so that I can define who takes part in the Draw.
2. As an Organizer, I want to add Participants one by one, so that I can build the list incrementally.
3. As an Organizer, I want to remove a Participant from the list before the Draw, so that I can correct mistakes.
4. As an Organizer, I want to see all entered Participant names before running the Draw, so that I can confirm the list is correct.
5. As an Organizer, I want to click a single "Draw" button to generate all Assignments at once, so that the process is simple.
6. As an Organizer, I want the Draw to guarantee no Participant is assigned to themselves, so that the exchange is valid.
7. As an Organizer, I want mutual pairs (A→B and B→A) to be allowed, so that I don't need to worry about additional constraints.
8. As an Organizer, I want to see a list of Assignment Links after the Draw, so that I know which link to send to which Participant.
9. As an Organizer, I want each Assignment Link to be associated with the Giver's name, so that I can send it to the right person.
10. As an Organizer, I want a one-click "Copy" button per Assignment Link, so that I can quickly paste it into a message.
11. As an Organizer, I want the Draw result to be stable after it's generated, so that refreshing the page doesn't re-shuffle.
12. As an Organizer, I want to be able to re-run the Draw and get a new Assignment set, so that I can redo it if needed.
13. As a Participant, I want to open my Assignment Link on my phone, so that I can find out my Recipient.
14. As a Participant, I want to see only my Recipient's name when I open my link, so that I don't accidentally see other people's Assignments.
15. As a Participant, I want the reveal page to feel like a fun moment, so that opening the link is enjoyable.
16. As a Participant, I want the reveal page to work without logging in, so that I don't need to create an account.
17. As a Participant, I want the reveal page to work on mobile, so that I can open it directly from a WhatsApp message.
18. As a Participant, I want to see a clear error if my link is broken or invalid, so that I know to ask the Organizer for a new one.

## Implementation Decisions

### Module: `drawEngine`
Pure function — takes an array of Participant names, returns an array of Assignments (`{ giver: string, recipient: string }`). Uses a Fisher-Yates shuffle to produce a derangement (no self-assignments). Mutual pairs are allowed. No side effects.

### Module: `linkCodec`
Two pure functions:
- `encode(assignment: Assignment): string` — base64-encodes the recipient name into a URL-safe string.
- `decode(param: string): Assignment | null` — decodes the param back to a recipient name; returns `null` on malformed input.

The encoded param is placed in the URL hash (`#`) so it is never sent to any server.

### Module: `OrganizerView`
React component. Manages:
- A controlled list of Participant name inputs (add / remove).
- "Draw" button — calls `drawEngine`, generates links via `linkCodec`, stores results in local component state.
- Results table: Giver name | Assignment Link | Copy button.

### Module: `RevealView`
React component. On mount:
- Reads the URL hash param.
- Calls `linkCodec.decode`.
- If valid: renders the Recipient's name.
- If invalid: renders an error state prompting the user to contact the Organizer.

### Routing
Two routes: `/` → OrganizerView, `/reveal` → RevealView. Client-side routing via React Router (hash or memory router to keep it static-host-compatible).

### Hosting
Static build deployed to Vercel or GitHub Pages. No backend, no database.

## Testing Decisions

Good tests verify external behavior, not implementation details. They call the public interface of a module with known inputs and assert on outputs — they do not inspect internal state or mock collaborators unless at a true system boundary.

### `drawEngine`
- Every output Assignment array is a valid derangement (no giver === recipient).
- Output covers all Participants exactly once as Givers and once as Recipients.
- Works correctly for minimum viable input (2 Participants).
- Produces different orderings across multiple runs (probabilistic).

### `linkCodec`
- `decode(encode(assignment))` round-trips cleanly.
- `decode` returns `null` for empty string, random garbage, and malformed base64.

### `RevealView`
- Renders the Recipient name when given a valid encoded URL param.
- Renders an error state when the URL param is missing or invalid.
- Does not render any other Participant's name.

No tests for OrganizerView (pure UI interaction, covered by manual testing).

## Out of Scope

- Backend / database
- Authentication or true cryptographic security of Assignment Links
- Lobby / simultaneous reveal feature (all Participants reveal at the same time)
- T-shirt design suggestions or customization
- Email / SMS delivery of links
- Internationalisation

## Further Notes

The "airport" in the project name likely refers to the event context (a trip or meetup). The tool is intentionally minimal — a one-time-use organizer tool, not a recurring platform.

The lobby feature (simultaneous reveal) is the most requested future enhancement and will require a backend with real-time capability (e.g. WebSockets or SSE).
