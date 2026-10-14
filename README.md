# Airport Delay Tracker: Live FAA Delays & Stops

Live U.S. flight disruption data for travel management, corporate travel,
logistics and air freight teams. See which airports have ground delays,
ground stops or closures right now, why, and how long the delays are, from
the official FAA National Airspace System status.

## What you get

One row per airport disruption:

- The airport and the type of disruption (ground delay, ground stop, closure)
- The reason, such as weather or traffic volume
- Average and maximum delay, or the closure window and reopening time
- When the FAA last updated it

## Who this is for

- **Travel management and corporate travel teams** rebooking travellers when an airport is delayed.
- **Logistics and air freight teams** planning around airport disruptions.
- **Travel apps and alert services** showing current airport status.

## Input

```json
{
  "airportCodes": []
}
```

| Field | Type | Description |
|---|---|---|
| `airportCodes` | array of strings (optional) | Limit to specific airports by 3-letter FAA/IATA code, e.g. `["JFK", "ORD", "LAX"]`. Leave empty to return every airport currently affected nationwide. |

## Output

One record per active delay/closure entry. The exact fields depend on
the category (ground delay programs report `avgDelay`/`maxDelay`;
closures report `start`/`reopen`; ground stops report `endTime`):

```json
{
  "category": "Ground Delay Programs",
  "updateTime": "Mon Aug 17 18:53:26 2026 GMT",
  "airport": "SFO",
  "reason": "low ceilings",
  "avgDelay": "43 minutes",
  "maxDelay": "1 hour and 55 minutes"
}
```

```json
{
  "category": "Airport Closures",
  "updateTime": "Mon Aug 17 18:53:26 2026 GMT",
  "airport": "LAX",
  "reason": "!LAX 05/277 LAX AD AP CLSD TO NON SKED TRANSIENT GA ACFT ...",
  "start": "May 27 at 18:26 UTC.",
  "reopen": "May 28 at 16:00 UTC."
}
```

At any given time only a handful of airports are affected — a check
that finds none still returns no items but is billed once.

## How it works

Direct calls to the official [FAA NAS status
feed](https://nasstatus.faa.gov/api/airport-status-information) (the
same live data source behind fly.faa.gov) — no proxy, no key, no
scraping. Public U.S. government data, updated continuously by the
FAA as conditions change.

## Pricing note

Billed per **check**, not per record returned — one charge whether the
check returns 0 records or 50.
