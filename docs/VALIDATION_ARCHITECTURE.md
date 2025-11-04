## Validation Architecture — Frontend (FE) & Backend (BE)

Last updated: 2025-11-02

This document describes the validation architecture used by the system (adminsite + server), the error payload contract between backend and frontend, recommended server-side constraints, and practical guidance to implement, test and operate validation safely and consistently.

## Goals
- Centralize and standardize validation behavior so client UIs can render friendly, deterministic messages.
- Prevent leakage of internal errors (SQL messages, stack traces) to clients.
- Ensure business rules enforced both at BE (authoritative) and optionally at FE (immediate UX feedback).
- Provide a stable error contract that all endpoints follow.

## Principles
- Single source of truth: the server enforces all critical rules (uniqueness, referential integrity, business constraints). FE performs light-weight checks for better UX but must trust server for correctness.
- Fail-fast, friendly: return structured validation payloads with localized messages suitable for display.
- No internal leakage: sanitize any DB or unexpected errors before sending to clients.
- Idempotent/atomic: when enforcing uniqueness, prefer DB unique constraints; validator checks are advisory and should not be relied on to prevent race conditions.

## Contracts — error payloads

The standardized response for validation failures SHOULD be HTTP 400 with JSON body shaped like:

{
  "error": "Validation failed",      // top-level short code/message (string)
  "errors": [                         // array of error items (could be empty)
    {
      "type": "field",               // 'field' | 'global' | 'constraint'
      "path": "code",                // field name (for field errors)
      "msg": "Mã phòng đã tồn tại", // user-friendly message for display
      "value": "1A01",               // optional submitted value
      "location": "body"             // optional (where it came from)
    }
  ]
}

Notes:
- `error` is a short, machine-friendly summary. FE may show it in a banner or toast but should prefer localized `msg` for field-level messages.
- `errors` is the authoritative list for per-field messages. The FE maps each `path` into its local `errors` state (e.g. `errors.code = msg`).

## Backend design (Node.js / Express / Sequelize)

1) Request validation layers
- Use express-validator for synchronous/cross-field checks and short-circuit required checks.
- For DB-backed checks (uniqueness), implement async custom validators in validator modules (e.g. `server/validators/roomValidator.js`).

2) Database constraints
- Always add DB-level constraints for strong guarantees (unique indexes, foreign keys). Example:
  - Unique index on `rooms.code` for code uniqueness.
  - If composite uniqueness is required, add a composite UNIQUE(buildings_id, floor_number, room_seq).
- Relying only on a pre-check query is racy; DB constraints prevent races.

3) Error mapping and sanitization
- Validation middleware should produce the structured payload above and return 400.
- For DB constraint violations (SequelizeUniqueConstraintError / SQL error), map to the same validation payload with friendly messages (do not return raw SQL error messages). Example mapping rule:
  - If DB error indicates duplicate key on `rooms.code`, respond with errors: [{ type:'field', path:'code', msg:'Mã phòng đã tồn tại', value:submitted }]
- Use try/catch in any async validators to avoid throwing raw DB errors into the express-validator error array (see `roomValidator` safety patterns). If a validator cannot run because of unexpected DB schema mismatch, either return a sensible default (pass) or add a controlled global error item rather than throwing.

4) Global error handler
- Centralize error-to-response mapping in Express global error handler. Examples of behaviors:
  - ValidationError (from express-validator) -> 400 with our payload.
  - SequelizeUniqueConstraintError -> 409 (or 400) with mapped validation payload.
  - Unexpected errors -> 500 with a generic message (no stack, no SQL text). Optionally log full details server-side.

5) Example BE flow for create room
- Request arrives -> route -> validators (`createRoomValidator`) -> `validateRequest` middleware checks express-validator result and returns structured 400 if failed.
- If validators pass, controller attempts to create row using Sequelize.
- If Sequelize throws unique-constraint error, controller/global handler maps it into validation payload and returns 400/409.

## Frontend design (React adminsite)

1) Local validation responsibilities
- Perform client-side checks for fast UX: required fields, numeric ranges, simple cross-field checks (e.g. capacity_optimal < capacity_max), and sensible formatting.
- Do not duplicate or replace server-side authoritative checks (e.g., uniqueness) — server is canonical.

2) Error mapping
- FE expects the server’s validation payload (see contract) and applies it to local component state as:
  - errors[field] = msg for each item where item.path == field
  - errors.general = payload.error || payload.message
- Example: `applyServerValidation(data)` implementation in `adminsite/src/pages/RoomManagement.jsx` and `EquipmentManagement.jsx` maps `data.errors` into `setErrors({ ... })`.

3) UX behavior
- Inline errors: display under each input (use input id equal to `path` to support scrolling/focus).
- General error: display a banner or small text area near the top of modal; also optionally call global toast with `error`.
- Focus/scroll: automatically scroll/focus the first field with an error to reduce friction.

4) Client-side code contract example (pseudo):

function applyServerValidation(data) {
  const next = {};
  data.errors.forEach(it => { if (it.path) next[it.path] = it.msg; });
  next.general = data.error || data.message;
  setErrors(next);
}

## Edge cases & trade-offs
- Race conditions: pre-check uniqueness in validators may pass but subsequent DB insert can fail because of race — DB unique index remains mandatory.
- Schema mismatch: if a validator expects a column (e.g. `room_seq`) that does not exist, guard the validator (check model attributes) and do not throw raw SQL errors.
- Multilingual/localization: server should return localized messages where possible, or use error keys plus translation on FE. Current project returns Vietnamese messages; standardize if i18n needed.

## Testing strategy
- Unit tests for validators (BE): test express-validator rules and custom async checks using a test DB or mocked ORM.
- Integration tests (API): assert that invalid requests return exactly the expected payload shape and messages.
- FE unit tests: assert `applyServerValidation` maps server payloads into local state correctly and that UI renders those messages.

## Migration & rollout steps (if adding DB constraints)
1. Add column (if missing) with nullable true, deploy and backfill values.
2. Add unique index concurrently (for MySQL use `ALGORITHM=INPLACE` or create a new unique constraint carefully);
3. Update validators to rely on DB constraint in addition to pre-checks.
4. Ship global error mapping for DB unique errors to user-friendly messages.

## Implementation checklist (practical steps for this repo)
- [x] Implement express-validator rules for room create/update (done: `server/validators/roomValidator.js`).
- [x] Map server validation payload in RoomManagement FE (`applyServerValidation`).
- [x] Map server validation payload in EquipmentManagement FE (done).
- [ ] Add DB unique indexes where missing (e.g. `rooms.code`), create migrations.
- [ ] Add mapping in global error handler for Sequelize unique constraint errors -> validation payload.
- [ ] Add automated tests for validator behavior and for `applyServerValidation` mapping.

## Small examples

Server returns:

HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "Validation failed",
  "errors": [
    { "type":"field", "path":"code", "msg":"Mã phòng đã tồn tại", "value":"1A01" }
  ]
}

Frontend mapping (pseudo):

setErrors({ code: 'Mã phòng đã tồn tại', general: 'Validation failed' })

And the UI will render `errors.code` under the `#code` input and `errors.general` in a banner.

## Closing / next steps
- If you want, I can:
  - prepare SQL migration(s) to add unique constraints (follow repo DB patterns),
  - implement DB-unique error to payload mapping in Express global handler,
  - add small unit tests covering new behavior.

Create date: 2025-11-02
