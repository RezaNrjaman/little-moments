# Little Moments - Test Report

Version: 1.2
Status: Executed (end-to-end against a live Supabase project)
Reference plan: TEST-PLAN.md

# 1. Environment

| Item | Value |
| --- | --- |
| Date | 2026-10-10 |
| Node.js | v25.2.1 |
| npm | 11.6.2 |
| Next.js | 16.4.0 (App Router, Turbopack) |
| React | 19.3.0 |
| TypeScript | strict |
| Supabase | **configured** - live project, migrations `0001` + `0002` applied; `0003` (multi-photo) pending apply |

Commands used to build and validate the code base:

```bash
npm run typecheck   # tsc --noEmit  -> 0 errors
npm run lint        # eslint        -> 0 errors, 0 warnings
npm run build       # next build    -> success
```

End-to-end runs used `npm run dev` plus a real browser session against the
live project, driving the real UI (password gate, timeline, forms, dialogs)
and checking the database and private storage bucket directly.

Configuration note: `NEXT_PUBLIC_SUPABASE_URL` must be the bare project origin
(`https://<ref>.supabase.co`, no `/rest/v1`) and `SUPABASE_SECRET_KEY` must be
the **secret** key (`sb_secret_...`), not the publishable key. The admin client
now trims a trailing slash or a copied `/rest/v1` suffix automatically.

# 2. Functional tests

| # | Test | Method | Expected | Result |
| --- | --- | --- | --- | --- |
| F1 | Password gate renders | Browser `GET /` | Gate with password field | PASS |
| F2 | Wrong password rejected | `POST /api/auth/login` wrong value | `401` + friendly message, no details | PASS |
| F3 | Empty body rejected | `POST /api/auth/login` `{}` | `400` "Please enter the password." | PASS |
| F4 | Correct password accepted | Browser UI | `200` + session cookie + redirect to `/memories` | PASS |
| F5 | Logout | Browser click "Logout" | Cookie cleared, redirected to `/` | PASS |
| F6 | Session persists across navigation | Browser navigation | Session accepted | PASS |
| F7 | Loading state | `loading.tsx` skeleton | Skeleton cards | PASS (code path) |
| F8 | Empty state | Timeline with 0 rows | "No memories yet" + Add button | PASS |
| F9a | Create memory | Form + photo upload | Row inserted, photo stored, toast, card on timeline | PASS |
| F9b | Read memory | Detail page | Photo, date, title, location, story shown | PASS |
| F9c | Update memory | Edit form | Changes persisted, detail re-rendered | PASS |
| F9d | Delete memory | Confirm dialog | Row and storage object removed, toast, empty state | PASS |
| F10 | Filter day / month / year | URL filter -> DB query | Matching card shown; non-matching -> "No memories found" | PASS |
| F11 | Pagination | 13 seeded rows | Page 1 = 12 cards, Page 2 = 1 card, links correct | PASS |
| F12 | Out-of-range page clamped | `?page=99` with 2 pages | Last page ("Page 2 of 2"), not an error | PASS |
| F13 | Invalid filter value | `?view=month&month=2024-13` | Falls back to "All", no crash | PASS |
| F14 | Create memory with multiple photos | Form + 3 photos | Cover = photo 1, 2 rows in `memory_images` | BLOCKED (needs migration `0003`) |
| F15 | Detail gallery | Memory with extra photos | Gallery renders below story | BLOCKED (needs migration `0003`) |
| F16 | Edit extras (add / remove) | Edit form | Added rows inserted, removed rows + files deleted | BLOCKED (needs migration `0003`) |
| F17 | Delete memory with extras | Confirm dialog | Row, `memory_images` rows and all files removed | BLOCKED (needs migration `0003`) |
| F18 | Scrapbook settings | `/settings` form | `scrapbook_settings` updated, header refreshed | READY (code path; live run pending) |

# 3. Security tests

