# Trip-scoped participants and stored assignments (Wyjazd)

## Context

Originally participants were stored globally (name as PRIMARY KEY). Assignment Links encoded only `{ g, r }` — no event context. This broke when the same person could join multiple exchanges, and made it impossible for the Organizer to return to a previous draw and resend lost links.

## Decision

Introduce **Trip** as the top-level grouping entity. Participants and Assignments are scoped to a Trip.

- New DB tables: `wyjazdys`, and `assignments` (giver_name, recipient_name, wyjazd_id).
- `participants` table gains a `wyjazd_id` foreign key; name is no longer a global PK.
- Assignment Links now encode `{ g, r, w: wyjazd_id }` — breaking change to the link format.
- Existing data (test-only) is dropped; no migration.
- Organizer access via `/admin` path — no authentication token, consistent with the existing URL-knowledge access model.
- Each Trip has exactly one active Draw; re-drawing replaces all Assignments.

## Consequences

- Old Assignment Links stop working (accepted — only test data existed).
- Organizer can return to `/admin/wyjazd/:id` and resend any Assignment Link.
- Server endpoints (`/api/size`, `/api/size/:name`, `/api/notify`) must accept and scope by `wyjazd_id`.
