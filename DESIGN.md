# Clinic scheduling contract

This document is the source of truth for the appointment board in `/app`. The host computer timezone is not America/Chicago. Every rule below is evaluated in `America/Chicago`.

## Board

The board shows the seed visits in `/app/src/fixtures/schedule.seed.json` when browser storage is empty. Those three visits are:

- Riley Chen, Dr. Amin, Exam, 2026-01-15 09:00-09:30, scheduled
- Jordan Blake, Dr. Brooks, Consult, 2026-01-15 10:00-11:00, scheduled
- Sam Patel, Dr. Amin, Exam, 2026-01-16 08:00-08:30, cancelled

Providers are Dr. Amin (`amin`) and Dr. Brooks (`brooks`). Services are Exam (30 minutes) and Consult (60 minutes).

## Clock

Staff enter a clinic date (`YYYY-MM-DD`) and a clinic start time (`HH:MM`, 24-hour, zero-padded). Those fields are America/Chicago wall-clock values, never the host timezone.

Stored `start` and `end` are UTC instants in `toISOString()` form (`YYYY-MM-DDTHH:mm:ss.sssZ`). The instant must be the one whose America/Chicago wall time is the entered date and start time. `end` is `start` plus the service duration.

Cards print the clinic date as `YYYY-MM-DD` and the clinic interval as `HH:MM-HH:MM`. Examples that must stay stable on any host timezone:

- `2026-01-15T15:00:00.000Z` prints `2026-01-15` and `09:00-09:30`
- `2026-01-15T16:00:00.000Z` prints `2026-01-15` and `10:00-11:00`
- `2026-03-09T13:00:00.000Z` prints `2026-03-09` and `08:00-08:30` (Central Daylight Time)
- `2026-11-02T14:00:00.000Z` prints `2026-11-02` and `08:00-08:30` (Central Standard Time)

## Hours and grid

The start control lists every 30-minute mark from `08:00` through `16:30` inclusive. It does not list `07:30`, `09:15`, or `17:00`.

A visit is inside clinic hours when its start is at or after `08:00` and its end is at or before `17:00` on that same clinic date. `08:00` is allowed. A 30-minute visit that starts at `16:30` and ends at `17:00` is allowed. A 60-minute visit that starts at `16:00` and ends at `17:00` is allowed. A 60-minute visit that starts at `16:30` is not allowed, because it would end at `17:30`.

## Conflicts

Intervals are half-open: `[start, end)`. A visit that starts at the earlier visit's end does not overlap. Overlap is per provider and ignores cancelled visits. Two providers may share the same interval. The same provider may reuse a clock time on a different clinic date. A new visit that covers a shorter scheduled visit for that provider overlaps, and so does a new visit that starts during a scheduled visit.

Editing a visit compares it with other scheduled visits for that provider, not with itself. Saving an edit leaves the visit `scheduled`.

Activating Save twice for the same new visit (same patient, provider, and start, with no existing id) leaves a single scheduled visit.

Cancelling a visit sets its status to `cancelled`, removes it from the active list, and releases its interval so the same provider can book it again.

## Storage

The storage key is `clinic.schedule.v1`. The JSON value is `{ "version": 1, "nextId": <number>, "appointments": [ ... ] }`. New ids are `apt-<nextId>` and `nextId` increases by one. Seed ids stay as they are.

On startup the board loads this key when the value is valid. A stored board must survive a full remount and must not be replaced by the seed. Creating, editing, and cancelling update the stored board. Stored instants remain the UTC instants defined above.

## Filters and sort

Day filters by the America/Chicago date. An empty day means all dates. Status `Active` shows `scheduled` only. Status `Cancelled` shows `cancelled` only. Status `All` shows both. The provider filter limits the list to one provider. `All providers` shows every provider.

Sort `Start time` orders by the UTC instant, earliest first. On 2026-01-15, Riley Chen prints before Jordan Blake. Sort `Patient name` orders by name A to Z using English comparison. Jordan Blake prints before Riley Chen.

## Messages

Use these strings exactly:

- `Enter the patient name.`
- `Patient name must be 80 characters or fewer.`
- `Choose a visit date.`
- `Choose a start time.`
- `Start time must be on a 30-minute mark.`
- `Visits must start at or after 08:00 and end by 17:00 clinic time.`
- `That time overlaps another visit for this provider.`
- `Appointment saved.`
- `Appointment cancelled.`

The invalid control sets `aria-invalid` to `true` and `aria-describedby` to the id of the element that contains the message. Every control has a visible label: Patient name, Provider, Service, Date, Start time, Open times, Day, Status, Provider filter, and Sort. The visit form is named `Visit form`. The appointment list is named `Appointments`. The open-time dropdown is named `Open times`.

## Open times

`Open times` is a dropdown of the clinic start times for the selected provider, service, and date that fall inside clinic hours and do not overlap another scheduled visit for that provider. While editing, the visit being edited does not block its own start. Cancelled visits do not block a time. For Dr. Amin and Exam on 2026-01-15, `09:00` is closed and `08:00` and `09:30` are open. For Dr. Amin and Exam on 2026-01-16, `08:00` is open because Sam Patel is cancelled.

## Layout

The main element sets `data-layout` to `compact` when the viewport matches `(max-width: 700px)`, and `wide` otherwise. At 700px or narrower the visit form and the appointment list are both present. Hiding the form on a narrow viewport is not acceptable.

## Labels on each visit

Each scheduled or cancelled row is a list item whose accessible name includes the patient name. The row shows the provider name, the service name, the clinic date, the clinic interval, and the status `scheduled` or `cancelled`. Scheduled rows offer a button named `Edit <patient name>`. The form offers `Save appointment`. While a visit is loaded into the form, the form also offers `Cancel visit`. `Reset form` clears the form and does not change the board.