| # | Test | Method | Expected | Result |
| --- | --- | --- | --- | --- |
| S1 | Private route protection | `GET /memories` without session | `307` to `/`, gate shown, **no private content** | PASS |
| S2 | Session cookie flags (dev) | `Set-Cookie` header | `HttpOnly`, `SameSite=lax`, `Max-Age` limited | PASS |
| S3 | Session cookie flags (prod) | `Set-Cookie` header | `Secure; HttpOnly; SameSite=lax` | PASS |
| S4 | No token in localStorage | Client components | Session only in HttpOnly cookie | PASS (by design) |
| S5 | Upload endpoint requires session | `POST /api/uploads/sign` without cookie | `401` | PASS |
| S6 | Image endpoint requires session | `GET /api/images/[uuid]` without cookie | `401` | PASS |
| S7 | Image endpoint rejects bad id | `GET /api/images/not-a-uuid` with session | `404` | PASS (code path) |
| S8 | Login rate limiting | 6 consecutive failed logins | `429` after the limit, `Retry-After` header | PASS |
| S9 | Rate limit resets on success | Failed attempts then correct login | Counter cleared on success | PASS |
| S10 | Origin (CSRF) check | State changing endpoints | Wrong `Origin` -> `403` | PASS (code path) |
| S11 | Server file validation | Upload a fake `.png` (text content) | Rejected with "does not look like a valid photo", object removed | PASS |
| S12 | Upload ticket binding | `createMemory` without matching ticket | Rejected: "Upload permission expired." | NOT RUN (code path only) |
| S13 | Friendly errors, no leaks | Error boundary + logs | "Oops, something went wrong" UI; no internal message in HTML | PASS |
| S14 | Secrets not exposed | Server-only admin client | Secret key never reaches the browser bundle | PASS (by design) |
| S15 | Not indexable | `<meta name="robots">` | `noindex, nofollow` | PASS |
| S16 | Extra photo endpoint requires session | `GET /api/memory-images/[id]` without cookie | `401` | PASS (code path) |
| S17 | Extra photo path is server resolved | `GET /api/memory-images/[id]` | Path read from DB, client cannot inject it | PASS (code path) |

# 4. Data / storage integrity

| # | Check | Result |
| --- | --- | --- |
| D1 | DB stores `image_path` only (never a URL) | PASS - value is `<uuid>.png` |
| D2 | Storage bucket is private | PASS - anonymous public URL fetch fails (`404`/`400`) |
| D3 | Upload is `uuid.ext` (original name never used) | PASS |
| D4 | Invalid upload leaves no orphan file | PASS - bucket clean after S11 |
| D5 | Delete removes row **and** storage object | PASS - both empty after F9d |
| D6 | Image proxy hides the signed URL | PASS - browser only ever calls `/api/images/[id]` |
| D7 | Extra photo proxy hides the signed URL | PASS (code path) - browser calls `/api/memory-images/[id]` |
| D8 | Multi-photo files cleaned on delete | Verified in code (cover + all `memory_images` paths removed) |

# 5. Responsive / UI tests

| # | Test | Method | Result |
| --- | --- | --- | --- |
| R1 | Mobile gate layout (single column, large touch targets) | Browser viewport | PASS (structure) |
| R2 | Desktop timeline centered, 3 columns | Code review (`MemoryTimeline` grid `sm:grid-cols-2 lg:grid-cols-3`) | PASS (structure) |
| R3 | Reduced motion support | `@media (prefers-reduced-motion)` | PASS (code path) |

> Visual polish (colours, polaroid rotation, stickers) follows DESIGN.md and is
> best confirmed by the project owner with real photos.

# 6. Bug found and fixed during this run

`getMemories` treated an out-of-range page as a fatal error. PostgREST answers
a `.range()` past the end with **416 "Requested range not satisfiable"**, so the
requested clamping ("show the last page") never ran and the user saw the error
boundary.

Fix (`src/features/memories/queries.ts`): count the filtered rows first,
compute the page bounds, clamp the requested page, then fetch that range. The
extra count query removes the 416 path entirely. Re-tested: `?page=99` now
renders the last page, and `?page=1` / `?page=2` still paginate correctly.

# 7. Not executed

- **S12 (upload ticket binding)**: needs a crafted Server Action call to skip
  the ticket; reviewed in code (`verifyUploadTicket` in `createMemory` /
  `updateMemory`) but not exercised end to end.
- **Multi-photo (F14-F17)**: implemented and statically validated (typecheck,
  lint, build). A live end-to-end run is blocked until migration
  `0003_memory_images.sql` is applied to the Supabase project, because the
  `memory_images` table does not exist yet.
- **Scrapbook Settings (F18)**: implemented; live run pending.

# 7.1 Changes since v1.1

- Seluruh teks UI dan pesan server diterjemahkan ke Bahasa Indonesia
  (termasuk tanggal `date-fns` locale `id`).
- Fitur multi-photo: cover tetap di `memories.image_path`, foto tambahan
  di tabel `memory_images` (maks 10 per kenangan).
- Halaman pengaturan scrapbook `/settings` + Server Action
  `updateScrapbookSettings`.
- Endpoint gambar baru `/api/memory-images/[id]` dengan proxy bersama
  (`src/lib/supabase/image-response.ts`).
- Migrasi baru `0003_memory_images.sql`.

# 8. Summary

- Static validation: **typecheck, lint, and production build all pass**.
- Full CRUD, upload, image proxy, filtering, pagination, and storage cleanup:
  **verified end to end against the live project**.
- Authentication, session handling, route protection, cookie security, rate
  limiting, file validation, and error handling: **verified**.
- Storage stays private; the database stores paths only; no secrets reach the
  client.
- One real bug (out-of-range pagination) was found and fixed.
- v1.2 adds multi-photo and the settings page; both pass static validation
  (typecheck, lint, production build). Live verification waits on migration
  `0003`.
